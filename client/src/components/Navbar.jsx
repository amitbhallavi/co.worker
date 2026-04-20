// ===== FILE: client/src/components/Navbar.jsx =====
import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logoutUser } from "../features/auth/authSlice"
import { getUnreadCount } from "../features/ChatsAndMessages/chatSlice"

// ── Brand ─────────────────────────────────────────────────
const Logo = () => (
    <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
        <div className="relative w-8 h-8 sm:w-9 sm:h-9">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow duration-300" />
            <span className="absolute inset-0 flex items-center justify-center text-white font-black text-sm sm:text-base leading-none" style={{ fontFamily: "Georgia, serif" }}>
                Co.
            </span>
        </div>
        <span className="hidden sm:block font-bold text-base sm:text-lg text-gray-900 tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Co</span>
            <span className="text-gray-800">.worker</span>
        </span>
    </Link>
)

// ── Unread Badge ───────────────────────────────────────────
const UnreadBadge = ({ count }) => {
    if (!count || count <= 0) return null
    return (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-md shadow-red-200 leading-none">
            {count > 9 ? "9+" : count}
        </span>
    )
}

// ── Messages Icon Button ───────────────────────────────────
const MessagesBtn = ({ unreadTotal }) => (
    <Link to="/chat" className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 text-gray-600 group">
        {/* Chat bubble SVG */}
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <UnreadBadge count={unreadTotal} />
    </Link>
)

// ── Find Talent dropdown data ──────────────────────────────
const TALENT_ITEMS = [
    { label: "Hire Developers", icon: "⚡", sub: "5,200+ experts", href: "/talent?cat=web", color: "from-blue-500 to-cyan-500", badge: null },
    { label: "Hire Designers", icon: "🎨", sub: "3,800+ experts", href: "/talent?cat=design", color: "from-violet-500 to-purple-500", badge: "Trending" },
    { label: "Hire Marketers", icon: "📈", sub: "2,400+ experts", href: "/talent?cat=marketing", color: "from-emerald-500 to-teal-500", badge: null },
    { label: "Hire AI/Data", icon: "🤖", sub: "1,900+ experts", href: "/talent?cat=ai", color: "from-orange-500 to-amber-500", badge: "Hot" },
    { label: "Hire Writers", icon: "✍️", sub: "1,200+ experts", href: "/talent?cat=writing", color: "from-rose-500 to-pink-500", badge: null },
    { label: "Hire Video Editors", icon: "🎬", sub: "900+ experts", href: "/talent?cat=video", color: "from-indigo-500 to-blue-500", badge: null },
]

const getInitials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U"

