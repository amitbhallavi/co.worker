import io from "socket.io-client"
import { toast } from "react-toastify"
import store from "../features/store"
import { updateCredits } from "../features/auth/authSlice"

let socket = null
const shouldLogSocket = import.meta.env.DEV && import.meta.env.VITE_DEBUG_SOCKET === "true"

const logSocket = (...args) => {
    if (shouldLogSocket) {
        console.log(...args)
    }
}

const createToastConfig = (position = "top-right", autoClose = 4000) => ({
    position,
    autoClose,
})

const paymentToastHandlers = {
    payment_received: (data) => {
        toast.info(`Payment received for "${data.projectTitle}"`, createToastConfig("top-right", 5000))
    },
    payment_confirmed: (data) => {
        toast.success(`Payment confirmed for "${data.projectTitle}"`, createToastConfig("top-right", 5000))
    },
    escrow_released: (data) => {
        toast.success(data.message, createToastConfig("top-right", 5000))
    },
}

const attachConnectionListeners = () => {
    socket.on("connect", () => {
        logSocket("[Socket] Connected:", socket?.id)
    })

    socket.on("disconnect", () => {
        logSocket("[Socket] Disconnected")
    })

    socket.on("connect_error", (error) => {
        console.error("[Socket] Connection error:", error.message)
    })
}

const attachNotificationListeners = () => {
    socket.on("creditsUpdated", (data) => {
        logSocket("[Socket] Credits updated:", data)

        if (data.userId && data.credits !== undefined) {
            store.dispatch(updateCredits(data))
        }
    })

    socket.on("payment_notification", (data) => {
        logSocket("[Socket] Payment notification:", data)
        paymentToastHandlers[data.type]?.(data)
    })

    socket.on("planActivated", (data) => {
        logSocket("[Socket] Plan activated:", data)
        const planName = data.plan.charAt(0).toUpperCase() + data.plan.slice(1)
        toast.success(`${planName} plan activated!`, createToastConfig("top-right", 5000))
    })

    socket.on("planRenewed", (data) => {
        logSocket("[Socket] Plan renewed:", data)
        const planName = data.plan.charAt(0).toUpperCase() + data.plan.slice(1)
        toast.success(`${planName} plan renewed!`, createToastConfig("top-right", 5000))
    })

    socket.on("planCancelled", (data) => {
        logSocket("[Socket] Plan cancelled:", data)
        toast.info(data.message, createToastConfig("top-right", 4000))
    })

    socket.on("wallet_balance_update", (data) => {
        logSocket("[Socket] Wallet updated:", data)
        toast.info(`Wallet updated: Available Rs.${data.balance}`, createToastConfig("bottom-right", 3000))
    })

    socket.on("status_update", (data) => {
        logSocket("[Socket] Project status updated:", data)
        toast.info(`Project status: ${data.status}`, createToastConfig("top-right", 4000))
    })

    socket.on("withdrawal_notification", (data) => {
        logSocket("[Socket] Withdrawal notification:", data)
        toast.info(data.message, createToastConfig("top-right", 5000))
    })

    socket.on("ratingCreated", (data) => {
        logSocket("[Socket] Rating created:", data)
        toast.success(`New review received (${data.rating} stars)`, createToastConfig("top-right", 4000))
    })

    socket.on("ratingUpdated", () => {
        toast.info("A review was updated", createToastConfig("top-right", 4000))
    })

    socket.on("ratingDeleted", () => {
        toast.info("A review was deleted", createToastConfig("top-right", 4000))
    })

    socket.on("receive_message", (data) => {
        logSocket("[Socket] Message received:", data)
    })

    socket.on("user_typing", () => {})

    socket.on("online_users", (users) => {
        logSocket("[Socket] Online users:", users)
    })
}

export const initSocket = (token) => {
    if (socket) {
        return socket
    }

    const url = import.meta.env.VITE_API_URL || "http://localhost:5050"
    socket = io(url, {
        auth: token ? { token } : undefined,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
    })

    attachConnectionListeners()
    attachNotificationListeners()

    return socket
}

export const getSocket = () => socket

export const subscribeToRatingEvents = ({ onCreated, onUpdated, onDeleted }) => {
    const activeSocket = getSocket()

    if (!activeSocket) {
        return () => {}
    }

    if (onCreated) {
        activeSocket.on("ratingCreated", onCreated)
    }

    if (onUpdated) {
        activeSocket.on("ratingUpdated", onUpdated)
    }

    if (onDeleted) {
        activeSocket.on("ratingDeleted", onDeleted)
    }

    return () => {
        if (onCreated) {
            activeSocket.off("ratingCreated", onCreated)
        }

        if (onUpdated) {
            activeSocket.off("ratingUpdated", onUpdated)
        }

        if (onDeleted) {
            activeSocket.off("ratingDeleted", onDeleted)
        }
    }
}

const emitEvent = (event, data) => {
    if (socket?.connected) {
        socket.emit(event, data)
    }
}

export const emitPaymentNotification = (data) => emitEvent("payment_received_notification", data)

export const emitProjectStatusUpdate = (data) => emitEvent("project_status_updated", data)

export const emitWalletUpdate = (data) => emitEvent("wallet_updated", data)

export const emitWithdrawalNotification = (data) => emitEvent("withdrawal_request_notification", data)

export const joinAdminRoom = () => {
    if (socket?.connected) {
        socket.emit("join_admin_room")
    }
}

export const disconnect = () => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}
