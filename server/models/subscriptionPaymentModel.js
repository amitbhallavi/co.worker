import mongoose from "mongoose"

const subscriptionPaymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID required"],
            index: true,
        },
        plan: {
            type: String,
            enum: ["free", "pro", "elite"],
            required: [true, "Plan is required"],
        },
        planType: {
            type: String,
            enum: ["monthly", "yearly"],
            required: [true, "Plan type required"],
        },
        amount: {
            type: Number,
            required: [true, "Amount required"],
            min: 0,
        },
        razorpayOrderId: {
            type: String,
            required: true,
            unique: true,
        },
        razorpayPaymentId: {
            type: String,
            default: null,
        },
        razorpaySignature: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ["pending", "success", "failed"],
            default: "pending",
        },
        expiresAt: {
            type: Date,
            required: [true, "Expiry date required"],
        },
        notes: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
)

// Index for fast user lookups
subscriptionPaymentSchema.index({ user: 1, createdAt: -1 })

// Index for successful payments
subscriptionPaymentSchema.index({ user: 1, status: 1 })

const SubscriptionPayment = mongoose.model("SubscriptionPayment", subscriptionPaymentSchema)

export default SubscriptionPayment
