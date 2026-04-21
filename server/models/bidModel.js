import mongoose from "mongoose"

const bidSchema = new mongoose.Schema(
    {
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Freelancer",
            required: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "Pending", "Accepted", "Rejected"],
            required: true,
            default: "pending",
        },
    },
    { timestamps: true }
)

const Bid = mongoose.model("Bid", bidSchema)
export default Bid