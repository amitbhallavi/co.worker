import Razorpay from "razorpay"
import crypto from "crypto"
import SubscriptionPayment from "../models/subscriptionPaymentModel.js"
import User from "../models/userModel.js"
import { PLANS, getExpiryDate } from "../config/plans.js"

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// ✅ CREATE SUBSCRIPTION ORDER
const createSubscriptionOrder = async (req, res) => {
    try {
        const userId = req.user._id
        const { planId, planType } = req.body

        console.log("[subscriptionController] Creating order:", { userId, planId, planType })

        // Validation
        if (!planId || !planType) {
            console.error("[subscriptionController] ❌ Missing planId or planType:", { planId, planType })
            res.status(400)
            throw new Error("Plan ID and type are required")
        }

        console.log("[subscriptionController] ✅ planId and planType present")

        if (!PLANS[planId]) {
            console.error("[subscriptionController] ❌ Invalid plan:", { planId, availablePlans: Object.keys(PLANS) })
            res.status(400)
            throw new Error("Invalid plan")
        }

        console.log("[subscriptionController] ✅ Plan exists in config")

        if (!["monthly", "yearly"].includes(planType)) {
            console.error("[subscriptionController] ❌ Invalid planType:", { planType, allowed: ["monthly", "yearly"] })
            res.status(400)
            throw new Error("Plan type must be monthly or yearly")
        }

        console.log("[subscriptionController] ✅ PlanType is valid")

        // Get plan pricing
        const plan = PLANS[planId]
        const amount = planType === "monthly" ? plan.monthlyPrice : plan.yearlyPrice

        console.log("[subscriptionController] Plan details:", {
            plan: planId,
            amount,
            planType,
            monthlyPrice: plan.monthlyPrice,
            yearlyPrice: plan.yearlyPrice
        })

        // Skip payment for free plan
        if (amount === 0) {
            console.log("[subscriptionController] Free plan activation")
            // Directly activate free plan
            const expiryDate = getExpiryDate(planType)
            await User.findByIdAndUpdate(userId, {
                plan: planId,
                planExpiresAt: expiryDate,
                planType: planType,
                planStartedAt: new Date(),
            })

            // Create payment record
            await SubscriptionPayment.create({
                user: userId,
                plan: planId,
                planType: planType,
                amount: 0,
                razorpayOrderId: `free_${Date.now()}`,
                status: "success",
                expiresAt: expiryDate,
                notes: "Free plan activated",
            })

            // Emit Socket event
            if (global.io) {
                global.io.to(userId.toString()).emit("planActivated", {
                    plan: planId,
                    planType: planType,
                    expiresAt: expiryDate,
                    message: "Free plan activated successfully",
                })
            }

            const freeResponse = {
                success: true,
                message: "Free plan activated",
                planId: planId,
                planType: planType,
                expiresAt: expiryDate,
            }
            console.log("[subscriptionController] Free plan response:", freeResponse)
            return res.status(200).json(freeResponse)
        }

        // Create Razorpay order for paid plans
        // NOTE: Razorpay receipt must be max 40 characters
        const shortId = userId.toString().slice(-8) // Last 8 chars of ObjectId
        const timestamp = Date.now() % 1000000 // Last 6 digits of timestamp
        const receipt = `sub_${shortId}_${timestamp}` // Max 40 chars: "sub_" (4) + 8 + "_" (1) + 6 = 19 chars
        
        const options = {
            amount: amount * 100, // Convert to paise
            currency: "INR",
            receipt: receipt,
            notes: {
                userId: userId.toString(),
                planId: planId,
                planType: planType,
            },
        }

        console.log("[subscriptionController] Razorpay options:", options)

        let order
        try {
            console.log("[subscriptionController] 🔵 Attempting to create Razorpay order...")
            order = await razorpay.orders.create(options)
            console.log("[subscriptionController] ✅ Razorpay order created successfully:", {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                status: order.status
            })
        } catch (razorpayError) {
            console.error("[subscriptionController] ❌ Razorpay API Error:", {
                message: razorpayError?.message,
                description: razorpayError?.description,
                statusCode: razorpayError?.statusCode,
                errorCode: razorpayError?.error?.code,
                fullError: razorpayError
            })
            throw razorpayError
        }

        // Save pending payment
        await SubscriptionPayment.create({
            user: userId,
            plan: planId,
            planType: planType,
            amount: amount,
            razorpayOrderId: order.id,
            status: "pending",
            expiresAt: getExpiryDate(planType),
        })

        const successResponse = {
            success: true,
            orderId: order.id,
            planId: planId,
            planType: planType,
            amount: amount,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        }

        console.log("[subscriptionController] Sending response:", {
            success: successResponse.success,
            keys: Object.keys(successResponse),
            orderId: successResponse.orderId,
            razorpayKeyId: successResponse.razorpayKeyId ? "✅ SET" : "❌ MISSING"
        })

        res.status(200).json(successResponse)
    } catch (error) {
        const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500
        
        // Properly serialize error object
        let errorMessage = "Unknown error"
        let errorDetails = null
        
        if (error?.message) {
            errorMessage = error.message
        } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message
            errorDetails = error.response.data
        } else if (typeof error === 'string') {
            errorMessage = error
        }
        
        // For Razorpay errors, capture details
        if (error?.response?.data) {
            errorDetails = {
                status: error.response.status,
                data: error.response.data,
                description: error.response.data.description || error.response.data.error?.description
            }
        }
        
        console.error("[subscriptionController] ❌ Error creating order:", {
            message: errorMessage,
            statusCode,
            details: errorDetails,
            stack: error?.stack
        })
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: errorDetails
        })
    }
}

