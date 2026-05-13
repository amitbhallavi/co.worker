import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getApiErrorMessage, getAuthToken } from "../api/apiHelpers"
import projectService from "./projectService"

const initialState = {
    listedProjects: [],
    assignedProjects: [],
    project: {},
    bids: [],
    projectLoading: false,
    projectSuccess: false,
    projectError: false,
    projectErrorMessage: "",
    updatingBidId: null,
    updateSuccess: false,
    updateError: false,
    updateErrorMessage: "",
}

export const getProjects = createAsyncThunk("FETCH/PROJECTS", async (_, thunkAPI) => {
    try {
        return await projectService.fetchProjects()
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const addProjects = createAsyncThunk("ADD/PROJECTS", async (formData, thunkAPI) => {
    try {
        return await projectService.createProject(formData, getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const getBids = createAsyncThunk("GET/PROJECT_BIDS", async (projectId, thunkAPI) => {
    try {
        return await projectService.getProjectBids(projectId, getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const updateBidStatus = createAsyncThunk("UPDATE/BID_STATUS", async ({ bidId, status }, thunkAPI) => {
    try {
        await projectService.updateBidStatus(bidId, status, getAuthToken(thunkAPI))
        return { bidId, status }
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const acceptBid = createAsyncThunk("ACCEPT/BID", async (bidId, thunkAPI) => {
    try {
        return await projectService.acceptBid(bidId, getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const getAssignedProjects = createAsyncThunk("FETCH/ASSIGNED_PROJECTS", async (_, thunkAPI) => {
    try {
        return await projectService.getAssignedProjects(getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

const startProjectRequest = (state) => {
    state.projectLoading = true
    state.projectSuccess = false
    state.projectError = false
    state.projectErrorMessage = ""
}

const failProjectRequest = (state, action) => {
    state.projectLoading = false
    state.projectSuccess = false
    state.projectError = true
    state.projectErrorMessage = action.payload
}

const projectSlice = createSlice({
    name: "project",
    initialState,
    reducers: {
        resetUpdate: (state) => {
            state.updatingBidId = null
            state.updateSuccess = false
            state.updateError = false
            state.updateErrorMessage = ""
        },
        clearBids: (state) => {
            state.bids = []
        },
        addAssignedProject: (state, action) => {
            const project = action.payload

            if (!state.assignedProjects.find((item) => item._id === project._id)) {
                state.assignedProjects = [project, ...state.assignedProjects]
            }
        },
        patchProjectStatus: (state, action) => {
            const { projectId, status, project } = action.payload || {}
            const id = projectId || project?._id

            if (!id) {
                return
            }

            const patchProject = (item) => {
                if (!item || item._id !== id) {
                    return item
                }

                return {
                    ...item,
                    ...(project || {}),
                    status: status || project?.status || item.status,
                }
            }

            state.listedProjects = state.listedProjects.map(patchProject)
            state.assignedProjects = state.assignedProjects.map(patchProject)
            state.project = patchProject(state.project)
        },
        updateProjectAmount: (state, action) => {
            const { projectId, finalAmount, bidId } = action.payload || {}

            if (!projectId) {
                return
            }

            const patchProject = (project) => {
                if (!project || project._id !== projectId) {
                    return project
                }

                return {
                    ...project,
                    finalAmount: finalAmount ?? project.finalAmount,
                    selectedBid: bidId
                        ? {
                            ...(typeof project.selectedBid === "object" ? project.selectedBid : {}),
                            _id: bidId,
                            amount: finalAmount,
                        }
                        : project.selectedBid,
                    status: project.status === "pending" ? "accepted" : project.status,
                }
            }

            state.listedProjects = state.listedProjects.map(patchProject)
            state.assignedProjects = state.assignedProjects.map(patchProject)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProjects.pending, startProjectRequest)
            .addCase(getProjects.fulfilled, (state, action) => {
                state.projectLoading = false
                state.projectSuccess = true
                state.listedProjects = action.payload
            })
            .addCase(getProjects.rejected, failProjectRequest)

            .addCase(addProjects.pending, startProjectRequest)
            .addCase(addProjects.fulfilled, (state, action) => {
                state.projectLoading = false
                state.projectSuccess = true
                state.listedProjects = [action.payload, ...state.listedProjects]
            })
            .addCase(addProjects.rejected, failProjectRequest)

            .addCase(getBids.pending, startProjectRequest)
            .addCase(getBids.fulfilled, (state, action) => {
                state.projectLoading = false
                state.projectSuccess = true
                state.bids = Array.isArray(action.payload) ? action.payload : []
            })
            .addCase(getBids.rejected, (state, action) => {
                failProjectRequest(state, action)
                state.bids = []
            })

            .addCase(updateBidStatus.pending, (state, action) => {
                state.updatingBidId = action.meta.arg.bidId
            })
            .addCase(updateBidStatus.fulfilled, (state, action) => {
                const { bidId, status } = action.payload

                state.updatingBidId = null
                state.updateSuccess = true
                state.bids = state.bids.map((bid) => (
                    bid._id === bidId ? { ...bid, status } : bid
                ))
            })
            .addCase(updateBidStatus.rejected, (state, action) => {
                state.updatingBidId = null
                state.updateError = true
                state.updateErrorMessage = action.payload
            })

            .addCase(acceptBid.fulfilled, (state) => {
                state.updateSuccess = true
            })
            .addCase(acceptBid.rejected, (state, action) => {
                state.updateError = true
                state.updateErrorMessage = action.payload
            })

            .addCase(getAssignedProjects.pending, startProjectRequest)
            .addCase(getAssignedProjects.fulfilled, (state, action) => {
                state.projectLoading = false
                state.projectSuccess = true
                state.assignedProjects = Array.isArray(action.payload) ? action.payload : []
            })
            .addCase(getAssignedProjects.rejected, (state, action) => {
                failProjectRequest(state, action)
                state.assignedProjects = []
            })
    },
})

export const { resetUpdate, clearBids, addAssignedProject, patchProjectStatus, updateProjectAmount } = projectSlice.actions
export default projectSlice.reducer
