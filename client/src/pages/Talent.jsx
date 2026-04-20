import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getFreelancers } from '../features/Freelancer/freelancerSlice'

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

// ── Stats Row ──────────────────────────────────────────────
const AnimatedStats = ({ inView }) => {
  const freelancers = useCounter(50000, 2500, inView)
  const projects = useCounter(120000, 2500, inView)
  const rating = useCounter(49, 1500, inView) / 10

  return (
    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
      {[
        { value: `${(freelancers / 1000).toFixed(0)}K+`, label: 'Freelancers' },
        { value: `${(projects / 1000).toFixed(0)}K+`, label: 'Projects Done' },
        { value: `${(rating).toFixed(1)}★`, label: 'Avg Rating' },
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

// ── Category Config ─────────────────────────────────────────
const CAT_COLORS = {
  web: { gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', badge: 'bg-blue-500/20' },
  design: { gradient: 'from-violet-500 to-violet-600', light: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', badge: 'bg-violet-500/20' },
  marketing: { gradient: 'from-amber-500 to-amber-600', light: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', badge: 'bg-amber-500/20' },
  ai: { gradient: 'from-rose-500 to-rose-600', light: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', badge: 'bg-rose-500/20' },
  apps: { gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20' },
  data: { gradient: 'from-cyan-500 to-cyan-600', light: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', badge: 'bg-cyan-500/20' },
  default: { gradient: 'from-gray-500 to-gray-600', light: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30', badge: 'bg-gray-500/20' },
}

const getCatStyle = (category = '') => {
  const l = category.toLowerCase()
  if (l.includes('web') || l.includes('software') || l.includes('full')) return CAT_COLORS.web
  if (l.includes('design') || l.includes('creative') || l.includes('ui')) return CAT_COLORS.design
  if (l.includes('market') || l.includes('sales')) return CAT_COLORS.marketing
  if (l.includes('ai') || l.includes('ml') || l.includes('machine')) return CAT_COLORS.ai
  if (l.includes('app') || l.includes('mobile')) return CAT_COLORS.apps
  if (l.includes('data') || l.includes('analyst')) return CAT_COLORS.data
  return CAT_COLORS.default
}

const FILTERS = ['All', 'Web Dev', 'Design', 'AI / ML', 'Apps', 'Marketing', 'Data']

function filterMatch(f, filter) {
  if (filter === 'All') return true
  const cat = (f.category || '').toLowerCase()
  if (filter === 'Web Dev') return cat.includes('web') || cat.includes('software') || cat.includes('full')
  if (filter === 'Design') return cat.includes('design') || cat.includes('creative') || cat.includes('ui')
  if (filter === 'AI / ML') return cat.includes('ai') || cat.includes('ml') || cat.includes('machine')
  if (filter === 'Apps') return cat.includes('app') || cat.includes('mobile')
  if (filter === 'Marketing') return cat.includes('market') || cat.includes('sales')
  if (filter === 'Data') return cat.includes('data') || cat.includes('analyst')
  return true
}

// ── Freelancer Card ─────────────────────────────────────────
const FreelancerCard = ({ freelancer, index, colorIndex }) => {
  const [ref, inView] = useInView(0.1)
  const [hovered, setHovered] = useState(false)

  const s = getCatStyle(freelancer.category)
  const skills = Array.isArray(freelancer.skills)
    ? freelancer.skills
    : (freelancer.skills || '').split(',').map(sk => sk.trim()).filter(Boolean)

  const catColors = [CAT_COLORS.web, CAT_COLORS.design, CAT_COLORS.marketing, CAT_COLORS.ai, CAT_COLORS.apps, CAT_COLORS.data]
  const cardColor = catColors[colorIndex % catColors.length]

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        ${hovered ? 'scale-[1.02] shadow-2xl' : 'shadow-lg'}
      `}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {/* Top gradient bar */}
      <div className={`h-1.5 bg-gradient-to-r ${cardColor.gradient}`} />

      {/* Card bg */}
      <div className={`
        flex flex-col flex-1 rounded-b-2xl border backdrop-blur-sm transition-all duration-300
        ${hovered
          ? 'bg-white/[0.08] border-white/20'
          : 'bg-white/[0.03] border-white/[0.08]'
        }
      `}>
        {/* Header */}
        <div className={`relative px-5 pt-5 pb-4 border-b border-white/[0.05]`}>
          <span className={`
            absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full
            ${cardColor.badge} ${cardColor.text} border ${cardColor.border}
          `}>
            {freelancer.category || 'Freelancer'}
          </span>

          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {freelancer.user?.profilePic ? (
                <img
                  src={freelancer.user.profilePic}
                  alt={freelancer.user?.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-lg"
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                />
              ) : null}
              <div
                className={`
                  ${freelancer.user?.profilePic ? 'hidden' : 'flex'}
                  w-16 h-16 rounded-2xl bg-gradient-to-br ${cardColor.gradient}
                  items-center justify-center ring-2 ring-white/20 shadow-lg
                `}
              >
                <span className="text-white font-bold text-lg">
                  {(freelancer.user?.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0f172a]"
                style={{ animation: 'pulse 2s ease infinite' }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-white text-[15px] mb-0.5 truncate">
                {freelancer.user?.name || 'Unknown'}
              </h3>
              <p className="text-xs text-white/40 truncate mb-1.5">
                {freelancer.user?.email}
              </p>
              <div className={`
                inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full
                ${cardColor.badge} ${cardColor.text} border ${cardColor.border}
              `}>
                {freelancer.experience || 0} yrs exp
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex-1 flex flex-col gap-3">
          <p className="text-[13px] text-white/60 leading-relaxed line-clamp-2">
            {freelancer.description || 'Experienced freelancer ready to help with your project.'}
          </p>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 4).map((sk, si) => (
                <span key={si} className={`
                  text-[10px] font-semibold px-2 py-0.5 rounded-full border
                  ${cardColor.badge} ${cardColor.text} ${cardColor.border}
                `}>
                  {sk}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.05] text-white/40 border border-white/10">
                  +{skills.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Rating + Rate */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.05] mt-auto">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {Array.from({ length: Math.round(freelancer.rating || 0) }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-xs">★</span>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-white">{(freelancer.rating || 0).toFixed(1)}</span>
                <span className="text-xs text-white/30">({freelancer.totalRatings || 0})</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-white">
                {freelancer.hourlyRate ? `₹${freelancer.hourlyRate}` : 'Open'}
              </span>
              <span className="text-xs text-white/30">/hr</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <Link
            to={`/profile/${freelancer.user?._id}`}
            className="block text-center py-2.5 text-sm font-bold text-white rounded-xl no-underline transition-all duration-200
              bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30"
            style={{ boxShadow: hovered ? '0 8px 24px rgba(59,130,246,0.3)' : 'none' }}
          >
            View Profile ↗
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────
function Talent() {
  const { freelancers, freelancerLoading, freelancerError, freelancerErrorMessage } = useSelector(s => s.freelancer)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [heroRef, heroInView] = useInView(0.1)

  useEffect(() => { dispatch(getFreelancers()) }, [dispatch])
  useEffect(() => {
    if (freelancerError && freelancerErrorMessage) toast.error(freelancerErrorMessage)
  }, [freelancerError, freelancerErrorMessage])

  const filtered = (freelancers || []).filter(f => {
    const matchSearch =
      (f.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.skills || '').toLowerCase().includes(search.toLowerCase())
    return matchSearch && filterMatch(f, activeFilter)
  })

  return (
    <div className="min-h-screen bg-[#020617]" style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>

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
              {freelancers.length}+ verified freelancers available now
            </span>
          </div>

          {/* Headline */}
          <h1 className={`
            text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-3
            transition-all duration-700 delay-100 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            Hire the World's
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Best Talent
            </span>
          </h1>

          <p className={`
            text-base text-white/50 max-w-lg mx-auto mb-8 leading-relaxed
            transition-all duration-700 delay-200 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            Browse verified, skilled freelancers — ready to deliver results on your project.
          </p>

          {/* Search */}
          <div className={`
            flex gap-2 sm:gap-3 max-w-xl mx-auto mb-8
            transition-all duration-700 delay-300 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg pointer-events-none">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, category, or skills..."
                className="w-full pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/30 bg-white/[0.05] border border-white/10
                  rounded-xl outline-none transition-all
                  focus:bg-white/[0.08] focus:border-white/20 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3.5 rounded-xl font-semibold text-sm
                hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all cursor-pointer border-none whitespace-nowrap"
            >
              Post a Project
            </button>
          </div>

          {/* Filter pills */}
          <div className={`
            flex flex-wrap justify-center gap-2 mb-8
            transition-all duration-700 delay-300 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            {FILTERS.map((f, i) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`
                  px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 cursor-pointer border
                  ${activeFilter === f
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent shadow-lg shadow-blue-500/20'
                    : 'bg-white/[0.05] text-white/50 border-white/10 hover:bg-white/[0.08] hover:text-white/70'
                  }
                `}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Animated Stats */}
          <AnimatedStats inView={heroInView} />
        </div>
      </div>

      {/* ══ MAIN CONTENT ═══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20">

        {/* Stats bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <p className="text-sm text-white/40">
            Showing <strong className="text-white">{filtered.length}</strong> freelancers
            {activeFilter !== 'All' && <span className="text-blue-400"> in {activeFilter}</span>}
            {search && <span className="text-white/60"> matching "{search}"</span>}
          </p>
          <div className="flex gap-5 text-sm">
            <span className="text-white/30"><strong className="text-white">{freelancers.length}+</strong> Total</span>
            <span className="text-white/30"><strong className="text-white">50K+</strong> Hired</span>
            <span className="text-white/30"><strong className="text-white">4.9★</strong> Avg</span>
          </div>
        </div>

        {/* Grid */}
        {freelancerLoading && filtered.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No freelancers found</h3>
            <p className="text-white/40 mb-5">Try a different search or filter</p>
            <button
              onClick={() => { setSearch(''); setActiveFilter('All') }}
              className="px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer border-none
                bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((freelancer, i) => (
              <FreelancerCard
                key={freelancer._id}
                freelancer={freelancer}
                index={i}
                colorIndex={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* ══ BOTTOM CTA ════════════════════════════════════════ */}
      <div className="bg-[#0f172a] py-16 sm:py-24 px-4 border-t border-white/[0.05]">
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            Can't find what<br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> you need?</span>
          </h2>
          <p className="text-white/50 text-sm sm:text-base mb-8 max-w-lg mx-auto">
            Post a project and let the right freelancers come to you. Our AI matches you with the best talent.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 rounded-xl font-bold text-sm cursor-pointer border-none
                bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all"
            >
              Post a Project ↗
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 rounded-xl cursor-pointer bg-transparent text-white font-bold text-sm
                border-2 border-white/20 hover:border-white/40 hover:bg-white/[0.05] transition-all"
            >
              Join as Freelancer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Talent
