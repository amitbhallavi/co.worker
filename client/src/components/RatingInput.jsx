import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createRating, updateRating } from '../features/rating/ratingSlice'
import { toast } from 'react-toastify'
import { X } from 'lucide-react'

/**
 * RatingInput - Form for submitting or editing a rating (OPEN SYSTEM)
 * Props:
 *   - targetUserId: string (ID of user being rated)
 *   - initialRating: { rating: number, review: string } (optional, for edit mode)
 *   - ratingId: string (required if editing)
 *   - mode: 'create' | 'edit' (default: 'create')
 *   - projectId: string (optional, for verified badge)
 *   - onSuccess: function() callback after successful submit
 *   - onCancel: function() callback to close form
 */
const RatingInput = ({
    targetUserId,
    initialRating = null,
    ratingId = null,
    mode = 'create',
    projectId = null,
    onSuccess,
    onCancel,
}) => {
    const dispatch = useDispatch()
    const { loading, error, errorMsg } = useSelector((s) => s.rating)

    const [selectedRating, setSelectedRating] = useState(initialRating?.rating || 0)
    const [hoverRating, setHoverRating] = useState(0)
    const [reviewText, setReviewText] = useState(initialRating?.review || '')
    const [errors, setErrors] = useState({})

    // Validation
    const validate = () => {
        const newErrors = {}
        if (selectedRating === 0) newErrors.rating = 'Please select a rating'
        if (reviewText.trim().length < 20) {
            newErrors.review = 'Review must be at least 20 characters'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        try {
            if (mode === 'edit') {
                await dispatch(
                    updateRating({
                        ratingId,
                        rating: selectedRating,
                        review: reviewText.trim(),
                    })
                ).unwrap()
                toast.success('Review updated successfully')
            } else {
                await dispatch(
                    createRating({
                        targetUserId,
                        rating: selectedRating,
                        review: reviewText.trim(),
                        projectId: projectId || null,
                    })
                ).unwrap()
                toast.success('Review submitted successfully')
            }
            onSuccess?.()
        } catch (err) {
            toast.error(err || 'Failed to save review')
        }
    }

    // Display reviewers' stars
    const displayRating = hoverRating || selectedRating
    const stars = Array.from({ length: 5 }).map((_, i) => (
        <button
            key={i}
            type="button"
            onClick={() => setSelectedRating(i + 1)}
            onMouseEnter={() => setHoverRating(i + 1)}
            onMouseLeave={() => setHoverRating(0)}
            className={`border-none bg-transparent text-5xl transition-all hover:scale-110 ${
                i < displayRating ? 'text-yellow-400 drop-shadow-md' : 'text-gray-300 dark:text-white/20'
            }`}
        >
            ⭐
        </button>
    ))

    return (
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/15 dark:border-white/10 dark:bg-[#0f172a] dark:shadow-black/30">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-950 dark:text-white">
                    {mode === 'edit' ? 'Edit Your Review' : 'Write a Review'}
                </h3>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-xl border-none bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/15 dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Selector */}
                <div>
                    <label className="mb-3 block text-sm font-medium text-slate-700 dark:text-white/75">
                        Your Rating {displayRating > 0 && `(${displayRating}/5)`}
                    </label>
                    <div className="flex gap-3">{stars}</div>
                    {errors.rating && (
                        <p className="text-red-500 text-xs mt-2">{errors.rating}</p>
                    )}
                </div>

                {/* Review Textarea */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/75">
                        Your Review
                    </label>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience... (minimum 20 characters)"
                        rows="5"
                        className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:text-white dark:placeholder:text-white/35 ${
                            errors.review
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200 dark:border-red-400/40 dark:bg-red-500/10 dark:focus:ring-red-400/20'
                                : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-100 dark:border-white/10 dark:bg-white/[0.05] dark:focus:border-cyan-300/50 dark:focus:ring-cyan-400/20'
                        }`}
                    />
                    <div className="flex justify-between mt-2">
                        <p className={`text-xs ${errors.review ? 'text-red-500 dark:text-red-300' : 'text-slate-500 dark:text-white/45'}`}>
                            {errors.review || `${reviewText.length} characters`}
                        </p>
                        {reviewText.length >= 20 && (
                            <p className="text-xs text-green-500 font-medium">✓ Good to go</p>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && errorMsg && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-400/20 dark:bg-red-500/10">
                        <p className="text-sm text-red-700 dark:text-red-200">{errorMsg}</p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border-none bg-gradient-to-r from-blue-600 to-cyan-500 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                Saving...
                            </>
                        ) : mode === 'edit' ? (
                            'Update Review'
                        ) : (
                            'Submit Review'
                        )}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-xl border border-slate-200 px-6 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.08]"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}

export default RatingInput
