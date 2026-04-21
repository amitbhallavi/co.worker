// ===== FILE: client/src/components/Navbar.jsx =====
import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logoutUser, refreshUser } from "../features/auth/authSlice"
import { getUnreadCount } from "../features/ChatsAndMessages/chatSlice"
import { motion, AnimatePresence } from "framer-motion"

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const TALENT_CATEGORIES = [
    { label: "Developers", icon: "⚡", sub: "5,200+ experts", href: "/talent?cat=web", color: "from-blue-500 to-cyan-500", badge: null },
    { label: "Designers", icon: "🎨", sub: "3,800+ experts", href: "/talent?cat=design", color: "from-violet-500 to-purple-500", badge: "Trending" },
    { label: "Marketers", icon: "📈", sub: "2,400+ experts", href: "/talent?cat=marketing", color: "from-emerald-500 to-teal-500", badge: null },
    { label: "AI / Data", icon: "🤖", sub: "1,900+ experts", href: "/talent?cat=ai", color: "from-orange-500 to-amber-500", badge: "Hot" },
    { label: "Writers", icon: "✍️", sub: "1,200+ experts", href: "/talent?cat=writing", color: "from-rose-500 to-pink-500", badge: null },
    { label: "Video Editors", icon: "🎬", sub: "900+ experts", href: "/talent?cat=video", color: "from-indigo-500 to-blue-500", badge: null },
]

const NAV_LINKS = [
    { label: "Find Work", href: "/find/work" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
]

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U"

const useClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (e) => {
            if (ref.current && !ref.current.contains(e.target)) handler()
        }
        document.addEventListener("mousedown", listener)
        return () => document.removeEventListener("mousedown", listener)
    }, [ref, handler])
}

// ─────────────────────────────────────────────────────────────
// Logo
// ─────────────────────────────────────────────────────────────
const Logo = () => (
    <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0 select-none">
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0">
            <div className="absolute inset-0 rounded-[10px] bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/45 transition-all duration-300 group-hover:scale-105" />
            <span className="absolute inset-0 flex items-center justify-center text-white font-black text-sm sm:text-base" style={{ fontFamily: "Georgia, serif" }}>
                C.
            </span>
        </div>
        <span className="hidden sm:block font-bold text-[17px] tracking-tight leading-none">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Co</span>
            <span className="text-gray-800">.worker</span>
        </span>
    </Link>
)

