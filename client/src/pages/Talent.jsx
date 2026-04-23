import { useEffect, useState, useRef, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getFreelancers } from '../features/Freelancer/freelancerSlice'

// ─── Design Tokens ────────────────────────────────────────────────────────────
const ACCENT_BG  = 'bg-gradient-to-r from-blue-500 to-cyan-400'
const CARD       = 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm'
const CARD_HOVER = 'hover:bg-white/[0.06] hover:border-white/[0.14]'
const TEXT_1     = 'text-white'
const TEXT_2     = 'text-white/55'
const TEXT_3     = 'text-white/30'

// ─── Intersection Observer Hook ───────────────────────────────────────────────
const useInView = (threshold = 0.12) => {
    const ref = useRef(null)
    const [inView, setInView] = useState(false)
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setInView(true) },
            { threshold }
        )
        if (ref.current) obs.observe(ref.current)
        return () => obs.disconnect()
    }, [threshold])
    return [ref, inView]
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
const useCounter = (end, duration = 2000, active = false) => {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!active) return
        let current = 0
        const step = end / (duration / 16)
        const timer = setInterval(() => {
            current += step
            if (current >= end) { setCount(end); clearInterval(timer) }
            else setCount(Math.floor(current))
        }, 16)
        return () => clearInterval(timer)
    }, [end, duration, active])
    return count
}

