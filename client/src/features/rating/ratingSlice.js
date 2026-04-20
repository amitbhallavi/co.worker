import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import API from "../api/axiosInstance"

const BASE = "/api/ratings"
const authH = (token) => ({ headers: { Authorization: `Bearer ${token}` } })
const errMsg = (e) => e?.response?.data?.error || e?.message || "Something went wrong"

// ── THUNKS ────────────────────────────────────────────────

export const fetchRatings = createAsyncThunk(
    "rating/fetchRatings",
    async ({ userId, sort = "latest", filter = "all" }, thunkAPI) => {
        try {
            const res = await API.get(`${BASE}/${userId}?sort=${sort}&filter=${filter}`)
            return res.data
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

export const fetchRatingSummary = createAsyncThunk(
    "rating/fetchRatingSummary",
    async ({ userId }, thunkAPI) => {
        try {
            const res = await API.get(`${BASE}/user/${userId}/summary`)
            return res.data
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

export const createRating = createAsyncThunk(
    "rating/createRating",
    async ({ targetUserId, rating, review, projectId }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.post(
                BASE,
                { targetUserId, rating, review, projectId: projectId || null },
                authH(token)
            )
            return res.data
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

export const updateRating = createAsyncThunk(
    "rating/updateRating",
    async ({ ratingId, rating, review }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.put(`${BASE}/${ratingId}`, { rating, review }, authH(token))
            return res.data
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

export const deleteRating = createAsyncThunk(
    "rating/deleteRating",
    async (ratingId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.delete(`${BASE}/${ratingId}`, authH(token))
            return { ratingId, ...res.data }
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

export const reportRating = createAsyncThunk(
    "rating/reportRating",
    async ({ ratingId, reason }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user?.token
            const res = await API.post(`${BASE}/${ratingId}/report`, { reason }, authH(token))
            return res.data
        } catch (e) {
            return thunkAPI.rejectWithValue(errMsg(e))
        }
    }
)

// ── INITIAL STATE ─────────────────────────────────────────

const initialState = {
    ratings: [],           // ✅ FIX: was 'rating' — caused s.ratings crash everywhere
    averageRating: 0,
    totalReviews: 0,
    verifiedReviews: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    sort: "latest",
    filter: "all",
    loading: false,
    success: false,
    error: false,
    errorMsg: "",
}

// ── HELPERS ───────────────────────────────────────────────

const setPending = (s) => {
    s.loading = true
    s.success = false
    s.error = false
    s.errorMsg = ""
}

const setError = (s, action) => {
    s.loading = false
    s.error = true
    s.errorMsg = action.payload
}

// ── SLICE ─────────────────────────────────────────────────

const ratingSlice = createSlice({
    name: "rating",
    initialState,
    reducers: {
        resetRating: (s) => {
            s.loading = false
            s.success = false
            s.error = false
            s.errorMsg = ""
        },
        clearSuccess: (s) => {
            s.success = false
        },
        setSortFilter: (s, a) => {
            if (a.payload.sort) s.sort = a.payload.sort
            if (a.payload.filter) s.filter = a.payload.filter
        },
        addRatingSocket: (s, a) => {
            if (
                a.payload?._id &&
                a.payload?.rater &&
                !s.ratings.find(r => r._id === a.payload._id)
            ) {
                s.ratings.unshift(a.payload)
                s.totalReviews = a.payload.totalReviews || s.totalReviews + 1
                s.averageRating = a.payload.averageRating || s.averageRating
                if (a.payload.isVerified) s.verifiedReviews += 1
            }
        },
        updateRatingSocket: (s, a) => {
            const idx = s.ratings.findIndex(r => r._id === a.payload._id)
            if (idx !== -1) {
                s.ratings[idx] = a.payload
                s.averageRating = a.payload.averageRating || s.averageRating
            }
        },
        deleteRatingSocket: (s, a) => {
            s.ratings = s.ratings.filter(r => r._id !== a.payload.ratingId)
            s.totalReviews = a.payload.totalReviews || s.totalReviews - 1
            s.averageRating = a.payload.averageRating || s.averageRating
        },
    },
    extraReducers: (b) => {
        b
            // ── Fetch Ratings
            .addCase(fetchRatings.pending, setPending)
            .addCase(fetchRatings.fulfilled, (s, a) => {
                s.loading = false
                s.success = false   // ✅ false — loop avoid
                s.ratings = a.payload  || []
                s.averageRating = a.payload.averageRating || 0
                s.totalReviews = a.payload.totalReviews || 0
                s.verifiedReviews = a.payload.verifiedReviews || 0
                s.breakdown = a.payload.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            })
            .addCase(fetchRatings.rejected, setError)

            // ── Fetch Summary
            .addCase(fetchRatingSummary.pending, (s) => { s.loading = true })
            .addCase(fetchRatingSummary.fulfilled, (s, a) => {
                s.loading = false
                s.averageRating = a.payload.averageRating || 0
                s.totalReviews = a.payload.totalReviews || 0
                s.verifiedReviews = a.payload.verifiedReviews || 0
                s.breakdown = a.payload.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            })
            .addCase(fetchRatingSummary.rejected, setError)

            // ── Create Rating
            .addCase(createRating.pending, setPending)
            .addCase(createRating.fulfilled, (s, a) => {
                s.loading = false
                 s.ratings = a.payload // ✅ was 'true' — this caused infinite loop in useEffect of RatingSummary.jsx
                // const newRating = a.payload?.rating || a.payload
                // if (newRating?._id && newRating?.rater) {
                //     s.ratings.unshift(newRating)
                //     s.totalReviews = a.payload.totalReviews || s.totalReviews + 1
                //     const star = String(newRating.rating)
                //     if (s.breakdown[star] !== undefined) s.breakdown[star]++
                //     if (newRating.isVerified) s.verifiedReviews++
                // }
                s.averageRating = a.payload?.averageRating || s.averageRating
            })
            .addCase(createRating.rejected, setError)

            // ── Update Rating
            .addCase(updateRating.pending, setPending)
            .addCase(updateRating.fulfilled, (s, a) => {
                s.loading = false
                s.success = true
                const updated = a.payload?.rating || a.payload
                if (updated?._id) {
                    const idx = s.ratings.findIndex(r => r._id === updated._id)
                    if (idx !== -1) {
                        const old = s.ratings[idx]
                        if (old.rating !== updated.rating) {
                            const oldStar = String(old.rating)
                            const newStar = String(updated.rating)
                            if (s.breakdown[oldStar] !== undefined) s.breakdown[oldStar]--
                            if (s.breakdown[newStar] !== undefined) s.breakdown[newStar]++
                        }
                        s.ratings[idx] = updated
                    }
                }
                s.averageRating = a.payload?.averageRating || s.averageRating
            })
            .addCase(updateRating.rejected, setError)

            // ── Delete Rating
            .addCase(deleteRating.pending, setPending)
            .addCase(deleteRating.fulfilled, (s, a) => {
                s.loading = false
                s.success = true
                s.ratings = s.ratings.filter(r => r._id !== a.payload.ratingId)
                if (s.ratings.length > 0) {
                    const total = s.ratings.reduce((sum, r) => sum + r.rating, 0)
                    s.averageRating = parseFloat((total / s.ratings.length).toFixed(1))
                } else {
                    s.averageRating = 0
                }
                s.totalReviews = a.payload.totalReviews || s.totalReviews - 1
            })
            .addCase(deleteRating.rejected, setError)

            // ── Report Rating
            .addCase(reportRating.pending, (s) => { s.loading = true })
            .addCase(reportRating.fulfilled, (s) => {
                s.loading = false
                s.success = true
            })
            .addCase(reportRating.rejected, setError)
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