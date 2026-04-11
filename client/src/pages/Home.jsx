import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

// ── Typewriter words ──────────────────────────────────────────────────────────
const TYPEWRITER_WORDS = [
    { text: 'Freelancers', color: 'from-blue-600 to-cyan-600' },
    { text: 'Web Developers', color: 'from-blue-600 to-violet-600' },
    { text: 'Designers', color: 'from-emerald-500 to-teal-600' },
    { text: 'Marketers', color: 'from-orange-500 to-amber-500' },
    { text: 'Data Experts', color: 'from-pink-500 to-rose-500' },
]

// ── How It Works steps ────────────────────────────────────────────────────────
const STEPS = [
    {
        num: '1', title: 'Post Your Project',
        desc: 'Describe your project requirements and set your budget. It takes less than 5 minutes.',
        gradient: 'from-blue-500 to-cyan-500',
        ping: 'bg-cyan-400',
        light: 'from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        ring: 'ring-blue-400',
        icon: (
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        num: '2', title: 'Review Proposals',
        desc: 'Receive competitive bids from talented freelancers. Compare profiles and ratings.',
        gradient: 'from-emerald-500 to-teal-500',
        ping: 'bg-teal-400',
        light: 'from-emerald-50 to-teal-50',
        border: 'border-emerald-200',
        ring: 'ring-emerald-400',
        icon: (
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
    },
    {
        num: '3', title: 'Get It Done',
        desc: "Work with your chosen freelancer. Pay securely when you're 100% satisfied.",
        gradient: 'from-orange-500 to-amber-500',
        ping: 'bg-amber-400',
        light: 'from-orange-50 to-amber-50',
        border: 'border-orange-200',
        ring: 'ring-orange-400',
        icon: (
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
        ),
    },
]

// ── Hero cards ────────────────────────────────────────────────────────────────
const HERO_CARDS = [
    {
        id: 0, title: 'Web Development', sub: '5,200+ experts available', gradient: 'from-blue-500 to-cyan-500', bgLight: 'from-blue-50 to-cyan-50', border: 'border-blue-100', ring: 'ring-blue-300',
        icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    },
    {
        id: 1, title: 'Design & Creative', sub: '3,800+ experts available', gradient: 'from-emerald-500 to-teal-500', bgLight: 'from-emerald-50 to-teal-50', border: 'border-emerald-100', ring: 'ring-emerald-300',
        icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
    },
    {
        id: 2, title: 'Marketing & Sales', sub: '2,400+ experts available', gradient: 'from-orange-500 to-amber-500', bgLight: 'from-orange-50 to-amber-50', border: 'border-orange-100', ring: 'ring-orange-300',
        icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
    },
]

// ── Browse categories ─────────────────────────────────────────────────────────
const BROWSE_CATS = [
    { label: 'Development', count: '5,200', gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-100', ring: 'ring-blue-400', icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
    { label: 'Design', count: '3,800', gradient: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-100', ring: 'ring-emerald-400', icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { label: 'Writing', count: '1,200', gradient: 'from-orange-500 to-amber-500', bg: 'from-orange-50 to-amber-50', border: 'border-orange-100', ring: 'ring-orange-400', icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { label: 'Video', count: '890', gradient: 'from-pink-500 to-rose-500', bg: 'from-pink-50 to-rose-50', border: 'border-pink-100', ring: 'ring-pink-400', icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg> },
    { label: 'Audio', count: '650', gradient: 'from-violet-500 to-purple-500', bg: 'from-violet-50 to-purple-50', border: 'border-violet-100', ring: 'ring-violet-400', icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> },
    { label: 'Marketing', count: '2,400', gradient: 'from-sky-500 to-blue-500', bg: 'from-sky-50 to-blue-50', border: 'border-sky-100', ring: 'ring-sky-400', icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
]

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(words, { typeSpeed = 80, deleteSpeed = 40, pauseMs = 1600 } = {}) {
    const [displayed, setDisplayed] = useState('')
    const [wordIdx, setWordIdx] = useState(0)
    const [phase, setPhase] = useState('typing')

    useEffect(() => {

        const word = words[wordIdx].text
        let t
        if (phase === 'typing') {
            if (displayed.length < word.length)
                t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), typeSpeed)
            else
                t = setTimeout(() => setPhase('pause'), pauseMs)
        } else if (phase === 'pause') {
            setPhase('deleting')
        } else {
            if (displayed.length > 0)
                t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), deleteSpeed)
            else { setWordIdx(i => (i + 1) % words.length); setPhase('typing') }
        }
        return () => clearTimeout(t)
    }, [displayed, phase, wordIdx])

    return { displayed, wordIdx, phase }
}

// ── Shared infinity loop hook ─────────────────────────────────────────────────
function useInfinityLoop(length, duration = 2000) {
    const [hlIdx, setHlIdx] = useState(0)
    const [progress, setProgress] = useState(0)
    const loopRef = useRef(null)
    const progressRef = useRef(null)
    const TICK = 40

    const start = (startIdx = 0) => {
        clearInterval(loopRef.current)
        clearInterval(progressRef.current)
        let idx = startIdx, prog = 0
        setHlIdx(idx); setProgress(0)
        progressRef.current = setInterval(() => {
            prog += (TICK / duration) * 100
            if (prog >= 100) prog = 100
            setProgress(prog)
        }, TICK)
        loopRef.current = setInterval(() => {
            idx = (idx + 1) % length; setHlIdx(idx); prog = 0; setProgress(0)
        }, duration)
    }

    useEffect(() => { start(0); return () => { clearInterval(loopRef.current); clearInterval(progressRef.current) } }, [])
    return { hlIdx, progress, jumpTo: start }
}

const Stars = () => (
    <div className="flex items-center space-x-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
        ))}
    </div>
)

