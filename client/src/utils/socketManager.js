import io from "socket.io-client"
import { toast } from "react-toastify"
import store from "../features/store"
import { updateCredits } from "../features/auth/authSlice"

let socket = null

export const initSocket = (token) => {
    if (socket?.connected) return socket

    const url = import.meta.env.VITE_API_URL || "http://localhost:5050"
    socket = io(url, {
        auth: token ? { token } : undefined,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
    })

    socket.on("connect", () => {
        console.log("[Socket] Connected:", socket?.id)
    })

    socket.on("disconnect", () => {
        console.log("[Socket] Disconnected")
    })

    socket.on("connect_error", (error) => {
        console.error("[Socket] Connection error:", error.message)
    })

    socket.on("creditsUpdated", (data) => {
        console.log("[Socket] Credits updated:", data)
        if (data.userId && data.credits !== undefined) {
            store.dispatch(updateCredits(data))
        }
    })

    socket.on("payment_notification", (data) => {
        console.log("[Socket] Payment notification:", data)

        if (data.type === "payment_received") {
            toast.info(`Payment received for "${data.projectTitle}"`, {
                position: "top-right",
                autoClose: 5000,
            })
        }

        if (data.type === "payment_confirmed") {
            toast.success(`Payment confirmed for "${data.projectTitle}"`, {
                position: "top-right",
                autoClose: 5000,
            })
        }

        if (data.type === "escrow_released") {
            toast.success(data.message, {
                position: "top-right",
                autoClose: 5000,
            })
        }
    })

    socket.on("planActivated", (data) => {
        console.log("[Socket] Plan activated:", data)
        const planName = data.plan.charAt(0).toUpperCase() + data.plan.slice(1)
        toast.success(`${planName} plan activated!`, {
            position: "top-right",
            autoClose: 5000,
        })
    })

    socket.on("planRenewed", (data) => {
        console.log("[Socket] Plan renewed:", data)
        const planName = data.plan.charAt(0).toUpperCase() + data.plan.slice(1)
        toast.success(`${planName} plan renewed!`, {
            position: "top-right",
            autoClose: 5000,
        })
    })

    socket.on("planCancelled", (data) => {
        console.log("[Socket] Plan cancelled:", data)
        toast.info(data.message, {
            position: "top-right",
            autoClose: 4000,
        })
    })

    socket.on("wallet_balance_update", (data) => {
        console.log("[Socket] Wallet updated:", data)
        toast.info(`Wallet updated: Available Rs.${data.balance}`, {
            position: "bottom-right",
            autoClose: 3000,
        })
    })

    socket.on("status_update", (data) => {
        console.log("[Socket] Project status updated:", data)
        toast.info(`Project status: ${data.status}`, {
            position: "top-right",
            autoClose: 4000,
        })
    })

    socket.on("withdrawal_notification", (data) => {
        console.log("[Socket] Withdrawal notification:", data)
        toast.info(data.message, {
            position: "top-right",
            autoClose: 5000,
        })
    })

    socket.on("ratingCreated", (data) => {
        console.log("[Socket] Rating created:", data)
        toast.success(`New review received (${data.rating} stars)`, {
            position: "top-right",
            autoClose: 4000,
        })
    })

    socket.on("ratingUpdated", (data) => {
        console.log("[Socket] Rating updated:", data)
        toast.info("A review was updated", {
            position: "top-right",
            autoClose: 4000,
        })
    })

    socket.on("ratingDeleted", (data) => {
        console.log("[Socket] Rating deleted:", data)
        toast.info("A review was deleted", {
            position: "top-right",
            autoClose: 4000,
        })
    })

    socket.on("receive_message", (data) => {
        console.log("[Socket] Message received:", data)
    })

    socket.on("user_typing", (data) => {})

    socket.on("online_users", (users) => {
        console.log("[Socket] Online users:", users)
    })

    return socket
}

export const getSocket = () => socket

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