// ─────────────────────────────────────────────────────────────
// Unread Badge
// ─────────────────────────────────────────────────────────────
const UnreadBadge = ({ count, pulse = false }) => {
    if (!count || count <= 0) return null
    return (
        <span className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-md leading-none ${pulse ? "animate-pulse" : ""}`}>
            {count > 9 ? "9+" : count}
        </span>
    )
}

// ─────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────
const Avatar = ({ user, size = "sm" }) => {
    const sz = size === "sm" ? "w-8 h-8 sm:w-9 sm:h-9" : "w-10 h-10"
    if (user?.profilePic) {
        return (
            <img src={user.profilePic} alt={user.name}
                className={`${sz} rounded-xl object-cover ring-2 ring-blue-200 group-hover:ring-blue-400 transition-all`} />
        )
    }
    return (
        <div className={`${sz} rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all shadow-sm`}>
            {getInitials(user?.name)}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Icon Button (reusable)
// ─────────────────────────────────────────────────────────────
const IconBtn = ({ to, onClick, children, badge, className = "", ariaLabel }) => {
    const base = `relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 ${className}`
    if (to) return (
        <Link to={to} aria-label={ariaLabel} className={base}>
            {children}
            <UnreadBadge count={badge} />
        </Link>
    )
    return (
        <button onClick={onClick} aria-label={ariaLabel} className={base}>
            {children}
            {badge > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
        </button>
    )
}

// ─────────────────────────────────────────────────────────────
// Find Talent Mega Dropdown
// ─────────────────────────────────────────────────────────────
const TalentDropdown = ({ onClose }) => {
    const navigate = useNavigate()
    const [query, setQuery] = useState("")

    const handleSearch = (e) => {
        e.preventDefault()
        if (query.trim()) {
            navigate(`/talent?q=${encodeURIComponent(query.trim())}`)
            onClose()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.34, 1.26, 0.64, 1] }}
            className="absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 w-[560px] max-w-[96vw] z-50 drop-shadow-2xl"
        >
            {/* Arrow tip */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white border-l border-t border-gray-100 rounded-sm z-10" />

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xl">
                {/* Header band */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 relative overflow-hidden">
                    <div className="absolute w-32 h-32 rounded-full bg-white/10 -top-12 -right-8 pointer-events-none" />
                    <div className="absolute w-20 h-20 rounded-full bg-white/5 bottom-0 left-16 pointer-events-none" />
                    <p className="text-white font-bold text-sm relative">Find the right talent, fast</p>
                    <p className="text-blue-100 text-xs mt-0.5 relative">10,000+ verified experts ready to start</p>
                </div>

                <div className="p-4">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">🔍</span>
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="e.g. React developer, UI designer..."
                                className="w-full pl-8 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white"
                            />
                        </div>
                        <button type="submit"
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:shadow-md hover:shadow-blue-200 hover:-translate-y-0.5 transition-all">
                            Search ↗
                        </button>
                    </form>

                    {/* Category grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {TALENT_CATEGORIES.map(item => (
                            <Link key={item.label} to={item.href} onClick={onClose}
                                className="group relative flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-transparent transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
                                <span className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl`} />
                                <div className={`relative z-10 w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-sm flex-shrink-0 shadow-sm`}>
                                    {item.icon}
                                </div>
                                <div className="relative z-10 min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-bold text-gray-800 group-hover:text-white transition-colors truncate">{item.label}</p>
                                        {item.badge && (
                                            <span className="text-[9px] font-bold bg-orange-100 text-orange-600 group-hover:bg-white/25 group-hover:text-white px-1.5 py-0.5 rounded-full transition-colors flex-shrink-0">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 group-hover:text-white/80 transition-colors">{item.sub}</p>
                                </div>
                                <span className="relative z-10 opacity-0 group-hover:opacity-100 text-white text-xs transition-opacity ml-auto">→</span>
                            </Link>
                        ))}
                    </div>

                    {/* CTA row */}
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

                    {/* Trust bar */}
                    <div className="flex justify-center gap-5 mt-3 pt-3 border-t border-gray-100">
                        {["Verified profiles", "Secure payments", "24/7 support"].map(t => (
                            <span key={t} className="text-[10px] text-gray-400 flex items-center gap-1">
                                <span className="text-emerald-500 font-bold">✓</span> {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────
// Profile Dropdown
// ─────────────────────────────────────────────────────────────
const ProfileDropdown = ({ user, onLogout, unreadTotal }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    useClickOutside(ref, () => setOpen(false))

    const dashboardHref = user?.isAdmin
        ? "/admin/dashboard"
        : user?.isFreelancer
            ? "/auth/profile"
            : "/regularUser"

    const menuItems = [
        { icon: "⚡", label: "Dashboard", href: dashboardHref },
        { icon: "👤", label: "Profile", href: "/auth/profile" },
        { icon: "🔍", label: "Find Work", href: "/find/work" },
    ]

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                aria-label="User menu"
                aria-expanded={open}
                className="flex items-center gap-2 group focus:outline-none"
            >
                <Avatar user={user} />
                <div className="hidden lg:flex flex-col items-start leading-none">
                    <span className="text-xs text-gray-500">Hey,</span>
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors max-w-20 truncate">
                        {user?.name?.split(" ")[0]}
                    </span>
                </div>
                <svg className={`hidden lg:block w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 top-[calc(100%+10px)] w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                        {/* User header */}
                        <div className="px-4 py-3.5 bg-gradient-to-br from-blue-50 to-cyan-50 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <Avatar user={user} size="md" />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                            {(user?.isAdmin || user?.isFreelancer) && (
                                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                    {user?.isAdmin ? "Admin" : "Freelancer"}
                                </span>
                            )}
                        </div>

                        {/* Credits pill */}
                        {user?.credits !== undefined && (
                            <div className="mx-3 mt-3 px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100 flex items-center justify-between">
                                <span className="text-xs text-gray-600 font-medium">Credits</span>
                                <span className="text-sm font-black text-amber-600">⚡ {user.credits}</span>
                            </div>
                        )}

                        {/* Menu items */}
                        <div className="py-2 px-1.5">
                            {menuItems.map(item => (
                                <Link key={item.label} to={item.href} onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">
                                    <span className="text-base">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            ))}

                            {/* Messages with badge */}
                            <Link to="/chat" onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">
                                <span className="text-base">💬</span>
                                <span className="font-medium">Messages</span>
                                {unreadTotal > 0 && (
                                    <span className="ml-auto min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                                        {unreadTotal > 9 ? "9+" : unreadTotal}
                                    </span>
                                )}
                            </Link>
                        </div>

                        <div className="border-t border-gray-100 p-2">
                            <button onClick={() => { onLogout(); setOpen(false) }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold">
                                <span>🚪</span> Log Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Desktop Nav Links
// ─────────────────────────────────────────────────────────────
const NavLinks = ({ isActive, talentOpen, onTalentToggle }) => (
    <nav className="hidden md:flex items-center gap-0.5">
        {NAV_LINKS.map(link => (
            <Link key={link.href} to={link.href}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(link.href)
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}>
                {link.label}
            </Link>
        ))}

        <button
            onClick={onTalentToggle}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${talentOpen ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
        >
            Find Talent
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${talentOpen ? "rotate-180 text-blue-600" : "text-gray-400"}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    </nav>
)

// ─────────────────────────────────────────────────────────────
// Mobile Menu Drawer
// ─────────────────────────────────────────────────────────────
const MobileMenu = ({ open, onClose, user, onLogout, unreadTotal }) => {
    const [talentOpen, setTalentOpen] = useState(false)
    const location = useLocation()

    // Close on route change
    useEffect(() => { onClose() }, [location.pathname])

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [open])

    const dashboardHref = user?.isAdmin
        ? "/admin/dashboard"
        : user?.isFreelancer
            ? "/auth/profile"
            : "/regularUser"

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Drawer */}
                    <motion.div
                        key="drawer"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-[310px] max-w-[88vw] bg-white z-50 shadow-2xl flex flex-col"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                    >
                        {/* Drawer header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                            <Logo />
                            <button
                                onClick={onClose}
                                aria-label="Close menu"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* User card */}
                        {user && (
                            <div className="mx-4 mt-4 p-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center gap-3 flex-shrink-0">
                                {user?.profilePic ? (
                                    <img src={user.profilePic} alt={user.name}
                                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/40 flex-shrink-0" />
                                ) : (
                                    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {getInitials(user?.name)}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                                    <p className="text-blue-100 text-xs truncate">{user?.email}</p>
                                </div>
                                {user?.credits !== undefined && (
                                    <div className="flex-shrink-0 text-xs font-black text-white bg-white/20 px-2.5 py-1.5 rounded-xl">
                                        ⚡{user.credits}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Nav items */}
                        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
                            {user && (
                                <Link to={dashboardHref} onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                                    <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">⚡</span>
                                    Dashboard
                                </Link>
                            )}

                            {NAV_LINKS.map(link => (
                                <Link key={link.href} to={link.href} onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                    <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-sm">
                                        {link.label === "Find Work" ? "🔍" : link.label === "How It Works" ? "💡" : "💰"}
                                    </span>
                                    {link.label}
                                </Link>
                            ))}

                            {/* Messages */}
                            <Link to="/chat" onClick={onClose}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                <span className="relative w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-sm">
                                    💬
                                    {unreadTotal > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                            {unreadTotal > 9 ? "9+" : unreadTotal}
                                        </span>
                                    )}
                                </span>
                                Messages
                                {unreadTotal > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                        {unreadTotal > 9 ? "9+" : unreadTotal}
                                    </span>
                                )}
                            </Link>

                            {/* Find Talent expandable */}
                            <div>
                                <button
                                    onClick={() => setTalentOpen(v => !v)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                >
                                    <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-sm">💼</span>
                                    Find Talent
                                    <svg className={`ml-auto w-4 h-4 text-gray-400 transition-transform duration-200 ${talentOpen ? "rotate-180" : ""}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <AnimatePresence>
                                    {talentOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.22 }}
                                            className="overflow-hidden pl-4 mt-0.5"
                                        >
                                            <div className="space-y-0.5 pb-1">
                                                {TALENT_CATEGORIES.map(item => (
                                                    <Link key={item.label} to={item.href} onClick={onClose}
                                                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-xs flex-shrink-0`}>
                                                            {item.icon}
                                                        </div>
                                                        <span className="font-medium">{item.label}</span>
                                                        {item.badge && (
                                                            <span className="ml-auto text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {user?.isFreelancer && (
                                <Link to="/auth/profile" onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                    <span className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center text-sm">👤</span>
                                    My Profile
                                </Link>
                            )}
                        </nav>

                        {/* Drawer footer */}
                        <div className="p-4 border-t border-gray-100 flex-shrink-0 space-y-2">
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
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// ─────────────────────────────────────────────────────────────
// MAIN NAVBAR
// ─────────────────────────────────────────────────────────────
const Navbar = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useSelector(s => s.auth)
    const { unreadTotal } = useSelector(s => s.chat)

    const [talentOpen, setTalentOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    const talentRef = useRef(null)

    // ── Refresh user data ──────────────────────────────────
    useEffect(() => {
        if (!user) return
        dispatch(refreshUser())
        const id = setInterval(() => dispatch(refreshUser()), 60_000)
        return () => clearInterval(id)
    }, [user?._id, dispatch])

    // ── Fetch unread on mount ──────────────────────────────
    useEffect(() => {
        if (user) dispatch(getUnreadCount())
    }, [user?._id, dispatch])

    // ── Close talent dropdown on route change ──────────────
    useEffect(() => { setTalentOpen(false) }, [location.pathname])

    // ── Scroll shadow ──────────────────────────────────────
    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 8)
        window.addEventListener("scroll", handler, { passive: true })
        return () => window.removeEventListener("scroll", handler)
    }, [])

    // ── Close talent dropdown on outside click ─────────────
    useClickOutside(talentRef, () => setTalentOpen(false))

    const handleLogout = useCallback(() => {
        dispatch(logoutUser())
        navigate("/")
    }, [dispatch, navigate])

    const isActive = (href) => location.pathname === href

    return (
        <>
            <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled
                    ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
                    : "bg-white/90 backdrop-blur-sm border-b border-gray-100"
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16">

                        {/* ── LEFT: Logo ─────────────────── */}
                        <Logo />

                        {/* ── CENTER: Desktop Nav ────────── */}
                        <div ref={talentRef} className="relative hidden md:flex items-center">
                            <NavLinks
                                isActive={isActive}
                                talentOpen={talentOpen}
                                onTalentToggle={() => setTalentOpen(v => !v)}
                            />
                            <AnimatePresence>
                                {talentOpen && <TalentDropdown onClose={() => setTalentOpen(false)} />}
                            </AnimatePresence>
                        </div>

                        {/* ── RIGHT: Actions ─────────────── */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            {user ? (
                                <>
                                    {/* Credits pill — hidden on xs */}
                                    {user.credits !== undefined && (
                                        <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl">
                                            <span className="text-amber-500 text-xs">⚡</span>
                                            <span className="text-xs font-bold text-amber-700">{user.credits}</span>
                                        </div>
                                    )}

                                    {/* Messages icon — hidden on mobile (visible sm+) */}
                                    <IconBtn to="/chat" badge={unreadTotal} ariaLabel="Messages" className="hidden sm:flex">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </IconBtn>

                                    {/* Profile dropdown */}
                                    <ProfileDropdown user={user} onLogout={handleLogout} unreadTotal={unreadTotal} />
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="hidden sm:block">
                                        <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all">
                                            Log In
                                        </button>
                                    </Link>
                                    <Link to="/register">
                                        <button className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs sm:text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all">
                                            Sign Up
                                            <span className="hidden sm:inline text-blue-200">✦</span>
                                        </button>
                                    </Link>
                                </>
                            )}

                            {/* ── Hamburger ─────────────── */}
                            <button
                                onClick={() => setMobileOpen(true)}
                                aria-label="Open navigation menu"
                                className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                {/* Unread dot on hamburger */}
                                {unreadTotal > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
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