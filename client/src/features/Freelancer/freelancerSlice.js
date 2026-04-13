import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import freelancerService from './freelancerService'

// ✅ FIXED INITIAL STATE (VERY IMPORTANT)
const initialState = {
  freelancers: [],
  freelancer: {
    profile: {},
    previousWorks: []   // ✅ always array
  },
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
    },
    resetFreelancerError: state => {
      state.freelancerError = false
      state.freelancerErrorMessage = ""
    },
  },
  extraReducers: builder => {

    // ── GET FREELANCERS ─────────────────────────────
    builder
      .addCase(getFreelancers.pending, state => {
        state.freelancerLoading = true
      })
      .addCase(getFreelancers.fulfilled, (state, action) => {
        state.freelancerLoading = false
        state.freelancers = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(getFreelancers.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
      })

    // ── GET FREELANCER ─────────────────────────────
    builder
      .addCase(getFreelancer.pending, state => {
        state.freelancerLoading = true
      })
      .addCase(getFreelancer.fulfilled, (state, action) => {
        state.freelancerLoading = false

        state.freelancer = {
          profile: action.payload?.profile || {},
          previousWorks: Array.isArray(action.payload?.previousWorks)
            ? action.payload.previousWorks
            : []
        }
      })
      .addCase(getFreelancer.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
      })

    // ── BECOME FREELANCER ─────────────────────────
    builder
      .addCase(becomeFreelancerThunk.pending, state => {
        state.freelancerLoading = true
      })
      .addCase(becomeFreelancerThunk.fulfilled, (state, action) => {
        state.freelancerLoading = false

        state.freelancer = {
          profile: action.payload?.freelancer?.profile || {},
          previousWorks: Array.isArray(action.payload?.freelancer?.previousWorks)
            ? action.payload.freelancer.previousWorks
            : []
        }
      })
      .addCase(becomeFreelancerThunk.rejected, (state, action) => {
        state.freelancerLoading = false
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
      })

    // ── ADD WORK ──────────────────────────────────
    builder
      .addCase(addPreviousProject.fulfilled, (state, action) => {
        const current = Array.isArray(state.freelancer.previousWorks)
          ? state.freelancer.previousWorks
          : []

        state.freelancer.previousWorks = [...current, action.payload]
      })

    // ── REMOVE WORK (🔥 MAIN FIX) ────────────────
    builder
      .addCase(removePreviousWork.fulfilled, (state, action) => {

        const current = Array.isArray(state.freelancer.previousWorks)
          ? state.freelancer.previousWorks
          : []

        state.freelancer.previousWorks = current.filter(
          work => work._id !== action.payload.workId
        )
      })

    // ── APPLY BID ────────────────────────────────
    builder
      .addCase(applyForProject.fulfilled, state => {
        state.freelancerSuccess = true
      })
      .addCase(applyForProject.rejected, (state, action) => {
        state.freelancerError = true
        state.freelancerErrorMessage = action.payload
      })
  }
})

export const { resetFreelancerSuccess, resetFreelancerError } = freelancerSlice.actions
export default freelancerSlice.reducer