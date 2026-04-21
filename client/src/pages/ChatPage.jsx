import { useState, useEffect, useRef, useCallback, memo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { io } from "socket.io-client"
import {
    getMyConversations, getMessages, sendMessage,
    setActiveConversation, receiveMessage,
    setOnlineUsers, setUserTyping, clearUserTyping,
    resetConversationUnread, markConversationSeen,
} from "../features/ChatsAndMessages/chatSlice"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"

// ── Socket singleton ───────────────────────────────────────
let _socketInstance = null

const getSocket = (token) => {
    if (_socketInstance?.connected) return _socketInstance
    if (_socketInstance) {
        _socketInstance.auth = { token }
        _socketInstance.connect()
        return _socketInstance
    }
    _socketInstance = io(import.meta.env.VITE_API_URL || window.location.origin, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        transports: ["websocket", "polling"],
        autoConnect: false,
    })
    _socketInstance.connect()
    return _socketInstance
}

export const disconnectSocket = () => {
    if (_socketInstance) {
        _socketInstance.disconnect()
        _socketInstance = null
    }
}

// ── Helpers ────────────────────────────────────────────────
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

// ── Avatar ─────────────────────────────────────────────────
const Avatar = memo(function Avatar({ user, size = "md", onlineUsers = [] }) {
    const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-12 h-12 text-sm"
    const isOnline = onlineUsers.includes(user?._id?.toString())
    const gradients = ["from-blue-500 to-cyan-500", "from-violet-500 to-purple-500", "from-emerald-500 to-teal-500", "from-orange-500 to-amber-500", "from-pink-500 to-rose-500"]
    const gradient = gradients[(user?.name?.charCodeAt(0) || 0) % gradients.length]

    return (
        <div className="relative flex-shrink-0">
            {user?.profilePic ? (
                <img src={user.profilePic} alt={user.name} className={`${sz} rounded-2xl object-cover ring-2 ring-white/10`} />
            ) : (
                <div className={`${sz} rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-lg`}>
                    {getInitials(user?.name)}
                </div>
            )}
            {isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0f172a]" />
            )}
        </div>
    )
})

// ── Message bubble ─────────────────────────────────────────
const MessageBubble = memo(function MessageBubble({ msg, isMine, showAvatar }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`flex items-end gap-2 mb-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}
        >
            {!isMine ? showAvatar ? <Avatar user={msg.sender} size="sm" /> : <div className="w-8 flex-shrink-0" /> : null}
            <div className={`max-w-[75%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                {msg.fileUrl && msg.fileType === "image" && (
                    <img src={msg.fileUrl} alt="attachment"
                        className="max-w-[220px] rounded-2xl mb-1.5 object-cover cursor-pointer hover:opacity-90 transition-all shadow-lg"
                        onClick={() => window.open(msg.fileUrl, "_blank")} />
                )}
                {msg.text && (
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap shadow-lg
                        ${isMine
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-sm"
                            : "bg-white/[0.05] backdrop-blur-xl border border-white/10 text-white/90 rounded-bl-sm"
                        }`}>
                        {msg.text}
                    </div>
                )}
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

// ── Conversation Item ───────────────────────────────────────
const ConversationItem = memo(function ConversationItem({ conv, isActive, onClick, other, onlineUsers, unread }) {
    return (
        <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-4 text-left cursor-pointer border-none transition-all duration-200 border-l-3
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

// ── Typing Indicator ────────────────────────────────────────
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
                {[0, 150, 300].map(d => (
                    <motion.span
                        key={d}
                        className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: d / 150 }}
                    />
                ))}
            </div>
        </motion.div>
    )
})

// ── Chat Header ─────────────────────────────────────────────
const ChatHeader = memo(function ChatHeader({ otherUser, onlineUsers, activeConversation, onBack }) {
    const isOnline = onlineUsers.includes(otherUser?._id?.toString())

    return (
        <div className="px-4 py-4 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 flex items-center gap-3">
            <button onClick={onBack}
                className="sm:hidden w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer border-none">
                ←
            </button>
            <Avatar user={otherUser} size="lg" onlineUsers={onlineUsers} />
            <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{otherUser?.name || "User"}</p>
                <p className={`text-xs font-medium ${isOnline ? "text-emerald-400" : "text-white/30"}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${isOnline ? "bg-emerald-400" : "bg-white/30"}`} />
                    {isOnline ? "Online" : "Offline"}
                    {activeConversation.project?.title && (
                        <span className="text-blue-400"> · 📋 {activeConversation.project.title}</span>
                    )}
                </p>
            </div>
            {otherUser?._id && (
                <Link to={`/profile/${otherUser._id}`}
                    className="text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all no-underline">
                    👤 Profile
                </Link>
            )}
        </div>
    )
})

// ── Message Input ────────────────────────────────────────────
const MessageInput = memo(function MessageInput({ text, onChange, onSend, onKeyDown, sendLoading }) {
    return (
        <div className="px-4 py-4 bg-[#0f172a]/80 backdrop-blur-xl border-t border-white/5">
            <div className="flex items-end gap-3 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <textarea
                    value={text}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    style={{ fontFamily: "inherit", resize: "none" }}
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none max-h-32 py-1.5"
                />
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onSend}
                    disabled={!text.trim() || sendLoading}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-all border-none font-bold
                        ${text.trim() && !sendLoading
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white cursor-pointer shadow-lg shadow-blue-500/20"
                            : "bg-white/5 text-white/30 cursor-not-allowed"
                        }`}
                >
                    {sendLoading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        "↑"
                    )}
                </motion.button>
            </div>
            <p className="text-[10px] text-white/20 mt-2 text-center select-none">
                Enter to send · Shift+Enter for new line
            </p>
        </div>
    )
})

