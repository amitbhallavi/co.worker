import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import { createAuthToken } from "../utils/auth.js"
import { ensure } from "../utils/http.js"

const buildAuthResponse = (user) => ({
    _id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profilePic: user.profilePic,
    isAdmin: user.isAdmin,
    isFreelancer: user.isFreelancer,
    credits: user.credits,
    token: createAuthToken(user._id),
})

const registerUser = async (req, res) => {
    const { name, email, phone, password, profilePic } = req.body

    ensure(name && email && phone && password, 400, "All fields are required")

    const existingUser = await User.findOne({
        $or: [{ phone }, { email }],
    })

    ensure(!existingUser, 409, "User already exists")

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        profilePic,
    })

    ensure(user, 500, "Failed to create user")

    res.status(201).json(buildAuthResponse(user))
}

const loginUser = async (req, res) => {
    const { email, password } = req.body

    ensure(email && password, 400, "Email and password are required")

    const user = await User.findOne({ email })
    ensure(user, 401, "Invalid credentials")

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

const authController = {
    registerUser,
    loginUser,
    privateController,
    getMe,
}

export default authController
