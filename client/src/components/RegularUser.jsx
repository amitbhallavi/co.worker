import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux'
import { toast } from "react-toastify"
import LoaderGradient from "../components/LoaderGradient"
import { getProjects } from "../features/project/projectSlice"
import ListProject from "./ListProject"
import axios from "axios"
import BecomeFreelancerModal from "../components/Becomefreelancermodal"
import PaymentModal from "../components/Paymentmodal"
import { getSocket } from "../utils/socketManager"
import { updateProjectAmount } from "../features/project/projectSlice"

const BASE_URL = import.meta.env.VITE_API_URL || ""

const getEntityId = (entity) => entity?._id || entity?.id || entity

const idsMatch = (left, right) => {
    const leftId = getEntityId(left)
    const rightId = getEntityId(right)
    return Boolean(leftId && rightId && String(leftId) === String(rightId))
}

const getCollectionCount = (source, countKey) => {
    if (Array.isArray(source)) return source.length
    const count = Number(countKey)
    return Number.isFinite(count) ? count : 0
}

// ── Status colors ──────────────────────────────────────────
const STATUS_COLORS = {
    "Pending": "text-amber-700 bg-amber-50 border border-amber-200 dark:text-amber-200 dark:bg-amber-400/10 dark:border-amber-300/20",
    "pending": "text-amber-700 bg-amber-50 border border-amber-200 dark:text-amber-200 dark:bg-amber-400/10 dark:border-amber-300/20",
    "Accepted": "text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-200 dark:bg-emerald-400/10 dark:border-emerald-300/20",
    "accepted": "text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-200 dark:bg-emerald-400/10 dark:border-emerald-300/20",
    "Rejected": "text-rose-700 bg-rose-50 border border-rose-200 dark:text-rose-200 dark:bg-rose-400/10 dark:border-rose-300/20",
    "rejected": "text-rose-700 bg-rose-50 border border-rose-200 dark:text-rose-200 dark:bg-rose-400/10 dark:border-rose-300/20",
    "in-progress": "text-blue-700 bg-blue-50 border border-blue-200 dark:text-blue-200 dark:bg-blue-400/10 dark:border-blue-300/20",
    "completed": "text-green-700 bg-green-50 border border-green-200 dark:text-green-200 dark:bg-green-400/10 dark:border-green-300/20",
    "Completed": "text-green-700 bg-green-50 border border-green-200 dark:text-green-200 dark:bg-green-400/10 dark:border-green-300/20",
}
const STATUS_FALLBACK = "text-slate-600 bg-slate-100 border border-slate-200 dark:text-white/65 dark:bg-white/[0.06] dark:border-white/10"

