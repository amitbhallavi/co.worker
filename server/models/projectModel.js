import mongoose from "mongoose"

const projectSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Freelancer",
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        budget: {
            type: Number,
            required: true,
        },
        selectedBid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bid",
            default: null,
        },
        finalAmount: {
            type: Number,
            default: null,
            min: 0,
        },
        technology: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "in-progress", "completed", "rejected"],
            default: "pending",
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
)

const Project = mongoose.model("Project", projectSchema)
export default Project