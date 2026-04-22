import API from "../api/axiosInstance"
import { buildAuthConfig } from "../api/apiHelpers"

const BASE = "/api/chat"

const getOrCreateConversation = async ({ receiverId, projectId }, token) => {
    const response = await API.post(`${BASE}/conversation`, { receiverId, projectId }, buildAuthConfig(token))
    return response.data
}

const getConversations = async (token) => {
    const response = await API.get(`${BASE}/conversations`, buildAuthConfig(token))
    return response.data
}

const getMessages = async ({ conversationId, page = 1 }, token) => {
    const response = await API.get(
        `${BASE}/conversation/${conversationId}/messages?page=${page}`,
        buildAuthConfig(token)
    )
    return response.data
}

const sendMessage = async ({ conversationId, text, fileUrl, fileType }, token) => {
    const response = await API.post(
        `${BASE}/conversation/${conversationId}/message`,
        { text, fileUrl, fileType },
        buildAuthConfig(token)
    )
    return response.data
}

const getUnreadCount = async (token) => {
    const response = await API.get(`${BASE}/unread`, buildAuthConfig(token))
    return response.data
}

const chatService = {
    getOrCreateConversation,
    getConversations,
    getMessages,
    sendMessage,
    getUnreadCount,
}

export default chatService
