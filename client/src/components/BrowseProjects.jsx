import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getProjects } from "../features/project/projectSlice"

// ── Constants ──────────────────────────────────────────────
const categoryColors = {
    "Web Development": { bg: "#EFF6FF", text: "#1D4ED8" },
    "Web Developments": { bg: "#EFF6FF", text: "#1D4ED8" },
    "UI/UX Design": { bg: "#FDF4FF", text: "#7C3AED" },
    "Backend Dev": { bg: "#F0FDF4", text: "#166534" },
    "Mobile Dev": { bg: "#FFF7ED", text: "#C2410C" },
    "Data Science": { bg: "#F0F9FF", text: "#0369A1" },
    "Full Stack": { bg: "#FFF1F2", text: "#BE123C" },
    "Full-stack Developer mern": { bg: "#FFF1F2", text: "#BE123C" },
    "WordPress": { bg: "#F7FEE7", text: "#4D7C0F" },
    "Graphic Design": { bg: "#FFFBEB", text: "#D97706" },
    "Content Writing": { bg: "#F8FAFC", text: "#475569" },
}

const statusColors = {
    pending: { bg: "#FFFBEB", text: "#D97706", dot: "#F59E0B" },
    active: { bg: "#F0FDF4", text: "#166534", dot: "#22C55E" },
    completed: { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B7FF5" },
    cancelled: { bg: "#FFF1F2", text: "#BE123C", dot: "#F43F5E" },
}

const categories = ["All", "Web Development", "UI/UX Design", "Backend Dev", "Mobile Dev", "Data Science", "Full Stack", "WordPress", "Graphic Design", "Content Writing"]
const statuses = ["All", "pending", "active", "completed", "cancelled"]
const sortOptions = ["Latest", "Budget: High to Low", "Budget: Low to High", "Duration: Short First"]

const timeAgo = (dateStr) => {
    if (!dateStr) return ""
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

// ── Skeleton ───────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-100 rounded-lg w-2/5 mb-3" />
        <div className="h-4 bg-gray-100 rounded-lg w-4/5 mb-3" />
        <div className="h-3 bg-gray-100 rounded-lg w-3/5 mb-3" />
        <div className="h-4 bg-gray-100 rounded-lg w-full mb-3" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
    </div>
)

// ── Project Card ───────────────────────────────────────────
const ProjectCard = ({ project, index }) => {
    const [saved, setSaved] = useState(false)
    const [hovered, setHovered] = useState(false)

    const cat = categoryColors[project.category] || { bg: "#F8FAFC", text: "#475569" }
    const status = statusColors[project.status] || statusColors.pending
    const skills = project.technology
        ? project.technology.split(/[,/]/).map(s => s.trim()).filter(Boolean)
        : []

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="bg-white rounded-2xl p-4 sm:p-6 relative overflow-hidden cursor-pointer transition-all duration-300"
            style={{
                border: `1.5px solid ${hovered ? "#3B7FF5" : "#E5E7EB"}`,
                boxShadow: hovered ? "0 8px 32px rgba(59,127,245,0.13)" : "0 2px 8px rgba(0,0,0,0.04)",
                transform: hovered ? "translateY(-3px)" : "translateY(0)",
                animation: `fadeUp 0.5s ease ${index * 0.07}s both`,
            }}
        >
            {/* top accent on hover */}
            {hovered && (
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                    style={{ background: "linear-gradient(135deg,#3B7FF5,#2BC4D4)" }} />
            )}

            {/* Header */}
            <div className="flex justify-between items-start mb-2.5">
                <div className="flex-1 min-w-0">
                    {/* badges */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                            style={{ background: cat.bg, color: cat.text }}>
                            {project.category || "General"}
                        </span>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                            style={{ background: status.bg, color: status.text }}>
                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: status.dot }} />
                            {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : "Pending"}
                        </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-2">
                        {project.title}
                    </h3>
                </div>
                <button
                    onClick={e => { e.stopPropagation(); setSaved(!saved) }}
                    className="ml-3 flex-shrink-0 px-2.5 py-1.5 rounded-lg border text-base transition-all duration-200 cursor-pointer"
                    style={{
                        background: saved ? "#EFF6FF" : "transparent",
                        borderColor: saved ? "#3B7FF5" : "#E5E7EB"
                    }}
                >{saved ? "🔖" : "🤍"}</button>
            </div>

            {/* Description */}
            {project.description && (
                <p className="text-xs sm:text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2">
                    {project.description}
                </p>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {skills.map(s => (
                        <span key={s} className="bg-gray-50 border border-gray-200 text-gray-700 text-[11px] sm:text-xs px-2.5 py-0.5 rounded-md">
                            {s}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <div className="text-[10px] text-gray-400 mb-0.5">Budget</div>
                        <div className="text-sm sm:text-base font-bold text-gray-900">
                            ₹{project.budget?.toLocaleString() ?? "—"}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 mb-0.5">Duration</div>
                        <div className="text-sm font-semibold text-gray-700">
                            {project.duration ? `${project.duration} days` : "—"}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 mb-0.5">Posted</div>
                        <div className="text-xs text-gray-500">{timeAgo(project.createdAt)}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {project.user?.name && (
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-gray-500">by {project.user.name}</div>
                            {project.user.isFreelancer && (
                                <div className="text-[11px] text-blue-500 font-semibold">✓ Freelancer</div>
                            )}
                        </div>
                    )}
                    <button
                        className="px-4 py-2 rounded-xl border-[1.5px] border-blue-500 text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap"
                        style={{
                            background: hovered ? "linear-gradient(135deg,#3B7FF5,#2BC4D4)" : "white",
                            color: hovered ? "white" : "#3B7FF5"
                        }}
                    >
                        Apply Now
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── MAIN PAGE ──────────────────────────────────────────────
const BrowseProjects = () => {
    const dispatch = useDispatch()
    const { listedProjects, projectLoading, projectError, projectErrorMessage } = useSelector(state => state.project)
    const { user } = useSelector(state => state.auth)

    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("All")
    const [status, setStatus] = useState("All")
    const [sortBy, setSortBy] = useState("Latest")
    const [page, setPage] = useState(1)
    const [sidebarOpen, setSidebarOpen] = useState(false)  // mobile sidebar toggle
    const PER_PAGE = 6

    useEffect(() => {
        if (user?._id) dispatch(getProjects())
    }, [dispatch, user?._id])

    const allProjects = listedProjects
        ? listedProjects.filter(p => p.user?._id === user?._id)
        : []

    const hasData = allProjects.length > 0

    const filtered = allProjects
        .filter(p => {
            const matchCat = category === "All" || p.category === category
            const matchStatus = status === "All" || p.status === status
            const matchSearch = !search ||
                p.title?.toLowerCase().includes(search.toLowerCase()) ||
                p.technology?.toLowerCase().includes(search.toLowerCase()) ||
                p.description?.toLowerCase().includes(search.toLowerCase())
            return matchCat && matchStatus && matchSearch
        })
        .sort((a, b) => {
            if (sortBy === "Budget: High to Low") return (b.budget || 0) - (a.budget || 0)
            if (sortBy === "Budget: Low to High") return (a.budget || 0) - (b.budget || 0)
            if (sortBy === "Duration: Short First") return (a.duration || 0) - (b.duration || 0)
            return new Date(b.createdAt) - new Date(a.createdAt)
        })

    const totalPages = Math.ceil(filtered.length / PER_PAGE)
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>
            <style>{`
                @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes ping     { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.9);opacity:0} }
                @keyframes orbFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(35px)} }
            `}</style>

            {/* Floating bg orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute w-[600px] h-[600px] rounded-full -top-48 -right-24"
                    style={{ background: "radial-gradient(circle,rgba(59,127,245,0.06) 0%,transparent 70%)", animation: "orbFloat 8s ease-in-out infinite" }} />
                <div className="absolute w-[400px] h-[400px] rounded-full bottom-[10%] -left-24"
                    style={{ background: "radial-gradient(circle,rgba(43,196,212,0.05) 0%,transparent 70%)", animation: "orbFloat 10s ease-in-out infinite reverse" }} />
            </div>

            {/* ── HERO ── */}
            <div className="relative z-10 border-b border-gray-200 px-4 sm:px-8 lg:px-10 pt-8 sm:pt-12 pb-8"
                style={{ background: "linear-gradient(135deg,#EFF6FF 0%,#F0FDFF 50%,#F8FAFC 100%)" }}>

                {/* ping badge */}
                <div className="inline-flex items-center gap-2 bg-white border border-blue-100 rounded-full px-4 py-1.5 mb-5 shadow-sm">
                    <span className="relative inline-block w-2 h-2">
                        <span className="absolute inset-0 rounded-full bg-blue-500" style={{ animation: "ping 1.5s ease infinite" }} />
                        <span className="absolute inset-0 rounded-full bg-blue-500" />
                    </span>
                    <span className="text-xs sm:text-sm text-blue-500 font-semibold">
                        {allProjects.length} live projects available
                    </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
                    Browse Projects
                </h1>
                <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-lg">
                    Real projects posted by real clients — find your perfect match.
                </p>

                {/* Search bar */}
                <div className="flex gap-3 max-w-xl">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none">🔍</span>
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1) }}
                            placeholder="Search by title, skill, technology..."
                            className="w-full pl-11 pr-4 py-3 text-sm border-[1.5px] border-gray-200 rounded-xl outline-none bg-white shadow-sm transition-all duration-200 box-border"
                            style={{ fontFamily: "inherit" }}
                            onFocus={e => e.target.style.borderColor = "#3B7FF5"}
                            onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                        />
                    </div>
                    <button
                        onClick={() => setPage(1)}
                        className="px-5 sm:px-7 py-3 rounded-xl text-sm font-semibold text-white border-none cursor-pointer whitespace-nowrap"
                        style={{ background: "linear-gradient(135deg,#3B7FF5,#2BC4D4)" }}
                    >
                        Search
                    </button>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 sm:gap-8 mt-7">
                    {[
                        { label: "Total Projects", value: allProjects.length },
                        { label: "Active Now", value: allProjects.filter(p => p.status === "active").length },
                        { label: "Pending", value: allProjects.filter(p => p.status === "pending").length },
                        { label: "Completed", value: allProjects.filter(p => p.status === "completed").length },
                    ].map((s, i) => (
                        <div key={i} style={{ animation: `fadeUp 0.6s ease ${i * 0.1}s both` }}>
                            <div className="text-2xl sm:text-3xl font-extrabold"
                                style={{ background: "linear-gradient(135deg,#3B7FF5,#2BC4D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                {s.value}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── MAIN ── */}
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 relative z-10">

                {/* Filter bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    {/* Status pills — scroll on mobile */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-gray-500 font-semibold mr-1 shrink-0">Status:</span>
                        <div className="flex gap-1.5 flex-wrap">
                            {statuses.map(s => (
                                <button key={s}
                                    onClick={() => { setStatus(s); setPage(1) }}
                                    className="px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 capitalize whitespace-nowrap"
                                    style={{
                                        background: status === s ? "linear-gradient(135deg,#3B7FF5,#2BC4D4)" : "white",
                                        color: status === s ? "white" : "#374151",
                                        borderColor: status === s ? "transparent" : "#E5E7EB",
                                    }}
                                >{s}</button>
                            ))}
                        </div>
                    </div>

                    {/* Sort + mobile sidebar toggle */}
                    <div className="flex items-center gap-2">
                        {/* Mobile: category filter toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 cursor-pointer"
                        >
                            ☰ Category
                        </button>
                        <span className="text-sm text-gray-500">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={e => { setSortBy(e.target.value); setPage(1) }}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-700 bg-white cursor-pointer outline-none"
                            style={{ fontFamily: "inherit" }}
                        >
                            {sortOptions.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* Mobile sidebar drawer */}
                {sidebarOpen && (
                    <div className="lg:hidden bg-white rounded-2xl border border-gray-200 p-5 mb-5 shadow-md">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</span>
                            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 text-sm cursor-pointer bg-transparent border-none">✕</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button key={cat}
                                    onClick={() => { setCategory(cat); setPage(1); setSidebarOpen(false) }}
                                    className="px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-150"
                                    style={{
                                        background: category === cat ? "#EFF6FF" : "transparent",
                                        color: category === cat ? "#1D4ED8" : "#374151",
                                        borderColor: category === cat ? "#BFDBFE" : "#E5E7EB",
                                    }}
                                >{cat}</button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-6">

                    {/* ── SIDEBAR — desktop only ── */}
                    <div className="hidden lg:block w-52 shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-6">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                Category
                            </div>
                            {categories.map(cat => (
                                <button key={cat}
                                    onClick={() => { setCategory(cat); setPage(1) }}
                                    className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl border-none cursor-pointer transition-all duration-150 text-left mb-0.5"
                                    style={{
                                        background: category === cat ? "#EFF6FF" : "transparent",
                                        color: category === cat ? "#3B7FF5" : "#374151",
                                        fontSize: "13px",
                                        fontWeight: category === cat ? 600 : 400,
                                        fontFamily: "inherit"
                                    }}
                                >
                                    <span>{cat}</span>
                                    {category === cat && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── CARDS AREA ── */}
                    <div className="flex-1 min-w-0">

                        {/* Result count */}
                        <div className="text-sm text-gray-700 mb-4">
                            Showing <strong>{paginated.length}</strong> of <strong>{filtered.length}</strong> projects
                            {category !== "All" && <span className="text-blue-500"> · {category}</span>}
                            {status !== "All" && <span className="text-amber-500"> · {status}</span>}
                        </div>

                        {/* Skeleton */}
                        {projectLoading && !hasData && (
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                            </div>
                        )}

                        {/* Error */}
                        {projectError && !hasData && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                                <div className="text-4xl mb-3">⚠️</div>
                                <div className="text-base font-semibold text-red-700 mb-1.5">Failed to load projects</div>
                                <div className="text-sm text-gray-400">{projectErrorMessage}</div>
                            </div>
                        )}

                        {/* Cards */}
                        {hasData && paginated.length > 0 && (
                            <div className="flex flex-col gap-4">
                                {paginated.map((p, i) => (
                                    <ProjectCard key={p._id} project={p} index={i} />
                                ))}
                            </div>
                        )}

                        {/* Empty — no data */}
                        {!projectLoading && !hasData && !projectError && (
                            <div className="bg-white rounded-2xl border border-gray-200 py-16 px-5 text-center">
                                <div className="text-5xl mb-3">🔍</div>
                                <div className="text-lg font-semibold text-gray-700 mb-1.5">No projects found</div>
                                <div className="text-sm text-gray-400">Try different keywords, category or status</div>
                            </div>
                        )}

                        {/* Empty — filter */}
                        {hasData && paginated.length === 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 py-16 px-5 text-center">
                                <div className="text-5xl mb-3">🔍</div>
                                <div className="text-lg font-semibold text-gray-700 mb-1.5">No matching projects</div>
                                <div className="text-sm text-gray-400">Try different keywords, category or status</div>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-base transition-all"
                                    style={{ color: page === 1 ? "#D1D5DB" : "#374151", cursor: page === 1 ? "not-allowed" : "pointer" }}
                                >←</button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                    <button key={n}
                                        onClick={() => setPage(n)}
                                        className="w-9 h-9 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-150"
                                        style={{
                                            background: page === n ? "linear-gradient(135deg,#3B7FF5,#2BC4D4)" : "white",
                                            color: page === n ? "white" : "#374151",
                                            borderColor: page === n ? "#3B7FF5" : "#E5E7EB",
                                            fontWeight: page === n ? 700 : 400,
                                            fontFamily: "inherit"
                                        }}
                                    >{n}</button>
                                ))}

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-base transition-all"
                                    style={{ color: page === totalPages ? "#D1D5DB" : "#374151", cursor: page === totalPages ? "not-allowed" : "pointer" }}
                                >→</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BrowseProjects