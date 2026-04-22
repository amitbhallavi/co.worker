import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getApiErrorMessage, getAuthToken } from "../api/apiHelpers"
import clientService from "./clientService"

const initialState = {
    isActive: false,
    plan: "free",
    features: {
        projectsLimit: "unlimited",
        bidsReceived: "unlimited",
        chatWithFreelancers: true,
        analytics: true,
        aiMatching: true,
        paymentEscrow: true,
        supportLevel: "standard",
    },
    loading: false,
    success: false,
    error: false,
    errorMsg: "",
}

export const activateClientPlan = createAsyncThunk("client/activateClientPlan", async (_, thunkAPI) => {
    try {
        return await clientService.activatePlan(getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const getClientFeatures = createAsyncThunk("client/getClientFeatures", async (_, thunkAPI) => {
    try {
        return await clientService.fetchFeatures(getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

const startRequest = (state) => {
    state.loading = true
    state.success = false
    state.error = false
    state.errorMsg = ""
}

const failRequest = (state, action) => {
    state.loading = false
    state.error = true
    state.errorMsg = action.payload
}

const clientSlice = createSlice({
    name: "client",
    initialState,
    reducers: {
        resetClientState: (state) => {
            state.loading = false
            state.success = false
            state.error = false
            state.errorMsg = ""
        },
        clearSuccess: (state) => {
            state.success = false
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(activateClientPlan.pending, startRequest)
            .addCase(activateClientPlan.fulfilled, (state) => {
                state.loading = false
                state.success = true
                state.isActive = true
                state.plan = "free"
            })
            .addCase(activateClientPlan.rejected, failRequest)

            .addCase(getClientFeatures.pending, startRequest)
            .addCase(getClientFeatures.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.features = action.payload.features || initialState.features
                state.plan = action.payload.plan || "free"
            })
            .addCase(getClientFeatures.rejected, failRequest)
    },
})

export const { resetClientState, clearSuccess } = clientSlice.actions
export default clientSlice.reducer
