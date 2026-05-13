import { useEffect, useState, useCallback, memo } from 'react'
import {
    MapPin, Briefcase, Clock, MessageCircle, Heart, Share2,
    CheckCircle, Mail, Phone, Zap, Award, Star, ExternalLink,
    ChevronRight, Wallet, IndianRupee, Landmark,
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
import { motion, useReducedMotion } from 'framer-motion'
import { fetchMyWallet, fetchMyWithdrawals } from '../features/wallet/walletSlice'

const MotionDiv = motion.div
const MotionButton = motion.button

// ─── Design tokens ────────────────────────────────────────────────────────────
const ACCENT = 'from-blue-500 to-cyan-400'
const ACCENT_BG = 'bg-gradient-to-r from-blue-500 to-cyan-400'
const CARD = 'bg-slate-50/40 border border-slate-200 backdrop-blur-sm dark:bg-white/[0.03] dark:border-white/10'
const CARD_HOVER = 'hover:border-slate-300 hover:bg-slate-50/60 dark:hover:border-white/20 dark:hover:bg-white/[0.05]'
const TEXT_1 = 'text-slate-900 dark:text-white'
const TEXT_2 = 'text-slate-600 dark:text-white/60'
const TEXT_3 = 'text-slate-500 dark:text-white/35'

// fade-up variant used across sections
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay },
})

const getReveal = (delay = 0, reducedMotion = false) => (reducedMotion ? {} : fadeUp(delay))

