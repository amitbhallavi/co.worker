import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import { createAuthToken } from "../utils/auth.js"
import { ensure } from "../utils/http.js"
import { emitAdminDataChanged } from "../utils/adminRealtime.js"
import { getOAuthRedirectUrl } from "../config/passport.js"

const buildAuthResponse = (user) => ({
    _id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profilePic: user.profilePic,
    authProvider: user.authProvider,
    isAdmin: user.isAdmin,
    isFreelancer: user.isFreelancer,
    credits: user.credits,
    token: createAuthToken(user._id),
})

const registerUser = async (req, res) => {
    const { name, email, phone, password, profilePic } = req.body

    ensure(name && email && phone && password, 400, "All fields are required")

    const normalizedEmail = String(email).trim().toLowerCase()

    const existingUser = await User.findOne({
        $or: [{ phone }, { email: normalizedEmail }],
    })

    ensure(!existingUser, 409, "User already exists")

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
        name,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        profilePic,
        authProvider: "local",
    })

    ensure(user, 500, "Failed to create user")

    emitAdminDataChanged("user_registered", { message: `New user registered: ${user.name || user.email}` })

    res.status(201).json(buildAuthResponse(user))
}

const loginUser = async (req, res) => {
    const { email, password } = req.body

    ensure(email && password, 400, "Email and password are required")

    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select("+password")
    ensure(user, 401, "Invalid credentials")
    ensure(user.password, 401, "This account uses Google or GitHub sign-in. Use social login.")

    const isValidPassword = await bcrypt.compare(password, user.password)
    ensure(isValidPassword, 401, "Invalid credentials")

    res.status(200).json(buildAuthResponse(user))
}

const privateController = (req, res) => {
    res.send(`Request Made By: ${req.user.name}`)
}

const getMe = async (req, res) => {
    const user = await User.findById(req.user._id).select("-password")
    ensure(user, 404, "User not found")
    res.json(user)
}

const oauthCallback = (req, res) => {
    ensure(req.user, 401, "OAuth authentication failed")

    res.redirect(getOAuthRedirectUrl("/oauth/callback", {
        token: createAuthToken(req.user._id),
    }))
}

const oauthFailure = (req, res, error) => {
    const message = error?.message || "OAuth authentication failed"
    res.redirect(getOAuthRedirectUrl("/login", { authError: message }))
}

const authController = {
    registerUser,
    loginUser,
    privateController,
    getMe,
    oauthCallback,
    oauthFailure,
}

export default authController
