import { useState, useEffect, useRef, useCallback, memo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import {
    getMyConversations, getMessages, sendMessage,
    setActiveConversation, receiveMessage,
    setOnlineUsers, setUserTyping, clearUserTyping,
    resetConversationUnread, markConversationSeen,
} from "../features/ChatsAndMessages/chatSlice"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import { initSocket } from "../utils/socketManager"

const MotionPanel = motion.div

// ─────────────────────────────────────────────────────────────
// Pure Utility Functions
// ─────────────────────────────────────────────────────────────
const formatTime = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const now = new Date()
    if (d.toDateString() === now.toDateString())
        return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

const getInitials = (name = "") =>
    name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

const AVATAR_GRADIENTS = [
    "from-blue-500 to-cyan-500",
    "from-violet-500 to-purple-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
]

const getAvatarGradient = (name = "") =>
    AVATAR_GRADIENTS[(name.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length]

// ─────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────
const AVATAR_SIZES = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-14 h-14 text-lg",
}

const Avatar = memo(function Avatar({ user, size = "md", onlineUsers = [] }) {
    const sizeClass = AVATAR_SIZES[size] || AVATAR_SIZES.md
    const isOnline = onlineUsers.includes(user?._id?.toString())
    const gradient = getAvatarGradient(user?.name)

    return (
        <div className="relative flex-shrink-0">
            {user?.profilePic ? (
                <img
                    src={user.profilePic}
                    alt={user.name}
                    className={`${sizeClass} rounded-2xl object-cover ring-2 ring-white/10`}
                />
            ) : (
                <div className={`${sizeClass} rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-lg`}>
                    {getInitials(user?.name)}
                </div>
            )}
            {isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0f172a]" />
            )}
        </div>
    )
})

// ─────────────────────────────────────────────────────────────
// Skeleton Loader (Bonus)
// ─────────────────────────────────────────────────────────────
const MessageSkeleton = memo(function MessageSkeleton() {
    return (
        <div className="flex flex-col gap-3 px-4 py-4 animate-pulse">
            {[false, true, false, true, false].map((isMine, i) => (
                <div key={i} className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                    {!isMine && <div className="w-8 h-8 rounded-2xl bg-white/10 flex-shrink-0" />}
                    <div
                        className={`h-9 rounded-2xl bg-white/[0.06] ${isMine ? "w-48" : "w-36"}`}
                    />
                </div>
            ))}
        </div>
    )
})

