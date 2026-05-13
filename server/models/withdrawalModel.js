import mongoose from "mongoose"

const withdrawalSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
        fee: { type: Number, default: 19 },
        finalAmount: { type: Number, required: true },
        method: {
            type: String,
            enum: ["upi", "bank"],
            default: "upi",
        },
        upiId: { type: String, default: "" },
        bankDetails: {
            accountHolderName: { type: String, default: "" },
            accountNumber: { type: String, default: "" },
            ifscCode: { type: String, default: "" },
            bankName: { type: String, default: "" },
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        adminNote: { type: String, default: "" },
        processedAt: { type: Date, default: null },
    },
    { timestamps: true }
)

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema)
export default Withdrawal
