import mongoose from "mongoose"

const ratingSchema = new mongoose.Schema(
    {
        rater: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Rater ID is required"],
            index: true,
        },
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Target user ID is required"],
            index: true,
        },
        raterType: {
            type: String,
            enum: ["client", "freelancer"],
            required: true,
        },
        targetUserType: {
            type: String,
            enum: ["client", "freelancer"],
            required: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null,
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
        },
        review: {
            type: String,
            required: [true, "Review text is required"],
            minlength: [20, "Review must be at least 20 characters"],
            maxlength: [1000, "Review cannot exceed 1000 characters"],
            trim: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isReported: {
            type: Boolean,
            default: false,
        },
        reportReason: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
)

ratingSchema.index({ rater: 1, targetUser: 1 }, { unique: true })
ratingSchema.index({ targetUser: 1, createdAt: -1 })
ratingSchema.index({ targetUser: 1, isVerified: 1, rating: -1 })

const Rating = mongoose.model("Rating", ratingSchema)
export default Rating