// ══════════════════════════════════════════════════════════
const ChatPage = () => {
    const dispatch = useDispatch()
    const { user } = useSelector(s => s.auth)
    const {
        conversations, activeConversation, messages,
        onlineUsers, typingUsers, msgLoading, sendLoading
    } = useSelector(s => s.chat)

    const [text, setText] = useState("")
    const [search, setSearch] = useState("")
    const [showSidebar, setShowSidebar] = useState(true)
    const [isTyping, setIsTyping] = useState(false)

    const typingTimerRef = useRef(null)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const socketRef = useRef(null)
    const addedMsgIds = useRef(new Set())
    const didRestoreRef = useRef(false)

    // ── Init socket ONCE ─────────────────────────────────────
    useEffect(() => {
        if (!user?.token) return

        const sock = getSocket(user.token)
        socketRef.current = sock

        sock.off("connect")
        sock.off("receive_message")
        sock.off("online_users")
        sock.off("user_typing")
        sock.off("user_stopped_typing")
        sock.off("messages_seen")
        sock.off("new_message_notification")

        sock.on("connect", () => console.log("[Socket] Connected:", sock.id))

        sock.on("receive_message", (data) => {
            const msgId = data.message?._id
            if (msgId && addedMsgIds.current.has(msgId)) return
            if (msgId) addedMsgIds.current.add(msgId)
            dispatch(receiveMessage(data))
        })

        sock.on("online_users", (users) => dispatch(setOnlineUsers(users)))
        sock.on("user_typing", ({ userId, conversationId }) => dispatch(setUserTyping({ conversationId, userId })))
        sock.on("user_stopped_typing", ({ userId, conversationId }) => dispatch(clearUserTyping({ conversationId, userId })))
        sock.on("messages_seen", ({ conversationId }) => dispatch(markConversationSeen(conversationId)))

        sock.on("new_message_notification", ({ from, preview }) => {
            toast.info(`💬 ${from}: ${preview}`, { autoClose: 3000, toastId: "chat-notif" })
        })

        return () => {
            sock.off("connect")
            sock.off("receive_message")
            sock.off("online_users")
            sock.off("user_typing")
            sock.off("user_stopped_typing")
            sock.off("messages_seen")
            sock.off("new_message_notification")
        }
    }, [user?.token, dispatch])

    // ── Load conversations on mount ──────────────────────────
    useEffect(() => { dispatch(getMyConversations()) }, [dispatch])

    // ── Restore activeConversation from localStorage ONCE ─────
    useEffect(() => {
        if ((conversations || []).length === 0 || didRestoreRef.current) return

        const savedId = localStorage.getItem("activeConversationId")
        if (!savedId) return

        const found = conversations.find(c => c._id === savedId)
        if (found) {
            didRestoreRef.current = true
            dispatch(setActiveConversation(found))
        }
    }, [conversations, dispatch])

    // ── Load messages when conversation changes ────────────────
    useEffect(() => {
        if (!activeConversation?._id) return

        addedMsgIds.current = new Set()
        dispatch(getMessages({ conversationId: activeConversation._id }))
        dispatch(resetConversationUnread(activeConversation._id))
        socketRef.current?.emit("join_conversation", activeConversation._id)
        socketRef.current?.emit("mark_seen", { conversationId: activeConversation._id })
        inputRef.current?.focus()
        localStorage.setItem("activeConversationId", activeConversation._id)
    }, [activeConversation?._id, dispatch])

    // ── Seed dedup set after messages load ───────────────────
    useEffect(() => {
        messages.forEach(msg => { if (msg._id) addedMsgIds.current.add(msg._id) })
    }, [messages])

    // ── Auto-scroll ──────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // ── Select conversation ──────────────────────────────────
    const handleSelect = (conv) => {
        if (activeConversation?._id === conv._id) return
        dispatch(setActiveConversation(conv))
        // sidebar stays open
    };

    // ── Send message ─────────────────────────────────────────
    const handleSend = useCallback(() => {
        if (!text.trim() || !activeConversation?._id) return
        const sock = socketRef.current

        if (sock?.connected) {
            sock.emit("send_message", { conversationId: activeConversation._id, text: text.trim() })
        } else {
            dispatch(sendMessage({ conversationId: activeConversation._id, text: text.trim() }))
        }

        setText("")
        sock?.emit("typing_stop", { conversationId: activeConversation._id })
        setIsTyping(false)
        clearTimeout(typingTimerRef.current)
    }, [text, activeConversation, dispatch]);

    // ── Typing ───────────────────────────────────────────────
    const handleTyping = (e) => {
        setText(e.target.value)
        if (!activeConversation?._id) return
        if (!isTyping) {
            setIsTyping(true)
            socketRef.current?.emit("typing_start", { conversationId: activeConversation._id })
        }
        clearTimeout(typingTimerRef.current)
        typingTimerRef.current = setTimeout(() => {
            setIsTyping(false)
            socketRef.current?.emit("typing_stop", { conversationId: activeConversation._id })
        }, 1500)
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
    };

    // ── Helpers ──────────────────────────────────────────────
    const getOther = (conv) =>
        conv?.participants?.find(p => (p._id || p).toString() !== user._id.toString()) || conv?.participants?.[0]

    const filtered = (conversations || []).filter(conv => {
        const other = getOther(conv)
        return !search || other?.name?.toLowerCase().includes(search.toLowerCase())
    })

    const otherUser = getOther(activeConversation)
    const isOtherTyping = (typingUsers[activeConversation?._id] || []).filter(id => id !== user?._id).length > 0

    return (
        <div className="h-screen flex bg-[#020617] overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ══ SIDEBAR ══════════════════════════════════ */}
            <AnimatePresence>
                {(showSidebar || !activeConversation) && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`flex-shrink-0 w-full sm:w-80 bg-[#0f172a] border-r border-white/5 flex flex-col ${showSidebar ? "flex" : "hidden sm:flex"}`}
                    >
                        {/* Header */}
                        <div className="px-5 pt-6 pb-4 border-b border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-extrabold text-white">Messages</h2>
                                <span className="relative flex w-2 h-2">
                                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                                    <span className="relative rounded-full bg-emerald-400 w-2 h-2" />
                                </span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">🔍</span>
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search conversations..."
                                    className="w-full pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 bg-white/[0.03] border border-white/10 rounded-xl outline-none focus:bg-white/[0.06] focus:border-white/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Conversation List */}
                        <div className="flex-1 overflow-y-auto">
                            {filtered.length === 0 ? (
                                <div className="py-16 text-center px-6">
                                    <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">💬</div>
                                    <p className="text-white/50 text-sm font-semibold">No conversations yet</p>
                                    <p className="text-white/30 text-xs mt-1">Message a freelancer from their profile</p>
                                </div>
                            ) : (
                                filtered.map(conv => {
                                    const other = getOther(conv)
                                    const isActive = activeConversation?._id === conv._id
                                    const unread = conv.unreadCount || 0

                                    return (
                                        <ConversationItem
                                            key={conv._id}
                                            conv={conv}
                                            isActive={isActive}
                                            onClick={() => handleSelect(conv)}
                                            other={other}
                                            onlineUsers={onlineUsers}
                                            unread={unread}
                                        />
                                    )
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══ CHAT WINDOW ══════════════════════════════ */}
            <div className={`flex-1 flex flex-col min-w-0 ${showSidebar && activeConversation ? "hidden sm:flex" : "flex"}`}>
                {!activeConversation ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl flex items-center justify-center text-5xl mb-6">
                            💬
                        </motion.div>
                        <h3 className="text-2xl font-extrabold text-white mb-2">Select a conversation</h3>
                        <p className="text-white/40 text-sm max-w-xs">Choose from the sidebar or message a freelancer from their profile.</p>
                    </div>
                ) : (
                    <>
                        <ChatHeader
                            otherUser={otherUser}
                            onlineUsers={onlineUsers}
                            activeConversation={activeConversation}
                            onBack={() => setShowSidebar(true)}
                        />

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#020617]">
                            {msgLoading && (
                                <div className="flex justify-center py-8">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}

                            {!msgLoading && (messages || []).length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                                    <div className="text-4xl mb-3">👋</div>
                                    <p className="text-white/60 text-sm font-semibold">Start the conversation!</p>
                                    <p className="text-white/30 text-xs mt-1">Say hello to {otherUser?.name?.split(" ")[0]}</p>
                                </div>
                            )}

                            <AnimatePresence>
                                {messages.map((msg, i) => {
                                    const isMine = (msg.sender?._id || msg.sender)?.toString() === user._id?.toString()
                                    const prevSender = messages[i - 1]?.sender?._id || messages[i - 1]?.sender
                                    const currSender = msg.sender?._id || msg.sender
                                    const showAvatar = i === 0 || prevSender?.toString() !== currSender?.toString()
                                    return <MessageBubble key={msg._id || i} msg={msg} isMine={isMine} showAvatar={showAvatar} />
                                })}
                            </AnimatePresence>

                            <AnimatePresence>
                                {isOtherTyping && <TypingIndicator otherUser={otherUser} />}
                            </AnimatePresence>

                            <div ref={messagesEndRef} />
                        </div>

                        <MessageInput
                            text={text}
                            onChange={handleTyping}
                            onSend={handleSend}
                            onKeyDown={handleKeyDown}
                            sendLoading={sendLoading}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

export default ChatPage
