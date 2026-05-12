// ===== FILE: client/src/components/Navbar.jsx =====
import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logoutUser, refreshUser } from "../features/auth/authSlice"
import { getUnreadCount } from "../features/ChatsAndMessages/chatSlice"
import CoworkerIcon from "./CoworkerIcon"
import ThemeToggle from "./ThemeToggle"

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

const MOBILE_NAV_LINKS = [
    { label: "Find Work", href: "/find/work", icon: "↗", sub: "Browse active freelancer jobs" },
    { label: "How It Works", href: "/how-it-works", icon: "◎", sub: "See the workflow before you start" },
    { label: "Pricing", href: "/pricing", icon: "₹", sub: "Compare free, pro, and elite plans" },
    { label: "Browse Projects", href: "/browse-projects", icon: "▣", sub: "Jump into open marketplace projects" },
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
        document.addEventListener("touchstart", listener, { passive: true })
        return () => {
            document.removeEventListener("mousedown", listener)
            document.removeEventListener("touchstart", listener)
        }
    }, [ref, handler])
}

const getDashboardHref = (user) => (
    user?.isAdmin
        ? "/admin/dashboard"
        : user?.isFreelancer
            ? "/auth/profile"
            : "/regularUser"
)

const getProfileHref = (user) => (
    user?.isFreelancer && user?._id
        ? `/profile/${user._id}`
        : getDashboardHref(user)
)

const getRoleLabel = (user) => (
    user?.isAdmin
        ? "Admin access"
        : user?.isFreelancer
            ? "Freelancer mode"
            : "Client account"
)

