import User from "../models/userModel.js"

// ✅ ACTIVATE FREE CLIENT PLAN
const activateClientPlan = async (req, res) => {
    try {
        const userId = req.user._id

        // Get user
        const user = await User.findById(userId)
        if (!user) {
            res.status(404)
            throw new Error("User not found")
        }

        // Mark as client (already done during registration, but just in case)
        // If user is already a freelancer, they can still be a client - don't disable freelancer status

        // Update user to indicate they're an active client
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                // No subscription plan for clients - all features are free
                plan: "free",
                planExpiresAt: null,
                planType: null,
                planStartedAt: new Date(),
                autoRenewPlan: false,
            },
            { new: true }
        )

        // Emit Socket.IO event
        if (global.io) {
            global.io.to(userId.toString()).emit("clientPlanActivated", {
                message: "🎉 Free client plan activated! All hiring features unlocked.",
                plan: "free-client",
                features: [
                    "Unlimited projects posting",
                    "Receive unlimited bids",
                    "Chat with freelancers",
                    "Project analytics",
                    "AI-powered matching"
                ]
            })
        }

        res.status(200).json({
            success: true,
            message: "Free client plan activated successfully",
            user: updatedUser,
        })
    } catch (error) {
        res.status(res.statusCode || 500).json({
            success: false,
            error: error.message,
        })
    }
}

// ✅ GET CLIENT FEATURES
const getClientFeatures = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)

        if (!user) {
            res.status(404)
            throw new Error("User not found")
        }

        // Determine client tier features based on plan
        // For now, all clients get the same unlimited features
        const features = {
            projectsLimit: "unlimited",
            bidsReceived: "unlimited",
            chatWithFreelancers: true,
            analytics: true,
            aiMatching: true,
            paymentEscrow: true,
            supportLevel: "standard",
        }

        res.status(200).json({
            success: true,
            features: features,
            plan: "free",
        })
    } catch (error) {
        res.status(res.statusCode || 500).json({
            success: false,
            error: error.message,
        })
    }
}

const clientController = {
    activateClientPlan,
    getClientFeatures,
}

export default clientController
