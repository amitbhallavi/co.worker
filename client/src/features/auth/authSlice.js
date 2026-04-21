
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authService from "./authService";

let userExist = JSON.parse(localStorage.getItem('user'))

// ── Error extract helper ──────────────────────────────────────────────────────
const getError = (error) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"

const initialState = {

    user: userExist || null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: ""


};


const authSlice = createSlice({

    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {

        builder
            // Register User => 
            .addCase(registerUser.pending, (state,) => {
                state.isLoading = true
                state.isSuccess = false
                state.isError = false
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.user = action.payload
                state.isError = false
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false
                state.isError = true
                state.message = action.payload
            })

            // Login User ->
            .addCase(loginUser.pending, (state,) => {
                state.isLoading = true
                state.isSuccess = false
                state.isError = false
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.user = action.payload
                state.isError = false
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false
                state.isSuccess = false
                state.isError = true
                state.message = action.payload
            })

            // Logout User -> 

            .addCase(logoutUser.fulfilled, (state,) => {
                state.isLoading = false
                state.isSuccess = false
                state.isError = false
                state.message = ""
                state.user = null

            })

            .addCase(refreshUser.fulfilled, (state, action) => {
                state.user = action.payload
            })



    }
});

export const { } = authSlice.actions

export default authSlice.reducer;


// Register User -> 


export const registerUser = createAsyncThunk("AUTH/REGISTER", async (formData, thunkAPI) => {

    try {
        return await authService.register(formData, thunkAPI)
    } catch (error) {
        // ✅ Error properly extract karo
        const message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Registration failed"
        return thunkAPI.rejectWithValue(message)
    }

})

// Login User -> 


export const loginUser = createAsyncThunk("AUTH/LOGIN", async (formData, thunkAPI) => {
    try {

        return await authService.login(formData)

    } catch (error) {

        const message = (error.response.data.message)
        return thunkAPI.rejectWithValue(message)

    }
})

// Logout User -> 


export const logoutUser = createAsyncThunk("AUTH/LOGOUT", async () => {
    localStorage.removeItem('user')
})



export const refreshUser = createAsyncThunk("AUTH/REFRESH", async (_, thunkAPI) => {
    try {
        const { user } = thunkAPI.getState().auth
        if (!user?.token) return thunkAPI.rejectWithValue("No token")
        const axios = (await import("../api/axiosInstance")).default
        const res = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        const updated = { ...user, ...res.data }
        localStorage.setItem("user", JSON.stringify(updated))
        return updated
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message)
    }
})
