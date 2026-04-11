import React, { useEffect, useState } from 'react';
import { MapPin, Briefcase, Clock, MessageCircle, Heart, Share2, CheckCircle, IdCard, Mail, Phone } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getFreelancer } from '../features/Freelancer/freelancerSlice';
import { Link, useParams } from 'react-router-dom';
import LoaderGradient from '../components/LoaderGradient';
import { TbArrowsJoin2 } from 'react-icons/tb';

// ── Word list & colors ────────────────────────────────────────────────────────
const WORDS = ['Web Developers', 'UI/UX Designers', 'Marketers', 'Data Experts', 'Full-Stack Devs']
const WORD_COLORS = [
    { from: '#3B7FF5', to: '#2BC4D4' },
    { from: '#8B5CF6', to: '#EC4899' },
    { from: '#F59E0B', to: '#EF4444' },
    { from: '#10B981', to: '#3B7FF5' },
    { from: '#F43F5E', to: '#8B5CF6' },
]

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter() {
    const [displayed, setDisplayed] = useState('')
    const [wordIdx, setWordIdx] = useState(0)
    const [phase, setPhase] = useState('typing')
    const [charIdx, setCharIdx] = useState(0)

    useEffect(() => {
        let timer
        const word = WORDS[wordIdx]
        if (phase === 'typing') {
            if (charIdx < word.length) {
                timer = setTimeout(() => { setDisplayed(word.slice(0, charIdx + 1)); setCharIdx(c => c + 1) }, 75)
            } else {
                timer = setTimeout(() => setPhase('pause'), 1800)
            }
        } else if (phase === 'pause') {
            timer = setTimeout(() => setPhase('deleting'), 200)
        } else if (phase === 'deleting') {
            if (charIdx > 0) {
                timer = setTimeout(() => { setDisplayed(word.slice(0, charIdx - 1)); setCharIdx(c => c - 1) }, 38)
            } else { setWordIdx(i => (i + 1) % WORDS.length); setPhase('typing') }
        }
        return () => clearTimeout(timer)
    }, [phase, charIdx, wordIdx])

    return { displayed, wordIdx }
}

