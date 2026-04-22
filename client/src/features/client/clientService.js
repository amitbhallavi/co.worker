import API from "../api/axiosInstance"
import { buildAuthConfig } from "../api/apiHelpers"

const BASE = "/api/client"

const activatePlan = async (token) => {
    const response = await API.post(`${BASE}/activate-plan`, {}, buildAuthConfig(token))
    return response.data
}

const fetchFeatures = async (token) => {
    const response = await API.get(`${BASE}/features`, buildAuthConfig(token))
    return response.data
}

const clientService = {
    activatePlan,
    fetchFeatures,
}

export default clientService
