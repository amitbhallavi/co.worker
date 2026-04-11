
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getProjects } from '../features/project/projectSlice'
import { toast } from 'react-toastify'
import { applyForProject, resetFreelancerSuccess } from '../features/Freelancer/freelancerSlice'

// ── Constants ──────────────────────────────────────────────
const CATEGORY_COLORS = {
    'Web Development': 'bg-blue-50 text-blue-700',
    'Web Developments': 'bg-blue-50 text-blue-700',
    'UI/UX Design': 'bg-purple-50 text-purple-700',
    'Backend Dev': 'bg-green-50 text-green-700',
    'Mobile Dev': 'bg-orange-50 text-orange-700',
    'Data Science': 'bg-sky-50 text-sky-700',
    'Full Stack': 'bg-rose-50 text-rose-700',
    'Full-stack Developer mern': 'bg-rose-50 text-rose-700',
    'WordPress': 'bg-lime-50 text-lime-700',
    'Graphic Design': 'bg-amber-50 text-amber-700',
    'Content Writing': 'bg-slate-50 text-slate-600',
    'APPS DEVELOPER': 'bg-orange-50 text-orange-700',
    'AI - ML DEVELOPER': 'bg-sky-50 text-sky-700',
}

const STATUS_CONFIG = {
    pending: { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400' },
    active: { pill: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
    completed: { pill: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
    'in-progress': { pill: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
    cancelled: { pill: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
}

const CATEGORIES = [
    'All', 'Web Development', 'UI/UX Design', 'Backend Dev', 'Mobile Dev',
    'Data Science', 'Full Stack', 'WordPress', 'Graphic Design',
    'Content Writing', 'APPS DEVELOPER', 'AI - ML DEVELOPER',
]

const SORT_OPTIONS = ['Latest', 'Budget: High to Low', 'Budget: Low to High', 'Duration: Short First']

const MOCK_STATS = [
    { value: '12,400+', label: 'Active Projects', icon: '📋' },
    { value: '98%', label: 'Client Satisfaction', icon: '⭐' },
    { value: '50K+', label: 'Freelancers Ready', icon: '👨‍💻' },
    { value: '$0', label: 'Free to Browse', icon: '🎉' },
]

const PER_PAGE = 6

const timeAgo = dateStr => {
    if (!dateStr) return '—'
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

// ── Skeleton ───────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-100 rounded-lg w-2/5 mb-3" />
        <div className="h-5 bg-gray-100 rounded-lg w-3/4 mb-3" />
        <div className="h-3 bg-gray-100 rounded-lg w-full mb-2" />
        <div className="h-3 bg-gray-100 rounded-lg w-4/5 mb-4" />
        <div className="flex gap-2 mb-4">
            {[1, 2, 3].map(i => <div key={i} className="h-6 bg-gray-100 rounded-lg w-16" />)}
        </div>
        <div className="h-10 bg-gray-100 rounded-xl w-full" />
    </div>
)

// ── Bid Modal ──────────────────────────────────────────────
const BidModal = ({ project, onClose, onSubmit, loading }) => {
    const [amount, setAmount] = useState('')
    const [error, setError] = useState('')

    if (!project) return null

    const handleSubmit = () => {
        const num = Number(amount)
        if (!amount.trim()) { setError('Please enter your bid amount.'); return }
        if (isNaN(num) || num <= 0) { setError('Enter a valid amount greater than 0.'); return }
        if (project.budget && num > Number(project.budget)) {
            setError(`Bid cannot exceed project budget of ₹${Number(project.budget).toLocaleString('en-IN')}.`)
            return
        }
        setError('')
        onSubmit(project._id, num)
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm p-0 sm:p-4"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

                {/* drag handle mobile */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-5 sm:px-6 py-4 relative overflow-hidden">
                    <div className="absolute w-20 h-20 rounded-full bg-white/10 -top-6 -right-4 pointer-events-none" />
                    <button onClick={onClose}
                        className="absolute top-3.5 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm font-bold transition-all cursor-pointer border-none">
                        ✕
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg flex-shrink-0">💼</div>
                        <div className="min-w-0">
                            <h2 className="text-white font-black text-base sm:text-lg leading-tight pr-8 truncate">Place a Bid</h2>
                            <p className="text-blue-100 text-xs mt-0.5 truncate">{project.title}</p>
                        </div>
                    </div>
                </div>

                {/* Quick info */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 border-b border-gray-100">
                    {[
                        { label: 'Budget', value: project.budget ? `₹${Number(project.budget).toLocaleString('en-IN')}` : '—' },
                        { label: 'Duration', value: project.duration ? `${project.duration}d` : '—' },
                        { label: 'Category', value: project.category ? project.category.split(' ')[0] : '—' },
                    ].map(item => (
                        <div key={item.label} className="px-4 py-3 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">{item.label}</p>
                            <p className="text-xs sm:text-sm font-black text-gray-800 truncate">{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div className="px-5 sm:px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                            Your Bid Amount (₹)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base select-none">₹</span>
                            <input
                                type="number" min="1"
                                value={amount}
                                onChange={e => { setAmount(e.target.value); setError('') }}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                placeholder="Enter your price..."
                                className={`w-full pl-8 pr-4 py-3 text-sm sm:text-base font-bold text-gray-900
                                    border-2 rounded-xl outline-none transition-all placeholder-gray-300 bg-gray-50
                                    focus:bg-white focus:ring-2
                                    ${error
                                        ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100'
                                        : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
                                    }`}
                            />
                        </div>
                        {error && (
                            <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                                <span>⚠</span> {error}
                            </p>
                        )}
                        {project.budget && !error && (
                            <p className="mt-1.5 text-xs text-gray-400">
                                Project budget: <span className="font-semibold text-emerald-600">₹{Number(project.budget).toLocaleString('en-IN')}</span>
                            </p>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                        <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1.5">💡 Tips for a winning bid</p>
                        <ul className="space-y-0.5">
                            {['Keep your price competitive but fair', 'Bid within the project budget', 'Respond quickly after bidding'].map(tip => (
                                <li key={tip} className="text-xs text-blue-600 flex items-center gap-1.5">
                                    <span className="text-blue-400 flex-shrink-0">•</span>{tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-all cursor-pointer border-none">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading}
                        className={`flex-1 py-3 text-white font-bold text-sm rounded-xl transition-all border-none flex items-center justify-center gap-2
                            ${loading
                                ? 'bg-blue-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                            }`}>
                        {loading
                            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                            : '💼 Send Bid ↗'
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Project Card ───────────────────────────────────────────
const ProjectCard = ({ project, index, onBidClick, myBids }) => {
    const [saved, setSaved] = useState(false)
    const [hovered, setHovered] = useState(false)

    const catClass = CATEGORY_COLORS[project.category] || 'bg-slate-50 text-slate-600'
    const statusConf = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending
    const isDone = project.status === 'completed' || project.status === 'cancelled'

    // ✅ FIX: myBids comes from state.project.bids (project slice)
    // Each bid has: { project: projectId, freelancer: freelancerId, status, amount }
    const myBidOnThis = Array.isArray(myBids)
        ? myBids.find(b =>
            b.project === project._id ||
            b.project?._id === project._id
        )
        : null

    const alreadyBid = !!myBidOnThis
    const bidAccepted = myBidOnThis?.status === 'Accepted' || myBidOnThis?.status === 'accepted'
    const btnDisabled = isDone || bidAccepted

    const getBtnLabel = () => {
        if (isDone) return '✓ Project Completed'
        if (bidAccepted) return '✓ Bid Accepted'
        if (alreadyBid) return 'Bid Sent ✓'
        return 'Place Bid'
    }

    const skills = project.technology
        ? project.technology.split(/[,/]/).map(s => s.trim()).filter(Boolean)
        : []

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`relative bg-white rounded-2xl p-4 sm:p-6 border-[1.5px] transition-all duration-300 overflow-hidden
                ${isDone ? ' cursor-not-allowed opacity-90' : 'cursor-pointer'}
                ${hovered && !isDone
                    ? 'border-blue-400 shadow-xl shadow-blue-100 -translate-y-1'
                    : 'border-gray-200 shadow-sm'
                }`}
            style={{ animation: `fadeUp 0.5s ease ${index * 0.07}s both` }}
        >
            {hovered && !isDone && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-t-2xl" />
            )}

            {/* Header */}
            <div className="flex justify-between items-start mb-3 gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${catClass}`}>
                            {project.category || 'General'}
                        </span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${statusConf.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                            {project.status || 'Pending'}
                        </span>
                        {alreadyBid && (
                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${bidAccepted ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                                }`}>
                                {bidAccepted ? '✓ Accepted' : '⏳ Bid Sent'}
                            </span>
                        )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-2">
                        {project.title}
                    </h3>
                </div>
                <button
                    onClick={e => { e.stopPropagation(); setSaved(!saved) }}
                    className={`flex-shrink-0 border rounded-xl px-2.5 py-1.5 text-base transition-all duration-200 cursor-pointer
                        ${saved ? 'bg-blue-50 border-blue-400' : 'bg-transparent border-gray-200 hover:border-blue-300'}`}
                >{saved ? '🔖' : '🤍'}</button>
            </div>

            {/* Description */}
            {project.description && (
                <p className="text-xs sm:text-[13px] text-gray-500 mb-3 leading-relaxed line-clamp-2">
                    {project.description}
                </p>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {skills.map(s => (
                        <span key={s} className="bg-gray-50 border border-gray-200 text-gray-700 text-[11px] px-2.5 py-0.5 rounded-md">
                            {s}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div className="flex gap-4 sm:gap-5 flex-wrap">
                    <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Budget</p>
                        <p className="text-sm sm:text-[15px] font-bold text-emerald-600">
                            ₹{project.budget ? Number(project.budget).toLocaleString('en-IN') : '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Duration</p>
                        <p className="text-sm font-semibold text-gray-700">
                            {project.duration ? `${project.duration} days` : '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Posted</p>
                        <p className="text-xs text-gray-500">{timeAgo(project.createdAt)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {project.user?.name && (
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-gray-500">by {project.user.name}</p>
                            <p className="text-[11px] text-green-500 font-semibold">✓ Verified</p>
                        </div>
                    )}
                    <button
                        disabled={btnDisabled}
                        onClick={e => { e.stopPropagation(); if (!btnDisabled && !alreadyBid) onBidClick(project) }}
                        className={`px-4 sm:px-7 py-2 sm:py-2.5 rounded-xl border-[1.5px] text-xs sm:text-sm font-semibold
                            transition-all duration-200 whitespace-nowrap
                            ${btnDisabled
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : alreadyBid
                                    ? 'bg-blue-50 text-blue-600 border-blue-200 cursor-default'
                                    : hovered
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-transparent shadow-md shadow-blue-200 cursor-pointer'
                                        : 'bg-white text-blue-500 border-blue-400 hover:shadow-md cursor-pointer'
                            }`}
                    >
                        {getBtnLabel()}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Category sidebar shared ────────────────────────────────
const CategoryList = ({ category, setCategory, setPage, onSelect }) => (
    <>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Category</p>
        {CATEGORIES.map(cat => (
            <button key={cat}
                onClick={() => { setCategory(cat); setPage(1); onSelect?.() }}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-[13px] mb-0.5
                    transition-all duration-150 text-left cursor-pointer border-none
                    ${category === cat
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 font-normal bg-transparent'
                    }`}
            >
                <span>{cat}</span>
                {category === cat && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
            </button>
        ))}
    </>
)

// ══════════════════════════════════════════════════════════
const FindWork = () => {
    const dispatch = useDispatch()

    const { listedProjects, bids, projectLoading, projectError, projectErrorMessage } =
        useSelector(state => state.project)

    const { freelancerSuccess, freelancerError, freelancerErrorMessage } =
        useSelector(state => state.freelancer)

    const { user } = useSelector(state => state.auth)

    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [sortBy, setSortBy] = useState('Latest')
    const [page, setPage] = useState(1)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [bidProject, setBidProject] = useState(null)
    const [bidLoading, setBidLoading] = useState(false)

    // ✅ FIX: myBids comes from state.project.bids (Redux tree confirm hai)
    // state.project → bids[0], bids[1] — image mein clearly dikh raha tha
    const myBids = Array.isArray(bids) ? bids : []

    useEffect(() => {
        dispatch(getProjects())
    }, [dispatch])

    // ✅ FIX: freelancerSuccess pe toast + re-fetch + reset
    useEffect(() => {
        if (freelancerSuccess) {
            dispatch(getProjects())           // refresh project list
            setBidProject(null)
            setBidLoading(false)
            dispatch(resetFreelancerSuccess()) // ✅ reset karo warna har render pe trigger hoga
        }
    }, [freelancerSuccess, dispatch])

    const allProjects = Array.isArray(listedProjects) ? listedProjects : []
    const hasData = allProjects.length > 0

    const filtered = allProjects
        .filter(p => {
            const matchCat = category === 'All' || p.category === category
            const matchSearch = !search ||
                p.title?.toLowerCase().includes(search.toLowerCase()) ||
                p.technology?.toLowerCase().includes(search.toLowerCase()) ||
                p.description?.toLowerCase().includes(search.toLowerCase())
            return matchCat && matchSearch
        })
        .sort((a, b) => {
            if (sortBy === 'Budget: High to Low') return (b.budget || 0) - (a.budget || 0)
            if (sortBy === 'Budget: Low to High') return (a.budget || 0) - (b.budget || 0)
            if (sortBy === 'Duration: Short First') return (a.duration || 0) - (b.duration || 0)
            return new Date(b.createdAt) - new Date(a.createdAt)
        })

    const totalPages = Math.ceil(filtered.length / PER_PAGE)
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    // ✅ Open modal — guards
    const handleBidClick = proj => {
        if (!user) { toast.error('Please login to place a bid'); return }
        if (!user.isFreelancer) { toast.error('Only freelancers can place bids'); return }
        setBidProject(proj)
    }

    // ✅ Submit bid
    const handleBidSubmit = async (projectId, amount) => {
        setBidLoading(true)
        try {
            await dispatch(applyForProject({ projectId, amount })).unwrap()
            toast.success('Bid placed successfully! 🎉')
            // setBidProject(null) — freelancerSuccess useEffect handles this
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Failed to place bid. Try again.')
            setBidLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>
            <style>{`
                @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes ping2    { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2);opacity:0} }
                @keyframes orbFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(35px)} }
                @keyframes statIn   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes drawerIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            {/* Bid Modal */}
            {bidProject && (
                <BidModal
                    project={bidProject}
                    onClose={() => setBidProject(null)}
                    onSubmit={handleBidSubmit}
                    loading={bidLoading}
                />
            )}

            {/* Floating orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute w-[600px] h-[600px] rounded-full -top-48 -right-24"
                    style={{ background: 'radial-gradient(circle,rgba(59,127,245,0.06) 0%,transparent 70%)', animation: 'orbFloat 8s ease-in-out infinite' }} />
                <div className="absolute w-96 h-96 rounded-full bottom-1/4 -left-24"
                    style={{ background: 'radial-gradient(circle,rgba(43,196,212,0.05) 0%,transparent 70%)', animation: 'orbFloat 10s ease-in-out infinite reverse' }} />
            </div>

            {/* ══ HERO ══════════════════════════════════════════════════════ */}
            <div className="relative z-10 bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 border-b border-gray-200 px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12 pb-8 sm:pb-10">

                <div className="inline-flex items-center gap-2 bg-white border border-blue-100 rounded-full px-3 sm:px-4 py-1.5 mb-4 sm:mb-5 shadow-sm shadow-blue-50">
                    <span className="relative flex w-2 h-2 flex-shrink-0">
                        <span className="absolute inset-0 rounded-full bg-blue-500" style={{ animation: 'ping2 1.5s ease infinite' }} />
                        <span className="relative rounded-full bg-blue-500 w-2 h-2" />
                    </span>
                    <span className="text-[11px] sm:text-[13px] text-blue-600 font-semibold leading-tight">
                        12,400+ live projects available right now!
                    </span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2 sm:mb-3 leading-tight">
                    Find Your{' '}
                    <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        Next Project
                    </span>
                </h1>
                <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-xl leading-relaxed">
                    Real projects posted by real clients — find your perfect match and start earning today.
                </p>

                {/* Search */}
                <div className="flex gap-2 sm:gap-3 max-w-2xl mb-7 sm:mb-10">
                    <div className="relative flex-1">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg pointer-events-none">🔍</span>
                        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                            placeholder="Search by title, skill, technology..."
                            className="w-full pl-9 sm:pl-11 pr-4 py-3 sm:py-3.5 text-sm border-[1.5px] border-gray-200 rounded-xl bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm box-border" />
                    </div>
                    <button onClick={() => setPage(1)}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 sm:px-7 py-3 sm:py-3.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all whitespace-nowrap cursor-pointer border-none">
                        Search
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl">
                    {MOCK_STATS.map((s, i) => (
                        <div key={s.label}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-5 py-3 sm:py-4 flex flex-col gap-1 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                            style={{ animation: `statIn 0.6s ease ${i * 0.1}s both` }}>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="text-lg sm:text-xl">{s.icon}</span>
                                <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{s.value}</span>
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500 font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══ MAIN ══════════════════════════════════════════════════════ */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

                {/* Sort bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <p className="text-sm text-gray-600">
                        Showing <strong className="text-gray-900">{paginated.length}</strong> of{' '}
                        <strong className="text-gray-900">{filtered.length}</strong> projects
                        {category !== 'All' && <span className="text-blue-500"> · {category}</span>}
                        {search && <span className="text-amber-500"> · "{search}"</span>}
                    </p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setDrawerOpen(!drawerOpen)}
                            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 cursor-pointer hover:border-blue-300 transition-all">
                            ☰ {category === 'All' ? 'Category' : category.split(' ')[0]}
                        </button>
                        <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                        <span className="text-sm text-gray-500 sm:hidden">Sort:</span>
                        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1) }}
                            className="text-xs sm:text-sm border-[1.5px] border-gray-200 rounded-lg px-2 sm:px-3 py-2 bg-white text-gray-700 outline-none focus:border-blue-400 cursor-pointer"
                            style={{ fontFamily: 'inherit' }}>
                            {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* Mobile drawer */}
                {drawerOpen && (
                    <div className="md:hidden bg-white rounded-2xl border border-gray-200 p-5 mb-5 shadow-lg"
                        style={{ animation: 'drawerIn .2s ease both' }}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</span>
                            <button onClick={() => setDrawerOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none leading-none">✕</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button key={cat}
                                    onClick={() => { setCategory(cat); setPage(1); setDrawerOpen(false) }}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-150
                                        ${category === cat ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-5 lg:gap-6 items-start">

                    {/* Sidebar */}
                    <aside className="w-48 lg:w-52 flex-shrink-0 hidden md:block">
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5 sticky top-6">
                            <CategoryList category={category} setCategory={setCategory} setPage={setPage} />
                        </div>
                    </aside>

                    {/* Cards */}
                    <div className="flex-1 min-w-0">

                        {projectLoading && !hasData && (
                            <div className="flex flex-col gap-3 sm:gap-4">
                                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                            </div>
                        )}

                        {projectError && !hasData && (
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 sm:p-10 text-center">
                                <p className="text-4xl mb-3">⚠️</p>
                                <p className="text-base font-semibold text-rose-700 mb-1">Failed to load projects</p>
                                <p className="text-sm text-gray-400">{projectErrorMessage}</p>
                            </div>
                        )}

                        {/* ✅ myBids pass to each card */}
                        {hasData && paginated.length > 0 && (
                            <div className="flex flex-col gap-3 sm:gap-4">
                                {paginated.map((p, i) => (
                                    <ProjectCard
                                        key={p._id}
                                        project={p}
                                        index={i}
                                        onBidClick={handleBidClick}
                                        myBids={myBids}
                                    />
                                ))}
                            </div>
                        )}

                        {hasData && paginated.length === 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 py-14 sm:py-16 px-5 text-center">
                                <p className="text-5xl mb-3">🔍</p>
                                <p className="text-lg font-semibold text-gray-800 mb-1">No matching projects</p>
                                <p className="text-sm text-gray-400 mb-5">Try different keywords or category</p>
                                <button onClick={() => { setSearch(''); setCategory('All'); setPage(1) }}
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:scale-105 transition-all cursor-pointer border-none">
                                    Clear Filters
                                </button>
                            </div>
                        )}

                        {!projectLoading && !hasData && !projectError && (
                            <div className="bg-white rounded-2xl border border-gray-200 py-14 sm:py-16 px-5 text-center">
                                <p className="text-5xl mb-3">📋</p>
                                <p className="text-lg font-semibold text-gray-800 mb-1">No projects yet</p>
                                <p className="text-sm text-gray-400">Check back later for new opportunities</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center flex-wrap gap-2 mt-8 sm:mt-10">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className={`w-9 h-9 rounded-lg border text-base font-medium transition-all ${page === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-500 cursor-pointer'}`}>←</button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                    <button key={n} onClick={() => setPage(n)}
                                        className={`w-9 h-9 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${page === n ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent shadow-md' : 'border-gray-200 text-gray-700 hover:border-blue-400 bg-white'}`}>
                                        {n}
                                    </button>
                                ))}

                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    className={`w-9 h-9 rounded-lg border text-base font-medium transition-all ${page === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-500 cursor-pointer'}`}>→</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══ BOTTOM CTA ════════════════════════════════════════════════ */}
            <div className="relative z-10 bg-gradient-to-r from-blue-600 to-cyan-500 py-12 sm:py-16 px-4 sm:px-6 overflow-hidden mt-4">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-white blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-white blur-3xl" />
                </div>
                <div className="max-w-3xl mx-auto text-center relative">
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">For Freelancers</p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Ready to Start Earning?</h2>
                    <p className="text-blue-100 text-sm sm:text-base mb-6 sm:mb-7 max-w-lg mx-auto">
                        Join 50,000+ freelancers already working with top clients. Create your profile in minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm hover:shadow-xl hover:scale-105 transition-all cursor-pointer border-none">
                            Create Free Profile ↗
                        </button>
                        <button className="bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm border-2 border-white/30 hover:bg-blue-800 transition-all cursor-pointer">
                            Browse All Projects
                        </button>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-5 mt-6 sm:mt-8">
                        {['✓ No signup fee', '✓ Get paid on time', '✓ 24/7 support', '✓ 10K+ active clients'].map(t => (
                            <span key={t} className="text-blue-100 text-xs font-medium">{t}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FindWork