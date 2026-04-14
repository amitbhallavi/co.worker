// client/src/services/freelancerService.js

import API from "../api/axiosInstance"

// ── Fetch all freelancers ──────────────────────────────────
const fetchFreelancers = async () => {
    const response = await API.get('/api/freelancer')
    return response.data
}

// ── Fetch single freelancer ────────────────────────────────
const fetchFreelancer = async (id) => {
    const response = await API.get(`/api/freelancer/profile/${id}`)
    return response.data
}

// ── Add previous project ───────────────────────────────────
const addProject = async (formData, token) => {
    const response = await API.post(`/api/freelancer/my-work`, formData, {
        headers: { authorization: `Bearer ${token}` }
    })
    return response.data
}

// ── Remove previous work ───────────────────────────────────
const removeWork = async (id, token) => {
    const response = await API.delete(`/api/freelancer/my-work/${id}`, {
        headers: { authorization: `Bearer ${token}` }
    })
    return response.data
}

// ── Apply for bid / project ────────────────────────────────
const applyForBid = async (formData, token) => {
    const response = await API.post(
        `/api/freelancer/project/${formData.projectId}`, formData,
        { headers: { authorization: `Bearer ${token}` } }
    )
    return response.data
}

const freelancerService = {
    fetchFreelancers,
    fetchFreelancer,
    addProject,
    removeWork,
    applyForBid,
}

export default freelancerService