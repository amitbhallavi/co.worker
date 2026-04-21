import User from "../models/userModel.js"
import { PLANS } from "../config/plans.js"
import { createHttpError, ensure, sendError } from "../utils/http.js"

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

const getActivePlan = async (user) => {
    const hasExpiredPlan = user.planExpiresAt && new Date(user.planExpiresAt) < new Date()

    if (hasExpiredPlan) {
        await User.findByIdAndUpdate(user._id, { plan: "free" })
        return "free"
    }

    return user.plan
}

/**
 * Check if user's plan allows access to a feature
 * Usage: app.post('/api/bids', planMiddleware.checkPlanFeature('createBid'), bidController.createBid)
 */
export const checkPlanFeature = (feature) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user._id).select("plan planExpiresAt")
            ensure(user, 404, "User not found")

            const userPlan = await getActivePlan(user)
            const plan = PLANS[userPlan]
            ensure(plan, 400, "Invalid plan")

            const restriction = featureRestrictions[feature]?.[userPlan]
            if (restriction?.allowed === false) {
                throw createHttpError(
                    403,
                    `This feature is not available on your ${userPlan} plan. Please upgrade to access.`
                )
            }

            req.userPlan = userPlan
            req.planFeatures = plan.features
            req.platformFee = plan.features.platformFee

            next()
        } catch (error) {
            sendError(res, error, 403)
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