// ── Hero Banner ───────────────────────────────────────────────────────────────
const HeroBanner = () => {
    const { displayed, wordIdx } = useTypewriter()
    const color = WORD_COLORS[wordIdx]

    return (
        <div className="relative overflow-hidden px-6 sm:px-10 pt-14 pb-12"
            style={{ background: 'linear-gradient(135deg,#0F172A 0%,#1E3A5F 60%,#0F172A 100%)' }}>
            <style>{`
                @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
                @keyframes shimmerLine { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
                @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                @keyframes orbPulse    { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.15);opacity:.8} }
                @keyframes scrollLeft  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
                .tw-cursor { display:inline-block; width:3px; height:44px; border-radius:2px; vertical-align:middle; animation:cursorBlink 1s ease infinite; flex-shrink:0 }
                .shimmer-line { transform-origin:left; animation:shimmerLine 0.4s ease both }
                .anim-0 { animation:fadeSlideUp .6s ease both }
                .anim-1 { animation:fadeSlideUp .7s ease .1s both }
                .anim-2 { animation:fadeSlideUp .8s ease .2s both }
            `}</style>

            {/* bg orbs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute w-96 h-96 rounded-full -top-24 right-[10%]"
                    style={{ background: `radial-gradient(circle,${color.from}22 0%,transparent 70%)`, animation: 'orbPulse 4s ease infinite' }} />
                <div className="absolute w-72 h-72 rounded-full -bottom-20 left-[5%]"
                    style={{ background: `radial-gradient(circle,${color.to}18 0%,transparent 70%)`, animation: 'orbPulse 5s ease infinite reverse' }} />
            </div>

            {/* badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 anim-0"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                <span className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px #22C55E' }} />
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>10,000+ verified experts online</span>
            </div>

            {/* headline */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-3 anim-0"
                style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>
                Hire the Best
            </h1>

            {/* typewriter */}
            <div className="flex items-center flex-wrap gap-3 mb-2 min-h-[56px]">
                <span className="text-3xl sm:text-4xl font-extrabold transition-all duration-300"
                    style={{ background: `linear-gradient(135deg,${color.from},${color.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontFamily: "'Playfair Display',Georgia,serif" }}>
                    {displayed}
                </span>
                <span className="tw-cursor" style={{ background: `linear-gradient(${color.from},${color.to})` }} />
            </div>

            {/* shimmer underline */}
            <div className="w-48 h-[3px] rounded-full mb-5 shimmer-line"
                style={{ background: `linear-gradient(90deg,${color.from},${color.to})` }} />

            <p className="text-sm max-w-lg leading-relaxed mb-7 anim-1"
                style={{ color: 'rgba(255,255,255,0.6)' }}>
                Connect with top-tier freelancers who deliver results — on time, every time.
            </p>

            {/* pills */}
            <div className="flex flex-wrap gap-2 anim-2">
                {WORDS.map((w, i) => (
                    <span key={w} className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300"
                        style={{
                            background: i === wordIdx ? `linear-gradient(135deg,${WORD_COLORS[i].from},${WORD_COLORS[i].to})` : 'rgba(255,255,255,0.07)',
                            color: i === wordIdx ? 'white' : 'rgba(255,255,255,0.45)',
                            border: i === wordIdx ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            boxShadow: i === wordIdx ? `0 4px 12px ${WORD_COLORS[i].from}44` : 'none',
                        }}>
                        {w}
                    </span>
                ))}
            </div>
        </div>
    )
}

// ── Skills Ticker ─────────────────────────────────────────────────────────────
const SkillsTicker = ({ skills }) => {
    if (!skills) return null
    const list = skills.split(',').map(s => s.trim()).filter(Boolean)
    if (!list.length) return null
    const doubled = [...list, ...list]

    return (
        <div className="overflow-hidden bg-gray-50 border-y border-gray-200 py-2.5">
            <div className="flex gap-8 w-max" style={{ animation: 'scrollLeft 12s linear infinite' }}>
                {doubled.map((s, i) => (
                    <span key={i} className="flex items-center gap-2 whitespace-nowrap text-[13px] font-semibold text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#3B7FF5,#2BC4D4)' }} />
                        {s}
                    </span>
                ))}
            </div>
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
const FreelancerProfile = () => {
    const [isSaved, setIsSaved] = useState(false)
    const { freelancer, freelancerLoading, freelancerError, freelancerErrorMessage } = useSelector(s => s.freelancer)
    const { id } = useParams()
    const dispatch = useDispatch()

    useEffect(() => { if (id) dispatch(getFreelancer(id)) }, [dispatch, id])
    useEffect(() => { if (freelancerError && freelancerErrorMessage) toast.error(freelancerErrorMessage) }, [freelancerError, freelancerErrorMessage])

    if (freelancerLoading) return <LoaderGradient />

    const profile = freelancer?.profile
    const user = profile?.user
    const works = freelancer?.previousWorks || []

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
                @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                @keyframes orbPulse    { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.15);opacity:.8} }
                @keyframes scrollLeft  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
                @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
                @keyframes shimmerLine { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
                @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                .fp-0 { animation:fadeUp .5s ease both }
                .fp-1 { animation:fadeUp .5s ease .1s both }
                .fp-2 { animation:fadeUp .5s ease .2s both }
                .fp-3 { animation:fadeUp .5s ease .3s both }
            `}</style>

            <HeroBanner />
            <SkillsTicker skills={profile?.skills} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* ── Profile Card ── */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden fp-0">
                    <div className="h-1" style={{ background: 'linear-gradient(135deg,#3B7FF5,#2BC4D4)' }} />
                    <div className="p-6 sm:p-8 flex flex-wrap gap-6">

                        {/* Avatar + mini stats */}
                        <div className="flex flex-col items-center gap-3 min-w-[160px]">
                            <div className="relative">
                                {user?.profilePic ? (
                                    <img src={user.profilePic} alt={user.name}
                                        className="w-28 h-28 rounded-full object-cover border-4 border-white"
                                        style={{ boxShadow: '0 8px 24px rgba(59,127,245,0.25)', outline: '3px solid #EFF6FF' }} />
                                ) : (
                                    <div className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white border-4 border-white"
                                        style={{ background: 'linear-gradient(135deg,#3B7FF5,#2BC4D4)', boxShadow: '0 8px 24px rgba(59,127,245,0.25)', outline: '3px solid #EFF6FF' }}>
                                        {user?.name?.[0] || 'F'}
                                    </div>
                                )}
                                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white"
                                    style={{ boxShadow: '0 0 8px #22C55E66' }} />
                            </div>

                            {[
                                { icon: <Briefcase size={14} />, label: 'Projects', value: works.length },
                                { icon: <CheckCircle size={14} />, label: 'Success', value: `${works.length > 0 ? 98 : 0}%` },
                                { icon: <Clock size={14} />, label: 'Response', value: '< 2h' },
                            ].map(s => (
                                <div key={s.label} className="flex items-center gap-2 text-[13px] bg-gray-50 rounded-xl px-3 py-1.5 w-full border border-gray-200">
                                    <span className="text-blue-500 flex-shrink-0">{s.icon}</span>
                                    <span className="flex-1 text-gray-500">{s.label}</span>
                                    <span className="font-bold text-gray-900">{s.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-[220px]">
                            <div className="flex flex-wrap justify-between gap-3 mb-3">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1"
                                        style={{ fontFamily: "'Playfair Display',serif" }}>
                                        {user?.name || 'Freelancer'}
                                    </h1>
                                    <p className="text-[15px] font-semibold text-blue-500">
                                        {profile?.category || 'Category'}
                                    </p>
                                </div>
                                <div className="flex gap-3 flex-wrap">
                                    {[
                                        { label: 'Credits', value: user?.credits ?? '—' },
                                        { label: 'Experience', value: profile?.experience ? `${profile.experience}y` : '—' },
                                    ].map(b => (
                                        <div key={b.label} className="bg-blue-50 rounded-xl px-4 py-2.5 text-center border border-blue-100">
                                            <div className="text-2xl font-extrabold text-blue-700">{b.value}</div>
                                            <div className="text-[11px] text-gray-500 font-medium">{b.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Contact rows */}
                            <div className="flex flex-col gap-1.5 mb-4">
                                {[
                                    { icon: <IdCard size={14} />, text: user?._id },
                                    { icon: <Mail size={14} />, text: user?.email },
                                    { icon: <Phone size={14} />, text: user?.phone },
                                    { icon: <MapPin size={14} />, text: user?.location || 'India' },
                                    { icon: <TbArrowsJoin2 size={14} />, text: user?.createdAt ? `Joined ${new Date(user.createdAt).toLocaleDateString('en-IN')}` : null },
                                ].map((row, i) => row.text && (
                                    <div key={i} className="flex items-center gap-2 text-[13px] text-gray-500">
                                        <span className="text-blue-500 flex-shrink-0">{row.icon}</span>
                                        <span className="text-gray-700">{row.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-500 leading-relaxed mb-5 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 border-l-4 border-l-blue-500">
                                {profile?.description || 'No description provided.'}
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-wrap gap-2.5">
                                <button className="flex items-center gap-2 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 hover:scale-105 transition-all"
                                    style={{ background: 'linear-gradient(135deg,#3B7FF5,#2BC4D4)', boxShadow: '0 4px 14px rgba(59,127,245,0.3)' }}>
                                    <MessageCircle size={16} /> Contact
                                </button>
                                <button
                                    onClick={() => setIsSaved(!isSaved)}
                                    className={`flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl border transition-all duration-200
                                        ${isSaved ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300"}`}>
                                    <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
                                    {isSaved ? 'Saved' : 'Save'}
                                </button>
                                <button className="flex items-center gap-2 bg-gray-50 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl border border-gray-200 hover:border-blue-300 transition-all">
                                    <Share2 size={16} /> Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Skills ── */}
                <div className="bg-white rounded-2xl shadow-md p-7 fp-1">
                    <h2 className="text-xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display',serif" }}>Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {(profile?.skills || '').split(',').map(s => s.trim()).filter(Boolean).map((sk, i) => (
                            <span key={i} className="px-4 py-1.5 rounded-full text-[13px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">{sk}</span>
                        ))}
                        {!profile?.skills && <span className="text-sm text-gray-400">No skills listed</span>}
                    </div>
                </div>

                {/* ── Portfolio ── */}
                <div className="bg-white rounded-2xl shadow-md p-7 fp-2">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-extrabold text-gray-900" style={{ fontFamily: "'Playfair Display',serif" }}>Portfolio</h2>
                        <span className="text-[13px] text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">{works.length} projects</span>
                    </div>

                    {works.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <p className="text-4xl mb-2">🗂</p>
                            <p className="text-sm">No portfolio projects yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {works.map((p, i) => (
                                <div key={p._id}
                                    className="rounded-2xl overflow-hidden border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-400"
                                    style={{ animation: `fadeUp .5s ease ${i * 0.07}s both` }}>
                                    {p.projectImage ? (
                                        <img src={p.projectImage} alt="project" className="w-full h-44 object-cover block"
                                            onError={e => e.target.style.display = 'none'} />
                                    ) : (
                                        <div className="w-full h-44 flex items-center justify-center text-4xl bg-gradient-to-br from-blue-50 to-cyan-50">🖼</div>
                                    )}
                                    <div className="p-4">
                                        <p className="text-[13px] text-gray-500 leading-relaxed mb-3 line-clamp-3">
                                            {p.projectDescription || 'No description'}
                                        </p>
                                        {p.projectLink && (
                                            <Link to={p.projectLink} target="_blank" rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-1.5 rounded-lg no-underline hover:opacity-90 transition-opacity"
                                                style={{ background: 'linear-gradient(135deg,#3B7FF5,#2BC4D4)' }}>
                                                🔗 View Project ↗
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── CTA ── */}
                <div className="relative rounded-2xl p-10 text-center overflow-hidden fp-3"
                    style={{ background: 'linear-gradient(135deg,#0F172A 0%,#1E3A5F 100%)' }}>
                    <div className="absolute w-72 h-72 rounded-full pointer-events-none -top-24 -right-12"
                        style={{ background: 'radial-gradient(circle,rgba(59,127,245,0.15) 0%,transparent 70%)' }} />
                    <div className="absolute w-48 h-48 rounded-full pointer-events-none -bottom-12 left-[5%]"
                        style={{ background: 'radial-gradient(circle,rgba(43,196,212,0.12) 0%,transparent 70%)' }} />
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 relative"
                        style={{ fontFamily: "'Playfair Display',serif" }}>
                        Ready to work together?
                    </h3>
                    <p className="text-sm mb-6 relative" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Let's discuss your project and make it happen.
                    </p>
                    <button className="relative text-white font-bold text-[15px] px-8 py-3 rounded-xl border-none cursor-pointer hover:opacity-90 hover:scale-105 transition-all"
                        style={{ background: 'linear-gradient(135deg,#3B7FF5,#2BC4D4)', boxShadow: '0 8px 24px rgba(59,127,245,0.4)' }}>
                        Send Project Details ↗
                    </button>
                </div>

            </div>
        </div>
    )
}

export default FreelancerProfile