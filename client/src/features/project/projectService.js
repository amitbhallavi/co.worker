// client/src/services/projectService.js

import API from "../api/axiosInstance"

// ── Fetch all projects ────────────────────────────────────────────────────────
const fetchProject = async () => {
    const response = await API.get("/api/project")
    return response.data
}

// ── Create a new project ──────────────────────────────────────────────────────
const createProject = async (formData, token) => {
    const response = await API.post("/api/project/add", formData, {
        headers: { authorization: `Bearer ${token}` }
    })
    return response.data
}

// ── Get bids FOR a project ────────────────────────────────────────────────────
const getProjectBids = async (projectId, token) => {
    const response = await API.get(`/api/project/${projectId}`, {
        headers: { authorization: `Bearer ${token}` }
    })
    return response.data
}

// ── Update bid status (Accept / Reject / Pending) ────────────────────────────
const updateBidStatus = async (bidId, status, token) => {
    const response = await API.post(`/api/project/${bidId}`, { status }, {
        headers: { authorization: `Bearer ${token}` }
    })
    return response.data
}

// ── Update PROJECT status ─────────────────────────────────────────────────────
const updateProjectStatus = async (projectId, status, token) => {
    const response = await API.put(`/api/project/${projectId}`, { status }, {
        headers: { authorization: `Bearer ${token}` }
    })
    return response.data
}

const projectService = {
    fetchProject,
    createProject,
    getProjectBids,
    updateBidStatus,
    updateProjectStatus,
}

export default projectService