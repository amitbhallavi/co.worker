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

// ── Status colors ──────────────────────────────────────────
const STATUS_COLORS = {
    "Pending": "text-amber-600 bg-amber-50 border border-amber-200",
    "pending": "text-amber-600 bg-amber-50 border border-amber-200",
    "Accepted": "text-emerald-700 bg-emerald-50 border border-emerald-200",
    "accepted": "text-emerald-700 bg-emerald-50 border border-emerald-200",
    "Rejected": "text-rose-600 bg-rose-50 border border-rose-200",
    "rejected": "text-rose-600 bg-rose-50 border border-rose-200",
    "in-progress": "text-blue-700 bg-blue-50 border border-blue-200",
    "completed": "text-green-700 bg-green-50 border border-green-200",
    "Completed": "text-green-700 bg-green-50 border border-green-200",
}

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
                        await axios.put(
                            `${BASE_URL}/api/project/${bid._id}`,
                            { status: "Rejected" },
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
                response = await axios.put(`${BASE_URL}/api/project/${bidId}`, { status }, {
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

            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                onClick={e => e.target === e.currentTarget && onClose()}>
                <div className="modal-in bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl overflow-hidden">

                    <div className="flex justify-center pt-3 pb-1 sm:hidden">
                        <div className="w-10 h-1 rounded-full bg-zinc-300" />
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
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[project.status] || "text-gray-600 bg-gray-100"}`}>
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
                    <div className="flex border-b border-zinc-100">
                        {[{ id: "details", label: "📋 Details" }, { id: "bids", label: `💼 Bids (${bids.length})` }].map(t => (
                            <button key={t.id} onClick={() => setActiveView(t.id)}
                                className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 cursor-pointer border-none bg-transparent
                                    ${activeView === t.id ? "border-blue-500 text-blue-600 bg-blue-50/50" : "border-transparent text-zinc-500 hover:text-zinc-800"}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Details Tab */}
                    {activeView === "details" && (
                        <div className="px-5 py-4 space-y-3 max-h-[55vh] overflow-y-auto">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-zinc-900 text-sm">{project.user?.name || '—'}</p>
                                    <p className="text-zinc-500 text-xs truncate">{project.user?.email || '—'}</p>
                                </div>
                                <span className="text-xs text-zinc-400 font-medium shrink-0">Client</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                {[
                                    { label: 'Budget', value: project.budget ? `₹${Number(project.budget).toLocaleString('en-IN')}` : '—', color: 'text-emerald-700' },
                                    { label: 'Duration', value: project.duration ? `${project.duration} days` : '—', color: 'text-zinc-900' },
                                    { label: 'Category', value: project.category || '—', color: 'text-blue-700' },
                                    { label: 'Posted', value: project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-IN') : '—', color: 'text-zinc-900' },
                                ].map(item => (
                                    <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{item.label}</p>
                                        <p className={`text-sm font-black ${item.color} truncate`}>{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {project.description && (
                                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Description</p>
                                    <p className="text-sm text-zinc-600 leading-relaxed">{project.description}</p>
                                </div>
                            )}

                            {techList.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Technologies</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {techList.map((tech, i) => (
                                            <span key={i} className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full">{tech}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {acceptedBid && !isEscrowed && !isPaid && (
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-blue-900">🎉 Bid Accepted!</p>
                                        <p className="text-xs text-blue-600 mt-0.5">Pay now to lock funds in escrow and start the project.</p>
                                    </div>
                                    <button onClick={() => setPayProject(project)}
                                        className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-sm rounded-xl hover:shadow-lg hover:scale-105 transition-all cursor-pointer border-none">
                                        💳 Pay Now
                                    </button>
                                </div>
                            )}

                            {isEscrowed && !isPaid && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-amber-800">🔒 Payment in Escrow</p>
                                        <p className="text-xs text-amber-700 mt-0.5">Mark complete when you're satisfied with the work.</p>
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
                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                                    <p className="text-2xl mb-1">🎊</p>
                                    <p className="text-sm font-black text-emerald-700">Project Completed!</p>
                                    <p className="text-xs text-emerald-600 mt-0.5">Payment released to the freelancer.</p>
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
                                    <p className="text-sm text-zinc-500">Loading bids...</p>
                                </div>
                            ) : bids.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                                    <p className="text-4xl mb-3">💼</p>
                                    <p className="font-bold text-zinc-700 text-base mb-1">No bids yet</p>
                                    <p className="text-zinc-400 text-sm">Freelancers haven't applied yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-100">
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
                                            <div key={bid._id || i} className="px-5 py-4 hover:bg-zinc-50 transition">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        {fPic
                                                            ? <img src={fPic} alt={fname} className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-100" onError={e => e.target.style.display = 'none'} />
                                                            : <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">{fInit}</div>
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-bold text-zinc-900 text-sm">{fname}</p>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[bid.status] || "text-gray-600 bg-gray-100 border-gray-200"}`}>
                                                                {bid.status || 'Pending'}
                                                            </span>
                                                        </div>
                                                        <p className="text-zinc-500 text-xs truncate">{femail}</p>
                                                        {fl?.category && <p className="text-blue-600 text-xs font-medium mt-0.5">{fl.category}</p>}
                                                        {fl?.experience && <p className="text-zinc-400 text-xs">{fl.experience} yrs experience</p>}
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-lg font-black text-emerald-600">₹{bid.amount ? Number(bid.amount).toLocaleString('en-IN') : '—'}</p>
                                                        <p className="text-[10px] text-zinc-400">bid amount</p>
                                                        {bid.createdAt && <p className="text-[10px] text-zinc-400 mt-0.5">{new Date(bid.createdAt).toLocaleDateString('en-IN')}</p>}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                    {fId && (
                                                        <Link to={`/profile/${fId}`} onClick={onClose}
                                                            className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white transition-all no-underline">
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
                                                                ${bid.status === btn.status ? btn.active + ' cursor-default' : 'bg-white text-zinc-600 border-zinc-200 ' + btn.hover + ' cursor-pointer'}
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
                                                        <span className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
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

                    <div className="px-5 py-4 border-t border-zinc-100 flex gap-3">
                        <button onClick={onClose}
                            className="flex-1 py-2.5 bg-zinc-100 text-zinc-700 font-bold text-sm rounded-xl hover:bg-zinc-200 transition cursor-pointer border-none">
                            Close
                        </button>
                        <button onClick={() => setActiveView(activeView === 'bids' ? 'details' : 'bids')}
                            className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm rounded-xl hover:shadow-lg transition cursor-pointer border-none">
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
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 flex flex-col gap-3 fade-up"
        style={{ animationDelay: `${i * 60}ms` }}>
        <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
                <p className="font-bold text-zinc-900 text-sm leading-snug">{bid.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{bid.category}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${STATUS_COLORS[bid.status] || "text-gray-600 bg-gray-100"}`}>
                {bid.status}
            </span>
        </div>
        <div className="flex items-center justify-between text-xs">
            <div className="flex gap-4">
                <div>
                    <p className="text-zinc-400 mb-0.5">Budget</p>
                    <p className="font-bold text-emerald-600">₹{bid.budget ? Number(bid.budget).toLocaleString('en-IN') : '—'}</p>
                </div>
                <div>
                    <p className="text-zinc-400 mb-0.5">Posted</p>
                    <p className="font-medium text-zinc-600">{bid.createdAt ? new Date(bid.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                </div>
            </div>
            <button onClick={() => onView(bid)}
                className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer border-none">
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
        ? listedProjects.filter(p => p.user?._id === user?._id)
        : []

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-zinc-500">Please login first.</p>
        </div>
    )

    if (projectLoading && myProjects.length === 0) return <LoaderGradient />

    const isFreelancer = user?.isFreelancer || justBecameFreelancer

    const handleRefresh = () => dispatch(getProjects())

    return (
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;900&display=swap');
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
                        setTimeout(() => navigate('/profile'), 1500)
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
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 -mt-10 sm:-mt-12 md:-mt-14 relative z-10 pb-5 border-b border-zinc-100">
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
                                    : <span className="text-xs font-bold bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-full border border-zinc-200">Member</span>
                                }
                            </div>
                            <p className="text-white text-xs sm:text-sm mb-1">{user?.email} · India 🇮🇳</p>
                            <p className="text-zinc-400 text-xs mb-1.5">Id: {user?._id}</p>
                            <p className="text-zinc-900 text-xs sm:text-sm max-w-lg hidden sm:block">
                                Tech enthusiast and blogger. I love discovering talented freelancers and working on exciting new ideas.
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {["Blogging", "Startups", "Product"].map(tag => (
                                    <span key={tag} className="text-xs bg-zinc-100 text-zinc-900 px-2.5 py-0.5 rounded-full font-medium border border-zinc-200">{tag}</span>
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
                        { label: "Following", value: "183", icon: "👥" },
                        { label: "Followers", value: "2.1K", icon: "❤️" },
                        { label: "Blogs", value: "0", icon: "📝" },
                    ].map((s, i) => (
                        <div key={s.label}
                            className="bg-white rounded-2xl border border-zinc-100 shadow-sm sm:shadow-md p-3 sm:p-4 text-center fade-up"
                            style={{ animationDelay: `${i * 60}ms` }}>
                            <p className="text-lg sm:text-xl mb-1">{s.icon}</p>
                            <p className="text-xl sm:text-2xl font-black text-zinc-900">{s.value}</p>
                            <p className="text-zinc-500 text-[11px] sm:text-xs mt-0.5 font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="flex gap-0.5 border-b border-zinc-200 mb-5">
                    {[
                        { id: "bids", label: "My Projects" },
                        ...(myProjects.filter(p => p.freelancer && (p.status === "accepted" || p.status === "in-progress")).length > 0
                            ? [{ id: "assigned", label: "✦ Assigned Freelancers" }]
                            : []),
                        { id: "saved", label: "Saved" }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 -mb-px border-none bg-transparent cursor-pointer
                                ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-zinc-500 hover:text-zinc-800"}`}>
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
                                <h2 className="text-base sm:text-lg font-black text-zinc-900" style={{ fontFamily: "'Playfair Display',serif" }}>My Posted Projects</h2>
                                <p className="text-zinc-500 text-xs mt-0.5">{myProjects.length} projects listed</p>
                            </div>
                            <Link to="/browse-projects">
                                <button className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:shadow-lg transition shadow whitespace-nowrap border-none cursor-pointer">
                                    🔍 Browse
                                </button>
                            </Link>
                        </div>

                        {myProjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
                                <p className="text-4xl sm:text-5xl mb-3">📋</p>
                                <p className="text-zinc-500 font-semibold text-sm">No projects posted yet.</p>
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
                                <div className="hidden md:block bg-white rounded-2xl border border-zinc-100 shadow-md overflow-hidden">
                                    <div className="grid grid-cols-12 px-5 py-3 bg-zinc-50 border-b border-zinc-100 text-xs font-bold text-zinc-400 uppercase tracking-wide">
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
                                            className="grid grid-cols-12 px-5 py-4 items-center hover:bg-zinc-50 transition border-b border-zinc-100 last:border-0 fade-up"
                                            style={{ animationDelay: `${i * 60}ms` }}>
                                            <div className="col-span-3 min-w-0 pr-2"><p className="font-bold text-zinc-900 text-sm truncate">{bid.title}</p></div>
                                            <div className="col-span-2 min-w-0 pr-2"><p className="text-xs text-zinc-600 font-medium truncate">{bid.category}</p></div>
                                            <div className="col-span-2 min-w-0 pr-2"><p className="text-xs text-zinc-600 font-medium truncate">{bid.user?.name || '—'}</p></div>
                                            <div className="col-span-2"><p className="text-xs font-bold text-emerald-600 whitespace-nowrap">₹{bid.budget ? Number(bid.budget).toLocaleString('en-IN') : '—'}</p></div>
                                            <div className="col-span-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[bid.status] || "text-gray-600 bg-gray-100"}`}>{bid.status}</span>
                                            </div>
                                            <div className="col-span-1 text-center text-xs text-zinc-400 whitespace-nowrap">
                                                {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                                            </div>
                                            <div className="col-span-1 flex justify-center">
                                                <button onClick={() => setSelectedProject(bid)}
                                                    className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer">
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
                            <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
                                <p className="text-4xl sm:text-5xl mb-3">👥</p>
                                <p className="text-zinc-500 font-semibold text-sm">No assigned freelancers yet.</p>
                                <p className="text-zinc-400 text-xs mt-2">Accept bids to assign freelancers to your projects.</p>
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
                                            className="bg-white rounded-2xl border border-emerald-100 shadow-md p-5 sm:p-6 hover:shadow-lg transition fade-up"
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
                                                        <p className="font-bold text-zinc-900 text-base">{fName}</p>
                                                        <p className="text-zinc-500 text-sm truncate">{fEmail}</p>
                                                        {freelancer?.category && <p className="text-emerald-600 text-xs font-bold mt-1">Category: {freelancer.category}</p>}
                                                        {freelancer?.experience && <p className="text-zinc-400 text-xs">Experience: {freelancer.experience} years</p>}
                                                    </div>
                                                </div>

                                                {/* Project Status */}
                                                <div className="flex flex-col gap-2">
                                                    <div className="text-right">
                                                        <p className="text-xs text-zinc-400 uppercase font-bold tracking-wide mb-1">Project</p>
                                                        <p className="font-bold text-zinc-900 text-sm mb-1.5">{project.title}</p>
                                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[project.status] || "text-gray-600 bg-gray-100"}`}>
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
                        <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
                            <p className="text-4xl sm:text-5xl mb-3">🔖</p>
                            <p className="text-zinc-500 font-semibold text-sm">No saved projects yet.</p>
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="modal-in bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden">
                        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-zinc-300" /></div>
                        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                            <h2 className="font-black text-zinc-900 text-base" style={{ fontFamily: "'Playfair Display',serif" }}>Edit Profile</h2>
                            <button onClick={() => setEditProfile(false)}
                                className="w-8 h-8 rounded-xl bg-zinc-200 hover:bg-zinc-300 transition flex items-center justify-center text-zinc-600 font-bold text-sm border-none cursor-pointer">✕</button>
                        </div>
                        <div className="px-5 sm:px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
                            <div className="flex items-center gap-4">
                                <img src={user?.profilePic || "https://i.pravatar.cc/150"} alt="Profile" className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ring-2 ring-blue-300 object-cover" />
                                <button className="px-4 py-2 bg-zinc-100 text-zinc-700 font-bold text-xs rounded-xl hover:bg-zinc-200 transition border-none cursor-pointer">Change Photo</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">Full Name</label>
                                    <input defaultValue={user?.name} className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">Email</label>
                                    <input defaultValue={user?.email} className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">Bio</label>
                                <textarea defaultValue="Tech enthusiast and blogger." rows={3}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">Location</label>
                                <input defaultValue="Indore, India" className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                            </div>
                        </div>
                        <div className="px-5 sm:px-6 py-4 border-t border-zinc-100 flex gap-3">
                            <button onClick={() => setEditProfile(false)}
                                className="flex-1 py-2.5 bg-zinc-100 text-zinc-700 font-bold text-sm rounded-xl hover:bg-zinc-200 transition border-none cursor-pointer">Cancel</button>
                            <button onClick={() => setEditProfile(false)}
                                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm rounded-xl hover:opacity-90 cursor-pointer transition border-none">Save Changes ✦</button>
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
