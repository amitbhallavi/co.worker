// ===== FILE: server/models/freelancerModel.js =====

import mongoose from "mongoose"

const freelancerSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "User ID is required"],
      unique:   true,   // one user = one freelancer profile
    },
    description: {
      type:      String,
      required:  [true, "Description is required"],
      minlength: [20, "Description must be at least 20 characters"],
      trim:      true,
    },
    skills: {
      type:     String,   // comma-separated
      required: [true, "Skills are required"],
      trim:     true,
    },
    category: {
      type:     String,
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
        "AI Developer",       // ✅ added for Postman compat
        "Marketing",
        "Other",
      ],
    },
    experience: {
      type:    Number,
      default: 0,        // ✅ NOT required — defaults to 0
      min:     0,
      max:     50,
    },
    hourlyRate: {
      type:    Number,
      default: null,
    },
    rating: {
      type:    Number,
      default: 0,
      min:     0,
      max:     5,
    },
    totalRatings: {
      type:    Number,
      default: 0,
    },
    isAvailable: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

freelancerSchema.index({ user: 1 }, { unique: true })

const Freelancer = mongoose.model("Freelancer", freelancerSchema)

export default Freelancer