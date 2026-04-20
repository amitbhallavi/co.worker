// ✅ Yeh poora RatingSummary.jsx replace karo
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRatings, clearSuccess } from '../features/rating/ratingSlice'
import RatingDisplay from './RatingDisplay'
import RatingInput from './RatingInput'
import RatingsList from './RatingsList'
import LoaderDots from './LoaderDots'

const RatingSummary = ({
    userId,
    currentUserId,
    userType = 'freelancer',
    onRatingChange,
}) => {
    const dispatch = useDispatch()

    const {
        ratings,
        averageRating,
        totalReviews,
        verifiedReviews,
        breakdown,
        loading,
        error,
        success,
        sort,
        filter,
    } = useSelector((s) => s.rating)

    // ✅ Safe fallbacks
    const safeRatings = Array.isArray(ratings) ? ratings : []
    const safeTotalReviews = typeof totalReviews === 'number' ? totalReviews : 0
    const safeAverage = typeof averageRating === 'number' ? averageRating : 0
    const safeVerified = typeof verifiedReviews === 'number' ? verifiedReviews : 0
    const safeBreakdown = breakdown && typeof breakdown === 'object'
        ? breakdown
        : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

    const [showReviewForm, setShowReviewForm] = useState(false)
    const [editingRating, setEditingRating] = useState(null)

    // ✅ Initial fetch
    useEffect(() => {
        if (userId) {
            dispatch(fetchRatings({ userId, sort: 'latest', filter: 'all' }))
        }
    }, [userId, dispatch])

    // ✅ KEY FIX: success ke baad re-fetch karo — yahi problem hai
    // createRating success hoti hai but UI update nahi hota
    useEffect(() => {
        if (success && userId) {
            dispatch(fetchRatings({ userId, sort: sort || 'latest', filter: filter || 'all' }))
            dispatch(clearSuccess())
        }
    }, [success, userId, dispatch, sort, filter])

    const userRating = currentUserId && safeRatings.length > 0
        ? safeRatings.find((r) => r.rater?._id === currentUserId) || null
        : null

    const handleFilterChange = (newFilter) => {
        dispatch(fetchRatings({ userId, sort, filter: newFilter }))
    }

    const handleSortChange = (newSort) => {
        dispatch(fetchRatings({ userId, sort: newSort, filter }))
    }

    const handleReviewSuccess = () => {
        setShowReviewForm(false)
        setEditingRating(null)
        // ✅ Direct refetch after submit — don't wait for success state
        dispatch(fetchRatings({ userId, sort: 'latest', filter: 'all' }))
        onRatingChange?.()
    }

    const handleEditReview = (rating) => {
        setEditingRating(rating)
        setShowReviewForm(true)
    }

    if (loading && safeRatings.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <LoaderDots />
            </div>
        )
    }

    return (
        <div className="space-y-8 bg-white">

            {/* Rating Summary */}
            <section className="py-8 px-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <RatingDisplay
                    averageRating={safeAverage}
                    totalReviews={safeTotalReviews}
                    verifiedReviews={safeVerified}
                    breakdown={safeBreakdown}
                    onWriteReview={() => setShowReviewForm(!showReviewForm)}
                    showWriteButton={!userRating}
                    size="large"
                />

                {safeAverage >= 4.5 && safeTotalReviews >= 5 && (
                    <div className="mt-6 text-center">
                        <div className="inline-block bg-gradient-to-r from-amber-400 to-yellow-400 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg">
                            🏆 Top Rated {userType === 'freelancer' ? 'Freelancer' : 'Client'}
                        </div>
                    </div>
                )}

                {userRating && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-blue-700 bg-blue-100 px-4 py-2 rounded-lg inline-block">
                            ✓ You've already rated this user ({userRating.rating}★)
                        </p>
                    </div>
                )}
            </section>

            {/* Write Review Modal */}
            {showReviewForm && (
                <section className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <RatingInput
                            targetUserId={userId}
                            mode={editingRating ? 'edit' : 'create'}
                            initialRating={editingRating
                                ? { rating: editingRating.rating, review: editingRating.review }
                                : null
                            }
                            ratingId={editingRating?._id}
                            onSuccess={handleReviewSuccess}
                            onCancel={() => {
                                setShowReviewForm(false)
                                setEditingRating(null)
                            }}
                        />
                    </div>
                </section>
            )}

            {/* Reviews List */}
            {safeTotalReviews > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Recent Reviews ({safeTotalReviews})
                    </h2>
                    <RatingsList
                        ratings={safeRatings}
                        loading={loading}
                        currentUserId={currentUserId}
                        onEdit={handleEditReview}
                        breakdown={safeBreakdown}
                        onFilterChange={handleFilterChange}
                        onSortChange={handleSortChange}
                        initialFilter={filter}
                        initialSort={sort}
                    />
                </section>
            )}

            {/* Empty State */}
            {safeTotalReviews === 0 && !loading && (
                <div className="text-center py-12">
                    <div className="text-5xl mb-4">⭐</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-600 mb-4">Be the first to share your experience</p>
                    {!userRating && (
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all border-none cursor-pointer">
                            ✍️ Write First Review
                        </button>
                    )}
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">Failed to load reviews</p>
                </div>
            )}
        </div>
    )
}

export default RatingSummary