// ─────────────────────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────────────────────
const MessageBubble = memo(function MessageBubble({ msg, isMine, showAvatar }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`flex items-end gap-2 mb-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}
        >
            {/* Avatar spacer for non-mine messages */}
            {!isMine && (
                showAvatar
                    ? <Avatar user={msg.sender} size="sm" />
                    : <div className="w-8 flex-shrink-0" />
            )}

            <div className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                {/* Image attachment */}
                {msg.fileUrl && msg.fileType === "image" && (
                    <img
                        src={msg.fileUrl}
                        alt="attachment"
                        className="max-w-[180px] sm:max-w-[220px] rounded-2xl mb-1.5 object-cover cursor-pointer hover:opacity-90 transition-all shadow-lg"
                        onClick={() => window.open(msg.fileUrl, "_blank")}
                    />
                )}

                {/* Text bubble */}
                {msg.text && (
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap shadow-lg
                        ${isMine
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-sm"
                            : "bg-white/[0.05] backdrop-blur-xl border border-white/10 text-white/90 rounded-bl-sm"
                        }`}
                    >
                        {msg.text}
                    </div>
                )}

                {/* Timestamp + seen */}
                <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMine ? "flex-row-reverse" : ""}`}>
                    <span className="text-[10px] text-white/30">{formatTime(msg.createdAt)}</span>
                    {isMine && (
                        <span className={`text-[10px] ${msg.seen ? "text-emerald-400" : "text-white/30"}`}>
                            {msg.seen ? "✓✓" : "✓"}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    )
})

// ─────────────────────────────────────────────────────────────
// Typing Indicator
// ─────────────────────────────────────────────────────────────
const TypingIndicator = memo(function TypingIndicator({ otherUser }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-end gap-2 mb-2"
        >
            <Avatar user={otherUser} size="sm" />
            <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg flex items-center gap-1">
                {[0, 150, 300].map(delay => (
                    <motion.span
                        key={delay}
                        className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: delay / 1000 }}
                    />
                ))}
            </div>
        </motion.div>
    )
})

// ─────────────────────────────────────────────────────────────
// Conversation Item
// ─────────────────────────────────────────────────────────────
const ConversationItem = memo(function ConversationItem({
    conv, isActive, onClick, other, onlineUsers, unread
}) {
    return (
        <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-4 text-left cursor-pointer border-none transition-all duration-200 border-l-[3px]
                ${isActive
                    ? "bg-gradient-to-r from-blue-500/10 to-transparent border-l-blue-500"
                    : "bg-transparent hover:bg-white/[0.03] border-l-transparent"
                }`}
        >
            <Avatar user={other} onlineUsers={onlineUsers} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${unread ? "font-bold text-white" : "font-semibold text-white/70"}`}>
                        {other?.name || "User"}
                    </p>
                    <p className="text-[10px] text-white/30 ml-2 flex-shrink-0">
                        {formatTime(conv.lastMessage?.createdAt)}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-1">
                    <p className={`text-xs truncate max-w-[160px] ${unread ? "text-white/80 font-medium" : "text-white/40"}`}>
                        {conv.lastMessage?.text || "Say hello 👋"}
                    </p>
                    {unread > 0 && (
                        <span className="ml-2 w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                            {unread > 9 ? "9+" : unread}
                        </span>
                    )}
                </div>

                {conv.project?.title && (
                    <p className="text-[10px] text-blue-400 font-medium mt-1 truncate flex items-center gap-1">
                        <span>📋</span> {conv.project.title}
                    </p>
                )}
            </div>
        </motion.button>
    )
})

// ─────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────
const Sidebar = memo(function Sidebar({
    conversations, activeConversation, onlineUsers,
    search, onSearchChange, onSelectConversation, getOther,
    hasActiveConversation, onCloseSidebar,
}) {
    const filtered = conversations.filter(conv => {
        const other = getOther(conv)
        return !search || other?.name?.toLowerCase().includes(search.toLowerCase())
    })

    return (
        <div className="h-full flex flex-col bg-[#0f172a]">
            {/* Sidebar Header */}
            <div className="px-5 pt-6 pb-4 border-b border-white/5 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-extrabold text-white">Messages</h2>
                    <div className="flex items-center gap-3">
                        <span className="relative flex w-2 h-2">
                            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                            <span className="relative rounded-full bg-emerald-400 w-2 h-2" />
                        </span>
                        {hasActiveConversation && (
                            <button
                                onClick={onCloseSidebar}
                                className="sm:hidden px-3 py-2 text-[11px] font-bold text-white bg-white/5 border border-white/10 rounded-xl"
                            >
                                Back to chat
                            </button>
                        )}
                    </div>
                </div>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">🔍</span>
                    <input
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 bg-white/[0.03] border border-white/10 rounded-xl outline-none focus:bg-white/[0.06] focus:border-white/20 transition-all"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
                {filtered.length === 0 ? (
                    <div className="py-16 text-center px-6">
                        <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">💬</div>
                        <p className="text-white/50 text-sm font-semibold">No conversations yet</p>
                        <p className="text-white/30 text-xs mt-1">Message a freelancer from their profile</p>
                    </div>
                ) : (
                    filtered.map(conv => {
                        const other = getOther(conv)
                        return (
                            <ConversationItem
                                key={conv._id}
                                conv={conv}
                                isActive={activeConversation?._id === conv._id}
                                onClick={() => onSelectConversation(conv)}
                                other={other}
                                onlineUsers={onlineUsers}
                                unread={conv.unreadCount || 0}
                            />
                        )
                    })
                )}
            </div>
        </div>
    )
})

// ─────────────────────────────────────────────────────────────
// Chat Header
// ─────────────────────────────────────────────────────────────
const ChatHeader = memo(function ChatHeader({
    otherUser, onlineUsers, activeConversation, onBack
}) {
    const isOnline = onlineUsers.includes(otherUser?._id?.toString())

    return (
        <div className="sticky top-0 z-10 px-4 py-3 sm:py-4 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/5 flex items-center gap-3 flex-shrink-0">
            {/* Back button — mobile only */}
            <button
                onClick={onBack}
                className="sm:hidden w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer border-none flex-shrink-0"
            >
                ←
            </button>

            <Avatar user={otherUser} size="lg" onlineUsers={onlineUsers} />

            <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{otherUser?.name || "User"}</p>
                <p className={`text-xs font-medium flex items-center gap-1 ${isOnline ? "text-emerald-400" : "text-white/30"}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-white/30"}`} />
                    {isOnline ? "Online" : "Offline"}
                    {activeConversation?.project?.title && (
                        <span className="text-blue-400 truncate"> · 📋 {activeConversation.project.title}</span>
                    )}
                </p>
            </div>

            {otherUser?._id && (
                <Link
                    to={`/profile/${otherUser._id}`}
                    className="text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 px-3 sm:px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all no-underline flex-shrink-0"
                >
                    👤 <span className="hidden sm:inline">Profile</span>
                </Link>
            )}
        </div>
    )
})