// ✅ VERIFY SUBSCRIPTION PAYMENT
const verifySubscriptionSignature = async (req, res) => {
    try {
        const userId = req.user._id
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

        // Validation
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            res.status(400)
            throw new Error("Payment details are required")
        }

        // Find pending payment
        const payment = await SubscriptionPayment.findOne({
            razorpayOrderId: razorpayOrderId,
            user: userId,
            status: "pending",
        })

        if (!payment) {
            res.status(404)
            throw new Error("Payment record not found")
        }

        // Verify signature
        const body = razorpayOrderId + "|" + razorpayPaymentId
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex")

        if (expectedSignature !== razorpaySignature) {
            res.status(400)
            throw new Error("Invalid payment signature")
        }

        // Payment verified - Activate plan
        const expiryDate = getExpiryDate(payment.planType)

        // Update payment record
        payment.razorpayPaymentId = razorpayPaymentId
        payment.razorpaySignature = razorpaySignature
        payment.status = "success"
        await payment.save()

        // Update user plan
        const user = await User.findByIdAndUpdate(
            userId,
            {
                plan: payment.plan,
                planExpiresAt: expiryDate,
                planType: payment.planType,
                planStartedAt: new Date(),
            },
            { new: true }
        )

        // Emit Socket event for real-time update
        if (global.io) {
            global.io.to(userId.toString()).emit("planActivated", {
                plan: payment.plan,
                planType: payment.planType,
                expiresAt: expiryDate,
                features: PLANS[payment.plan]?.features,
            })
        }

        res.status(200).json({
            success: true,
            message: "Plan activated successfully",
            user: {
                plan: user.plan,
                planExpiresAt: user.planExpiresAt,
                planType: user.planType,
            },
        })
    } catch (error) {
        res.status(res.statusCode || 500).json({
            success: false,
            error: error.message,
        })
    }
}

// ✅ GET USER PLAN STATUS
const getUserPlanStatus = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId).select("plan planExpiresAt planType planStartedAt")

        if (!user) {
            res.status(404)
            throw new Error("User not found")
        }

        // Check if plan has expired
        let plan = user.plan
        let isExpired = false

        if (user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
            plan = "free"
            isExpired = true
            // Auto-downgrade to free if expired
            await User.findByIdAndUpdate(userId, { plan: "free" })
        }

        res.status(200).json({
            success: true,
            plan: plan,
            planType: user.planType,
            planExpiresAt: user.planExpiresAt,
            planStartedAt: user.planStartedAt,
            isExpired: isExpired,
            features: PLANS[plan]?.features || {},
        })
    } catch (error) {
        res.status(res.statusCode || 500).json({
            success: false,
            error: error.message,
        })
    }
}

