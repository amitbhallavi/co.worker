import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getApiErrorMessage, getAuthToken } from "../api/apiHelpers"
import chatService from "./chatService"

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

export const getOrCreateConversation = createAsyncThunk(
    "chat/GET_OR_CREATE",
    async ({ receiverId, projectId }, thunkAPI) => {
        try {
            const response = await chatService.getOrCreateConversation(
                { receiverId, projectId },
                getAuthToken(thunkAPI)
            )

            return response.conversation
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const getMyConversations = createAsyncThunk("chat/GET_CONVERSATIONS", async (_, thunkAPI) => {
    try {
        const response = await chatService.getConversations(getAuthToken(thunkAPI))
        return response.conversations
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const getMessages = createAsyncThunk(
    "chat/GET_MESSAGES",
    async ({ conversationId, page = 1 }, thunkAPI) => {
        try {
            const response = await chatService.getMessages({ conversationId, page }, getAuthToken(thunkAPI))
            return { messages: response.messages, page }
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const sendMessage = createAsyncThunk(
    "chat/SEND_MESSAGE",
    async ({ conversationId, text, fileUrl, fileType }, thunkAPI) => {
        try {
            const response = await chatService.sendMessage(
                { conversationId, text, fileUrl, fileType },
                getAuthToken(thunkAPI)
            )

            return { conversationId, message: response.message }
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const getUnreadCount = createAsyncThunk("chat/GET_UNREAD", async (_, thunkAPI) => {
    try {
        const response = await chatService.getUnreadCount(getAuthToken(thunkAPI))
        return response.unreadCount
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
            const isActiveConversation = state.activeConversation?._id === conversationId

            if (isActiveConversation) {
                state.messages.push(message)
            }

            state.conversations = state.conversations.map((conversation) => (
                conversation._id === conversationId
                    ? {
                        ...conversation,
                        lastMessage: { text: message.text, createdAt: message.createdAt },
                        unreadCount: isActiveConversation ? 0 : (conversation.unreadCount || 0) + 1,
                    }
                    : conversation
            ))
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload
        },
        setUserTyping: (state, action) => {
            const { conversationId, userId } = action.payload
            const typingUsers = state.typingUsers[conversationId] || []

            if (!typingUsers.includes(userId)) {
                state.typingUsers[conversationId] = [...typingUsers, userId]
            }
        },
        clearUserTyping: (state, action) => {
            const { conversationId, userId } = action.payload
            state.typingUsers[conversationId] = (state.typingUsers[conversationId] || []).filter(
                (id) => id !== userId
            )
        },
        resetConversationUnread: (state, action) => {
            state.conversations = state.conversations.map((conversation) => (
                conversation._id === action.payload
                    ? { ...conversation, unreadCount: 0 }
                    : conversation
            ))
        },
        markConversationSeen: (state) => {
            state.messages = state.messages.map((message) => ({ ...message, seen: true }))
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

                if (!state.conversations.find((conversation) => conversation._id === action.payload._id)) {
                    state.conversations.unshift(action.payload)
                }
            })

            .addCase(getMessages.pending, (state) => {
                state.msgLoading = true
            })
            .addCase(getMessages.fulfilled, (state, action) => {
                state.msgLoading = false

                if (action.payload.page === 1) {
                    state.messages = action.payload.messages
                    return
                }

                state.messages = [...action.payload.messages, ...state.messages]
            })
            .addCase(getMessages.rejected, (state) => {
                state.msgLoading = false
            })

            .addCase(sendMessage.pending, (state) => {
                state.sendLoading = true
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.sendLoading = false

                if (!state.messages.find((message) => message._id === action.payload.message._id)) {
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
