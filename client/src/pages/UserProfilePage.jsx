import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux'
import { addPreviousProject, getFreelancer, removePreviousWork } from "../features/Freelancer/freelancerSlice"
import { toast } from "react-toastify"
import LoaderGradient from "../components/LoaderGradient"
import { getProjects, getBids, updateBidStatus, resetUpdate } from "../features/project/projectSlice"
import ListProject from "../components/ListProject"
import BecomeFreelancerModal from "../components/Becomefreelancermodal"

// ── Status maps ────────────────────────────────────────────
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

const BID_STATUS_COLORS = {
    "Pending": "text-amber-600 bg-amber-50 border border-amber-200",
    "pending": "text-amber-600 bg-amber-50 border border-amber-200",
    "Accepted": "text-emerald-700 bg-emerald-50 border border-emerald-200",
    "accepted": "text-emerald-700 bg-emerald-50 border border-emerald-200",
    "Rejected": "text-rose-600 bg-rose-50 border border-rose-200",
    "rejected": "text-rose-600 bg-rose-50 border border-rose-200",
}

// ── Project + Bids Modal (Redux-based) ─────────────────────
const ProjectModal = ({ project, onClose, onBidStatusChange }) => {
    if (!project) return null

    const dispatch = useDispatch()
    const { bids, projectLoading: bidsLoading, updatingBidId, updateSuccess, updateError, updateErrorMessage } =
        useSelector(state => state.project)

    const [activeView, setActiveView] = useState("details")

    const initials = (project.user?.name || '?')
        .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

    const techList = project.technology
        ? project.technology.split(',').map(t => t.trim()).filter(Boolean)
        : []

    useEffect(() => {
        if (project._id) dispatch(getBids(project._id))
    }, [project._id, dispatch])

    useEffect(() => {
        if (updateSuccess) {
            toast.success("Bid status updated!")
            if (onBidStatusChange) onBidStatusChange()
            dispatch(resetUpdate())
        }
        if (updateError) {
            toast.error(updateErrorMessage || "Failed to update bid status")
            dispatch(resetUpdate())
        }
    }, [updateSuccess, updateError])

    const handleBidStatus = (bidId, status) => dispatch(updateBidStatus({ bidId, status }))

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-in bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 relative overflow-hidden">
                    <div className="absolute w-24 h-24 rounded-full bg-white/10 -top-8 -right-6 pointer-events-none" />
                    <button onClick={onClose}
                        className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer">✕</button>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">📋</div>
                        <div>
                            <h2 className="text-white font-black text-lg leading-tight pr-8">{project.title}</h2>
                            <p className="text-blue-100 text-xs">Project Details</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[project.status] || "text-gray-600 bg-gray-100"}`}>
                            {project.status}
                        </span>
                        <span className="text-xs text-blue-100">{bids.length} bid{bids.length !== 1 ? 's' : ''} received</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-100">
                    {[{ id: "details", label: "📋 Details" }, { id: "bids", label: `💼 Bids (${bids.length})` }].map(t => (
                        <button key={t.id} onClick={() => setActiveView(t.id)}
                            className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${activeView === t.id
                                ? "border-blue-500 text-blue-600 bg-blue-50/50"
                                : "border-transparent text-zinc-500 hover:text-zinc-800"}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Details */}
                {activeView === "details" && (
                    <div className="px-6 py-5 space-y-4 max-h-[55vh] overflow-y-auto">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-zinc-900 text-sm">{project.user?.name || '—'}</p>
                                <p className="text-zinc-500 text-xs truncate">{project.user?.email || '—'}</p>
                            </div>
                            <span className="text-xs text-zinc-400 font-medium shrink-0">Client</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Budget', value: project.budget ? `₹${Number(project.budget).toLocaleString('en-IN')}` : '—', color: 'text-emerald-700' },
                                { label: 'Duration', value: project.duration ? `${project.duration} days` : '—', color: 'text-zinc-900' },
                                { label: 'Category', value: project.category || '—', color: 'text-blue-700' },
                                { label: 'Posted', value: project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-IN') : '—', color: 'text-zinc-900' },
                            ].map(item => (
                                <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{item.label}</p>
                                    <p className={`text-sm font-black ${item.color}`}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                        {project.description && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Description</p>
                                <p className="text-sm text-zinc-600 leading-relaxed">{project.description}</p>
                            </div>
                        )}
                        {techList.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Technologies</p>
                                <div className="flex flex-wrap gap-2">
                                    {techList.map((tech, i) => (
                                        <span key={i} className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full">{tech}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bids */}
                {activeView === "bids" && (
                    <div className="max-h-[55vh] overflow-y-auto">
                        {bidsLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm text-zinc-500">Loading bids...</p>
                                </div>
                            </div>
                        ) : bids.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                                <p className="text-4xl mb-3">💼</p>
                                <p className="font-bold text-zinc-700 text-base mb-1">No bids yet</p>
                                <p className="text-zinc-400 text-sm">Freelancers haven't applied yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {bids.map((bid, i) => {
                                    const freelancer = bid.freelancer
                                    const fname = freelancer?.user?.name || freelancer?.name || 'Freelancer'
                                    const femail = freelancer?.user?.email || freelancer?.email || '—'
                                    const fPic = freelancer?.user?.profilePic || null
                                    const fInitials = fname.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                    const isUpdating = updatingBidId === bid._id

                                    return (
                                        <div key={bid._id || i} className="px-5 py-4 hover:bg-zinc-50 transition fade-up"
                                            style={{ animationDelay: `${i * 60}ms` }}>
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    {fPic
                                                        ? <img src={fPic} alt={fname} className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-100" onError={e => e.target.style.display = 'none'} />
                                                        : <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">{fInitials}</div>
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-bold text-zinc-900 text-sm">{fname}</p>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BID_STATUS_COLORS[bid.status] || "text-gray-600 bg-gray-100"}`}>
                                                            {bid.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                    <p className="text-zinc-500 text-xs truncate">{femail}</p>
                                                    {freelancer?.category && <p className="text-blue-600 text-xs font-medium mt-0.5">{freelancer.category}</p>}
                                                    {freelancer?.experience && <p className="text-zinc-400 text-xs">{freelancer.experience} yrs experience</p>}
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-lg font-black text-emerald-600">₹{bid.amount ? Number(bid.amount).toLocaleString('en-IN') : '—'}</p>
                                                    <p className="text-[10px] text-zinc-400">bid amount</p>
                                                    {bid.createdAt && <p className="text-[10px] text-zinc-400 mt-0.5">{new Date(bid.createdAt).toLocaleDateString('en-IN')}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                {freelancer?.user?._id && (
                                                    <Link to={`/profile/${freelancer.user._id}`} onClick={onClose}
                                                        className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                                                        👤 View Profile
                                                    </Link>
                                                )}
                                                {[
                                                    { label: '✓ Accept', s: 'Accepted', idle: 'text-emerald-600 border-emerald-200', done: 'bg-emerald-100 text-emerald-700 border-emerald-200', hover: 'hover:bg-emerald-500 hover:text-white' },
                                                    { label: '✕ Reject', s: 'Rejected', idle: 'text-rose-600 border-rose-200', done: 'bg-rose-100 text-rose-700 border-rose-200', hover: 'hover:bg-rose-500 hover:text-white' },
                                                    { label: '◷ Pending', s: 'Pending', idle: 'text-amber-600 border-amber-200', done: 'bg-amber-100 text-amber-700 border-amber-200', hover: 'hover:bg-amber-500 hover:text-white' },
                                                ].map(btn => (
                                                    <button key={btn.s}
                                                        onClick={() => handleBidStatus(bid._id, btn.s)}
                                                        disabled={isUpdating || bid.status === btn.s}
                                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border
                                                            ${bid.status === btn.s ? btn.done + ' cursor-default' : 'bg-white ' + btn.idle + ' ' + btn.hover + ' cursor-pointer'}
                                                            ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        {isUpdating ? '⏳' : btn.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                <div className="px-6 py-4 border-t border-zinc-100 flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 bg-zinc-100 text-zinc-700 font-bold text-sm rounded-xl hover:bg-zinc-200 transition cursor-pointer">Close</button>
                    <button onClick={() => setActiveView(activeView === 'bids' ? 'details' : 'bids')}
                        className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm rounded-xl hover:shadow-lg transition cursor-pointer">
                        {activeView === 'bids' ? '📋 View Details' : `💼 View Bids (${bids.length})`}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ══════════════════════════════════════════════════════════
const UserProfilePage = () => {
    const navigate = useNavigate()
    const { user } = useSelector(state => state.auth)
    const { freelancer, freelancerLoading, freelancerError, freelancerErrorMessage, freelancerSuccess } =
        useSelector(state => state.freelancer)
    const { listedProjects } = useSelector(state => state.project)
    const dispatch = useDispatch()

    // ✅ Track local freelancer status for instant UI update
    const [justBecameFreelancer, setJustBecameFreelancer] = useState(false)
    const isFreelancer = user?.isFreelancer || justBecameFreelancer

    const [inFreelancer, setIsFreelancer] = useState(isFreelancer)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showBecomeFModal, setShowBecomeFModal] = useState(false)
    const [deleteTargetId, setDeleteTargetId] = useState(null)
    const [editTarget, setEditTarget] = useState(null)
    const [editProfile, setEditProfile] = useState(false)
    const [activeTab, setActiveTab] = useState(isFreelancer ? "portfolio" : "bids")
    const [selectedProject, setSelectedProject] = useState(null)

    const [formData, setFormData] = useState({ projectLink: "", projectImage: "", projectDescription: "" })
    const { projectLink, projectDescription, projectImage } = formData

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })
    const handleSubmit = e => { e.preventDefault(); dispatch(addPreviousProject(formData)) }

    const myProjects = Array.isArray(listedProjects)
        ? listedProjects.filter(p => p.user?._id === user?._id)
        : []

    useEffect(() => {
        if (freelancerSuccess) {
            setShowAddModal(false)
            setShowDeleteModal(false)
            setFormData({ projectLink: "", projectDescription: "", projectImage: "" })
        }
    }, [freelancerSuccess])

    useEffect(() => {
        if (user?._id) {
            dispatch(getFreelancer(user._id))
            dispatch(getProjects())
        }
    }, [dispatch, user?._id])

    useEffect(() => {
        if (freelancerError && freelancerErrorMessage?.trim()) toast.error(freelancerErrorMessage)
    }, [freelancerError, freelancerErrorMessage])

    // ✅ Sync inFreelancer with justBecameFreelancer
    useEffect(() => {
        if (justBecameFreelancer) {
            setIsFreelancer(true)
            setActiveTab("portfolio")
        }
    }, [justBecameFreelancer])

    const handleRemove = () => {
        if (deleteTargetId) {
            dispatch(removePreviousWork(deleteTargetId))
            setShowDeleteModal(false)
            setDeleteTargetId(null)
        }
    }
    useEffect(() => {
        // ✅ Sirf real errors pe toast dikho, "not found" pe nahi
        if (freelancerError && freelancerErrorMessage?.trim() &&
            freelancerErrorMessage !== "Freelancer not found") {
            toast.error(freelancerErrorMessage)
        }
    }, [freelancerError, freelancerErrorMessage])

    const openAdd = () => { setEditTarget(null); setShowAddModal(true) }
    const openEdit = proj => {
        setEditTarget(proj)
        setFormData({ projectLink: proj.projectLink || "", projectImage: proj.projectImage || "", projectDescription: proj.projectDescription || "" })
        setShowAddModal(true)
    }

    if (freelancerLoading) return <LoaderGradient />
    if (!user) return <div className="min-h-screen flex items-center justify-center"><p>Please login first.</p></div>

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;900&display=swap');
                .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
                .line-clamp-3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
                ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#3B7FF5;border-radius:9px}
                @keyframes fadeUp  {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes modalIn {from{opacity:0;transform:scale(.94) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
                .fade-up  {animation:fadeUp  .45s ease both}
                .modal-in {animation:modalIn .3s cubic-bezier(.34,1.56,.64,1) both}
            `}</style>

            {/* ✅ BecomeFreelancerModal — real API, 2-step form */}
            {showBecomeFModal && (
                <BecomeFreelancerModal
                    onClose={() => setShowBecomeFModal(false)}
                    onSuccess={() => {
                        setShowBecomeFModal(false)
                        setJustBecameFreelancer(true)   // ✅ instant UI update
                        dispatch(getFreelancer(user._id)) // ✅ refresh freelancer data
                    }}
                />
            )}

            <div className="min-h-screen bg-slate-50">

                {/* Demo switcher */}
                {user?.isFreelancer || justBecameFreelancer ? (
                    <div className="bg-zinc-900 text-white text-xs flex items-center justify-center gap-4 py-2.5 px-4">
                        <span className="text-zinc-400">Preview mode — switch user type:</span>
                        <button onClick={() => { setIsFreelancer(true); setActiveTab("portfolio") }}
                            className={`px-3 py-1 rounded-full font-bold transition cursor-pointer border-none ${inFreelancer ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"}`}>
                            Freelancer
                        </button>
                        <button onClick={() => { setIsFreelancer(false); setActiveTab("bids") }}
                            className={`px-3 py-1 rounded-full font-bold transition cursor-pointer border-none ${!inFreelancer ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"}`}>
                            Regular User
                        </button>
                    </div>
                ) : (
                    <div className="bg-zinc-900 text-white text-xs flex items-center justify-center gap-4 py-2.5 px-4">
                        <span className="text-zinc-400">Preview mode:</span>
                        <button className="px-3 py-1 rounded-full font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-none">Regular User</button>
                    </div>
                )}

                {/* Profile Hero */}
                <div className="relative">
                    <div className="h-44 sm:h-56 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                        <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=60')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.18 }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60" />
                    </div>
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14 relative z-10 pb-6 border-b border-zinc-100">
                            <div className="relative shrink-0">
                                <img src={user?.profilePic || "https://i.pravatar.cc/150"}
                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-white shadow-xl object-cover" alt="avatar" />
                                {inFreelancer && (
                                    <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-black px-2 py-0.5 rounded-full shadow">✦ PRO</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 pb-1">
                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                    <h1 className="text-2xl font-black text-white leading-tight" style={{ fontFamily: "'Playfair Display',serif" }}>{user?.name}</h1>
                                    {inFreelancer
                                        ? <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-2.5 py-0.5 rounded-full">Freelancer ✦</span>
                                        : <span className="text-xs font-bold bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-full border border-zinc-200">Member</span>
                                    }
                                </div>
                                <p className="text-white text-sm mb-2">{user?.email} , India 🇮🇳</p>
                                <p className="text-zinc-400 text-xs">Id: {user?._id}</p>
                                <div className="text-xs text-zinc-900 py-0.5 font-medium">{freelancer?.profile?.category}</div>
                                {inFreelancer
                                    ? <p className="text-xs text-zinc-900 py-0.5 font-medium">Experience: {freelancer?.profile?.experience}</p>
                                    : <p className="text-zinc-900 text-sm max-w-lg">Tech enthusiast and blogger. I love discovering talented freelancers.</p>
                                }
                                <div className="flex flex-wrap gap-1.5 mt-2.5">
                                    <div className="text-xs bg-zinc-100 text-zinc-900 px-2.5 py-0.5 rounded-full font-medium border border-zinc-200">{freelancer?.profile?.skills}</div>
                                    {(inFreelancer ? ["React", "Tailwind CSS", "Figma", "Next.js", "UI/UX"] : ["Blogging", "Startups", "Product"]).map(tag => (
                                        <span key={tag} className="text-xs bg-zinc-100 text-zinc-900 px-2.5 py-0.5 rounded-full font-medium border border-zinc-200">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto sm:pb-1">
                                <button onClick={() => setEditProfile(true)}
                                    className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:opacity-90 transition cursor-pointer shadow border-none">
                                    ✏️ Edit Profile
                                </button>
                                {/* ✅ Button changes on activation */}
                                {!inFreelancer && (
                                    <button onClick={() => setShowBecomeFModal(true)}
                                        className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:opacity-90 transition shadow cursor-pointer border-none">
                                        ✦ Become Freelancer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 fade-up">
                        {(inFreelancer
                            ? [
                                { label: "Projects", value: freelancer?.previousWorks?.length ?? 0, icon: "🗂" },
                                { label: "Blogs", value: "48", icon: "📝" },
                                { label: "Clients", value: "21", icon: "🤝" },
                                { label: "Rating", value: "4.9 ★", icon: "⭐" },
                            ]
                            : [
                                { label: "Projects", value: myProjects.length, icon: "📋" },
                                { label: "Following", value: "183", icon: "👥" },
                                { label: "Followers", value: "2.1K", icon: "❤️" },
                                { label: "Blogs", value: "0", icon: "📝" },
                            ]
                        ).map((s, i) => (
                            <div key={s.label} className="bg-white rounded-2xl border border-zinc-100 shadow-md p-4 text-center fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                                <p className="text-xl mb-1">{s.icon}</p>
                                <p className="text-2xl font-black text-zinc-900">{s.value}</p>
                                <p className="text-zinc-500 text-xs mt-0.5 font-medium">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex gap-1 border-b border-zinc-200 mb-6">
                        {(inFreelancer
                            ? [{ id: "portfolio", label: "Portfolio" }, { id: "reviews", label: "Reviews" }]
                            : [{ id: "bids", label: "My Projects" }, { id: "saved", label: "Saved" }]
                        ).map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px cursor-pointer border-none bg-transparent ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-zinc-500 hover:text-zinc-800"}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Portfolio Tab */}
                    {inFreelancer && activeTab === "portfolio" && (
                        <div className="space-y-6 pb-12">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-zinc-900" style={{ fontFamily: "'Playfair Display',serif" }}>Previous Work</h2>
                                    <p className="text-zinc-500 text-xs mt-0.5">{freelancer?.previousWorks?.length ?? 0} projects · publicly visible</p>
                                </div>
                                <button onClick={openAdd}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 cursor-pointer text-white font-bold text-sm rounded-xl hover:opacity-90 transition shadow-md border-none">
                                    <span className="text-lg leading-none">＋</span> Add Project
                                </button>
                            </div>
                            {!freelancer?.previousWorks?.length ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
                                    <p className="text-5xl mb-3">🗂</p>
                                    <p className="text-zinc-500 font-semibold text-sm">No projects yet. Add your first one!</p>
                                    <button onClick={openAdd} className="mt-4 px-5 py-2 bg-amber-400 text-zinc-900 font-bold text-sm rounded-xl hover:bg-amber-300 transition cursor-pointer border-none">+ Add Project</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {freelancer.previousWorks.map((proj, i) => (
                                        <div key={proj._id} className="group bg-white rounded-2xl border border-zinc-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                                            <div className="relative h-44 overflow-hidden bg-zinc-100">
                                                {proj.projectImage
                                                    ? <img src={proj.projectImage} alt="Project" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    : <div className="w-full h-full flex items-center justify-center text-4xl text-zinc-300">🖼</div>
                                                }
                                                <div className="absolute inset-0 bg-zinc-900/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                                    <button onClick={() => openEdit(proj)} className="cursor-pointer px-4 py-2 bg-white text-zinc-900 font-bold text-xs rounded-xl hover:bg-green-100 transition shadow border-none">✏️ Edit</button>
                                                    <button onClick={() => { setDeleteTargetId(proj._id); setShowDeleteModal(true) }} className="cursor-pointer px-4 py-2 bg-rose-500 text-white font-bold text-xs rounded-xl hover:bg-rose-400 transition shadow border-none">🗑 Delete</button>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-zinc-700 text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                    {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                                                </h3>
                                                <p className="text-zinc-500 text-xs leading-relaxed mb-3 line-clamp-3">{proj.projectDescription}</p>
                                                {proj.projectLink && (
                                                    <Link to={proj.projectLink} target="_blank" rel="noreferrer"
                                                        className="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition">
                                                        🔗 View Project ↗
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={openAdd} className="group flex flex-col items-center justify-center h-full min-h-[260px] bg-white rounded-2xl border-2 border-dashed border-zinc-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 text-zinc-400 hover:text-blue-500 cursor-pointer border-none">
                                        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">＋</span>
                                        <span className="text-sm font-bold">Add New Project</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* My Projects Tab */}
                    {!inFreelancer && activeTab === "bids" && (
                        <div className="space-y-4 pb-12">
                            {selectedProject && (
                                <ProjectModal
                                    project={selectedProject}
                                    onClose={() => setSelectedProject(null)}
                                    onBidStatusChange={() => dispatch(getProjects())}
                                />
                            )}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-zinc-900" style={{ fontFamily: "'Playfair Display',serif" }}>My Posted Projects</h2>
                                    <p className="text-zinc-500 text-xs mt-0.5">{myProjects.length} projects listed</p>
                                </div>
                                <Link to="/browse-projects">
                                    <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm rounded-xl hover:shadow-lg transition shadow cursor-pointer border-none">
                                        🔍 Browse Projects
                                    </button>
                                </Link>
                            </div>
                            {myProjects.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
                                    <p className="text-5xl mb-3">📋</p>
                                    <p className="text-zinc-500 font-semibold text-sm">No projects posted yet.</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-zinc-100 shadow-md overflow-hidden">
                                    <div className="grid grid-cols-12 px-5 py-3 bg-zinc-50 border-b border-zinc-100 text-xs font-bold text-zinc-400 uppercase tracking-wide">
                                        <div className="col-span-3">Title</div>
                                        <div className="col-span-2">Category</div>
                                        <div className="col-span-2 hidden sm:block">Client</div>
                                        <div className="col-span-1 hidden sm:block">Budget</div>
                                        <div className="col-span-2">Status</div>
                                        <div className="col-span-1 text-center hidden sm:block">Date</div>
                                        <div className="col-span-1 text-center">View</div>
                                    </div>
                                    {myProjects.map((bid, i) => (
                                        <div key={bid._id}
                                            className="grid grid-cols-12 px-5 py-4 items-center hover:bg-zinc-50 transition border-b border-zinc-100 last:border-0 fade-up"
                                            style={{ animationDelay: `${i * 60}ms` }}>
                                            <div className="col-span-3 min-w-0 pr-2"><p className="font-bold text-zinc-900 text-sm truncate">{bid.title}</p></div>
                                            <div className="col-span-2 min-w-0 pr-2"><p className="text-xs text-zinc-600 font-medium truncate">{bid.category}</p></div>
                                            <div className="col-span-2 hidden sm:block min-w-0 pr-2"><p className="text-xs text-zinc-600 font-medium truncate">{bid.user?.name}</p></div>
                                            <div className="col-span-1 hidden sm:block"><p className="text-xs font-bold text-emerald-600 whitespace-nowrap">₹{bid.budget ? Number(bid.budget).toLocaleString('en-IN') : '—'}</p></div>
                                            <div className="col-span-2">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[bid.status] || "text-gray-600 bg-gray-100"}`}>{bid.status}</span>
                                            </div>
                                            <div className="col-span-1 hidden sm:block text-center text-xs text-zinc-400 whitespace-nowrap">
                                                {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                                            </div>
                                            <div className="col-span-1 flex justify-center">
                                                <button onClick={() => setSelectedProject(bid)}
                                                    className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 cursor-pointer">
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <ListProject />
                            {/* CTA — hidden after activation */}
                            {!inFreelancer && (
                                <div className="mt-6 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-xl">
                                    <div className="text-5xl">🚀</div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <p className="text-white font-black text-lg" style={{ fontFamily: "'Playfair Display',serif" }}>Want to earn instead of hire?</p>
                                        <p className="text-zinc-400 text-sm mt-1">Become a freelancer and showcase your work to hundreds of clients.</p>
                                    </div>
                                    <button onClick={() => setShowBecomeFModal(true)}
                                        className="shrink-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black rounded-xl hover:shadow-lg transition whitespace-nowrap cursor-pointer border-none">
                                        ✦ Become a Freelancer
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {inFreelancer && activeTab === "reviews" && (
                        <div className="space-y-4 pb-12">
                            {[
                                { name: "Rahul M.", avatar: "https://i.pravatar.cc/40?img=12", rating: 5, text: "Delivered the project on time and went above expectations.", date: "Feb 2026" },
                                { name: "Priya S.", avatar: "https://i.pravatar.cc/40?img=21", rating: 5, text: "Incredible attention to detail. Communication was smooth.", date: "Jan 2026" },
                                { name: "James T.", avatar: "https://i.pravatar.cc/40?img=9", rating: 4, text: "Great work overall. Would hire again.", date: "Dec 2025" },
                            ].map((r, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-md p-5 fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                                    <div className="flex items-start gap-3 mb-3">
                                        <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-xl ring-2 ring-blue-200 shrink-0" />
                                        <div>
                                            <p className="font-bold text-zinc-900 text-sm">{r.name}</p>
                                            <div className="flex gap-0.5 mt-0.5">
                                                {Array.from({ length: 5 }).map((_, k) => (
                                                    <span key={k} className={`text-sm ${k < r.rating ? "text-amber-400" : "text-zinc-200"}`}>★</span>
                                                ))}
                                            </div>
                                        </div>
                                        <span className="ml-auto text-xs text-zinc-400">{r.date}</span>
                                    </div>
                                    <p className="text-zinc-600 text-sm leading-relaxed">{r.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add/Edit Project Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <form onSubmit={handleSubmit} className="modal-in bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                                <div>
                                    <h2 className="font-black text-zinc-900 text-base" style={{ fontFamily: "'Playfair Display',serif" }}>
                                        {editTarget ? "Edit Project" : "Add New Project"}
                                    </h2>
                                    <p className="text-zinc-400 text-xs mt-0.5">{editTarget ? "Update your project details" : "Showcase your best work"}</p>
                                </div>
                                <button type="button" onClick={() => setShowAddModal(false)}
                                    className="w-8 h-8 rounded-xl bg-zinc-200 hover:bg-zinc-300 transition flex items-center justify-center text-zinc-600 font-bold text-sm cursor-pointer border-none">✕</button>
                            </div>
                            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                                {projectImage && (
                                    <div className="h-36 rounded-xl overflow-hidden border border-zinc-200">
                                        <img src={projectImage} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                                    </div>
                                )}
                                {[
                                    { label: "Project Link", name: "projectLink", value: projectLink, placeholder: "https://your-project.com", type: "input" },
                                    { label: "Project Image URL", name: "projectImage", value: projectImage, placeholder: "https://your-image-url.com/photo.jpg", type: "input" },
                                    { label: "Project Description", name: "projectDescription", value: projectDescription, placeholder: "Describe what you built...", type: "textarea" },
                                ].map(field => (
                                    <div key={field.name}>
                                        <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">{field.label}</label>
                                        {field.type === "textarea"
                                            ? <textarea name={field.name} value={field.value} onChange={handleChange} placeholder={field.placeholder} rows={3}
                                                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none" />
                                            : <input type="text" name={field.name} value={field.value} onChange={handleChange} placeholder={field.placeholder}
                                                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                                        }
                                    </div>
                                ))}
                            </div>
                            <div className="px-6 py-4 border-t border-zinc-100 flex gap-3">
                                <button type="button" onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2.5 bg-zinc-100 text-zinc-700 font-bold text-sm rounded-xl cursor-pointer hover:bg-zinc-200 transition border-none">Cancel</button>
                                <button type="submit"
                                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 cursor-pointer text-white font-bold text-sm rounded-xl transition shadow-md border-none">
                                    {editTarget ? "Save Changes" : "Add Project"} ✦
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="modal-in bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🗑</div>
                            <h2 className="font-black text-zinc-900 text-lg mb-1" style={{ fontFamily: "'Playfair Display',serif" }}>Delete Project?</h2>
                            <p className="text-zinc-500 text-sm mb-6">This will permanently remove the project.</p>
                            <div className="flex gap-3">
                                <button onClick={() => { setShowDeleteModal(false); setDeleteTargetId(null) }}
                                    className="flex-1 py-2.5 bg-zinc-100 text-zinc-700 font-bold text-sm rounded-xl hover:bg-zinc-200 transition cursor-pointer border-none">Keep It</button>
                                <button onClick={handleRemove}
                                    className="flex-1 py-2.5 bg-rose-500 text-white font-bold text-sm rounded-xl hover:bg-rose-400 transition shadow-md cursor-pointer border-none">Yes, Delete</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Profile Modal */}
                {editProfile && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="modal-in bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                                <h2 className="font-black text-zinc-900 text-base" style={{ fontFamily: "'Playfair Display',serif" }}>Edit Profile</h2>
                                <button onClick={() => setEditProfile(false)}
                                    className="w-8 h-8 rounded-xl bg-zinc-200 hover:bg-zinc-300 transition flex items-center justify-center text-zinc-600 font-bold text-sm cursor-pointer border-none">✕</button>
                            </div>
                            <div className="px-6 py-5 space-y-4">
                                <div className="flex items-center gap-4">
                                    <img src={user?.profilePic || "https://i.pravatar.cc/150"} alt="Profile" className="w-16 h-16 rounded-2xl ring-2 ring-blue-300 object-cover" />
                                    <button className="px-4 py-2 bg-zinc-100 text-zinc-700 font-bold text-xs rounded-xl hover:bg-zinc-200 transition cursor-pointer border-none">Change Photo</button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
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
                                    <textarea defaultValue="Frontend developer & UI/UX designer." rows={3}
                                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">Location</label>
                                    <input defaultValue="Indore, India" className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                                </div>
                                {inFreelancer && (
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">Skills <span className="text-zinc-400 normal-case font-normal">(comma separated)</span></label>
                                        <input defaultValue="React, Tailwind CSS, Figma, Next.js" className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                                    </div>
                                )}
                            </div>
                            <div className="px-6 py-4 border-t border-zinc-100 flex gap-3">
                                <button onClick={() => setEditProfile(false)}
                                    className="flex-1 py-2.5 bg-zinc-100 text-zinc-700 font-bold text-sm rounded-xl hover:bg-zinc-200 transition cursor-pointer border-none">Cancel</button>
                                <button onClick={() => setEditProfile(false)}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm rounded-xl hover:opacity-90 cursor-pointer transition border-none">Save Changes ✦</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserProfilePage