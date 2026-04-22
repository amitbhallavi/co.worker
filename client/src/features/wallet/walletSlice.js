import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getApiErrorMessage, getAuthToken } from "../api/apiHelpers"
import walletService from "./walletService"

export const createOrder = createAsyncThunk("wallet/createOrder", async ({ projectId }, thunkAPI) => {
    try {
        return await walletService.createOrder({ projectId }, getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const verifyPayment = createAsyncThunk("wallet/verifyPayment", async (paymentData, thunkAPI) => {
    try {
        return await walletService.verifyPayment(paymentData, getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const releaseEscrow = createAsyncThunk("wallet/releaseEscrow", async (projectId, thunkAPI) => {
    try {
        return await walletService.releaseEscrow(projectId, getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const fetchMyWallet = createAsyncThunk("wallet/fetchMyWallet", async (_, thunkAPI) => {
    try {
        return await walletService.fetchWallet(getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const requestWithdrawal = createAsyncThunk("wallet/requestWithdrawal", async ({ amount, upiId }, thunkAPI) => {
    try {
        return await walletService.requestWithdrawal({ amount, upiId }, getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const fetchMyWithdrawals = createAsyncThunk("wallet/fetchMyWithdrawals", async (_, thunkAPI) => {
    try {
        return await walletService.fetchWithdrawals(getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const fetchProjectPayment = createAsyncThunk("wallet/fetchProjectPayment", async (projectId, thunkAPI) => {
    try {
        return await walletService.fetchProjectPayment(projectId, getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const fetchAllPayments = createAsyncThunk("wallet/fetchAllPayments", async (_, thunkAPI) => {
    try {
        return await walletService.fetchAllPayments(getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const fetchAllWithdrawals = createAsyncThunk("wallet/fetchAllWithdrawals", async (_, thunkAPI) => {
    try {
        return await walletService.fetchAllWithdrawals(getAuthToken(thunkAPI))
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const processWithdrawal = createAsyncThunk(
    "wallet/processWithdrawal",
    async ({ id, status, adminNote }, thunkAPI) => {
        try {
            return await walletService.processWithdrawal({ id, status, adminNote }, getAuthToken(thunkAPI))
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

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

const walletSlice = createSlice({
    name: "wallet",
    initialState,
    reducers: {
        resetWallet: (state) => {
            state.loading = false
            state.success = false
            state.error = false
            state.errorMsg = ""
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyWallet.pending, startRequest)
            .addCase(fetchMyWallet.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.wallet = action.payload
            })
            .addCase(fetchMyWallet.rejected, failRequest)

            .addCase(requestWithdrawal.pending, startRequest)
            .addCase(requestWithdrawal.fulfilled, (state, action) => {
                state.loading = false
                state.success = true

                if (state.wallet) {
                    state.wallet.balance = action.payload.walletBalance
                }

                state.withdrawals.unshift(action.payload.withdrawal)
            })
            .addCase(requestWithdrawal.rejected, failRequest)

            .addCase(fetchMyWithdrawals.pending, startRequest)
            .addCase(fetchMyWithdrawals.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.withdrawals = action.payload
            })
            .addCase(fetchMyWithdrawals.rejected, failRequest)

            .addCase(createOrder.pending, startRequest)
            .addCase(createOrder.fulfilled, (state) => {
                state.loading = false
                state.success = true
            })
            .addCase(createOrder.rejected, failRequest)

            .addCase(verifyPayment.pending, startRequest)
            .addCase(verifyPayment.fulfilled, (state) => {
                state.loading = false
                state.success = true
            })
            .addCase(verifyPayment.rejected, failRequest)

            .addCase(releaseEscrow.pending, startRequest)
            .addCase(releaseEscrow.fulfilled, (state) => {
                state.loading = false
                state.success = true
            })
            .addCase(releaseEscrow.rejected, failRequest)

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

            .addCase(fetchAllWithdrawals.pending, startRequest)
            .addCase(fetchAllWithdrawals.fulfilled, (state, action) => {
                state.loading = false
                state.allWithdrawals = action.payload
            })
            .addCase(fetchAllWithdrawals.rejected, failRequest)

            .addCase(processWithdrawal.pending, startRequest)
            .addCase(processWithdrawal.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.allWithdrawals = state.allWithdrawals.map((withdrawal) => (
                    withdrawal._id === action.payload.withdrawal._id
                        ? action.payload.withdrawal
                        : withdrawal
                ))
            })
            .addCase(processWithdrawal.rejected, failRequest)
    },
})

export const { resetWallet } = walletSlice.actions
export default walletSlice.reducer
