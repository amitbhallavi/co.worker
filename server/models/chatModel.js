import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, default: "" },
        fileUrl: { type: String, default: "" },
        fileType: { type: String, default: "" },
        seen: { type: Boolean, default: false },
        seenAt: { type: Date, default: null },
    },
    { timestamps: true }
)

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        ],
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null,
        },
        messages: [messageSchema],
        lastMessage: {
            text: { type: String, default: "" },
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
            createdAt: { type: Date, default: null },
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    { timestamps: true }
)

conversationSchema.index({ participants: 1 })

const Conversation = mongoose.model("Conversation", conversationSchema)
export default Conversation