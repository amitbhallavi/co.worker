import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "../api/axiosInstance"

const initialState = {
    conversations: [],
    activeConversation: null,
    messages: [],
    onlineUsers: [],
    typingUsers: {},
    unreadTotal: 0,
    convoLoading: false,
    msgLoading: false,
    sendLoading: false,
    chatError: false,
    chatErrorMsg: "",
}

const authHeader = (thunkAPI) => ({
    authorization: `Bearer ${thunkAPI.getState().auth.user?.token}`,
})

export const getOrCreateConversation = createAsyncThunk(
    "chat/GET_OR_CREATE",
    async ({ receiverId, projectId }, thunkAPI) => {
        try {
            const res = await axios.post(
                "/api/chat/conversation",
                { receiverId, projectId },
                { headers: authHeader(thunkAPI) }
            )
            return res.data.conversation
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
        }
    }
)

export const getMyConversations = createAsyncThunk(
    "chat/GET_CONVERSATIONS",
    async (_, thunkAPI) => {
        try {
            const res = await axios.get("/api/chat/conversations", { headers: authHeader(thunkAPI) })
            return res.data.conversations
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
        }
    }
)

export const getMessages = createAsyncThunk(
    "chat/GET_MESSAGES",
    async ({ conversationId, page = 1 }, thunkAPI) => {
        try {
            const res = await axios.get(
                `/api/chat/conversation/${conversationId}/messages?page=${page}`,
                { headers: authHeader(thunkAPI) }
            )
            return { messages: res.data.messages, page }
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
        }
    }
)

export const sendMessage = createAsyncThunk(
    "chat/SEND_MESSAGE",
    async ({ conversationId, text, fileUrl, fileType }, thunkAPI) => {
        try {
            const res = await axios.post(
                `/api/chat/conversation/${conversationId}/message`,
                { text, fileUrl, fileType },
                { headers: authHeader(thunkAPI) }
            )
            return { conversationId, message: res.data.message }
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
        }
    }
)

export const getUnreadCount = createAsyncThunk("chat/GET_UNREAD", async (_, thunkAPI) => {
    try {
        const res = await axios.get("/api/chat/unread", { headers: authHeader(thunkAPI) })
        return res.data.unreadCount
    } catch {
        return 0
    }
})

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setActiveConversation: (state, action) => {
            state.activeConversation = action.payload
            state.messages = []
        },

        receiveMessage: (state, action) => {
            const { conversationId, message } = action.payload

            if (state.activeConversation?._id === conversationId) {
                state.messages.push(message)
            }

            const isActive = state.activeConversation?._id === conversationId
            state.conversations = state.conversations.map((conv) =>
                conv._id === conversationId
                    ? {
                        ...conv,
                        lastMessage: { text: message.text, createdAt: message.createdAt },
                        unreadCount: isActive ? 0 : (conv.unreadCount || 0) + 1,
                    }
                    : conv
            )
        },

        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload
        },

        setUserTyping: (state, action) => {
            const { conversationId, userId } = action.payload
            const current = state.typingUsers[conversationId] || []
            if (!current.includes(userId)) {
                state.typingUsers[conversationId] = [...current, userId]
            }
        },

        clearUserTyping: (state, action) => {
            const { conversationId, userId } = action.payload
            state.typingUsers[conversationId] = (state.typingUsers[conversationId] || []).filter(
                (id) => id !== userId
            )
        },

        resetConversationUnread: (state, action) => {
            const convId = action.payload
            state.conversations = state.conversations.map((conv) =>
                conv._id === convId ? { ...conv, unreadCount: 0 } : conv
            )
        },

        markConversationSeen: (state) => {
            state.messages = state.messages.map((msg) => ({ ...msg, seen: true }))
        },

        clearChatError: (state) => {
            state.chatError = false
            state.chatErrorMsg = ""
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMyConversations.pending, (state) => {
                state.convoLoading = true
            })
            .addCase(getMyConversations.fulfilled, (state, action) => {
                state.convoLoading = false
                state.conversations = action.payload
            })
            .addCase(getMyConversations.rejected, (state, action) => {
                state.convoLoading = false
                state.chatError = true
                state.chatErrorMsg = action.payload
            })

            .addCase(getOrCreateConversation.fulfilled, (state, action) => {
                state.activeConversation = action.payload
                const exists = state.conversations.find((c) => c._id === action.payload._id)
                if (!exists) state.conversations.unshift(action.payload)
            })

            .addCase(getMessages.pending, (state) => {
                state.msgLoading = true
            })
            .addCase(getMessages.fulfilled, (state, action) => {
                state.msgLoading = false
                if (action.payload.page === 1) {
                    state.messages = action.payload.messages
                } else {
                    state.messages = [...action.payload.messages, ...state.messages]
                }
            })
            .addCase(getMessages.rejected, (state) => {
                state.msgLoading = false
            })

            .addCase(sendMessage.pending, (state) => {
                state.sendLoading = true
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.sendLoading = false
                const alreadyExists = state.messages.find((m) => m._id === action.payload.message._id)
                if (!alreadyExists) {
                    state.messages.push(action.payload.message)
                }
            })
            .addCase(sendMessage.rejected, (state) => {
                state.sendLoading = false
            })

            .addCase(getUnreadCount.fulfilled, (state, action) => {
                state.unreadTotal = action.payload
            })
    },
})

export const {
    setActiveConversation,
    receiveMessage,
    setOnlineUsers,
    setUserTyping,
    clearUserTyping,
    resetConversationUnread,
    markConversationSeen,
    clearChatError,
} = chatSlice.actions

export default chatSlice.reducer