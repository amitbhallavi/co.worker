import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "50d" })
}

const registerUser = async (req, res) => {
    const { name, email, phone, password, profilePic } = req.body

    if (!name || !email || !phone || !password) {
        res.status(400)
        throw new Error("All fields are required")
    }

    const phoneExists = await User.findOne({ phone })
    const emailExists = await User.findOne({ email })

    if (phoneExists || emailExists) {
        res.status(409)
        throw new Error("User already exists")
    }

    const salt = bcrypt.genSaltSync(10)
    const hashPassword = bcrypt.hashSync(password, salt)

    const user = await User.create({
        name,
        email,
        phone,
        password: hashPassword,
        profilePic,
    })

    if (!user) {
        res.status(500)
        throw new Error("Failed to create user")
    }

    res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin,
        isFreelancer: user.isFreelancer,
        credits: user.credits,
        token: generateToken(user._id),
    })
}

const loginUser = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400)
        throw new Error("Email and password are required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        res.status(401)
        throw new Error("Invalid credentials")
    }

    const isValidPassword = bcrypt.compareSync(password, user.password)

    if (isValidPassword) {
        return res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            profilePic: user.profilePic,
            isAdmin: user.isAdmin,
            isFreelancer: user.isFreelancer,
            credits: user.credits,
            token: generateToken(user._id),
        })
    }

    res.status(401)
    throw new Error("Invalid credentials")
}

const privateController = (req, res) => {
    res.send(`Request Made By: ${req.user.name}`)
}

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.json(user)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const authController = {
    registerUser,
    loginUser,
    privateController,
    getMe,
}

export default authController