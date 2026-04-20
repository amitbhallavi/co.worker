import mongoose from "mongoose"

// ── Message schema (embedded in conversation) ──────────────
const messageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, default: "" },
        fileUrl: { type: String, default: "" },   // image / attachment URL
        fileType: { type: String, default: "" },   // "image" | "file"
        seen: { type: Boolean, default: false },
        seenAt: { type: Date, default: null },
    },
    { timestamps: true }
)

// ── Conversation schema ────────────────────────────────────
const conversationSchema = new mongoose.Schema(
    {
        // exactly 2 participants (DM between client ↔ freelancer)
        participants: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
        ],

        // optional: linked to a project
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null,
        },

        messages: [messageSchema],

        // cache last message for conversation list preview
        lastMessage: {
            text: { type: String, default: "" },
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
            createdAt: { type: Date, default: null },
        },

        // unread count per user
        unreadCount: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    { timestamps: true }
)

// ✅ Ensure unique conversation per pair of users
conversationSchema.index({ participants: 1 })

const Conversation = mongoose.model("Conversation", conversationSchema)
export default Conversation