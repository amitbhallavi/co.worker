import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux'
import { addPreviousProject, getFreelancer, removePreviousWork } from "../features/Freelancer/freelancerSlice"
import { toast } from "react-toastify"
import LoaderGradient from "../components/LoaderGradient"
import { getProjects, getBids, updateBidStatus, resetUpdate } from "../features/project/projectSlice"
import ListProject from "../components/ListProject"
import BecomeFreelancerModal from "../components/Becomefreelancermodal"
import RatingSummary from "../components/RatingSummary"
import {
    BadgeCheck,
    BriefcaseBusiness,
    Compass,
    FolderOpen,
    LayoutDashboard,
    Mail,
    MapPin,
    PencilLine,
    Plus,
    Sparkles,
    UserRound,
} from "lucide-react"

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
    const dispatch = useDispatch()
    const { bids, projectLoading: bidsLoading, updatingBidId, updateSuccess, updateError, updateErrorMessage } =
        useSelector(state => state.project)

    const [activeView, setActiveView] = useState("details")

    useEffect(() => {
        if (project?._id) dispatch(getBids(project._id))
    }, [project?._id, dispatch])

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
    }, [dispatch, onBidStatusChange, updateError, updateErrorMessage, updateSuccess])

    const handleBidStatus = (bidId, status) => dispatch(updateBidStatus({ bidId, status }))

    if (!project) return null

    const initials = (project.user?.name || '?')
        .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

    const techList = project.technology
        ? project.technology.split(',').map(t => t.trim()).filter(Boolean)
        : []

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

const SURFACE = "rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_-34px_rgba(15,23,42,0.22)]"

const getSkillTags = (skills = "", fallback = []) => {
    const list = typeof skills === "string"
        ? skills.split(",").map((item) => item.trim()).filter(Boolean)
        : []

    return list.length ? list : fallback
}

const ProfileMetricCard = ({ icon, label, value, accent = "from-blue-500 to-cyan-500" }) => (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.08] p-4">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
            {icon}
        </div>
        <div className="mt-4 text-2xl font-black tracking-tight text-white">{value}</div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">{label}</div>
    </div>
)

const ProfileInfoCard = ({ icon, title, value, tone = "text-slate-900" }) => (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                {icon}
            </div>
            <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{title}</div>
                <div className={`mt-1 truncate text-sm font-semibold ${tone}`}>{value}</div>
            </div>
        </div>
    </div>
)

const ProfileEmptyState = ({ icon, title, message, action }) => (
    <div className={`${SURFACE} p-8 text-center sm:p-10`}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-slate-100 text-slate-600">
            {icon}
        </div>
        <h3 className="mt-5 text-xl font-black text-slate-900">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
        {action}
    </div>
)

