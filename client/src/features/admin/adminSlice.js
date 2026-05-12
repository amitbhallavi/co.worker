// ===== FILE: client/src/features/admin/adminSlice.js =====

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import adminService from "./adminService"

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const initialState = {
    users: [],
    projects: [],
    bids: [],
    stats: null,
    monthlyAnalytics: null,
    recentPayments: [],
    platformSettings: null,
    adminLoading: false,
    adminSuccess: false,
    adminError: false,
    adminErrorMessage: "",
}

// ─── HELPER: extract error message ────────────────────────────────────────────
const errMsg = (error) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"

// ══════════════════════════════════════════════════════════════════════════════
// THUNKS
// ══════════════════════════════════════════════════════════════════════════════

// ── Users ─────────────────────────────────────────────────────────────────────
export const getAllUsers = createAsyncThunk(
    "admin/getAllUsers",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await adminService.fetchAllUsers(token)
        } catch (error) {
            return thunkAPI.rejectWithValue(errMsg(error))
        }
    }
)

export const adminUpdateUser = createAsyncThunk(
    "admin/updateUser",
    async ({ uid, data }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await adminService.updateUser(token, uid, data)
        } catch (error) {
            return thunkAPI.rejectWithValue(errMsg(error))
        }
    }
)

export const adminDeleteUser = createAsyncThunk(
    "admin/deleteUser",
    async (uid, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            await adminService.deleteUser(token, uid)
            return uid // return id so slice can remove from array
        } catch (error) {
            return thunkAPI.rejectWithValue(errMsg(error))
        }
    }
)

// ── Projects ──────────────────────────────────────────────────────────────────
export const getAllProjects = createAsyncThunk(
    "admin/getAllProjects",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await adminService.fetchAllProjects(token)
        } catch (error) {
            return thunkAPI.rejectWithValue(errMsg(error))
        }
    }
)

export const adminUpdateProject = createAsyncThunk(
    "admin/updateProject",
    async ({ pid, data }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await adminService.updateProject(token, pid, data)
        } catch (error) {
            return thunkAPI.rejectWithValue(errMsg(error))
        }
    }
)

// ── Bids ──────────────────────────────────────────────────────────────────────
export const getAllBids = createAsyncThunk(
    "admin/getAllBids",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await adminService.fetchAllBids(token)
        } catch (error) {
            return thunkAPI.rejectWithValue(errMsg(error))
        }
    }
)

export const adminUpdateBid = createAsyncThunk(
    "admin/updateBid",
    async ({ bid_id, data }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await adminService.updateBid(token, bid_id, data)
        } catch (error) {
            return thunkAPI.rejectWithValue(errMsg(error))
        }
    }
)

// ── Stats ─────────────────────────────────────────────────────────────────────
export const getDashboardStats = createAsyncThunk(
    "admin/getStats",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await adminService.fetchStats(token)
        } catch (error) {
            return thunkAPI.rejectWithValue(errMsg(error))
        }
    }
)

// ── Legacy thunk (kept for UpdateCreditsModal backward compat) ─────────────────
export const grantCredits = createAsyncThunk(
    "admin/grantCredits",
    async (userDetails, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await adminService.updateCredits(token, userDetails)
        } catch (error) {
            return thunkAPI.rejectWithValue(errMsg(error))
        }
    }
)

// ── Monthly Analytics (Real-time aggregation) ────────────────────────────────
export const getMonthlyAnalytics = createAsyncThunk(
    "admin/getMonthlyAnalytics",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await adminService.fetchMonthlyAnalytics(token)
        } catch (error) {
            return thunkAPI.rejectWithValue(errMsg(error))
        }
    }
)

// ── Recent Payments (Real-time transactions) ────────────────────────────────
export const getRecentPayments = createAsyncThunk(
    "admin/getRecentPayments",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await adminService.fetchRecentPayments(token)
        } catch (error) {
            return thunkAPI.rejectWithValue(errMsg(error))
        }
    }
)

// ── Platform Settings (Persistent toggles) ────────────────────────────────
export const getPlatformSettings = createAsyncThunk(
    "admin/getPlatformSettings",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await adminService.fetchPlatformSettings(token)
        } catch (error) {
            return thunkAPI.rejectWithValue(errMsg(error))
        }
    }
)

