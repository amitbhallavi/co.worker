import User from "../models/userModel.js"
import { PLANS } from "../config/plans.js"

/**
 * Check if user's plan allows access to a feature
 * Usage: app.post('/api/bids', planMiddleware.checkPlanFeature('createBid'), bidController.createBid)
 */
export const checkPlanFeature = (feature) => {
    return async (req, res, next) => {
        try {
            const userId = req.user._id
            const user = await User.findById(userId).select("plan planExpiresAt")

            if (!user) {
                res.status(404)
                throw new Error("User not found")
            }

            // Check if plan has expired
            let userPlan = user.plan
            if (user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
                userPlan = "free"
                // Auto-downgrade
                await User.findByIdAndUpdate(userId, { plan: "free" })
            }

            // Get plan details
            const plan = PLANS[userPlan]
            if (!plan) {
                res.status(400)
                throw new Error("Invalid plan")
            }

            // Feature-based restrictions
            const featureRestrictions = {
                createBid: {
                    free: { maxBids: 5, checkMonthly: true },
                    pro: { maxBids: 50, checkMonthly: true },
                    elite: { maxBids: "unlimited", checkMonthly: false },
                },
                createProject: {
                    free: { allowed: true },
                    pro: { allowed: true },
                    elite: { allowed: true },
                },
                viewDetailedAnalytics: {
                    free: { allowed: false },
                    pro: { allowed: true },
                    elite: { allowed: true },
                },
            }

            const restriction = featureRestrictions[feature]?.[userPlan]

            if (!restriction) {
                // Feature not restricted, allow access
                req.userPlan = userPlan
                req.planFeatures = plan.features
                return next()
            }

            // Check if feature is allowed for this plan
            if (restriction.allowed === false) {
                res.status(403)
                throw new Error(
                    `This feature is not available on your ${userPlan} plan. Please upgrade to access.`
                )
            }

            // Check monthly limits for bids
            if (feature === "createBid" && restriction.checkMonthly) {
                const monthlyBidLimit = restriction.maxBids

                if (monthlyBidLimit !== "unlimited") {
                    // Count bids created this month
                    const now = new Date()
                    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

                    // Note: This assumes bids have a createdAt field and belong to the user
                    // You'll need to implement the Bid model and import it
                    // const bidCount = await Bid.countDocuments({
                    //     user: userId,
                    //     createdAt: { $gte: firstDayOfMonth }
                    // })

                    // For now, we'll allow it through - implement bid counting in production
                    // if (bidCount >= monthlyBidLimit) {
                    //     res.status(403)
                    //     throw new Error(`You have reached your monthly bid limit of ${monthlyBidLimit}. Please upgrade to access more bids.`)
                    // }
                }
            }

            // Attach user plan info to request
            req.userPlan = userPlan
            req.planFeatures = plan.features
            req.platformFee = plan.features.platformFee

            next()
        } catch (error) {
            res.status(res.statusCode || 403).json({
                success: false,
                error: error.message,
            })
        }
    }
}

/**
 * Enforce platform fee based on user's plan
 * Use in payment calculations
 */
export const getPlatformFee = (userPlan) => {
    const plan = PLANS[userPlan] || PLANS.free
    return plan.features.platformFee || 0.30
}

/**
 * Check if user plan allows unlimited access
 */
export const isUnlimitedAccess = (userPlan, feature) => {
    const plan = PLANS[userPlan]
    const featureValue = plan?.features[feature]
    return featureValue === "unlimited"
}

/**
 * Get plan feature limit
 */
export const getFeatureLimit = (userPlan, feature) => {
    const plan = PLANS[userPlan]
    return plan?.features[feature] || 0
}

export default {
    checkPlanFeature,
    getPlatformFee,
    isUnlimitedAccess,
    getFeatureLimit,
}
