import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
    getApiErrorMessage,
    getAuthToken,
    getStoredUser,
    saveStoredUser,
} from "../api/apiHelpers"
import authService from "./authService"

const initialState = {
    user: getStoredUser(),
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: "",
}
const PROFILE_REFRESH_COOLDOWN_MS = 10_000
let lastRefreshRequestAt = 0

export const registerUser = createAsyncThunk("AUTH/REGISTER", async (formData, thunkAPI) => {
    try {
        return await authService.register(formData)
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error, "Registration failed"))
    }
})

export const loginUser = createAsyncThunk("AUTH/LOGIN", async (formData, thunkAPI) => {
    try {
        return await authService.login(formData)
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error, "Login failed"))
    }
})

export const logoutUser = createAsyncThunk("AUTH/LOGOUT", async () => {
    authService.logout()
})

export const refreshUser = createAsyncThunk(
    "AUTH/REFRESH",
    async (_, thunkAPI) => {
        const token = getAuthToken(thunkAPI)

        if (!token) {
            return thunkAPI.rejectWithValue("No token")
        }

        try {
            const currentUser = thunkAPI.getState().auth.user
            const profile = await authService.refreshProfile(token)
            return saveStoredUser({ ...currentUser, ...profile })
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error, "Unable to refresh session"))
        }
    },
    {
        condition: (_, { getState }) => {
            const token = getState().auth.user?.token

            if (!token) {
                return false
            }

            const now = Date.now()
            if (now - lastRefreshRequestAt < PROFILE_REFRESH_COOLDOWN_MS) {
                return false
            }

            lastRefreshRequestAt = now
            return true
        },
    }
)

const startRequest = (state) => {
    state.isLoading = true
    state.isSuccess = false
    state.isError = false
    state.message = ""
}

const failRequest = (state, action) => {
    state.isLoading = false
    state.isSuccess = false
    state.isError = true
    state.message = action.payload
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        updateCredits: (state, action) => {
            const { userId, credits } = action.payload

            if (state.user?._id !== userId) {
                return
            }

            state.user.credits = credits
            saveStoredUser(state.user)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, startRequest)
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.user = action.payload
            })
            .addCase(registerUser.rejected, failRequest)

            .addCase(loginUser.pending, startRequest)
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.user = action.payload
            })
            .addCase(loginUser.rejected, failRequest)

            .addCase(logoutUser.fulfilled, (state) => {
                lastRefreshRequestAt = 0
                state.isLoading = false
                state.isSuccess = false
                state.isError = false
                state.message = ""
                state.user = null
            })

            .addCase(refreshUser.fulfilled, (state, action) => {
                state.user = action.payload
                state.message = ""
            })
            .addCase(refreshUser.rejected, (state, action) => {
                state.message = action.payload || ""
            })
    },
})

export const { updateCredits } = authSlice.actions
export default authSlice.reducer
