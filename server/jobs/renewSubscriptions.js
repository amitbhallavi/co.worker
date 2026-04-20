import User from "../models/userModel.js"
import SubscriptionPayment from "../models/subscriptionPaymentModel.js"
import Razorpay from "razorpay"
import { PLANS, getExpiryDate } from "../config/plans.js"

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

/**
 * AUTO-RENEWAL JOB
 * Runs every 6 hours to:
 * 1. Check plans expiring within 24 hours
 * 2. Auto-renew if autoRenewPlan = true
 * 3. Emit notifications if renewal fails
 */
export const renewSubscriptionsJob = async () => {
    try {
        console.log("🔄 Running subscription renewal job...")

        // Find users with plans expiring within 24 hours + have autoRenewPlan enabled
        const now = new Date()
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)

        const usersToRenew = await User.find({
            plan: { $in: ["pro", "elite"] },
            autoRenewPlan: true,
            planExpiresAt: {
                $gte: now,
                $lte: in24Hours,
            },
            planCancelledAt: null, // Not manually cancelled
        })

        console.log(`📋 Found ${usersToRenew.length} users to renew`)

        for (const user of usersToRenew) {
            try {
                await renewUserPlan(user)
            } catch (error) {
                console.error(`❌ Failed to renew plan for user ${user._id}:`, error.message)

                // Emit renewal failure notification
                if (global.io) {
                    global.io.to(user._id.toString()).emit("planRenewalFailed", {
                        plan: user.plan,
                        expiresAt: user.planExpiresAt,
                        message: "Plan renewal failed. Your plan will expire soon.",
                        errorReason: error.message,
                    })
                }
            }
        }

        console.log("✅ Subscription renewal job completed")
    } catch (error) {
        console.error("❌ Error in renewal job:", error.message)
    }
}

/**
 * Renew a single user's plan
 */
const renewUserPlan = async (user) => {
    const planId = user.plan
    const planType = user.planType || "monthly"
    const plan = PLANS[planId]

    if (!plan) {
        throw new Error(`Invalid plan: ${planId}`)
    }

    const amount = planType === "monthly" ? plan.monthlyPrice : plan.yearlyPrice

    // For free plan, just update expiry
    if (amount === 0) {
        const expiryDate = getExpiryDate(planType)
        await User.findByIdAndUpdate(user._id, {
            planExpiresAt: expiryDate,
        })

        // Emit Socket event
        if (global.io) {
            global.io.to(user._id.toString()).emit("planRenewed", {
                plan: planId,
                planType: planType,
                expiresAt: expiryDate,
                message: "Free plan renewed automatically",
                isAutoRenewal: true,
            })
        }

        console.log(`✅ Free plan renewed for user ${user._id}`)
        return
    }

    // For paid plans, create automatic renewal order
    console.log(`💳 Creating renewal order for user ${user._id} - Plan: ${planId}`)

    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `auto_renewal_${user._id}_${Date.now()}`,
        notes: {
            userId: user._id.toString(),
            planId: planId,
            planType: planType,
            isAutoRenewal: true,
        },
    }

    const order = await razorpay.orders.create(options)

    // Save renewal payment record
    const renewalPayment = await SubscriptionPayment.create({
        user: user._id,
        plan: planId,
        planType: planType,
        amount: amount,
        razorpayOrderId: order.id,
        status: "pending",
        expiresAt: getExpiryDate(planType),
        notes: `Auto-renewal (Original expiry: ${user.planExpiresAt})`,
    })

    // Emit Socket event for pending renewal
    if (global.io) {
        global.io.to(user._id.toString()).emit("planRenewalInitiated", {
            plan: planId,
            planType: planType,
            amount: amount,
            orderId: order.id,
            message: "Plan renewal initiated. Payment processing...",
            isAutoRenewal: true,
        })
    }

    console.log(`📝 Renewal order created: ${order.id} for user ${user._id}`)
}

/**
 * Handle successful auto-renewal payment
 * Called when verification confirms payment success
 */
export const handleAutoRenewalSuccess = async (userId, paymentRecord) => {
    try {
        const expiryDate = getExpiryDate(paymentRecord.planType)

        // Update user plan
        const user = await User.findByIdAndUpdate(
            userId,
            {
                plan: paymentRecord.plan,
                planExpiresAt: expiryDate,
                planType: paymentRecord.planType,
                // Keep autoRenewPlan as is (user's preference)
            },
            { new: true }
        )

        // Emit Socket event
        if (global.io) {
            global.io.to(userId.toString()).emit("planRenewed", {
                plan: paymentRecord.plan,
                planType: paymentRecord.planType,
                expiresAt: expiryDate,
                message: "✅ Plan renewed successfully!",
                isAutoRenewal: true,
            })
        }

        console.log(`✅ Plan auto-renewed successfully for user ${userId}`)
    } catch (error) {
        console.error(`❌ Error handling auto-renewal success:`, error.message)
        throw error
    }
}

/**
 * Check for expired plans and downgrade to free
 * Runs on app startup and periodically
 */
export const checkExpiredPlans = async () => {
    try {
        const now = new Date()

        // Find expired plans
        const expiredUsers = await User.find({
            plan: { $in: ["pro", "elite"] },
            planExpiresAt: { $lt: now },
        })

        if (expiredUsers.length > 0) {
            console.log(`⏰ Downgrading ${expiredUsers.length} expired plans to free`)

            for (const user of expiredUsers) {
                await User.findByIdAndUpdate(user._id, {
                    plan: "free",
                    planExpiresAt: null,
                    planType: null,
                    autoRenewPlan: false,
                })

                // Emit Socket event
                if (global.io) {
                    global.io.to(user._id.toString()).emit("planExpired", {
                        message: "Your plan has expired. You are now on the free plan.",
                        expiredAt: user.planExpiresAt,
                    })
                }
            }

            console.log(`✅ Downgraded ${expiredUsers.length} plans`)
        }
    } catch (error) {
        console.error("❌ Error checking expired plans:", error.message)
    }
}
