import API from "../api/axiosInstance"
import { buildAuthConfig } from "../api/apiHelpers"

const BASE = "/api/ratings"

const fetchRatings = async ({ userId, sort = "latest", filter = "all" }) => {
    const response = await API.get(`${BASE}/${userId}?sort=${sort}&filter=${filter}`)
    return response.data
}

const fetchSummary = async (userId) => {
    const response = await API.get(`${BASE}/user/${userId}/summary`)
    return response.data
}

const createRating = async (payload, token) => {
    const response = await API.post(BASE, payload, buildAuthConfig(token))
    return response.data
}

const updateRating = async ({ ratingId, ...payload }, token) => {
    const response = await API.put(`${BASE}/${ratingId}`, payload, buildAuthConfig(token))
    return response.data
}

const deleteRating = async (ratingId, token) => {
    const response = await API.delete(`${BASE}/${ratingId}`, buildAuthConfig(token))
    return response.data
}

const reportRating = async ({ ratingId, reason }, token) => {
    const response = await API.post(`${BASE}/${ratingId}/report`, { reason }, buildAuthConfig(token))
    return response.data
}

const ratingService = {
    fetchRatings,
    fetchSummary,
    createRating,
    updateRating,
    deleteRating,
    reportRating,
}

export default ratingService
