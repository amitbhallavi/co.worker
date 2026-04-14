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

    // ── GET FREELANCER (single) ──────────────────────────
    builder
      .addCase(getFreelancer.pending, state => {
        state.freelancerLoading = true
        state.freelancerSuccess = false
        state.freelancerError = false
      })
      .addCase(getFreelancer.fulfilled, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = false   // ✅ true mat karo — unnecessary re-renders
        state.freelancerError = false
        state.freelancer = action.payload // { profile, previousWorks }
      })
      .addCase(getFreelancer.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = false
        state.freelancerError = false     // ✅ false — non-freelancer pe toast mat dikho
        state.freelancerErrorMessage = ""
      })

    // ── BECOME FREELANCER ────────────────────────────────
    builder
      .addCase(becomeFreelancerThunk.pending, state => {
        state.freelancerLoading = true
        state.freelancerSuccess = false
        state.freelancerError = false
      })
      .addCase(becomeFreelancerThunk.fulfilled, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = true
        state.freelancerError = false
        state.freelancer = {
          profile: action.payload.freelancer?.profile || action.payload.freelancer,
          previousWorks: action.payload.freelancer?.previousWorks || [],
        }
      })
      .addCase(becomeFreelancerThunk.rejected, (state, action) => {
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
    builder
      .addCase(applyForProject.pending, state => {
        state.freelancerLoading = true
        state.freelancerSuccess = false
        state.freelancerError = false
      })
      .addCase(applyForProject.fulfilled, (state, action) => {
        state.freelancerLoading = false
        state.freelancerSuccess = true
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
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const getFreelancer = createAsyncThunk(
  'FETCH/FREELANCER',
  async (id, thunkAPI) => {
    try {
      return await freelancerService.fetchFreelancer(id)
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const becomeFreelancerThunk = createAsyncThunk(
  'BECOME/FREELANCER',
  async (formData, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token
    try {
      return await freelancerService.becomeFreelancer(formData, token)
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
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
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
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
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
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
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)