// ─────────────────────────────────────────────────────────────
// Messages List
// ─────────────────────────────────────────────────────────────
const MessagesList = memo(function MessagesList({
    messages, msgLoading, otherUser, userId, isOtherTyping, messagesEndRef, messageListRef
}) {
    return (
        <div
            ref={messageListRef}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-4 py-4 bg-[#020617]"
        >
            {msgLoading ? (
                <MessageSkeleton />
            ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <div className="text-4xl mb-3">👋</div>
                    <p className="text-white/60 text-sm font-semibold">Start the conversation!</p>
                    <p className="text-white/30 text-xs mt-1">
                        Say hello to {otherUser?.name?.split(" ")[0]}
                    </p>
                </div>
            ) : (
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => {
                        const senderId = (msg.sender?._id || msg.sender)?.toString()
                        const isMine = senderId === userId?.toString()

                        const prevSenderId = (messages[i - 1]?.sender?._id || messages[i - 1]?.sender)?.toString()
                        const showAvatar = i === 0 || prevSenderId !== senderId

                        return (
                            <MessageBubble
                                key={msg._id || i}
                                msg={msg}
                                isMine={isMine}
                                showAvatar={showAvatar}
                            />
                        )
                    })}
                </AnimatePresence>
            )}

            <AnimatePresence>
                {isOtherTyping && <TypingIndicator otherUser={otherUser} />}
            </AnimatePresence>

            <div ref={messagesEndRef} />
        </div>
    )
})