function useAdaptiveMotion() {
    const prefersReducedMotion = useReducedMotion()
    const [coarsePointer, setCoarsePointer] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return

        const mediaQuery = window.matchMedia('(pointer: coarse)')
        const update = () => setCoarsePointer(mediaQuery.matches)

        update()

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', update)
            return () => mediaQuery.removeEventListener('change', update)
        }

        mediaQuery.addListener(update)
        return () => mediaQuery.removeListener(update)
    }, [])

    return prefersReducedMotion || coarsePointer
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────
const HeroBanner = memo(function HeroBanner({
    profile,
    profileUser,
    works,
    isOwnProfile,
    assignedProjectsCount,
    onContact,
    msgLoading,
    reducedMotion,
}) {
    const heroFacts = [
        profile?.category || 'Freelancer',
        profile?.experience ? `${profile.experience} years experience` : 'Building portfolio',
        profileUser?.location || 'India',
        `${works.length} showcased projects`,
    ]

    const heroStats = [
        { label: 'Portfolio', value: works.length, tone: 'from-blue-500 to-cyan-400' },
        { label: isOwnProfile ? 'Assigned' : 'Response', value: isOwnProfile ? assignedProjectsCount : '< 2h', tone: 'from-violet-500 to-fuchsia-500' },
        { label: 'Status', value: isOwnProfile ? 'Your profile' : 'Available', tone: 'from-emerald-500 to-teal-400' },
    ]

    return (
        <section
            className="relative overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pb-14 bg-gradient-to-b from-slate-50 to-white dark:bg-gradient-to-b dark:from-[#020617] dark:to-slate-900"
            style={{}}
        >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className="absolute -right-12 top-0 h-72 w-72 rounded-full opacity-10 dark:opacity-25"
                    style={{ background: 'radial-gradient(circle,#38bdf855 0%,transparent 68%)' }}
                />
                <div
                    className="absolute -bottom-20 left-0 h-64 w-64 rounded-full opacity-10 dark:opacity-20"
                    style={{ background: 'radial-gradient(circle,#8b5cf655 0%,transparent 68%)' }}
                />
                <div
                    className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)', backgroundSize: '48px 48px' }}
                />
            </div>

            <div className="relative z-10 mx-auto max-w-5xl">
                <MotionDiv
                    {...getReveal(0, reducedMotion)}
                    className="rounded-[32px] border border-slate-200 bg-white/60 shadow-lg dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_24px_80px_-40px_rgba(59,130,246,0.45)] p-5 backdrop-blur-xl sm:p-7 lg:p-8"
                >
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),320px] lg:items-end">
                        <div className="min-w-0">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                {isOwnProfile ? 'Freelancer dashboard view' : 'Available for work'}
                            </div>

                            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                                {profileUser?.profilePic ? (
                                    <img
                                        src={profileUser.profilePic}
                                        alt={profileUser?.name || 'Freelancer'}
                                        className="h-24 w-24 rounded-[28px] object-cover ring-4 ring-slate-200 shadow-2xl dark:ring-white/10"
                                    />
                                ) : (
                                    <div className={`flex h-24 w-24 items-center justify-center rounded-[28px] ${ACCENT_BG} text-3xl font-black text-white shadow-2xl`}>
                                        {profileUser?.name?.[0] || 'F'}
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                                        {profileUser?.name || 'Freelancer'}
                                    </h1>
                                    <p className="mt-2 text-sm font-semibold text-blue-600 dark:text-cyan-200 sm:text-base">
                                        {profile?.category || 'Independent freelancer'}
                                    </p>
                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-white/65 sm:text-base">
                                        {profile?.description || 'This profile needs a sharper summary. Add proof of work, clearer positioning, and stronger category focus.'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2.5">
                                {heroFacts.map((fact) => (
                                    <span key={fact} className="rounded-full border border-slate-200 bg-slate-100/50 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70">
                                        {fact}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                {isOwnProfile ? (
                                    <>
                                        <Link
                                            to="/auth/profile"
                                            className={`inline-flex items-center justify-center gap-2 rounded-2xl ${ACCENT_BG} px-5 py-3 text-sm font-bold text-white no-underline transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25`}
                                        >
                                            Manage Profile
                                        </Link>
                                        <Link
                                            to="/assigned-projects"
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-100/50 px-5 py-3 text-sm font-semibold text-slate-700 no-underline transition hover:border-slate-400 hover:bg-slate-200/50 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.05] dark:px-5 dark:py-3 dark:text-white/75 dark:hover:border-white/20 dark:hover:bg-white/[0.08] dark:hover:text-white"
                                        >
                                            View Assigned Work
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        onClick={onContact}
                                        disabled={msgLoading}
                                        className={`inline-flex items-center justify-center gap-2 rounded-2xl ${ACCENT_BG} px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60`}
                                    >
                                        <MessageCircle size={16} />
                                        {msgLoading ? 'Opening chat...' : 'Message Freelancer'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                            {heroStats.map((stat) => (
                                <div key={stat.label} className="rounded-[24px] border border-slate-200 bg-slate-100/40 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-black/20">
                                    <div className={`inline-flex rounded-full bg-gradient-to-r ${stat.tone} px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white`}>
                                        {stat.label}
                                    </div>
                                    <div className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</div>
                                    <div className="mt-1 text-sm text-slate-600 dark:text-white/45">
                                        {stat.label === 'Portfolio'
                                            ? 'Visible proof of work'
                                            : stat.label === 'Assigned'
                                                ? 'Active work linked to this account'
                                                : stat.label === 'Response'
                                                    ? 'Expected first reply'
                                                    : 'Current profile availability'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </MotionDiv>
            </div>
        </section>
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
                    className={`${dim} rounded-2xl object-cover ring-2 ring-slate-200 shadow-2xl dark:ring-white/10`} />
            ) : (
                <div className={`${dim} rounded-2xl ${ACCENT_BG} flex items-center justify-center ${txt} font-bold text-white shadow-2xl`}>
                    {profileUser?.name?.[0] || 'F'}
                </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white dark:border-[#020617] shadow-lg shadow-emerald-400/40" />
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
            <span className="text-blue-500 dark:text-blue-400 flex-shrink-0">{icon}</span>
            <span className={`${TEXT_2} truncate`}>{text}</span>
        </div>
    )
})

// ─── Primary Button ───────────────────────────────────────────────────────────
const PrimaryBtn = memo(function PrimaryBtn({ onClick, disabled, loading, icon, label, className = '' }) {
    return (
        <MotionButton
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
        </MotionButton>
    )
})

// ─── Ghost Button ─────────────────────────────────────────────────────────────
const GhostBtn = memo(function GhostBtn({ onClick, icon, label, active, className = '' }) {
    return (
        <MotionButton
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
        </MotionButton>
    )
})

// ─── Profile Card ─────────────────────────────────────────────────────────────
const ProfileCard = memo(function ProfileCard({ profile, profileUser, works, isOwnProfile, onContact, msgLoading, isSaved, onSave, reducedMotion }) {
    return (
        <MotionDiv {...getReveal(0.1, reducedMotion)} className={`${CARD} rounded-2xl overflow-hidden`}>
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
        </MotionDiv>
    )
})

// ─── Skills Section ────────────────────────────────────────────────────────────
const SkillsSection = memo(function SkillsSection({ skills, reducedMotion }) {
    const list = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []
    if (list.length === 0) return null

    // alternate between two subtle tints
    const tints = [
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
        'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20'
    ]

    return (
        <MotionDiv {...getReveal(0.2, reducedMotion)} className={`${CARD} rounded-2xl p-5 sm:p-6`}>
            <h3 className={`text-base font-semibold ${TEXT_1} mb-4`}>Skills</h3>
            <div className="flex flex-wrap gap-2">
                {list.map((sk, i) => (
                    <span key={i}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${tints[i % 2]}`}>
                        {sk}
                    </span>
                ))}
            </div>
        </MotionDiv>
    )
})

// ─── Portfolio Card ────────────────────────────────────────────────────────────
const PortfolioCard = memo(function PortfolioCard({ project, index, reducedMotion }) {
    return (
        <MotionDiv
            {...getReveal(0.1 + index * 0.07, reducedMotion)}
            whileHover={reducedMotion ? undefined : { y: -4 }}
            className={`${CARD} ${CARD_HOVER} rounded-2xl overflow-hidden group transition-all duration-300 cursor-default`}
        >
            <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-500/5 dark:to-cyan-500/5">
                {project.projectImage ? (
                    <img src={project.projectImage} alt="project"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.target.style.display = 'none' }} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🖼</div>
                )}
                {/* subtle overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 dark:from-[#020617]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
        </MotionDiv>
    )
})

// ─── Assigned Project Card ─────────────────────────────────────────────────────
const AssignedProjectCard = memo(function AssignedProjectCard({ project, index, reducedMotion }) {
    const statusMap = {
        'accepted': { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/25', label: '💳 Pending Payment' },
        'in-progress': { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/25', label: '🔄 In Progress' },
        'completed': { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/25', label: '✅ Completed' },
    }
    const s = statusMap[project.status] || statusMap['accepted']

    return (
        <MotionDiv
            {...getReveal(index * 0.07, reducedMotion)}
        >
            <Link to="/assigned-projects"
                className={`group block p-5 rounded-xl ${CARD} ${CARD_HOVER} hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all duration-300 no-underline`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold ${TEXT_1} text-sm mb-1 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors`}>
                            {project.title}
                        </h4>
                        <p className={`text-xs ${TEXT_3} line-clamp-2`}>{project.description}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border} whitespace-nowrap`}>
                        {s.label}
                    </span>
                </div>
                <div className={`flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/[0.06]`}>
                    <span className={`text-xs ${TEXT_3} flex items-center gap-1.5`}>
                        <Award size={12} /> {project.client?.name || 'Client'}
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{project.budget}</span>
                </div>
            </Link>
        </MotionDiv>
    )
})

// ─── Section Wrapper ───────────────────────────────────────────────────────────
const Section = memo(function Section({ title, badge, icon, delay = 0, children, reducedMotion }) {
    return (
        <MotionDiv {...getReveal(delay, reducedMotion)} className={`${CARD} rounded-2xl overflow-hidden`}>
            <div className="px-5 sm:px-6 pt-5 pb-4 sm:pt-6 flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06]">
                <h3 className={`text-base font-semibold ${TEXT_1} flex items-center gap-2.5`}>
                    {icon && <span className="opacity-70">{icon}</span>}
                    {title}
                </h3>
                {badge && (
                    <span className={`text-xs ${TEXT_3} bg-slate-100 dark:bg-white/[0.04] px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/[0.06]`}>
                        {badge}
                    </span>
                )}
            </div>
            <div className="p-5 sm:p-6">{children}</div>
        </MotionDiv>
    )
})

// ─── Empty Portfolio ───────────────────────────────────────────────────────────
const EmptyPortfolio = () => (
    <div className="flex flex-col items-center py-14 text-center">
        <span className="text-5xl mb-3 opacity-25">🗂</span>
        <p className={`text-sm ${TEXT_3}`}>No portfolio projects yet</p>
    </div>
)

const formatMoney = (value = 0) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const WalletSnapshot = memo(function WalletSnapshot({ wallet, withdrawals = [], loading, reducedMotion }) {
    const available = Number(wallet?.balance || 0)
    const pending = Number(wallet?.pendingBalance || 0)
    const recentWithdrawals = withdrawals.slice(0, 2)
    const canWithdraw = available > 19

    return (
        <MotionDiv {...getReveal(0.22, reducedMotion)} className={`${CARD} rounded-2xl overflow-hidden`}>
            <div className="border-b border-slate-200 px-5 py-4 dark:border-white/[0.06] sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <h3 className={`text-base font-semibold ${TEXT_1}`}>Freelancer wallet</h3>
                            <p className={`text-xs ${TEXT_3}`}>Withdraw by UPI or bank account</p>
                        </div>
                    </div>
                    <Link
                        to="/freelancer/wallet"
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold no-underline transition ${
                            canWithdraw
                                ? 'bg-gradient-to-r from-emerald-600 to-cyan-500 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20'
                                : `${CARD} ${TEXT_2} hover:border-slate-300 dark:hover:border-white/20`
                        }`}
                    >
                        <Landmark size={16} />
                        {canWithdraw ? 'Withdraw funds' : 'Open wallet'}
                    </Link>
                </div>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                {[
                    { label: 'Withdrawable', value: available, icon: <IndianRupee size={18} />, tone: 'from-emerald-500 to-teal-400' },
                    { label: 'Pending clearance', value: pending, icon: <Clock size={18} />, tone: 'from-amber-500 to-orange-400' },
                    { label: 'Total in wallet', value: available + pending, icon: <Award size={18} />, tone: 'from-blue-500 to-cyan-400' },
                ].map(item => (
                    <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.tone} text-white`}>
                            {item.icon}
                        </div>
                        <p className={`text-xl font-black ${TEXT_1}`}>{loading ? '...' : formatMoney(item.value)}</p>
                        <p className={`mt-1 text-[10px] font-bold uppercase tracking-[0.16em] ${TEXT_3}`}>{item.label}</p>
                    </div>
                ))}
            </div>

            {recentWithdrawals.length > 0 && (
                <div className="border-t border-slate-200 px-5 py-4 dark:border-white/[0.06] sm:px-6">
                    <div className="mb-3 flex items-center justify-between">
                        <p className={`text-xs font-bold uppercase tracking-[0.18em] ${TEXT_3}`}>Recent withdrawals</p>
                        <Link to="/freelancer/wallet" className="text-xs font-bold text-blue-600 no-underline dark:text-cyan-200">View all</Link>
                    </div>
                    <div className="space-y-2">
                        {recentWithdrawals.map(withdrawal => (
                            <div key={withdrawal._id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-white/[0.045]">
                                <div className="min-w-0">
                                    <p className={`truncate text-sm font-bold ${TEXT_1}`}>{formatMoney(withdrawal.amount)}</p>
                                    <p className={`text-xs ${TEXT_3}`}>{withdrawal.method === 'bank' ? 'Bank account' : withdrawal.upiId || 'UPI'}</p>
                                </div>
                                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold capitalize text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/60">
                                    {withdrawal.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </MotionDiv>
    )
})

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
    const { wallet, withdrawals, loading: walletLoading } = useSelector(s => s.wallet)

    const [isSaved, setIsSaved] = useState(false)
    const [msgLoading, setMsgLoading] = useState(false)

    const isOwnProfile = user?._id === id
    const reducedMotion = useAdaptiveMotion()

    useEffect(() => { if (id) dispatch(getFreelancer(id)) }, [dispatch, id])
    useEffect(() => { if (freelancerError && freelancerErrorMessage) toast.error(freelancerErrorMessage) }, [freelancerError, freelancerErrorMessage])
    useEffect(() => { if (isOwnProfile) dispatch(getAssignedProjects()) }, [isOwnProfile, dispatch])
    useEffect(() => {
        if (isOwnProfile) {
            dispatch(fetchMyWallet())
            dispatch(fetchMyWithdrawals())
        }
    }, [isOwnProfile, dispatch])

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
        <div className="min-h-screen bg-white dark:bg-[#020617]" style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
            <style>{`
                * { box-sizing: border-box }
                .line-clamp-2 { display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden }
                .line-clamp-3 { display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden }
            `}</style>

            {/* ── Hero ── */}
            {/* <HeroBanner
                profile={profile}
                profileUser={profileUser}
                works={works}
                isOwnProfile={isOwnProfile}
                assignedProjectsCount={assignedProjects?.length || 0}
                onContact={handleContact}
                msgLoading={msgLoading}
                reducedMotion={reducedMotion}
            /> */}

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
                    reducedMotion={reducedMotion}
                />

                {isOwnProfile && (
                    <WalletSnapshot
                        wallet={wallet}
                        withdrawals={withdrawals}
                        loading={walletLoading}
                        reducedMotion={reducedMotion}
                    />
                )}

                {/* Skills */}
                <SkillsSection skills={profile?.skills} reducedMotion={reducedMotion} />

                {/* Portfolio */}
                <Section title="Portfolio" badge={`${works.length} projects`} delay={0.3} reducedMotion={reducedMotion}>
                    {works.length === 0
                        ? <EmptyPortfolio />
                        : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {works.map((p, i) => <PortfolioCard key={p._id} project={p} index={i} reducedMotion={reducedMotion} />)}
                            </div>
                        )}
                </Section>

                {/* Reviews */}
                <Section
                    title="Client Reviews"
                    icon={<Star size={16} className="text-amber-400" />}
                    delay={0.4}
                    reducedMotion={reducedMotion}
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
                        reducedMotion={reducedMotion}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {assignedProjects.map((p, i) => (
                                <AssignedProjectCard key={p._id} project={p} index={i} reducedMotion={reducedMotion} />
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
                    <MotionDiv
                        {...getReveal(0.6, reducedMotion)}
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
                    </MotionDiv>
                )}

                {/* bottom spacer */}
                <div className="h-6" />
            </div>
        </div>
    )
}

export default FreelancerProfile
