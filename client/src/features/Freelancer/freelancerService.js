import axios from "axios"

// ── Fetch all freelancers ──────────────────────────────────
const fetchFreelancers = async () => {
    const response = await axios.get('/api/freelancer')
    return response.data
}

// ── Fetch single freelancer ────────────────────────────────
const fetchFreelancer = async (id) => {
    const response = await axios.get(`/api/freelancer/profile/${id}`)
    return response.data
}

// ── Add previous project ───────────────────────────────────
const addProject = async (formData, token) => {
    const response = await axios.post(`/api/freelancer/my-work`, formData, {
        headers: { authorization: `Bearer ${token}` }
    })
    return response.data
}

// ── Remove previous work ───────────────────────────────────
const removeWork = async (id, token) => {
    const response = await axios.delete(`/api/freelancer/my-work/${id}`, {
        headers: { authorization: `Bearer ${token}` }
    })
    return response.data
}

// ── Apply for bid / project ────────────────────────────────
const applyForBid = async (formData, token) => {
    const response = await axios.post(
        `/api/freelancer/project/${formData.projectId}`,formData,
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