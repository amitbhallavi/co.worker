import API from "../api/axiosInstance"
import { buildAuthConfig } from "../api/apiHelpers"

const PAYMENT_BASE = "/api/payment"
const WALLET_BASE = "/api/payment/wallet"
const ADMIN_BASE = "/api/payment/wallet/admin"

const createOrder = async ({ projectId }, token) => {
    const response = await API.post(`${PAYMENT_BASE}/create-order`, { projectId }, buildAuthConfig(token))
    return response.data
}

const verifyPayment = async (paymentData, token) => {
    const response = await API.post(`${PAYMENT_BASE}/verify`, paymentData, buildAuthConfig(token))
    return response.data
}

const releaseEscrow = async (projectId, token) => {
    const response = await API.post(`${PAYMENT_BASE}/release/${projectId}`, {}, buildAuthConfig(token))
    return response.data
}

const fetchWallet = async (token) => {
    const response = await API.get(`${WALLET_BASE}/me`, buildAuthConfig(token))
    return response.data
}

const requestWithdrawal = async ({ amount, upiId }, token) => {
    const response = await API.post(`${WALLET_BASE}/withdraw`, { amount, upiId }, buildAuthConfig(token))
    return response.data
}

const fetchWithdrawals = async (token) => {
    const response = await API.get(`${WALLET_BASE}/withdrawals`, buildAuthConfig(token))
    return response.data
}

const fetchProjectPayment = async (projectId, token) => {
    const response = await API.get(`${PAYMENT_BASE}/project/${projectId}`, buildAuthConfig(token))
    return response.data
}

const fetchAllPayments = async (token) => {
    const response = await API.get(`${PAYMENT_BASE}/all`, buildAuthConfig(token))
    return response.data
}

const fetchAllWithdrawals = async (token) => {
    const response = await API.get(`${ADMIN_BASE}/withdrawals`, buildAuthConfig(token))
    return response.data
}

const processWithdrawal = async ({ id, status, adminNote }, token) => {
    const response = await API.put(`${ADMIN_BASE}/withdrawals/${id}`, { status, adminNote }, buildAuthConfig(token))
    return response.data
}

const walletService = {
    createOrder,
    verifyPayment,
    releaseEscrow,
    fetchWallet,
    requestWithdrawal,
    fetchWithdrawals,
    fetchProjectPayment,
    fetchAllPayments,
    fetchAllWithdrawals,
    processWithdrawal,
}

export default walletService