// ─────────────────────────────────────────────────────────────
// Message Input
// ─────────────────────────────────────────────────────────────
const MessageInput = memo(function MessageInput({
    text, onChange, onSend, onKeyDown, sendLoading
}) {
    return (
        <div className="px-3 sm:px-4 py-3 sm:py-4 bg-[#0f172a]/80 backdrop-blur-xl border-t border-white/5 flex-shrink-0">
            <div className="flex items-end gap-2 sm:gap-3 bg-white/[0.03] border border-white/10 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <textarea
                    value={text}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    style={{ fontFamily: "inherit", resize: "none" }}
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none max-h-28 py-1.5 min-h-[24px]"
                />
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onSend}
                    disabled={!text.trim() || sendLoading}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-all border-none font-bold
                        ${text.trim() && !sendLoading
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white cursor-pointer shadow-lg shadow-blue-500/20"
                            : "bg-white/5 text-white/30 cursor-not-allowed"
                        }`}
                >
                    {sendLoading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : "↑"}
                </motion.button>
            </div>
            <p className="text-[10px] text-white/20 mt-2 text-center select-none">
                Enter to send · Shift+Enter for new line
            </p>
        </div>
    )
})

// ─────────────────────────────────────────────────────────────
// Empty Chat State
// ─────────────────────────────────────────────────────────────
const EmptyChatState = memo(function EmptyChatState({ onOpenSidebar }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl flex items-center justify-center text-5xl mb-6"
            >
                💬
            </motion.div>
            <h3 className="text-2xl font-extrabold text-white mb-2">Select a conversation</h3>
            <p className="text-white/40 text-sm max-w-xs mb-6">
                Choose from the sidebar or message a freelancer from their profile.
            </p>
            {/* Mobile: open sidebar button */}
            <button
                onClick={onOpenSidebar}
                className="sm:hidden px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 border-none cursor-pointer"
            >
                View Conversations
            </button>
        </div>
    )
})

// ─────────────────────────────────────────────────────────────
// Auth Loading Skeleton
// ─────────────────────────────────────────────────────────────
const AuthLoadingScreen = () => (
    <div
        className="flex h-[calc(100dvh-3.5rem)] bg-[#020617] overflow-hidden sm:h-[calc(100dvh-4rem)]"
    >
        {/* Sidebar skeleton */}
        <div className="hidden sm:flex flex-col w-72 lg:w-80 bg-[#0f172a] border-r border-white/5 animate-pulse">
            <div className="px-5 pt-6 pb-4 border-b border-white/5">
                <div className="h-6 w-28 bg-white/10 rounded-lg mb-4" />
                <div className="h-10 w-full bg-white/5 rounded-xl" />
            </div>
            <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-white/10 rounded w-3/4" />
                            <div className="h-2 bg-white/5 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
        {/* Chat area skeleton */}
        <div className="flex-1 flex flex-col bg-[#020617]">
            <div className="h-16 bg-[#0f172a]/80 border-b border-white/5 animate-pulse flex items-center px-4 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/10" />
                <div className="space-y-2">
                    <div className="h-3 w-24 bg-white/10 rounded" />
                    <div className="h-2 w-16 bg-white/5 rounded" />
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    </div>
)

// ─────────────────────────────────────────────────────────────
// Login Required Screen
// ─────────────────────────────────────────────────────────────
const LoginRequiredScreen = () => (
    <div
        className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center bg-[#020617] px-6 text-center sm:min-h-[calc(100dvh-4rem)]"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
        <MotionPanel
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl flex items-center justify-center text-4xl mb-6"
        >
            🔒
        </MotionPanel>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-2xl font-extrabold text-white mb-2">Login Required</h2>
            <p className="text-white/40 text-sm mb-6 max-w-xs">
                You need to be logged in to access messages.
            </p>
            <Link
                to="/login"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 no-underline hover:-translate-y-0.5 transition-all"
            >
                Go to Login →
            </Link>
        </motion.div>
    </div>
)

// ─────────────────────────────────────────────────────────────
// ChatPage (Main)
// ─────────────────────────────────────────────────────────────
const ChatPageContent = ({ user }) => {
    const dispatch = useDispatch()
    const {
        conversations, activeConversation, messages,
        onlineUsers, typingUsers, msgLoading, sendLoading,
    } = useSelector(s => s.chat)

    const [text, setText] = useState("")
    const [search, setSearch] = useState("")
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window === "undefined") return true
        return window.innerWidth >= 640
    })

    const typingTimerRef = useRef(null)
    const isTypingRef = useRef(false)
    const messagesEndRef = useRef(null)
    const messageListRef = useRef(null)
    const inputRef = useRef(null)
    const socketRef = useRef(null)
    const addedMsgIds = useRef(new Set())
    const didRestoreRef = useRef(false)
    const shouldAnimateScrollRef = useRef(false)

    // ── Socket: init once ────────────────────────────────────
    useEffect(() => {
        if (!user?.token) return

        const sock = initSocket(user.token)
        socketRef.current = sock

        // Clean listeners before attaching to avoid duplicates
        const events = [
            "connect", "receive_message", "online_users",
            "user_typing", "user_stopped_typing",
            "messages_seen", "new_message_notification",
        ]
        events.forEach(e => sock.off(e))

        sock.on("receive_message", (data) => {
            const msgId = data.message?._id
            if (msgId && addedMsgIds.current.has(msgId)) return
            if (msgId) addedMsgIds.current.add(msgId)
            dispatch(receiveMessage(data))
        })

        sock.on("online_users", (users) => dispatch(setOnlineUsers(users)))
        sock.on("user_typing", ({ userId, conversationId }) =>
            dispatch(setUserTyping({ conversationId, userId })))
        sock.on("user_stopped_typing", ({ userId, conversationId }) =>
            dispatch(clearUserTyping({ conversationId, userId })))
        sock.on("messages_seen", ({ conversationId }) =>
            dispatch(markConversationSeen(conversationId)))
        sock.on("new_message_notification", ({ from, preview }) =>
            toast.info(`💬 ${from}: ${preview}`, { autoClose: 3000, toastId: "chat-notif" }))

        return () => events.forEach(e => sock.off(e))
    }, [user?.token, dispatch])

    useEffect(() => {
        const previousBodyOverflow = document.body.style.overflow
        const previousHtmlOverflow = document.documentElement.style.overflow

        document.body.style.overflow = "hidden"
        document.documentElement.style.overflow = "hidden"

        return () => {
            document.body.style.overflow = previousBodyOverflow
            document.documentElement.style.overflow = previousHtmlOverflow
        }
    }, [])

    // Load conversations — only when authenticated
    // Prevents 401 errors firing before auth resolves
    useEffect(() => {
        if (!user?.token) return
        dispatch(getMyConversations())
    }, [user?.token, dispatch])

    // ── Restore last active conversation ─────────────────────
    useEffect(() => {
        if (!conversations?.length || didRestoreRef.current) return
        const savedId = localStorage.getItem("activeConversationId")
        if (!savedId) return
        const found = conversations.find(c => c._id === savedId)
        if (found) {
            didRestoreRef.current = true
            dispatch(setActiveConversation(found))
        }
    }, [conversations, dispatch])

    // ── On conversation change ───────────────────────────────
    useEffect(() => {
        if (!activeConversation?._id) return
        addedMsgIds.current = new Set()
        shouldAnimateScrollRef.current = false
        dispatch(getMessages({ conversationId: activeConversation._id }))
        dispatch(resetConversationUnread(activeConversation._id))
        socketRef.current?.emit("join_conversation", activeConversation._id)
        socketRef.current?.emit("mark_seen", { conversationId: activeConversation._id })
        inputRef.current?.focus()
        localStorage.setItem("activeConversationId", activeConversation._id)
    }, [activeConversation?._id, dispatch])

    // ── Dedup: seed set after messages load ──────────────────
    useEffect(() => {
        messages.forEach(msg => { if (msg._id) addedMsgIds.current.add(msg._id) })
    }, [messages])

    // ── Auto-scroll on new message ───────────────────────────
    useEffect(() => {
        const container = messageListRef.current
        if (!container) return

        const behavior = shouldAnimateScrollRef.current ? "smooth" : "auto"
        container.scrollTo({ top: container.scrollHeight, behavior })
        shouldAnimateScrollRef.current = true
    }, [messages])

    // ─────────────────────────────────────────────────────────
    // Handlers
    // ─────────────────────────────────────────────────────────
    const getOther = useCallback((conv) => {
        const myId = user?._id?.toString()
        if (!myId) return conv?.participants?.[0]
        return conv?.participants?.find(
            p => (p._id || p).toString() !== myId
        ) || conv?.participants?.[0]
    }, [user?._id])

    const handleSelectConversation = useCallback((conv) => {
        if (activeConversation?._id === conv._id) return
        dispatch(setActiveConversation(conv))
        if (window.innerWidth < 640) setSidebarOpen(false)
    }, [activeConversation?._id, dispatch])

    const handleSend = useCallback(() => {
        if (!text.trim() || !activeConversation?._id) return
        const sock = socketRef.current

        if (sock?.connected) {
            sock.emit("send_message", {
                conversationId: activeConversation._id,
                text: text.trim(),
            })
        } else {
            dispatch(sendMessage({
                conversationId: activeConversation._id,
                text: text.trim(),
            }))
        }

        setText("")
        sock?.emit("typing_stop", { conversationId: activeConversation._id })
        isTypingRef.current = false
        clearTimeout(typingTimerRef.current)
    }, [text, activeConversation, dispatch])

    const handleTyping = useCallback((e) => {
        setText(e.target.value)
        if (!activeConversation?._id) return

        if (!isTypingRef.current) {
            isTypingRef.current = true
            socketRef.current?.emit("typing_start", { conversationId: activeConversation._id })
        }

        clearTimeout(typingTimerRef.current)
        typingTimerRef.current = setTimeout(() => {
            isTypingRef.current = false
            socketRef.current?.emit("typing_stop", { conversationId: activeConversation._id })
        }, 1500)
    }, [activeConversation])

    const handleKeyDown = useCallback((e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }, [handleSend])

    // ─────────────────────────────────────────────────────────
    // Derived State
    // ─────────────────────────────────────────────────────────
    const otherUser = activeConversation ? getOther(activeConversation) : null
    const isOtherTyping = (typingUsers[activeConversation?._id] || [])
        .filter(id => id !== user?._id).length > 0

    const safeConversations = conversations || []

    // ─────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────
    return (
        <div
            className="flex h-[calc(100dvh-3.5rem)] bg-[#020617] overflow-hidden sm:h-[calc(100dvh-4rem)]"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
            {/*
             * LAYOUT STRATEGY
             * ─────────────────────────────────────────────
             * Mobile  : sidebar covers full screen OR chat covers full screen (toggle)
             * Tablet  : sidebar is fixed 280px, chat fills rest
             * Desktop : sidebar is 320px, chat fills rest
             */}

            {/* ── SIDEBAR ────────────────────────────────── */}
            <AnimatePresence>
                {(sidebarOpen || !activeConversation) && (
                    <motion.aside
                        key="sidebar"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`
                            flex-shrink-0 border-r border-white/5
                            /* Mobile: full screen overlay */
                            absolute inset-0 z-20 w-full
                            /* Tablet+: fixed sidebar width */
                            sm:relative sm:inset-auto sm:z-auto sm:w-72
                            /* Desktop: slightly wider */
                            lg:w-80
                        `}
                    >
                        <Sidebar
                            conversations={safeConversations}
                            activeConversation={activeConversation}
                            onlineUsers={onlineUsers}
                            search={search}
                            onSearchChange={setSearch}
                            onSelectConversation={handleSelectConversation}
                            getOther={getOther}
                            hasActiveConversation={Boolean(activeConversation)}
                            onCloseSidebar={() => setSidebarOpen(false)}
                        />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ── CHAT PANEL ─────────────────────────────── */}
            <main className={`
                flex-1 flex flex-col min-w-0 min-h-0
                /* On mobile: show either sidebar or active chat, never both */
                ${!activeConversation || sidebarOpen ? "hidden sm:flex" : "flex"}
            `}>
                {!activeConversation ? (
                    <EmptyChatState onOpenSidebar={() => setSidebarOpen(true)} />
                ) : (
                    <>
                        <ChatHeader
                            otherUser={otherUser}
                            onlineUsers={onlineUsers}
                            activeConversation={activeConversation}
                            onBack={() => setSidebarOpen(true)}
                        />
                        <MessagesList
                            messages={messages || []}
                            msgLoading={msgLoading}
                            otherUser={otherUser}
                            userId={user?._id}
                            isOtherTyping={isOtherTyping}
                            messagesEndRef={messagesEndRef}
                            messageListRef={messageListRef}
                        />
                        <MessageInput
                            text={text}
                            onChange={handleTyping}
                            onSend={handleSend}
                            onKeyDown={handleKeyDown}
                            sendLoading={sendLoading}
                        />
                    </>
                )}
            </main>
        </div>
    )
}

const ChatPage = () => {
    const { user, loading: authLoading, isLoading } = useSelector(s => s.auth)

    const authPending = authLoading || isLoading
    if (authPending && !user) return <AuthLoadingScreen />
    if (!user?._id) return <LoginRequiredScreen />

    return <ChatPageContent user={user} />
}

export default ChatPage
