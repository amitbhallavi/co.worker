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
                <span key={`empty-${i}`} className="text-gray-300 dark:text-white/20">
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
                    <span className={`font-bold text-slate-950 dark:text-white ${config.rating}`}>
                        {averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-white/55">/5</span>
                </div>

                {/* Review Count */}
                <p className={`text-slate-600 dark:text-white/55 ${config.count}`}>
                    ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                </p>

                {/* Verified Badge */}
                {verifiedReviews > 0 && (
                    <p className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                        ✓ {verifiedReviews} verified {verifiedReviews === 1 ? 'review' : 'reviews'}
                    </p>
                )}

                {/* Write Review Button */}
                {showWriteButton && onWriteReview && (
                    <button
                        onClick={onWriteReview}
                        className="mt-4 rounded-xl border-none bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 active:translate-y-0"
                    >
                        ✍️ Write a Review
                    </button>
                )}
            </div>

            {/* Rating Breakdown (if provided) */}
            {breakdown && (
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.05]">
                    <p className="mb-3 text-sm font-bold text-slate-800 dark:text-white">Rating Breakdown</p>
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = breakdown[star] || 0
                        const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                        return (
                            <div key={star} className="flex items-center gap-3">
                                <span className="w-12 text-sm font-semibold text-slate-700 dark:text-white/75">
                                    {star}★
                                </span>
                                <div className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-white/10">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full transition-all"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="w-12 text-right text-xs text-slate-600 dark:text-white/55">
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
