import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getApiErrorMessage, getAuthToken } from "../api/apiHelpers"
import ratingService from "./ratingService"

const emptyBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

const initialState = {
    ratings: [],
    averageRating: 0,
    totalReviews: 0,
    verifiedReviews: 0,
    breakdown: emptyBreakdown,
    sort: "latest",
    filter: "all",
    loading: false,
    success: false,
    error: false,
    errorMsg: "",
}

export const fetchRatings = createAsyncThunk(
    "rating/fetchRatings",
    async ({ userId, sort = "latest", filter = "all" }, thunkAPI) => {
        try {
            return await ratingService.fetchRatings({ userId, sort, filter })
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const fetchRatingSummary = createAsyncThunk(
    "rating/fetchRatingSummary",
    async ({ userId }, thunkAPI) => {
        try {
            return await ratingService.fetchSummary(userId)
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const createRating = createAsyncThunk(
    "rating/createRating",
    async ({ targetUserId, rating, review, projectId }, thunkAPI) => {
        try {
            return await ratingService.createRating(
                { targetUserId, rating, review, projectId: projectId || null },
                getAuthToken(thunkAPI)
            )
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const updateRating = createAsyncThunk(
    "rating/updateRating",
    async ({ ratingId, rating, review }, thunkAPI) => {
        try {
            return await ratingService.updateRating({ ratingId, rating, review }, getAuthToken(thunkAPI))
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

export const deleteRating = createAsyncThunk("rating/deleteRating", async (ratingId, thunkAPI) => {
    try {
        const response = await ratingService.deleteRating(ratingId, getAuthToken(thunkAPI))
        return { ratingId, ...response }
    } catch (error) {
        return thunkAPI.rejectWithValue(getApiErrorMessage(error))
    }
})

export const reportRating = createAsyncThunk(
    "rating/reportRating",
    async ({ ratingId, reason }, thunkAPI) => {
        try {
            return await ratingService.reportRating({ ratingId, reason }, getAuthToken(thunkAPI))
        } catch (error) {
            return thunkAPI.rejectWithValue(getApiErrorMessage(error))
        }
    }
)

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

const applySummary = (state, payload = {}) => {
    state.averageRating = payload.averageRating || 0
    state.totalReviews = payload.totalReviews || 0
    state.verifiedReviews = payload.verifiedReviews || 0
    state.breakdown = payload.breakdown || { ...emptyBreakdown }
}

const ratingSlice = createSlice({
    name: "rating",
    initialState,
    reducers: {
        resetRating: (state) => {
            state.loading = false
            state.success = false
            state.error = false
            state.errorMsg = ""
        },
        clearSuccess: (state) => {
            state.success = false
        },
        setSortFilter: (state, action) => {
            if (action.payload.sort) {
                state.sort = action.payload.sort
            }

            if (action.payload.filter) {
                state.filter = action.payload.filter
            }
        },
        addRatingSocket: (state, action) => {
            const rating = action.payload

            if (!rating?._id || !rating.rater || state.ratings.find((item) => item._id === rating._id)) {
                return
            }

            state.ratings.unshift(rating)
            state.totalReviews = rating.totalReviews || state.totalReviews + 1
            state.averageRating = rating.averageRating || state.averageRating

            const star = String(rating.rating)
            if (state.breakdown[star] !== undefined) {
                state.breakdown[star] += 1
            }

            if (rating.isVerified) {
                state.verifiedReviews += 1
            }
        },
        updateRatingSocket: (state, action) => {
            const nextRating = action.payload
            const index = state.ratings.findIndex((rating) => rating._id === nextRating._id)

            if (index === -1) {
                return
            }

            const previousRating = state.ratings[index]
            const previousStar = String(previousRating.rating)
            const nextStar = String(nextRating.rating)

            if (previousStar !== nextStar) {
                if (state.breakdown[previousStar] !== undefined) {
                    state.breakdown[previousStar] -= 1
                }

                if (state.breakdown[nextStar] !== undefined) {
                    state.breakdown[nextStar] += 1
                }
            }

            state.ratings[index] = { ...previousRating, ...nextRating }
            state.averageRating = nextRating.averageRating || state.averageRating
        },
        deleteRatingSocket: (state, action) => {
            const deletedRating = state.ratings.find((rating) => rating._id === action.payload.ratingId)
            state.ratings = state.ratings.filter((rating) => rating._id !== action.payload.ratingId)
            state.totalReviews = action.payload.totalReviews || Math.max(0, state.totalReviews - 1)
            state.averageRating = action.payload.averageRating || state.averageRating

            if (deletedRating) {
                const star = String(deletedRating.rating)

                if (state.breakdown[star] !== undefined) {
                    state.breakdown[star] = Math.max(0, state.breakdown[star] - 1)
                }

                if (deletedRating.isVerified) {
                    state.verifiedReviews = Math.max(0, state.verifiedReviews - 1)
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRatings.pending, startRequest)
            .addCase(fetchRatings.fulfilled, (state, action) => {
                state.loading = false
                state.success = false
                state.ratings = Array.isArray(action.payload.ratings) ? action.payload.ratings : []
                applySummary(state, action.payload)
            })
            .addCase(fetchRatings.rejected, failRequest)

            .addCase(fetchRatingSummary.pending, (state) => {
                state.loading = true
                state.error = false
                state.errorMsg = ""
            })
            .addCase(fetchRatingSummary.fulfilled, (state, action) => {
                state.loading = false
                applySummary(state, action.payload)
            })
            .addCase(fetchRatingSummary.rejected, failRequest)

            .addCase(createRating.pending, startRequest)
            .addCase(createRating.fulfilled, (state, action) => {
                state.loading = false
                state.success = true

                const nextRating = action.payload.rating || action.payload
                if (nextRating?._id && !state.ratings.find((rating) => rating._id === nextRating._id)) {
                    state.ratings.unshift(nextRating)
                }

                state.averageRating = action.payload.averageRating || state.averageRating
                state.totalReviews = action.payload.totalReviews || state.totalReviews
            })
            .addCase(createRating.rejected, failRequest)

            .addCase(updateRating.pending, startRequest)
            .addCase(updateRating.fulfilled, (state, action) => {
                state.loading = false
                state.success = true

                const updatedRating = action.payload.rating || action.payload
                const index = state.ratings.findIndex((rating) => rating._id === updatedRating._id)

                if (index !== -1) {
                    const currentRating = state.ratings[index]
                    const currentStar = String(currentRating.rating)
                    const nextStar = String(updatedRating.rating)

                    if (currentStar !== nextStar) {
                        if (state.breakdown[currentStar] !== undefined) {
                            state.breakdown[currentStar] -= 1
                        }

                        if (state.breakdown[nextStar] !== undefined) {
                            state.breakdown[nextStar] += 1
                        }
                    }

                    state.ratings[index] = updatedRating
                }

                state.averageRating = action.payload.averageRating || state.averageRating
                state.totalReviews = action.payload.totalReviews || state.totalReviews
            })
            .addCase(updateRating.rejected, failRequest)

            .addCase(deleteRating.pending, startRequest)
            .addCase(deleteRating.fulfilled, (state, action) => {
                state.loading = false
                state.success = true

                const deletedRating = state.ratings.find((rating) => rating._id === action.payload.ratingId)
                state.ratings = state.ratings.filter((rating) => rating._id !== action.payload.ratingId)

                if (deletedRating) {
                    const star = String(deletedRating.rating)

                    if (state.breakdown[star] !== undefined) {
                        state.breakdown[star] = Math.max(0, state.breakdown[star] - 1)
                    }
                }

                state.averageRating = action.payload.averageRating || state.averageRating
                state.totalReviews = action.payload.totalReviews || Math.max(0, state.totalReviews - 1)
            })
            .addCase(deleteRating.rejected, failRequest)

            .addCase(reportRating.pending, (state) => {
                state.loading = true
                state.error = false
                state.errorMsg = ""
            })
            .addCase(reportRating.fulfilled, (state) => {
                state.loading = false
                state.success = true
            })
            .addCase(reportRating.rejected, failRequest)
    },
})

export const {
    resetRating,
    clearSuccess,
    setSortFilter,
    addRatingSocket,
    updateRatingSocket,
    deleteRatingSocket,
} = ratingSlice.actions

export default ratingSlice.reducer
