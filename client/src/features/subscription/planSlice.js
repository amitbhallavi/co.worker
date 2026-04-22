import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getApiErrorMessage, getAuthToken } from "../api/apiHelpers"
import subscriptionService from "./subscriptionService"

const initialState = {
    plans: [],
    currentPlan: "free",
    planExpiresAt: null,
    planType: null,
    planStartedAt: null,
    isExpired: false,
    features: {},
    history: [],
    currentOrder: null,
    loading: false,
    success: false,
    error: false,
    errorMsg: "",
}

export const fetchAllPlans = createAsyncThunk("subscription/fetchAllPlans", async (_, thunkAPI) => {
    try {
        const response = await subscriptionService.fetchPlans()
        return response.plans || []
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const fetchUserPlan = createAsyncThunk("subscription/fetchUserPlan", async (_, thunkAPI) => {
    try {
        return await subscriptionService.fetchUserPlan(getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const createSubscriptionOrder = createAsyncThunk(
    "subscription/createSubscriptionOrder",
    async ({ planId, planType }, thunkAPI) => {
        try {
            const response = await subscriptionService.createOrder({ planId, planType }, getAuthToken(thunkAPI))

            if (response?.success === false) {
                throw new Error(response.error || response.message || "Failed to create order")
            }

            return response
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const verifySubscriptionPayment = createAsyncThunk(
    "subscription/verifySubscriptionPayment",
    async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, thunkAPI) => {
        try {
            const response = await subscriptionService.verifyPayment(
                { razorpayOrderId, razorpayPaymentId, razorpaySignature },
                getAuthToken(thunkAPI)
            )

            return response.user
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const fetchSubscriptionHistory = createAsyncThunk(
    "subscription/fetchSubscriptionHistory",
    async (_, thunkAPI) => {
        try {
            const response = await subscriptionService.fetchHistory(getAuthToken(thunkAPI))
            return response.history || []
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const cancelSubscription = createAsyncThunk(
    "subscription/cancelSubscription",
    async ({ reason }, thunkAPI) => {
        try {
            return await subscriptionService.cancelPlan({ reason }, getAuthToken(thunkAPI))
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const extendPlan = createAsyncThunk(
    "subscription/extendPlan",
    async ({ planId, planType }, thunkAPI) => {
        try {
            return await subscriptionService.extendPlan({ planId, planType }, getAuthToken(thunkAPI))
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

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

const planSlice = createSlice({
    name: "subscription",
    initialState,
    reducers: {
        resetPlanState: (state) => {
            state.loading = false
            state.success = false
            state.error = false
            state.errorMsg = ""
        },
        clearSuccess: (state) => {
            state.success = false
        },
        updatePlanFromSocket: (state, action) => {
            const { plan, planType, expiresAt } = action.payload
            state.currentPlan = plan
            state.planType = planType
            state.planExpiresAt = expiresAt
            state.success = true
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllPlans.pending, startRequest)
            .addCase(fetchAllPlans.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.plans = action.payload
            })
            .addCase(fetchAllPlans.rejected, failRequest)

            .addCase(fetchUserPlan.pending, startRequest)
            .addCase(fetchUserPlan.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.currentPlan = action.payload.plan || "free"
                state.planExpiresAt = action.payload.planExpiresAt || null
                state.planType = action.payload.planType || null
                state.planStartedAt = action.payload.planStartedAt || null
                state.isExpired = action.payload.isExpired || false
                state.features = action.payload.features || {}
            })
            .addCase(fetchUserPlan.rejected, failRequest)

            .addCase(createSubscriptionOrder.pending, startRequest)
            .addCase(createSubscriptionOrder.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.currentOrder = action.payload
            })
            .addCase(createSubscriptionOrder.rejected, failRequest)

            .addCase(verifySubscriptionPayment.pending, startRequest)
            .addCase(verifySubscriptionPayment.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.currentPlan = action.payload.plan || "free"
                state.planExpiresAt = action.payload.planExpiresAt || null
                state.planType = action.payload.planType || null
            })
            .addCase(verifySubscriptionPayment.rejected, failRequest)

            .addCase(fetchSubscriptionHistory.pending, startRequest)
            .addCase(fetchSubscriptionHistory.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.history = action.payload
            })
            .addCase(fetchSubscriptionHistory.rejected, failRequest)

            .addCase(cancelSubscription.pending, startRequest)
            .addCase(cancelSubscription.fulfilled, (state) => {
                state.loading = false
                state.success = true
                state.currentPlan = "free"
                state.planExpiresAt = null
                state.planType = null
            })
            .addCase(cancelSubscription.rejected, failRequest)

            .addCase(extendPlan.pending, startRequest)
            .addCase(extendPlan.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.currentOrder = action.payload
            })
            .addCase(extendPlan.rejected, failRequest)
    },
})

export const { resetPlanState, clearSuccess, updatePlanFromSocket } = planSlice.actions
export default planSlice.reducer