// ── Find Talent Mega Dropdown ──────────────────────────────
const TalentDropdown = ({ onClose }) => {
    const navigate = useNavigate()
    const [search, setSearch] = useState("")

    const handleSearch = (e) => {
        e.preventDefault()
        if (search.trim()) { navigate(`/talent?q=${encodeURIComponent(search.trim())}`); onClose() }
    }

    return (
        <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[540px] max-w-[96vw] z-50"
            style={{ animation: "dropIn .22s cubic-bezier(.34,1.56,.64,1) both" }}>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white border-l border-t border-gray-100 rounded-sm" />
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 relative overflow-hidden">
                    <div className="absolute w-28 h-28 rounded-full bg-white/10 -top-10 -right-8 pointer-events-none" />
                    <p className="text-white font-bold text-sm relative z-10">Find the right talent, fast</p>
                    <p className="text-blue-100 text-xs mt-0.5 relative z-10">10,000+ verified experts ready to start</p>
                </div>
                <div className="p-4">
                    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="e.g. React developer, UI designer..."
                                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400 text-gray-800" />
                        </div>
                        <button type="submit"
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:shadow-md hover:shadow-blue-200 hover:-translate-y-0.5 transition-all">
                            Search ↗
                        </button>
                    </form>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {TALENT_ITEMS.map((item) => (
                            <Link key={item.label} to={item.href} onClick={onClose}
                                className="group relative flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 hover:border-transparent transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
                                <span className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl`} />
                                <div className={`relative z-10 w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-sm flex-shrink-0 shadow-sm`}>
                                    {item.icon}
                                </div>
                                <div className="relative z-10 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-bold text-gray-800 group-hover:text-white transition-colors leading-tight truncate">{item.label}</p>
                                        {item.badge && (
                                            <span className="text-[9px] font-bold bg-orange-100 text-orange-600 group-hover:bg-white/25 group-hover:text-white px-1.5 py-0.5 rounded-full transition-colors flex-shrink-0">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 group-hover:text-white/80 transition-colors">{item.sub}</p>
                                </div>
                                <span className="relative z-10 ml-auto opacity-0 group-hover:opacity-100 text-white text-xs transition-opacity">→</span>
                            </Link>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Link to="/talent" onClick={onClose}
                            className="flex-1 text-center py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 transition-all">
                            Browse All Talent ↗
                        </Link>
                        <Link to="/browse-projects" onClick={onClose}
                            className="flex-1 text-center py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-100 hover:-translate-y-0.5 transition-all">
                            Browse Projects
                        </Link>
                    </div>
                    <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
                        {["Verified profiles", "Secure payments", "24/7 support"].map(t => (
                            <span key={t} className="text-[10px] text-gray-400 flex items-center gap-1">
                                <span className="text-emerald-500 font-bold">✓</span> {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── User Avatar + Dropdown ─────────────────────────────────
const UserMenu = ({ user, onLogout, unreadTotal }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const dashboardHref =
        user?.isAdmin ? "/admin/dashboard" :
            user?.isFreelancer ? "/auth/profile" :
                "/regularUser"

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen(v => !v)}
                className="flex items-center gap-2 group" aria-label="User menu" aria-expanded={open}>
                {user?.profilePic ? (
                    <img src={user.profilePic} alt={user.name}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover ring-2 ring-blue-200 group-hover:ring-blue-400 transition-all" />
                ) : (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm ring-2 ring-blue-200 group-hover:ring-blue-400 transition-all shadow-md">
                        {getInitials(user?.name)}
                    </div>
                )}
                <span className="hidden lg:block text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors max-w-24 truncate">
                    {user?.name?.split(" ")[0]}
                </span>
                <svg className={`hidden lg:block w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    style={{ animation: "dropIn .18s ease both" }}>
                    {/* User info */}
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        {(user?.isAdmin || user?.isFreelancer) && (
                            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                {user?.isAdmin ? "Admin" : "Freelancer"}
                            </span>
                        )}
                    </div>

                    <div className="py-1.5">
                        {[
                            { icon: "⚡", label: "Dashboard", href: dashboardHref },
                            { icon: "👤", label: "Profile", href: "/auth/profile" },
                            { icon: "🔍", label: "Find Work", href: "/find/work" },
                        ].map(item => (
                            <Link key={item.label} to={item.href} onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                <span className="text-base">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}

                        {/* ✅ Messages link with unread count */}
                        <Link to="/chat" onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <span className="text-base">💬</span>
                            Messages
                            {unreadTotal > 0 && (
                                <span className="ml-auto min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                    {unreadTotal > 9 ? "9+" : unreadTotal}
                                </span>
                            )}
                        </Link>
                    </div>

                    {user?.credits !== undefined && (
                        <div className="mx-3 mb-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 flex items-center justify-between">
                            <span className="text-xs text-gray-600">Credits</span>
                            <span className="text-sm font-black text-blue-700">⚡ {user.credits}</span>
                        </div>
                    )}

                    <div className="border-t border-gray-100 p-2">
                        <button onClick={() => { onLogout(); setOpen(false) }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium">
                            <span>🚪</span> Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Mobile Drawer ──────────────────────────────────────────
const MobileMenu = ({ open, onClose, user, onLogout, unreadTotal }) => {
    const [talentOpen, setTalentOpen] = useState(false)
    const location = useLocation()

    useEffect(() => { onClose() }, [location.pathname])
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [open])

    const dashboardHref =
        user?.isAdmin ? "/admin/dashboard" :
            user?.isFreelancer ? "/auth/profile" :
                "/regularUser"

    return (
        <>
            <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={onClose} aria-hidden="true" />

            <div className={`fixed top-0 right-0 h-full w-[320px] max-w-[88vw] bg-white z-50 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}
                role="dialog" aria-modal="true">

                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <Logo />
                    <button onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {user && (
                    <div className="mx-4 mt-4 p-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center gap-3">
                        {user?.profilePic ? (
                            <img src={user.profilePic} alt={user.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/40" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {getInitials(user?.name)}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                            <p className="text-blue-100 text-xs truncate">{user?.email}</p>
                        </div>
                        {user?.credits !== undefined && (
                            <div className="ml-auto flex-shrink-0 text-xs font-black text-white bg-white/20 px-2 py-1 rounded-lg">
                                ⚡{user.credits}
                            </div>
                        )}
                    </div>
                )}

                <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                    {user && (
                        <Link to={dashboardHref} onClick={onClose}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                            <span>⚡</span> Dashboard
                        </Link>
                    )}

                    <Link to="/find/work" onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <span className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-base">🔍</span>
                        Find Work
                    </Link>

                    {/* ✅ Messages with unread badge */}
                    <Link to="/chat" onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <span className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-base relative">
                            💬
                            {unreadTotal > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                    {unreadTotal > 9 ? "9+" : unreadTotal}
                                </span>
                            )}
                        </span>
                        Messages
                        {unreadTotal > 0 && (
                            <span className="ml-auto min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                {unreadTotal > 9 ? "9+" : unreadTotal}
                            </span>
                        )}
                    </Link>

                    {/* Find Talent expandable */}
                    <div>
                        <button onClick={() => setTalentOpen(v => !v)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                            <span className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-base">💼</span>
                            Find Talent
                            <svg className={`ml-auto w-4 h-4 text-gray-400 transition-transform duration-200 ${talentOpen ? "rotate-180" : ""}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${talentOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <div className="pl-4 mt-1 space-y-0.5">
                                {TALENT_ITEMS.map(item => (
                                    <Link key={item.label} to={item.href} onClick={onClose}
                                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-xs`}>
                                            {item.icon}
                                        </div>
                                        <span>{item.label}</span>
                                        {item.badge && (
                                            <span className="ml-auto text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Link to="/how-it-works" onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <span className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-base">💡</span>
                        How It Works
                    </Link>

                    <Link to="/pricing" onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <span className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-base">💰</span>
                        Pricing
                    </Link>

                    <div className="h-px bg-gray-100 my-2" />

                    {user?.isFreelancer && (
                        <Link to="/auth/profile" onClick={onClose}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <span className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center text-base">👤</span>
                            My Profile
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2.5">
                    {user ? (
                        <button onClick={() => { onLogout(); onClose() }}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100">
                            <span>🚪</span> Log Out
                        </button>
                    ) : (
                        <>
                            <Link to="/register" onClick={onClose} className="block">
                                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all hover:-translate-y-0.5">
                                    Sign Up — It's Free ✦
                                </button>
                            </Link>
                            <Link to="/login" onClick={onClose} className="block">
                                <button className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                                    Log In
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

// ══════════════════════════════════════════════════════════
// MAIN NAVBAR
// ══════════════════════════════════════════════════════════
const Navbar = () => {
    const { user } = useSelector(state => state.auth)
    const { unreadTotal } = useSelector(state => state.chat)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    const [talentOpen, setTalentOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const talentRef = useRef(null)
    const lastPathRef = useRef(location.pathname)

    // Close talent dropdown on route change
    useEffect(() => {
        if (location.pathname !== lastPathRef.current) {
            lastPathRef.current = location.pathname
            setTalentOpen(false)
        }
    }, [location.pathname])

    // Fetch unread count on mount + every 30s

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 10)
        window.addEventListener("scroll", handler, { passive: true })
        return () => window.removeEventListener("scroll", handler)
    }, [])

    const handleLogout = useCallback(() => {
        dispatch(logoutUser())
        navigate("/")
    }, [dispatch, navigate])

    const isActive = (href) => location.pathname === href

    return (
        <>
            <style>{`
                @keyframes dropIn {
                    from { opacity:0; transform:translateY(-8px) scale(.97); }
                    to   { opacity:1; transform:translateY(0)    scale(1);   }
                }
                @keyframes badgePop {
                    0%   { transform:scale(0); }
                    70%  { transform:scale(1.2); }
                    100% { transform:scale(1); }
                }
            `}</style>

            <header className={`sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b transition-all duration-300 ${scrolled ? "border-gray-200 shadow-md shadow-gray-100/80" : "border-gray-100"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16 md:h-[70px]">

                        {/* LEFT: Logo */}
                        <Logo />

                        {/* CENTER: Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                            <Link to="/find/work"
                                className={`px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive("/find/work") ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                                Find Work
                            </Link>

                            <div ref={talentRef} className="relative">
                                <button onClick={() => setTalentOpen(v => !v)}
                                    className={`flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${talentOpen ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    Find Talent
                                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${talentOpen ? "rotate-180 text-blue-600" : "text-gray-400"}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {talentOpen && <TalentDropdown onClose={() => setTalentOpen(false)} />}
                            </div>

                            <Link to="/how-it-works"
                                className={`px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive("/how-it-works") ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                                How It Works
                            </Link>

                            <Link to="/pricing"
                                className={`px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive("/pricing") ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                                Pricing
                            </Link>
                        </nav>

                        {/* RIGHT: Auth / User */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {user ? (
                                <>
                                    <span className="hidden sm:inline-flex items-center text-xs sm:text-sm text-gray-500">
                                        <span className="text-red-500 font-semibold mr-1">Welcome!</span>
                                        <span className="font-medium text-gray-800 max-w-24 truncate">{user.name?.split(" ")[0]}</span>
                                    </span>

                                    {/* ✅ Messages icon with live unread badge */}
                                    <MessagesBtn unreadTotal={unreadTotal} />

                                    <UserMenu user={user} onLogout={handleLogout} unreadTotal={unreadTotal} />
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="hidden sm:block">
                                        <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200">
                                            Log In
                                        </button>
                                    </Link>
                                    <Link to="/register">
                                        <button className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs sm:text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all duration-200">
                                            Sign Up <span className="hidden sm:inline text-blue-200">✦</span>
                                        </button>
                                    </Link>
                                </>
                            )}

                            {/* Hamburger */}
                            <button onClick={() => setMobileOpen(true)}
                                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors relative">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                {/* ✅ Unread dot on hamburger for mobile */}
                                {unreadTotal > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"
                                        style={{ animation: "badgePop .3s ease both" }} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <MobileMenu
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                user={user}
                onLogout={handleLogout}
                unreadTotal={unreadTotal}
            />
        </>
    )
}

export default Navbar