// ─── Category color map ───────────────────────────────────────────────────────
const CAT = {
    blue:    { bar: 'from-blue-500 to-blue-600',    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    skill: 'bg-blue-500/10 text-blue-300 border-blue-500/15'    },
    violet:  { bar: 'from-violet-500 to-violet-600', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', skill: 'bg-violet-500/10 text-violet-300 border-violet-500/15' },
    amber:   { bar: 'from-amber-500 to-amber-600',  badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',  skill: 'bg-amber-500/10 text-amber-300 border-amber-500/15'  },
    rose:    { bar: 'from-rose-500 to-rose-600',    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',    skill: 'bg-rose-500/10 text-rose-300 border-rose-500/15'    },
    emerald: { bar: 'from-emerald-500 to-emerald-600', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', skill: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/15' },
    cyan:    { bar: 'from-cyan-500 to-cyan-600',    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',    skill: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/15'    },
}
const CAT_PALETTE = [CAT.blue, CAT.violet, CAT.amber, CAT.rose, CAT.emerald, CAT.cyan]

// ─── Filter Config ────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Web Dev', 'Design', 'AI / ML', 'Apps', 'Marketing', 'Data']

function filterMatch(f, filter) {
    if (filter === 'All') return true
    const cat = (f.category || '').toLowerCase()
    if (filter === 'Web Dev')   return cat.includes('web')    || cat.includes('software') || cat.includes('full')
    if (filter === 'Design')    return cat.includes('design') || cat.includes('creative') || cat.includes('ui')
    if (filter === 'AI / ML')   return cat.includes('ai')     || cat.includes('ml')       || cat.includes('machine')
    if (filter === 'Apps')      return cat.includes('app')    || cat.includes('mobile')
    if (filter === 'Marketing') return cat.includes('market') || cat.includes('sales')
    if (filter === 'Data')      return cat.includes('data')   || cat.includes('analyst')
    return true
}

// ─── Animated Stats ───────────────────────────────────────────────────────────
const AnimatedStats = memo(function AnimatedStats({ inView }) {
    const fl  = useCounter(50000,  2500, inView)
    const pr  = useCounter(120000, 2500, inView)
    const raw = useCounter(49,     1500, inView)

    const stats = [
        { value: `${Math.floor(fl / 1000)}K+`,        label: 'Freelancers'   },
        { value: `${Math.floor(pr / 1000)}K+`,        label: 'Projects Done' },
        { value: `${(raw / 10).toFixed(1)}★`,         label: 'Avg Rating'    },
    ]

    return (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto mt-8">
            {stats.map((s, i) => (
                <div
                    key={s.label}
                    className={`${CARD} ${CARD_HOVER} rounded-xl sm:rounded-2xl px-3 py-3.5 sm:px-4 sm:py-4 text-center
                        transition-all duration-500 cursor-default
                        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                    style={{ transitionDelay: `${300 + i * 80}ms` }}
                >
                    <div className={`text-base sm:text-lg font-bold ${TEXT_1}`}>
                        {inView ? s.value : '—'}
                    </div>
                    <div className={`text-[10px] sm:text-xs ${TEXT_3} mt-1 font-medium`}>{s.label}</div>
                </div>
            ))}
        </div>
    )
})

// ─── Freelancer Card ──────────────────────────────────────────────────────────
const FreelancerCard = memo(function FreelancerCard({ freelancer, index, colorIndex }) {
    const [ref, inView] = useInView(0.08)
    const color = CAT_PALETTE[colorIndex % CAT_PALETTE.length]

    const skills = Array.isArray(freelancer.skills)
        ? freelancer.skills
        : (freelancer.skills || '').split(',').map(s => s.trim()).filter(Boolean)

    const initials = (freelancer.user?.name || '?')
        .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

    const stars = Math.round(freelancer.rating || 0)

    return (
        <div
            ref={ref}
            className={`flex flex-col rounded-2xl overflow-hidden transition-all duration-500 group
                ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${index * 55}ms` }}
        >
            {/* top accent bar */}
            <div className={`h-px bg-gradient-to-r ${color.bar} flex-shrink-0`} />

            {/* card body */}
            <div className={`flex flex-col flex-1 ${CARD} rounded-b-2xl border-t-0
                transition-all duration-300 group-hover:bg-white/[0.06] group-hover:border-white/[0.15]
                group-hover:-translate-y-1 group-hover:shadow-2xl`}
            >
                {/* header */}
                <div className="relative px-5 pt-5 pb-4 border-b border-white/[0.05]">
                    {/* category badge */}
                    <span className={`absolute top-3.5 right-4 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${color.badge}`}>
                        {freelancer.category || 'Freelancer'}
                    </span>

                    <div className="flex items-center gap-3.5">
                        {/* avatar */}
                        <div className="relative flex-shrink-0">
                            {freelancer.user?.profilePic ? (
                                <img
                                    src={freelancer.user.profilePic}
                                    alt={freelancer.user?.name}
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-white/10 shadow-lg"
                                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                                />
                            ) : null}
                            <div className={`${freelancer.user?.profilePic ? 'hidden' : 'flex'}
                                w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${color.bar}
                                items-center justify-center ring-2 ring-white/10 shadow-lg`}>
                                <span className="text-white font-bold text-base">{initials}</span>
                            </div>
                            {/* online dot */}
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400
                                border-2 border-[#020617] shadow shadow-emerald-400/40" />
                        </div>

                        <div className="min-w-0 flex-1 pr-12">
                            <h3 className={`font-semibold ${TEXT_1} text-[15px] leading-tight truncate mb-0.5`}>
                                {freelancer.user?.name || 'Unknown'}
                            </h3>
                            <p className={`text-xs ${TEXT_3} truncate mb-2`}>
                                {freelancer.user?.email}
                            </p>
                            <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color.badge}`}>
                                {freelancer.experience || 0}y exp
                            </span>
                        </div>
                    </div>
                </div>

                {/* body */}
                <div className="px-5 py-4 flex-1 flex flex-col gap-3">
                    <p className={`text-[13px] ${TEXT_2} leading-relaxed line-clamp-2`}>
                        {freelancer.description || 'Experienced freelancer ready to help with your project.'}
                    </p>

                    {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {skills.slice(0, 4).map((sk, i) => (
                                <span key={i} className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${color.skill}`}>
                                    {sk}
                                </span>
                            ))}
                            {skills.length > 4 && (
                                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${CARD} ${TEXT_3} border-white/10`}>
                                    +{skills.length - 4}
                                </span>
                            )}
                        </div>
                    )}

                    {/* rating + rate */}
                    <div className={`flex items-center justify-between pt-3 border-t border-white/[0.05] mt-auto`}>
                        <div className="flex items-center gap-1.5">
                            <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={`text-xs ${i < stars ? 'text-amber-400' : 'text-white/10'}`}>★</span>
                                ))}
                            </div>
                            <span className={`text-sm font-semibold ${TEXT_1}`}>{(freelancer.rating || 0).toFixed(1)}</span>
                            <span className={`text-xs ${TEXT_3}`}>({freelancer.totalRatings || 0})</span>
                        </div>
                        <div className="text-right">
                            <span className={`text-base font-bold ${TEXT_1}`}>
                                {freelancer.hourlyRate ? `₹${freelancer.hourlyRate}` : 'Open'}
                            </span>
                            <span className={`text-xs ${TEXT_3}`}>/hr</span>
                        </div>
                    </div>
                </div>

                {/* footer CTA */}
                <div className="px-5 pb-5">
                    <Link
                        to={`/profile/${freelancer.user?._id}`}
                        className={`block text-center py-2.5 text-sm font-semibold text-white rounded-xl no-underline
                            ${ACCENT_BG} transition-all duration-200
                            group-hover:shadow-lg group-hover:shadow-blue-500/25`}
                    >
                        View Profile ↗
                    </Link>
                </div>
            </div>
        </div>
    )
})

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = memo(function SkeletonCard() {
    return (
        <div className={`${CARD} rounded-2xl overflow-hidden animate-pulse`}>
            <div className="h-px bg-white/10" />
            <div className="p-5 space-y-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.06]" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/[0.06] rounded-lg w-3/4" />
                        <div className="h-3 bg-white/[0.04] rounded-lg w-1/2" />
                    </div>
                </div>
                <div className="h-3 bg-white/[0.04] rounded-lg" />
                <div className="h-3 bg-white/[0.04] rounded-lg w-4/5" />
                <div className="flex gap-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-5 w-14 bg-white/[0.04] rounded-full" />)}
                </div>
                <div className="h-10 bg-white/[0.04] rounded-xl mt-2" />
            </div>
        </div>
    )
})

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = memo(function EmptyState({ onReset }) {
    return (
        <div className="col-span-full text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className={`text-xl font-bold ${TEXT_1} mb-2`}>No freelancers found</h3>
            <p className={`text-sm ${TEXT_2} mb-6`}>Try adjusting your search or filter</p>
            <button
                onClick={onReset}
                className={`${ACCENT_BG} text-white px-6 py-2.5 rounded-xl font-semibold text-sm
                    cursor-pointer border-none hover:shadow-lg hover:shadow-blue-500/25 transition-all`}
            >
                Clear Filters
            </button>
        </div>
    )
})

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — all logic unchanged
// ══════════════════════════════════════════════════════════════════════════════
function Talent() {
    const { freelancers, freelancerLoading, freelancerError, freelancerErrorMessage } =
        useSelector(s => s.freelancer)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [search,       setSearch]       = useState('')
    const [activeFilter, setActiveFilter] = useState('All')
    const [heroRef,      heroInView]      = useInView(0.1)

    useEffect(() => { dispatch(getFreelancers()) }, [dispatch])
    useEffect(() => {
        if (freelancerError && freelancerErrorMessage) toast.error(freelancerErrorMessage)
    }, [freelancerError, freelancerErrorMessage])

    const filtered = (freelancers || []).filter(f => {
        const q = search.toLowerCase()
        const matchSearch =
            (f.user?.name     || '').toLowerCase().includes(q) ||
            (f.category       || '').toLowerCase().includes(q) ||
            (f.skills         || '').toLowerCase().includes(q)
        return matchSearch && filterMatch(f, activeFilter)
    })

    const handleReset = () => { setSearch(''); setActiveFilter('All') }

    return (
        <div className="min-h-screen bg-[#020617]" style={{ fontFamily: "'DM Sans','Inter',system-ui,sans-serif" }}>
            <style>{`
                * { box-sizing: border-box }
            `}</style>

            {/* ══ HERO ════════════════════════════════════════════════════════ */}
            <section
                className="relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg,#020617 0%,#0c1a38 50%,#020617 100%)' }}
            >
                {/* ambient glows */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full opacity-[0.12]"
                        style={{ background: 'radial-gradient(circle,#3b82f6 0%,transparent 65%)' }} />
                    <div className="absolute -bottom-32 -left-10 w-80 h-80 rounded-full opacity-[0.08]"
                        style={{ background: 'radial-gradient(circle,#06b6d4 0%,transparent 65%)' }} />
                    {/* subtle grid */}
                    <div className="absolute inset-0 opacity-[0.035]"
                        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)', backgroundSize: '52px 52px' }} />
                </div>

                <div ref={heroRef} className="relative z-10 max-w-3xl mx-auto px-4 sm:px-8 pt-14 sm:pt-20 pb-12 sm:pb-16 text-center">

                    {/* live badge */}
                    <div className={`inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.09] 
                        rounded-full px-4 py-2 mb-6 transition-all duration-700
                        ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        <span className="relative flex w-2 h-2 flex-shrink-0">
                            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                            <span className="relative rounded-full bg-emerald-400 w-2 h-2" />
                        </span>
                        <span className={`text-xs font-medium ${TEXT_2}`}>
                            {freelancers.length}+ verified freelancers available now
                        </span>
                    </div>

                    {/* headline */}
                    <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-bold ${TEXT_1} leading-tight mb-3 tracking-tight
                        transition-all duration-700 delay-100 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        Hire the World's
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                            Best Talent
                        </span>
                    </h1>

                    <p className={`text-sm sm:text-base ${TEXT_2} max-w-md mx-auto mb-7 leading-relaxed
                        transition-all duration-700 delay-200 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        Browse verified, skilled freelancers — ready to deliver results on your project.
                    </p>

                    {/* search + CTA */}
                    <div className={`flex flex-col sm:flex-row gap-2.5 max-w-xl mx-auto mb-6
                        transition-all duration-700 delay-300 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">🔍</span>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name, category, skills..."
                                className={`w-full pl-10 pr-4 py-3 text-sm ${TEXT_1} placeholder-white/25
                                    ${CARD} rounded-xl outline-none transition-all
                                    focus:bg-white/[0.07] focus:border-white/20 focus:ring-2 focus:ring-blue-500/20`}
                            />
                        </div>
                        <button
                            onClick={() => navigate('/register')}
                            className={`${ACCENT_BG} text-white px-6 py-3 rounded-xl font-semibold text-sm
                                cursor-pointer border-none whitespace-nowrap
                                hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all`}
                        >
                            Post a Project
                        </button>
                    </div>

                    {/* filter pills */}
                    <div className={`flex flex-wrap justify-center gap-2 mb-2
                        transition-all duration-700 delay-350 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
                                    cursor-pointer border min-h-[32px]
                                    ${activeFilter === f
                                        ? `${ACCENT_BG} text-white border-transparent shadow-md shadow-blue-500/20`
                                        : `${CARD} ${TEXT_2} border-white/[0.08] hover:bg-white/[0.07] hover:text-white`
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* animated stats */}
                    <AnimatedStats inView={heroInView} />
                </div>
            </section>

            {/* ══ FREELANCER GRID ═════════════════════════════════════════════ */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

                {/* result meta row */}
                <div className={`flex flex-wrap items-center justify-between gap-3 mb-6 pb-5 border-b border-white/[0.06]`}>
                    <p className={`text-sm ${TEXT_3}`}>
                        Showing&nbsp;
                        <strong className={TEXT_1}>{filtered.length}</strong>
                        &nbsp;freelancers
                        {activeFilter !== 'All' && <span className="text-blue-400"> in {activeFilter}</span>}
                        {search && <span className={TEXT_2}> matching "{search}"</span>}
                    </p>
                    <div className={`flex gap-5 text-xs ${TEXT_3}`}>
                        <span><strong className={TEXT_1}>{freelancers.length}+</strong> Total</span>
                        <span><strong className={TEXT_1}>50K+</strong> Hired</span>
                        <span><strong className={TEXT_1}>4.9★</strong> Avg</span>
                    </div>
                </div>

                {/* cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {freelancerLoading && filtered.length === 0
                        ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                        : filtered.length === 0
                        ? <EmptyState onReset={handleReset} />
                        : filtered.map((f, i) => (
                            <FreelancerCard
                                key={f._id}
                                freelancer={f}
                                index={i}
                                colorIndex={i}
                            />
                        ))
                    }
                </div>
            </main>

            {/* ══ BOTTOM CTA ══════════════════════════════════════════════════ */}
            <footer className="border-t border-white/[0.05]"
                style={{ background: 'linear-gradient(160deg,#020617 0%,#0c1824 50%,#020617 100%)' }}
            >
                <div className="relative max-w-2xl mx-auto px-4 py-14 sm:py-20 text-center overflow-hidden">
                    {/* glow */}
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-96 h-96 rounded-full opacity-[0.07]"
                        style={{ background: 'radial-gradient(circle,#3b82f6 0%,transparent 65%)' }} />

                    <h2 className={`text-2xl sm:text-4xl font-bold ${TEXT_1} mb-3 leading-tight relative`}>
                        Can't find what you need?
                    </h2>
                    <p className={`text-sm sm:text-base ${TEXT_2} mb-8 max-w-md mx-auto leading-relaxed relative`}>
                        Post a project and let the right freelancers come to you.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 relative">
                        <button
                            onClick={() => navigate('/register')}
                            className={`${ACCENT_BG} text-white px-8 py-3 rounded-xl font-semibold text-sm
                                cursor-pointer border-none hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105 transition-all`}
                        >
                            Post a Project ↗
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className={`bg-transparent ${TEXT_1} font-semibold text-sm px-8 py-3 rounded-xl
                                cursor-pointer border border-white/15 hover:border-white/30 hover:bg-white/[0.04] transition-all`}
                        >
                            Join as Freelancer
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Talent
