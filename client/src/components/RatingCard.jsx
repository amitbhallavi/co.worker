import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { deleteRating, reportRating } from '../features/rating/ratingSlice'
import { toast } from 'react-toastify'
import { Trash2, Edit2, Flag } from 'lucide-react'

const RatingCard = ({ rating, isOwnRating = false, onEdit, onDelete }) => {
    const dispatch = useDispatch()
    const { loading } = useSelector(s => s.rating)
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportReason, setReportReason] = useState('')
    const [renderTime] = useState(() => Date.now())

    if (!rating || !rating.rater || !rating._id) return null

    const { rater, rating: ratingScore, review, createdAt, _id, isVerified, project } = rating

    const raterName = rater?.name ||
        `${rater?.firstName || ''} ${rater?.lastName || ''}`.trim() ||
        'Anonymous'

    const raterAvatar = rater?.profilePic || rater?.avatar || null

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        try {
            const diff = renderTime - new Date(dateStr).getTime()
            const days = Math.floor(diff / 86400000)
            if (days === 0) return 'Today'
            if (days === 1) return '1 day ago'
            if (days < 30) return `${days} days ago`
            if (days < 365) return `${Math.floor(days / 30)} months ago`
            return `${Math.floor(days / 365)} years ago`
        } catch {
            return ''
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Delete this review?')) return
        try {
            if (onDelete) {
                onDelete(_id)
            } else {
                await dispatch(deleteRating(_id)).unwrap()
                toast.success('Review deleted')
            }
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Failed to delete')
        }
    }

    const handleReport = async () => {
        if (!reportReason.trim()) { toast.error('Please provide a reason'); return }
        try {
            await dispatch(reportRating({ ratingId: _id, reason: reportReason })).unwrap()
            toast.success('Thank you for reporting')
            setShowReportModal(false)
            setReportReason('')
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Failed to report')
        }
    }

    return (
        <>
            <div className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.06]">
                <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                        {raterAvatar ? (
                            <img
                                src={raterAvatar}
                                alt={raterName}
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-white/10"
                                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                            />
                        ) : null}
                        <div
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm"
                            style={{ display: raterAvatar ? 'none' : 'flex' }}
                        >
                            {raterName[0]?.toUpperCase() || '?'}
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h4 className="text-sm font-bold text-slate-950 dark:text-white">{raterName}</h4>
                                <div className="flex gap-0.5 mt-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i} className={i < ratingScore ? 'text-amber-400 text-sm' : 'text-slate-200 dark:text-white/20 text-sm'}>★</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-xs text-slate-400 dark:text-white/40">{formatDate(createdAt)}</span>
                                {/* Action buttons */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-1">
                                    {isOwnRating && (
                                        <>
                                            <button onClick={() => onEdit?.(rating)}
                                                className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-blue-500 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-400/10">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={handleDelete} disabled={loading}
                                                className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-400/10">
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                    {!isOwnRating && (
                                        <button onClick={() => setShowReportModal(true)}
                                            className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-orange-500 transition hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-400/10">
                                            <Flag size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verified Badge */}
                {isVerified && (
                    <span className="mb-2 inline-block rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                        ✓ Verified Purchase
                    </span>
                )}

                {/* Review Text */}
                <p className="text-sm leading-relaxed text-slate-600 dark:text-white/65">{review}</p>

                {/* Project ref */}
                {project?.title && (
                    <p className="mt-2 text-xs text-blue-500 dark:text-cyan-300">📋 {project.title}</p>
                )}
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0f172a]">
                        <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
                            <h3 className="font-bold text-slate-950 dark:text-white">Report Review</h3>
                        </div>
                        <div className="p-5 space-y-3">
                            <p className="text-sm text-slate-500 dark:text-white/55">Why are you reporting this review?</p>
                            <textarea
                                value={reportReason}
                                onChange={e => setReportReason(e.target.value)}
                                placeholder="Describe the issue..."
                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/35"
                                rows="3"
                            />
                        </div>
                        <div className="px-5 pb-5 flex gap-2">
                            <button onClick={() => { setShowReportModal(false); setReportReason('') }}
                                className="flex-1 cursor-pointer rounded-xl border-none bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15">
                                Cancel
                            </button>
                            <button onClick={handleReport}
                                disabled={loading || !reportReason.trim()}
                                className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition cursor-pointer border-none disabled:opacity-50">
                                Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default RatingCard
