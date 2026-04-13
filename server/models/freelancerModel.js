import mongoose from "mongoose"

const freelancerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
                  // ✅ one user = one freelancer profile
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            minlength: [20, "Description must be at least 20 characters"],
            trim: true,
        },
        skills: {
            type: String,          // comma-separated string to match existing API
            required: [true, "Skills are required"],
            trim: true,
        },
        category: {
            type: String,
            required: [true, "Category is required"],
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
            required: [true, "Experience is required"],
            min: [0, "Experience cannot be negative"],
            max: [50, "Experience seems too high"],
        },
        portfolio: [
            {
                projectLink:        { type: String, trim: true },
                projectDescription: { type: String, trim: true },
                projectImage:       { type: String, trim: true },
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
    {
        timestamps: true,         // createdAt, updatedAt auto
    }
)

// ✅ Prevent duplicate freelancer profile
freelancerSchema.index({ user: 1 }, { unique: true })

const Freelancer = mongoose.model("Freelancer", freelancerSchema)

export default Freelancer