import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
    ArrowRight,
    Briefcase,
    CheckCircle2,
    Clock,
    CreditCard,
    Filter,
    IndianRupee,
    RefreshCw,
    Search,
    User,
    XCircle,
} from 'lucide-react'
import { getAssignedProjects, addAssignedProject } from '../features/project/projectSlice'
import LoaderGradient from '../components/LoaderGradient'
import { getSocket } from '../utils/socketManager'

const getInitials = (name = '') => {
    const initials = name
        .split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)

    return initials || 'CL'
}

const getTechnologies = (value = '') => (
    value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
        .slice(0, 4)
)

const STATUS_CONFIG = {
    accepted: {
        label: 'Pending Payment',
        shortLabel: 'Payment pending',
        description: 'Client has assigned the work. Escrow payment is still pending.',
        icon: CreditCard,
        badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100',
        accent: 'bg-amber-500',
        action: 'Wait for payment',
    },
    'in-progress': {
        label: 'In Progress',
        shortLabel: 'Live project',
        description: 'Escrow is active. Keep delivery moving and submit when ready.',
        icon: RefreshCw,
        badge: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-300/20 dark:bg-purple-400/10 dark:text-purple-100',
        accent: 'bg-purple-500',
        action: 'Open workspace',
    },
    completed: {
        label: 'Completed',
        shortLabel: 'Completed',
        description: 'Work has been marked complete. Track payment release from details.',
        icon: CheckCircle2,
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-100',
        accent: 'bg-emerald-500',
        action: 'View summary',
    },
    rejected: {
        label: 'Rejected',
        shortLabel: 'Rejected',
        description: 'This assignment is no longer active.',
        icon: XCircle,
        badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-100',
        accent: 'bg-rose-500',
        action: 'View details',
    },
    pending: {
        label: 'Pending',
        shortLabel: 'Pending',
        description: 'This project is waiting for confirmation.',
        icon: Clock,
        badge: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70',
        accent: 'bg-slate-400',
        action: 'View details',
    },
}

const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending

const StatCard = ({ label, value, caption, icon, tone }) => {
    const StatIcon = icon
    const tones = {
        blue: 'border-blue-200 bg-blue-50/80 text-blue-700 dark:border-blue-300/20 dark:bg-blue-400/10 dark:text-blue-100',
        amber: 'border-amber-200 bg-amber-50/80 text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100',
        purple: 'border-purple-200 bg-purple-50/80 text-purple-700 dark:border-purple-300/20 dark:bg-purple-400/10 dark:text-purple-100',
        emerald: 'border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-100',
    }

    return (
        <div className={`rounded-2xl border p-5 shadow-sm backdrop-blur ${tones[tone]}`}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">{label}</p>
                    <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/75 text-slate-900 shadow-sm dark:bg-white/10 dark:text-white">
                    <StatIcon size={20} />
                </div>
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500 dark:text-white/45">{caption}</p>
        </div>
    )
}

const EmptyState = ({ hasFilters, onReset }) => (
    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-white/50">
            <Briefcase size={24} />
        </div>
        <h2 className="mt-5 text-xl font-black text-slate-950 dark:text-white">
            {hasFilters ? 'No projects match this view' : 'No assigned projects yet'}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-white/50">
            {hasFilters
                ? 'Clear the search or switch status to see the rest of your pipeline.'
                : 'Accepted and paid projects will appear here once clients move them into your workspace.'}
        </p>
        {hasFilters && (
            <button
                type="button"
                onClick={onReset}
                className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70 dark:hover:border-cyan-300/40 dark:hover:text-white"
            >
                Clear filters
            </button>
        )}
    </div>
)

