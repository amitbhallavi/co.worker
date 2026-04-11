import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logoutUser } from '../features/auth/authSlice'
// import CoLogo from '../assets/coworker-outline.svg'
// import Logo from './Logo'
// import CoworkerIcon from './CoworkerIcon'
import { CoLogo } from './CoLogo'


// ── Find Talent categories ──────────────────────────────────────────────────
const CATEGORIES = [
    {
        label: 'Web Development',
        sub: '5,200+ experts',
        icon: '⚡',
        bg: 'from-blue-500 to-cyan-500',
        light: 'bg-blue-50',
        text: 'text-blue-600',
        link: '/talent?cat=web',
    },
    {
        label: 'Design & Creative',
        sub: '3,800+ experts',
        icon: '🎨',
        bg: 'from-violet-500 to-purple-500',
        light: 'bg-violet-50',
        text: 'text-violet-600',
        link: '/talent?cat=design',
    },
    {
        label: 'Marketing & Sales',
        sub: '2,400+ experts',
        icon: '📈',
        bg: 'from-emerald-500 to-teal-500',
        light: 'bg-emerald-50',
        text: 'text-emerald-600',
        link: '/talent?cat=marketing',
    },
    {
        label: 'Data & AI',
        sub: '1,900+ experts',
        icon: '🤖',
        bg: 'from-orange-500 to-amber-500',
        light: 'bg-orange-50',
        text: 'text-orange-600',
        link: '/talent?cat=ai',
    },
]

const TICKER = [
    'Rahul hired a React Dev',
    'Priya posted a UI project',
    'Amit found a Node.js expert',
    'Sara hired a logo designer',
    'Dev team hired in 3 hrs',
]

