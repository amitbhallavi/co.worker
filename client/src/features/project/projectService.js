import API from "../api/axiosInstance"
import { buildAuthConfig } from "../api/apiHelpers"

const fetchProjects = async () => {
    const response = await API.get("/api/project")
    return response.data
}

const getAssignedProjects = async (token) => {
    const response = await API.get("/api/projects/assigned", buildAuthConfig(token))
    return response.data
}

const createProject = async (formData, token) => {
    const response = await API.post("/api/project/add", formData, buildAuthConfig(token))
    return response.data
}

const getProjectBids = async (projectId, token) => {
    const response = await API.get(`/api/project/${projectId}`, buildAuthConfig(token))
    return response.data
}

const updateBidStatus = async (bidId, status, token) => {
    const response = await API.post(`/api/project/${bidId}`, { status }, buildAuthConfig(token))
    return response.data
}

const acceptBid = async (bidId, token) => {
    const response = await API.post(`/api/project/${bidId}`, { status: "accepted" }, buildAuthConfig(token))
    return response.data
}

const updateProjectStatus = async (projectId, status, token) => {
    const response = await API.put(`/api/project/${projectId}`, { status }, buildAuthConfig(token))
    return response.data
}

const projectService = {
    fetchProjects,
    getAssignedProjects,
    createProject,
    getProjectBids,
    updateBidStatus,
    acceptBid,
    updateProjectStatus,
}

export default projectService
