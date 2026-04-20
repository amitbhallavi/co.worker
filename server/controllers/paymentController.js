// ===== FILE: server/controllers/paymentController.js =====

import Razorpay from "razorpay"
import crypto from "crypto"
import asyncHandler from "express-async-handler"
import Payment from "../models/paymentModel.js"
import Wallet from "../models/walletModel.js"
import Project from "../models/projectModel.js"
import User from "../models/userModel.js"

// ── Platform fee logic ─────────────────────────────────────────────────────────
const calcFee = (amount) => {
    if (amount < 5000) return 11
    if (amount < 15000) return 19
    if (amount < 30000) return 21
    return 24
}

// ── Razorpay instance ──────────────────────────────────────────────────────────
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// ── Ensure wallet exists ───────────────────────────────────────────────────────
const ensureWallet = async (userId) => {
    let w = await Wallet.findOne({ user: userId })
    if (!w) w = await Wallet.create({ user: userId })
    return w
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CREATE RAZORPAY ORDER
// POST /api/payment/create-order
// Body: { projectId, amount }  ← amount in ₹
// ─────────────────────────────────────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
    const { projectId } = req.body
    const clientId = req.user._id

    if (!projectId) {
        res.status(400); throw new Error("projectId is required")
    }

    const project = await Project.findById(projectId)
        .populate("selectedBid")
        .populate({ path: "freelancer", populate: { path: "user", select: "-password" } })
    if (!project) { res.status(404); throw new Error("Project not found") }

    // ✅ Security: only project owner (client) can pay
    if (String(project.user) !== String(clientId)) {
        res.status(403); throw new Error("Only the project owner can make payment")
    }

    // ✅ Validate accepted bid exists
    const bidAmount = project.selectedBid?.amount
    const amount = Number(project.finalAmount ?? bidAmount)
    if (!project.selectedBid || !amount || Number.isNaN(amount) || amount <= 0) {
        res.status(409); throw new Error("No accepted bid found")
    }

    // Prevent double payment
    const existing = await Payment.findOne({
        project: projectId,
        status: { $in: ["escrow", "released"] },
    })
    if (existing) { res.status(409); throw new Error("Project already paid") }

    const fee = calcFee(Number(amount))
    const freelancerAmt = Number(amount) - fee

    // Razorpay expects paise → ₹ × 100
    const order = await razorpay.orders.create({
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: { projectId: String(projectId), clientId: String(clientId) },
    })

    const payment = await Payment.create({
        project: projectId,
        client: clientId,
        // Payment.freelancer references User, not Freelancer
        freelancer: project.freelancer?.user?._id || null,
        razorpayOrderId: order.id,
        totalAmount: Number(amount),
        platformFee: fee,
        freelancerAmount: freelancerAmt,
        status: "pending",
    })

    res.status(201).json({
        orderId: order.id,
        amount: order.amount,       // paise
        currency: order.currency,
        paymentId: payment._id,
        keyId: process.env.RAZORPAY_KEY_ID,
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. VERIFY PAYMENT + MOVE TO ESCROW
// POST /api/payment/verify
// Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId }
// ─────────────────────────────────────────────────────────────────────────────
export const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body

    // Signature verification
    const body = razorpayOrderId + "|" + razorpayPaymentId
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex")

    if (expected !== razorpaySignature) {
        res.status(400); throw new Error("Invalid payment signature")
    }

    const payment = await Payment.findById(paymentId)
    if (!payment) { res.status(404); throw new Error("Payment record not found") }

    if (payment.status !== "pending") {
        res.status(409); throw new Error("Payment already processed")
    }

    // Move to ESCROW
    payment.razorpayPaymentId = razorpayPaymentId
    payment.razorpaySignature = razorpaySignature
    payment.status = "escrow"
    await payment.save()

    // Update project status
    const updatedProject = await Project.findByIdAndUpdate(payment.project, { status: "in-progress" }, { new: true })
        .populate("user", "-password")
        .populate({ path: "freelancer", populate: { path: "user", select: "-password" } })

    // ✅ Now the project is officially assigned (payment complete) → emit to freelancer in real-time
    const freelancerUserId = updatedProject?.freelancer?.user?._id
    if (global.io && freelancerUserId) {
        global.io.to(`user_${freelancerUserId}`).emit("projectAssigned", {
            _id: updatedProject._id,
            title: updatedProject.title,
            client: updatedProject.user,
            status: updatedProject.status,
            budget: updatedProject.budget,
            message: `Project "${updatedProject.title}" assigned to you!`,
        })
    }

    res.status(200).json({ success: true, message: "Payment verified — in escrow", payment })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. RELEASE ESCROW → FREELANCER PENDING BALANCE
// POST /api/payment/release/:projectId
// Called when client marks project complete
// ─────────────────────────────────────────────────────────────────────────────
export const releaseEscrow = asyncHandler(async (req, res) => {
    const { projectId } = req.params
    const clientId = req.user._id

    const payment = await Payment.findOne({ project: projectId, status: "escrow" })
    if (!payment) { res.status(404); throw new Error("No escrow payment found for this project") }

    // Only the client who paid can release
    if (payment.client.toString() !== clientId.toString()) {
        res.status(403); throw new Error("Only the client can release payment")
    }

    // Move money to freelancer's pendingBalance
    if (payment.freelancer) {
        const wallet = await ensureWallet(payment.freelancer)
        wallet.pendingBalance += payment.freelancerAmount
        wallet.transactions.push({
            type: "credit",
            amount: payment.freelancerAmount,
            description: "Escrow released — pending 24hr clearance",
            reference: String(payment._id),
            status: "pending",
        })
        await wallet.save()
    }

    payment.status = "released"
    payment.releasedAt = new Date()
    payment.completedAt = new Date()
    await payment.save()

    // Update project
    await Project.findByIdAndUpdate(projectId, { status: "completed" })

    res.status(200).json({ success: true, message: "Payment released to freelancer wallet (pending 24hr)", payment })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. CRON: CLEAR PENDING → WITHDRAWABLE (run daily)
// POST /api/payment/cron/clear-pending   (call from cron or admin)
// ─────────────────────────────────────────────────────────────────────────────
export const clearPendingBalances = asyncHandler(async (req, res) => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hr ago

    const wallets = await Wallet.find({ pendingBalance: { $gt: 0 } })
    let cleared = 0

    for (const wallet of wallets) {
        const pendingTxns = wallet.transactions.filter(
            (t) => t.status === "pending" && t.type === "credit" && new Date(t.createdAt) < cutoff
        )
        const amount = pendingTxns.reduce((s, t) => s + t.amount, 0)
        if (amount > 0) {
            wallet.balance += amount
            wallet.pendingBalance -= amount
            pendingTxns.forEach((t) => (t.status = "completed"))
            await wallet.save()
            cleared++
        }
    }

    res.status(200).json({ success: true, message: `Cleared pending for ${cleared} wallets` })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. GET PAYMENT STATUS for a project
// GET /api/payment/project/:projectId
// ─────────────────────────────────────────────────────────────────────────────
export const getProjectPayment = asyncHandler(async (req, res) => {
    const payment = await Payment.findOne({ project: req.params.projectId })
        .populate("client", "name email")
        .populate("freelancer", "name email")

    if (!payment) { res.status(404); throw new Error("No payment found") }
    res.status(200).json(payment)
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. GET ALL PAYMENTS (admin)
// GET /api/payment/all
// ─────────────────────────────────────────────────────────────────────────────
export const getAllPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find()
        .populate("project", "title budget")
        .populate("client", "name email")
        .populate("freelancer", "name email")
        .sort({ createdAt: -1 })

    res.status(200).json(payments)
})

// ─────────────────────────────────────────────────────────────────────────────
// 7. GET MY PAYMENTS (client)
// GET /api/payment/me
// ─────────────────────────────────────────────────────────────────────────────
export const getMyPayments = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const payments = await Payment.find({ client: userId })
        .populate("project", "title budget")
        .populate("client", "name email")
        .populate("freelancer", "name email")
        .sort({ createdAt: -1 })
    res.status(200).json(payments)
})

// ─────────────────────────────────────────────────────────────────────────────
// CRON: Auto-clear pending balances after 24hr
// ─────────────────────────────────────────────────────────────────────────────
export const runEscrowReleaseCron = async () => {
    try {
        console.log("[CRON] Auto-clearing pending balances...")
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hr ago

        const wallets = await Wallet.find({ pendingBalance: { $gt: 0 } })
        let cleared = 0

        for (const wallet of wallets) {
            const pendingTxns = wallet.transactions.filter(
                (t) => t.status === "pending" && t.type === "credit" && new Date(t.createdAt) < cutoff
            )
            const amount = pendingTxns.reduce((s, t) => s + t.amount, 0)
            if (amount > 0) {
                wallet.balance += amount
                wallet.pendingBalance -= amount
                pendingTxns.forEach((t) => (t.status = "completed"))
                await wallet.save()
                cleared++
            }
        }
        console.log(`[CRON] ✅ Cleared pending for ${cleared} wallets`)
    } catch (error) {
        console.error("[CRON] ❌ Error:", error.message)
    }
}

const paymentController = {
    createOrder,
    verifyPayment,
    releaseEscrow,
    clearPendingBalances,
    getProjectPayment,
    getAllPayments,
    getMyPayments,
    runEscrowReleaseCron,
}

export default paymentController