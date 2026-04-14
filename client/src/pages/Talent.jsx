// ===== FILE: client/src/pages/Talent.jsx =====

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "react-toastify"
import { getFreelancers } from "../features/Freelancer/freelancerSlice"
import { Link } from "react-router-dom"
import LoaderGradient from "../components/LoaderGradient"

// ── Typewriter ────────────────────────────────────────────────────────────────
const WORDS = ["Web Developers", "UI/UX Designers", "Marketers", "Data Experts", "Mobile Devs", "AI Engineers"]
const WORD_COLORS = [
    { from: "#3B7FF5", to: "#2BC4D4" },
    { from: "#8B5CF6", to: "#EC4899" },
    { from: "#F59E0B", to: "#EF4444" },
    { from: "#10B981", to: "#3B7FF5" },
    { from: "#F43F5E", to: "#8B5CF6" },
    { from: "#06B6D4", to: "#10B981" },
]

function useTypewriter() {
    const [displayed, setDisplayed] = useState("")
    const [wordIdx, setWordIdx] = useState(0)
    const [phase, setPhase] = useState("typing")
    const [charIdx, setCharIdx] = useState(0)

    useEffect(() => {
        let timer
        const word = WORDS[wordIdx]
        if (phase === "typing") {
            if (charIdx < word.length) {
                timer = setTimeout(() => { setDisplayed(word.slice(0, charIdx + 1)); setCharIdx(c => c + 1) }, 75)
            } else {
                timer = setTimeout(() => setPhase("pause"), 1800)
            }
        } else if (phase === "pause") {
            timer = setTimeout(() => setPhase("deleting"), 200)
        } else {
            if (charIdx > 0) {
                timer = setTimeout(() => { setDisplayed(word.slice(0, charIdx - 1)); setCharIdx(c => c - 1) }, 38)
            } else {
                setWordIdx(i => (i + 1) % WORDS.length)
                setPhase("typing")
            }
        }
        return () => clearTimeout(timer)
    }, [phase, charIdx, wordIdx])

    return { displayed, wordIdx }
}

// ── Marquee ───────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
    "✦ Discover Top Talent", "✦ Hire Smarter, Faster", "✦ Talent That Delivers",
    "✦ Find Your Perfect Match", "✦ Work With The Best", "✦ Where Talent Meets Opportunity",
    "✦ Unlock Hidden Talent", "✦ Build Your Dream Team", "✦ Talent Without Limits",
    "✦ The Right Talent, Right Now", "✦ Elite Talent Network", "✦ Future of Hiring",
]

const Marquee = ({ reverse = false, light = false }) => {
    const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
    return (
        <div className="overflow-hidden py-2.5">
            <div
                className={`flex gap-10 w-max ${light ? "text-gray-400" : "text-white/45"}`}
                style={{ animation: `${reverse ? "marqueeRev" : "marquee"} 22s linear infinite` }}
            >
                {doubled.map((item, i) => (
                    <span key={i} className="whitespace-nowrap text-[13px] font-semibold tracking-wide">{item}</span>
                ))}
            </div>
        </div>
    )
}

