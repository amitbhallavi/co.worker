// ===== FILE: client/src/features/wallet/walletSlice.js =====

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import API from "../api/axiosInstance"

const BASE = "/api/payment"

const authH = (token) => ({ headers: { Authorization: `Bearer ${token}` } })
const errMsg = (e) => e?.response?.data?.message || e?.message || "Something went wrong"

// ── THUNKS ─────────────────────────────────────────────────────────────────────

export const createOrder = createAsyncThunk("wallet/createOrder", async ({ projectId }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token
        // ✅ Security: backend computes amount from accepted bid (selectedBid/finalAmount)
        const res = await API.post(`${BASE}/create-order`, { projectId }, authH(token))
        return res.data
    } catch (e) { return thunkAPI.rejectWithValue(errMsg(e)) }
})

export const verifyPayment = createAsyncThunk("wallet/verifyPayment", async (data, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token
        const res = await API.post(`${BASE}/verify`, data, authH(token))
        return res.data
    } catch (e) { return thunkAPI.rejectWithValue(errMsg(e)) }
})

export const releaseEscrow = createAsyncThunk("wallet/releaseEscrow", async (projectId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token
        const res = await API.post(`${BASE}/release/${projectId}`, {}, authH(token))
        return res.data
    } catch (e) { return thunkAPI.rejectWithValue(errMsg(e)) }
})

export const fetchMyWallet = createAsyncThunk("wallet/fetchMyWallet", async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token
        const res = await API.get(`${BASE}/wallet/me`, authH(token))
        return res.data
    } catch (e) { return thunkAPI.rejectWithValue(errMsg(e)) }
})

export const requestWithdrawal = createAsyncThunk("wallet/requestWithdrawal", async ({ amount, upiId }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token
        const res = await API.post(`${BASE}/wallet/withdraw`, { amount, upiId }, authH(token))
        return res.data
    } catch (e) { return thunkAPI.rejectWithValue(errMsg(e)) }
})

export const fetchMyWithdrawals = createAsyncThunk("wallet/fetchMyWithdrawals", async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token
        const res = await API.get(`${BASE}/wallet/withdrawals`, authH(token))
        return res.data
    } catch (e) { return thunkAPI.rejectWithValue(errMsg(e)) }
})

export const fetchProjectPayment = createAsyncThunk("wallet/fetchProjectPayment", async (projectId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token
        const res = await API.get(`${BASE}/project/${projectId}`, authH(token))
        return res.data
    } catch (e) { return thunkAPI.rejectWithValue(errMsg(e)) }
})

// admin
export const fetchAllPayments = createAsyncThunk("wallet/fetchAllPayments", async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token
        const res = await API.get(`${BASE}/all`, authH(token))
        return res.data
    } catch (e) { return thunkAPI.rejectWithValue(errMsg(e)) }
})

export const fetchAllWithdrawals = createAsyncThunk("wallet/fetchAllWithdrawals", async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token
        const res = await API.get(`${BASE}/wallet/admin/withdrawals`, authH(token))
        return res.data
    } catch (e) { return thunkAPI.rejectWithValue(errMsg(e)) }
})

export const processWithdrawal = createAsyncThunk("wallet/processWithdrawal", async ({ id, status, adminNote }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token
        const res = await API.put(`${BASE}/wallet/admin/withdrawals/${id}`, { status, adminNote }, authH(token))
        return res.data
    } catch (e) { return thunkAPI.rejectWithValue(errMsg(e)) }
})

// ── SLICE ──────────────────────────────────────────────────────────────────────
const initialState = {
    wallet: null,
    withdrawals: [],
    allPayments: [],
    allWithdrawals: [],
    projectPayment: null,
    loading: false,
    success: false,
    error: false,
    errorMsg: "",
}

const p = (s) => { s.loading = true; s.success = false; s.error = false; s.errorMsg = "" }
const r = (s, a) => { s.loading = false; s.error = true; s.errorMsg = a.payload }

const walletSlice = createSlice({
    name: "wallet",
    initialState,
    reducers: {
        resetWallet: (s) => { s.loading = false; s.success = false; s.error = false; s.errorMsg = "" },
    },
    extraReducers: (b) => {
        b
            .addCase(fetchMyWallet.pending, p)
            .addCase(fetchMyWallet.fulfilled, (s, a) => { s.loading = false; s.success = true; s.wallet = a.payload })
            .addCase(fetchMyWallet.rejected, r)

            .addCase(requestWithdrawal.pending, p)
            .addCase(requestWithdrawal.fulfilled, (s, a) => {
                s.loading = false; s.success = true
                if (s.wallet) s.wallet.balance = a.payload.walletBalance
                s.withdrawals.unshift(a.payload.withdrawal)
            })
            .addCase(requestWithdrawal.rejected, r)

            .addCase(fetchMyWithdrawals.pending, p)
            .addCase(fetchMyWithdrawals.fulfilled, (s, a) => { s.loading = false; s.success = true; s.withdrawals = a.payload })
            .addCase(fetchMyWithdrawals.rejected, r)

            .addCase(createOrder.pending, p)
            .addCase(createOrder.fulfilled, (s) => { s.loading = false; s.success = true })
            .addCase(createOrder.rejected, r)

            .addCase(verifyPayment.pending, p)
            .addCase(verifyPayment.fulfilled, (s) => { s.loading = false; s.success = true })
            .addCase(verifyPayment.rejected, r)

            .addCase(releaseEscrow.pending, p)
            .addCase(releaseEscrow.fulfilled, (s) => { s.loading = false; s.success = true })
            .addCase(releaseEscrow.rejected, r)

            .addCase(fetchProjectPayment.pending, p)
            .addCase(fetchProjectPayment.fulfilled, (s, a) => { s.loading = false; s.success = true; s.projectPayment = a.payload })
            .addCase(fetchProjectPayment.rejected, r)

            .addCase(fetchAllPayments.pending, p)
            .addCase(fetchAllPayments.fulfilled, (s, a) => { s.loading = false; s.allPayments = a.payload })
            .addCase(fetchAllPayments.rejected, r)

            .addCase(fetchAllWithdrawals.pending, p)
            .addCase(fetchAllWithdrawals.fulfilled, (s, a) => { s.loading = false; s.allWithdrawals = a.payload })
            .addCase(fetchAllWithdrawals.rejected, r)

            .addCase(processWithdrawal.pending, p)
            .addCase(processWithdrawal.fulfilled, (s, a) => {
                s.loading = false; s.success = true
                s.allWithdrawals = s.allWithdrawals.map((w) =>
                    w._id === a.payload.withdrawal._id ? a.payload.withdrawal : w
                )
            })
            .addCase(processWithdrawal.rejected, r)
    },
})

export const { resetWallet } = walletSlice.actions
export default walletSlice.reducer