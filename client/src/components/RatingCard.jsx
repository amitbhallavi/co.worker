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

    if (!rating || !rating.rater || !rating._id) return null

    const { rater, rating: ratingScore, review, createdAt, _id, isVerified, project } = rating

    // ✅ FIX: Support both name formats (name OR firstName+lastName)
    const raterName = rater?.name ||
        `${rater?.firstName || ''} ${rater?.lastName || ''}`.trim() ||
        'Anonymous'

    // ✅ FIX: Support both avatar field names
    const raterAvatar = rater?.profilePic || rater?.avatar || null

    // ✅ FIX: Safe date formatting without date-fns dependency issues
    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        try {
            const diff = Date.now() - new Date(dateStr).getTime()
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
            <div className="group border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all bg-white">
                <div className="flex items-start gap-3 mb-3">
                    {/* ✅ Avatar — handles both profilePic and avatar fields */}
                    <div className="flex-shrink-0">
                        {raterAvatar ? (
                            <img
                                src={raterAvatar}
                                alt={raterName}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
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
                                {/* ✅ FIX: uses raterName (handles both name and firstName+lastName) */}
                                <h4 className="font-bold text-gray-900 text-sm">{raterName}</h4>
                                <div className="flex gap-0.5 mt-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i} className={i < ratingScore ? 'text-amber-400 text-sm' : 'text-gray-200 text-sm'}>★</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-xs text-gray-400">{formatDate(createdAt)}</span>
                                {/* Action buttons */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-1">
                                    {isOwnRating && (
                                        <>
                                            <button onClick={() => onEdit?.(rating)}
                                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition cursor-pointer border-none bg-transparent">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={handleDelete} disabled={loading}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition cursor-pointer border-none bg-transparent disabled:opacity-50">
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                    {!isOwnRating && (
                                        <button onClick={() => setShowReportModal(true)}
                                            className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 transition cursor-pointer border-none bg-transparent">
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
                    <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 mb-2">
                        ✓ Verified Purchase
                    </span>
                )}

                {/* Review Text */}
                <p className="text-gray-600 text-sm leading-relaxed">{review}</p>

                {/* Project ref */}
                {project?.title && (
                    <p className="text-xs text-blue-500 mt-2">📋 {project.title}</p>
                )}
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Report Review</h3>
                        </div>
                        <div className="p-5 space-y-3">
                            <p className="text-sm text-gray-500">Why are you reporting this review?</p>
                            <textarea
                                value={reportReason}
                                onChange={e => setReportReason(e.target.value)}
                                placeholder="Describe the issue..."
                                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                                rows="3"
                            />
                        </div>
                        <div className="px-5 pb-5 flex gap-2">
                            <button onClick={() => { setShowReportModal(false); setReportReason('') }}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition cursor-pointer border-none">
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