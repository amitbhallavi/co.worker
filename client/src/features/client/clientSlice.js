// ===== FILE: client/src/features/client/clientSlice.js =====
// Redux slice for client plan and features management

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import API from "../api/axiosInstance"

const BASE = "/api/client"

const authH = (token) => ({ headers: { Authorization: `Bearer ${token}` } })
const errMsg = (e) => e?.response?.data?.error || e?.message || "Something went wrong"

// ── THUNKS ─────────────────────────────────────────────────────────────────────

/**
 * Activate free client plan (instant, no payment)
 */
export const activateClientPlan = createAsyncThunk(
    "client/activateClientPlan",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.post(
                `${BASE}/activate-plan`,
                {},
                authH(token)
            )
            return res.data
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

/**
 * Get client features and limitations
 */
export const getClientFeatures = createAsyncThunk(
    "client/getClientFeatures",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.get(
                `${BASE}/features`,
                authH(token)
            )
            return res.data
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

// ── SLICE ──────────────────────────────────────────────────────────────────────

const initialState = {
    // Client plan status
    isActive: false,
    plan: "free",

    // Client features
    features: {
        projectsLimit: "unlimited",
        bidsReceived: "unlimited",
        chatWithFreelancers: true,
        analytics: true,
        aiMatching: true,
        paymentEscrow: true,
        supportLevel: "standard",
    },

    // Loading & error
    loading: false,
    success: false,
    error: false,
    errorMsg: "",
}

const setPending = (s) => {
    s.loading = true
    s.success = false
    s.error = false
    s.errorMsg = ""
}

const setError = (s, action) => {
    s.loading = false
    s.error = true
    s.errorMsg = action.payload
}

const clientSlice = createSlice({
    name: "client",
    initialState,
    reducers: {
        resetClientState: (s) => {
            s.loading = false
            s.success = false
            s.error = false
            s.errorMsg = ""
        },
        clearSuccess: (s) => {
            s.success = false
        },
    },
    extraReducers: (b) => {
        b
            // ── Activate Client Plan
            .addCase(activateClientPlan.pending, setPending)
            .addCase(activateClientPlan.fulfilled, (s, a) => {
                s.loading = false
                s.success = true
                s.isActive = true
                s.plan = "free"
            })
            .addCase(activateClientPlan.rejected, setError)

            // ── Get Client Features
            .addCase(getClientFeatures.pending, setPending)
            .addCase(getClientFeatures.fulfilled, (s, a) => {
                s.loading = false
                s.success = true
                s.features = a.payload.features || initialState.features
                s.plan = a.payload.plan || "free"
            })
            .addCase(getClientFeatures.rejected, setError)
    },
})

export const { resetClientState, clearSuccess } = clientSlice.actions
export default clientSlice.reducer
