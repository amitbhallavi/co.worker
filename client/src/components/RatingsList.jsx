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
                    <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-1/4" />
                                <div className="h-3 bg-gray-100 rounded" />
                                <div className="h-3 bg-gray-100 rounded w-5/6" />
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
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-5xl mb-3">⭐</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No reviews yet</h3>
                <p className="text-gray-600 text-center max-w-sm">
                    Be the first to share your experience with this user
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Filter & Sort Controls */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {/* Rating Filter */}
                <div>
                    <p className="text-sm font-bold text-gray-700 mb-2">Filter by Rating</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleFilterChange('all')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                                filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            All ({ratings.length})
                        </button>
                        {[5, 4, 3, 2, 1].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleFilterChange(String(star))}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-1 ${
                                    filter === String(star)
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {star}★ ({breakdown[star]})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Options */}
                <div>
                    <p className="text-sm font-bold text-gray-700 mb-2">Sort by</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleSortChange('latest')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                                sort === 'latest'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Latest
                        </button>
                        <button
                            onClick={() => handleSortChange('highest')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                                sort === 'highest'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Highest Rated
                        </button>
                        <button
                            onClick={() => handleSortChange('lowest')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                                sort === 'lowest'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
