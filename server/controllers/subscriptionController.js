import crypto from "crypto"
import Razorpay from "razorpay"
import SubscriptionPayment from "../models/subscriptionPaymentModel.js"
import User from "../models/userModel.js"
import { PLANS } from "../config/plans.js"
import { ensure, sendError } from "../utils/http.js"
import {
    VALID_PLAN_TYPES,
    buildPlanDates,
    buildSubscriptionReceipt,
    emitToUser,
    getPlanAmount,
    getPlanDetails,
    serializePlans,
} from "../utils/subscription.js"

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const ensureValidPlanSelection = (planId, planType) => {
    ensure(planId && planType, 400, "Plan ID and type are required")
    ensure(getPlanDetails(planId), 400, "Invalid plan")
    ensure(VALID_PLAN_TYPES.has(planType), 400, "Plan type must be monthly or yearly")
}

const activateUserPlan = async (userId, planId, planType) => {
    const { expiryDate, planStartedAt } = buildPlanDates(planType)

    const user = await User.findByIdAndUpdate(
        userId,
        {
            plan: planId,
            planExpiresAt: expiryDate,
            planType,
            planStartedAt,
        },
        { new: true }
    )

    return { user, expiryDate }
}

const createPaymentRecord = async ({
    userId,
    planId,
    planType,
    amount,
    razorpayOrderId,
    status = "pending",
    notes = null,
    expiresAt,
}) => {
    return SubscriptionPayment.create({
        user: userId,
        plan: planId,
        planType,
        amount,
        razorpayOrderId,
        status,
        expiresAt,
        notes,
    })
}

const getRazorpayErrorDetails = (error) => {
    if (!error?.response?.data) {
        return error?.details || null
    }

    return {
        status: error.response.status,
        data: error.response.data,
        description: error.response.data.description || error.response.data.error?.description,
    }
}

const createSubscriptionOrder = async (req, res) => {
    try {
        const { planId, planType } = req.body
        ensureValidPlanSelection(planId, planType)

        const amount = getPlanAmount(planId, planType)
        ensure(amount !== null, 400, "Invalid plan")

        if (amount === 0) {
            const { expiryDate } = await activateUserPlan(req.user._id, planId, planType)

            await createPaymentRecord({
                userId: req.user._id,
                planId,
                planType,
                amount: 0,
                razorpayOrderId: `free_${Date.now()}`,
                status: "success",
                expiresAt: expiryDate,
                notes: "Free plan activated",
            })

            emitToUser(req.user._id, "planActivated", {
                plan: planId,
                planType,
                expiresAt: expiryDate,
                message: "Free plan activated successfully",
            })

            return res.status(200).json({
                success: true,
                message: "Free plan activated",
                planId,
                planType,
                expiresAt: expiryDate,
            })
        }

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: buildSubscriptionReceipt("sub", req.user._id),
            notes: {
                userId: req.user._id.toString(),
                planId,
                planType,
            },
        })

        await createPaymentRecord({
            userId: req.user._id,
            planId,
            planType,
            amount,
            razorpayOrderId: order.id,
            expiresAt: buildPlanDates(planType).expiryDate,
        })

        res.status(200).json({
            success: true,
            orderId: order.id,
            planId,
            planType,
            amount,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        })
    } catch (error) {
        sendError(res, error, 500, {
            details: getRazorpayErrorDetails(error),
        })
    }
}

const verifySubscriptionSignature = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

        ensure(razorpayOrderId && razorpayPaymentId && razorpaySignature, 400, "Payment details are required")

        const payment = await SubscriptionPayment.findOne({
            razorpayOrderId,
            user: req.user._id,
            status: "pending",
        })

        ensure(payment, 404, "Payment record not found")

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex")

        ensure(expectedSignature === razorpaySignature, 400, "Invalid payment signature")

        payment.razorpayPaymentId = razorpayPaymentId
        payment.razorpaySignature = razorpaySignature
        payment.status = "success"
        await payment.save()

        const { user, expiryDate } = await activateUserPlan(req.user._id, payment.plan, payment.planType)

        emitToUser(req.user._id, "planActivated", {
            plan: payment.plan,
            planType: payment.planType,
            expiresAt: expiryDate,
            features: PLANS[payment.plan]?.features,
        })

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
        sendError(res, error)
    }
}

const getUserPlanStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("plan planExpiresAt planType planStartedAt")
        ensure(user, 404, "User not found")

        let currentPlan = user.plan
        let isExpired = false

        if (user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
            currentPlan = "free"
            isExpired = true
            await User.findByIdAndUpdate(req.user._id, { plan: "free" })
        }

        res.status(200).json({
            success: true,
            plan: currentPlan,
            planType: user.planType,
            planExpiresAt: user.planExpiresAt,
            planStartedAt: user.planStartedAt,
            isExpired,
            features: PLANS[currentPlan]?.features || {},
        })
    } catch (error) {
        sendError(res, error)
    }
}

const getAllPlans = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            plans: serializePlans(),
        })
    } catch (error) {
        sendError(res, error)
    }
}

const cancelSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        ensure(user, 404, "User not found")
        ensure(user.plan !== "free", 400, "Already on free plan")

        await User.findByIdAndUpdate(req.user._id, {
            plan: "free",
            planExpiresAt: null,
            planType: null,
            planCancelledAt: new Date(),
            autoRenewPlan: false,
        })

        await SubscriptionPayment.create({
            user: req.user._id,
            plan: "free",
            planType: "monthly",
            amount: 0,
            razorpayOrderId: `cancel_${Date.now()}`,
            status: "cancelled",
            expiresAt: new Date(),
            notes: `Cancelled from ${user.plan} - Reason: ${req.body.reason || "User requested"}`,
        })

        emitToUser(req.user._id, "planCancelled", {
            message: "Plan cancelled. You are now on the free plan.",
        })

        res.status(200).json({
            success: true,
            message: "Plan cancelled successfully. You are now on the free plan.",
            plan: "free",
        })
    } catch (error) {
        sendError(res, error)
    }
}

const extendPlan = async (req, res) => {
    try {
        const { planId, planType } = req.body
        ensureValidPlanSelection(planId, planType)

        const user = await User.findById(req.user._id)
        ensure(user, 404, "User not found")

        const amount = getPlanAmount(planId, planType)
        ensure(amount !== null, 400, "Invalid plan")

        if (amount === 0) {
            const { expiryDate } = await activateUserPlan(req.user._id, planId, planType)

            emitToUser(req.user._id, "planRenewed", {
                plan: planId,
                planType,
                expiresAt: expiryDate,
                message: "Plan renewed successfully",
            })

            return res.status(200).json({
                success: true,
                message: "Plan renewed successfully",
                plan: planId,
                expiresAt: expiryDate,
            })
        }

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: buildSubscriptionReceipt("renewal", req.user._id),
            notes: {
                userId: req.user._id.toString(),
                planId,
                planType,
                isRenewal: true,
            },
        })

        await createPaymentRecord({
            userId: req.user._id,
            planId,
            planType,
            amount,
            razorpayOrderId: order.id,
            expiresAt: buildPlanDates(planType).expiryDate,
            notes: "Auto-renewal payment",
        })

        res.status(200).json({
            success: true,
            orderId: order.id,
            planId,
            planType,
            amount,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            message: "Renewal order created",
        })
    } catch (error) {
        sendError(res, error)
    }
}

const getSubscriptionHistory = async (req, res) => {
    try {
        const history = await SubscriptionPayment.find({ user: req.user._id }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            history,
        })
    } catch (error) {
        sendError(res, error)
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
