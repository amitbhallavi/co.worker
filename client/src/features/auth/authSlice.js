
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authService from "./authService";

let userExist = JSON.parse(localStorage.getItem('user'))

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
            .addCase(registerUser.pending, (state, ) => {
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
            .addCase(loginUser.pending, (state, ) => {
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

            .addCase(logoutUser.fulfilled, (state, ) => {
                state.isLoading = false
                state.isSuccess = false
                state.isError = false
                state.message = ""
                state.user = null

            })



    }
});

export const { } = authSlice.actions

export default authSlice.reducer;


// Register User -> 


export const registerUser = createAsyncThunk("AUTH/REGISTER", async (formData, thunkAPI) => {
    try {

        return await authService.register(formData)

    } catch (error) {

        const message = (error.response.data.message)
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


