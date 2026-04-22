import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getApiErrorMessage, getAuthToken } from "../api/apiHelpers"
import freelancerService from "./freelancerService"

const initialState = {
    freelancers: [],
    freelancer: {},
    freelancerLoading: false,
    freelancerSuccess: false,
    freelancerError: false,
    freelancerErrorMessage: "",
}

export const getFreelancers = createAsyncThunk("FETCH/FREELANCERS", async (_, thunkAPI) => {
    try {
        return await freelancerService.fetchFreelancers()
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const getFreelancer = createAsyncThunk("FETCH/FREELANCER", async (id, thunkAPI) => {
    try {
        return await freelancerService.fetchFreelancer(id)
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const becomeFreelancerThunk = createAsyncThunk("BECOME/FREELANCER", async (formData, thunkAPI) => {
    try {
        return await freelancerService.becomeFreelancer(formData, getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const addPreviousProject = createAsyncThunk("ADD/PROJECT", async (formData, thunkAPI) => {
    try {
        return await freelancerService.addProject(formData, getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const removePreviousWork = createAsyncThunk("REMOVE/PREVIOUS/WORK", async (id, thunkAPI) => {
    try {
        return await freelancerService.removeWork(id, getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const applyForProject = createAsyncThunk("APPLY/PROJECT/BID", async (formData, thunkAPI) => {
    try {
        return await freelancerService.applyForBid(formData, getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

const startRequest = (state) => {
    state.freelancerLoading = true
    state.freelancerSuccess = false
    state.freelancerError = false
    state.freelancerErrorMessage = ""
}

const failRequest = (state, action) => {
    state.freelancerLoading = false
    state.freelancerSuccess = false
    state.freelancerError = true
    state.freelancerErrorMessage = action.payload
}

const freelancerSlice = createSlice({
    name: "freelancer",
    initialState,
    reducers: {
        resetFreelancerSuccess: (state) => {
            state.freelancerSuccess = false
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getFreelancers.pending, startRequest)
            .addCase(getFreelancers.fulfilled, (state, action) => {
                state.freelancerLoading = false
                state.freelancerSuccess = true
                state.freelancers = action.payload
            })
            .addCase(getFreelancers.rejected, failRequest)

            .addCase(getFreelancer.pending, startRequest)
            .addCase(getFreelancer.fulfilled, (state, action) => {
                state.freelancerLoading = false
                state.freelancerSuccess = false
                state.freelancer = action.payload
            })
            .addCase(getFreelancer.rejected, (state) => {
                state.freelancerLoading = false
                state.freelancerSuccess = false
                state.freelancerError = false
                state.freelancerErrorMessage = ""
            })

            .addCase(becomeFreelancerThunk.pending, startRequest)
            .addCase(becomeFreelancerThunk.fulfilled, (state, action) => {
                state.freelancerLoading = false
                state.freelancerSuccess = true
                state.freelancer = {
                    profile: action.payload.freelancer?.profile || action.payload.freelancer,
                    previousWorks: action.payload.freelancer?.previousWorks || [],
                }
            })
            .addCase(becomeFreelancerThunk.rejected, failRequest)

            .addCase(addPreviousProject.pending, startRequest)
            .addCase(addPreviousProject.fulfilled, (state, action) => {
                state.freelancerLoading = false
                state.freelancerSuccess = true
                state.freelancer.previousWorks = [
                    ...(state.freelancer.previousWorks || []),
                    action.payload,
                ]
            })
            .addCase(addPreviousProject.rejected, failRequest)

            .addCase(removePreviousWork.pending, startRequest)
            .addCase(removePreviousWork.fulfilled, (state, action) => {
                state.freelancerLoading = false
                state.freelancerSuccess = true
                state.freelancer.previousWorks = state.freelancer.previousWorks.filter(
                    (work) => work._id !== action.payload.workId
                )
            })
            .addCase(removePreviousWork.rejected, failRequest)

            .addCase(applyForProject.pending, startRequest)
            .addCase(applyForProject.fulfilled, (state) => {
                state.freelancerLoading = false
                state.freelancerSuccess = true
            })
            .addCase(applyForProject.rejected, failRequest)
    },
})

export const { resetFreelancerSuccess } = freelancerSlice.actions
export default freelancerSlice.reducer
