import { getExpiryDate, PLANS } from "../config/plans.js"

export const VALID_PLAN_TYPES = new Set(["monthly", "yearly"])

export const getPlanDetails = (planId) => PLANS[planId]

export const getPlanAmount = (planId, planType) => {
    const plan = getPlanDetails(planId)

    if (!plan) {
        return null
    }

    return planType === "monthly" ? plan.monthlyPrice : plan.yearlyPrice
}

export const buildPlanDates = (planType) => ({
    planStartedAt: new Date(),
    expiryDate: getExpiryDate(planType),
})

export const buildSubscriptionReceipt = (prefix, userId) => {
    const userSuffix = userId.toString().slice(-8)
    const timestampSuffix = Date.now().toString().slice(-6)

    return `${prefix}_${userSuffix}_${timestampSuffix}`.slice(0, 40)
}

export const emitToUser = (userId, eventName, payload) => {
    if (global.io) {
        global.io.to(userId.toString()).emit(eventName, payload)
    }
}

export const serializePlans = () => (
    Object.entries(PLANS).map(([id, plan]) => ({
        id,
        ...plan,
    }))
)
