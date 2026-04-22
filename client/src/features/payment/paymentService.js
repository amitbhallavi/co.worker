import API from "../api/axiosInstance"
import { buildAuthConfig } from "../api/apiHelpers"

const BASE = "/api/payment"

const createOrder = async ({ projectId, amount }, token) => {
    const response = await API.post(`${BASE}/create-order`, { projectId, amount }, buildAuthConfig(token))
    return response.data
}

const verifyPayment = async (paymentData, token) => {
    const response = await API.post(`${BASE}/verify`, paymentData, buildAuthConfig(token))
    return response.data
}

const releaseEscrow = async (projectId, token) => {
    const response = await API.post(`${BASE}/release/${projectId}`, {}, buildAuthConfig(token))
    return response.data
}

const fetchProjectPayment = async (projectId, token) => {
    const response = await API.get(`${BASE}/project/${projectId}`, buildAuthConfig(token))
    return response.data
}

const fetchAllPayments = async (token) => {
    const response = await API.get(`${BASE}/all`, buildAuthConfig(token))
    return response.data
}

const paymentService = {
    createOrder,
    verifyPayment,
    releaseEscrow,
    fetchProjectPayment,
    fetchAllPayments,
}

export default paymentService
