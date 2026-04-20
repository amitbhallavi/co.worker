// ===== FILE: server/controllers/walletController.js =====

import asyncHandler from "express-async-handler"
import Wallet from "../models/walletModel.js"
import Withdrawal from "../models/withdrawalModel.js"

const WITHDRAWAL_FEE = 19

// ─────────────────────────────────────────────────────────────────────────────
// GET MY WALLET
// GET /api/wallet/me
// ─────────────────────────────────────────────────────────────────────────────
export const getMyWallet = asyncHandler(async (req, res) => {
    const userId = req.user._id
    let wallet = await Wallet.findOne({ user: userId })
    if (!wallet) {
        wallet = await Wallet.create({ user: userId })
    }
    res.status(200).json(wallet)
})

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST WITHDRAWAL
// POST /api/wallet/withdraw
// Body: { amount, upiId }
// ─────────────────────────────────────────────────────────────────────────────
export const requestWithdrawal = asyncHandler(async (req, res) => {
    const { amount, upiId } = req.body
    const userId = req.user._id

    if (!amount || Number(amount) <= 0) {
        res.status(400)
        throw new Error("Amount must be greater than 0")
    }
    if (!upiId || typeof upiId !== "string" || upiId.trim().length === 0) {
        res.status(400)
        throw new Error("Valid UPI ID is required")
    }

    const wallet = await Wallet.findOne({ user: userId })
    if (!wallet) {
        res.status(404)
        throw new Error("Wallet not found")
    }

    const amt = Number(amount)
    if (wallet.balance < amt) {
        res.status(400)
        throw new Error(`Insufficient balance. Available: ₹${wallet.balance}`)
    }

    const finalAmount = amt - WITHDRAWAL_FEE
    if (finalAmount <= 0) {
        res.status(400)
        throw new Error(`Amount must be greater than fee (₹${WITHDRAWAL_FEE})`)
    }

    // Deduct from wallet immediately (hold it)
    wallet.balance -= amt
    wallet.transactions.push({
        type: "debit",
        amount: amt,
        description: `Withdrawal request — UPI: ${upiId}`,
        status: "pending",
    })
    await wallet.save()

    const withdrawal = await Withdrawal.create({
        user: userId,
        amount: amt,
        fee: WITHDRAWAL_FEE,
        finalAmount,
        upiId,
    })

    res.status(201).json({
        success: true,
        message: "Withdrawal request submitted successfully",
        withdrawal,
        walletBalance: wallet.balance,
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// GET MY WITHDRAWAL HISTORY
// GET /api/wallet/withdrawals
// ─────────────────────────────────────────────────────────────────────────────
export const getMyWithdrawals = asyncHandler(async (req, res) => {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.status(200).json(withdrawals)
})

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — GET ALL WITHDRAWALS
// GET /api/wallet/admin/withdrawals
// ─────────────────────────────────────────────────────────────────────────────
export const getAllWithdrawals = asyncHandler(async (req, res) => {
    const withdrawals = await Withdrawal.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
    res.status(200).json(withdrawals)
})

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — APPROVE / REJECT WITHDRAWAL
// PUT /api/wallet/admin/withdrawals/:id
// Body: { status: "approved" | "rejected", adminNote }
// ─────────────────────────────────────────────────────────────────────────────
export const processWithdrawal = asyncHandler(async (req, res) => {
    const { status, adminNote } = req.body
    const withdrawalId = req.params.id

    if (!["approved", "rejected"].includes(status)) {
        res.status(400)
        throw new Error("Status must be 'approved' or 'rejected'")
    }

    const withdrawal = await Withdrawal.findById(withdrawalId).populate("user", "name email phone")

    if (!withdrawal) {
        res.status(404)
        throw new Error("Withdrawal not found")
    }

    if (withdrawal.status !== "pending") {
        res.status(409)
        throw new Error(`Withdrawal already ${withdrawal.status}`)
    }

    withdrawal.status = status
    withdrawal.adminNote = adminNote || ""
    withdrawal.processedAt = new Date()
    await withdrawal.save()

    // If rejected → refund to wallet
    if (status === "rejected") {
        const wallet = await Wallet.findOne({ user: withdrawal.user._id })
        if (wallet) {
            wallet.balance += withdrawal.amount
            wallet.transactions.push({
                type: "credit",
                amount: withdrawal.amount,
                description: "Withdrawal rejected — refunded",
                reference: String(withdrawal._id),
                status: "completed",
            })
            await wallet.save()
        }
    }

    res.status(200).json({
        success: true,
        message: `Withdrawal ${status} successfully`,
        withdrawal,
    })
})

const walletController = {
    getMyWallet,
    requestWithdrawal,
    getMyWithdrawals,
    getAllWithdrawals,
    processWithdrawal,
}

export default walletController