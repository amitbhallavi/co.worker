import mongoose from "mongoose"

const previousWorkSchema = new mongoose.Schema(
    {
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Freelancer",
            required: true,
        },
        projectLink: {
            type: String,
            required: true,
        },
        projectDescription: {
            type: String,
            required: true,
        },
        projectImage: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
)

const PreviousWork = mongoose.model("PreviousWork", previousWorkSchema)
export default PreviousWork