// ─────────────────────────────────────────────────────────────
// Logo
// ─────────────────────────────────────────────────────────────
const Logo = () => (
    <Link to="/" className="group flex items-center gap-3 flex-shrink-0 select-none">
        <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-[20px] bg-cyan-300/35 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative rounded-[18px] border border-sky-100/80 dark:border-sky-400/40 bg-white/80 dark:bg-slate-900/60 p-1.5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] dark:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_22px_50px_-28px_rgba(43,196,212,0.42)]">
                <CoworkerIcon size={30} />
            </div>
        </div>
        <div className="flex flex-col leading-none">
            <span className="auth-serif text-[17px] font-semibold tracking-[-0.04em] text-slate-900 dark:text-white sm:text-[18px]">
                <span className="text-slate-900 dark:text-slate-100">Co</span>
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">.</span>
                <span className="font-medium text-slate-700 dark:text-slate-400">worker</span>
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-700/70 dark:text-sky-400/50 sm:block">
                Secure freelance workspace
            </span>
        </div>
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
                className={`${sz} rounded-xl object-cover ring-2 ring-blue-200 dark:ring-blue-900 group-hover:ring-blue-400 dark:group-hover:ring-blue-700 transition-all`} />
        )
    }
    return (
        <div className={`${sz} rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm ring-2 ring-blue-100 dark:ring-blue-900 group-hover:ring-blue-300 dark:group-hover:ring-blue-700 transition-all shadow-sm`}>
            {getInitials(user?.name)}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Icon Button (reusable)
// ─────────────────────────────────────────────────────────────
const IconBtn = ({ to, onClick, children, badge, className = "", ariaLabel }) => {
    const base = `relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-blue-50 dark:hover:bg-slate-800 ${className}`
    if (to) return (
        <Link to={to} aria-label={ariaLabel} className={base}>
            {children}
            <UnreadBadge count={badge} />
        </Link>
    )
    return (
        <button type="button" onClick={onClick} aria-label={ariaLabel} className={base}>
            {children}
            {badge > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950" />
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
        <div className="absolute top-[calc(100%+14px)] left-1/2 z-50 w-[560px] max-w-[96vw] -translate-x-1/2 drop-shadow-2xl">
            {/* Arrow tip */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white dark:bg-slate-900 border-l border-t border-gray-100 dark:border-slate-700 rounded-sm z-10" />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-2xl">
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
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs pointer-events-none">🔍</span>
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="e.g. React developer, UI designer..."
                                className="w-full pl-8 pr-3 py-2.5 text-xs border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-400 dark:focus:border-cyan-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-cyan-900 transition-all text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700"
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
                                className="group relative flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-transparent transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
                                <span className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl`} />
                                <div className={`relative z-10 w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-sm flex-shrink-0 shadow-sm`}>
                                    {item.icon}
                                </div>
                                <div className="relative z-10 min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-bold text-gray-800 dark:text-slate-200 group-hover:text-white transition-colors truncate">{item.label}</p>
                                        {item.badge && (
                                            <span className="text-[9px] font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 group-hover:bg-white/25 group-hover:text-white px-1.5 py-0.5 rounded-full transition-colors flex-shrink-0">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 dark:text-slate-400 group-hover:text-white/80 transition-colors">{item.sub}</p>
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
                            className="flex-1 text-center py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 hover:-translate-y-0.5 transition-all">
                            Browse Projects
                        </Link>
                    </div>

                    {/* Trust bar */}
                    <div className="flex justify-center gap-5 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                        {["Verified profiles", "Secure payments", "24/7 support"].map(t => (
                            <span key={t} className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                <span className="text-emerald-500 dark:text-emerald-400 font-bold">✓</span> {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Profile Dropdown
// ─────────────────────────────────────────────────────────────
const ProfileDropdown = ({ user, onLogout, unreadTotal }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    useClickOutside(ref, () => setOpen(false))

    const dashboardHref = getDashboardHref(user)
    const profileHref = getProfileHref(user)

    const menuItems = [
        { icon: "⚡", label: "Dashboard", href: dashboardHref },
        { icon: "🔍", label: "Find Work", href: "/find/work" },
    ]

    if (profileHref !== dashboardHref) {
        menuItems.splice(1, 0, { icon: "👤", label: "Profile", href: profileHref })
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                aria-label="User menu"
                aria-expanded={open}
                className="flex items-center gap-2 group focus:outline-none"
            >
                <Avatar user={user} />
                <div className="hidden lg:flex flex-col items-start leading-none">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Hey,</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors max-w-20 truncate">
                        {user?.name?.split(" ")[0]}
                    </span>
                </div>
                <svg className={`hidden lg:block w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-60 overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
                    {/* User header */}
                    <div className="border-b border-gray-100 dark:border-slate-700 bg-gradient-to-br from-blue-50 dark:from-slate-800 to-cyan-50 dark:to-slate-900 px-4 py-3.5">
                        <div className="flex items-center gap-3">
                            <Avatar user={user} size="md" />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{user?.name}</p>
                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                            </div>
                        </div>
                        <span className="mt-2 inline-block rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                            {getRoleLabel(user)}
                        </span>
                    </div>

                    {/* Credits pill */}
                    {user?.credits !== undefined && (
                        <div className="mx-3 mt-3 flex items-center justify-between rounded-xl border border-amber-100 dark:border-amber-900/40 bg-gradient-to-r from-amber-50 dark:from-amber-900/20 to-yellow-50 dark:to-yellow-900/20 px-3 py-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Credits</span>
                            <span className="text-sm font-black text-amber-600 dark:text-amber-400">⚡ {user.credits}</span>
                        </div>
                    )}

                    {/* Menu items */}
                    <div className="px-1.5 py-2">
                        {menuItems.map(item => (
                            <Link key={item.label} to={item.href} onClick={() => setOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-slate-200 transition-colors hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-cyan-400">
                                <span className="text-base">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}

                        {/* Messages with badge */}
                        <Link to="/chat" onClick={() => setOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-slate-200 transition-colors hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-cyan-400">
                            <span className="text-base">💬</span>
                            <span className="font-medium">Messages</span>
                            {unreadTotal > 0 && (
                                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                                    {unreadTotal > 9 ? "9+" : unreadTotal}
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className="border-t border-gray-100 dark:border-slate-700 p-2">
                        <button type="button" onClick={() => { onLogout(); setOpen(false) }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20">
                            <span>🚪</span> Log Out
                        </button>
                    </div>
                </div>
            )}
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
                        ? "bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-400 font-semibold"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
                    }`}>
                {link.label}
            </Link>
        ))}

        <button
            type="button"
            onClick={onTalentToggle}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${talentOpen ? "bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-400 font-semibold" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
                }`}
        >
            Find Talent
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${talentOpen ? "rotate-180 text-blue-600 dark:text-cyan-400" : "text-gray-400 dark:text-gray-500"}`}
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
    const previousPathname = useRef(location.pathname)

    // Close on route change
    useEffect(() => {
        if (open && previousPathname.current !== location.pathname) {
            onClose()
        }
        previousPathname.current = location.pathname
    }, [location.pathname, open, onClose])

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [open])

    useEffect(() => {
        if (!open) return

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [open, onClose])

    if (!open) {
        return null
    }

    const dashboardHref = getDashboardHref(user)
    const profileHref = getProfileHref(user)
    const showSeparateProfileLink = Boolean(user && profileHref !== dashboardHref)

    return (
        <>
            <div
                className="fixed inset-0 z-[70] bg-slate-950/35"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                className="fixed inset-y-0 right-0 z-[80] w-full max-w-sm"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
            >
                <div className="relative flex h-full flex-col overflow-hidden border-l border-slate-200 dark:border-slate-700 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_58%,#eef6ff_100%)] dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 shadow-[0_35px_100px_-40px_rgba(15,23,42,0.48)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_58%)]" />

                    <div className="relative flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-400">Navigation</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Move faster on mobile</p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close menu"
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="relative flex-1 overflow-y-auto px-4 pb-6 pt-4">
                        {user ? (
                            <div className="rounded-[28px] bg-slate-950 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 p-4 text-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.7)]">
                                <div className="flex items-start gap-3">
                                    {user?.profilePic ? (
                                        <img
                                            src={user.profilePic}
                                            alt={user.name}
                                            className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white/15 dark:ring-white/20"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold text-white">
                                            {getInitials(user?.name)}
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-base font-semibold">{user?.name}</p>
                                        <p className="truncate text-xs text-slate-300 dark:text-slate-400">{user?.email}</p>
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                                            <span className="rounded-full bg-white/10 dark:bg-white/5 px-2.5 py-1 text-slate-100 dark:text-slate-200">
                                                {getRoleLabel(user)}
                                            </span>
                                            {user?.credits !== undefined && (
                                                <span className="rounded-full bg-amber-400/15 dark:bg-amber-400/10 px-2.5 py-1 text-amber-200 dark:text-amber-300">
                                                    ⚡ {user.credits} credits
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <Link
                                        to={dashboardHref}
                                        onClick={onClose}
                                        className="rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-white/5 px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 dark:hover:bg-white/10"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to={showSeparateProfileLink ? profileHref : "/chat"}
                                        onClick={onClose}
                                        className="rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-white/5 px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 dark:hover:bg-white/10"
                                    >
                                        {showSeparateProfileLink
                                            ? "Profile"
                                            : `Messages ${unreadTotal > 0 ? `(${unreadTotal > 9 ? "9+" : unreadTotal})` : ""}`}
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-[28px] border border-sky-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800/50 p-4 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.3)]">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-400">Freelance command center</p>
                                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                                    Hire faster or start earning.
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    Projects, verified talent, secure payouts, and one clean mobile navigation that does not get in your way.
                                </p>
                            </div>
                        )}

                        <div className="mt-5 space-y-5">
                            <section>
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Main routes</p>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">Fast access</span>
                                </div>

                                <div className="space-y-2">
                                    {user && (
                                        <Link
                                            to={dashboardHref}
                                            onClick={onClose}
                                            className="flex items-center gap-3 rounded-[24px] border border-sky-100 dark:border-slate-700 bg-sky-50/80 dark:bg-slate-800/60 px-4 py-3.5 transition-colors hover:bg-sky-100/80 dark:hover:bg-slate-700"
                                        >
                                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 text-sm font-bold text-sky-700 dark:text-cyan-400 shadow-sm">
                                                ⚡
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Dashboard</p>
                                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">Open your workspace overview</p>
                                            </div>
                                        </Link>
                                    )}

                                    {MOBILE_NAV_LINKS.map((link) => (
                                        <Link
                                            key={link.href}
                                            to={link.href}
                                            onClick={onClose}
                                            className="flex items-center gap-3 rounded-[24px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.35)] transition-colors hover:border-sky-200 dark:hover:border-sky-600 hover:bg-sky-50/60 dark:hover:bg-slate-700"
                                        >
                                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 dark:bg-slate-700 text-sm font-semibold text-white dark:text-slate-200">
                                                {link.icon}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{link.label}</p>
                                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{link.sub}</p>
                                            </div>
                                        </Link>
                                    ))}

                                    {user && (
                                        <Link
                                            to="/chat"
                                            onClick={onClose}
                                            className="flex items-center gap-3 rounded-[24px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.35)] transition-colors hover:border-sky-200 dark:hover:border-sky-600 hover:bg-sky-50/60 dark:hover:bg-slate-700"
                                        >
                                            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 dark:bg-slate-700 text-sm font-semibold text-white dark:text-slate-200">
                                                ✉
                                                {unreadTotal > 0 && (
                                                    <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1 text-[10px] font-bold leading-[18px] text-white">
                                                        {unreadTotal > 9 ? "9+" : unreadTotal}
                                                    </span>
                                                )}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Messages</p>
                                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">Open chat without hunting through the UI</p>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-[28px] border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 p-3 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)]">
                                <button
                                    type="button"
                                    onClick={() => setTalentOpen(v => !v)}
                                    className="flex w-full items-center gap-3 rounded-[22px] px-3 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                                        💼
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Find talent</p>
                                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">Open specialist categories</p>
                                    </div>
                                    <svg
                                        className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${talentOpen ? "rotate-180" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {talentOpen && (
                                    <div className="grid grid-cols-2 gap-2 px-1 pb-1 pt-2">
                                        {TALENT_CATEGORIES.map(item => (
                                            <Link
                                                key={item.label}
                                                to={item.href}
                                                onClick={onClose}
                                                className="rounded-[20px] border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700 p-3 transition-colors hover:border-sky-200 dark:hover:border-sky-600 hover:bg-sky-50 dark:hover:bg-slate-600"
                                            >
                                                <div className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-sm shadow-sm`}>
                                                    {item.icon}
                                                </div>
                                                <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                                                <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{item.sub}</p>
                                                {item.badge && (
                                                    <span className="mt-2 inline-flex rounded-full bg-orange-100 dark:bg-orange-900/40 px-2 py-1 text-[10px] font-bold text-orange-600 dark:text-orange-300">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {showSeparateProfileLink && (
                                <section className="rounded-[28px] border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 p-3 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)]">
                                    <Link
                                        to={profileHref}
                                        onClick={onClose}
                                        className="flex items-center gap-3 rounded-[22px] px-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                                    >
                                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-900/40 text-sm text-violet-600 dark:text-violet-400">
                                            👤
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">My profile</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Open your public freelancer profile</p>
                                        </div>
                                    </Link>
                                </section>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-slate-200/80 dark:border-slate-700 bg-white/85 dark:bg-slate-800 p-4">
                        {user ? (
                            <button
                                type="button"
                                onClick={() => { onLogout(); onClose() }}
                                className="w-full rounded-[22px] border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30"
                            >
                                Log Out
                            </button>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    to="/login"
                                    onClick={onClose}
                                    className="w-full rounded-[22px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={onClose}
                                    className="w-full rounded-[22px] bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_18px_36px_-22px_rgba(14,116,144,0.62)] transition-transform active:scale-[0.99]"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
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
        if (!user?.token) return
        dispatch(refreshUser())
        const id = window.setInterval(() => dispatch(refreshUser()), 5 * 60_000)
        return () => window.clearInterval(id)
    }, [user?.token, dispatch])

    // ── Fetch unread on mount ──────────────────────────────
    useEffect(() => {
        if (!user?.token) return
        dispatch(getUnreadCount())
    }, [user?.token, dispatch])

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

    const handleCloseMobileMenu = useCallback(() => {
        setMobileOpen(false)
    }, [])

    const isActive = (href) => location.pathname === href

    return (
        <>
            <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled
                    ? "bg-white/95 dark:bg-slate-950/95 border-b border-gray-200 dark:border-slate-700 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]"
                    : "bg-white/95 dark:bg-slate-950/95 border-b border-gray-100 dark:border-slate-800"
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
                            {talentOpen && <TalentDropdown onClose={() => setTalentOpen(false)} />}
                        </div>

                        {/* ── RIGHT: Actions ─────────────── */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            {user ? (
                                <>
                                    {/* Credits pill — hidden on xs */}
                                    {user.credits !== undefined && (
                                        <div className="hidden items-center gap-1 rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 sm:flex">
                                            <span className="text-amber-500 dark:text-amber-400 text-xs">⚡</span>
                                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{user.credits}</span>
                                        </div>
                                    )}

                                    {/* Theme toggle */}
                                    <ThemeToggle />

                                    {/* Messages icon — hidden on mobile (visible sm+) */}
                                    <IconBtn to="/chat" badge={unreadTotal} ariaLabel="Messages" className="hidden md:flex">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </IconBtn>

                                    {/* Profile dropdown */}
                                    <div className="hidden md:block">
                                        <ProfileDropdown user={user} onLogout={handleLogout} unreadTotal={unreadTotal} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Theme toggle */}
                                    <ThemeToggle />

                                    <Link
                                        to="/login"
                                        className="hidden rounded-xl px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 transition-all hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-cyan-400 md:block"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="hidden items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-2 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 sm:px-5 sm:py-2.5 sm:text-sm md:flex"
                                    >
                                        Sign Up
                                        <span className="hidden sm:inline text-blue-200">✦</span>
                                    </Link>
                                </>
                            )}

                            {/* ── Hamburger ─────────────── */}
                            <button
                                type="button"
                                onClick={() => setMobileOpen(v => !v)}
                                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                                aria-expanded={mobileOpen}
                                className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border transition-colors md:hidden ${
                                    mobileOpen
                                        ? "border-sky-200 dark:border-sky-600 bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-cyan-400"
                                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                            >
                                <span className="relative h-4 w-4">
                                    <span className={`absolute left-0 top-0 h-0.5 w-4 rounded-full bg-current transition-all duration-200 ${mobileOpen ? "top-[7px] rotate-45" : ""}`} />
                                    <span className={`absolute left-0 top-[7px] h-0.5 w-4 rounded-full bg-current transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
                                    <span className={`absolute left-0 top-[14px] h-0.5 w-4 rounded-full bg-current transition-all duration-200 ${mobileOpen ? "top-[7px] -rotate-45" : ""}`} />
                                </span>
                                {/* Unread dot on hamburger */}
                                {unreadTotal > 0 && (
                                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white dark:border-slate-900 bg-red-500" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {mobileOpen && (
                <MobileMenu
                    open={mobileOpen}
                    onClose={handleCloseMobileMenu}
                    user={user}
                    onLogout={handleLogout}
                    unreadTotal={unreadTotal}
                />
            )}
        </>
    )
}

export default Navbar
