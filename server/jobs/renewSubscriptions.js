import Razorpay from "razorpay"
import SubscriptionPayment from "../models/subscriptionPaymentModel.js"
import User from "../models/userModel.js"
import { buildPlanDates, buildSubscriptionReceipt, emitToUser, getPlanAmount, getPlanDetails } from "../utils/subscription.js"

const hasRazorpayConfig = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)

const getRazorpay = () => {
    if (!hasRazorpayConfig()) {
        throw new Error("Razorpay keys are not configured on the server")
    }

    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
}

export const renewSubscriptionsJob = async () => {
    try {
        console.log("Running subscription renewal job...")

        if (!hasRazorpayConfig()) {
            console.warn("Skipping subscription renewal job: Razorpay keys are not configured on the server")
            return
        }

        const now = new Date()
        const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)

        const usersToRenew = await User.find({
            plan: { $in: ["pro", "elite"] },
            autoRenewPlan: true,
            planExpiresAt: { $gte: now, $lte: next24Hours },
            planCancelledAt: null,
        })

        console.log(`Found ${usersToRenew.length} users to renew`)

        for (const user of usersToRenew) {
            try {
                await renewUserPlan(user)
            } catch (error) {
                console.error(`Failed to renew plan for user ${user._id}:`, error.message)
                emitToUser(user._id, "planRenewalFailed", {
                    plan: user.plan,
                    expiresAt: user.planExpiresAt,
                    message: "Plan renewal failed. Your plan will expire soon.",
                    errorReason: error.message,
                })
            }
        }

        console.log("Subscription renewal job completed")
    } catch (error) {
        console.error("Error in renewal job:", error.message)
    }
}

const renewUserPlan = async (user) => {
    const planId = user.plan
    const planType = user.planType || "monthly"
    const plan = getPlanDetails(planId)

    if (!plan) {
        throw new Error(`Invalid plan: ${planId}`)
    }

    const amount = getPlanAmount(planId, planType)

    if (amount === 0) {
        const { expiryDate } = buildPlanDates(planType)

        await User.findByIdAndUpdate(user._id, { planExpiresAt: expiryDate })

        emitToUser(user._id, "planRenewed", {
            plan: planId,
            planType,
            expiresAt: expiryDate,
            message: "Free plan renewed automatically",
            isAutoRenewal: true,
        })

        console.log(`Free plan renewed for user ${user._id}`)
        return
    }

    const order = await getRazorpay().orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: buildSubscriptionReceipt("auto", user._id),
        notes: {
            userId: user._id.toString(),
            planId,
            planType,
            isAutoRenewal: true,
        },
    })

    await SubscriptionPayment.create({
        user: user._id,
        plan: planId,
        planType,
        amount,
        razorpayOrderId: order.id,
        status: "pending",
        expiresAt: buildPlanDates(planType).expiryDate,
        notes: `Auto-renewal (Original expiry: ${user.planExpiresAt})`,
    })

    emitToUser(user._id, "planRenewalInitiated", {
        plan: planId,
        planType,
        amount,
        orderId: order.id,
        message: "Plan renewal initiated. Payment processing...",
        isAutoRenewal: true,
    })

    console.log(`Renewal order created: ${order.id} for user ${user._id}`)
}

export const handleAutoRenewalSuccess = async (userId, paymentRecord) => {
    try {
        const { expiryDate } = buildPlanDates(paymentRecord.planType)

        await User.findByIdAndUpdate(
            userId,
            {
                plan: paymentRecord.plan,
                planExpiresAt: expiryDate,
                planType: paymentRecord.planType,
            },
            { new: true }
        )

        emitToUser(userId, "planRenewed", {
            plan: paymentRecord.plan,
            planType: paymentRecord.planType,
            expiresAt: expiryDate,
            message: "✅ Plan renewed successfully!",
            isAutoRenewal: true,
        })

        console.log(`Plan auto-renewed successfully for user ${userId}`)
    } catch (error) {
        console.error("Error handling auto-renewal success:", error.message)
        throw error
    }
}

export const checkExpiredPlans = async () => {
    try {
        const expiredUsers = await User.find({
            plan: { $in: ["pro", "elite"] },
            planExpiresAt: { $lt: new Date() },
        })

        if (!expiredUsers.length) {
            return
        }

        console.log(`Downgrading ${expiredUsers.length} expired plans to free`)

        for (const user of expiredUsers) {
            await User.findByIdAndUpdate(user._id, {
                plan: "free",
                planExpiresAt: null,
                planType: null,
                autoRenewPlan: false,
            })

            emitToUser(user._id, "planExpired", {
                message: "Your plan has expired. You are now on the free plan.",
                expiredAt: user.planExpiresAt,
            })
        }

        console.log(`Downgraded ${expiredUsers.length} plans`)
    } catch (error) {
        console.error("Error checking expired plans:", error.message)
    }
}