// ✅ GET ALL PLANS
const getAllPlans = async (req, res) => {
    try {
        const plansArray = Object.keys(PLANS).map((key) => ({
            id: key,
            ...PLANS[key],
        }))

        res.status(200).json({
            success: true,
            plans: plansArray,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}

// ✅ CANCEL SUBSCRIPTION (Downgrade to Free)
const cancelSubscription = async (req, res) => {
    try {
        const userId = req.user._id
        const { reason } = req.body

        const user = await User.findById(userId)
        if (!user) {
            res.status(404)
            throw new Error("User not found")
        }

        if (user.plan === "free") {
            res.status(400)
            throw new Error("Already on free plan")
        }

        // Downgrade to free immediately
        await User.findByIdAndUpdate(userId, {
            plan: "free",
            planExpiresAt: null,
            planType: null,
            planCancelledAt: new Date(),
            autoRenewPlan: false,
        })

        // Create cancellation record
        await SubscriptionPayment.create({
            user: userId,
            plan: "free",
            planType: null,
            amount: 0,
            status: "cancelled",
            notes: `Cancelled from ${user.plan} - Reason: ${reason || "User requested"}`,
        })

        // Emit Socket event
        if (global.io) {
            global.io.to(userId.toString()).emit("planCancelled", {
                message: "Plan cancelled. You are now on the free plan.",
            })
        }

        res.status(200).json({
            success: true,
            message: "Plan cancelled successfully. You are now on the free plan.",
            plan: "free",
        })
    } catch (error) {
        res.status(res.statusCode || 500).json({
            success: false,
            error: error.message,
        })
    }
}

// ✅ EXTEND PLAN (For Auto-Renewal)
const extendPlan = async (req, res) => {
    try {
        const userId = req.user._id
        const { planId, planType } = req.body

        // Validation
        if (!planId || !planType) {
            res.status(400)
            throw new Error("Plan ID and type are required")
        }

        if (!PLANS[planId]) {
            res.status(400)
            throw new Error("Invalid plan")
        }

        const user = await User.findById(userId)
        if (!user) {
            res.status(404)
            throw new Error("User not found")
        }

        // Get plan pricing
        const plan = PLANS[planId]
        const amount = planType === "monthly" ? plan.monthlyPrice : plan.yearlyPrice

        // For free plan, just update expiry
        if (amount === 0) {
            const expiryDate = getExpiryDate(planType)
            await User.findByIdAndUpdate(userId, {
                plan: planId,
                planExpiresAt: expiryDate,
                planType: planType,
            })

            // Emit Socket event
            if (global.io) {
                global.io.to(userId.toString()).emit("planRenewed", {
                    plan: planId,
                    planType: planType,
                    expiresAt: expiryDate,
                    message: "Plan renewed successfully",
                })
            }

            return res.status(200).json({
                success: true,
                message: "Plan renewed successfully",
                plan: planId,
                expiresAt: expiryDate,
            })
        }

        // For paid plans, create new order for automatic payment
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `renewal_${userId}_${Date.now()}`,
            notes: {
                userId: userId.toString(),
                planId: planId,
                planType: planType,
                isRenewal: true,
            },
        }

        const order = await razorpay.orders.create(options)

        // Save renewal payment attempt
        await SubscriptionPayment.create({
            user: userId,
            plan: planId,
            planType: planType,
            amount: amount,
            razorpayOrderId: order.id,
            status: "pending",
            expiresAt: getExpiryDate(planType),
            notes: "Auto-renewal payment",
        })

        res.status(200).json({
            success: true,
            orderId: order.id,
            planId: planId,
            planType: planType,
            amount: amount,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            message: "Renewal order created",
        })
    } catch (error) {
        res.status(res.statusCode || 500).json({
            success: false,
            error: error.message,
        })
    }
}

// ✅ GET SUBSCRIPTION HISTORY
const getSubscriptionHistory = async (req, res) => {
    try {
        const userId = req.user._id
        const history = await SubscriptionPayment.find({ user: userId }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            history: history,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}


const subscriptionController = {
    createSubscriptionOrder,
    verifySubscriptionSignature,
    cancelSubscription,
    extendPlan,
    getUserPlanStatus,
    getAllPlans,
    getSubscriptionHistory,
}

export default subscriptionController
