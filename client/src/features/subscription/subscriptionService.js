import API from "../api/axiosInstance"
import { buildAuthConfig } from "../api/apiHelpers"

const BASE = "/api/subscription"

const fetchPlans = async () => {
    const response = await API.get(`${BASE}/plans`)
    return response.data
}

const fetchUserPlan = async (token) => {
    const response = await API.get(`${BASE}/status`, buildAuthConfig(token))
    return response.data
}

const createOrder = async ({ planId, planType }, token) => {
    const response = await API.post(`${BASE}/create-order`, { planId, planType }, buildAuthConfig(token))
    return response.data
}

const verifyPayment = async (paymentData, token) => {
    const response = await API.post(`${BASE}/verify`, paymentData, buildAuthConfig(token))
    return response.data
}

const fetchHistory = async (token) => {
    const response = await API.get(`${BASE}/history`, buildAuthConfig(token))
    return response.data
}

const cancelPlan = async ({ reason }, token) => {
    const response = await API.post(`${BASE}/cancel`, { reason }, buildAuthConfig(token))
    return response.data
}

const extendPlan = async ({ planId, planType }, token) => {
    const response = await API.post(`${BASE}/extend`, { planId, planType }, buildAuthConfig(token))
    return response.data
}

const subscriptionService = {
    fetchPlans,
    fetchUserPlan,
    createOrder,
    verifyPayment,
    fetchHistory,
    cancelPlan,
    extendPlan,
}

export default subscriptionService
