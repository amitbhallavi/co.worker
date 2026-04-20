// ===== FILE: server/models/walletModel.js =====

import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ["credit", "debit"], required: true },
        amount: { type: Number, required: true },
        description: { type: String, default: "" },
        reference: { type: String, default: "" }, // paymentId / withdrawalId
        status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
    },
    { timestamps: true }
)

const walletSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        balance: { type: Number, default: 0 },        // withdrawable
        pendingBalance: { type: Number, default: 0 },        // released from escrow, waiting 24 hr
        transactions: [transactionSchema],
    },
    { timestamps: true }
)

const Wallet = mongoose.model("Wallet", walletSchema)
export default Wallet