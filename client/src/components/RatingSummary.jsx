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

    const safeRatings = Array.isArray(ratings) ? ratings : []
    const safeTotalReviews = typeof totalReviews === 'number' ? totalReviews : 0
    const safeAverage = typeof averageRating === 'number' ? averageRating : 0
    const safeVerified = typeof verifiedReviews === 'number' ? verifiedReviews : 0
    const safeBreakdown = breakdown && typeof breakdown === 'object'
        ? breakdown
        : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

    const [showReviewForm, setShowReviewForm] = useState(false)
    const [editingRating, setEditingRating] = useState(null)

    useEffect(() => {
        if (userId) {
            dispatch(fetchRatings({ userId, sort: 'latest', filter: 'all' }))
        }
    }, [userId, dispatch])

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
        <div className="space-y-8 bg-transparent text-slate-950 dark:text-white">

            {/* Rating Summary */}
            <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-6 py-8 shadow-sm dark:border-white/10 dark:from-white/[0.07] dark:via-white/[0.04] dark:to-cyan-400/[0.08] dark:shadow-none">
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
                        <p className="inline-block rounded-full border border-blue-200 bg-blue-100 px-4 py-2 text-sm text-blue-700 dark:border-blue-300/20 dark:bg-blue-400/10 dark:text-blue-100">
                            ✓ You've already rated this user ({userRating.rating}★)
                        </p>
                    </div>
                )}
            </section>

            {/* Write Review Modal */}
            {showReviewForm && (
                <section className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
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
                    <h2 className="mb-6 text-2xl font-bold text-slate-950 dark:text-white">
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
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-6 py-12 text-center dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="text-5xl mb-4">⭐</div>
                    <h3 className="mb-2 text-lg font-bold text-slate-950 dark:text-white">No reviews yet</h3>
                    <p className="mb-4 text-slate-600 dark:text-white/55">Be the first to share your experience</p>
                    {!userRating && (
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="inline-block cursor-pointer rounded-xl border-none bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                            ✍️ Write First Review
                        </button>
                    )}
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-400/20 dark:bg-red-500/10">
                    <p className="text-red-700 dark:text-red-200">Failed to load reviews</p>
                </div>
            )}
        </div>
    )
}

export default RatingSummary
