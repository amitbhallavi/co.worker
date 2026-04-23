// ===== FILE: client/src/components/Navbar.jsx =====
import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logoutUser, refreshUser } from "../features/auth/authSlice"
import { getUnreadCount } from "../features/ChatsAndMessages/chatSlice"
import CoworkerIcon from "./CoworkerIcon"

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
            <div className="relative rounded-[18px] border border-sky-100/80 bg-white/80 p-1.5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_22px_50px_-28px_rgba(43,196,212,0.42)]">
                <CoworkerIcon size={30} />
            </div>
        </div>
        <div className="flex flex-col leading-none">
            <span className="auth-serif text-[17px] font-semibold tracking-[-0.04em] text-slate-900 sm:text-[18px]">
                <span className="text-slate-900">Co</span>
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">.</span>
                <span className="font-medium text-slate-700">worker</span>
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-700/70 sm:block">
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
        <button type="button" onClick={onClick} aria-label={ariaLabel} className={base}>
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
        <div className="absolute top-[calc(100%+14px)] left-1/2 z-50 w-[560px] max-w-[96vw] -translate-x-1/2 drop-shadow-2xl">
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

            {open && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-60 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                    {/* User header */}
                    <div className="border-b border-gray-100 bg-gradient-to-br from-blue-50 to-cyan-50 px-4 py-3.5">
                        <div className="flex items-center gap-3">
                            <Avatar user={user} size="md" />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-gray-900">{user?.name}</p>
                                <p className="truncate text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                        <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            {getRoleLabel(user)}
                        </span>
                    </div>

                    {/* Credits pill */}
                    {user?.credits !== undefined && (
                        <div className="mx-3 mt-3 flex items-center justify-between rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2">
                            <span className="text-xs font-medium text-gray-600">Credits</span>
                            <span className="text-sm font-black text-amber-600">⚡ {user.credits}</span>
                        </div>
                    )}

                    {/* Menu items */}
                    <div className="px-1.5 py-2">
                        {menuItems.map(item => (
                            <Link key={item.label} to={item.href} onClick={() => setOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700">
                                <span className="text-base">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}

                        {/* Messages with badge */}
                        <Link to="/chat" onClick={() => setOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700">
                            <span className="text-base">💬</span>
                            <span className="font-medium">Messages</span>
                            {unreadTotal > 0 && (
                                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                                    {unreadTotal > 9 ? "9+" : unreadTotal}
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className="border-t border-gray-100 p-2">
                        <button type="button" onClick={() => { onLogout(); setOpen(false) }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">
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
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}>
                {link.label}
            </Link>
        ))}

        <button
            type="button"
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
        if (!open) {
            setTalentOpen(false)
            return
        }

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
                <div className="relative flex h-full flex-col overflow-hidden border-l border-slate-200/80 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_58%,#eef6ff_100%)] shadow-[0_35px_100px_-40px_rgba(15,23,42,0.48)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_58%)]" />

                    <div className="relative flex items-center justify-between border-b border-slate-200/80 px-4 py-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">Navigation</p>
                            <p className="mt-1 text-sm text-slate-500">Move faster on mobile</p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close menu"
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="relative flex-1 overflow-y-auto px-4 pb-6 pt-4">
                        {user ? (
                            <div className="rounded-[28px] bg-slate-950 p-4 text-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.7)]">
                                <div className="flex items-start gap-3">
                                    {user?.profilePic ? (
                                        <img
                                            src={user.profilePic}
                                            alt={user.name}
                                            className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white/15"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold text-white">
                                            {getInitials(user?.name)}
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-base font-semibold">{user?.name}</p>
                                        <p className="truncate text-xs text-slate-300">{user?.email}</p>
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                                            <span className="rounded-full bg-white/10 px-2.5 py-1 text-slate-100">
                                                {getRoleLabel(user)}
                                            </span>
                                            {user?.credits !== undefined && (
                                                <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-amber-200">
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
                                        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to={showSeparateProfileLink ? profileHref : "/chat"}
                                        onClick={onClose}
                                        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                                    >
                                        {showSeparateProfileLink
                                            ? "Profile"
                                            : `Messages ${unreadTotal > 0 ? `(${unreadTotal > 9 ? "9+" : unreadTotal})` : ""}`}
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-[28px] border border-sky-100 bg-white/90 p-4 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.3)]">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">Freelance command center</p>
                                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                                    Hire faster or start earning.
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Projects, verified talent, secure payouts, and one clean mobile navigation that does not get in your way.
                                </p>
                            </div>
                        )}

                        <div className="mt-5 space-y-5">
                            <section>
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Main routes</p>
                                    <span className="text-xs text-slate-400">Fast access</span>
                                </div>

                                <div className="space-y-2">
                                    {user && (
                                        <Link
                                            to={dashboardHref}
                                            onClick={onClose}
                                            className="flex items-center gap-3 rounded-[24px] border border-sky-100 bg-sky-50/80 px-4 py-3.5 transition-colors hover:bg-sky-100/80"
                                        >
                                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-bold text-sky-700 shadow-sm">
                                                ⚡
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-900">Dashboard</p>
                                                <p className="truncate text-xs text-slate-500">Open your workspace overview</p>
                                            </div>
                                        </Link>
                                    )}

                                    {MOBILE_NAV_LINKS.map((link) => (
                                        <Link
                                            key={link.href}
                                            to={link.href}
                                            onClick={onClose}
                                            className="flex items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-3.5 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.35)] transition-colors hover:border-sky-200 hover:bg-sky-50/60"
                                        >
                                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                                                {link.icon}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-900">{link.label}</p>
                                                <p className="truncate text-xs text-slate-500">{link.sub}</p>
                                            </div>
                                        </Link>
                                    ))}

                                    {user && (
                                        <Link
                                            to="/chat"
                                            onClick={onClose}
                                            className="flex items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-3.5 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.35)] transition-colors hover:border-sky-200 hover:bg-sky-50/60"
                                        >
                                            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                                                ✉
                                                {unreadTotal > 0 && (
                                                    <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1 text-[10px] font-bold leading-[18px] text-white">
                                                        {unreadTotal > 9 ? "9+" : unreadTotal}
                                                    </span>
                                                )}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-900">Messages</p>
                                                <p className="truncate text-xs text-slate-500">Open chat without hunting through the UI</p>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-[28px] border border-slate-200/80 bg-white/80 p-3 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)]">
                                <button
                                    type="button"
                                    onClick={() => setTalentOpen(v => !v)}
                                    className="flex w-full items-center gap-3 rounded-[22px] px-3 py-3 text-left transition-colors hover:bg-slate-50"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                                        💼
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-900">Find talent</p>
                                        <p className="truncate text-xs text-slate-500">Open specialist categories</p>
                                    </div>
                                    <svg
                                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${talentOpen ? "rotate-180" : ""}`}
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
                                                className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-3 transition-colors hover:border-sky-200 hover:bg-sky-50"
                                            >
                                                <div className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-sm shadow-sm`}>
                                                    {item.icon}
                                                </div>
                                                <p className="mt-3 text-sm font-semibold text-slate-900">{item.label}</p>
                                                <p className="mt-1 text-[11px] leading-5 text-slate-500">{item.sub}</p>
                                                {item.badge && (
                                                    <span className="mt-2 inline-flex rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-600">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {showSeparateProfileLink && (
                                <section className="rounded-[28px] border border-slate-200/80 bg-white/80 p-3 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)]">
                                    <Link
                                        to={profileHref}
                                        onClick={onClose}
                                        className="flex items-center gap-3 rounded-[22px] px-3 py-3 transition-colors hover:bg-slate-50"
                                    >
                                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-sm text-violet-600">
                                            👤
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">My profile</p>
                                            <p className="text-xs text-slate-500">Open your public freelancer profile</p>
                                        </div>
                                    </Link>
                                </section>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-slate-200/80 bg-white/85 p-4">
                        {user ? (
                            <button
                                type="button"
                                onClick={() => { onLogout(); onClose() }}
                                className="w-full rounded-[22px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                            >
                                Log Out
                            </button>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    to="/login"
                                    onClick={onClose}
                                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
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
                    ? "bg-white/95 border-b border-gray-200 shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
                    : "bg-white/95 border-b border-gray-100"
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
                                        <div className="hidden items-center gap-1 rounded-xl border border-amber-100 bg-amber-50 px-3 py-1.5 sm:flex">
                                            <span className="text-amber-500 text-xs">⚡</span>
                                            <span className="text-xs font-bold text-amber-700">{user.credits}</span>
                                        </div>
                                    )}

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
                                    <Link
                                        to="/login"
                                        className="hidden rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-700 md:block"
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
                                        ? "border-sky-200 bg-sky-50 text-sky-700"
                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                <span className="relative h-4 w-4">
                                    <span className={`absolute left-0 top-0 h-0.5 w-4 rounded-full bg-current transition-all duration-200 ${mobileOpen ? "top-[7px] rotate-45" : ""}`} />
                                    <span className={`absolute left-0 top-[7px] h-0.5 w-4 rounded-full bg-current transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
                                    <span className={`absolute left-0 top-[14px] h-0.5 w-4 rounded-full bg-current transition-all duration-200 ${mobileOpen ? "top-[7px] -rotate-45" : ""}`} />
                                </span>
                                {/* Unread dot on hamburger */}
                                {unreadTotal > 0 && (
                                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white bg-red-500" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <MobileMenu
                open={mobileOpen}
                onClose={handleCloseMobileMenu}
                user={user}
                onLogout={handleLogout}
                unreadTotal={unreadTotal}
            />
        </>
    )
}

export default Navbar
