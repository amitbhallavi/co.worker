import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import freelancerService from './freelancerService'

const initialState = {
  freelancers: [],
  freelancer: {},
  freelancerLoading: false,
  freelancerSuccess: false,
  freelancerError: false,
  freelancerErrorMessage: "",
}

const freelancerSlice = createSlice({
  name: 'freelancer',
  initialState,
  reducers: {
    // ✅ reset success so useEffect re-trigger works properly
    resetFreelancerSuccess: state => {
      state.freelancerSuccess = false
    }
  },
  extraReducers: builder => {

    // ── GET FREELANCERS ──────────────────────────────────
    builder
      .addCase(getFreelancers.pending, state => {
        state.freelancerLoading = true
        state.freelancerSuccess = false
        state.freelancerError = false
      })
      .addCase(getFreelancers.fulfilled, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = true
        state.freelancerError = false
        state.freelancers = action.payload
      })
      .addCase(getFreelancers.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = false
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
      })

    // ── GET FREELANCER ───────────────────────────────────
    builder
      .addCase(getFreelancer.pending, state => {
        state.freelancerLoading = true
        state.freelancerSuccess = false
        state.freelancerError = false
      })
      .addCase(getFreelancer.fulfilled, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = true
        state.freelancerError = false
        state.freelancer = action.payload
      })
      .addCase(getFreelancer.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = false
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
      })

    // ── ADD PREVIOUS PROJECT ─────────────────────────────
    builder
      .addCase(addPreviousProject.pending, state => {
        state.freelancerLoading = true
        state.freelancerSuccess = false
        state.freelancerError = false
      })
      .addCase(addPreviousProject.fulfilled, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = true
        state.freelancerError = false
        state.freelancer.previousWorks = [
          ...(state.freelancer.previousWorks || []),
          action.payload
        ]
      })
      .addCase(addPreviousProject.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = false
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
      })

    // ── REMOVE PREVIOUS WORK ─────────────────────────────
    builder
      .addCase(removePreviousWork.pending, state => {
        state.freelancerLoading = true
        state.freelancerSuccess = false
        state.freelancerError = false
      })
      .addCase(removePreviousWork.fulfilled, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = true
        state.freelancerError = false
        state.freelancer.previousWorks = state.freelancer.previousWorks.filter(
          work => work._id !== action.payload.workId
        )
      })
      .addCase(removePreviousWork.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = false
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
      })

    // ── APPLY FOR BID ────────────────────────────────────
    // ✅ FIX: these cases were MISSING — bid submit ke baad state update nahi hota tha
    builder
      .addCase(applyForProject.pending, state => {
        state.freelancerLoading = true
        state.freelancerSuccess = false
        state.freelancerError = false
      })
      .addCase(applyForProject.fulfilled, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = true   // ✅ yeh true hoga toh FindWork ka useEffect chalega
        state.freelancerError = false
      })
      .addCase(applyForProject.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = false
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
      })
  }
})

export const { resetFreelancerSuccess } = freelancerSlice.actions
export default freelancerSlice.reducer

// ── THUNKS ────────────────────────────────────────────────

export const getFreelancers = createAsyncThunk(
  'FETCH/FREELANCERS',
  async (_, thunkAPI) => {
    try {
      return await freelancerService.fetchFreelancers()
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const getFreelancer = createAsyncThunk(
  'FETCH/FREELANCER',
  async (id, thunkAPI) => {
    try {
      return await freelancerService.fetchFreelancer(id)
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const addPreviousProject = createAsyncThunk(
  'ADD/PROJECT',
  async (formData, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token
    try {
      return await freelancerService.addProject(formData, token)
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const removePreviousWork = createAsyncThunk(
  'REMOVE/PREVIOUS/WORK',
  async (id, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token
    try {
      return await freelancerService.removeWork(id, token)
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const applyForProject = createAsyncThunk(
  'APPLY/PROJECT/BID',
  async (formData, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token
    try {
      return await freelancerService.applyForBid(formData, token)
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)