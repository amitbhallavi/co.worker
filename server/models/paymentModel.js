import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema(
    {
        project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        razorpayOrderId: { type: String, default: null },
        razorpayPaymentId: { type: String, default: null },
        razorpaySignature: { type: String, default: null },
        totalAmount: { type: Number, required: true },
        platformFee: { type: Number, default: 0 },
        freelancerAmount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["pending", "escrow", "released", "failed", "refunded"],
            default: "pending",
        },
        releasedAt: { type: Date, default: null },
        completedAt: { type: Date, default: null },
    },
    { timestamps: true }
)

const Payment = mongoose.model("Payment", paymentSchema)
export default Payment