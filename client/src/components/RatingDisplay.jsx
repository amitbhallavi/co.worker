import React from 'react'

/**
 * RatingDisplay - Shows average rating and review count summary
 * Props:
 *   - averageRating: number (e.g., 4.7)
 *   - totalReviews: number (e.g., 128)
 *   - verifiedReviews: number (optional, for badge count)
 *   - breakdown: object { 5: count, 4: count, ... } (optional, for breakdown)
 *   - onWriteReview: function() callback for "Write Review" button
 *   - showWriteButton: boolean (default: true)
 *   - size: 'small' | 'medium' | 'large' (default: 'large')
 */
const RatingDisplay = ({
    averageRating = 0,
    totalReviews = 0,
    verifiedReviews = 0,
    breakdown = null,
    onWriteReview,
    showWriteButton = true,
    size = 'large',
}) => {
    const sizeConfig = {
        small: { star: 'text-lg', rating: 'text-lg', count: 'text-xs' },
        medium: { star: 'text-2xl', rating: 'text-2xl', count: 'text-sm' },
        large: { star: 'text-4xl', rating: 'text-4xl', count: 'text-base' },
    }

    const config = sizeConfig[size] || sizeConfig.large

    // Generate partial stars for average rating
    const fullStars = Math.floor(averageRating)
    const hasHalf = averageRating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)

    const stars = (
        <>
            {Array.from({ length: fullStars }).map((_, i) => (
                <span key={`full-${i}`} className="text-yellow-400 drop-shadow-sm">
                    ⭐
                </span>
            ))}
            {hasHalf && <span className="text-yellow-400">⭐</span>}
            {Array.from({ length: emptyStars }).map((_, i) => (
                <span key={`empty-${i}`} className="text-gray-300">
                    ⭐
                </span>
            ))}
        </>
    )

    return (
        <div className={`space-y-6 ${size === 'small' ? 'py-2' : 'py-6'}`}>
            {/* Main Rating Display */}
            <div className="flex flex-col items-center gap-3">
                {/* Stars */}
                <div className="flex gap-1">{stars}</div>

                {/* Average Rating */}
                <div className="flex items-baseline gap-2">
                    <span className={`font-bold text-gray-900 ${config.rating}`}>
                        {averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-sm">/5</span>
                </div>

                {/* Review Count */}
                <p className={`text-gray-600 ${config.count}`}>
                    ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                </p>

                {/* Verified Badge */}
                {verifiedReviews > 0 && (
                    <p className="text-xs text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">
                        ✓ {verifiedReviews} verified {verifiedReviews === 1 ? 'review' : 'reviews'}
                    </p>
                )}

                {/* Write Review Button */}
                {showWriteButton && onWriteReview && (
                    <button
                        onClick={onWriteReview}
                        className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 hover:shadow-lg active:scale-95"
                    >
                        ✍️ Write a Review
                    </button>
                )}
            </div>

            {/* Rating Breakdown (if provided) */}
            {breakdown && (
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-bold text-gray-700 mb-3">Rating Breakdown</p>
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = breakdown[star] || 0
                        const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                        return (
                            <div key={star} className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-700 w-12">
                                    {star}★
                                </span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full transition-all"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-600 w-12 text-right">
                                    {count}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default RatingDisplay
