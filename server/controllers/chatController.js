import Conversation from "../models/chatModel.js"
import { ensure } from "../utils/http.js"

const getConversationOrThrow = async (conversationId) => {
    const conversation = await Conversation.findById(conversationId)
    ensure(conversation, 404, "Conversation not found")
    return conversation
}

const ensureParticipant = (conversation, userId) => {
    const isParticipant = conversation.participants.some((participant) => participant.toString() === userId.toString())
    ensure(isParticipant, 403, "Access denied")
}

const markMessagesAsSeen = (conversation, userId) => {
    let updated = false

    conversation.messages.forEach((message) => {
        const senderId = message.sender?._id?.toString() || message.sender?.toString()

        if (!message.seen && senderId !== userId.toString()) {
            message.seen = true
            message.seenAt = new Date()
            updated = true
        }
    })

    if (updated) {
        conversation.unreadCount?.set?.(userId.toString(), 0)
    }

    return updated
}

const getOrCreateConversation = async (req, res) => {
    const senderId = req.user._id.toString()
    const { receiverId, projectId } = req.body

    ensure(receiverId, 400, "receiverId is required")
    ensure(senderId !== receiverId, 400, "Cannot chat with yourself")

    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId], $size: 2 },
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

        if (projectId) {
            await conversation.populate("project", "title category")
        }
    }

    res.status(200).json({ conversation })
}

const getMyConversations = async (req, res) => {
    const conversations = await Conversation.find({ participants: req.user._id })
        .populate("participants", "name email profilePic isFreelancer")
        .populate("project", "title category")
        .sort({ updatedAt: -1 })

    const conversationSummaries = conversations.map((conversation) => ({
        _id: conversation._id,
        participants: conversation.participants,
        project: conversation.project,
        lastMessage: conversation.lastMessage,
        unreadCount: conversation.unreadCount?.get?.(req.user._id.toString()) || 0,
        updatedAt: conversation.updatedAt,
    }))

    res.status(200).json({ conversations: conversationSummaries })
}

const getMessages = async (req, res) => {
    const { page = 1, limit = 50 } = req.query

    const conversation = await Conversation.findById(req.params.conversationId)
        .populate("messages.sender", "name profilePic")

    ensure(conversation, 404, "Conversation not found")
    ensureParticipant(conversation, req.user._id)

    const totalMessages = conversation.messages.length
    const startIndex = Math.max(0, totalMessages - page * limit)
    const messages = conversation.messages.slice(startIndex, startIndex + Number(limit))

    if (markMessagesAsSeen(conversation, req.user._id)) {
        await conversation.save()
    }

    res.status(200).json({
        messages,
        total: totalMessages,
        hasMore: startIndex > 0,
    })
}

const sendMessage = async (req, res) => {
    const { text, fileUrl, fileType } = req.body
    ensure(text?.trim() || fileUrl, 400, "Message cannot be empty")

    const conversation = await getConversationOrThrow(req.params.conversationId)
    ensureParticipant(conversation, req.user._id)

    conversation.messages.push({
        sender: req.user._id,
        text: text?.trim() || "",
        fileUrl: fileUrl || "",
        fileType: fileType || "",
        seen: false,
    })

    conversation.lastMessage = {
        text: text || "File",
        sender: req.user._id,
        createdAt: new Date(),
    }

    conversation.participants.forEach((participantId) => {
        if (participantId.toString() !== req.user._id.toString()) {
            const currentUnreadCount = conversation.unreadCount?.get?.(participantId.toString()) || 0
            conversation.unreadCount?.set?.(participantId.toString(), currentUnreadCount + 1)
        }
    })

    await conversation.save()

    await conversation.populate("messages.sender", "name profilePic")

    res.status(201).json({
        message: conversation.messages[conversation.messages.length - 1],
    })
}

const getUnreadCount = async (req, res) => {
    const userId = req.user._id.toString()
    const conversations = await Conversation.find({ participants: userId })

    const unreadCount = conversations.reduce((total, conversation) => (
        total + (conversation.unreadCount?.get?.(userId) || 0)
    ), 0)

    res.status(200).json({ unreadCount })
}

const deleteConversation = async (req, res) => {
    const conversation = await getConversationOrThrow(req.params.conversationId)
    ensureParticipant(conversation, req.user._id)

    conversation.messages = []
    conversation.lastMessage = {}
    await conversation.save()

    res.status(200).json({
        success: true,
        message: "Chat cleared",
    })
}

const chatController = {
    getOrCreateConversation,
    getMyConversations,
    getMessages,
    sendMessage,
    getUnreadCount,
    deleteConversation,
}

export default chatController
