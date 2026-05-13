import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import Conversation from "../models/chatModel.js"
import { corsOptions } from "../config/cors.js"

const onlineUsers = new Map()
const activeRooms = new Map()

export const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: corsOptions,
    })

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token
        if (!token) {
            return next(new Error("Authentication required"))
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            socket.userId = decoded.id || decoded._id
            socket.userName = decoded.name || "User"
            next()
        } catch {
            next(new Error("Invalid token"))
        }
    })

    io.on("connection", (socket) => {
        const userId = socket.userId
        console.log(`[Socket] Connected: ${userId}`)

        socket.join(`user_${userId}`)
        onlineUsers.set(userId, socket.id)
        io.emit("online_users", Array.from(onlineUsers.keys()))

        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId)
            activeRooms.set(socket.id, conversationId)
            console.log(`[Socket] ${userId} joined room: ${conversationId}`)
        })

        socket.on("leave_conversation", (conversationId) => {
            socket.leave(conversationId)
            activeRooms.delete(socket.id)
        })

        socket.on("send_message", async (data) => {
            const { conversationId, text, fileUrl, fileType } = data

            if (!text?.trim() && !fileUrl) return

            try {
                const conversation = await Conversation.findById(conversationId)
                if (!conversation) return

                const isParticipant = conversation.participants.some(
                    (p) => p.toString() === userId
                )
                if (!isParticipant) return

                let immediatelySeen = false
                conversation.participants.forEach((pid) => {
                    if (pid.toString() !== userId) {
                        const receiverSid = onlineUsers.get(pid.toString())
                        if (receiverSid && activeRooms.get(receiverSid) === conversationId) {
                            immediatelySeen = true
                        }
                    }
                })

                const newMsg = {
                    sender: userId,
                    text: text?.trim() || "",
                    fileUrl: fileUrl || "",
                    fileType: fileType || "",
                    seen: immediatelySeen,
                    seenAt: immediatelySeen ? new Date() : null,
                    createdAt: new Date(),
                }

                conversation.messages.push(newMsg)
                conversation.lastMessage = {
                    text: text || "File",
                    sender: userId,
                    createdAt: new Date(),
                }

                if (!immediatelySeen) {
                    conversation.participants.forEach((pid) => {
                        if (pid.toString() !== userId) {
                            const cur = conversation.unreadCount?.get?.(pid.toString()) || 0
                            conversation.unreadCount?.set?.(pid.toString(), cur + 1)
                        }
                    })
                }

                await conversation.save()
                const saved = conversation.messages[conversation.messages.length - 1]

                io.to(conversationId).emit("receive_message", {
                    conversationId,
                    message: {
                        ...saved.toObject(),
                        sender: { _id: userId, name: socket.userName },
                    },
                })

                if (!immediatelySeen) {
                    conversation.participants.forEach((pid) => {
                        const pidStr = pid.toString()
                        const receiverSid = onlineUsers.get(pidStr)
                        if (pidStr !== userId && receiverSid) {
                            io.to(receiverSid).emit("new_message_notification", {
                                conversationId,
                                from: socket.userName,
                                preview: text?.slice(0, 60) || "File",
                            })
                        }
                    })
                }
            } catch (err) {
                socket.emit("error", { message: "Message failed to send" })
                console.error("[Socket send_message error]", err.message)
            }
        })

        socket.on("typing_start", ({ conversationId }) => {
            socket.to(conversationId).emit("user_typing", { userId, conversationId })
        })

        socket.on("typing_stop", ({ conversationId }) => {
            socket.to(conversationId).emit("user_stopped_typing", { userId, conversationId })
        })

        socket.on("mark_seen", async ({ conversationId }) => {
            try {
                const conv = await Conversation.findById(conversationId)
                if (!conv) return

                conv.messages.forEach((msg) => {
                    if (!msg.seen && msg.sender.toString() !== userId) {
                        msg.seen = true
                        msg.seenAt = new Date()
                    }
                })
                conv.unreadCount?.set?.(userId, 0)
                await conv.save()

                socket.to(conversationId).emit("messages_seen", { conversationId, seenBy: userId })
            } catch (err) {
                console.error("[Socket mark_seen error]", err.message)
            }
        })

        socket.on("payment_received_notification", (data) => {
            const { freelancerId, projectTitle, amount, status } = data
            const freelancerSocketId = onlineUsers.get(freelancerId)
            if (freelancerSocketId) {
                io.to(freelancerSocketId).emit("payment_notification", {
                    type: "payment_received",
                    projectTitle,
                    amount,
                    status,
                    message: `Payment received in escrow for "${projectTitle}"`,
                    timestamp: new Date(),
                })
            }
        })

        socket.on("payment_confirmed_notification", (data) => {
            const { clientId, projectTitle, amount } = data
            const clientSocketId = onlineUsers.get(clientId)
            if (clientSocketId) {
                io.to(clientSocketId).emit("payment_notification", {
                    type: "payment_confirmed",
                    projectTitle,
                    amount,
                    message: `Your payment of Rs.${amount} is confirmed for "${projectTitle}"`,
                    timestamp: new Date(),
                })
            }
        })

        socket.on("project_status_updated", (data) => {
            const { projectId, status, clientId, freelancerId } = data
            const clientSocketId = onlineUsers.get(clientId)
            const freelancerSocketId = onlineUsers.get(freelancerId)

            if (clientSocketId) {
                io.to(clientSocketId).emit("status_update", { projectId, status })
            }
            if (freelancerSocketId) {
                io.to(freelancerSocketId).emit("status_update", { projectId, status })
            }
        })

        socket.on("wallet_updated", (data) => {
            const { freelancerId, balance, pendingBalance } = data
            const freelancerSocketId = onlineUsers.get(freelancerId)
            if (freelancerSocketId) {
                io.to(freelancerSocketId).emit("wallet_balance_update", {
                    balance,
                    pendingBalance,
                    timestamp: new Date(),
                })
            }
        })

        socket.on("escrow_released_notification", (data) => {
            const { freelancerId, amount, projectTitle } = data
            const freelancerSocketId = onlineUsers.get(freelancerId)
            if (freelancerSocketId) {
                io.to(freelancerSocketId).emit("payment_notification", {
                    type: "escrow_released",
                    amount,
                    projectTitle,
                    message: `Payment released! Rs.${amount} added to pending balance (24hr clearance).`,
                    timestamp: new Date(),
                })
            }
        })

        socket.on("withdrawal_request_notification", (data) => {
            const { amount, freelancerId, freelancerName } = data
            io.to("admin_room").emit("withdrawal_notification", {
                type: "withdrawal_requested",
                freelancerId,
                freelancerName,
                amount,
                message: `New withdrawal request: Rs.${amount} from ${freelancerName}`,
                timestamp: new Date(),
            })
        })

        socket.on("join_admin_room", () => {
            socket.join("admin_room")
            console.log(`[Socket] ${userId} joined admin_room`)
        })

        socket.on("join_freelancer_ratings", (freelancerId) => {
            socket.join(`freelancer_${freelancerId}`)
            console.log(`[Socket] ${userId} joined freelancer_${freelancerId} for rating updates`)
        })

        socket.on("leave_freelancer_ratings", (freelancerId) => {
            socket.leave(`freelancer_${freelancerId}`)
            console.log(`[Socket] ${userId} left freelancer_${freelancerId}`)
        })

        // ─── ADMIN DASHBOARD REAL-TIME UPDATES ────────────────────────────────────
        socket.on("join_dashboard", () => {
            socket.join("admin_dashboard")
            console.log(`[Socket] ${userId} joined admin_dashboard`)
        })

        socket.on("leave_dashboard", () => {
            socket.leave("admin_dashboard")
            console.log(`[Socket] ${userId} left admin_dashboard`)
        })

        socket.on("disconnect", () => {
            onlineUsers.delete(userId)
            activeRooms.delete(socket.id)
            io.emit("online_users", Array.from(onlineUsers.keys()))
            console.log(`[Socket] Disconnected: ${userId}`)
        })
    })

    return io
}

// ─── BROADCAST DASHBOARD STAT UPDATES TO ALL CONNECTED ADMINS ────────────────
export const broadcastDashboardStats = (stats) => {
    if (global.io) {
        global.io.to("admin_dashboard").emit("dashboard_stats_updated", stats)
    }
}

// ─── BROADCAST MONTHLY ANALYTICS UPDATES ──────────────────────────────────────
export const broadcastMonthlyAnalytics = (analytics) => {
    if (global.io) {
        global.io.to("admin_dashboard").emit("monthly_analytics_updated", analytics)
    }
}

// ─── BROADCAST RECENT PAYMENTS UPDATES ────────────────────────────────────────
export const broadcastPaymentUpdate = (payment) => {
    if (global.io) {
        global.io.to("admin_dashboard").emit("payment_updated", payment)
    }
}

export const isUserOnline = (userId) => onlineUsers.has(userId.toString())

export const getIOInstance = () => global.io