// ════════════════════════════════════════════════════════════════════════════
const Home = () => {

    const { displayed, wordIdx, phase } = useTypewriter(TYPEWRITER_WORDS, { typeSpeed: 75, deleteSpeed: 38, pauseMs: 1800 })
    const hero = useInfinityLoop(HERO_CARDS.length, 2000)
    const browse = useInfinityLoop(BROWSE_CATS.length, 1600)
    const steps = useInfinityLoop(STEPS.length, 2200)   // ← How It Works loop
    const user = JSON.parse(localStorage.getItem('user'))

    const currentWord = TYPEWRITER_WORDS[wordIdx]
    const showCursor = phase === 'typing' || phase === 'pause'

    // connecting line progress: fills 0→100 as current step plays, then jumps
    const lineProgress = steps.progress

    return (
        <>
            <style>{`
        @keyframes fadeInUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn   { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
        @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes cursorBlink{ 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes floatUp   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes wordSlideIn{ from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stepPulse { 0%{box-shadow:0 0 0 0 rgba(99,102,241,.5)} 70%{box-shadow:0 0 0 16px rgba(99,102,241,0)} 100%{box-shadow:0 0 0 0 rgba(99,102,241,0)} }
        @keyframes checkPop  { 0%{transform:scale(0) rotate(-45deg);opacity:0} 60%{transform:scale(1.2) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes cardSlide { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        .fade-up-1{animation:fadeInUp .6s ease both .10s}
        .fade-up-2{animation:fadeInUp .6s ease both .25s}
        .fade-up-3{animation:fadeInUp .6s ease both .40s}
        .fade-up-4{animation:fadeInUp .6s ease both .55s}
        .scale-in {animation:scaleIn  .55s ease both .30s}
        .float-1  {animation:floatUp 3.5s ease-in-out infinite}
        .float-2  {animation:floatUp 3.5s ease-in-out infinite 1.7s}

        .tw-cursor{display:inline-block;width:3px;height:.85em;border-radius:2px;background:currentColor;margin-left:2px;vertical-align:middle;animation:cursorBlink .75s step-end infinite}
        .tw-word{position:relative;display:inline-block}
        .tw-word::after{content:'';position:absolute;bottom:-4px;left:0;width:100%;height:3px;border-radius:2px;background:linear-gradient(90deg,var(--tw-c1),var(--tw-c2));animation:wordSlideIn .3s ease both}

        .step-card{transition:all .4s cubic-bezier(.34,1.2,.64,1)}
        .step-active .step-num{animation:stepPulse 1.5s ease-out infinite}
        .step-done-check{animation:checkPop .4s cubic-bezier(.34,1.56,.64,1) both}
        .step-card-body{animation:cardSlide .35s ease both}
      `}</style>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

                {/* ══ HERO ══════════════════════════════════════════════════════════ */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">

                        <div className="space-y-8">
                            <div className="fade-up-1">
                                <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ animation: 'blink 1.4s ease-in-out infinite' }} />
                                    10,000+ verified experts online now
                                </span>
                                <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
                                    Hire Expert{' '}
                                    <span
                                        className={`tw-word bg-gradient-to-r ${currentWord.color} bg-clip-text text-transparent`}
                                        style={{ '--tw-c1': currentWord.color.includes('blue-600') ? '#2563eb' : currentWord.color.includes('emerald') ? '#10b981' : currentWord.color.includes('orange') ? '#f97316' : currentWord.color.includes('pink') ? '#ec4899' : '#2563eb', '--tw-c2': currentWord.color.includes('cyan') ? '#06b6d4' : currentWord.color.includes('violet') ? '#7c3aed' : currentWord.color.includes('teal') ? '#0d9488' : currentWord.color.includes('amber') ? '#f59e0b' : currentWord.color.includes('rose') ? '#f43f5e' : '#06b6d4' }}
                                    >
                                        {displayed}
                                        <span className="tw-cursor" style={{ background: `linear-gradient(to bottom,var(--tw-c1),var(--tw-c2))`, opacity: showCursor ? undefined : 0 }} />
                                    </span>
                                    {' '}for Your{' '}<br className="hidden sm:block" />Next Project
                                </h1>
                            </div>
                            <p className="text-xl text-gray-600 leading-relaxed fade-up-2">Connect with top-rated professionals worldwide. Get quality work delivered on time, every time. Start your project today.</p>
                            <div className="flex flex-col sm:flex-row gap-4 fade-up-3">
                                <Link to="/talent"><button className={`bg-gradient-to-r ${currentWord.color} text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 w-full sm:w-auto`}>Get Started Free</button></Link>
                                <Link to="/talent"><button className="bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-200 w-full sm:w-auto">Browse Talent</button></Link>
                            </div>
                            <div className="flex flex-wrap gap-2 fade-up-3">
                                {TYPEWRITER_WORDS.map((w, i) => (
                                    <span key={w.text} className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all duration-300 ${wordIdx === i ? `bg-gradient-to-r ${w.color} text-white border-transparent shadow-md scale-105` : 'bg-white text-gray-500 border-gray-200'}`}>{w.text}</span>
                                ))}
                            </div>
                            <div className="flex items-center space-x-8 pt-2 fade-up-4">
                                {[{ val: '50K+', label: 'Active Freelancers' }, { val: '100K+', label: 'Projects Completed' }, { val: '4.9/5', label: 'Client Rating' }].map(s => (
                                    <div key={s.label} className="text-center">
                                        <div className="text-3xl font-bold text-gray-900">{s.val}</div>
                                        <div className="text-sm text-gray-600">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative scale-in">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-3xl opacity-20 pointer-events-none" />
                            <div className="absolute -top-4 -right-4 z-10 float-1">
                                <div className="bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 border border-gray-100">
                                    <span className="w-2 h-2 rounded-full bg-green-500" style={{ animation: 'blink 1.4s ease-in-out infinite' }} />
                                    <span className="text-xs font-semibold text-gray-700">142 online now</span>
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -left-4 z-10 float-2">
                                <div className="bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 border border-gray-100">
                                    <span className="text-xs">⚡</span>
                                    <span className="text-xs font-semibold text-gray-700">Avg. reply 2 min</span>
                                </div>
                            </div>
                            <div className="relative bg-white rounded-2xl p-6 shadow-2xl">
                                <div className="h-1 bg-gray-100 rounded-full mb-4 overflow-hidden">
                                    <div className={`h-full rounded-full bg-gradient-to-r ${HERO_CARDS[hero.hlIdx].gradient} transition-none`} style={{ width: `${hero.progress}%` }} />
                                </div>
                                <div className="flex justify-end gap-1.5 mb-4">
                                    {HERO_CARDS.map((_, i) => (
                                        <button key={i} onClick={() => hero.jumpTo(i)} className={`rounded-full transition-all duration-300 ${hero.hlIdx === i ? `w-5 h-2 bg-gradient-to-r ${HERO_CARDS[i].gradient}` : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'}`} />
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    {HERO_CARDS.map((card, i) => (
                                        <div key={card.id} onClick={() => hero.jumpTo(i)} className={`rounded-xl p-5 border cursor-pointer transition-all duration-300 ${hero.hlIdx === i ? `bg-gradient-to-br ${card.bgLight} ${card.border} shadow-lg scale-[1.02] ring-2 ring-offset-1 ${card.ring}` : `bg-gradient-to-br ${card.bgLight} ${card.border} opacity-70 hover:opacity-100 hover:shadow-md`}`}>
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${hero.hlIdx === i ? 'shadow-lg scale-110' : ''}`}>{card.icon}</div>
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold mb-0.5 ${hero.hlIdx === i ? 'text-gray-900' : 'text-gray-700'}`}>{card.title}</h3>
                                                    <p className="text-sm text-gray-500">{card.sub}</p>
                                                </div>
                                                {hero.hlIdx === i && <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center`}><svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg></div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <p className="text-xs text-gray-400">Click any category to explore</p>
                                    <Link to="/talent"><button className={`text-xs font-bold bg-gradient-to-r ${HERO_CARDS[hero.hlIdx].gradient} text-white px-4 py-2 rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200`}>View All →</button></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══ BROWSE CATEGORIES ════════════════════════════════════════════ */}
                <section className="bg-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-6">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse Top Categories</h2>
                            <p className="text-xl text-gray-600">Find the perfect freelancer for your project</p>
                        </div>
                        <div className="max-w-xs mx-auto mb-10">
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full bg-gradient-to-r ${BROWSE_CATS[browse.hlIdx].gradient} transition-none`} style={{ width: `${browse.progress}%` }} />
                            </div>
                            <div className="flex justify-center gap-1.5 mt-2.5">
                                {BROWSE_CATS.map((_, i) => (
                                    <button key={i} onClick={() => browse.jumpTo(i)} className={`rounded-full transition-all duration-300 ${browse.hlIdx === i ? `w-5 h-2 bg-gradient-to-r ${BROWSE_CATS[i].gradient}` : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'}`} />
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {BROWSE_CATS.map((cat, i) => (
                                <Link to="/talent" key={cat.label}>
                                    <div onClick={() => browse.jumpTo(i)} className={`rounded-xl p-6 text-center cursor-pointer border transition-all duration-300 relative overflow-hidden ${browse.hlIdx === i ? `bg-gradient-to-br ${cat.bg} ${cat.border} shadow-2xl scale-110 ring-2 ring-offset-2 ${cat.ring}` : `bg-gradient-to-br ${cat.bg} ${cat.border} opacity-70 hover:opacity-100 hover:shadow-xl hover:scale-105`}`}>
                                        {browse.hlIdx === i && <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-5 pointer-events-none`} />}
                                        <div className={`w-16 h-16 bg-gradient-to-br ${cat.gradient} rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${browse.hlIdx === i ? 'shadow-2xl scale-110' : 'shadow-md'}`}>{cat.icon}</div>
                                        <h3 className={`font-semibold mb-1 ${browse.hlIdx === i ? 'text-gray-900' : 'text-gray-700'}`}>{cat.label}</h3>
                                        <p className="text-sm text-gray-500">{cat.count} skills</p>
                                        {browse.hlIdx === i && <div className={`mt-2.5 inline-flex items-center gap-1 bg-gradient-to-r ${cat.gradient} text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full`}><span className="w-1.5 h-1.5 rounded-full bg-white" style={{ animation: 'blink 1s ease-in-out infinite' }} />Trending</div>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══ HOW IT WORKS — animated loop ═════════════════════════════════ */}
                <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">

                    {/* subtle bg circles */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2 pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                            <p className="text-xl text-gray-600">Get started in just a few simple steps</p>

                            {/* step loop dots */}
                            <div className="flex justify-center gap-2 mt-5">
                                {STEPS.map((_, i) => (
                                    <button key={i} onClick={() => steps.jumpTo(i)}
                                        className={`rounded-full transition-all duration-300 ${steps.hlIdx === i ? `w-6 h-2.5 bg-gradient-to-r ${STEPS[i].gradient}` : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-0 relative">

                            {/* ── connecting lines between steps ── */}
                            <div className="hidden md:block absolute top-10 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-0.5 bg-gray-200 z-0">
                                {/* left connector line — fills as step 0 is active, going to step 1 */}
                                <div
                                    className="absolute left-0 top-0 h-full rounded-full transition-none bg-gradient-to-r from-blue-500 to-emerald-500"
                                    style={{
                                        width: steps.hlIdx === 0
                                            ? `${lineProgress / 2}%`
                                            : steps.hlIdx >= 1 ? '50%' : '0%',
                                    }}
                                />
                                {/* right connector line — fills as step 1 is active, going to step 2 */}
                                <div
                                    className="absolute left-1/2 top-0 h-full rounded-full transition-none bg-gradient-to-r from-emerald-500 to-orange-500"
                                    style={{
                                        width: steps.hlIdx === 1
                                            ? `${lineProgress / 2}%`
                                            : steps.hlIdx >= 2 ? '50%' : '0%',
                                    }}
                                />
                            </div>

                            {STEPS.map((step, i) => {
                                const isActive = steps.hlIdx === i
                                const isDone = steps.hlIdx > i || (steps.hlIdx === 0 && i === STEPS.length - 1 && steps.progress < 5)

                                return (
                                    <div
                                        key={step.num}
                                        onClick={() => steps.jumpTo(i)}
                                        className={`step-card relative z-10 flex flex-col items-center text-center px-6 pb-8 pt-2 cursor-pointer rounded-2xl mx-2 ${isActive ? `step-active bg-white shadow-xl border-2 ${step.border}` : 'hover:bg-white/60 border-2 border-transparent'}`}
                                    >
                                        {/* ── circle number ── */}
                                        <div className="relative mb-6">

                                            {/* outer glow ring — only on active */}
                                            {isActive && (
                                                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.gradient} opacity-20 scale-[1.6] blur-sm pointer-events-none`} />
                                            )}

                                            {/* main circle */}
                                            <div className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-400 step-num
                        ${isActive
                                                    ? `bg-gradient-to-br ${step.gradient} scale-110 shadow-2xl`
                                                    : isDone
                                                        ? `bg-gradient-to-br ${step.gradient} opacity-60`
                                                        : 'bg-gray-100'
                                                }`}
                                            >
                                                {isDone && !isActive ? (
                                                    /* tick for completed steps */
                                                    <svg className="w-8 h-8 text-white step-done-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <span className={`text-3xl font-bold transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                                        {step.num}
                                                    </span>
                                                )}
                                            </div>

                                            {/* blinking ping — only on active */}
                                            {isActive && (
                                                <div className={`absolute -top-1 -right-1 w-5 h-5 ${step.ping} rounded-full`}>
                                                    <div className={`w-full h-full ${step.ping} rounded-full animate-ping`} />
                                                </div>
                                            )}
                                        </div>

                                        {/* ── card body ── */}
                                        <div className={isActive ? 'step-card-body' : ''}>

                                            {/* icon pill — visible only on active */}
                                            {isActive && (
                                                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${step.gradient} text-white text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-md`}>
                                                    {step.icon}
                                                    <span>Step {step.num} of 3</span>
                                                </div>
                                            )}

                                            <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {step.title}
                                            </h3>
                                            <p className={`leading-relaxed transition-colors duration-300 ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                                                {step.desc}
                                            </p>

                                            {/* mini progress bar — only on active */}
                                            {isActive && (
                                                <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full bg-gradient-to-r ${step.gradient} transition-none`}
                                                        style={{ width: `${steps.progress}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* bottom CTA */}
                        <div className="text-center mt-12">
                            <Link to="/talent">
                                <button className={`bg-gradient-to-r ${STEPS[steps.hlIdx].gradient} text-white px-8 py-3.5 rounded-xl font-bold text-base hover:shadow-xl hover:scale-105 transition-all duration-200 shadow-lg`}>
                                    Start with Step {STEPS[steps.hlIdx].num} →
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ══ TESTIMONIALS ═════════════════════════════════════════════════ */}
                <section className="bg-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
                            <p className="text-xl text-gray-600">Join thousands of satisfied customers</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { name: 'Sarah Johnson', role: 'Startup Founder', text: '"Found an amazing developer who delivered my e-commerce site ahead of schedule. The quality exceeded my expectations!"', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-100', avatar: 'from-blue-500 to-cyan-500' },
                                { name: 'Michael Chen', role: 'Marketing Director', text: '"The platform made it easy to find the perfect designer. Communication was smooth and the results were fantastic!"', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-100', avatar: 'from-emerald-500 to-teal-500' },
                                { name: 'Emily Rodriguez', role: 'Business Owner', text: '"Best investment for my business. Got a professional mobile app developed at a fraction of traditional costs."', bg: 'from-orange-50 to-amber-50', border: 'border-orange-100', avatar: 'from-orange-500 to-amber-500' },
                            ].map(t => (
                                <div key={t.name} className={`bg-gradient-to-br ${t.bg} rounded-2xl p-8 border ${t.border} hover:shadow-xl transition-all duration-200 hover:-translate-y-1`}>
                                    <Stars />
                                    <p className="text-gray-700 mb-6 leading-relaxed">{t.text}</p>
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${t.avatar} rounded-full flex items-center justify-center`}>
                                            <span className="text-white font-bold text-sm">{t.name.split(' ').map(n => n[0]).join('')}</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{t.name}</div>
                                            <div className="text-sm text-gray-600">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══ CTA BANNER ═══════════════════════════════════════════════════ */}
                <section className="bg-gradient-to-r from-blue-600 to-cyan-600 py-20 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-white blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-white blur-3xl" />
                    </div>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                        <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
                        <p className="text-xl text-blue-100 mb-8">Join thousands of businesses and freelancers working together</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to={
                                user?.isFreelancer
                                    ? '/auth/profile'
                                    : user
                                        ? '/regularUser' 
                                        : (
                                            !user ? "/login" : "/register"
                                        )
                            }> <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200">Post a Project</button></Link>
                            <Link to="/find/work"><button className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white hover:bg-blue-800 transition-all duration-200">Find Work</button></Link>
                        </div>
                    </div>
                </section >

                {/* ══ FOOTER ═══════════════════════════════════════════════════════ */}
                < footer className="bg-gray-900 text-gray-300 py-12" >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                            {[
                                { title: 'For Clients', links: ['How to Hire', 'Talent Marketplace', 'Project Catalog', 'Enterprise'] },
                                { title: 'For Freelancers', links: ['How to Find Work', 'Direct Contracts', 'Find Jobs', 'Success Stories'] },
                                { title: 'Resources', links: ['Help & Support', 'Blog', 'Community', 'API'] },
                                { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Contact'] },
                            ].map(col => (
                                <div key={col.title}>
                                    <h3 className="text-white font-semibold mb-4">{col.title}</h3>
                                    <ul className="space-y-2">
                                        {col.links.map(l => <li key={l}><a className="hover:text-white transition-colors duration-200 cursor-pointer">{l}</a></li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                            <div className="flex items-center space-x-2 mb-4 md:mb-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <span className="text-white font-semibold">Co.Worker</span>
                            </div>
                            <div className="text-sm text-gray-400">© 2024 Co.Worker. All rights reserved.</div>
                            <div className="flex space-x-6 mt-4 md:mt-0">
                                {['Privacy', 'Terms', 'Security'].map(l => <a key={l} className="hover:text-white transition-colors duration-200 cursor-pointer">{l}</a>)}
                            </div>
                        </div>
                    </div>
                </footer >

            </div >
        </>
    )
}

export default Home