// ===== FILE: client/src/features/subscription/planSlice.js =====
// Redux slice for subscription/plan management

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import API from "../api/axiosInstance"

const BASE = "/api/subscription"

const authH = (token) => ({ headers: { Authorization: `Bearer ${token}` } })
const errMsg = (e) => e?.response?.data?.error || e?.message || "Something went wrong"

// ── THUNKS ─────────────────────────────────────────────────────────────────────

/**
 * Fetch all available plans
 */
export const fetchAllPlans = createAsyncThunk("subscription/fetchAllPlans", async (_, thunkAPI) => {
    try {
        const res = await API.get(`${BASE}/plans`)
        return res.data.plans || []
    } catch (e) {
        return thunkAPI.rejectWithValue(errMsg(e))
    }
})

/**
 * Fetch current user's plan status
 */
export const fetchUserPlan = createAsyncThunk("subscription/fetchUserPlan", async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token
        const res = await API.get(`${BASE}/status`, authH(token))
        return res.data
    } catch (e) {
        return thunkAPI.rejectWithValue(errMsg(e))
    }
})

/**
 * Create subscription order for payment
 */
export const createSubscriptionOrder = createAsyncThunk(
    "subscription/createSubscriptionOrder",
    async ({ planId, planType }, thunkAPI) => {
        try {
            console.log("🎯 [planSlice] Creating order:", { planId, planType })
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.post(
                `${BASE}/create-order`,
                { planId, planType },
                authH(token)
            )
            console.log("✅ [planSlice] Order response:", {
                status: res.status,
                data: res.data,
                dataKeys: res.data ? Object.keys(res.data) : [],
                success: res.data?.success,
                error: res.data?.error,
                message: res.data?.message,
                details: res.data?.details
            })
            
            // Check if response has error
            if (!res.data.success) {
                const errorMessage = res.data?.error || res.data?.message || "Failed to create order"
                console.error("❌ [planSlice] Response not successful:", {
                    success: res.data?.success,
                    error: res.data?.error,
                    message: res.data?.message,
                    details: res.data?.details,
                    fullResponse: res.data
                })
                throw new Error(errorMessage)
            }
            
            return res.data
        } catch (e) {
            console.error("❌ [planSlice] Error creating order:", {
                message: e.message,
                response: e.response?.data,
                error: e
            })
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

/**
 * Verify payment and activate plan
 */
export const verifySubscriptionPayment = createAsyncThunk(
    "subscription/verifySubscriptionPayment",
    async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.post(
                `${BASE}/verify`,
                {
                    razorpayOrderId,
                    razorpayPaymentId,
                    razorpaySignature,
                },
                authH(token)
            )
            return res.data.user
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

/**
 * Fetch subscription payment history
 */
export const fetchSubscriptionHistory = createAsyncThunk(
    "subscription/fetchSubscriptionHistory",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.get(`${BASE}/history`, authH(token))
            return res.data.history || []
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

/**
 * Cancel subscription and downgrade to free
 */
export const cancelSubscription = createAsyncThunk(
    "subscription/cancelSubscription",
    async ({ reason }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.post(
                `${BASE}/cancel`,
                { reason },
                authH(token)
            )
            return res.data
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

/**
 * Extend/renew current plan
 */
export const extendPlan = createAsyncThunk(
    "subscription/extendPlan",
    async ({ planId, planType }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.post(
                `${BASE}/extend`,
                { planId, planType },
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
    // Available plans
    plans: [],

    // User's current plan
    currentPlan: "free",
    planExpiresAt: null,
    planType: null,
    planStartedAt: null,
    isExpired: false,
    features: {},

    // Subscription history
    history: [],

    // Current order (during checkout)
    currentOrder: null,

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

const planSlice = createSlice({
    name: "subscription",
    initialState,
    reducers: {
        resetPlanState: (s) => {
            s.loading = false
            s.success = false
            s.error = false
            s.errorMsg = ""
        },
        clearSuccess: (s) => {
            s.success = false
        },
        updatePlanFromSocket: (s, action) => {
            const { plan, planType, expiresAt } = action.payload
            s.currentPlan = plan
            s.planType = planType
            s.planExpiresAt = expiresAt
            s.success = true
        },
    },
    extraReducers: (b) => {
        b
            // ── Fetch All Plans
            .addCase(fetchAllPlans.pending, setPending)
            .addCase(fetchAllPlans.fulfilled, (s, a) => {
                s.loading = false
                s.success = true
                s.plans = a.payload || []
            })
            .addCase(fetchAllPlans.rejected, setError)

            // ── Fetch User Plan
            .addCase(fetchUserPlan.pending, setPending)
            .addCase(fetchUserPlan.fulfilled, (s, a) => {
                s.loading = false
                s.success = true
                s.currentPlan = a.payload.plan || "free"
                s.planExpiresAt = a.payload.planExpiresAt || null
                s.planType = a.payload.planType || null
                s.planStartedAt = a.payload.planStartedAt || null
                s.isExpired = a.payload.isExpired || false
                s.features = a.payload.features || {}
            })
            .addCase(fetchUserPlan.rejected, setError)

            // ── Create Subscription Order
            .addCase(createSubscriptionOrder.pending, setPending)
            .addCase(createSubscriptionOrder.fulfilled, (s, a) => {
                s.loading = false
                s.success = true
                s.currentOrder = a.payload
            })
            .addCase(createSubscriptionOrder.rejected, setError)

            // ── Verify Subscription Payment
            .addCase(verifySubscriptionPayment.pending, setPending)
            .addCase(verifySubscriptionPayment.fulfilled, (s, a) => {
                s.loading = false
                s.success = true
                s.currentPlan = a.payload.plan || "free"
                s.planExpiresAt = a.payload.planExpiresAt || null
                s.planType = a.payload.planType || null
            })
            .addCase(verifySubscriptionPayment.rejected, setError)

            // ── Fetch Subscription History
            .addCase(fetchSubscriptionHistory.pending, setPending)
            .addCase(fetchSubscriptionHistory.fulfilled, (s, a) => {
                s.loading = false
                s.success = true
                s.history = a.payload || []
            })
            .addCase(fetchSubscriptionHistory.rejected, setError)

            // ── Cancel Subscription
            .addCase(cancelSubscription.pending, setPending)
            .addCase(cancelSubscription.fulfilled, (s, a) => {
                s.loading = false
                s.success = true
                s.currentPlan = "free"
                s.planExpiresAt = null
                s.planType = null
            })
            .addCase(cancelSubscription.rejected, setError)

            // ── Extend Plan
            .addCase(extendPlan.pending, setPending)
            .addCase(extendPlan.fulfilled, (s, a) => {
                s.loading = false
                s.success = true
                s.currentOrder = a.payload
            })
            .addCase(extendPlan.rejected, setError)
    },
})

export const { resetPlanState, clearSuccess, updatePlanFromSocket } = planSlice.actions
export default planSlice.reducer
