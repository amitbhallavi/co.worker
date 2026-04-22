import API from "../api/axiosInstance"
import { buildAuthConfig } from "../api/apiHelpers"

const BASE = "/api/freelancer"

const fetchFreelancers = async () => {
    const response = await API.get(BASE)
    return response.data
}

const fetchFreelancer = async (id) => {
    const response = await API.get(`${BASE}/profile/${id}`)
    return response.data
}

const becomeFreelancer = async (formData, token) => {
    const response = await API.post(`${BASE}/add-me`, formData, buildAuthConfig(token))
    return response.data
}

const addProject = async (formData, token) => {
    const response = await API.post(`${BASE}/my-work`, formData, buildAuthConfig(token))
    return response.data
}

const removeWork = async (id, token) => {
    const response = await API.delete(`${BASE}/my-work/${id}`, buildAuthConfig(token))
    return response.data
}

const applyForBid = async (formData, token) => {
    const response = await API.post(`${BASE}/project/${formData.projectId}`, formData, buildAuthConfig(token))
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