// ── Main Component ──────────────────────────────────────────────────────────
const Navbar = () => {
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [open, setOpen] = useState(false)
    const [hlIdx, setHlIdx] = useState(0)
    const [progress, setProgress] = useState(0)
    const popupRef = useRef(null)
    const btnRef = useRef(null)
    const loopRef = useRef(null)
    const progressRef = useRef(null)

    const DURATION = 1800
    const TICK = 40

    // ── Loop logic ────────────────────────────────────────────────────────
    const startLoop = () => {
        clearInterval(loopRef.current)
        clearInterval(progressRef.current)
        setProgress(0)
        let idx = 0
        let prog = 0
        setHlIdx(0)

        progressRef.current = setInterval(() => {
            prog += (TICK / DURATION) * 100
            if (prog >= 100) prog = 100
            setProgress(prog)
        }, TICK)

        loopRef.current = setInterval(() => {
            idx = (idx + 1) % CATEGORIES.length
            setHlIdx(idx)
            prog = 0
            setProgress(0)
        }, DURATION)
    }

    const stopLoop = () => {
        clearInterval(loopRef.current)
        clearInterval(progressRef.current)
    }

    useEffect(() => {
        if (open) startLoop()
        else stopLoop()
        return () => stopLoop()
    }, [open])

    // ── Outside click to close ────────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (
                popupRef.current && !popupRef.current.contains(e.target) &&
                btnRef.current && !btnRef.current.contains(e.target)
            ) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleLogout = () => {
        dispatch(logoutUser())
        navigate('/')
    }

    return (
        <>
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-12 sm:h-14 md:h-16 lg:h-20">

                        {/* ── Logo + Mobile Link ── */}
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                            <Link to="/" className='flex items-center justify-center gap-0'>

                                {/* <div className='w-10 h-10  '>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                        <defs>
                                            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stop-color="#3B7FF5" />
                                                <stop offset="100%" stop-color="#2BC4D4" />
                                            </linearGradient>
                                        </defs>
                                        <circle cx="16" cy="16" r="16" fill="url(#g)" />
                                        <text x="16" y="21" font-family="Georgia, serif" font-size="20" font-weight="800" fill="white" text-anchor="middle">Co.</text>
                                    </svg>
                                </div> */}

                                {/* <Logo size={4} />   */}
                                <CoLogo/>


                                {/* <img className='' src={CoLogo} alt="logo" /> */}

                                {/* <div className="w-25 h-12 sm:w-20 sm:h-7 md:w-24 md:h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center cursor-pointer">
                                <h1 className="text-white text-[10px] sm:text-xs md:text-sm lg:text-base">
                                Co.worker
                                </h1>
                                </div> */}

                            </Link>

                            {/* Mobile only */}
                            <Link to="/talent">
                                <h1 className="block md:hidden ml-2 text-[10px] sm:text-xs text-black hover:text-blue-600 transition">
                                    Find Talent
                                </h1>
                            </Link>
                        </div>

                        {/* ── Desktop Nav ── */}
                        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8 relative">
                            <Link to={"/find/work"} className="text-sm md:text-base text-gray-700 hover:text-blue-600">
                                Find Work
                            </Link>

                            {/* ── Find Talent Button ── */}
                            <button
                                ref={btnRef}
                                onClick={() => setOpen(v => !v)}
                                className={`relative text-sm md:text-base font-medium transition-colors duration-200 flex items-center gap-1
                                    ${open ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                            >
                                Find Talent
                                {/* chevron */}
                                <svg
                                    className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180 text-blue-600' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>

                                {/* active underline */}
                                {open && (
                                    <span className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white border-l border-t border-gray-200 z-[60]" />
                                )}
                            </button>

                            <Link className="text-sm md:text-base text-gray-700 hover:text-blue-600">
                                How It Works
                            </Link>
                            <Link className="text-sm md:text-base text-gray-700 hover:text-blue-600">
                                Pricing
                            </Link>
                        </nav>

                        {/* ── User Section ── */}
                        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                            {user ? (
                                <>
                                    <Link
                                        to={
                                            user?.isAdmin
                                                ? '/admin/dashboard'
                                                : user?.isFreelancer
                                                    ? '/auth/profile'
                                                    : '/regularUser'
                                        }
                                    >
                                        <button className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-xl text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:scale-105">
                                            <span className="text-red-500">Welcome!</span> {user.name}
                                        </button>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-700 text-white rounded-lg font-medium ml-1 sm:ml-2 md:ml-3 lg:ml-4 xl:ml-6 2xl:ml-8 px-2 py-1 text-[10px] sm:px-3 sm:py-1 sm:text-xs md:px-4 md:py-2 md:text-sm lg:px-5 lg:py-2 lg:text-base xl:px-6 xl:py-3 xl:text-lg 2xl:px-8 2xl:py-3 2xl:text-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                                    >
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login">
                                        <button className="text-xs sm:text-sm md:text-base text-gray-700 hover:text-blue-600">
                                            Log In
                                        </button>
                                    </Link>
                                    <Link to="/register">
                                        <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm md:px-5 md:text-base lg:px-6 lg:text-lg rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200">
                                            Sign Up
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ══════════════════════════════════════════════════════════════
                FIND TALENT POPUP DROPDOWN
            ══════════════════════════════════════════════════════════════ */}
            {open && (
                <div
                    ref={popupRef}
                    className="fixed top-[62px] sm:top-[70px] md:top-[78px] lg:top-[88px] left-1/2 -translate-x-1/2 w-[480px] max-w-[95vw] z-[55]"
                    style={{ animation: 'ftDropIn 0.28s cubic-bezier(0.34,1.4,0.64,1) both' }}
                >
                    <style>{`
                        @keyframes ftDropIn {
                            from { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.97); }
                            to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1);    }
                        }
                        @keyframes ftTicker {
                            from { transform: translateX(0); }
                            to   { transform: translateX(-50%); }
                        }
                        @keyframes ftBlink {
                            0%,100% { opacity:1; } 50% { opacity:0.2; }
                        }
                    `}</style>

                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

                        {/* ── Header ── */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-4 relative overflow-hidden">
                            <div className="absolute w-24 h-24 rounded-full bg-white/10 -top-8 -right-6" />
                            <p className="text-white font-bold text-[15px]">Find the right talent, fast</p>
                            <p className="text-blue-100 text-[11px] mt-0.5">10,000+ verified experts ready to start today</p>
                        </div>

                        {/* ── Live Ticker ── */}
                        <div className="bg-blue-50 border-b border-blue-100 py-1.5 overflow-hidden">
                            <div
                                className="flex w-max"
                                style={{ animation: 'ftTicker 16s linear infinite' }}
                            >
                                {[...TICKER, ...TICKER].map((t, i) => (
                                    <span
                                        key={i}
                                        className="text-[10px] text-blue-700 font-semibold px-4 whitespace-nowrap flex items-center gap-1.5"
                                    >
                                        <span
                                            className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"
                                            style={{ animation: 'ftBlink 1.4s ease-in-out infinite' }}
                                        />
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="p-4">

                            {/* ── Progress bar ── */}
                            <div className="h-0.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-none"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            {/* ── Category Grid ── */}
                            <div className="grid grid-cols-2 gap-2.5 mb-3">
                                {CATEGORIES.map((cat, i) => (
                                    <Link
                                        key={cat.label}
                                        to={cat.link}
                                        onClick={() => setOpen(false)}
                                        className={`
                                            group flex items-center gap-3 p-3 rounded-xl border-[1.5px] transition-all duration-200 cursor-pointer
                                            ${hlIdx === i
                                                ? `border-transparent bg-gradient-to-r ${cat.bg} shadow-md scale-[1.02]`
                                                : 'border-gray-100 hover:border-transparent hover:scale-[1.01]'
                                            }
                                        `}
                                        style={hlIdx !== i ? {} : {}}
                                    >
                                        {/* icon */}
                                        <div className={`
                                            w-8 h-8 min-w-[32px] rounded-lg flex items-center justify-center text-sm transition-all duration-200
                                            ${hlIdx === i
                                                ? 'bg-white/25'
                                                : `${cat.light} group-hover:bg-white/20`
                                            }
                                        `}>
                                            {cat.icon}
                                        </div>

                                        {/* text */}
                                        <div className="min-w-0">
                                            <p className={`text-[12px] font-bold leading-tight transition-colors duration-200
                                                ${hlIdx === i ? 'text-white' : 'text-gray-800 group-hover:text-white'}`}>
                                                {cat.label}
                                            </p>
                                            <p className={`text-[10px] transition-colors duration-200
                                                ${hlIdx === i ? 'text-white/80' : 'text-gray-500 group-hover:text-white/80'}`}>
                                                {cat.sub}
                                            </p>
                                        </div>

                                        {/* arrow */}
                                        <span className={`ml-auto text-[12px] transition-all duration-200
                                            ${hlIdx === i ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 text-white'}`}>
                                            →
                                        </span>

                                        {/* hover gradient (non-highlighted) */}
                                        {hlIdx !== i && (
                                            <span className={`absolute inset-0 rounded-xl bg-gradient-to-r ${cat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10`} />
                                        )}
                                    </Link>
                                ))}
                            </div>

                            {/* ── Search bar ── */}
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="e.g. React developer, logo designer..."
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-800 placeholder-gray-400"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            navigate(`/talent?q=${e.target.value.trim()}`)
                                            setOpen(false)
                                        }
                                    }}
                                />
                                <button
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-[12px] font-bold hover:-translate-y-0.5 hover:shadow-md transition-all"
                                    onClick={(e) => {
                                        const input = e.target.closest('div').querySelector('input')
                                        if (input?.value.trim()) {
                                            navigate(`/talent?q=${input.value.trim()}`)
                                            setOpen(false)
                                        }
                                    }}
                                >
                                    Search ↗
                                </button>
                            </div>

                            {/* ── CTA Row ── */}
                            <div className="flex gap-2">
                                <Link
                                    to="/post-project"
                                    onClick={() => setOpen(false)}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-2.5 rounded-xl text-[12px] font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 transition-all"
                                >
                                    Post a Job ↗
                                </Link>
                                <Link
                                    to="/talent"
                                    onClick={() => setOpen(false)}
                                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 text-center py-2.5 rounded-xl text-[12px] font-semibold hover:bg-gray-100 hover:-translate-y-0.5 transition-all"
                                >
                                    Browse All
                                </Link>
                            </div>

                            {/* ── Trust Row ── */}
                            <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
                                {['Verified profiles', 'Secure payments', '24/7 support'].map(t => (
                                    <span key={t} className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <span className="text-green-500">✓</span> {t}
                                    </span>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar