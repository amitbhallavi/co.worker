// projectService.js
// ─────────────────────────────────────────────────────────────────────────────
// Route map (projectRoutes.js):
//   GET    /api/project          → getListProjects
//   POST   /api/project/add      → listProject
//   GET    /api/project/:pid     → checkProjectApplicatons  (get bids for project)
//   POST   /api/project/:bid     → acceptProjectRequest     (update bid status)
//   PUT    /api/project/:pid     → updateProjectStatus      (update project status)
// ─────────────────────────────────────────────────────────────────────────────
import axios from "axios"

// ── Fetch all projects ────────────────────────────────────────────────────────
const fetchProject = async () => {
    const response = await axios.get("/api/project")
    return response.data
}

// ── Create a new project ──────────────────────────────────────────────────────
const createProject = async (formData, token) => {
    const response = await axios.post("/api/project/add", formData, {
        headers: { authorization: `Bearer ${token}` }
    })
    return response.data
}

// ── Get bids FOR a project ────────────────────────────────────────────────────
// Maps to: GET /api/project/:pid → checkProjectApplicatons
// Returns bids[] with bid.freelancer.user populated
const getProjectBids = async (projectId, token) => {
    const response = await axios.get(`/api/project/${projectId}`, {
        headers: { authorization: `Bearer ${token}` }
    })
    return response.data
}

// ── Update bid status (Accept / Reject / Pending) ────────────────────────────
// ✅ FIX: Uses axios.POST — route is POST /:bid → acceptProjectRequest
// ❌ Was axios.put which hit updateProjectStatus (wrong controller entirely)
const updateBidStatus = async (bidId, status, token) => {
    const response = await axios.post(`/api/project/${bidId}`, { status }, {
        headers: { authorization: `Bearer ${token}` }
    })
    return response.data
}

// ── Update PROJECT status (in-progress / completed etc.) ─────────────────────
// Maps to: PUT /api/project/:pid → updateProjectStatus
const updateProjectStatus = async (projectId, status, token) => {
    const response = await axios.put(`/api/project/${projectId}`, { status }, {
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