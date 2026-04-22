import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getApiErrorMessage, getAuthToken } from "../api/apiHelpers"
import paymentService from "./paymentService"

export const createPaymentOrder = createAsyncThunk(
    "payment/createOrder",
    async ({ projectId, amount }, thunkAPI) => {
        try {
            return await paymentService.createOrder({ projectId, amount }, getAuthToken(thunkAPI))
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const verifyPaymentSignature = createAsyncThunk(
    "payment/verifyPayment",
    async (paymentData, thunkAPI) => {
        try {
            return await paymentService.verifyPayment(paymentData, getAuthToken(thunkAPI))
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const releasePaymentEscrow = createAsyncThunk(
    "payment/releaseEscrow",
    async (projectId, thunkAPI) => {
        try {
            return await paymentService.releaseEscrow(projectId, getAuthToken(thunkAPI))
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const fetchProjectPayment = createAsyncThunk(
    "payment/fetchProjectPayment",
    async (projectId, thunkAPI) => {
        try {
            return await paymentService.fetchProjectPayment(projectId, getAuthToken(thunkAPI))
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const fetchAllPayments = createAsyncThunk(
    "payment/fetchAllPayments",
    async (_, thunkAPI) => {
        try {
            return await paymentService.fetchAllPayments(getAuthToken(thunkAPI))
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

const initialState = {
    currentOrder: null,
    projectPayment: null,
    allPayments: [],
    loading: false,
    success: false,
    error: false,
    errorMsg: "",
    razorpayKey: null,
    paymentVerifying: false,
}

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

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        resetPaymentSuccess: (state) => {
            state.success = false
        },
        resetPaymentError: (state) => {
            state.error = false
            state.errorMsg = ""
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null
        },
        updatePaymentStatus: (state, action) => {
            if (state.projectPayment?._id === action.payload.paymentId) {
                state.projectPayment.status = action.payload.status
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPaymentOrder.pending, startRequest)
            .addCase(createPaymentOrder.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.currentOrder = action.payload
                state.razorpayKey = action.payload.keyId
            })
            .addCase(createPaymentOrder.rejected, failRequest)

            .addCase(verifyPaymentSignature.pending, (state) => {
                state.paymentVerifying = true
                state.error = false
                state.errorMsg = ""
            })
            .addCase(verifyPaymentSignature.fulfilled, (state, action) => {
                state.paymentVerifying = false
                state.success = true
                state.projectPayment = action.payload.payment
                state.currentOrder = null
            })
            .addCase(verifyPaymentSignature.rejected, (state, action) => {
                state.paymentVerifying = false
                state.error = true
                state.errorMsg = action.payload
            })

            .addCase(releasePaymentEscrow.pending, startRequest)
            .addCase(releasePaymentEscrow.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.projectPayment = action.payload.payment
            })
            .addCase(releasePaymentEscrow.rejected, failRequest)

            .addCase(fetchProjectPayment.pending, startRequest)
            .addCase(fetchProjectPayment.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.projectPayment = action.payload
            })
            .addCase(fetchProjectPayment.rejected, failRequest)

            .addCase(fetchAllPayments.pending, startRequest)
            .addCase(fetchAllPayments.fulfilled, (state, action) => {
                state.loading = false
                state.allPayments = action.payload
            })
            .addCase(fetchAllPayments.rejected, failRequest)
    },
})

export const {
    resetPaymentSuccess,
    resetPaymentError,
    clearCurrentOrder,
    updatePaymentStatus,
} = paymentSlice.actions

export default paymentSlice.reducer
