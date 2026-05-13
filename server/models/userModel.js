import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter your name"],
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            required: [true, "Please enter your email"],
            lowercase: true,
            trim: true,
        },
        phone: {
            type: Number,
            unique: true,
            sparse: true,
        },
        profilePic: {
            type: String,
        },
        password: {
            type: String,
            select: false,
        },
        authProvider: {
            type: String,
            enum: ["local", "google", "github"],
            default: "local",
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        githubId: {
            type: String,
            unique: true,
            sparse: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
            required: true,
        },
        isFreelancer: {
            type: Boolean,
            default: false,
            required: true,
        },
        credits: {
            type: Number,
            default: 5,
        },
        location: {
            type: String,
        },
        plan: {
            type: String,
            enum: ["free", "pro", "elite"],
            default: "free",
        },
        planExpiresAt: {
            type: Date,
            default: null,
        },
        planType: {
            type: String,
            enum: ["monthly", "yearly"],
            default: null,
        },
        planStartedAt: {
            type: Date,
            default: null,
        },
        planCancelledAt: {
            type: Date,
            default: null,
        },
        autoRenewPlan: {
            type: Boolean,
            default: true,
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalRatings: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
)

const User = mongoose.model("User", userSchema)

export default User
