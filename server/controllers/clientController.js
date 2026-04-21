import User from "../models/userModel.js"
import { ensure, sendError } from "../utils/http.js"
import { emitToUser } from "../utils/subscription.js"

const defaultClientFeatures = {
    projectsLimit: "unlimited",
    bidsReceived: "unlimited",
    chatWithFreelancers: true,
    analytics: true,
    aiMatching: true,
    paymentEscrow: true,
    supportLevel: "standard",
}

const activateClientPlan = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        ensure(user, 404, "User not found")

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                plan: "free",
                planExpiresAt: null,
                planType: null,
                planStartedAt: new Date(),
                autoRenewPlan: false,
            },
            { new: true }
        )

        emitToUser(req.user._id, "clientPlanActivated", {
            message: "🎉 Free client plan activated! All hiring features unlocked.",
            plan: "free-client",
            features: [
                "Unlimited projects posting",
                "Receive unlimited bids",
                "Chat with freelancers",
                "Project analytics",
                "AI-powered matching",
            ],
        })

        res.status(200).json({
            success: true,
            message: "Free client plan activated successfully",
            user: updatedUser,
        })
    } catch (error) {
        sendError(res, error)
    }
}

const getClientFeatures = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        ensure(user, 404, "User not found")

        res.status(200).json({
            success: true,
            features: defaultClientFeatures,
            plan: "free",
        })
    } catch (error) {
        sendError(res, error)
    }
}

const clientController = {
    activateClientPlan,
    getClientFeatures,
}

export default clientController
