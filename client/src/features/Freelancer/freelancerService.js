import API from "../api/axiosInstance"

// ✅ BASE PATH (clean & reusable)
const BASE = "/api/freelancer"

// ── Fetch all freelancers ──────────────────────────────────
const fetchFreelancers = async () => {
    const response = await API.get(BASE)
    return response.data
}



// ── Fetch single freelancer ────────────────────────────────
const fetchFreelancer = async (id) => {
    const response = await API.get(`${BASE}/profile/${id}`)
    return response.data
}

// ── Become Freelancer ──────────────────────────────────────
const becomeFreelancer = async (formData, token) => {
    const response = await API.post(
        `${BASE}/add-me`,
        formData,
        {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    )
    return response.data
}



// ── Add project project ───────────────────────────────────
const addProject = async (formData, token) => {
    const response = await API.post(
        `${BASE}/my-work`,
        formData,
        {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    )
    return response.data
}

// ── Remove previous work ───────────────────────────────────
const removeWork = async (id, token) => {
    const response = await API.delete(
        `${BASE}/my-work/${id}`,
        {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    )
    return response.data
}

// ── Apply for bid / project ────────────────────────────────
const applyForBid = async (formData, token) => {
    const response = await API.post(
        `${BASE}/project/${formData.projectId}`,
        formData,
        {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    )
    return response.data
}

// ── EXPORT ─────────────────────────────────────────────────
const freelancerService = {
    fetchFreelancers,
    fetchFreelancer,
    becomeFreelancer,
    addProject,
    removeWork,
    applyForBid,
}

export default freelancerService