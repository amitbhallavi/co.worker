import express from "express"
import authController from "../controllers/authController.js"
import protect from "../middlewere/authMiddleware.js"
import passport, { getOAuthRedirectUrl, isOAuthProviderConfigured } from "../config/passport.js"

const router = express.Router()

const requireOAuthProvider = (provider) => (req, res, next) => {
    if (isOAuthProviderConfigured(provider)) {
        return next()
    }

    return res.redirect(getOAuthRedirectUrl("/login", {
        authError: `${provider} login is not configured on the server.`,
    }))
}

const handleOAuthCallback = (provider) => (req, res, next) => {
    passport.authenticate(provider, { session: false }, (error, user, info) => {
        if (error || !user) {
            return authController.oauthFailure(req, res, error || info)
        }

        req.user = user
        return authController.oauthCallback(req, res, next)
    })(req, res, next)
}

router.post("/register", authController.registerUser)
router.post("/login", authController.loginUser)
router.get(
    "/google",
    requireOAuthProvider("google"),
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
        prompt: "select_account",
    })
)
router.get("/google/callback", requireOAuthProvider("google"), handleOAuthCallback("google"))
router.get(
    "/github",
    requireOAuthProvider("github"),
    passport.authenticate("github", {
        scope: ["user:email"],
        session: false,
    })
)
router.get("/github/callback", requireOAuthProvider("github"), handleOAuthCallback("github"))
router.post("/private", protect.forAdmin, authController.privateController)
router.get("/me", protect.forAuthUsers, authController.getMe)

export default router