const PostedProjectCard = ({ project, index, onView }) => (
    <div
        className={`${SURFACE} fade-up p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_-36px_rgba(14,116,144,0.28)]`}
        style={{ animationDelay: `${index * 60}ms` }}
    >
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
                        {project.category || "General"}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_COLORS[project.status] || "text-gray-600 bg-gray-100 border border-gray-200"}`}>
                        {project.status}
                    </span>
                </div>
                <h3 className="text-base font-black leading-snug text-slate-950 line-clamp-2">{project.title}</h3>
            </div>

            <button
                onClick={() => onView(project)}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
            >
                View
            </button>
        </div>

        {project.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{project.description}</p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
            <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Budget</div>
                <div className="mt-1 text-sm font-black text-emerald-600">
                    ₹{project.budget ? Number(project.budget).toLocaleString('en-IN') : '—'}
                </div>
            </div>
            <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Posted</div>
                <div className="mt-1 text-sm font-semibold text-slate-700">
                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                </div>
            </div>
        </div>
    </div>
)

// ══════════════════════════════════════════════════════════
const UserProfilePage = () => {
    const { user } = useSelector(state => state.auth)
    const { freelancer, freelancerLoading, freelancerError, freelancerErrorMessage } =
        useSelector(state => state.freelancer)
    const { listedProjects } = useSelector(state => state.project)
    const dispatch = useDispatch()

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
    const [composerOpen, setComposerOpen] = useState(false)

    const [formData, setFormData] = useState({ projectLink: "", projectImage: "", projectDescription: "" })
    const { projectLink, projectDescription, projectImage } = formData

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await dispatch(addPreviousProject(formData)).unwrap()
            setShowAddModal(false)
            setShowDeleteModal(false)
            setFormData({ projectLink: "", projectDescription: "", projectImage: "" })
        } catch {
            // Errors are surfaced through the existing freelancer error effect.
        }
    }

    const myProjects = Array.isArray(listedProjects)
        ? listedProjects.filter(p => p.user?._id === user?._id)
        : []

    useEffect(() => {
        if (user?._id) {
            dispatch(getFreelancer(user._id))
            dispatch(getProjects())
        }
    }, [dispatch, user?._id])

    const handleRemove = async () => {
        if (deleteTargetId) {
            try {
                await dispatch(removePreviousWork(deleteTargetId)).unwrap()
                setShowDeleteModal(false)
                setDeleteTargetId(null)
            } catch {
                // Errors are surfaced through the existing freelancer error effect.
            }
        }
    }
    useEffect(() => {
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

    const skillTags = getSkillTags(
        freelancer?.profile?.skills,
        inFreelancer ? ["React", "Tailwind CSS", "UI Systems"] : ["Blogging", "Startups", "Product"]
    )

    const metricItems = inFreelancer
        ? [
            { label: "Portfolio", value: freelancer?.previousWorks?.length ?? 0, icon: <FolderOpen size={16} />, accent: "from-blue-500 to-cyan-500" },
            { label: "Reviews", value: "48", icon: <Sparkles size={16} />, accent: "from-violet-500 to-fuchsia-500" },
            { label: "Clients", value: "21", icon: <BadgeCheck size={16} />, accent: "from-emerald-500 to-teal-500" },
            { label: "Rating", value: "4.9 ★", icon: <Compass size={16} />, accent: "from-amber-500 to-orange-500" },
        ]
        : [
            { label: "Projects", value: myProjects.length, icon: <BriefcaseBusiness size={16} />, accent: "from-blue-500 to-cyan-500" },
            { label: "Following", value: "183", icon: <UserRound size={16} />, accent: "from-violet-500 to-fuchsia-500" },
            { label: "Followers", value: "2.1K", icon: <BadgeCheck size={16} />, accent: "from-rose-500 to-orange-500" },
            { label: "Blogs", value: "0", icon: <LayoutDashboard size={16} />, accent: "from-emerald-500 to-teal-500" },
        ]

    const infoCards = [
        { title: "Role", value: inFreelancer ? "Freelancer profile preview" : "Regular user account", icon: <Sparkles size={16} /> },
        { title: "Email", value: user?.email || "—", icon: <Mail size={16} />, tone: "text-slate-700" },
        { title: "Location", value: user?.location || "India", icon: <MapPin size={16} />, tone: "text-slate-700" },
        { title: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : "Recently", icon: <BadgeCheck size={16} />, tone: "text-slate-700" },
    ]

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
                .line-clamp-3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
                ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#3B7FF5;border-radius:9px}
                @keyframes fadeUp  {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes modalIn {from{opacity:0;transform:scale(.94) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
                .fade-up  {animation:fadeUp  .45s ease both}
                .modal-in {animation:modalIn .3s cubic-bezier(.34,1.56,.64,1) both}
            `}</style>

            {showBecomeFModal && (
                <BecomeFreelancerModal
                    onClose={() => setShowBecomeFModal(false)}
                    onSuccess={() => {
                        setShowBecomeFModal(false)
                        setJustBecameFreelancer(true)
                        setIsFreelancer(true)
                        setActiveTab("portfolio")
                        dispatch(getFreelancer(user._id))
                    }}
                />
            )}

            <div className="min-h-screen bg-[#f5f7fb] text-slate-900">

                {user?.isFreelancer || justBecameFreelancer ? (
                    <div className="border-b border-slate-200 bg-white/95">
                        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-4 py-3 text-xs sm:justify-between sm:px-6">
                            <span className="font-semibold text-slate-500">Preview mode: switch between freelancer and regular user views.</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setIsFreelancer(true)
                                        setActiveTab("portfolio")
                                        setComposerOpen(false)
                                    }}
                                    className={`rounded-full px-4 py-2 font-bold transition ${inFreelancer ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                                >
                                    Freelancer
                                </button>
                                <button
                                    onClick={() => {
                                        setIsFreelancer(false)
                                        setActiveTab("bids")
                                        setComposerOpen(false)
                                    }}
                                    className={`rounded-full px-4 py-2 font-bold transition ${!inFreelancer ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                                >
                                    Regular User
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="border-b border-slate-200 bg-white/95">
                        <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-3 text-xs sm:px-6">
                            <span className="font-semibold text-slate-500">Preview mode:</span>
                            <span className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 font-bold text-white">Regular User</span>
                        </div>
                    </div>
                )}

                <section className="relative overflow-hidden bg-[#071429] pb-10 pt-6 sm:pt-8">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div
                            className="absolute -top-10 right-0 h-72 w-72 opacity-70"
                            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)" }}
                        />
                        <div
                            className="absolute bottom-0 left-0 h-64 w-64 opacity-60"
                            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 70%)" }}
                        />
                        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
                    </div>

                    <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="rounded-[32px] border border-white/10 bg-white/[0.08] p-5 shadow-[0_24px_80px_-40px_rgba(8,145,178,0.4)] sm:p-8">
                            <div className="grid gap-6 lg:grid-cols-[auto,minmax(0,1fr),auto] lg:items-end">
                                <div className="relative mx-auto lg:mx-0">
                                    <img
                                        src={user?.profilePic || "https://i.pravatar.cc/150"}
                                        className="h-24 w-24 rounded-[26px] object-cover ring-4 ring-white/20 shadow-2xl sm:h-28 sm:w-28"
                                        alt="avatar"
                                    />
                                    <span className={`absolute -bottom-2 -right-2 rounded-full px-3 py-1 text-[11px] font-black shadow-lg ${inFreelancer ? "bg-white text-slate-900" : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"}`}>
                                        {inFreelancer ? "✦ PRO" : "Member"}
                                    </span>
                                </div>

                                <div className="min-w-0 text-center lg:text-left">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-200">
                                        <Sparkles size={12} />
                                        {inFreelancer ? "Freelancer preview" : "Regular user profile"}
                                    </div>
                                    <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl" style={{ fontFamily: "'Playfair Display',serif" }}>
                                        {user?.name}
                                    </h1>
                                    <p className="mt-2 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                                        {inFreelancer
                                            ? (freelancer?.profile?.description || "Showcase your work, highlight your skills, and make it easier for clients to trust your profile.")
                                            : "Manage your posted projects, keep your profile clean, and only open the project composer when you actually need it."}
                                    </p>
                                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-white/65 lg:justify-start">
                                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">{user?.email}</span>
                                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">ID: {user?._id?.slice(-8)}</span>
                                        {freelancer?.profile?.category && (
                                            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-cyan-200">
                                                {freelancer.profile.category}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                                    <button
                                        onClick={() => setEditProfile(true)}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
                                    >
                                        <PencilLine size={16} />
                                        Edit Profile
                                    </button>
                                    {!inFreelancer && (
                                        <button
                                            onClick={() => setShowBecomeFModal(true)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
                                        >
                                            <Sparkles size={16} />
                                            Become Freelancer
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                                {metricItems.map((item) => (
                                    <ProfileMetricCard key={item.label} {...item} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr),minmax(280px,0.8fr)]">
                        <section className={`${SURFACE} p-5 sm:p-6`}>
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                                <LayoutDashboard size={13} />
                                Profile overview
                            </div>
                            <h2 className="mt-3 text-2xl font-black text-slate-950" style={{ fontFamily: "'Playfair Display',serif" }}>
                                {inFreelancer ? "Your public-facing pitch" : "A cleaner regular user dashboard"}
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                {inFreelancer
                                    ? "This preview shows how clients read your profile. Keep the message sharp, skills obvious, and past work easy to scan."
                                    : "Your profile should show who you are, what you manage, and where to take action next without dumping the whole project form into the first screen."}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2.5">
                                {skillTags.slice(0, 8).map((tag) => (
                                    <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section className={`${SURFACE} p-5 sm:p-6`}>
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                                <BadgeCheck size={13} />
                                Account signals
                            </div>
                            <div className="mt-4 grid gap-3">
                                {infoCards.map((item) => (
                                    <ProfileInfoCard key={item.title} {...item} />
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 rounded-[26px] border border-slate-200 bg-white p-2 shadow-[0_16px_50px_-34px_rgba(15,23,42,0.16)]">
                        {(inFreelancer
                            ? [{ id: "portfolio", label: "Portfolio" }, { id: "reviews", label: "Reviews" }]
                            : [{ id: "bids", label: "My Projects" }, { id: "saved", label: "Saved" }]
                        ).map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${activeTab === tab.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {inFreelancer && activeTab === "portfolio" && (
                        <div className="space-y-5 pb-12 pt-6">
                            <section className={`${SURFACE} p-5 sm:p-6`}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Portfolio</div>
                                        <h2 className="mt-2 text-2xl font-black text-slate-950" style={{ fontFamily: "'Playfair Display',serif" }}>Previous Work</h2>
                                        <p className="mt-1 text-sm text-slate-500">{freelancer?.previousWorks?.length ?? 0} projects visible to clients</p>
                                    </div>
                                    <button
                                        onClick={openAdd}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
                                    >
                                        <Plus size={16} />
                                        Add Project
                                    </button>
                                </div>

                                {!freelancer?.previousWorks?.length ? (
                                    <div className="mt-5 rounded-[26px] border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
                                        <div className="text-5xl opacity-40">🗂</div>
                                        <p className="mt-4 text-sm font-semibold text-slate-600">No projects yet. Add your first one.</p>
                                    </div>
                                ) : (
                                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                                        {freelancer.previousWorks.map((proj) => (
                                            <div key={proj._id} className="group overflow-hidden rounded-[26px] border border-slate-200 bg-slate-50/50 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                                <div className="relative h-44 overflow-hidden bg-slate-100">
                                                    {proj.projectImage
                                                        ? <img src={proj.projectImage} alt="Project" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                                        : <div className="flex h-full w-full items-center justify-center text-4xl text-slate-300">🖼</div>
                                                    }
                                                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-slate-950/70 opacity-0 transition duration-300 group-hover:opacity-100">
                                                        <button onClick={() => openEdit(proj)} className="rounded-2xl bg-white px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-emerald-50">Edit</button>
                                                        <button onClick={() => { setDeleteTargetId(proj._id); setShowDeleteModal(true) }} className="rounded-2xl bg-rose-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-400">Delete</button>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                                        {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                                                    </div>
                                                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{proj.projectDescription}</p>
                                                    {proj.projectLink && (
                                                        <Link to={proj.projectLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800">
                                                            View Project ↗
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {!inFreelancer && activeTab === "bids" && (
                        <div className="space-y-5 pb-12 pt-6">
                            {selectedProject && (
                                <ProjectModal
                                    project={selectedProject}
                                    onClose={() => setSelectedProject(null)}
                                    onBidStatusChange={() => dispatch(getProjects())}
                                />
                            )}

                            <section className={`${SURFACE} p-5 sm:p-6`}>
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Project board</div>
                                        <h2 className="mt-2 text-2xl font-black text-slate-950" style={{ fontFamily: "'Playfair Display',serif" }}>My Posted Projects</h2>
                                        <p className="mt-1 text-sm text-slate-500">{myProjects.length} active entries in your board</p>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Link to="/browse-projects">
                                            <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                                                <Compass size={16} />
                                                Browse Projects
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => setComposerOpen((value) => !value)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
                                        >
                                            {composerOpen ? <LayoutDashboard size={16} /> : <Plus size={16} />}
                                            {composerOpen ? "Hide Composer" : "Post a Project"}
                                        </button>
                                    </div>
                                </div>

                                {myProjects.length === 0 ? (
                                    <div className="mt-6 rounded-[26px] border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
                                        <div className="text-5xl opacity-40">📋</div>
                                        <p className="mt-4 text-sm font-semibold text-slate-600">No projects posted yet.</p>
                                        <p className="mt-1 text-sm text-slate-500">Open the composer and publish your first project when you are ready.</p>
                                    </div>
                                ) : (
                                    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        {myProjects.map((project, index) => (
                                            <PostedProjectCard key={project._id} project={project} index={index} onView={setSelectedProject} />
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className={`${SURFACE} overflow-hidden`}>
                                <button
                                    onClick={() => setComposerOpen((value) => !value)}
                                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                                >
                                    <div>
                                        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Project composer</div>
                                        <h3 className="mt-2 text-xl font-black text-slate-950" style={{ fontFamily: "'Playfair Display',serif" }}>
                                            Post your next project without cluttering the whole profile
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">Open this only when you want to publish something new.</p>
                                    </div>
                                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                        {composerOpen ? "−" : "+"}
                                    </span>
                                </button>

                                {composerOpen && (
                                    <div className="border-t border-slate-200 bg-slate-50/70 p-3 sm:p-5">
                                        <ListProject />
                                    </div>
                                )}
                            </section>

                            {!inFreelancer && (
                                <section className="overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.5)] sm:p-8">
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                        <div className="text-5xl">🚀</div>
                                        <div className="flex-1">
                                            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">Freelancer mode</div>
                                            <h3 className="mt-2 text-2xl font-black text-white" style={{ fontFamily: "'Playfair Display',serif" }}>Want to earn instead of hire?</h3>
                                            <p className="mt-2 text-sm leading-6 text-white/60">Switch roles, showcase past work, and let clients discover you without leaving this account.</p>
                                        </div>
                                        <button
                                            onClick={() => setShowBecomeFModal(true)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
                                        >
                                            <Sparkles size={16} />
                                            Become a Freelancer
                                        </button>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}

                    {inFreelancer && activeTab === "reviews" && (
                        <div className="pb-12 pt-6">
                            <section className={`${SURFACE} p-6 sm:p-7`}>
                                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Reviews</div>
                                <h2 className="mt-2 text-2xl font-black text-slate-950" style={{ fontFamily: "'Playfair Display',serif" }}>Client Reviews</h2>
                                <div className="mt-6">
                                    <RatingSummary
                                        userId={user?._id}
                                        currentUserId={user?._id}
                                        userType="freelancer"
                                        onRatingChange={() => { }}
                                    />
                                </div>
                            </section>
                        </div>
                    )}

                    {!inFreelancer && activeTab === "saved" && (
                        <div className="pb-12 pt-6">
                            <ProfileEmptyState
                                icon={<FolderOpen className="h-7 w-7" />}
                                title="No saved projects yet"
                                message="Saved projects will appear here once you start bookmarking opportunities from the browse page."
                                action={(
                                    <Link to="/browse-projects">
                                        <button className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
                                            <Compass size={16} />
                                            Explore Projects
                                        </button>
                                    </Link>
                                )}
                            />
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
