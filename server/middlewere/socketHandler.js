// socketHandler.js

import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import Conversation from "../models/chatModel.js"

const onlineUsers = new Map()
// ✅ FIX: Track which conversationId each socket is currently viewing
const activeRooms = new Map()  // socketId → conversationId

export const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
        },
    })

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token
        if (!token) return next(new Error("Authentication required"))
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

        onlineUsers.set(userId, socket.id)
        io.emit("online_users", Array.from(onlineUsers.keys()))

        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId)
            // ✅ Track which room this socket is actively viewing
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
                    p => p.toString() === userId
                )
                if (!isParticipant) return

                // ✅ FIX: Check if receiver is actively viewing this conversation
                // If yes → message is immediately seen, no unread increment
                let immediatelySeen = false
                conversation.participants.forEach(pid => {
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
                    // ✅ FIX: seen = true if receiver is in the room right now
                    seen: immediatelySeen,
                    seenAt: immediatelySeen ? new Date() : null,
                    createdAt: new Date(),
                }

                conversation.messages.push(newMsg)
                conversation.lastMessage = {
                    text: text || "📎 File",
                    sender: userId,
                    createdAt: new Date(),
                }

                // ✅ FIX: Only increment unread if receiver is NOT viewing the chat
                if (!immediatelySeen) {
                    conversation.participants.forEach(pid => {
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

                // Notify receiver only if not in room
                if (!immediatelySeen) {
                    conversation.participants.forEach(pid => {
                        const pidStr = pid.toString()
                        const receiverSid = onlineUsers.get(pidStr)
                        if (pidStr !== userId && receiverSid) {
                            io.to(receiverSid).emit("new_message_notification", {
                                conversationId,
                                from: socket.userName,
                                preview: text?.slice(0, 60) || "📎 File",
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

                conv.messages.forEach(msg => {
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

        // ════════════════════════════════════════════════════════════════════════════════
        // 💰 PAYMENT & WALLET EVENTS
        // ════════════════════════════════════════════════════════════════════════════════

        // ── Notify freelancer that they received payment (escrow)
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

        // ── Notify client that payment was processed
        socket.on("payment_confirmed_notification", (data) => {
            const { clientId, projectTitle, amount } = data
            const clientSocketId = onlineUsers.get(clientId)
            if (clientSocketId) {
                io.to(clientSocketId).emit("payment_notification", {
                    type: "payment_confirmed",
                    projectTitle,
                    amount,
                    message: `Your payment of ₹${amount} is confirmed for "${projectTitle}"`,
                    timestamp: new Date(),
                })
            }
        })

        // ── Project status update (real-time)
        socket.on("project_status_updated", (data) => {
            const { projectId, status, clientId, freelancerId } = data
            // Notify both client and freelancer
            const clientSocketId = onlineUsers.get(clientId)
            const freelancerSocketId = onlineUsers.get(freelancerId)
            
            if (clientSocketId) {
                io.to(clientSocketId).emit("status_update", { projectId, status })
            }
            if (freelancerSocketId) {
                io.to(freelancerSocketId).emit("status_update", { projectId, status })
            }
        })

        // ── Wallet balance update (real-time)
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

        // ── Escrow released notification (payment released to freelancer pending balance)
        socket.on("escrow_released_notification", (data) => {
            const { freelancerId, amount, projectTitle } = data
            const freelancerSocketId = onlineUsers.get(freelancerId)
            if (freelancerSocketId) {
                io.to(freelancerSocketId).emit("payment_notification", {
                    type: "escrow_released",
                    amount,
                    projectTitle,
                    message: `Payment released! ₹${amount} added to pending balance (24hr clearance).`,
                    timestamp: new Date(),
                })
            }
        })

        // ── Withdrawal request notification (admin gets notified)
        socket.on("withdrawal_request_notification", (data) => {
            const { amount, freelancerId, freelancerName } = data
            // Notify all admins in the "admin_room"
            io.to("admin_room").emit("withdrawal_notification", {
                type: "withdrawal_requested",
                freelancerId,
                freelancerName,
                amount,
                message: `New withdrawal request: ₹${amount} from ${freelancerName}`,
                timestamp: new Date(),
            })
        })

        // ── Join admin room (for admin listeners)
        socket.on("join_admin_room", () => {
            socket.join("admin_room")
            console.log(`[Socket] ${userId} joined admin_room`)
        })

        // ════════════════════════════════════════════════════════════════════════════════
        // ⭐ RATING EVENTS (REAL-TIME REVIEW UPDATES)
        // ════════════════════════════════════════════════════════════════════════════════

        // Join freelancer's rating room (to listen for rating updates)
        socket.on("join_freelancer_ratings", (freelancerId) => {
            socket.join(`freelancer_${freelancerId}`)
            console.log(`[Socket] ${userId} joined freelancer_${freelancerId} for rating updates`)
        })

        // Leave freelancer's rating room
        socket.on("leave_freelancer_ratings", (freelancerId) => {
            socket.leave(`freelancer_${freelancerId}`)
            console.log(`[Socket] ${userId} left freelancer_${freelancerId}`)
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

export const isUserOnline = (userId) => onlineUsers.has(userId.toString())

// ════════════════════════════════════════════════════════════════════════════════
// SOCKET.IO HELPER FUNCTIONS (for controllers to emit events)
// ════════════════════════════════════════════════════════════════════════════════

export const getIOInstance = () => {
    // This will be set by server.js
    return global.io
}

export const emitPaymentNotification = (io, freelancerId, data) => {
    const socketId = onlineUsers.get(freelancerId.toString())
    if (socketId) {
        io.to(socketId).emit("payment_notification", data)
    }
}

export const emitWalletUpdate = (io, userId, walletData) => {
    const socketId = onlineUsers.get(userId.toString())
    if (socketId) {
        io.to(socketId).emit("wallet_balance_update", walletData)
    }
}