import { useEffect, useState, useCallback, memo } from 'react'
import {
    MapPin, Briefcase, Clock, MessageCircle, Heart, Share2,
    CheckCircle, Mail, Phone, Zap, Award, Star, ExternalLink,
    ChevronRight,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { getFreelancer } from '../features/Freelancer/freelancerSlice'
import { getAssignedProjects, addAssignedProject } from '../features/project/projectSlice'
import { Link, useParams, useNavigate } from 'react-router-dom'
import LoaderGradient from '../components/LoaderGradient'
import { TbArrowsJoin2 } from 'react-icons/tb'
import { getOrCreateConversation } from '../features/ChatsAndMessages/chatSlice'
import { getSocket } from '../utils/socketManager'
import RatingSummary from '../components/RatingSummary'
import { motion } from 'framer-motion'

const MotionSection = motion.div

// ─── Typewriter Hook ──────────────────────────────────────────────────────────
function useTypewriter(words, { typeSpeed = 80, deleteSpeed = 40, pauseMs = 1800 } = {}) {
    const [displayed, setDisplayed] = useState('')
    const [wordIdx, setWordIdx] = useState(0)
    const [phase, setPhase] = useState('typing')
    const [charIdx, setCharIdx] = useState(0)

    useEffect(() => {
        let timer
        const word = words[wordIdx]
        if (phase === 'typing') {
            if (charIdx < word.length) {
                timer = setTimeout(() => { setDisplayed(word.slice(0, charIdx + 1)); setCharIdx(c => c + 1) }, typeSpeed)
            } else {
                timer = setTimeout(() => setPhase('pause'), pauseMs)
            }
        } else if (phase === 'pause') {
            timer = setTimeout(() => setPhase('deleting'), 200)
        } else if (phase === 'deleting') {
            if (charIdx > 0) {
                timer = setTimeout(() => { setDisplayed(word.slice(0, charIdx - 1)); setCharIdx(c => c - 1) }, deleteSpeed)
            } else {
                timer = setTimeout(() => { setWordIdx(i => (i + 1) % words.length); setPhase('typing') }, 0)
            }
        }
        return () => clearTimeout(timer)
    }, [charIdx, deleteSpeed, pauseMs, phase, typeSpeed, wordIdx, words])

    return { displayed, wordIdx }
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const ACCENT = 'from-blue-500 to-cyan-400'
const ACCENT_BG = 'bg-gradient-to-r from-blue-500 to-cyan-400'
const CARD = 'bg-white/[0.03] border border-white/10 backdrop-blur-sm'
const CARD_HOVER = 'hover:border-white/20 hover:bg-white/[0.05]'
const TEXT_1 = 'text-white'
const TEXT_2 = 'text-white/60'
const TEXT_3 = 'text-white/35'

const WORDS = ['Web Developers', 'UI/UX Designers', 'Marketers', 'Data Experts', 'Full-Stack Devs']
const COLORS = [
    { from: '#3B82F6', to: '#06B6D4' },
    { from: '#8B5CF6', to: '#EC4899' },
    { from: '#F59E0B', to: '#EF4444' },
    { from: '#10B981', to: '#3B82F6' },
    { from: '#F43F5E', to: '#8B5CF6' },
]

// fade-up variant used across sections
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay },
})

