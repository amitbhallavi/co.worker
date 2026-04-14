// ===== FILE: client/src/features/Freelancer/freelancerSlice.js =====

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import freelancerService from "./freelancerService"

const initialState = {
  freelancers: [],   // ✅ always array — never undefined
  freelancer: {},
  freelancerLoading: false,
  freelancerSuccess: false,
  freelancerError: false,
  freelancerErrorMessage: "",
}

// ─── Helper ───────────────────────────────────────────────────────────────────
const errMsg = (error) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong"

// ══════════════════════════════════════════════════════════════════════════════
// SLICE
// ══════════════════════════════════════════════════════════════════════════════
const freelancerSlice = createSlice({
  name: "freelancer",
  initialState,
  reducers: {
    resetFreelancerSuccess: state => { state.freelancerSuccess = false },
    resetFreelancerError: state => { state.freelancerError = false; state.freelancerErrorMessage = "" },
  },
  extraReducers: builder => {

    // ── GET FREELANCERS ──────────────────────────────────────────────────────
    builder
      .addCase(getFreelancers.pending, state => {
        state.freelancerLoading = true
        state.freelancerSuccess = false
        state.freelancerError = false
      })
      .addCase(getFreelancers.fulfilled, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = true
        // ✅ Always store an array — never let it be null/undefined
        state.freelancers = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(getFreelancers.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
        state.freelancers = []   // ✅ reset to empty array on error
      })

    // ── GET SINGLE FREELANCER ────────────────────────────────────────────────
    builder
      .addCase(getFreelancer.pending, state => {
        state.freelancerLoading = true
        state.freelancerSuccess = false
        state.freelancerError = false
      })
      .addCase(getFreelancer.fulfilled, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = true
        state.freelancer = action.payload || {}
      })
      .addCase(getFreelancer.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
      })

    // ── BECOME FREELANCER ────────────────────────────────────────────────────
    builder
      .addCase(becomeFreelancerThunk.pending, state => {
        state.freelancerLoading = true
        state.freelancerSuccess = false
        state.freelancerError = false
      })
      .addCase(becomeFreelancerThunk.fulfilled, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = true
        state.freelancer = {
          profile: action.payload.freelancer?.profile || action.payload.freelancer,
          previousWorks: action.payload.freelancer?.previousWorks || [],
        }
      })
      .addCase(becomeFreelancerThunk.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
      })

    // ── ADD PREVIOUS PROJECT ─────────────────────────────────────────────────
    builder
      .addCase(addPreviousProject.pending, state => {
        state.freelancerLoading = true
        state.freelancerSuccess = false
        state.freelancerError = false
      })
      .addCase(addPreviousProject.fulfilled, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = true
        state.freelancer.previousWorks = [
          ...(state.freelancer.previousWorks || []),
          action.payload,
        ]
      })
      .addCase(addPreviousProject.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
      })

    // ── REMOVE PREVIOUS WORK ─────────────────────────────────────────────────
    builder
      .addCase(removePreviousWork.pending, state => {
        state.freelancerLoading = true
        state.freelancerSuccess = false
        state.freelancerError = false
      })
      .addCase(removePreviousWork.fulfilled, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = true
        state.freelancer.previousWorks = (state.freelancer.previousWorks || []).filter(
          w => w._id !== action.payload.workId
        )
      })
      .addCase(removePreviousWork.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
      })

    // ── APPLY FOR BID ────────────────────────────────────────────────────────
    builder
      .addCase(applyForProject.pending, state => {
        state.freelancerLoading = true
        state.freelancerSuccess = false
        state.freelancerError = false
      })
      .addCase(applyForProject.fulfilled, state => {
        state.freelancerLoading = false
        state.freelancerSuccess = true
      })
      .addCase(applyForProject.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
      })
  },
})

export const { resetFreelancerSuccess, resetFreelancerError } = freelancerSlice.actions
export default freelancerSlice.reducer

// ══════════════════════════════════════════════════════════════════════════════
// THUNKS
// ══════════════════════════════════════════════════════════════════════════════

export const getFreelancers = createAsyncThunk(
  "FETCH/FREELANCERS",
  async (_, thunkAPI) => {
    try {
      return await freelancerService.fetchFreelancers()
    } catch (error) {
      return thunkAPI.rejectWithValue(errMsg(error))
    }
  }
)

export const getFreelancer = createAsyncThunk(
  "FETCH/FREELANCER",
  async (id, thunkAPI) => {
    try {
      return await freelancerService.fetchFreelancer(id)
    } catch (error) {
      return thunkAPI.rejectWithValue(errMsg(error))
    }
  }
)

export const becomeFreelancerThunk = createAsyncThunk(
  "BECOME/FREELANCER",
  async (formData, thunkAPI) => {
    const token = thunkAPI.getState().auth.user?.token
    try {
      return await freelancerService.becomeFreelancer(formData, token)
    } catch (error) {
      return thunkAPI.rejectWithValue(errMsg(error))
    }
  }
)

export const addPreviousProject = createAsyncThunk(
  "ADD/PROJECT",
  async (formData, thunkAPI) => {
    const token = thunkAPI.getState().auth.user?.token
    try {
      return await freelancerService.addProject(formData, token)
    } catch (error) {
      return thunkAPI.rejectWithValue(errMsg(error))
    }
  }
)

export const removePreviousWork = createAsyncThunk(
  "REMOVE/PREVIOUS/WORK",
  async (id, thunkAPI) => {
    const token = thunkAPI.getState().auth.user?.token
    try {
      return await freelancerService.removeWork(id, token)
    } catch (error) {
      return thunkAPI.rejectWithValue(errMsg(error))
    }
  }
)

export const applyForProject = createAsyncThunk(
  "APPLY/PROJECT/BID",
  async (formData, thunkAPI) => {
    const token = thunkAPI.getState().auth.user?.token
    try {
      return await freelancerService.applyForBid(formData, token)
    } catch (error) {
      return thunkAPI.rejectWithValue(errMsg(error))
    }
  }
)