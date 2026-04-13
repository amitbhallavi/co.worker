import axios from "axios"
import API from "../api/axiosInstance"


// ── Fetch all freelancers ──────────────────────────────────
const fetchFreelancers = async () => {
    const response = await API.get('/api/freelancer')
    return response.data
}

// ── Fetch single freelancer by userId ─────────────────────
const fetchFreelancer = async (id) => {
    const response = await API.get(`/api/freelancer/profile/${id}`)
    return response.data
}

// ── Become Freelancer ──────────────────────────────────────
// POST /api/freelancer/add-me
const becomeFreelancer = async (formData, token) => {
    const response = await API.post(
        `/api/freelancer/add-me`,
        formData,
        { headers: { authorization: `Bearer ${token}` } }
    )
    return response.data
}

// ── Add portfolio work ─────────────────────────────────────
const addProject = async (formData, token) => {
    const response = await API.post(`/api/freelancer/my-work`, formData, {
        headers: { authorization: `Bearer ${token}` }
    })
    return response.data
}

// ── Remove portfolio work ──────────────────────────────────
const removeWork = async (id, token) => {
    const response = await API.delete(`/api/freelancer/my-work/${id}`, {
        headers: { authorization: `Bearer ${token}` }
    })
    return response.data
}

// ── Apply for bid ──────────────────────────────────────────
const applyForBid = async (formData, token) => {
    const response = await API.post(
        `/api/freelancer/project/${formData.projectId}`,
        formData,
        { headers: { authorization: `Bearer ${token}` } }
    )
    return response.data
}

const freelancerService = {
    fetchFreelancers,
    fetchFreelancer,
    becomeFreelancer,
    addProject,
    removeWork,
    applyForBid,
}

export default freelancerService