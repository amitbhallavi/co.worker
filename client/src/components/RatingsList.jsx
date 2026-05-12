import React, { useState } from 'react'
import RatingCard from './RatingCard'

/**
 * RatingsList - Container for displaying a list of reviews with filtering & sorting
 * Props:
 *   - ratings: array of rating objects
 *   - loading: boolean (show loading skeleton)
 *   - currentUserId: string (to determine if user can edit/delete)
 *   - onEdit: function(rating) callback
 *   - breakdown: object { 5: count, 4: count, ... } (for filter buttons)
 *   - onFilterChange: function(filter) callback
 *   - onSortChange: function(sort) callback
 *   - initialFilter: string (default: 'all')
 *   - initialSort: string (default: 'latest')
 */
const RatingsList = ({
    ratings = [],
    loading = false,
    currentUserId,
    onEdit,
    breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    onFilterChange,
    onSortChange,
    initialFilter = 'all',
    initialSort = 'latest',
}) => {
    const [filter, setFilter] = useState(initialFilter)
    const [sort, setSort] = useState(initialSort)

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter)
        onFilterChange?.(newFilter)
    }

    const handleSortChange = (newSort) => {
        setSort(newSort)
        onSortChange?.(newSort)
    }

    // Loading Skeleton
    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse rounded-xl border border-slate-200 p-4 dark:border-white/10">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
                            <div className="flex-1 space-y-3">
                                <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-white/10" />
                                <div className="h-3 rounded bg-slate-100 dark:bg-white/[0.07]" />
                                <div className="h-3 w-5/6 rounded bg-slate-100 dark:bg-white/[0.07]" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Empty State
    if (!ratings || ratings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-12 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="text-5xl mb-3">⭐</div>
                <h3 className="mb-1 text-lg font-bold text-slate-950 dark:text-white">No reviews yet</h3>
                <p className="max-w-sm text-center text-slate-600 dark:text-white/55">
                    Be the first to share your experience with this user
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Filter & Sort Controls */}
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                {/* Rating Filter */}
                <div>
                    <p className="mb-2 text-sm font-bold text-slate-800 dark:text-white">Filter by Rating</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleFilterChange('all')}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                                filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.07]'
                            }`}
                        >
                            All ({ratings.length})
                        </button>
                        {[5, 4, 3, 2, 1].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleFilterChange(String(star))}
                                className={`flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                                    filter === String(star)
                                        ? 'bg-yellow-500 text-white'
                                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.07]'
                                }`}
                            >
                                {star}★ ({breakdown[star]})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Options */}
                <div>
                    <p className="mb-2 text-sm font-bold text-slate-800 dark:text-white">Sort by</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleSortChange('latest')}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                                sort === 'latest'
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.07]'
                            }`}
                        >
                            Latest
                        </button>
                        <button
                            onClick={() => handleSortChange('highest')}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                                sort === 'highest'
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.07]'
                            }`}
                        >
                            Highest Rated
                        </button>
                        <button
                            onClick={() => handleSortChange('lowest')}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                                sort === 'lowest'
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.07]'
                            }`}
                        >
                            Lowest Rated
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
                {ratings && ratings.length > 0 ? (
                    ratings.map((rating) => {
                        // Defensive check: skip if rating is null/undefined or missing rater
                        if (!rating || !rating._id || !rating.rater) {
                            console.warn('[RatingsList] Skipping invalid rating:', rating)
                            return null
                        }
                        const isOwnRating = currentUserId && rating.rater?._id === currentUserId
                        return (
                            <RatingCard
                                key={rating._id}
                                rating={rating}
                                isOwnRating={isOwnRating}
                                onEdit={onEdit}
                            />
                        )
                    })
                ) : null}
            </div>
        </div>
    )
}

export default RatingsList
