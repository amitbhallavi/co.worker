import mongoose from "mongoose"

const freelancerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            unique: true,
        },

        description: {
            type: String,
            required: [true, "Description is required"],
            minlength: [20, "Description must be at least 20 characters"],
            trim: true,
        },

        // ✅ FIXED: string → array
        skills: {
            type: [String],
            required: [true, "Skills are required"],
            default: []
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Web Development",
                "UI/UX Design",
                "Backend Dev",
                "Mobile Dev",
                "Data Science",
                "Full Stack",
                "WordPress",
                "Graphic Design",
                "Content Writing",
                "APPS DEVELOPER",
                "AI - ML DEVELOPER",
            ],
        },

        experience: {
            type: Number,
            required: true,
            min: 0,
            max: 50,
        },

        // ✅ rename for frontend match
        previousWorks: [
            {
                projectLink: String,
                projectDescription: String,
                projectImage: String,
            }
        ],

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        totalRatings: {
            type: Number,
            default: 0,
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

freelancerSchema.index({ user: 1 }, { unique: true })

export default mongoose.model("Freelancer", freelancerSchema)