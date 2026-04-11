// client/src/services/adminService.js

import API from "../api/axiosInstance"

const BASE = "/api/admin"

const authHeader = (token) => ({
    headers: { Authorization: `Bearer ${token}` },
})

// ── Users ─────────────────────────────────────────────────────────────────────
const fetchAllUsers = async (token) => {
    const res = await API.get(`${BASE}/users`, authHeader(token))
    return res.data
}

const updateUser = async (token, uid, data) => {
    const res = await API.put(`${BASE}/users/${uid}`, data, authHeader(token))
    return res.data
}

const deleteUser = async (token, uid) => {
    const res = await API.delete(`${BASE}/users/${uid}`, authHeader(token))
    return res.data
}

// ── Projects ──────────────────────────────────────────────────────────────────
const fetchAllProjects = async (token) => {
    const res = await API.get(`/api/project`, authHeader(token))
    return res.data
}

const updateProject = async (token, pid, data) => {
    const res = await API.put(`${BASE}/projects/${pid}`, data, authHeader(token))
    return res.data
}

// ── Bids ──────────────────────────────────────────────────────────────────────
const fetchAllBids = async (token) => {
    const res = await API.get(`${BASE}/bids`, authHeader(token))
    return res.data
}

const updateBid = async (token, bid_id, data) => {
    const res = await API.put(`${BASE}/bids/${bid_id}`, data, authHeader(token))
    return res.data
}

// ── Stats ─────────────────────────────────────────────────────────────────────
const fetchStats = async (token) => {
    const res = await API.get(`${BASE}/stats`, authHeader(token))
    return res.data
}

// ── Legacy ────────────────────────────────────────────────────────────────────
const updateCredits = async (token, userDetails) => {
    const res = await API.put(
        `${BASE}/users/${userDetails._id}`,
        { credits: userDetails.credits },
        authHeader(token)
    )
    return res.data
}

const adminService = {
    fetchAllUsers,
    updateUser,
    deleteUser,
    fetchAllProjects,
    updateProject,
    fetchAllBids,
    updateBid,
    fetchStats,
    updateCredits,
}

export default adminService