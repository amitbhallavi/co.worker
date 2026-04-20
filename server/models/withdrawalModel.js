// ===== FILE: server/models/withdrawalModel.js =====

import mongoose from "mongoose"

const withdrawalSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount:      { type: Number, required: true },
    fee:         { type: Number, default: 19 },
    finalAmount: { type: Number, required: true }, // amount - fee
    upiId:       { type: String, default: ""    }, // payout destination
    status: {
      type:    String,
      enum:    ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote:   { type: String, default: "" },
    processedAt: { type: Date,   default: null },
  },
  { timestamps: true }
)

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema)
export default Withdrawal