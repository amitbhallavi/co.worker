import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getProjects } from '../features/project/projectSlice'
import { toast } from 'react-toastify'
import { applyForProject, resetFreelancerSuccess } from '../features/Freelancer/freelancerSlice'

// ── Intersection Observer ──────────────────────────────────
const useInView = (threshold = 0.15) => {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

// ── Animated Counter ───────────────────────────────────────
const useCounter = (end, duration = 2000, inView = false) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration, inView])
  return count
}

// ── Animated Stats ────────────────────────────────────────
const AnimatedStats = ({ inView }) => {
  const projects = useCounter(12400, 2500, inView)
  const satisfaction = useCounter(98, 1500, inView)
  const freelancers = useCounter(50, 1500, inView)

  return (
    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
      {[
        { value: `${(projects / 1000).toFixed(0)}K+`, label: 'Live Projects', icon: '📋' },
        { value: `${satisfaction}%`, label: 'Satisfaction', icon: '⭐' },
        { value: `${freelancers}K+`, label: 'Freelancers', icon: '👨‍💻' },
      ].map((s, i) => (
        <div key={s.label} className={`
          bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-4 text-center
          hover:bg-white/[0.06] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-300
          ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        `} style={{ transitionDelay: `${i * 100}ms` }}>
          <div className="text-lg sm:text-xl font-bold text-white">{inView ? s.value : '0'}</div>
          <div className="text-[11px] sm:text-xs text-white/40 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Constants ──────────────────────────────────────────────
const CATEGORY_COLORS = {
  'Web Development': { gradient: 'from-blue-500 to-blue-600', badge: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Web Developments': { gradient: 'from-blue-500 to-blue-600', badge: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'UI/UX Design': { gradient: 'from-violet-500 to-violet-600', badge: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
  'Backend Dev': { gradient: 'from-emerald-500 to-emerald-600', badge: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Mobile Dev': { gradient: 'from-orange-500 to-orange-600', badge: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  'Data Science': { gradient: 'from-cyan-500 to-cyan-600', badge: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'Full Stack': { gradient: 'from-rose-500 to-rose-600', badge: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
  'Full-stack Developer mern': { gradient: 'from-rose-500 to-rose-600', badge: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
  'WordPress': { gradient: 'from-lime-500 to-lime-600', badge: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500/30' },
  'Graphic Design': { gradient: 'from-amber-500 to-amber-600', badge: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Content Writing': { gradient: 'from-slate-500 to-slate-600', badge: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
  'APPS DEVELOPER': { gradient: 'from-orange-500 to-orange-600', badge: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  'AI - ML DEVELOPER': { gradient: 'from-cyan-500 to-cyan-600', badge: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
}

const STATUS_CONFIG = {
  pending: { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400', label: 'Pending' },
  active: { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400', label: 'Active' },
  completed: { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400', label: 'Completed' },
  'in-progress': { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400', label: 'In Progress' },
  cancelled: { badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30', dot: 'bg-rose-400', label: 'Cancelled' },
}

const CATEGORIES = [
  'All', 'Web Development', 'UI/UX Design', 'Backend Dev', 'Mobile Dev',
  'Data Science', 'Full Stack', 'WordPress', 'Graphic Design',
  'Content Writing', 'APPS DEVELOPER', 'AI - ML DEVELOPER',
]

const SORT_OPTIONS = ['Latest', 'Budget: High to Low', 'Budget: Low to High', 'Duration: Short First']
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

// ── Skeleton Card ──────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 animate-pulse">
    <div className="h-3 bg-white/10 rounded w-2/5 mb-3" />
    <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
    <div className="h-3 bg-white/10 rounded w-full mb-2" />
    <div className="h-3 bg-white/10 rounded w-4/5 mb-4" />
    <div className="flex gap-2 mb-4">
      {[1, 2, 3].map(i => <div key={i} className="h-6 bg-white/10 rounded w-16" />)}
    </div>
    <div className="h-10 bg-white/10 rounded w-full" />
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f172a] border border-white/10 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Drag handle mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
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
        <div className="grid grid-cols-3 divide-x divide-white/5 bg-white/5">
          {[
            { label: 'Budget', value: project.budget ? `₹${Number(project.budget).toLocaleString('en-IN')}` : '—' },
            { label: 'Duration', value: project.duration ? `${project.duration}d` : '—' },
            { label: 'Category', value: project.category ? project.category.split(' ')[0] : '—' },
          ].map(item => (
            <div key={item.label} className="px-4 py-3 text-center">
              <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-0.5">{item.label}</p>
              <p className="text-xs sm:text-sm font-black text-white truncate">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
              Your Bid Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-base select-none">₹</span>
              <input
                type="number" min="1"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Enter your price..."
                className={`w-full pl-8 pr-4 py-3 text-sm font-bold text-white
                  border-2 rounded-xl outline-none transition-all placeholder-white/20 bg-white/5
                  ${error
                    ? 'border-rose-500/50 focus:border-rose-500'
                    : 'border-white/10 focus:border-blue-500/50 focus:bg-white/10'
                  }`}
              />
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">
                ⚠ {error}
              </p>
            )}
            {project.budget && !error && (
              <p className="mt-1.5 text-xs text-white/30">
                Project budget: <span className="font-semibold text-emerald-400">₹{Number(project.budget).toLocaleString('en-IN')}</span>
              </p>
            )}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
            <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-1.5">💡 Tips for a winning bid</p>
            <ul className="space-y-0.5">
              {['Keep your price competitive but fair', 'Bid within the project budget', 'Respond quickly after bidding'].map(tip => (
                <li key={tip} className="text-xs text-blue-300/70 flex items-center gap-1.5">
                  <span className="text-blue-400/50 flex-shrink-0">•</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 bg-white/5 text-white/70 font-bold text-sm rounded-xl hover:bg-white/10 transition-all cursor-pointer border border-white/10">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className={`flex-1 py-3 text-white font-bold text-sm rounded-xl transition-all border-none flex items-center justify-center gap-2
              ${loading
                ? 'bg-white/10 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] cursor-pointer'
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
  const [ref, inView] = useInView(0.1)
  const [saved, setSaved] = useState(false)
  const [hovered, setHovered] = useState(false)

  const catStyle = CATEGORY_COLORS[project.category] || { gradient: 'from-gray-500 to-gray-600', badge: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
  const statusConf = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending
  const isDone = project.status === 'completed' || project.status === 'cancelled'

  const myBidOnThis = Array.isArray(myBids)
    ? myBids.find(b => b.project === project._id || b.project?._id === project._id)
    : null

  const alreadyBid = !!myBidOnThis
  const bidAccepted = myBidOnThis?.status === 'Accepted' || myBidOnThis?.status === 'accepted'
  const btnDisabled = isDone || bidAccepted

  const getBtnLabel = () => {
    if (isDone) return '✓ Project Closed'
    if (bidAccepted) return '✓ Bid Accepted'
    if (alreadyBid) return 'Bid Sent ✓'
    return 'Place Bid'
  }

  const skills = project.technology
    ? project.technology.split(/[,/]/).map(s => s.trim()).filter(Boolean)
    : []

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative rounded-2xl border transition-all duration-300 overflow-hidden
        ${isDone ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        ${hovered && !isDone
          ? 'bg-white/[0.08] border-white/20 shadow-xl -translate-y-0.5'
          : 'bg-white/[0.03] border-white/[0.08] shadow-lg'
        }
      `}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {/* Top gradient bar on hover */}
      {hovered && !isDone && (
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${catStyle.gradient}`} />
      )}

      {/* Header */}
      <div className="p-5 border-b border-white/[0.05]">
        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${catStyle.badge} ${catStyle.text} ${catStyle.border}`}>
                {project.category || 'General'}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border ${statusConf.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                {statusConf.label}
              </span>
              {alreadyBid && (
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  bidAccepted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>
                  {bidAccepted ? '✓ Accepted' : '⏳ Bid Sent'}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
              {project.title}
            </h3>
          </div>
          <button
            onClick={e => { e.stopPropagation(); setSaved(!saved) }}
            className={`flex-shrink-0 border rounded-xl px-2.5 py-1.5 text-base transition-all duration-200 cursor-pointer
              ${saved ? `bg-blue-500/20 border-blue-500/40 ${catStyle.text}` : 'bg-white/[0.05] border-white/10 text-white/30 hover:border-white/20'}`}
          >{saved ? '🔖' : '🤍'}</button>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs sm:text-[13px] text-white/50 mb-3 leading-relaxed line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {skills.map(s => (
              <span key={s} className="bg-white/[0.05] border border-white/10 text-white/50 text-[11px] px-2.5 py-0.5 rounded-md">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex gap-4 sm:gap-5 flex-wrap">
          <div>
            <p className="text-[10px] text-white/30 mb-0.5">Budget</p>
            <p className="text-sm sm:text-[15px] font-bold text-emerald-400">
              ₹{project.budget ? Number(project.budget).toLocaleString('en-IN') : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 mb-0.5">Duration</p>
            <p className="text-sm font-semibold text-white/70">
              {project.duration ? `${project.duration} days` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 mb-0.5">Posted</p>
            <p className="text-xs text-white/40">{timeAgo(project.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {project.user?.name && (
            <div className="text-right hidden sm:block">
              <p className="text-xs text-white/40">by {project.user.name}</p>
              <p className="text-[11px] text-emerald-400 font-semibold">✓ Verified</p>
            </div>
          )}
          <button
            disabled={btnDisabled}
            onClick={e => { e.stopPropagation(); if (!btnDisabled && !alreadyBid) onBidClick(project) }}
            className={`px-4 sm:px-7 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap
              ${btnDisabled
                ? 'bg-white/[0.05] text-white/30 border-white/10 cursor-not-allowed'
                : alreadyBid
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 cursor-default'
                  : hovered
                    ? `bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent shadow-lg shadow-blue-500/30 cursor-pointer`
                    : 'bg-white/[0.05] text-white border-white/20 hover:border-white/40 cursor-pointer'
              }`}
          >
            {getBtnLabel()}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Category Sidebar ────────────────────────────────────────
const CategoryList = ({ category, setCategory, setPage, onSelect }) => (
  <div>
    <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">Category</p>
    {CATEGORIES.map(cat => (
      <button key={cat}
        onClick={() => { setCategory(cat); setPage(1); onSelect?.() }}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-[13px] mb-0.5
          transition-all duration-150 text-left cursor-pointer border-none
          ${category === cat
            ? 'bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30'
            : 'text-white/50 hover:bg-white/[0.05] font-normal bg-transparent'
          }`}
      >
        <span>{cat}</span>
        {category === cat && <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />}
      </button>
    ))}
  </div>
)

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
const FindWork = () => {
  const dispatch = useDispatch()

  const { listedProjects, bids, projectLoading, projectError, projectErrorMessage } = useSelector(state => state.project)
  const { freelancerSuccess, freelancerError, freelancerErrorMessage } = useSelector(state => state.freelancer)
  const { user } = useSelector(state => state.auth)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('Latest')
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bidProject, setBidProject] = useState(null)
  const [bidLoading, setBidLoading] = useState(false)

  const [heroRef, heroInView] = useInView(0.1)

  const myBids = Array.isArray(bids) ? bids : []

  useEffect(() => { dispatch(getProjects()) }, [dispatch])

  useEffect(() => {
    if (freelancerSuccess) {
      dispatch(getProjects())
      setBidProject(null)
      setBidLoading(false)
      dispatch(resetFreelancerSuccess())
    }
  }, [freelancerSuccess, dispatch])

  useEffect(() => {
    if (freelancerError && freelancerErrorMessage) toast.error(freelancerErrorMessage)
  }, [freelancerError, freelancerErrorMessage])

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

  const handleBidClick = proj => {
    if (!user) { toast.error('Please login to place a bid'); return }
    if (!user.isFreelancer) { toast.error('Only freelancers can place bids'); return }
    setBidProject(proj)
  }

  const handleBidSubmit = async (projectId, amount) => {
    setBidLoading(true)
    try {
      await dispatch(applyForProject({ projectId, amount })).unwrap()
      toast.success('Bid placed successfully! 🎉')
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Failed to place bid. Try again.')
      setBidLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617]" style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>

      {/* Bid Modal */}
      {bidProject && (
        <BidModal
          project={bidProject}
          onClose={() => setBidProject(null)}
          onSubmit={handleBidSubmit}
          loading={bidLoading}
        />
      )}

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <div className="relative z-10 bg-[#0f172a]">
        <div ref={heroRef} className="relative max-w-4xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">

          {/* Live badge */}
          <div className={`
            inline-flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full px-5 py-2 mb-8
            transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <span className="relative flex w-2.5 h-2.5 flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
              <span className="relative rounded-full bg-emerald-400 w-2.5 h-2.5" />
            </span>
            <span className="text-xs sm:text-sm text-white/70 font-semibold">
              12,400+ live projects available right now!
            </span>
          </div>

          {/* Headline */}
          <h1 className={`
            text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-3
            transition-all duration-700 delay-100 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            Find Your
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {' '}Next Project
            </span>
          </h1>

          <p className={`
            text-base text-white/50 max-w-xl mx-auto mb-8 leading-relaxed
            transition-all duration-700 delay-200 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            Real projects posted by real clients — find your perfect match and start earning today.
          </p>

          {/* Search */}
          <div className={`
            flex gap-2 sm:gap-3 max-w-2xl mx-auto mb-8
            transition-all duration-700 delay-300 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-base pointer-events-none">🔍</span>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by title, skill, technology..."
                className="w-full pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/25 bg-white/[0.05] border border-white/10
                  rounded-xl outline-none transition-all
                  focus:bg-white/[0.08] focus:border-white/20 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3.5 rounded-xl font-semibold text-sm
                hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all cursor-pointer border-none whitespace-nowrap"
            >
              Search
            </button>
          </div>

          {/* Animated Stats */}
          <AnimatedStats inView={heroInView} />
        </div>
      </div>

      {/* ══ MAIN ══════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Sort bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-sm text-white/40">
            Showing <strong className="text-white">{paginated.length}</strong> of{' '}
            <strong className="text-white">{filtered.length}</strong> projects
            {category !== 'All' && <span className="text-blue-400"> · {category}</span>}
            {search && <span className="text-white/60"> · "{search}"</span>}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setDrawerOpen(!drawerOpen)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.05] text-xs font-semibold text-white/60 cursor-pointer hover:bg-white/[0.08] transition-all">
              ☰ {category === 'All' ? 'Category' : category.split(' ')[0]}
            </button>
            <span className="text-sm text-white/30 hidden sm:inline">Sort:</span>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1) }}
              className="text-xs border border-white/10 bg-white/[0.05] text-white/70 rounded-lg px-3 py-2 outline-none cursor-pointer"
              style={{ fontFamily: 'inherit' }}>
              {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="md:hidden bg-[#0f172a] border border-white/10 rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Category</span>
              <button onClick={() => setDrawerOpen(false)}
                className="text-white/40 hover:text-white/60 text-lg cursor-pointer bg-transparent border-none leading-none">✕</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat}
                  onClick={() => { setCategory(cat); setPage(1); setDrawerOpen(false) }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-150
                    ${category === cat
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'bg-white/[0.05] text-white/50 border-white/10 hover:border-white/20'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-5 lg:gap-6 items-start">

          {/* Sidebar */}
          <aside className="w-48 lg:w-52 flex-shrink-0 hidden md:block">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 lg:p-5 sticky top-6">
              <CategoryList category={category} setCategory={setCategory} setPage={setPage} />
            </div>
          </aside>

          {/* Cards */}
          <div className="flex-1 min-w-0">

            {projectLoading && !hasData && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            )}

            {projectError && !hasData && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 sm:p-10 text-center">
                <p className="text-4xl mb-3">⚠️</p>
                <p className="text-base font-semibold text-rose-400 mb-1">Failed to load projects</p>
                <p className="text-sm text-white/30">{projectErrorMessage}</p>
              </div>
            )}

            {hasData && paginated.length > 0 && (
              <div className="flex flex-col gap-4">
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
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl py-14 sm:py-16 px-5 text-center">
                <p className="text-5xl mb-3">🔍</p>
                <p className="text-lg font-semibold text-white mb-1">No matching projects</p>
                <p className="text-sm text-white/30 mb-5">Try different keywords or category</p>
                <button onClick={() => { setSearch(''); setCategory('All'); setPage(1) }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:scale-105 transition-all cursor-pointer border-none">
                  Clear Filters
                </button>
              </div>
            )}

            {!projectLoading && !hasData && !projectError && (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl py-14 sm:py-16 px-5 text-center">
                <p className="text-5xl mb-3">📋</p>
                <p className="text-lg font-semibold text-white mb-1">No projects yet</p>
                <p className="text-sm text-white/30">Check back later for new opportunities</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center flex-wrap gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className={`w-9 h-9 rounded-lg border text-base font-medium transition-all
                    ${page === 1
                      ? 'border-white/10 text-white/20 cursor-not-allowed'
                      : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white cursor-pointer bg-transparent'
                    }`}>←</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-lg border text-sm font-semibold transition-all cursor-pointer
                      ${page === n
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent shadow-lg shadow-blue-500/20'
                        : 'border-white/10 text-white/60 hover:border-white/30 bg-transparent'
                      }`}>
                    {n}
                  </button>
                ))}

                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className={`w-9 h-9 rounded-lg border text-base font-medium transition-all
                    ${page === totalPages
                      ? 'border-white/10 text-white/20 cursor-not-allowed'
                      : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white cursor-pointer bg-transparent'
                    }`}>→</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ BOTTOM CTA ════════════════════════════════════════ */}
      <div className="relative z-10 bg-[#0f172a] py-16 sm:py-24 px-4 border-t border-white/[0.05]">
        <div className="max-w-3xl mx-auto text-center relative">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">For Freelancers</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
            Ready to Start<br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"> Earning?</span>
          </h2>
          <p className="text-white/40 text-sm sm:text-base mb-6 sm:mb-7 max-w-lg mx-auto">
            Join 50,000+ freelancers already working with top clients. Create your profile in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 sm:px-8 py-3.5 rounded-xl font-bold text-sm
                hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all cursor-pointer border-none"
            >
              Create Free Profile ↗
            </button>
            <button className="bg-white/[0.05] text-white px-6 sm:px-8 py-3.5 rounded-xl font-bold text-sm
              border border-white/20 hover:bg-white/[0.08] transition-all cursor-pointer">
              Browse All Projects
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-5 mt-6 sm:mt-8">
            {['✓ No signup fee', '✓ Get paid on time', '✓ 24/7 support', '✓ 10K+ active clients'].map(t => (
              <span key={t} className="text-xs text-white/30 font-medium">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FindWork
