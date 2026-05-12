import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { addProjects } from "../features/project/projectSlice"
import { useNavigate } from "react-router-dom"

// ── Typewriter config ──────────────────────────────────────
const WORDS = [
    "the Right Freelancer",
    "Top Web Developers",
    "Expert UI Designers",
    "Skilled Marketers",
    "Data Scientists",
    "Mobile App Devs",
]
const WORD_COLORS = [
    { from: "#3B7FF5", to: "#2BC4D4" },
    { from: "#8B5CF6", to: "#EC4899" },
    { from: "#F59E0B", to: "#EF4444" },
    { from: "#10B981", to: "#3B7FF5" },
    { from: "#F43F5E", to: "#8B5CF6" },
    { from: "#06B6D4", to: "#10B981" },
]

const MARQUEE = [
    "✦ Post Your Project", "✦ Get Proposals Fast", "✦ Hire Top Talent",
    "✦ Work With The Best", "✦ Budget-Friendly Plans", "✦ Verified Freelancers",
    "✦ Quick Turnaround", "✦ Quality Guaranteed", "✦ Start Today",
    "✦ No Hidden Fees", "✦ 10,000+ Experts Ready", "✦ Trusted Platform",
]

const CATEGORIES = [
    "Web Development", "UI/UX Design", "Backend Dev",
    "Mobile Dev", "Data Science", "Full Stack",
    "WordPress", "Graphic Design", "Content Writing"
]

const TECHNOLOGIES = [
    "React", "Next.js", "Vue.js", "Angular", "Node.js",
    "Express", "MongoDB", "PostgreSQL", "MySQL", "Firebase",
    "Python", "Django", "Flask", "PHP", "Laravel",
    "Flutter", "React Native", "Swift", "Kotlin",
    "Figma", "Adobe XD", "Tailwind CSS", "TypeScript",
    "GraphQL", "REST API", "Docker"
]

// ── useTypewriter hook ─────────────────────────────────────
function useTypewriter() {
    const [wordIdx, setWordIdx] = useState(0)
    const [phase, setPhase] = useState("typing")
    const [charIdx, setCharIdx] = useState(0)

    useEffect(() => {
        let timer
        const word = WORDS[wordIdx]
        if (phase === "typing") {
            if (charIdx < word.length) {
                timer = setTimeout(() => {
                    setCharIdx(currentIndex => currentIndex + 1)
                }, 72)
            } else {
                timer = setTimeout(() => setPhase("pause"), 1900)
            }
        } else if (phase === "pause") {
            timer = setTimeout(() => setPhase("deleting"), 200)
        } else if (phase === "deleting") {
            if (charIdx > 0) {
                timer = setTimeout(() => {
                    setCharIdx(currentIndex => currentIndex - 1)
                }, 36)
            } else {
                timer = setTimeout(() => {
                    setWordIdx(currentIndex => (currentIndex + 1) % WORDS.length)
                    setPhase("typing")
                }, 0)
            }
        }
        return () => clearTimeout(timer)
    }, [phase, charIdx, wordIdx])

    return { wordIdx }
}

// ── Marquee strip ──────────────────────────────────────────
const MarqueeStrip = ({ reverse = false, light = false }) => {
    const doubled = [...MARQUEE, ...MARQUEE]
    return (
        <div className="overflow-hidden py-2">
            <div className="flex gap-9 w-max" style={{ animation: `${reverse ? "marqueeRev" : "marquee"} 20s linear infinite` }}>
                {doubled.map((item, i) => (
                    <span key={i} className={`whitespace-nowrap text-xs font-semibold tracking-wide ${light ? "text-slate-400 dark:text-white/40" : "text-white/50"}`}>
                        {item}
                    </span>
                ))}
            </div>
        </div>
    )
}

