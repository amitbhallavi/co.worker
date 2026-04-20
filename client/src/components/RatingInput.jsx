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
            className={`text-5xl transition-all transform hover:scale-110 ${
                i < displayRating ? 'text-yellow-400 drop-shadow-md' : 'text-gray-300'
            }`}
        >
            ⭐
        </button>
    ))

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                    {mode === 'edit' ? 'Edit Your Review' : 'Write a Review'}
                </h3>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Your Rating {displayRating > 0 && `(${displayRating}/5)`}
                    </label>
                    <div className="flex gap-3">{stars}</div>
                    {errors.rating && (
                        <p className="text-red-500 text-xs mt-2">{errors.rating}</p>
                    )}
                </div>

                {/* Review Textarea */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                    </label>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience... (minimum 20 characters)"
                        rows="5"
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none resize-none ${
                            errors.review
                                ? 'border-red-300 focus:border-red-500 bg-red-50'
                                : 'border-gray-200 focus:border-blue-500 bg-gray-50'
                        }`}
                    />
                    <div className="flex justify-between mt-2">
                        <p className={`text-xs ${errors.review ? 'text-red-500' : 'text-gray-500'}`}>
                            {errors.review || `${reviewText.length} characters`}
                        </p>
                        {reviewText.length >= 20 && (
                            <p className="text-xs text-green-500 font-medium">✓ Good to go</p>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && errorMsg && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-sm text-red-700">{errorMsg}</p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                            className="px-6 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
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