const AssignedProjects = () => {
    const dispatch = useDispatch()
    const {
        assignedProjects,
        projectLoading,
        projectError,
        projectErrorMessage,
    } = useSelector(s => s.project)

    const [filter, setFilter] = useState('all')
    const [query, setQuery] = useState('')

    useEffect(() => {
        dispatch(getAssignedProjects())
    }, [dispatch])

    useEffect(() => {
        const socket = getSocket()
        if (!socket) return undefined

        const handleProjectAssigned = (project) => {
            dispatch(addAssignedProject(project))
            toast.success(`Project "${project.title}" assigned to you`)
        }

        socket.on('projectAssigned', handleProjectAssigned)

        return () => {
            socket.off('projectAssigned', handleProjectAssigned)
        }
    }, [dispatch])

    const projects = useMemo(
        () => (Array.isArray(assignedProjects) ? assignedProjects : []),
        [assignedProjects]
    )

    const stats = useMemo(() => ({
        total: projects.length,
        pendingPayment: projects.filter(p => p.status === 'accepted').length,
        inProgress: projects.filter(p => p.status === 'in-progress').length,
        completed: projects.filter(p => p.status === 'completed').length,
    }), [projects])

    const normalizedQuery = query.trim().toLowerCase()

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesStatus =
                filter === 'all'
                || (filter === 'pending-payment' && project.status === 'accepted')
                || (filter === 'in-progress' && project.status === 'in-progress')
                || (filter === 'completed' && project.status === 'completed')

            if (!matchesStatus) return false
            if (!normalizedQuery) return true

            const haystack = [
                project.title,
                project.description,
                project.category,
                project.technology,
                project.user?.name,
                project.user?.email,
            ].filter(Boolean).join(' ').toLowerCase()

            return haystack.includes(normalizedQuery)
        })
    }, [filter, normalizedQuery, projects])

    const filterOptions = [
        { value: 'all', label: 'All', count: stats.total },
        { value: 'pending-payment', label: 'Pending payment', count: stats.pendingPayment },
        { value: 'in-progress', label: 'In progress', count: stats.inProgress },
        { value: 'completed', label: 'Completed', count: stats.completed },
    ]

    const activeProjects = stats.pendingPayment + stats.inProgress
    const hasFilters = filter !== 'all' || Boolean(normalizedQuery)

    if (projectLoading) return <LoaderGradient />

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f6f9fc] pt-20 pb-16 text-slate-950 dark:bg-[#020617] dark:text-white">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[390px] border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#eaf6ff_52%,rgba(246,249,252,0)_100%)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#071427_0%,#06101f_58%,rgba(2,6,23,0)_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)]" />

            <main className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <section className="grid gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-700 shadow-sm dark:border-cyan-300/20 dark:bg-white/[0.06] dark:text-cyan-200">
                            <Briefcase size={14} />
                            Freelancer workbench
                        </div>
                        <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                            My Assigned Projects
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-white/60">
                            Track paid assignments, spot blocked work, and open the right project without digging through old bids.
                        </p>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/35">Current workload</p>
                        <div className="mt-4 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-4xl font-black text-slate-950 dark:text-white">{activeProjects}</p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-white/50">active or payment-blocked</p>
                            </div>
                            <Link
                                to="/find/work"
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white no-underline transition hover:-translate-y-0.5 hover:bg-blue-600 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-100"
                            >
                                Find more
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total" value={stats.total} caption="All assigned work" icon={Briefcase} tone="blue" />
                    <StatCard label="Pending Pay" value={stats.pendingPayment} caption="Waiting on escrow" icon={CreditCard} tone="amber" />
                    <StatCard label="In Progress" value={stats.inProgress} caption="Needs delivery focus" icon={RefreshCw} tone="purple" />
                    <StatCard label="Completed" value={stats.completed} caption="Ready for history" icon={CheckCircle2} tone="emerald" />
                </section>

                {projectError && (
                    <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-100">
                        {projectErrorMessage || 'Could not load assigned projects.'}
                    </div>
                )}

                <section className="mt-8 rounded-[28px] border border-slate-200 bg-white/90 p-3 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-white/[0.05] dark:shadow-none">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <label className="relative block">
                            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/35" size={18} />
                            <input
                                type="search"
                                value={query}
                                onChange={event => setQuery(event.target.value)}
                                placeholder="Search by project, client, category, or skill"
                                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:focus:border-cyan-300/40 dark:focus:bg-white/[0.08] dark:focus:ring-cyan-400/10"
                            />
                        </label>

                        <div className="flex flex-wrap gap-2">
                            {filterOptions.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFilter(option.value)}
                                    className={`inline-flex h-12 items-center gap-2 rounded-2xl px-4 text-sm font-black transition ${
                                        filter === option.value
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20'
                                            : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:border-cyan-300/40 dark:hover:text-white'
                                    }`}
                                >
                                    {option.value === 'all' && <Filter size={15} />}
                                    {option.label}
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${
                                        filter === option.value
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-white/50'
                                    }`}>
                                        {option.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mt-7 flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-500 dark:text-white/45">
                        Showing <span className="text-slate-950 dark:text-white">{filteredProjects.length}</span> of{' '}
                        <span className="text-slate-950 dark:text-white">{projects.length}</span> projects
                    </p>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={() => {
                                setFilter('all')
                                setQuery('')
                            }}
                            className="text-sm font-bold text-blue-600 transition hover:text-blue-700 dark:text-cyan-300 dark:hover:text-cyan-200"
                        >
                            Reset view
                        </button>
                    )}
                </div>

                <section className="mt-5">
                    {filteredProjects.length === 0 ? (
                        <EmptyState
                            hasFilters={hasFilters}
                            onReset={() => {
                                setFilter('all')
                                setQuery('')
                            }}
                        />
                    ) : (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {filteredProjects.map(project => (
                                <ProjectCard key={project._id} project={project} />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

function ProjectCard({ project }) {
    const status = getStatusConfig(project.status)
    const StatusIcon = status.icon
    const clientName = project.user?.name || 'Unknown Client'
    const clientEmail = project.user?.email || 'No email available'
    const skills = getTechnologies(project.technology)

    return (
        <Link to={`/project/${project._id}`} className="group block h-full no-underline">
            <article className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-200/70 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none dark:hover:border-cyan-300/40">
                <span className={`absolute inset-x-0 top-0 h-1.5 ${status.accent}`} />

                <div className="flex flex-wrap items-start justify-between gap-3 pt-2">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${status.badge}`}>
                        <StatusIcon size={14} />
                        {status.label}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/55">
                        {project.category || 'General'}
                    </span>
                </div>

                <div className="mt-5 flex-1">
                    <h2 className="line-clamp-2 text-2xl font-black leading-tight text-slate-950 dark:text-white">
                        {project.title || 'Untitled project'}
                    </h2>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-white/55">
                        {project.description || 'No description added.'}
                    </p>
                </div>

                {skills.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                        {skills.map(skill => (
                            <span
                                key={skill}
                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/55"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-100 py-4 dark:border-white/10">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-white/30">Budget</p>
                        <p className="mt-1 flex items-center gap-1 text-xl font-black text-emerald-600 dark:text-emerald-300">
                            <IndianRupee size={18} />
                            {Number(project.budget || 0).toLocaleString('en-IN')}
                        </p>
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-white/30">Duration</p>
                        <p className="mt-1 flex items-center gap-2 text-base font-bold text-slate-700 dark:text-white/70">
                            <Clock size={16} />
                            {project.duration || 0} days
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-black text-white shadow-lg shadow-blue-500/20">
                            {project.user?.profilePic ? (
                                <img src={project.user.profilePic} alt={clientName} className="h-full w-full object-cover" />
                            ) : (
                                getInitials(clientName)
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-sm font-black text-slate-950 dark:text-white">
                                <User size={14} />
                                <span className="truncate">{clientName}</span>
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-white/40">{clientEmail}</p>
                        </div>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition group-hover:bg-blue-600 dark:bg-white dark:text-slate-950 dark:group-hover:bg-cyan-100">
                        Open
                        <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                    </span>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/45">
                    {status.description}
                </div>
            </article>
        </Link>
    )
}

export default AssignedProjects
