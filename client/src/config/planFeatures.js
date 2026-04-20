// ===== FILE: client/src/config/planFeatures.js =====
// Frontend plan features for UI display

export const PLANS = {
    free: {
        name: "Free",
        monthlyPrice: 0,
        yearlyPrice: 0,
        badge: null,
        color: "gray",
        features: {
            maxBids: 5,
            visibility: "basic",
            platformFee: 0.30,
            badge: null,
            prioritySupport: false,
            featuredListing: false,
        },
    },
    pro: {
        name: "Pro",
        monthlyPrice: 149,
        yearlyPrice: 999,
        badge: "Pro",
        color: "blue",
        features: {
            maxBids: 50,
            visibility: "priority",
            platformFee: 0.15,
            badge: "Pro",
            prioritySupport: true,
            featuredListing: false,
        },
    },
    elite: {
        name: "Elite",
        monthlyPrice: 299,
        yearlyPrice: 1999,
        badge: "Elite",
        color: "violet",
        features: {
            maxBids: "unlimited",
            visibility: "top",
            platformFee: 0.10,
            badge: "Elite",
            prioritySupport: true,
            featuredListing: true,
        },
    },
}

// Feature comparison for table display
export const FEATURE_LIST = [
    { name: "Monthly Bids", free: "5", pro: "50", elite: "Unlimited" },
    { name: "Visibility", free: "Basic", pro: "Priority", elite: "Top Ranking" },
    { name: "Featured Listing", free: "❌", pro: "❌", elite: "✅" },
    { name: "Platform Fee", free: "30%", pro: "15%", elite: "10%" },
    { name: "Priority Support", free: "❌", pro: "✅", elite: "✅" },
]

// Helper functions
export const canAccessFeature = (userPlan, featureKey) => {
    const plan = PLANS[userPlan || "free"]
    return !!plan?.features[featureKey]
}

export const getUserEarningsFee = (userPlan) => {
    const plan = PLANS[userPlan || "free"]
    return plan?.features.platformFee || 0.30
}
