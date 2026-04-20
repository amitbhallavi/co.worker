// ===== FILE: client/src/features/payment/paymentSlice.js =====
// 💳 Payment Redux Slice — State management for payment operations

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import API from "../api/axiosInstance"

const BASE = "/api/payment"

const authH = (token) => ({ headers: { Authorization: `Bearer ${token}` } })
const errMsg = (e) => e?.response?.data?.message || e?.message || "Something went wrong"

// ══════════════════════════════════════════════════════════════════════════════
// ASYNC THUNKS
// ══════════════════════════════════════════════════════════════════════════════

// ── Create Razorpay Order
export const createPaymentOrder = createAsyncThunk(
    "payment/createOrder",
    async ({ projectId, amount }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.post(`${BASE}/create-order`, { projectId, amount }, authH(token))
            return res.data
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

// ── Verify Payment (signature check + move to escrow)
export const verifyPaymentSignature = createAsyncThunk(
    "payment/verifyPayment",
    async (paymentData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.post(`${BASE}/verify`, paymentData, authH(token))
            return res.data
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

// ── Release Escrow (client approves → money goes to freelancer pending)
export const releasePaymentEscrow = createAsyncThunk(
    "payment/releaseEscrow",
    async (projectId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.post(`${BASE}/release/${projectId}`, {}, authH(token))
            return res.data
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

// ── Get Payment for a Project
export const fetchProjectPayment = createAsyncThunk(
    "payment/fetchProjectPayment",
    async (projectId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.get(`${BASE}/project/${projectId}`, authH(token))
            return res.data
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

// ── Admin: Get All Payments
export const fetchAllPayments = createAsyncThunk(
    "payment/fetchAllPayments",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.get(`${BASE}/all`, authH(token))
            return res.data
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

// ══════════════════════════════════════════════════════════════════════════════
// SLICE
// ══════════════════════════════════════════════════════════════════════════════

const initialState = {
    // Payment creation & verification
    currentOrder: null,          // { orderId, amount, paymentId, keyId }
    projectPayment: null,        // Payment record for a specific project
    allPayments: [],             // Admin view

    // UI State
    loading: false,
    success: false,
    error: false,
    errorMsg: "",

    // Razorpay integration
    razorpayKey: null,           // Razorpay public key
    paymentVerifying: false,     // During verification process
}

const p = (s) => { s.loading = true; s.success = false; s.error = false; s.errorMsg = "" }
const r = (s, a) => { s.loading = false; s.error = true; s.errorMsg = a.payload }

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        resetPaymentSuccess: (s) => { s.success = false },
        resetPaymentError: (s) => { s.error = false; s.errorMsg = "" },
        clearCurrentOrder: (s) => { s.currentOrder = null },
        // Real-time update from Socket.IO
        updatePaymentStatus: (s, action) => {
            if (s.projectPayment?._id === action.payload.paymentId) {
                s.projectPayment.status = action.payload.status
            }
        },
    },
    extraReducers: (b) => {
        // ── Create Order ───────────────────────────────────────────────────────
        b.addCase(createPaymentOrder.pending, p)
            .addCase(createPaymentOrder.fulfilled, (s, a) => {
                s.loading = false
                s.success = true
                s.currentOrder = a.payload
                s.razorpayKey = a.payload.keyId
            })
            .addCase(createPaymentOrder.rejected, r)

        // ── Verify Payment ─────────────────────────────────────────────────────
        b.addCase(verifyPaymentSignature.pending, (s) => {
            s.paymentVerifying = true
            s.error = false
        })
            .addCase(verifyPaymentSignature.fulfilled, (s, a) => {
                s.paymentVerifying = false
                s.success = true
                s.projectPayment = a.payload.payment
                s.currentOrder = null  // Clear order after verification
            })
            .addCase(verifyPaymentSignature.rejected, (s, a) => {
                s.paymentVerifying = false
                s.error = true
                s.errorMsg = a.payload
            })

        // ── Release Escrow ─────────────────────────────────────────────────────
        b.addCase(releasePaymentEscrow.pending, p)
            .addCase(releasePaymentEscrow.fulfilled, (s, a) => {
                s.loading = false
                s.success = true
                s.projectPayment = a.payload.payment
            })
            .addCase(releasePaymentEscrow.rejected, r)

        // ── Fetch Project Payment ──────────────────────────────────────────────
        b.addCase(fetchProjectPayment.pending, p)
            .addCase(fetchProjectPayment.fulfilled, (s, a) => {
                s.loading = false
                s.success = true
                s.projectPayment = a.payload
            })
            .addCase(fetchProjectPayment.rejected, r)

        // ── Fetch All Payments (Admin) ─────────────────────────────────────────
        b.addCase(fetchAllPayments.pending, p)
            .addCase(fetchAllPayments.fulfilled, (s, a) => {
                s.loading = false
                s.allPayments = a.payload
            })
            .addCase(fetchAllPayments.rejected, r)
    },
})

export const { resetPaymentSuccess, resetPaymentError, clearCurrentOrder, updatePaymentStatus } = paymentSlice.actions
export default paymentSlice.reducer