export const updatePlatformSettingsThunk = createAsyncThunk(
    "admin/updatePlatformSettings",
    async (settings, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await adminService.updatePlatformSettings(token, settings)
        } catch (error) {
            return thunkAPI.rejectWithValue(errMsg(error))
        }
    }
)

export const refreshAdminDashboard = createAsyncThunk(
    "admin/refreshDashboard",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await adminService.fetchDashboardSnapshot(token)
        } catch (error) {
            return thunkAPI.rejectWithValue(errMsg(error))
        }
    }
)

// ══════════════════════════════════════════════════════════════════════════════
// SLICE
// ══════════════════════════════════════════════════════════════════════════════
const pending = (state) => {
    state.adminLoading = true
    state.adminSuccess = false
    state.adminError = false
    state.adminErrorMessage = ""
}
const rejected = (state, action) => {
    state.adminLoading = false
    state.adminError = true
    state.adminErrorMessage = action.payload
}
const softRefreshPending = (state) => {
    const hasDashboardData =
        state.users.length ||
        state.projects.length ||
        state.bids.length ||
        state.stats ||
        state.monthlyAnalytics

    if (!hasDashboardData) {
        pending(state)
    }
}

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        resetAdminState: (state) => {
            state.adminLoading = false
            state.adminSuccess = false
            state.adminError = false
            state.adminErrorMessage = ""
        },
        // Optimistic local updates (used by AdminDashboard for instant UI feedback)
        localUpdateUser: (state, action) => {
            const { uid, data } = action.payload
            state.users = state.users.map((u) =>
                u._id === uid ? { ...u, ...data } : u
            )
        },
        localDeleteUser: (state, action) => {
            state.users = state.users.filter((u) => u._id !== action.payload)
        },
        localUpdateBid: (state, action) => {
            const { bid_id, data } = action.payload
            state.bids = state.bids.map((b) =>
                b._id === bid_id ? { ...b, ...data } : b
            )
        },
        localUpdateProject: (state, action) => {
            const { pid, data } = action.payload
            state.projects = state.projects.map((p) =>
                p._id === pid ? { ...p, ...data } : p
            )
        },
        // Real-time updates from Socket.IO
        updateMonthlyAnalytics: (state, action) => {
            state.monthlyAnalytics = action.payload
        },
        updatePaymentsList: (state, action) => {
            state.recentPayments = action.payload
        },
        addPaymentToList: (state, action) => {
            state.recentPayments = [action.payload, ...state.recentPayments].slice(0, 10)
        },
        updatePlatformSettings: (state, action) => {
            state.platformSettings = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            // ── refreshAdminDashboard ──────────────────────────────────────────────
            .addCase(refreshAdminDashboard.pending, softRefreshPending)
            .addCase(refreshAdminDashboard.fulfilled, (state, action) => {
                state.adminLoading = false
                state.adminSuccess = true
                state.adminError = false
                state.adminErrorMessage = ""
                state.users = action.payload.users
                state.projects = action.payload.projects
                state.bids = action.payload.bids
                state.stats = action.payload.stats
                state.monthlyAnalytics = action.payload.monthlyAnalytics
                state.recentPayments = action.payload.recentPayments
                state.platformSettings = action.payload.platformSettings
            })
            .addCase(refreshAdminDashboard.rejected, rejected)

            // ── getAllUsers ─────────────────────────────────────────────────────────
            .addCase(getAllUsers.pending, pending)
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.adminLoading = false
                state.adminSuccess = true
                state.users = action.payload
            })
            .addCase(getAllUsers.rejected, rejected)

            // ── adminUpdateUser ─────────────────────────────────────────────────────
            .addCase(adminUpdateUser.pending, pending)
            .addCase(adminUpdateUser.fulfilled, (state, action) => {
                state.adminLoading = false
                state.adminSuccess = true
                state.users = state.users.map((u) =>
                    u._id === action.payload._id ? action.payload : u
                )
            })
            .addCase(adminUpdateUser.rejected, rejected)

            // ── adminDeleteUser ─────────────────────────────────────────────────────
            .addCase(adminDeleteUser.pending, pending)
            .addCase(adminDeleteUser.fulfilled, (state, action) => {
                state.adminLoading = false
                state.adminSuccess = true
                state.users = state.users.filter((u) => u._id !== action.payload)
            })
            .addCase(adminDeleteUser.rejected, rejected)

            // ── getAllProjects ──────────────────────────────────────────────────────
            .addCase(getAllProjects.pending, pending)
            .addCase(getAllProjects.fulfilled, (state, action) => {
                state.adminLoading = false
                state.adminSuccess = true
                state.projects = action.payload
            })
            .addCase(getAllProjects.rejected, rejected)

            // ── adminUpdateProject ──────────────────────────────────────────────────
            .addCase(adminUpdateProject.pending, pending)
            .addCase(adminUpdateProject.fulfilled, (state, action) => {
                state.adminLoading = false
                state.adminSuccess = true
                state.projects = state.projects.map((p) =>
                    p._id === action.payload._id ? action.payload : p
                )
            })
            .addCase(adminUpdateProject.rejected, rejected)

            // ── getAllBids ──────────────────────────────────────────────────────────
            .addCase(getAllBids.pending, pending)
            .addCase(getAllBids.fulfilled, (state, action) => {
                state.adminLoading = false
                state.adminSuccess = true
                state.bids = action.payload
            })
            .addCase(getAllBids.rejected, rejected)

            // ── adminUpdateBid ──────────────────────────────────────────────────────
            .addCase(adminUpdateBid.pending, pending)
            .addCase(adminUpdateBid.fulfilled, (state, action) => {
                state.adminLoading = false
                state.adminSuccess = true
                state.bids = state.bids.map((b) =>
                    b._id === action.payload._id ? action.payload : b
                )
            })
            .addCase(adminUpdateBid.rejected, rejected)

            // ── getDashboardStats ───────────────────────────────────────────────────
            .addCase(getDashboardStats.pending, pending)
            .addCase(getDashboardStats.fulfilled, (state, action) => {
                state.adminLoading = false
                state.adminSuccess = true
                state.stats = action.payload
            })
            .addCase(getDashboardStats.rejected, rejected)

            // ── grantCredits (legacy) ───────────────────────────────────────────────
            .addCase(grantCredits.pending, pending)
            .addCase(grantCredits.fulfilled, (state, action) => {
                state.adminLoading = false
                state.adminSuccess = true
                state.users = state.users.map((u) =>
                    u._id === action.payload._id ? action.payload : u
                )
            })
            .addCase(grantCredits.rejected, rejected)

            // ── getMonthlyAnalytics ─────────────────────────────────────────────────
            .addCase(getMonthlyAnalytics.pending, pending)
            .addCase(getMonthlyAnalytics.fulfilled, (state, action) => {
                state.adminLoading = false
                state.adminSuccess = true
                state.monthlyAnalytics = action.payload
            })
            .addCase(getMonthlyAnalytics.rejected, rejected)

            // ── getRecentPayments ───────────────────────────────────────────────────
            .addCase(getRecentPayments.pending, pending)
            .addCase(getRecentPayments.fulfilled, (state, action) => {
                state.adminLoading = false
                state.adminSuccess = true
                state.recentPayments = action.payload
            })
            .addCase(getRecentPayments.rejected, rejected)

            // ── getPlatformSettings ─────────────────────────────────────────────────
            .addCase(getPlatformSettings.pending, pending)
            .addCase(getPlatformSettings.fulfilled, (state, action) => {
                state.adminLoading = false
                state.adminSuccess = true
                state.platformSettings = action.payload
            })
            .addCase(getPlatformSettings.rejected, rejected)

            // ── updatePlatformSettings ──────────────────────────────────────────────
            .addCase(updatePlatformSettingsThunk.pending, pending)
            .addCase(updatePlatformSettingsThunk.fulfilled, (state, action) => {
                state.adminLoading = false
                state.adminSuccess = true
                state.platformSettings = action.payload
            })
            .addCase(updatePlatformSettingsThunk.rejected, rejected)
    },
})

export const {
    resetAdminState,
    localUpdateUser,
    localDeleteUser,
    localUpdateBid,
    localUpdateProject,
    updateMonthlyAnalytics,
    updatePaymentsList,
    addPaymentToList,
    updatePlatformSettings,
} = adminSlice.actions

export default adminSlice.reducer