// ── Project Detail + Bids Modal ────────────────────────────
const ProjectModal = ({ project, onClose, token, onRefresh, onBidAccepted }) => {
    const [bids, setBids] = useState([])
    const [bidsLoading, setBidsLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState(null)
    const [activeView, setActiveView] = useState("details")
    const [completingId, setCompletingId] = useState(null)
    const [payProject, setPayProject] = useState(null)

    const initials = (project.user?.name || '?')
        .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

    const techList = project.technology
        ? project.technology.split(',').map(t => t.trim()).filter(Boolean)
        : []

    useEffect(() => {
        const fetchBids = async () => {
            setBidsLoading(true)
            try {
                const res = await axios.get(`${BASE_URL}/api/project/${project._id}`, {
                    headers: { authorization: `Bearer ${token}` }
                })
                setBids(Array.isArray(res.data) ? res.data : [])
            } catch { setBids([]) }
            finally { setBidsLoading(false) }
        }
        fetchBids()
    }, [project._id, token])

    const handleBidStatus = async (bidId, status) => {
        setUpdatingId(bidId)
        try {
            let response
            if (status === "Accepted" || status === "accepted") {
                response = await axios.post(
                    `${BASE_URL}/api/project/${bidId}`,
                    { status: "accepted" },
                    { headers: { authorization: `Bearer ${token}` } }
                )

                const otherBids = bids.filter(b => b._id !== bidId && (b.status === "Pending" || b.status === "pending"))
                for (const bid of otherBids) {
                    try {
                        await axios.post(
                            `${BASE_URL}/api/project/${bid._id}`,
                            { status: "rejected" },
                            { headers: { authorization: `Bearer ${token}` } }
                        )
                    } catch (e) {
                        console.warn("Could not reject bid:", e.message)
                    }
                }

                toast.success("Project assigned successfully")
                toast.info("Please complete payment to start work")
                onBidAccepted?.(response?.data?.project)
            } else {
                response = await axios.post(`${BASE_URL}/api/project/${bidId}`, { status }, {
                    headers: { authorization: `Bearer ${token}` }
                })
                toast.success(`Bid marked as ${status}!`)
            }
            
            setBids(prev => prev.map(b => b._id === bidId ? { ...b, status } : b))
        } catch (err) {
            console.error("❌ Bid update error:", err.response?.data || err.message)
            toast.error(err?.response?.data?.message || "Failed to update bid status")
        }
        finally { setUpdatingId(null) }
    }

    const handleMarkComplete = async (projectId) => {
        setCompletingId(projectId)
        try {
            await axios.post(
                `${BASE_URL}/api/payment/release/${projectId}`,
                {},
                { headers: { authorization: `Bearer ${token}` } }
            )
            toast.success("Project complete! Payment released to freelancer ✅")
            onRefresh?.()
            onClose()
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to mark complete")
        } finally {
            setCompletingId(null)
        }
    }

    const acceptedBid = bids.find(b => b.status === "Accepted" || b.status === "accepted")
    const isEscrowed = project.paymentStatus === "escrowed" || project.status === "in-progress"
    const isCompleted = project.status === "completed" || project.status === "Completed"
    const isPaid = project.paymentStatus === "released" || isCompleted

    return (
        <>
            {payProject && (
                <PaymentModal
                    project={payProject}
                    onClose={() => setPayProject(null)}
                    onPaymentDone={() => {
                        setPayProject(null)
                        onRefresh?.()
                    }}
                />
            )}

            <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                onClick={e => e.target === e.currentTarget && onClose()}>
                <div className="modal-in w-full overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-950 dark:shadow-black/50 sm:max-w-3xl sm:rounded-3xl">

                    <div className="flex justify-center pt-3 pb-1 sm:hidden">
                        <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-white/25" />
                    </div>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-4 relative overflow-hidden">
                        <div className="absolute w-24 h-24 rounded-full bg-white/10 -top-8 -right-6 pointer-events-none" />
                        <button onClick={onClose}
                            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer border-none">✕</button>
                        <div className="flex items-center gap-3 mb-2.5">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-base flex-shrink-0">📋</div>
                            <div className="min-w-0">
                                <h2 className="text-white font-black text-base leading-tight pr-8 truncate">{project.title}</h2>
                                <p className="text-blue-100 text-xs">Project Details</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[project.status] || STATUS_FALLBACK}`}>
                                {project.status}
                            </span>
                            <span className="text-xs text-blue-100">{bids.length} bid{bids.length !== 1 ? 's' : ''} received</span>
                            {isEscrowed && !isPaid && (
                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400 text-white">🔒 In Escrow</span>
                            )}
                            {isPaid && (
                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500 text-white">✅ Paid</span>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="grid grid-cols-2 gap-2 border-b border-slate-200 bg-slate-100 p-2 dark:border-slate-800 dark:bg-slate-900">
                        {[{ id: "details", label: "📋 Details" }, { id: "bids", label: `💼 Bids (${bids.length})` }].map(t => (
                            <button key={t.id} onClick={() => setActiveView(t.id)}
                                className={`cursor-pointer rounded-2xl border px-3 py-3 text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50
                                    ${activeView === t.id
                                        ? "border-transparent bg-white text-blue-700 shadow-sm dark:bg-blue-600 dark:text-white dark:shadow-blue-500/20"
                                        : "border-transparent bg-transparent text-slate-500 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Details Tab */}
                    {activeView === "details" && (
                        <div className="max-h-[58vh] space-y-4 overflow-y-auto px-5 py-5">
                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white">
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-950 dark:text-slate-100">{project.user?.name || '—'}</p>
                                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{project.user?.email || '—'}</p>
                                </div>
                                <span className="shrink-0 text-xs font-medium text-slate-400 dark:text-slate-400">Client</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                {[
                                    { label: 'Budget', value: project.budget ? `₹${Number(project.budget).toLocaleString('en-IN')}` : '—', color: 'text-emerald-700' },
                                    { label: 'Duration', value: project.duration ? `${project.duration} days` : '—', color: 'text-slate-900 dark:text-slate-100' },
                                    { label: 'Category', value: project.category || '—', color: 'text-blue-700' },
                                    { label: 'Posted', value: project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-IN') : '—', color: 'text-slate-900 dark:text-slate-100' },
                                ].map(item => (
                                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">{item.label}</p>
                                        <p className={`truncate text-sm font-black ${item.color} dark:text-cyan-200`}>{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {project.description && (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-900">
                                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Description</p>
                                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{project.description}</p>
                                </div>
                            )}

                            {techList.length > 0 && (
                                <div>
                                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Technologies</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {techList.map((tech, i) => (
                                            <span key={i} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-cyan-400/30 dark:bg-slate-900 dark:text-cyan-200">{tech}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {acceptedBid && !isEscrowed && !isPaid && (
                                <div className="flex flex-col items-center gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 dark:border-blue-300/20 dark:from-blue-500/10 dark:to-cyan-400/10 sm:flex-row">
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-blue-900 dark:text-blue-100">🎉 Bid Accepted!</p>
                                        <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-200/70">Pay now to lock funds in escrow and start the project.</p>
                                    </div>
                                    <button onClick={() => setPayProject(project)}
                                        className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-sm rounded-xl hover:shadow-lg hover:scale-105 transition-all cursor-pointer border-none">
                                        💳 Pay Now
                                    </button>
                                </div>
                            )}

                            {isEscrowed && !isPaid && (
                                <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-300/20 dark:bg-amber-400/10 sm:flex-row">
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-amber-800 dark:text-amber-100">🔒 Payment in Escrow</p>
                                        <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-100/70">Mark complete when you're satisfied with the work.</p>
                                    </div>
                                    <button onClick={() => handleMarkComplete(project._id)}
                                        disabled={!!completingId}
                                        className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm rounded-xl hover:shadow-lg hover:scale-105 transition-all cursor-pointer border-none disabled:opacity-60">
                                        {completingId
                                            ? <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Releasing...</span>
                                            : "✅ Mark Complete"
                                        }
                                    </button>
                                </div>
                            )}

                            {isPaid && (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-300/20 dark:bg-emerald-400/10">
                                    <p className="text-2xl mb-1">🎊</p>
                                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-100">Project Completed!</p>
                                    <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-100/70">Payment released to the freelancer.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bids Tab */}
                    {activeView === "bids" && (
                        <div className="max-h-[55vh] overflow-y-auto">
                            {bidsLoading ? (
                                <div className="flex flex-col items-center justify-center py-14">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                                    <p className="text-sm text-slate-500 dark:text-white/55">Loading bids...</p>
                                </div>
                            ) : bids.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                                    <p className="text-4xl mb-3">💼</p>
                                    <p className="mb-1 text-base font-bold text-slate-700 dark:text-white">No bids yet</p>
                                    <p className="text-sm text-slate-400 dark:text-white/45">Freelancers haven't applied yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-white/10">
                                    {bids.map((bid, i) => {
                                        const fl = bid.freelancer
                                        const fname = fl?.user?.name || fl?.name || 'Freelancer'
                                        const femail = fl?.user?.email || fl?.email || '—'
                                        const fPic = fl?.user?.profilePic || null
                                        const fId = fl?.user?._id || null
                                        const fInit = fname.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                        const isUpd = updatingId === bid._id
                                        const bidAccepted = bid.status === "Accepted" || bid.status === "accepted"

                                        return (
                                            <div key={bid._id || i} className="px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        {fPic
                                                            ? <img src={fPic} alt={fname} className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-100" onError={e => e.target.style.display = 'none'} />
                                                            : <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">{fInit}</div>
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="text-sm font-bold text-slate-950 dark:text-white">{fname}</p>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[bid.status] || STATUS_FALLBACK}`}>
                                                                {bid.status || 'Pending'}
                                                            </span>
                                                        </div>
                                                        <p className="truncate text-xs text-slate-500 dark:text-white/50">{femail}</p>
                                                        {fl?.category && <p className="mt-0.5 text-xs font-medium text-blue-600 dark:text-cyan-300">{fl.category}</p>}
                                                        {fl?.experience && <p className="text-xs text-slate-400 dark:text-white/40">{fl.experience} yrs experience</p>}
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-lg font-black text-emerald-600">₹{bid.amount ? Number(bid.amount).toLocaleString('en-IN') : '—'}</p>
                                                        <p className="text-[10px] text-slate-400 dark:text-white/40">bid amount</p>
                                                        {bid.createdAt && <p className="mt-0.5 text-[10px] text-slate-400 dark:text-white/40">{new Date(bid.createdAt).toLocaleDateString('en-IN')}</p>}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                    {fId && (
                                                        <Link to={`/profile/${fId}`} onClick={onClose}
                                                            className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 no-underline transition-all hover:bg-blue-600 hover:text-white dark:border-blue-300/20 dark:bg-blue-400/10 dark:text-cyan-200 dark:hover:bg-blue-500 dark:hover:text-white">
                                                            👤 View Profile
                                                        </Link>
                                                    )}

                                                    {[
                                                        { label: '✓ Accept', status: 'Accepted', active: 'bg-emerald-100 text-emerald-700 border-emerald-200', hover: 'hover:bg-emerald-500 hover:text-white hover:border-emerald-500' },
                                                        { label: '✕ Reject', status: 'Rejected', active: 'bg-rose-100 text-rose-700 border-rose-200', hover: 'hover:bg-rose-500 hover:text-white hover:border-rose-500' },
                                                        { label: '◷ Pending', status: 'Pending', active: 'bg-amber-100 text-amber-700 border-amber-200', hover: 'hover:bg-amber-500 hover:text-white hover:border-amber-500' },
                                                    ].map(btn => (
                                                        <button key={btn.status}
                                                            onClick={() => handleBidStatus(bid._id, btn.status)}
                                                            disabled={isUpd || bid.status === btn.status}
                                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all
                                                                ${bid.status === btn.status ? btn.active + ' cursor-default' : 'bg-white text-slate-600 border-slate-200 dark:bg-white/[0.04] dark:text-white/65 dark:border-white/10 ' + btn.hover + ' cursor-pointer'}
                                                                ${isUpd ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                            {isUpd ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" /> : btn.label}
                                                        </button>
                                                    ))}

                                                    {bidAccepted && !isEscrowed && !isPaid && (
                                                        <button onClick={() => setPayProject(project)}
                                                            className="px-3 py-1.5 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg hover:shadow-md hover:scale-105 transition-all cursor-pointer border-none">
                                                            💳 Pay Now
                                                        </button>
                                                    )}

                                                    {bidAccepted && isEscrowed && !isPaid && (
                                                        <button onClick={() => handleMarkComplete(project._id)}
                                                            disabled={!!completingId}
                                                            className="px-3 py-1.5 text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:shadow-md hover:scale-105 transition-all cursor-pointer border-none disabled:opacity-60">
                                                            {completingId
                                                                ? <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Releasing...</span>
                                                                : "✅ Mark Complete"
                                                            }
                                                        </button>
                                                    )}

                                                    {isPaid && bidAccepted && (
                                                        <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                                                            🎊 Paid
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
                        <button onClick={onClose}
                            className="flex-1 cursor-pointer rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                            Close
                        </button>
                        <button onClick={() => setActiveView(activeView === 'bids' ? 'details' : 'bids')}
                            className="flex-1 cursor-pointer rounded-2xl border-none bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5">
                            {activeView === 'bids' ? '📋 View Details' : `💼 View Bids (${bids.length})`}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

// ── Mobile project card ────────────────────────────────────
const MobileProjectCard = ({ bid, i, onView }) => (
    <div className="fade-up flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
        style={{ animationDelay: `${i * 60}ms` }}>
        <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
                <p className="text-sm font-bold leading-snug text-slate-950 dark:text-white">{bid.title}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">{bid.category}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${STATUS_COLORS[bid.status] || STATUS_FALLBACK}`}>
                {bid.status}
            </span>
        </div>
        <div className="flex items-center justify-between text-xs">
            <div className="flex gap-4">
                <div>
                    <p className="mb-0.5 text-slate-400 dark:text-white/40">Budget</p>
                    <p className="font-bold text-emerald-600">₹{bid.budget ? Number(bid.budget).toLocaleString('en-IN') : '—'}</p>
                </div>
                <div>
                    <p className="mb-0.5 text-slate-400 dark:text-white/40">Posted</p>
                    <p className="font-medium text-slate-600 dark:text-white/60">{bid.createdAt ? new Date(bid.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                </div>
            </div>
            <button onClick={() => onView(bid)}
                className="cursor-pointer rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition-all hover:bg-blue-600 hover:text-white dark:border-blue-300/20 dark:bg-blue-400/10 dark:text-cyan-200 dark:hover:bg-blue-500 dark:hover:text-white">
                View ↗
            </button>
        </div>
    </div>
)

// ══════════════════════════════════════════════════════════
const RegularUser = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector(state => state.auth)
    const { listedProjects, projectLoading } = useSelector(state => state.project)

    const [showBecomeFModal, setShowBecomeFModal] = useState(false)
    const [editProfile, setEditProfile] = useState(false)
    const [activeTab, setActiveTab] = useState("bids")
    const [selectedProject, setSelectedProject] = useState(null)
    const [justBecameFreelancer, setJustBecameFreelancer] = useState(false)
    const [bidAccepted, setBidAccepted] = useState(false)
    const [payProject, setPayProject] = useState(null)

    useEffect(() => {
        if (user?._id) dispatch(getProjects())
    }, [dispatch, user?._id])

    useEffect(() => {
        if (!user?._id) return
        const socket = getSocket()
        if (!socket) return

        const onBidAccepted = (data) => {
            if (!data?.projectId) return
            toast.success("Payment amount locked to freelancer bid. Proceed to secure payment.")
            dispatch(updateProjectAmount(data))
            setBidAccepted(true)
        }

        const onProjectAssigned = (assignedProject) => {
            if (assignedProject?.client?._id === user?._id || assignedProject?.user?._id === user?._id) {
                toast.info(`Freelancer assigned to "${assignedProject.title}"`)
                setBidAccepted(true)
            }
        }

        socket.on("bidAccepted", onBidAccepted)
        socket.on("projectAssigned", onProjectAssigned)
        return () => {
            socket.off("bidAccepted", onBidAccepted)
            socket.off("projectAssigned", onProjectAssigned)
        }
    }, [user?._id, dispatch])

    useEffect(() => {
        if (bidAccepted) {
            navigate("/assigned-projects")
        }
    }, [bidAccepted, navigate])

    const myProjects = Array.isArray(listedProjects)
        ? listedProjects.filter(p => idsMatch(p.user, user?._id))
        : []

    if (!user) return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#020817]">
            <p className="text-slate-500 dark:text-white/55">Please login first.</p>
        </div>
    )

    if (projectLoading && myProjects.length === 0) return <LoaderGradient />

    const isFreelancer = user?.isFreelancer || justBecameFreelancer

    const handleRefresh = () => dispatch(getProjects())

    const followingCount = getCollectionCount(user?.following, user?.followingCount)
    const followersCount = getCollectionCount(user?.followers, user?.followersCount)
    const blogCount = getCollectionCount(user?.blogs, user?.blogCount)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                ::-webkit-scrollbar{width:4px}
                ::-webkit-scrollbar-thumb{background:#3B7FF5;border-radius:9px}
                @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes modalIn { from{opacity:0;transform:scale(.94) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
                .fade-up  { animation: fadeUp  .45s ease both }
                .modal-in { animation: modalIn .3s cubic-bezier(.34,1.56,.64,1) both }
            `}</style>

            {showBecomeFModal && (
                <BecomeFreelancerModal
                    onClose={() => setShowBecomeFModal(false)}
                    onSuccess={() => {
                        setShowBecomeFModal(false)
                        setJustBecameFreelancer(true)
                        navigate(user?._id ? `/profile/${user._id}` : '/auth/profile')
                    }}
                />
            )}

            {/* Preview bar */}
            <div className="bg-zinc-900 text-white text-xs flex items-center justify-center gap-3 py-2.5 px-4">
                <span className="text-zinc-400">Preview mode:</span>
                <button className="px-3 py-1 rounded-full font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-none cursor-default">
                    Regular User
                </button>
                {isFreelancer && (
                    <span className="px-3 py-1 rounded-full font-bold bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[11px]">
                        ✦ Freelancer Active!
                    </span>
                )}
            </div>

            {/* Profile Hero */}
            <div className="relative">
                <div className="h-36 sm:h-44 md:h-56 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                    <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=60')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.18 }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60" />
                </div>
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="relative z-10 flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-white/10 sm:-mt-12 sm:flex-row sm:items-end sm:gap-4 md:-mt-14 -mt-10">
                        <div className="relative shrink-0 self-start sm:self-auto">
                            <img src={user?.profilePic || "https://i.pravatar.cc/150"}
                                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl ring-4 ring-white shadow-xl object-cover" alt="avatar" />
                            {isFreelancer && (
                                <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-black px-2 py-0.5 rounded-full shadow">✦ PRO</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight" style={{ fontFamily: "'Playfair Display',serif" }}>
                                    {user?.name}
                                </h1>
                                {isFreelancer
                                    ? <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-2.5 py-0.5 rounded-full">Freelancer ✦</span>
                                    : <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.08] dark:text-white/65">Member</span>
                                }
                            </div>
                            <p className="text-white text-xs sm:text-sm mb-1">{user?.email} · India 🇮🇳</p>
                            <p className="mb-1.5 text-xs text-slate-400 dark:text-white/40">Id: {user?._id}</p>
                            <p className="hidden max-w-lg text-xs text-slate-900 dark:text-white/60 sm:block sm:text-sm">
                                Tech enthusiast and blogger. I love discovering talented freelancers and working on exciting new ideas.
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {["Blogging", "Startups", "Product"].map(tag => (
                                    <span key={tag} className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-900 dark:border-white/10 dark:bg-white/[0.08] dark:text-white/70">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto sm:pb-1 flex-wrap">
                            <button onClick={() => setEditProfile(true)}
                                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:opacity-90 transition cursor-pointer shadow border-none">
                                ✏️ Edit Profile
                            </button>
                            {isFreelancer ? (
                                <Link to="/auth/profile">
                                    <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:opacity-90 transition shadow border-none cursor-pointer">
                                        ✦ Freelancer Dashboard
                                    </button>
                                </Link>
                            ) : (
                                <button onClick={() => setShowBecomeFModal(true)}
                                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:opacity-90 transition shadow border-none cursor-pointer">
                                    ✦ Become Freelancer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    {[
                        { label: "Projects", value: myProjects.length, icon: "📋" },
                        { label: "Following", value: followingCount, icon: "👥" },
                        { label: "Followers", value: followersCount, icon: "❤️" },
                        { label: "Blogs", value: blogCount, icon: "📝" },
                    ].map((s, i) => (
                        <div key={s.label}
                            className="fade-up rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-4 sm:shadow-md"
                            style={{ animationDelay: `${i * 60}ms` }}>
                            <p className="text-lg sm:text-xl mb-1">{s.icon}</p>
                            <p className="text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{s.value}</p>
                            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-white/45 sm:text-xs">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="mb-5 flex gap-0.5 border-b border-slate-200 dark:border-white/10">
                    {[
                        { id: "bids", label: "My Projects" },
                        ...(myProjects.filter(p => p.freelancer && (p.status === "accepted" || p.status === "in-progress")).length > 0
                            ? [{ id: "assigned", label: "✦ Assigned Freelancers" }]
                            : []),
                        { id: "saved", label: "Saved" }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 -mb-px border-none bg-transparent cursor-pointer
                                ${activeTab === tab.id ? "border-blue-500 text-blue-600 dark:text-cyan-300" : "border-transparent text-slate-500 hover:text-slate-800 dark:text-white/45 dark:hover:text-white"}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── My Projects Tab ── */}
                {activeTab === "bids" && (
                    <div className="space-y-4 pb-12">
                        {selectedProject && (
                            <ProjectModal
                                project={selectedProject}
                                onClose={() => setSelectedProject(null)}
                                token={user?.token}
                                onRefresh={handleRefresh}
                                onBidAccepted={() => setBidAccepted(true)}
                            />
                        )}

                        <div className="flex items-start sm:items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-black text-slate-950 dark:text-white sm:text-lg" style={{ fontFamily: "'Playfair Display',serif" }}>My Posted Projects</h2>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-white/45">{myProjects.length} projects listed</p>
                            </div>
                            <Link to="/browse-projects">
                                <button className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:shadow-lg transition shadow whitespace-nowrap border-none cursor-pointer">
                                    🔍 Browse
                                </button>
                            </Link>
                        </div>

                        {myProjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 dark:border-white/10 dark:bg-white/[0.04] sm:py-20">
                                <p className="text-4xl sm:text-5xl mb-3">📋</p>
                                <p className="text-sm font-semibold text-slate-500 dark:text-white/55">No projects posted yet.</p>
                                <Link to="/browse-projects">
                                    <button className="mt-4 px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm rounded-xl transition border-none cursor-pointer">
                                        Browse Projects
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-3 md:hidden">
                                    {myProjects.map((bid, i) => (
                                        <MobileProjectCard key={bid._id} bid={bid} i={i} onView={setSelectedProject} />
                                    ))}
                                </div>
                                <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-white/[0.04] md:block">
                                    <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/40">
                                        <div className="col-span-3">Title</div>
                                        <div className="col-span-2">Category</div>
                                        <div className="col-span-2">Client</div>
                                        <div className="col-span-2">Budget</div>
                                        <div className="col-span-1">Status</div>
                                        <div className="col-span-1 text-center">Date</div>
                                        <div className="col-span-1 text-center">View</div>
                                    </div>
                                    {myProjects.map((bid, i) => (
                                        <div key={bid._id}
                                            className="fade-up grid grid-cols-12 items-center border-b border-slate-100 px-5 py-4 transition last:border-0 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/[0.04]"
                                            style={{ animationDelay: `${i * 60}ms` }}>
                                            <div className="col-span-3 min-w-0 pr-2"><p className="truncate text-sm font-bold text-slate-950 dark:text-white">{bid.title}</p></div>
                                            <div className="col-span-2 min-w-0 pr-2"><p className="truncate text-xs font-medium text-slate-600 dark:text-white/60">{bid.category}</p></div>
                                            <div className="col-span-2 min-w-0 pr-2"><p className="truncate text-xs font-medium text-slate-600 dark:text-white/60">{bid.user?.name || '—'}</p></div>
                                            <div className="col-span-2"><p className="text-xs font-bold text-emerald-600 whitespace-nowrap">₹{bid.budget ? Number(bid.budget).toLocaleString('en-IN') : '—'}</p></div>
                                            <div className="col-span-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[bid.status] || STATUS_FALLBACK}`}>{bid.status}</span>
                                            </div>
                                            <div className="col-span-1 whitespace-nowrap text-center text-xs text-slate-400 dark:text-white/40">
                                                {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                                            </div>
                                            <div className="col-span-1 flex justify-center">
                                                <button onClick={() => setSelectedProject(bid)}
                                                    className="cursor-pointer rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:border-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-300/20 dark:bg-blue-400/10 dark:text-cyan-200 dark:hover:bg-blue-500 dark:hover:text-white">
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <ListProject />

                        {!isFreelancer && (
                            <div className="mt-4 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 shadow-xl">
                                <div className="text-4xl sm:text-5xl">🚀</div>
                                <div className="flex-1 text-center sm:text-left">
                                    <p className="text-white font-black text-base sm:text-lg" style={{ fontFamily: "'Playfair Display',serif" }}>Want to earn instead of hire?</p>
                                    <p className="text-zinc-400 text-xs sm:text-sm mt-1">Become a freelancer and showcase your work to hundreds of clients.</p>
                                </div>
                                <button onClick={() => setShowBecomeFModal(true)}
                                    className="shrink-0 w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black text-sm rounded-xl hover:shadow-lg transition whitespace-nowrap border-none cursor-pointer">
                                    ✦ Become a Freelancer
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Assigned Freelancers Tab ── */}
                {activeTab === "assigned" && (
                    <div className="pb-12">
                        {myProjects.filter(p => p.freelancer && (p.status === "accepted" || p.status === "in-progress")).length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 dark:border-white/10 dark:bg-white/[0.04] sm:py-20">
                                <p className="text-4xl sm:text-5xl mb-3">👥</p>
                                <p className="text-sm font-semibold text-slate-500 dark:text-white/55">No assigned freelancers yet.</p>
                                <p className="mt-2 text-xs text-slate-400 dark:text-white/40">Accept bids to assign freelancers to your projects.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myProjects.filter(p => p.freelancer && (p.status === "accepted" || p.status === "in-progress")).map((project, i) => {
                                    const freelancer = project.freelancer
                                    const fName = freelancer?.user?.name || freelancer?.name || '—'
                                    const fEmail = freelancer?.user?.email || freelancer?.email || '—'
                                    const fPic = freelancer?.user?.profilePic || null
                                    const fId = freelancer?.user?._id || null
                                    const fInit = fName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                    
                                    const isEscrowed = project.paymentStatus === "escrowed" || project.status === "in-progress"
                                    const isPaid = project.paymentStatus === "released" || project.status === "completed"

                                    return (
                                        <div key={project._id}
                                            className="fade-up rounded-2xl border border-emerald-100 bg-white p-5 shadow-md transition hover:shadow-lg dark:border-emerald-300/20 dark:bg-white/[0.04] sm:p-6"
                                            style={{ animationDelay: `${i * 60}ms` }}>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4 pb-4 border-b border-emerald-100">
                                                {/* Freelancer Card */}
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="flex-shrink-0">
                                                        {fPic
                                                            ? <img src={fPic} alt={fName} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-200" onError={e => e.target.style.display = 'none'} />
                                                            : <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">{fInit}</div>
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-bold text-slate-950 dark:text-white">{fName}</p>
                                                        <p className="truncate text-sm text-slate-500 dark:text-white/50">{fEmail}</p>
                                                        {freelancer?.category && <p className="text-emerald-600 text-xs font-bold mt-1">Category: {freelancer.category}</p>}
                                                        {freelancer?.experience && <p className="text-xs text-slate-400 dark:text-white/40">Experience: {freelancer.experience} years</p>}
                                                    </div>
                                                </div>

                                                {/* Project Status */}
                                                <div className="flex flex-col gap-2">
                                                    <div className="text-right">
                                                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-white/40">Project</p>
                                                        <p className="mb-1.5 text-sm font-bold text-slate-950 dark:text-white">{project.title}</p>
                                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[project.status] || STATUS_FALLBACK}`}>
                                                            {project.status}
                                                        </span>
                                                    </div>
                                                    {isEscrowed && (
                                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-center">🔒 In Progress</span>
                                                    )}
                                                    {isPaid && (
                                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-center">✅ Completed</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap gap-2">
                                                {fId && (
                                                    <Link to={`/profile/${fId}`}
                                                        className="px-4 py-2.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-600 hover:text-white transition-all no-underline">
                                                        👤 View Profile
                                                    </Link>
                                                )}

                                                {/* Message Button */}
                                                <Link to={`/chat/${fId}`}
                                                    className="px-4 py-2.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-600 hover:text-white transition-all no-underline">
                                                    💬 Message
                                                </Link>

                                                {/* Pay Now or Mark Complete */}
                                                {!isEscrowed && !isPaid && (
                                                    <>
                                                        <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-semibold">
                                                            Project will not be assigned until payment is completed.
                                                        </div>
                                                        <button onClick={() => setPayProject(project)}
                                                        className="px-4 py-2.5 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl hover:shadow-md hover:scale-105 transition-all cursor-pointer border-none">
                                                        💳 Pay Now
                                                    </button>
                                                    </>
                                                )}

                                                {isEscrowed && !isPaid && (
                                                    <button onClick={() => setSelectedProject(project)}
                                                        className="px-4 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:shadow-md transition-all cursor-pointer border-none">
                                                        📋 View Details
                                                    </button>
                                                )}

                                                {isPaid && (
                                                    <span className="px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                                                        🎊 Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Saved Tab ── */}
                {activeTab === "saved" && (
                    <div className="pb-12">
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 dark:border-white/10 dark:bg-white/[0.04] sm:py-20">
                            <p className="text-4xl sm:text-5xl mb-3">🔖</p>
                            <p className="text-sm font-semibold text-slate-500 dark:text-white/55">No saved projects yet.</p>
                            <Link to="/browse-projects">
                                <button className="mt-4 px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm rounded-xl transition border-none cursor-pointer">
                                    Browse Projects
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            {editProfile && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 p-0 backdrop-blur-sm sm:items-center sm:p-4">
                    <div className="modal-in w-full overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 dark:border-white/10 dark:bg-[#0f172a] dark:shadow-black/40 sm:max-w-xl sm:rounded-3xl">
                        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-white/25" /></div>
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-5 dark:border-white/10 dark:bg-white/[0.04] sm:px-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-950 dark:text-white" style={{ fontFamily: "'Playfair Display',serif" }}>Edit Profile</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-white/55">Keep your regular user profile clean and current.</p>
                            </div>
                            <button onClick={() => setEditProfile(false)}
                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border-none bg-slate-200 text-sm font-bold text-slate-600 transition hover:bg-slate-300 hover:text-slate-900 dark:bg-white/10 dark:text-white/65 dark:hover:bg-white/15 dark:hover:text-white">✕</button>
                        </div>
                        <div className="max-h-[65vh] space-y-5 overflow-y-auto px-5 py-6 sm:px-6">
                            <div className="flex items-center gap-4">
                                <img src={user?.profilePic || "https://i.pravatar.cc/150"} alt="Profile" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-blue-300 dark:ring-cyan-300/40 sm:h-20 sm:w-20" />
                                <button className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75 dark:hover:bg-white/[0.1]">Change Photo</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-white/50">Full Name</label>
                                    <input defaultValue={user?.name} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/35 dark:focus:border-cyan-300/50 dark:focus:ring-cyan-400/20" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-white/50">Email</label>
                                    <input defaultValue={user?.email} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/35 dark:focus:border-cyan-300/50 dark:focus:ring-cyan-400/20" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-white/50">Bio</label>
                                <textarea defaultValue="Tech enthusiast and blogger." rows={3}
                                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/35 dark:focus:border-cyan-300/50 dark:focus:ring-cyan-400/20" />
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-white/50">Location</label>
                                <input defaultValue="Indore, India" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/35 dark:focus:border-cyan-300/50 dark:focus:ring-cyan-400/20" />
                            </div>
                        </div>
                        <div className="flex gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-white/10 dark:bg-white/[0.03] sm:px-6">
                            <button onClick={() => setEditProfile(false)}
                                className="flex-1 cursor-pointer rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75 dark:hover:bg-white/[0.1]">Cancel</button>
                            <button onClick={() => setEditProfile(false)}
                                className="flex-1 cursor-pointer rounded-2xl border-none bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5">Save Changes ✦</button>
                        </div>
                    </div>
                </div>
            )}

            {payProject && (
                <PaymentModal
                    project={payProject}
                    onClose={() => setPayProject(null)}
                    onPaymentDone={() => {
                        setPayProject(null)
                        handleRefresh()
                        toast.success("💳 Payment successful! Project is now in progress.")
                    }}
                />
            )}
        </div>
    )
}

export default RegularUser