// ══════════════════════════════════════════════════════════
const ListProject = () => {


    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { wordIdx } = useTypewriter()
    const color = WORD_COLORS[wordIdx]

    const [formData, setFormData] = useState({ title: "", description: "", budget: "", technology: "", category: "", duration: "" })
    const [selectedTechs, setSelectedTechs] = useState([])
    const [focusedField, setFocusedField] = useState(null)
    const [step, setStep] = useState(1)

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = e => {
        e.preventDefault()
        dispatch(addProjects(formData))
        alert("Project submitted! Check console for details.")
         navigate("/browse-projects")

    }

    const toggleTech = tech => {
        const updated = selectedTechs.includes(tech)
            ? selectedTechs.filter(t => t !== tech)
            : [...selectedTechs, tech]
        setSelectedTechs(updated)
        setFormData({ ...formData, technology: updated.join(", ") })
    }

    const isComplete = formData.title && formData.description &&
        formData.budget && formData.category &&
        formData.duration && selectedTechs.length > 0

    // ── dynamic input border (uses inline only for color value) ──
    const inputCls = () =>
        `w-full box-border rounded-2xl bg-white text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/35`

    const inputStyle = (name) => ({
        border: `1.5px solid ${focusedField === name ? color.from : formData[name] ? "#22C55E" : "rgba(148,163,184,.35)"}`,
        boxShadow: focusedField === name ? `0 0 0 4px ${color.from}22` : "none",
    })

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817]" style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>
            <style>{`
                @keyframes fadeUp      { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes ping        { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2);opacity:0} }
                @keyframes orbPulse    { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.15);opacity:.9} }
                @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
                @keyframes shimmerLine { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
                @keyframes marquee     { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
                @keyframes marqueeRev  { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
                @keyframes pillPop     { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
                @keyframes orbFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(30px)} }
                .fade-up  { animation: fadeUp 0.5s ease both }
                .cursor-blink { animation: cursorBlink 1s ease infinite }
                .orb-float  { animation: orbFloat 8s ease infinite }
                .orb-float-r{ animation: orbFloat 11s ease infinite reverse }
                .orb-pulse  { animation: orbPulse 5s ease infinite }
                .orb-pulse-r{ animation: orbPulse 7s ease infinite reverse }
                .shimmer-line{ animation: shimmerLine 0.4s ease both }
                input::-webkit-inner-spin-button { -webkit-appearance: none }
                input[type=number] { -moz-appearance: textfield }
            `}</style>

            {/* ── Floating bg orbs ── */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute w-[500px] h-[500px] rounded-full orb-float -top-36 -right-20 transition-all duration-500"
                    style={{ background: `radial-gradient(circle,${color.from}12 0%,transparent 70%)` }} />
                <div className="absolute w-[350px] h-[350px] rounded-full orb-float-r bottom-[5%] -left-20 transition-all duration-500"
                    style={{ background: `radial-gradient(circle,${color.to}10 0%,transparent 70%)` }} />
            </div>

            {/* ══ DARK HERO ══════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden z-10 pt-14 pb-0"
                style={{ background: "linear-gradient(135deg,#0A0F1E 0%,#0F1F3D 55%,#0A0F1E 100%)" }}>

                {/* hero orbs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute w-[480px] h-[480px] rounded-full orb-pulse -top-32 -right-14 transition-all duration-500"
                        style={{ background: `radial-gradient(circle,${color.from}20 0%,transparent 70%)` }} />
                    <div className="absolute w-[320px] h-[320px] rounded-full orb-pulse-r bottom-0 -left-10 transition-all duration-500"
                        style={{ background: `radial-gradient(circle,${color.to}15 0%,transparent 70%)` }} />
                </div>

                <div className="relative max-w-3xl mx-auto text-center px-6">

                    {/* live badge */}
                    <div className="fade-up inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm border border-white/10"
                        style={{ background: "rgba(255,255,255,0.07)" }}>
                        <span className="relative inline-block w-2 h-2">
                            <span className="absolute inset-0 rounded-full bg-green-400" style={{ animation: "ping 1.5s ease infinite" }} />
                            <span className="absolute inset-0 rounded-full bg-green-400" />
                        </span>
                        <span className="text-xs font-semibold text-white/75">Get matched with experts in minutes</span>
                    </div>

                    {/* static headline */}
                    <h1 className="fade-up text-4xl sm:text-5xl font-extrabold text-white mb-1.5 leading-tight"
                        style={{ fontFamily: "'Playfair Display',serif" }}>
                        List Your Project &amp; Find
                    </h1>

                   
                    {/* shimmer underline */}
                    <div className="w-48 h-[3px] rounded-full mx-auto mb-5 shimmer-line origin-center transition-all duration-300"
                        style={{ background: `linear-gradient(90deg,${color.from},${color.to})` }} />

                    <p className="fade-up text-sm text-white/50 max-w-md mx-auto mb-7 leading-7">
                        Fill in your project details below — get proposals from verified freelancers fast.
                    </p>

                    {/* word pills */}
                    <div className="flex flex-wrap justify-center gap-2 mb-9">
                        {WORDS.map((w, i) => (
                            <span key={w}
                                style={{
                                    padding: "4px 13px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                                    background: i === wordIdx ? `linear-gradient(135deg,${WORD_COLORS[i].from},${WORD_COLORS[i].to})` : "rgba(255,255,255,0.06)",
                                    color: i === wordIdx ? "white" : "rgba(255,255,255,0.32)",
                                    border: i === wordIdx ? "none" : "1px solid rgba(255,255,255,0.08)",
                                    transition: "all 0.4s ease",
                                    boxShadow: i === wordIdx ? `0 4px 12px ${WORD_COLORS[i].from}44` : "none",
                                    animation: `pillPop 0.4s ease ${i * 0.05}s both`
                                }}>
                                {w}
                            </span>
                        ))}
                    </div>

                    {/* step indicator */}
                    <div className="flex items-center justify-center gap-3 mb-9">
                        {["Project Details", "Preview & Submit"].map((label, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                                    style={{
                                        background: step > i + 1 ? "#22C55E" : step === i + 1 ? `linear-gradient(135deg,${color.from},${color.to})` : "rgba(255,255,255,0.1)",
                                        color: step >= i + 1 ? "white" : "rgba(255,255,255,0.35)",
                                        border: step > i ? "none" : "1px solid rgba(255,255,255,0.15)"
                                    }}>
                                    {step > i + 1 ? "✓" : i + 1}
                                </div>
                                <span className="text-xs font-semibold transition-colors duration-300"
                                    style={{ color: step === i + 1 ? "white" : "rgba(255,255,255,0.35)" }}>
                                    {label}
                                </span>
                                {i === 0 && (
                                    <div className="w-9 h-px transition-all duration-300"
                                        style={{ background: step > 1 ? "#22C55E" : "rgba(255,255,255,0.15)" }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* marquee on dark */}
                <div className="border-t border-white/5" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <MarqueeStrip />
                </div>
            </div>

            {/* ══ MAIN FORM ══════════════════════════════════════════════════ */}
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-5 pt-9 pb-16 relative z-10">

                {/* ════ STEP 1 ════ */}
                {step === 1 && (
                    <div className="fade-up">

                        {/* Project Info Card */}
                        <div className="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
                            <div className="h-1 transition-all duration-500"
                                style={{ background: `linear-gradient(135deg,${color.from},${color.to})` }} />
                            <div className="p-8">
                                <h2 className="mb-6 flex items-center gap-2.5 text-lg font-extrabold text-slate-950 dark:text-white"
                                    style={{ fontFamily: "'Playfair Display',serif" }}>
                                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-base dark:bg-blue-400/10">📋</span>
                                    Project Information
                                </h2>

                                <div className="flex flex-col gap-5">

                                    {/* Title */}
                                    <div>
                                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-white/65">
                                            Project Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="title" value={formData.title}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField("title")}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="e.g. Build a React Dashboard with Charts"
                                            className={`${inputCls()} px-4 py-3.5`}
                                            style={inputStyle("title")}
                                        />
                                        <p className="mt-1.5 text-[11px] text-slate-400 dark:text-white/40">Be specific — better titles attract better proposals</p>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-white/65">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="description" value={formData.description}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField("description")}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="Describe your project — goals, features, requirements, and expected outcomes..."
                                            rows={5}
                                            className={`${inputCls()} px-4 py-3.5 resize-y leading-relaxed`}
                                            style={inputStyle("description")}
                                        />
                                        <div className="flex justify-between mt-1.5">
                                            <p className="text-[11px] text-slate-400 dark:text-white/40">Min 50 characters recommended</p>
                                            <span className={`text-[11px] font-semibold ${formData.description.length >= 50 ? "text-green-500" : "text-slate-400 dark:text-white/40"}`}>
                                                {formData.description.length} chars
                                            </span>
                                        </div>
                                    </div>

                                    {/* Budget + Duration */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                        {/* Budget */}
                                        <div>
                                            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-white/65">
                                                Budget (₹) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-sm font-bold text-slate-500 dark:text-white/45">₹</span>
                                                <input
                                                    type="number" name="budget" value={formData.budget}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocusedField("budget")}
                                                    onBlur={() => setFocusedField(null)}
                                                    placeholder="20000"
                                                    className={`${inputCls()} pl-8 pr-4 py-3.5`}
                                                    style={inputStyle("budget")}
                                                />
                                            </div>
                                            <div className="flex gap-1.5 mt-2 flex-wrap">
                                                {["5000", "10000", "25000", "50000"].map(v => (
                                                    <button key={v} type="button"
                                                        onClick={() => setFormData({ ...formData, budget: v })}
                                                        className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all duration-150 ${formData.budget === v ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-cyan-300/25 dark:bg-cyan-400/10 dark:text-cyan-200" : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/50"}`}>
                                                        ₹{Number(v).toLocaleString()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Duration */}
                                        <div>
                                            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-white/65">
                                                Duration (days) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-white/40">days</span>
                                                <input
                                                    type="number" name="duration" value={formData.duration}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocusedField("duration")}
                                                    onBlur={() => setFocusedField(null)}
                                                    placeholder="10"
                                                    className={`${inputCls()} pl-4 pr-12 py-3.5`}
                                                    style={inputStyle("duration")}
                                                />
                                            </div>
                                            <div className="flex gap-1.5 mt-2 flex-wrap">
                                                {["3", "7", "14", "30"].map(v => (
                                                    <button key={v} type="button"
                                                        onClick={() => setFormData({ ...formData, duration: v })}
                                                        className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all duration-150 ${formData.duration === v ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-cyan-300/25 dark:bg-cyan-400/10 dark:text-cyan-200" : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/50"}`}>
                                                        {v}d
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="mb-2.5 block text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-white/65">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {CATEGORIES.map((cat, i) => {
                                                const sel = formData.category === cat
                                                return (
                                                    <button key={cat} type="button"
                                                        onClick={() => setFormData({ ...formData, category: cat })}
                                                        className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${sel ? "border-transparent text-white" : "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70"}`}
                                                        style={{
                                                            ...(sel ? { background: `linear-gradient(135deg,${color.from},${color.to})` } : {}),
                                                            boxShadow: sel ? `0 4px 12px ${color.from}33` : "none",
                                                            transform: sel ? "scale(1.05)" : "scale(1)",
                                                            animation: `pillPop 0.4s ease ${i * 0.04}s both`
                                                        }}>
                                                        {cat}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Technology Card */}
                        <div className="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
                            <div className="h-1 bg-gradient-to-r from-violet-500 to-pink-500" />
                            <div className="px-8 py-7">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="flex items-center gap-2.5 text-lg font-extrabold text-slate-950 dark:text-white"
                                        style={{ fontFamily: "'Playfair Display',serif" }}>
                                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-50 text-base dark:bg-purple-400/10">⚙️</span>
                                        Technologies Required
                                    </h2>
                                    {selectedTechs.length > 0 && (
                                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-cyan-300/25 dark:bg-cyan-400/10 dark:text-cyan-200">
                                            {selectedTechs.length} selected
                                        </span>
                                    )}
                                </div>

                                {/* selected chips */}
                                {selectedTechs.length > 0 && (
                                    <div className="mb-4 flex flex-wrap gap-1.5 rounded-2xl border border-dashed border-blue-200 bg-slate-50 p-3 dark:border-cyan-300/20 dark:bg-white/[0.04]">
                                        {selectedTechs.map(tech => (
                                            <span key={tech}
                                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white transition-all duration-300"
                                                style={{ background: `linear-gradient(135deg,${color.from},${color.to})` }}>
                                                {tech}
                                                <button type="button" onClick={() => toggleTech(tech)}
                                                    className="bg-transparent border-none text-white cursor-pointer text-sm leading-none p-0 ml-0.5">
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* tech pills */}
                                <div className="flex flex-wrap gap-2">
                                    {TECHNOLOGIES.map(tech => {
                                        const sel = selectedTechs.includes(tech)
                                        return (
                                            <button key={tech} type="button" onClick={() => toggleTech(tech)}
                                                className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${sel ? "border-cyan-300/60 bg-blue-50 text-blue-700 dark:bg-cyan-400/10 dark:text-cyan-200" : "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70"}`}
                                                style={{
                                                    ...(sel ? { borderColor: color.from } : {}),
                                                    transform: sel ? "scale(1.05)" : "scale(1)"
                                                }}>
                                                {sel && <span className="mr-1">✓</span>}
                                                {tech}
                                            </button>
                                        )
                                    })}
                                </div>
                                <p className="mt-3 text-[11px] text-slate-400 dark:text-white/40">
                                    💡 Select all technologies required — helps match the right freelancers
                                </p>
                            </div>
                        </div>

                        {/* light marquee */}
                        <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]">
                            <MarqueeStrip reverse light />
                        </div>

                        {/* Next button */}
                        <button type="button" onClick={() => isComplete && setStep(2)}
                            className="w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 border-none cursor-pointer"
                            style={{
                                background: isComplete ? `linear-gradient(135deg,${color.from},${color.to})` : "rgba(148,163,184,.22)",
                                color: isComplete ? "white" : "#94A3B8",
                                cursor: isComplete ? "pointer" : "not-allowed",
                                boxShadow: isComplete ? `0 8px 24px ${color.from}44` : "none"
                            }}>
                            {isComplete ? "Preview Project →" : "Fill all required fields to continue"}
                        </button>

                        {!isComplete && (
                            <p className="mt-2.5 text-center text-xs text-slate-400 dark:text-white/40">
                                Required: Title · Description · Budget · Duration · Category · Technology
                            </p>
                        )}
                    </div>
                )}

                {/* ════ STEP 2: PREVIEW ════ */}
                {step === 2 && (
                    <div className="fade-up">
                        <div className="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
                            <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
                            <div className="p-8">
                                <h2 className="mb-6 text-xl font-extrabold text-slate-950 dark:text-white"
                                    style={{ fontFamily: "'Playfair Display',serif" }}>
                                    📋 Review Your Project
                                </h2>
                                <div className="flex flex-col gap-4">

                                    {/* title */}
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                                        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">Project Title</div>
                                        <div className="text-lg font-bold text-slate-950 dark:text-white">{formData.title}</div>
                                    </div>

                                    {/* description */}
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                                        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">Description</div>
                                        <div className="text-sm leading-relaxed text-slate-600 dark:text-white/65">{formData.description}</div>
                                    </div>

                                    {/* stats grid */}
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        {[
                                            { label: "Budget", value: `₹${Number(formData.budget).toLocaleString()}`, color: "#166534", bg: "#F0FDF4" },
                                            { label: "Duration", value: `${formData.duration} days`, color: "#1D4ED8", bg: "#EFF6FF" },
                                            { label: "Category", value: formData.category, color: "#7C3AED", bg: "#FDF4FF" },
                                        ].map(s => (
                                            <div key={s.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-center dark:border-white/10 dark:bg-white/[0.04]">
                                                <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">{s.label}</div>
                                                <div className="text-sm font-extrabold text-slate-900 dark:text-cyan-200">{s.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* technologies */}
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                                        <div className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">Technologies</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedTechs.map(t => (
                                                <span key={t} className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                                                    style={{ background: `linear-gradient(135deg,${color.from},${color.to})` }}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* action buttons */}
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setStep(1)}
                                className="flex-1 cursor-pointer rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/75 dark:hover:bg-white/[0.09]">
                                ← Edit Details
                            </button>
                            <button type="submit"
                                className="flex-[2] py-3.5 rounded-2xl border-none font-bold text-sm text-white cursor-pointer transition-opacity hover:opacity-90"
                                style={{
                                    background: `linear-gradient(135deg,${color.from},${color.to})`,
                                    boxShadow: `0 8px 24px ${color.from}44`
                                }}>
                                🚀 Submit Project
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}

export default ListProject