// ── Category helpers ──────────────────────────────────────────────────────────
const CAT_COLORS = {
    web: { gradient: "from-blue-500 to-cyan-500", light: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
    design: { gradient: "from-emerald-500 to-teal-500", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
    marketing: { gradient: "from-orange-500 to-amber-500", light: "bg-orange-50", text: "text-orange-700", border: "border-orange-100" },
    ai: { gradient: "from-violet-500 to-purple-500", light: "bg-violet-50", text: "text-violet-700", border: "border-violet-100" },
    apps: { gradient: "from-pink-500 to-rose-500", light: "bg-pink-50", text: "text-pink-700", border: "border-pink-100" },
    data: { gradient: "from-sky-500 to-blue-500", light: "bg-sky-50", text: "text-sky-700", border: "border-sky-100" },
    default: { gradient: "from-gray-500 to-slate-500", light: "bg-gray-50", text: "text-gray-700", border: "border-gray-100" },
}

function getCatStyle(category = "") {
    const l = category.toLowerCase()
    if (l.includes("web") || l.includes("software") || l.includes("full")) return CAT_COLORS.web
    if (l.includes("design") || l.includes("creative") || l.includes("ui")) return CAT_COLORS.design
    if (l.includes("market") || l.includes("sales")) return CAT_COLORS.marketing
    if (l.includes("ai") || l.includes("ml") || l.includes("machine")) return CAT_COLORS.ai
    if (l.includes("app") || l.includes("mobile")) return CAT_COLORS.apps
    if (l.includes("data") || l.includes("analyst")) return CAT_COLORS.data
    return CAT_COLORS.default
}

const FILTERS = ["All", "Web Dev", "Design", "AI / ML", "Apps", "Marketing", "Data"]

function filterMatch(f, filter) {
    if (filter === "All") return true
    const cat = (f.category || "").toLowerCase()
    if (filter === "Web Dev") return cat.includes("web") || cat.includes("software") || cat.includes("full")
    if (filter === "Design") return cat.includes("design") || cat.includes("creative") || cat.includes("ui")
    if (filter === "AI / ML") return cat.includes("ai") || cat.includes("ml") || cat.includes("machine")
    if (filter === "Apps") return cat.includes("app") || cat.includes("mobile")
    if (filter === "Marketing") return cat.includes("market") || cat.includes("sales")
    if (filter === "Data") return cat.includes("data") || cat.includes("analyst")
    return true
}

// ════════════════════════════════════════════════════════════════════════════════
function Talent() {
    const {
        freelancers: rawFreelancers,
        freelancerLoading,
        freelancerError,
        freelancerErrorMessage,
    } = useSelector(s => s.freelancer)

    const dispatch = useDispatch()

    // ✅ CRITICAL FIX — always ensure freelancers is an array
    const freelancers = Array.isArray(rawFreelancers) ? rawFreelancers : []

    const [search, setSearch] = useState("")
    const [activeFilter, setActiveFilter] = useState("All")

    const { displayed, wordIdx } = useTypewriter()
    const color = WORD_COLORS[wordIdx]

    useEffect(() => {
        dispatch(getFreelancers())
    }, [dispatch])

    useEffect(() => {
        if (freelancerError && freelancerErrorMessage) toast.error(freelancerErrorMessage)
    }, [freelancerError, freelancerErrorMessage])

    // ✅ CRITICAL FIX — filter on guaranteed array
    const filtered = freelancers.filter(f => {
        const matchSearch =
            (f.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (f.category || "").toLowerCase().includes(search.toLowerCase()) ||
            (f.skills || "").toLowerCase().includes(search.toLowerCase())
        return matchSearch && filterMatch(f, activeFilter)
    })

    if (freelancerLoading) return <LoaderGradient />

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        @keyframes fadeInUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink       { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes shimmerLine { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
        @keyframes orbPulse    { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.15);opacity:.85} }
        @keyframes marquee     { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes marqueeRev  { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
        @keyframes pillPop     { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
        .card-in        { animation: fadeInUp .45s ease both }
        .fade-up        { animation: fadeInUp .55s ease both }
        .cursor-blink   { animation: cursorBlink 1s ease infinite }
        .shimmer        { animation: shimmerLine 0.45s ease both; transform-origin: center }
        .orb-1          { animation: orbPulse 5s ease infinite }
        .orb-2          { animation: orbPulse 7s ease infinite reverse }
      `}</style>

            {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
            <div
                className="relative overflow-hidden px-6 pt-16 pb-0"
                style={{ background: "linear-gradient(135deg,#0A0F1E 0%,#0F1F3D 50%,#0A0F1E 100%)" }}
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="orb-1 absolute w-[500px] h-[500px] rounded-full -top-36 -right-12 transition-all duration-500"
                        style={{ background: `radial-gradient(circle,${color.from}22 0%,transparent 70%)` }} />
                    <div className="orb-2 absolute w-[350px] h-[350px] rounded-full bottom-0 -left-12 transition-all duration-500"
                        style={{ background: `radial-gradient(circle,${color.to}18 0%,transparent 70%)` }} />
                </div>

                <div className="relative max-w-3xl mx-auto text-center">
                    {/* live badge */}
                    <div className="fade-up inline-flex items-center gap-2 rounded-3xl px-4 py-1.5 mb-7 backdrop-blur-md border border-white/12 bg-white/7">
                        <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#22C55E]"
                            style={{ animation: "blink 1.4s ease infinite" }} />
                        <span className="text-xs text-white/75 font-semibold">
                            {freelancers.length}+ verified freelancers available now
                        </span>
                    </div>

                    {/* headline */}
                    <h1
                        className="fade-up text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-3"
                        style={{ fontFamily: "'Playfair Display',serif" }}
                    >
                        Hire the World's Best
                    </h1>

                    {/* typewriter */}
                    <div className="flex items-center justify-center flex-wrap gap-2.5 mb-1.5 min-h-[68px]">
                        <span
                            className="text-4xl sm:text-5xl font-extrabold leading-tight transition-all duration-300"
                            style={{
                                background: `linear-gradient(135deg,${color.from},${color.to})`,
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                backgroundClip: "text", fontFamily: "'Playfair Display',serif",
                            }}
                        >
                            {displayed}
                        </span>
                        <span
                            className="cursor-blink inline-block w-[3px] h-[52px] rounded-sm flex-shrink-0 transition-all duration-300"
                            style={{ background: `linear-gradient(${color.from},${color.to})` }}
                        />
                    </div>

                    {/* shimmer underline */}
                    <div
                        className="shimmer w-52 h-[3px] mx-auto rounded-full mb-6 transition-all duration-300"
                        style={{ background: `linear-gradient(90deg,${color.from},${color.to})` }}
                    />

                    <p className="fade-up text-base text-white/55 max-w-lg mx-auto leading-relaxed mb-8">
                        Browse all available freelancers — verified, skilled, and ready to deliver results.
                    </p>

                    {/* search bar */}
                    <div className="fade-up relative max-w-xl mx-auto mb-7">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg pointer-events-none">🔍</span>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, category, or skills..."
                            className="w-full pl-12 pr-12 py-4 text-sm text-white placeholder-white/40 bg-white/8 border border-white/15 rounded-2xl outline-none backdrop-blur-lg transition-colors duration-200"
                            onFocus={e => (e.target.style.borderColor = color.from)}
                            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none text-white/50 cursor-pointer text-lg"
                            >✕</button>
                        )}
                    </div>

                    {/* filter pills */}
                    <div className="fade-up flex flex-wrap justify-center gap-2 mb-9">
                        {FILTERS.map((f, i) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className="px-5 py-1.5 rounded-3xl text-[13px] font-semibold cursor-pointer transition-all duration-200 border"
                                style={{
                                    animation: `pillPop 0.4s ease ${i * 0.04}s both`,
                                    background: activeFilter === f ? `linear-gradient(135deg,${color.from},${color.to})` : "rgba(255,255,255,0.07)",
                                    color: activeFilter === f ? "white" : "rgba(255,255,255,0.55)",
                                    borderColor: activeFilter === f ? "transparent" : "rgba(255,255,255,0.12)",
                                    boxShadow: activeFilter === f ? `0 4px 14px ${color.from}44` : "none",
                                    transform: activeFilter === f ? "scale(1.05)" : "scale(1)",
                                }}
                            >{f}</button>
                        ))}
                    </div>

                    {/* word indicator pills */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {WORDS.map((w, i) => (
                            <span
                                key={w}
                                className="px-3.5 py-1 rounded-full text-xs font-semibold transition-all duration-300"
                                style={i === wordIdx
                                    ? { background: `linear-gradient(135deg,${WORD_COLORS[i].from},${WORD_COLORS[i].to})`, color: "white", boxShadow: `0 4px 12px ${WORD_COLORS[i].from}44` }
                                    : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }
                                }
                            >{w}</span>
                        ))}
                    </div>
                </div>

                {/* dark marquee belt */}
                <div className="bg-white/4 border-t border-white/8 mt-2">
                    <Marquee />
                </div>
            </div>

            {/* ══ STATS BAR ════════════════════════════════════════════════════════ */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-gray-500">
                        Showing <strong className="text-gray-900">{filtered.length}</strong> freelancers
                        {activeFilter !== "All" && <span style={{ color: color.from }}> in {activeFilter}</span>}
                        {search && <span> matching "<strong>{search}</strong>"</span>}
                    </p>
                    <div className="flex gap-6">
                        {[
                            { val: `${freelancers.length}+`, label: "Freelancers" },
                            { val: "50K+", label: "Projects Done" },
                            { val: "4.9★", label: "Avg Rating" },
                        ].map(s => (
                            <div key={s.label} className="text-[13px] text-gray-500 flex items-center gap-1">
                                <span className="font-extrabold text-gray-900">{s.val}</span> {s.label}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border-t border-gray-100 bg-gray-50">
                    <Marquee reverse light />
                </div>
            </div>

            {/* ══ GRID ════════════════════════════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto px-6 py-10">

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No freelancers found</h3>
                        <p className="text-sm text-gray-500 mb-5">Try a different search or filter</p>
                        <button
                            onClick={() => { setSearch(""); setActiveFilter("All") }}
                            className="px-6 py-2.5 rounded-xl border-none cursor-pointer text-white font-bold text-sm"
                            style={{ background: `linear-gradient(135deg,${color.from},${color.to})` }}
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map((freelancer, i) => {
                            const s = getCatStyle(freelancer.category)
                            const skills = (freelancer.skills || "").split(",").map(sk => sk.trim()).filter(Boolean)

                            return (
                                <div
                                    key={freelancer._id}
                                    className="card-in bg-white rounded-2xl border-[1.5px] border-gray-200 shadow-sm overflow-hidden flex flex-col transition-all duration-250 hover:-translate-y-1 hover:shadow-xl hover:border-blue-400"
                                    style={{ animationDelay: `${i * 55}ms` }}
                                >
                                    <div className={`h-1.5 bg-gradient-to-r ${s.gradient}`} />

                                    {/* card header */}
                                    <div className={`relative px-5 pt-5 pb-4 ${s.light} border-b ${s.border}`}>
                                        <span className={`absolute top-2 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white ${s.text} border ${s.border}`}>
                                            {freelancer.category || "Freelancer"}
                                        </span>

                                        <div className="flex items-center gap-3.5">
                                            <div className="relative flex-shrink-0">
                                                {freelancer.user?.profilePic ? (
                                                    <img
                                                        src={freelancer.user.profilePic}
                                                        alt={freelancer.user?.name}
                                                        className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-md"
                                                        onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex" }}
                                                    />
                                                ) : null}
                                                <div
                                                    className={`${freelancer.user?.profilePic ? "hidden" : "flex"} w-16 h-16 rounded-2xl bg-gradient-to-br ${s.gradient} items-center justify-center ring-4 ring-white shadow-md`}
                                                >
                                                    <span className="text-white font-bold text-lg">
                                                        {(freelancer.user?.name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span
                                                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-[2.5px] border-white"
                                                    style={{ animation: "blink 2s ease infinite" }}
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="font-bold text-gray-900 text-[15px] mb-0.5 truncate">
                                                    {freelancer.user?.name || "Unknown"}
                                                </h3>
                                                <p className="text-xs text-gray-500 truncate mb-1">{freelancer.user?.email}</p>
                                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white ${s.text} border ${s.border}`}>
                                                    {freelancer.experience || 0} yrs exp
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* card body */}
                                    <div className="px-5 py-4 flex-1 flex flex-col gap-2.5">
                                        <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                                            {freelancer.description || "Experienced freelancer ready to help with your project."}
                                        </p>

                                        {skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {skills.slice(0, 4).map((sk, si) => (
                                                    <span key={si} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.light} ${s.text} border ${s.border}`}>
                                                        {sk}
                                                    </span>
                                                ))}
                                                {skills.length > 4 && (
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                                        +{skills.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-auto">
                                            <div className="flex items-center gap-1">
                                                <span className="text-amber-400 text-sm">⭐</span>
                                                <span className="font-bold text-sm text-gray-900">{freelancer.rating || 0}</span>
                                                <span className="text-xs text-gray-400">rating</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-base font-extrabold text-gray-900">
                                                    {freelancer.hourlyRate ? `$${freelancer.hourlyRate}` : "Open"}
                                                </span>
                                                <span className="text-xs text-gray-400">/hr</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* card footer */}
                                    <div className="px-5 pb-5">
                                        <Link
                                            to={`/profile/${freelancer.user?._id}`}
                                            className="block text-center py-2.5 text-sm font-bold text-white rounded-xl no-underline hover:opacity-90 transition-opacity"
                                            style={{
                                                background: `linear-gradient(135deg,${color.from},${color.to})`,
                                                boxShadow: `0 4px 12px ${color.from}33`,
                                            }}
                                        >
                                            View Profile ↗
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* ══ BOTTOM CTA ═══════════════════════════════════════════════════════ */}
            {filtered.length > 0 && (
                <div
                    className="relative overflow-hidden px-6 py-16"
                    style={{ background: "linear-gradient(135deg,#0A0F1E 0%,#0F1F3D 100%)" }}
                >
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="orb-1 absolute w-96 h-96 rounded-full -top-24 right-1/4"
                            style={{ background: `radial-gradient(circle,${color.from}20 0%,transparent 70%)` }} />
                        <div className="orb-2 absolute w-72 h-72 rounded-full -bottom-20 left-8"
                            style={{ background: `radial-gradient(circle,${color.to}15 0%,transparent 70%)` }} />
                    </div>

                    <div className="relative max-w-2xl mx-auto text-center">
                        <h2
                            className="text-3xl sm:text-4xl font-extrabold text-white mb-3"
                            style={{ fontFamily: "'Playfair Display',serif" }}
                        >
                            Can't find what you need?
                        </h2>
                        <p className="text-[15px] text-white/55 mb-8 leading-relaxed">
                            Post a project and let the right freelancers come to you.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link to="/register">
                                <button
                                    className="px-8 py-3.5 rounded-2xl border-0 cursor-pointer text-white font-bold text-[15px] transition-opacity hover:opacity-88"
                                    style={{ background: `linear-gradient(135deg,${color.from},${color.to})`, boxShadow: `0 8px 24px ${color.from}44` }}
                                >
                                    Post a Project ↗
                                </button>
                            </Link>
                            <Link to="/register">
                                <button className="px-8 py-3.5 rounded-2xl cursor-pointer bg-transparent text-white font-bold text-[15px] border-[1.5px] border-white/25 hover:border-white/60 transition-all">
                                    Join as Freelancer
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Talent