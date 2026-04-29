// ===== FILE: client/src/config/planFeatures.js =====
// Frontend plan features for UI display

export const PLANS = {
    free: {
        name: "Free",
        monthlyPrice: 0,
        yearlyPrice: 0,
        monthlyPriceMSRP: 0,
        yearlyPriceMSRP: 0,
        yearlyDiscount: "100% Free",
        badge: null,
        color: "gray",
        description: "Get started with basics",
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
        monthlyPrice: 199,
        yearlyPrice: 399,
        monthlyPriceMSRP: 199,
        yearlyPriceMSRP: 2388,
        yearlyDiscount: "Save ₹1,989",
        badge: "Pro",
        color: "blue",
        description: "Best for serious freelancers",
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
        yearlyPrice: 499,
        monthlyPriceMSRP: 299,
        yearlyPriceMSRP: 3588,
        yearlyDiscount: "Save ₹3,089",
        badge: "Elite",
        color: "violet",
        description: "For top performers",
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
