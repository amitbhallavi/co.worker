import mongoose from "mongoose";


const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please enter  Name "],
    },

    email: {
        type: String,
        unique: true,
        required: [true, "Please enter  Email "],
    },
    phone: {
        type: Number,
        unique: true,
        required: [true, "Please enter  Number "],
    },

    profilePic: {
        type: String,
    },


    password: {
        type: String,
        required: [true, " Please enter  Password "]
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

    // ✅ SUBSCRIPTION PLAN FIELDS
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

    // ✅ RATING SYSTEM FIELDS
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

}, { timestamps: true })


const User = mongoose.model("User", userSchema)


export default User 