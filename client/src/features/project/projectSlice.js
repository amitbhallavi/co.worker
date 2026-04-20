// projectSlice.js
// ─────────────────────────────────────────────────────────────────────────────
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import projectService from "./projectService"

const initialState = {
    listedProjects: [],
    assignedProjects: [],      // ✅ NEW: Projects assigned to freelancer
    project: {},
    bids: [],                  // bids FOR a specific project (used in modals)

    projectLoading: false,
    projectSuccess: false,
    projectError: false,
    projectErrorMessage: "",

    updatingBidId: null,
    updateSuccess: false,
    updateError: false,
    updateErrorMessage: "",
}

// ── GET all projects ──────────────────────────────────────────────────────────
export const getProjects = createAsyncThunk("FETCH/PROJECTS", async (_, thunkAPI) => {
    try {
        return await projectService.fetchProject()
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
})

// ── Add a project ─────────────────────────────────────────────────────────────
export const addProjects = createAsyncThunk("ADD/PROJECTS", async (formData, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token
    try {
        return await projectService.createProject(formData, token)
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
})

// ── GET bids FOR a specific project (client modal — pass projectId) ───────────
// ✅ FIX: This thunk takes a projectId — do NOT call with user._id
// Usage:  dispatch(getBids(project._id))   ← correct
// Wrong:  dispatch(getBids(user._id))      ← was causing 404 in FindWork
export const getBids = createAsyncThunk("GET/PROJECT_BIDS", async (projectId, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token
    try {
        return await projectService.getProjectBids(projectId, token)
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
})

// ── UPDATE bid status ─────────────────────────────────────────────────────────
// ✅ FIX: projectService.updateBidStatus now uses axios.PUT (was axios.post)
export const updateBidStatus = createAsyncThunk("UPDATE/BID_STATUS", async ({ bidId, status }, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token
    try {
        await projectService.updateBidStatus(bidId, status, token)
        return { bidId, status }
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
})

// ── ACCEPT bid ────────────────────────────────────────────────────────────────
export const acceptBid = createAsyncThunk("ACCEPT/BID", async (bidId, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token
    try {
        return await projectService.acceptBid(bidId, token)
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
})

// ── GET ASSIGNED PROJECTS FOR FREELANCER ──────────────────────────────────────
export const getAssignedProjects = createAsyncThunk("FETCH/ASSIGNED_PROJECTS", async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token
    try {
        return await projectService.getAssignedProjects(token)
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
})

// ─────────────────────────────────────────────────────────────────────────────
const projectSlice = createSlice({
    name: "project",
    initialState,
    reducers: {
        resetUpdate: state => {
            state.updatingBidId = null
            state.updateSuccess = false
            state.updateError = false
            state.updateErrorMessage = ""
        },
        clearBids: state => {
            state.bids = []
        },
        // ✅ Add assigned project (for Socket.IO real-time update)
        addAssignedProject: (state, action) => {
            const project = action.payload
            if (!state.assignedProjects.find(p => p._id === project._id)) {
                state.assignedProjects = [project, ...state.assignedProjects]
            }
        },
        // ✅ Real-time: accepted bid locks final amount for payment UI
        updateProjectAmount: (state, action) => {
            const { projectId, finalAmount, bidId } = action.payload || {}
            if (!projectId) return

            const patch = (p) => {
                if (!p || p._id !== projectId) return p
                return {
                    ...p,
                    finalAmount: finalAmount ?? p.finalAmount,
                    selectedBid: bidId ? { ...(typeof p.selectedBid === "object" ? p.selectedBid : {}), _id: bidId, amount: finalAmount } : p.selectedBid,
                    status: p.status === "pending" ? "accepted" : p.status,
                }
            }

            state.listedProjects = (state.listedProjects || []).map(patch)
            state.assignedProjects = (state.assignedProjects || []).map(patch)
        },
    },
    extraReducers: builder => {

        // getProjects
        builder
            .addCase(getProjects.pending, state => { state.projectLoading = true; state.projectError = false })
            .addCase(getProjects.fulfilled, (state, action) => {
                state.projectLoading = false
                state.projectSuccess = true
                state.listedProjects = action.payload
            })
            .addCase(getProjects.rejected, (state, action) => {
                state.projectLoading = false
                state.projectError = true
                state.projectErrorMessage = action.payload
            })

        // addProjects
        builder
            .addCase(addProjects.pending, state => { state.projectLoading = true; state.projectError = false })
            .addCase(addProjects.fulfilled, (state, action) => {
                state.projectLoading = false
                state.projectSuccess = true
                state.listedProjects = [action.payload, ...state.listedProjects]
            })
            .addCase(addProjects.rejected, (state, action) => {
                state.projectLoading = false
                state.projectError = true
                state.projectErrorMessage = action.payload
            })

        // getBids (for a project — used in modals)
        builder
            .addCase(getBids.pending, state => { state.projectLoading = true; state.projectError = false })
            .addCase(getBids.fulfilled, (state, action) => {
                state.projectLoading = false
                state.projectSuccess = true
                state.bids = Array.isArray(action.payload) ? action.payload : []
            })
            .addCase(getBids.rejected, (state, action) => {
                state.projectLoading = false
                state.projectError = true
                state.projectErrorMessage = action.payload
                state.bids = []
            })

        // updateBidStatus
        builder
            .addCase(updateBidStatus.pending, (state, action) => { state.updatingBidId = action.meta.arg.bidId })
            .addCase(updateBidStatus.fulfilled, (state, action) => {
                const { bidId, status } = action.payload
                state.updatingBidId = null
                state.updateSuccess = true
                state.bids = state.bids.map(b => b._id === bidId ? { ...b, status } : b)
            })
            .addCase(updateBidStatus.rejected, (state, action) => {
                state.updatingBidId = null
                state.updateError = true
                state.updateErrorMessage = action.payload
            })

        // acceptBid
        builder
            .addCase(acceptBid.fulfilled, (state, action) => {
                state.updateSuccess = true
            })
            .addCase(acceptBid.rejected, (state, action) => {
                state.updateError = true
                state.updateErrorMessage = action.payload
            })

        // ✅ getAssignedProjects
        builder
            .addCase(getAssignedProjects.pending, state => { state.projectLoading = true; state.projectError = false })
            .addCase(getAssignedProjects.fulfilled, (state, action) => {
                state.projectLoading = false
                state.projectSuccess = true
                state.assignedProjects = Array.isArray(action.payload) ? action.payload : []
            })
            .addCase(getAssignedProjects.rejected, (state, action) => {
                state.projectLoading = false
                state.projectError = true
                state.projectErrorMessage = action.payload
                state.assignedProjects = []
            })
    }
})

export const { resetUpdate, clearBids, addAssignedProject, updateProjectAmount } = projectSlice.actions
export default projectSlice.reducer