// ─── Hero Banner ──────────────────────────────────────────────────────────────
const HeroBanner = memo(function HeroBanner({ displayed, wordIdx }) {
    const c = COLORS[wordIdx]
    return (
        <div
            className="relative overflow-hidden px-4 sm:px-8 lg:px-12 pt-12 pb-14"
            style={{ background: 'linear-gradient(135deg,#020617 0%,#0c1a3a 55%,#020617 100%)' }}
        >
            {/* ambient glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -right-16 w-[420px] h-[420px] rounded-full opacity-20 transition-all duration-700"
                    style={{ background: `radial-gradient(circle,${c.from}55 0%,transparent 65%)` }} />
                <div className="absolute -bottom-32 -left-10 w-72 h-72 rounded-full opacity-15 transition-all duration-700"
                    style={{ background: `radial-gradient(circle,${c.to}44 0%,transparent 65%)` }} />
                {/* subtle grid */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
            </div>

            <div className="relative z-10 max-w-3xl">
                {/* live badge */}
                <motion.div {...fadeUp(0)}
                    className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-6 bg-white/[0.05] border border-white/10">
                    <span className="relative flex w-2 h-2">
                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                        <span className="relative rounded-full bg-emerald-400 w-2 h-2" />
                    </span>
                    <span className="text-xs font-medium text-white/60 tracking-wide">10,000+ verified experts online</span>
                </motion.div>

                <motion.h1 {...fadeUp(0.08)}
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 tracking-tight">
                    Hire the Best
                </motion.h1>

                {/* typewriter */}
                <motion.div {...fadeUp(0.14)} className="flex items-center gap-3 mb-4 min-h-[2.5rem]">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight"
                        style={{ backgroundImage: `linear-gradient(135deg,${c.from},${c.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        {displayed}
                    </span>
                    <span className="inline-block w-0.5 h-7 rounded-full animate-pulse"
                        style={{ background: `linear-gradient(${c.from},${c.to})` }} />
                </motion.div>

                <motion.div {...fadeUp(0.18)}
                    className="h-0.5 w-40 rounded-full mb-5"
                    style={{ background: `linear-gradient(90deg,${c.from},${c.to})` }} />

                <motion.p {...fadeUp(0.22)}
                    className="text-sm sm:text-base text-white/45 max-w-md leading-relaxed mb-7">
                    Connect with top-tier freelancers who deliver results — on time, every time.
                </motion.p>

                {/* word pills */}
                <div className="flex flex-wrap gap-2">
                    {WORDS.map((w, i) => (
                        <motion.span key={w} {...fadeUp(0.28 + i * 0.04)}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-500 cursor-default"
                            style={{
                                background: i === wordIdx ? `linear-gradient(135deg,${COLORS[i].from},${COLORS[i].to})` : 'rgba(255,255,255,0.05)',
                                color: i === wordIdx ? '#fff' : 'rgba(255,255,255,0.38)',
                                border: i === wordIdx ? 'none' : '1px solid rgba(255,255,255,0.08)',
                            }}>
                            {w}
                        </motion.span>
                    ))}
                </div>
            </div>
        </div>
    )
})

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = memo(function Avatar({ profileUser, size = 'lg' }) {
    const dim = size === 'lg' ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-16 h-16'
    const txt = size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-xl'
    return (
        <div className="relative flex-shrink-0">
            {profileUser?.profilePic ? (
                <img src={profileUser.profilePic} alt={profileUser.name}
                    className={`${dim} rounded-2xl object-cover ring-2 ring-white/10 shadow-2xl`} />
            ) : (
                <div className={`${dim} rounded-2xl ${ACCENT_BG} flex items-center justify-center ${txt} font-bold text-white shadow-2xl`}>
                    {profileUser?.name?.[0] || 'F'}
                </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#020617] shadow-lg shadow-emerald-400/40" />
        </div>
    )
})

// ─── Stat Pill ────────────────────────────────────────────────────────────────
const StatPill = memo(function StatPill({ icon, label, value }) {
    return (
        <div className={`flex items-center gap-2.5 text-[13px] ${CARD} rounded-xl px-3.5 py-2.5 transition-all duration-200 ${CARD_HOVER}`}>
            <span className={`${ACCENT_BG} p-1.5 rounded-lg text-white flex-shrink-0`}>{icon}</span>
            <span className={TEXT_2}>{label}</span>
            <span className={`font-semibold ${TEXT_1} ml-auto`}>{value}</span>
        </div>
    )
})

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = memo(function InfoRow({ icon, text }) {
    if (!text) return null
    return (
        <div className={`flex items-center gap-2.5 text-[13px] ${CARD} rounded-lg px-3 py-2`}>
            <span className="text-blue-400 flex-shrink-0">{icon}</span>
            <span className={`${TEXT_2} truncate`}>{text}</span>
        </div>
    )
})

// ─── Primary Button ───────────────────────────────────────────────────────────
const PrimaryBtn = memo(function PrimaryBtn({ onClick, disabled, loading, icon, label, className = '' }) {
    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.03 } : {}}
            whileTap={!disabled ? { scale: 0.97 } : {}}
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl 
                min-h-[44px] cursor-pointer border-none transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-blue-500/25'}
                ${ACCENT_BG} text-white ${className}`}
        >
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : icon}
            {loading ? 'Opening...' : label}
        </motion.button>
    )
})

// ─── Ghost Button ─────────────────────────────────────────────────────────────
const GhostBtn = memo(function GhostBtn({ onClick, icon, label, active, className = '' }) {
    return (
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className={`flex items-center justify-center gap-2 font-semibold text-sm px-4 py-3 
                rounded-xl min-h-[44px] cursor-pointer border transition-all duration-200
                ${active
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : `${CARD} ${TEXT_2} border-white/10 hover:border-white/25 hover:text-white`
                } ${className}`}
        >
            {icon}
            {label}
        </motion.button>
    )
})

// ─── Profile Card ─────────────────────────────────────────────────────────────
const ProfileCard = memo(function ProfileCard({ profile, profileUser, works, isOwnProfile, onContact, msgLoading, isSaved, onSave }) {
    return (
        <motion.div {...fadeUp(0.1)} className={`${CARD} rounded-2xl overflow-hidden`}>
            {/* top accent bar */}
            <div className={`h-px w-full ${ACCENT_BG}`} />

            <div className="p-5 sm:p-6 lg:p-8">
                {/* ── MOBILE: stacked. TABLET+: side-by-side ── */}
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-7">

                    {/* Left column: avatar + mini stats */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-4 sm:gap-3 sm:min-w-[160px] sm:max-w-[168px]">
                        <Avatar profileUser={profileUser} />

                        {/* mobile: name appears next to avatar */}
                        <div className="flex-1 sm:hidden">
                            <h2 className={`text-xl font-bold ${TEXT_1} leading-tight mb-1`}>
                                {profileUser?.name || 'Freelancer'}
                            </h2>
                            <p className={`text-sm font-medium bg-gradient-to-r ${ACCENT} bg-clip-text text-transparent`}>
                                {profile?.category || 'Category'}
                            </p>
                        </div>

                        {/* stat pills — only visible sm+ in sidebar, below name on mobile */}
                        <div className="hidden sm:flex flex-col gap-2 mt-1">
                            <StatPill icon={<Briefcase size={13} />} label="Projects" value={works.length} />
                            <StatPill icon={<CheckCircle size={13} />} label="Success" value={`${works.length > 0 ? 98 : 0}%`} />
                            <StatPill icon={<Clock size={13} />} label="Response" value="< 2h" />
                        </div>
                    </div>

                    {/* mobile stat pills row */}
                    <div className="flex sm:hidden gap-2">
                        {[
                            { icon: <Briefcase size={12} />, label: 'Projects', value: works.length },
                            { icon: <CheckCircle size={12} />, label: 'Success', value: `${works.length > 0 ? 98 : 0}%` },
                            { icon: <Clock size={12} />, label: 'Response', value: '< 2h' },
                        ].map(s => (
                            <div key={s.label} className={`flex-1 ${CARD} rounded-xl p-2.5 text-center`}>
                                <div className={`text-xs font-bold ${TEXT_1}`}>{s.value}</div>
                                <div className={`text-[10px] ${TEXT_3} mt-0.5`}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Right column: info */}
                    <div className="flex-1 min-w-0 space-y-4">

                        {/* name + badge — hidden on mobile (already shown next to avatar) */}
                        <div className="hidden sm:flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className={`text-2xl lg:text-3xl font-bold ${TEXT_1} leading-tight mb-1`}>
                                    {profileUser?.name || 'Freelancer'}
                                </h2>
                                <p className={`text-sm font-semibold bg-gradient-to-r ${ACCENT} bg-clip-text text-transparent`}>
                                    {profile?.category || 'Category'}
                                </p>
                            </div>

                            {/* credits + exp badges */}
                            <div className="flex gap-2.5">
                                {[
                                    { label: 'Credits', value: profileUser?.credits ?? '—' },
                                    { label: 'Experience', value: profile?.experience ? `${profile.experience}y` : '—' },
                                ].map(b => (
                                    <div key={b.label} className={`${CARD} rounded-xl px-4 py-2.5 text-center min-w-[72px]`}>
                                        <div className={`text-xl font-bold bg-gradient-to-br ${ACCENT} bg-clip-text text-transparent`}>{b.value}</div>
                                        <div className={`text-[10px] ${TEXT_3} font-medium mt-0.5`}>{b.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* mobile badges row */}
                        <div className="flex sm:hidden gap-2.5">
                            {[
                                { label: 'Credits', value: profileUser?.credits ?? '—' },
                                { label: 'Experience', value: profile?.experience ? `${profile.experience}y` : '—' },
                            ].map(b => (
                                <div key={b.label} className={`${CARD} rounded-xl px-4 py-2.5 text-center flex-1`}>
                                    <div className={`text-lg font-bold bg-gradient-to-br ${ACCENT} bg-clip-text text-transparent`}>{b.value}</div>
                                    <div className={`text-[10px] ${TEXT_3} font-medium mt-0.5`}>{b.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* contact info grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <InfoRow icon={<Mail size={13} />} text={profileUser?.email} />
                            <InfoRow icon={<Phone size={13} />} text={profileUser?.phone} />
                            <InfoRow icon={<MapPin size={13} />} text={profileUser?.location || 'India'} />
                            <InfoRow icon={<TbArrowsJoin2 size={13} />} text={profileUser?.createdAt ? `Joined ${new Date(profileUser.createdAt).toLocaleDateString('en-IN')}` : null} />
                        </div>

                        {/* bio */}
                        <p className={`text-sm ${TEXT_2} leading-relaxed ${CARD} px-4 py-3 rounded-xl border-l-2 border-l-blue-500`}>
                            {profile?.description || 'No description provided.'}
                        </p>

                        {/* action buttons */}
                        <div className="flex flex-wrap gap-2.5 pt-1">
                            <PrimaryBtn
                                onClick={onContact}
                                disabled={msgLoading || isOwnProfile}
                                loading={msgLoading}
                                icon={<MessageCircle size={16} />}
                                label={isOwnProfile ? 'Your Profile' : 'Message'}
                                className="flex-1 sm:flex-none"
                            />
                            {!isOwnProfile && (
                                <>
                                    <GhostBtn
                                        onClick={onSave}
                                        icon={<Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />}
                                        label={isSaved ? 'Saved' : 'Save'}
                                        active={isSaved}
                                    />
                                    <GhostBtn
                                        icon={<Share2 size={16} />}
                                        label="Share"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
})

// ─── Skills Section ────────────────────────────────────────────────────────────
const SkillsSection = memo(function SkillsSection({ skills }) {
    const list = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []
    if (list.length === 0) return null

    // alternate between two subtle tints
    const tints = ['bg-blue-500/10 text-blue-300 border-blue-500/20', 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20']

    return (
        <motion.div {...fadeUp(0.2)} className={`${CARD} rounded-2xl p-5 sm:p-6`}>
            <h3 className={`text-base font-semibold ${TEXT_1} mb-4`}>Skills</h3>
            <div className="flex flex-wrap gap-2">
                {list.map((sk, i) => (
                    <span key={i}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${tints[i % 2]}`}>
                        {sk}
                    </span>
                ))}
            </div>
        </motion.div>
    )
})

// ─── Portfolio Card ────────────────────────────────────────────────────────────
const PortfolioCard = memo(function PortfolioCard({ project, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.07, duration: 0.35 }}
            whileHover={{ y: -4 }}
            className={`${CARD} ${CARD_HOVER} rounded-2xl overflow-hidden group transition-all duration-300 cursor-default`}
        >
            <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
                {project.projectImage ? (
                    <img src={project.projectImage} alt="project"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.target.style.display = 'none' }} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🖼</div>
                )}
                {/* subtle overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4">
                <p className={`text-[13px] ${TEXT_2} leading-relaxed mb-3 line-clamp-3`}>
                    {project.projectDescription || 'No description'}
                </p>
                {project.projectLink && (
                    <a href={project.projectLink} target="_blank" rel="noreferrer"
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${ACCENT_BG} text-white px-3.5 py-1.5 rounded-lg no-underline hover:shadow-md hover:shadow-blue-500/20 transition-all`}>
                        <ExternalLink size={11} /> View Project
                    </a>
                )}
            </div>
        </motion.div>
    )
})

// ─── Assigned Project Card ─────────────────────────────────────────────────────
const AssignedProjectCard = memo(function AssignedProjectCard({ project, index }) {
    const statusMap = {
        'accepted': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/25', label: '💳 Pending Payment' },
        'in-progress': { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/25', label: '🔄 In Progress' },
        'completed': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25', label: '✅ Completed' },
    }
    const s = statusMap[project.status] || statusMap['accepted']

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07 }}
        >
            <Link to="/assigned-projects"
                className={`group block p-5 rounded-xl ${CARD} ${CARD_HOVER} hover:border-emerald-500/30 transition-all duration-300 no-underline`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold ${TEXT_1} text-sm mb-1 truncate group-hover:text-emerald-400 transition-colors`}>
                            {project.title}
                        </h4>
                        <p className={`text-xs ${TEXT_3} line-clamp-2`}>{project.description}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border} whitespace-nowrap`}>
                        {s.label}
                    </span>
                </div>
                <div className={`flex items-center justify-between pt-3 border-t border-white/[0.06]`}>
                    <span className={`text-xs ${TEXT_3} flex items-center gap-1.5`}>
                        <Award size={12} /> {project.client?.name || 'Client'}
                    </span>
                    <span className="text-sm font-bold text-emerald-400">₹{project.budget}</span>
                </div>
            </Link>
        </motion.div>
    )
})

// ─── Section Wrapper ───────────────────────────────────────────────────────────
const Section = memo(function Section({ title, badge, icon, delay = 0, children }) {
    return (
        <motion.div {...fadeUp(delay)} className={`${CARD} rounded-2xl overflow-hidden`}>
            <div className="px-5 sm:px-6 pt-5 pb-4 sm:pt-6 flex items-center justify-between border-b border-white/[0.06]">
                <h3 className={`text-base font-semibold ${TEXT_1} flex items-center gap-2.5`}>
                    {icon && <span className="opacity-70">{icon}</span>}
                    {title}
                </h3>
                {badge && (
                    <span className={`text-xs ${TEXT_3} bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]`}>
                        {badge}
                    </span>
                )}
            </div>
            <div className="p-5 sm:p-6">{children}</div>
        </motion.div>
    )
})

// ─── Empty Portfolio ───────────────────────────────────────────────────────────
const EmptyPortfolio = () => (
    <div className="flex flex-col items-center py-14 text-center">
        <span className="text-5xl mb-3 opacity-25">🗂</span>
        <p className={`text-sm ${TEXT_3}`}>No portfolio projects yet</p>
    </div>
)

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — all logic unchanged
// ══════════════════════════════════════════════════════════════════════════════
const FreelancerProfile = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { id } = useParams()
    const { user } = useSelector(s => s.auth)

    const { freelancer, freelancerLoading, freelancerError, freelancerErrorMessage } = useSelector(s => s.freelancer)
    const { assignedProjects } = useSelector(s => s.project)

    const [isSaved, setIsSaved] = useState(false)
    const [msgLoading, setMsgLoading] = useState(false)

    const isOwnProfile = user?._id === id
    const { displayed, wordIdx } = useTypewriter(WORDS)

    useEffect(() => { if (id) dispatch(getFreelancer(id)) }, [dispatch, id])
    useEffect(() => { if (freelancerError && freelancerErrorMessage) toast.error(freelancerErrorMessage) }, [freelancerError, freelancerErrorMessage])
    useEffect(() => { if (isOwnProfile) dispatch(getAssignedProjects()) }, [isOwnProfile, dispatch])

    useEffect(() => {
        if (isOwnProfile) {
            const socket = getSocket()
            if (socket) {
                const handleProjectAssigned = (project) => {
                    dispatch(addAssignedProject(project))
                    toast.success(`🎉 New project assigned: "${project.title}"!`, { position: 'top-right', autoClose: 5000 })
                }
                socket.on('projectAssigned', handleProjectAssigned)
                return () => socket.off('projectAssigned', handleProjectAssigned)
            }
        }
    }, [isOwnProfile, dispatch])

    const handleContact = useCallback(async () => {
        if (!user) { toast.error('Please login to send a message'); navigate('/login'); return }
        const profile = freelancer?.profile
        const profileUser = profile?.user
        const receiverId = profileUser?._id
        if (!receiverId) { toast.error('Could not find freelancer details'); return }
        if (receiverId === user._id) { toast.error("You can't message yourself!"); return }

        setMsgLoading(true)
        try {
            await dispatch(getOrCreateConversation({ receiverId })).unwrap()
            navigate('/chat')
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Could not start conversation. Try again.')
        } finally {
            setMsgLoading(false)
        }
    }, [user, freelancer, navigate, dispatch])

    if (freelancerLoading) return <LoaderGradient />

    const profile = freelancer?.profile
    const profileUser = profile?.user
    const works = freelancer?.previousWorks || []

    return (
        <div className="min-h-screen bg-[#020617]" style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
                * { box-sizing: border-box }
                .line-clamp-2 { display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden }
                .line-clamp-3 { display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden }
            `}</style>

            {/* ── Hero ── */}
            <HeroBanner displayed={displayed} wordIdx={wordIdx} />

            {/* ── Content ── */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">

                {/* Profile */}
                <ProfileCard
                    profile={profile}
                    profileUser={profileUser}
                    works={works}
                    isOwnProfile={isOwnProfile}
                    onContact={handleContact}
                    msgLoading={msgLoading}
                    isSaved={isSaved}
                    onSave={() => setIsSaved(v => !v)}
                />

                {/* Skills */}
                <SkillsSection skills={profile?.skills} />

                {/* Portfolio */}
                <Section title="Portfolio" badge={`${works.length} projects`} delay={0.3}>
                    {works.length === 0
                        ? <EmptyPortfolio />
                        : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {works.map((p, i) => <PortfolioCard key={p._id} project={p} index={i} />)}
                            </div>
                        )}
                </Section>

                {/* Reviews */}
                <Section
                    title="Client Reviews"
                    icon={<Star size={16} className="text-amber-400" />}
                    delay={0.4}
                >
                    <RatingSummary
                        userId={id}
                        currentUserId={user?._id}
                        userType="freelancer"
                        onRatingChange={() => dispatch(getFreelancer(id))}
                    />
                </Section>

                {/* Assigned Projects — own profile only */}
                {isOwnProfile && assignedProjects && assignedProjects.length > 0 && (
                    <Section
                        title="Assigned Projects"
                        badge={`${assignedProjects.length} active`}
                        icon={<Zap size={15} className="text-emerald-400" />}
                        delay={0.5}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {assignedProjects.map((p, i) => (
                                <AssignedProjectCard key={p._id} project={p} index={i} />
                            ))}
                        </div>
                        <Link to="/assigned-projects"
                            className={`inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 
                                hover:text-emerald-300 transition-colors no-underline group`}>
                            <Briefcase size={14} />
                            View all assigned projects
                            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </Section>
                )}

                {/* CTA — other profiles only */}
                {!isOwnProfile && (
                    <motion.div
                        {...fadeUp(0.6)}
                        className="relative rounded-2xl p-8 sm:p-12 text-center overflow-hidden"
                        style={{ background: 'linear-gradient(135deg,#0a1628 0%,#0d1f3c 50%,#0a1628 100%)' }}
                    >
                        {/* glow blobs */}
                        <div className="pointer-events-none absolute -top-20 -right-10 w-72 h-72 rounded-full opacity-20"
                            style={{ background: 'radial-gradient(circle,#3b82f6 0%,transparent 65%)' }} />
                        <div className="pointer-events-none absolute -bottom-16 -left-8 w-56 h-56 rounded-full opacity-15"
                            style={{ background: 'radial-gradient(circle,#06b6d4 0%,transparent 65%)' }} />
                        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
                            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

                        <div className="relative z-10">
                            <h3 className={`text-2xl sm:text-3xl font-bold ${TEXT_1} mb-2`}>
                                Ready to work together?
                            </h3>
                            <p className={`text-sm ${TEXT_2} mb-7 max-w-sm mx-auto leading-relaxed`}>
                                Let's discuss your project and make it happen.
                            </p>
                            <PrimaryBtn
                                onClick={handleContact}
                                disabled={msgLoading}
                                loading={msgLoading}
                                icon={<MessageCircle size={16} />}
                                label="Send Project Details ↗"
                                className="mx-auto"
                            />
                        </div>
                    </motion.div>
                )}

                {/* bottom spacer */}
                <div className="h-6" />
            </div>
        </div>
    )
}

export default FreelancerProfile