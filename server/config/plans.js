// All prices in INR (₹)

export const PLANS = {
    free: {
        name: "Free",
        monthlyPrice: 0,
        yearlyPrice: 0,
        monthlyPriceMSRP: 0,
        yearlyPriceMSRP: 0,
        yearlyDiscount: "100% Free",
        badge: null,
        description: "Get started with basics",
        features: {
            maxBids: 5,
            visibility: "basic",
            platformFee: 0.30, // 30% fee
            badge: null,
            prioritySupport: false,
            featuredListing: false,
        },
        recommended: false,
    },

    pro: {
        name: "Pro",
        monthlyPrice: 199,
        yearlyPrice: 399,
        monthlyPriceMSRP: 199,
        yearlyPriceMSRP: 2388, // 199 * 12
        yearlyDiscount: "Save ₹1,989", // 12 months - yearly price (60% off)
        badge: "Pro",
        description: "Best for serious freelancers",
        features: {
            maxBids: 50,
            visibility: "priority",
            platformFee: 0.15, // 15% fee
            badge: "Pro",
            prioritySupport: true,
            featuredListing: false,
        },
        recommended: false,
    },

    elite: {
        name: "Elite",
        monthlyPrice: 299,
        yearlyPrice: 499,
        monthlyPriceMSRP: 299,
        yearlyPriceMSRP: 3588, // 299 * 12
        yearlyDiscount: "Save ₹3,089", // 12 months - yearly price (86% off)
        badge: "Elite ⭐",
        description: "For top performers",
        features: {
            maxBids: "unlimited",
            visibility: "top",
            platformFee: 0.10, // 10% fee
            badge: "Elite ⭐",
            prioritySupport: true,
            featuredListing: true,
        },
        recommended: true,
    },
}

// Plan duration in days
export const PLAN_DURATION = {
    monthly: 30,
    yearly: 365,
}

// Feature comparison for UI
export const FEATURE_COMPARISON = [
    {
        category: "Bidding",
        features: [
            {
                name: "Monthly Bids",
                free: "5",
                pro: "50",
                elite: "Unlimited",
            },
        ],
    },
    {
        category: "Visibility & Listings",
        features: [
            {
                name: "Visibility",
                free: "Basic",
                pro: "Priority",
                elite: "Top Ranking",
            },
            {
                name: "Featured Listing",
                free: "❌",
                pro: "❌",
                elite: "✅",
            },
        ],
    },
    {
        category: "Earnings",
        features: [
            {
                name: "Platform Fee",
                free: "30%",
                pro: "15%",
                elite: "10%",
            },
        ],
    },
    {
        category: "Support",
        features: [
            {
                name: "Priority Support",
                free: "❌",
                pro: "✅",
                elite: "✅",
            },
        ],
    },
]

// Helper function to calculate expiry date
export const getExpiryDate = (planType) => {
    const now = new Date()
    const days = PLAN_DURATION[planType] || 30
    const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    return expiryDate
}

// Helper function to get plan by id
export const getPlan = (planId) => {
    return PLANS[planId] || PLANS.free
}

// Helper function to check if user can access feature
export const canAccessFeature = (userPlan, feature) => {
    const plan = PLANS[userPlan || "free"]
    return plan?.features[feature] || false
}
