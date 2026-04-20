// chatController.js

import Conversation from "../models/chatModel.js"
import User from "../models/userModel.js"

const getOrCreateConversation = async (req, res) => {
    const senderId = req.user._id.toString()
    const { receiverId, projectId } = req.body

    if (!receiverId) {
        res.status(400); throw new Error("receiverId is required")
    }
    if (senderId === receiverId) {
        res.status(400); throw new Error("Cannot chat with yourself")
    }

    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId], $size: 2 }
    })
        .populate("participants", "name email profilePic isFreelancer")
        .populate("project", "title category")

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [senderId, receiverId],
            project: projectId || null,
            messages: [],
            unreadCount: { [senderId]: 0, [receiverId]: 0 },
        })
        await conversation.populate("participants", "name email profilePic isFreelancer")
        if (projectId) await conversation.populate("project", "title category")
    }

    res.status(200).json({ conversation })
}

const getMyConversations = async (req, res) => {
    const userId = req.user._id

    const conversations = await Conversation.find({
        participants: userId
    })
        .populate("participants", "name email profilePic isFreelancer")
        .populate("project", "title category")
        .sort({ updatedAt: -1 })

    const withUnread = conversations.map(conv => ({
        _id: conv._id,
        participants: conv.participants,
        project: conv.project,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount?.get?.(userId.toString()) || 0,
        updatedAt: conv.updatedAt,
    }))

    res.status(200).json({ conversations: withUnread })
}

const getMessages = async (req, res) => {
    const userId = req.user._id
    const { conversationId } = req.params
    const { page = 1, limit = 50 } = req.query

    const conversation = await Conversation.findById(conversationId)
        .populate("messages.sender", "name profilePic")

    if (!conversation) {
        res.status(404); throw new Error("Conversation not found")
    }

    const isParticipant = conversation.participants.some(
        p => p.toString() === userId.toString()
    )
    if (!isParticipant) {
        res.status(403); throw new Error("Access denied")
    }

    const total = conversation.messages.length
    const start = Math.max(0, total - page * limit)
    const messages = conversation.messages.slice(start, start + limit)

    // ✅ THE ONLY FIX: Only mark messages as seen if the SENDER is someone else
    // Never mark your OWN sent messages as seen just because you loaded the chat
    let updated = false
    conversation.messages.forEach(msg => {
        const msgSenderId = msg.sender?._id?.toString() || msg.sender?.toString()
        const isMyMessage = msgSenderId === userId.toString()

        // ✅ Only mark as seen if:
        // 1. Not already seen
        // 2. Message was sent by the OTHER person (not you)
        if (!msg.seen && !isMyMessage) {
            msg.seen = true
            msg.seenAt = new Date()
            updated = true
        }
    })

    if (updated) {
        conversation.unreadCount?.set?.(userId.toString(), 0)
        await conversation.save()
    }

    res.status(200).json({ messages, total, hasMore: start > 0 })
}

const sendMessage = async (req, res) => {
    const senderId = req.user._id
    const { conversationId } = req.params
    const { text, fileUrl, fileType } = req.body

    if (!text?.trim() && !fileUrl) {
        res.status(400); throw new Error("Message cannot be empty")
    }

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
        res.status(404); throw new Error("Conversation not found")
    }

    const isParticipant = conversation.participants.some(
        p => p.toString() === senderId.toString()
    )
    if (!isParticipant) {
        res.status(403); throw new Error("Access denied")
    }

    const newMsg = {
        sender: senderId,
        text: text?.trim() || "",
        fileUrl: fileUrl || "",
        fileType: fileType || "",
        seen: false,
    }

    conversation.messages.push(newMsg)
    conversation.lastMessage = { text: text || "📎 File", sender: senderId, createdAt: new Date() }

    conversation.participants.forEach(pid => {
        if (pid.toString() !== senderId.toString()) {
            const current = conversation.unreadCount?.get?.(pid.toString()) || 0
            conversation.unreadCount?.set?.(pid.toString(), current + 1)
        }
    })

    await conversation.save()

    const saved = conversation.messages[conversation.messages.length - 1]
    await conversation.populate("messages.sender", "name profilePic")

    res.status(201).json({ message: saved })
}

const getUnreadCount = async (req, res) => {
    const userId = req.user._id.toString()

    const conversations = await Conversation.find({ participants: userId })
    const total = conversations.reduce((sum, conv) => {
        return sum + (conv.unreadCount?.get?.(userId) || 0)
    }, 0)

    res.status(200).json({ unreadCount: total })
}

const deleteConversation = async (req, res) => {
    const userId = req.user._id
    const conversation = await Conversation.findById(req.params.conversationId)

    if (!conversation) { res.status(404); throw new Error("Not found") }

    const isParticipant = conversation.participants.some(
        p => p.toString() === userId.toString()
    )
    if (!isParticipant) { res.status(403); throw new Error("Access denied") }

    conversation.messages = []
    conversation.lastMessage = {}
    await conversation.save()

    res.status(200).json({ success: true, message: "Chat cleared" })
}

const ChatController = {
    getOrCreateConversation,
    getMyConversations,
    getMessages,
    sendMessage,
    getUnreadCount,
    deleteConversation,
}

export default ChatController