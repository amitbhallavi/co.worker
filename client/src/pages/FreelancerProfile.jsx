import React, { useEffect, useState, useCallback, memo } from 'react'
import { MapPin, Briefcase, Clock, MessageCircle, Heart, Share2, CheckCircle, Mail, Phone, Zap, Award, Star, ExternalLink } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { getFreelancer } from '../features/Freelancer/freelancerSlice'
import { getAssignedProjects, addAssignedProject } from '../features/project/projectSlice'
import { fetchRatings } from '../features/rating/ratingSlice'
import { Link, useParams, useNavigate } from 'react-router-dom'
import LoaderGradient from '../components/LoaderGradient'
import { TbArrowsJoin2 } from 'react-icons/tb'
import { getOrCreateConversation } from '../features/ChatsAndMessages/chatSlice'
import { getSocket } from '../utils/socketManager'
import RatingSummary from '../components/RatingSummary'
import { motion , AnimatePresence } from 'framer-motion'

// ── Typewriter Hook ────────────────────────────────────────
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
            } else { setWordIdx(i => (i + 1) % words.length); setPhase('typing') }
        }
        return () => clearTimeout(timer)
    }, [phase, charIdx, wordIdx])

    return { displayed, wordIdx }
}

// ── Hero Banner ────────────────────────────────────────────
const HeroBanner = memo(function HeroBanner({ displayed, wordIdx }) {
    const colors = [
        { from: '#3B82F6', to: '#06B6D4' },
        { from: '#8B5CF6', to: '#EC4899' },
        { from: '#F59E0B', to: '#EF4444' },
        { from: '#10B981', to: '#3B82F6' },
        { from: '#F43F5E', to: '#8B5CF6' },
    ]
    const color = colors[wordIdx]

    return (
        <div className="relative overflow-hidden px-6 sm:px-10 pt-14 pb-16 bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a]">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute w-[500px] h-[500px] rounded-full -top-40 right-0 opacity-20"
                    style={{ background: `radial-gradient(circle,${color.from}40 0%,transparent 70%)` }} />
                <div className="absolute w-80 h-80 rounded-full -bottom-40 left-10 opacity-15"
                    style={{ background: `radial-gradient(circle,${color.to}40 0%,transparent 70%)` }} />
            </div>

            <div className="relative z-10 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 bg-white/[0.05] border border-white/10 backdrop-blur-xl"
                >
                    <span className="relative flex w-2 h-2">
                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                        <span className="relative rounded-full bg-emerald-400 w-2 h-2" />
                    </span>
                    <span className="text-xs font-medium text-white/70">10,000+ verified experts online</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4"
                >
                    Hire the Best
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center flex-wrap gap-2 mb-4"
                >
                    <span className="text-3xl sm:text-4xl font-extrabold"
                        style={{ backgroundImage: `linear-gradient(135deg,${color.from},${color.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        {displayed}
                    </span>
                </motion.div>

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="h-1 w-48 rounded-full mb-5"
                    style={{ background: `linear-gradient(90deg,${color.from},${color.to})` }}
                />

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-base text-white/50 max-w-lg leading-relaxed mb-6"
                >
                    Connect with top-tier freelancers who deliver results — on time, every time.
                </motion.p>

                <div className="flex flex-wrap gap-2">
                    {['Web Developers', 'UI/UX Designers', 'Marketers', 'Data Experts', 'Full-Stack Devs'].map((w, i) => (
                        <motion.span
                            key={w}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + i * 0.05 }}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300"
                            style={{
                                background: i === wordIdx ? `linear-gradient(135deg,${colors[i].from},${colors[i].to})` : 'rgba(255,255,255,0.05)',
                                color: i === wordIdx ? 'white' : 'rgba(255,255,255,0.45)',
                                border: i === wordIdx ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            {w}
                        </motion.span>
                    ))}
                </div>
            </div>
        </div>
    )
})

// ── Profile Card ────────────────────────────────────────────
const ProfileCard = memo(function ProfileCard({ profile, profileUser, works, isOwnProfile, onContact, msgLoading, isSaved, onSave }) {
    const gradients = ['from-blue-500 to-cyan-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500']
    const gradient = gradients[(profileUser?.name?.charCodeAt(0) || 0) % gradients.length]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
        >
            <div className={`h-1 bg-gradient-to-r ${gradient}`} />

            <div className="p-6 sm:p-8 flex flex-wrap gap-6">
                {/* Avatar + Stats */}
                <div className="flex flex-col items-center gap-4 min-w-[160px]">
                    <div className="relative">
                        {profileUser?.profilePic ? (
                            <img src={profileUser.profilePic} alt={profileUser.name}
                                className="w-28 h-28 rounded-2xl object-cover ring-4 ring-white/10 shadow-2xl" />
                        ) : (
                            <div className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-4xl font-bold text-white shadow-2xl`}>
                                {profileUser?.name?.[0] || 'F'}
                            </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-4 border-[#0f172a]" />
                    </div>

                    <div className="w-full space-y-2">
                        {[
                            { icon: <Briefcase size={14} />, label: 'Projects', value: works.length },
                            { icon: <CheckCircle size={14} />, label: 'Success', value: `${works.length > 0 ? 98 : 0}%` },
                            { icon: <Clock size={14} />, label: 'Response', value: '< 2h' },
                        ].map(s => (
                            <div key={s.label} className="flex items-center gap-2 text-[13px] bg-white/[0.03] rounded-xl px-3 py-2 border border-white/5">
                                <span className={`bg-gradient-to-br ${gradient} p-1 rounded-lg text-white`}>{s.icon}</span>
                                <span className="flex-1 text-white/40">{s.label}</span>
                                <span className="font-bold text-white">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-[220px] space-y-4">
                    <div className="flex flex-wrap justify-between gap-3">
                        <div>
                            <h2 className="text-3xl font-extrabold text-white mb-1">{profileUser?.name || 'Freelancer'}</h2>
                            <p className={`text-sm font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                                {profile?.category || 'Category'}
                            </p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            {[
                                { label: 'Credits', value: profileUser?.credits ?? '—' },
                                { label: 'Experience', value: profile?.experience ? `${profile.experience}y` : '—' },
                            ].map(b => (
                                <div key={b.label} className={`bg-gradient-to-br ${gradient} rounded-xl px-4 py-2.5 text-center shadow-lg`}>
                                    <div className="text-2xl font-extrabold text-white">{b.value}</div>
                                    <div className="text-[11px] text-white/70 font-medium">{b.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                            { icon: <Mail size={14} />, text: profileUser?.email },
                            { icon: <Phone size={14} />, text: profileUser?.phone },
                            { icon: <MapPin size={14} />, text: profileUser?.location || 'India' },
                            { icon: <TbArrowsJoin2 size={14} />, text: profileUser?.createdAt ? `Joined ${new Date(profileUser.createdAt).toLocaleDateString('en-IN')}` : null },
                        ].map((row, i) => row.text && (
                            <div key={i} className="flex items-center gap-2 text-[13px] text-white/40 bg-white/[0.02] rounded-lg px-3 py-2 border border-white/5">
                                <span className={`bg-gradient-to-br ${gradient} p-1 rounded text-white`}>{row.icon}</span>
                                <span className="text-white/60 truncate">{row.text}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm text-white/50 leading-relaxed bg-white/[0.02] px-4 py-3 rounded-xl border border-white/5 border-l-2 border-l-blue-500">
                        {profile?.description || 'No description provided.'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onContact}
                            disabled={msgLoading || isOwnProfile}
                            className={`flex items-center gap-2 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all
                                ${msgLoading ? 'opacity-70 cursor-not-allowed' : isOwnProfile ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                bg-gradient-to-r ${gradient} shadow-lg`}
                        >
                            {msgLoading ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <MessageCircle size={16} />
                            )}
                            {isOwnProfile ? 'Your Profile' : msgLoading ? 'Opening...' : 'Message'}
                        </motion.button>

                        {!isOwnProfile && (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onSave}
                                    className={`flex items-center gap-2 font-semibold text-sm px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer
                                        ${isSaved ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-white/[0.05] text-white/70 border-white/10 hover:bg-white/[0.1] hover:border-white/20'}`}
                                >
                                    <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
                                    {isSaved ? 'Saved' : 'Save'}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 bg-white/[0.05] text-white/70 font-semibold text-sm px-4 py-3 rounded-xl border border-white/10 hover:bg-white/[0.1] hover:border-white/20 transition-all cursor-pointer">
                                    <Share2 size={16} /> Share
                                </motion.button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
})

// ── Skills Section ─────────────────────────────────────────
const SkillsSection = memo(function SkillsSection({ skills }) {
    const list = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []
    const gradients = ['from-blue-500 to-cyan-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500']

    if (list.length === 0) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
            <h3 className="text-lg font-bold text-white mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
                {list.map((sk, i) => {
                    const g = gradients[i % gradients.length]
                    return (
                        <span key={i} className={`px-4 py-1.5 rounded-full text-[13px] font-semibold bg-gradient-to-r ${g} bg-opacity-10 text-white border border-white/10`}>
                            {sk}
                        </span>
                    )
                })}
            </div>
        </motion.div>
    )
})

// ── Portfolio Card ───────────────────────────────────────────
const PortfolioCard = memo(function PortfolioCard({ project, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:shadow-xl transition-all duration-300 group"
        >
            {project.projectImage ? (
                <img src={project.projectImage} alt="project"
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
            ) : null}
            <div className={`w-full h-40 flex items-center justify-center text-4xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 ${project.projectImage ? 'hidden' : 'flex'}`}>
                🖼
            </div>
            <div className="p-4">
                <p className="text-[13px] text-white/50 leading-relaxed mb-3 line-clamp-3">
                    {project.projectDescription || 'No description'}
                </p>
                {project.projectLink && (
                    <a href={project.projectLink} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-1.5 rounded-lg no-underline bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg transition-all">
                        <ExternalLink size={12} /> View Project
                    </a>
                )}
            </div>
        </motion.div>
    )
})

// ── Assigned Project Card ──────────────────────────────────
const AssignedProjectCard = memo(function AssignedProjectCard({ project, index }) {
    const statusConfig = {
        'accepted': { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: '💳 Pending Payment' },
        'in-progress': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: '🔄 In Progress' },
        'completed': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: '✅ Completed' },
    }
    const status = statusConfig[project.status] || statusConfig['accepted']

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
        >
            <Link to="/assigned-projects"
                className="group block p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-sm mb-1 group-hover:text-emerald-400 transition-colors">{project.title}</h3>
                        <p className="text-xs text-white/40 line-clamp-2">{project.description}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${status.bg} ${status.text} border ${status.border}`}>
                        {status.label}
                    </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-xs text-white/40 flex items-center gap-1">
                        <Award size={12} /> By {project.client?.name || 'Client'}
                    </span>
                    <span className="text-sm font-bold text-emerald-400">₹{project.budget}</span>
                </div>
            </Link>
        </motion.div>
    )
})

// ══════════════════════════════════════════════════════════
const FreelancerProfile = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { id } = useParams()
    const { user } = useSelector(s => s.auth)

    const { freelancer, freelancerLoading, freelancerError, freelancerErrorMessage } = useSelector(s => s.freelancer)
    const { assignedProjects } = useSelector(s => s.project)
    const { ratings, averageRating, totalReviews } = useSelector(s => s.rating)

    const [isSaved, setIsSaved] = useState(false)
    const [msgLoading, setMsgLoading] = useState(false)

    const isOwnProfile = user?._id === id
    const { displayed, wordIdx } = useTypewriter(['Web Developers', 'UI/UX Designers', 'Marketers', 'Data Experts', 'Full-Stack Devs'])

    useEffect(() => { if (id) dispatch(getFreelancer(id)) }, [dispatch, id])
    useEffect(() => { if (freelancerError && freelancerErrorMessage) toast.error(freelancerErrorMessage) }, [freelancerError, freelancerErrorMessage])
    useEffect(() => { if (id) dispatch(fetchRatings({ userId: id })) }, [id, dispatch])
    useEffect(() => { if (isOwnProfile) dispatch(getAssignedProjects()) }, [isOwnProfile, dispatch])

    // Socket.IO listener for real-time project assignment
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
        <div className="min-h-screen bg-[#020617]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

            <HeroBanner displayed={displayed} wordIdx={wordIdx} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Profile Card */}
                <ProfileCard
                    profile={profile}
                    profileUser={profileUser}
                    works={works}
                    isOwnProfile={isOwnProfile}
                    onContact={handleContact}
                    msgLoading={msgLoading}
                    isSaved={isSaved}
                    onSave={() => setIsSaved(!isSaved)}
                />

                {/* Skills */}
                <SkillsSection skills={profile?.skills} />

                {/* Portfolio */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-white">Portfolio</h3>
                        <span className="text-[13px] text-white/40 bg-white/[0.03] px-3 py-1 rounded-full border border-white/5">{works.length} projects</span>
                    </div>

                    {works.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-3">🗂</div>
                            <p className="text-sm text-white/40">No portfolio projects yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {works.map((p, i) => <PortfolioCard key={p._id} project={p} index={i} />)}
                        </div>
                    )}
                </motion.div>

                {/* Ratings & Reviews */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Star className="text-amber-400" size={18} /> Client Reviews
                    </h3>
                    <RatingSummary
                        userId={id}
                        currentUserId={user?._id}
                        userType="freelancer"
                        onRatingChange={() => dispatch(getFreelancer(id))}
                    />
                </motion.div>

                {/* Assigned Projects (Own Profile Only) */}
                {isOwnProfile && assignedProjects && assignedProjects.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <Zap className="text-emerald-400" size={18} />
                                </div>
                                <h3 className="text-lg font-bold text-white">Assigned Projects</h3>
                            </div>
                            <span className="text-[13px] text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 font-semibold">
                                {assignedProjects.length} active
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {assignedProjects.map((project, i) => (
                                <AssignedProjectCard key={project._id} project={project} index={i} />
                            ))}
                        </div>

                        <Link to="/assigned-projects"
                            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                            <Briefcase size={14} /> View All Assigned Projects
                        </Link>
                    </motion.div>
                )}

                {/* CTA */}
                {!isOwnProfile && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="relative rounded-2xl p-10 text-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a]"
                    >
                        <div className="absolute w-72 h-72 rounded-full pointer-events-none -top-24 -right-12"
                            style={{ background: 'radial-gradient(circle,rgba(59,130,246,0.15) 0%,transparent 70%)' }} />
                        <div className="absolute w-48 h-48 rounded-full pointer-events-none -bottom-12 left-[5%]"
                            style={{ background: 'radial-gradient(circle,rgba(43,196,212,0.12) 0%,transparent 70%)' }} />

                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 relative">
                            Ready to work together?
                        </h3>
                        <p className="text-sm text-white/50 mb-6 relative max-w-md mx-auto">
                            Let's discuss your project and make it happen.
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleContact}
                            disabled={msgLoading}
                            className="relative text-white font-bold text-[15px] px-8 py-3.5 rounded-xl border-none cursor-pointer bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center gap-2 mx-auto"
                        >
                            {msgLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {msgLoading ? 'Opening Chat...' : 'Send Project Details ↗'}
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default FreelancerProfile
