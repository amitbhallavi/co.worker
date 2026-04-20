// ===== FILE: client/src/utils/socketManager.js =====
// 🔌 Socket.IO connection manager with payment event listeners

import io from 'socket.io-client'
import { toast } from 'react-toastify'

let socket = null

export const initSocket = (token) => {
    if (socket?.connected) return socket

    const url = import.meta.env.VITE_API_URL || 'http://localhost:5050'
    socket = io(url, {
        auth: token ? { token } : undefined,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
    })

    // Connection events
    socket.on('connect', () => {
        // socket.id is only guaranteed after connect
        console.log('[Socket] Connected:', socket?.id)
    })

    socket.on('disconnect', () => {
        console.log('[Socket] Disconnected')
    })

    socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message)
    })

    // ════════════════════════════════════════════════════════════════════════════════
    // 💰 PAYMENT EVENT LISTENERS
    // ════════════════════════════════════════════════════════════════════════════════

    socket.on('payment_notification', (data) => {
        console.log('[Socket] Payment notification:', data)
        
        if (data.type === 'payment_received') {
            toast.info(`💰 Payment received for "${data.projectTitle}"`, {
                position: 'top-right',
                autoClose: 5000,
            })
        }
        
        if (data.type === 'payment_confirmed') {
            toast.success(`✅ Payment confirmed for "${data.projectTitle}"`, {
                position: 'top-right',
                autoClose: 5000,
            })
        }
        
        if (data.type === 'escrow_released') {
            toast.success(`🎉 ${data.message}`, {
                position: 'top-right',
                autoClose: 5000,
            })
        }
    })

    // ════════════════════════════════════════════════════════════════════════════════
    // 🎯 SUBSCRIPTION & PLAN EVENT LISTENERS
    // ════════════════════════════════════════════════════════════════════════════════

    socket.on('planActivated', (data) => {
        console.log('[Socket] Plan activated:', data)
        toast.success(`🎉 ${data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} plan activated!`, {
            position: 'top-right',
            autoClose: 5000,
        })
    })

    socket.on('planRenewed', (data) => {
        console.log('[Socket] Plan renewed:', data)
        toast.success(`✅ ${data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} plan renewed!`, {
            position: 'top-right',
            autoClose: 5000,
        })
    })

    socket.on('planCancelled', (data) => {
        console.log('[Socket] Plan cancelled:', data)
        toast.info(`📌 ${data.message}`, {
            position: 'top-right',
            autoClose: 4000,
        })
    })

    socket.on('wallet_balance_update', (data) => {
        console.log('[Socket] Wallet updated:', data)
        toast.info(`💳 Wallet updated: Available ₹${data.balance}`, {
            position: 'bottom-right',
            autoClose: 3000,
        })
    })

    socket.on('status_update', (data) => {
        console.log('[Socket] Project status updated:', data)
        toast.info(`📊 Project status: ${data.status}`, {
            position: 'top-right',
            autoClose: 4000,
        })
    })

    socket.on('withdrawal_notification', (data) => {
        console.log('[Socket] Withdrawal notification:', data)
        toast.info(`${data.message}`, {
            position: 'top-right',
            autoClose: 5000,
        })
    })

    // ════════════════════════════════════════════════════════════════════════════════
    // ⭐ RATING EVENT LISTENERS
    // ════════════════════════════════════════════════════════════════════════════════
    // NOTE: ratingCreated/ratingUpdated/ratingDeleted are handled in App.jsx
    // which dispatches to Redux. Here we only show toasts for cross-component awareness.

    socket.on('ratingCreated', (data) => {
        console.log('[Socket] Rating created:', data)
        toast.success(`⭐ New review received (${data.rating}★)`, {
            position: 'top-right',
            autoClose: 4000,
        })
    })

    socket.on('ratingUpdated', (data) => {
        console.log('[Socket] Rating updated:', data)
        toast.info('📝 A review was updated', {
            position: 'top-right',
            autoClose: 4000,
        })
    })

    socket.on('ratingDeleted', (data) => {
        console.log('[Socket] Rating deleted:', data)
        toast.info('🗑️ A review was deleted', {
            position: 'top-right',
            autoClose: 4000,
        })
    })

    // ════════════════════════════════════════════════════════════════════════════════
    // 💬 CHAT EVENT LISTENERS (existing)
    // ════════════════════════════════════════════════════════════════════════════════

    socket.on('receive_message', (data) => {
        console.log('[Socket] Message received:', data)
    })

    socket.on('user_typing', (data) => {
        // Handle typing indicator
    })

    socket.on('online_users', (users) => {
        console.log('[Socket] Online users:', users)
    })

    return socket
}

export const getSocket = () => socket

export const emitPaymentNotification = (data) => {
    if (socket?.connected) {
        socket.emit('payment_received_notification', data)
    }
}

export const emitProjectStatusUpdate = (data) => {
    if (socket?.connected) {
        socket.emit('project_status_updated', data)
    }
}

export const emitWalletUpdate = (data) => {
    if (socket?.connected) {
        socket.emit('wallet_updated', data)
    }
}

export const emitWithdrawalNotification = (data) => {
    if (socket?.connected) {
        socket.emit('withdrawal_request_notification', data)
    }
}

export const joinAdminRoom = () => {
    if (socket?.connected) {
        socket.emit('join_admin_room')
    }
}

export const disconnect = () => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}
