import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import API from '../features/api/axiosInstance'
import { getSocket } from '../utils/socketManager'
import {
    ArrowLeft,
    AlertCircle,
    Award,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    IndianRupee,
    Loader,
    Lock,
    MessageCircle,
    RefreshCw,
    Send,
    ShieldCheck,
    Tag,
    User,
    XCircle,
} from 'lucide-react'
import LoaderGradient from '../components/LoaderGradient'
import PaymentModal from '../components/Paymentmodal'

const formatCurrency = (value = 0) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const formatDate = (value) => (
    value
        ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Not available'
)

const getInitials = (name = '') => {
    const initials = name
        .split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)

    return initials || 'NA'
}

const getTechnologies = (value = '') => (
    value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
)

const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        icon: Clock,
        badge: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70',
        panel: 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.05]',
    },
    accepted: {
        label: 'Pending Payment',
        icon: CreditCard,
        badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100',
        panel: 'border-amber-200 bg-amber-50 dark:border-amber-300/20 dark:bg-amber-300/10',
    },
    'in-progress': {
        label: 'In Progress',
        icon: RefreshCw,
        badge: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-300/20 dark:bg-purple-400/10 dark:text-purple-100',
        panel: 'border-purple-200 bg-purple-50 dark:border-purple-300/20 dark:bg-purple-400/10',
    },
    completed: {
        label: 'Completed',
        icon: CheckCircle2,
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-100',
        panel: 'border-emerald-200 bg-emerald-50 dark:border-emerald-300/20 dark:bg-emerald-400/10',
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-100',
        panel: 'border-rose-200 bg-rose-50 dark:border-rose-300/20 dark:bg-rose-400/10',
    },
}

const PROJECT_STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted / pending payment' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
]

const PAYMENT_CONFIG = {
    pending: {
        label: 'Payment Started',
        description: 'Razorpay order exists, but payment is not verified yet.',
        icon: CreditCard,
        badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100',
    },
    escrow: {
        label: 'In Escrow',
        description: 'Client payment is secured. It can be released after approval.',
        icon: Lock,
        badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-300/20 dark:bg-blue-400/10 dark:text-blue-100',
    },
    released: {
        label: 'Released',
        description: 'Payment has been released to the freelancer wallet.',
        icon: CheckCircle2,
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-100',
    },
    none: {
        label: 'No Payment Record',
        description: 'Escrow has not been created for this project yet.',
        icon: AlertCircle,
        badge: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/60',
    },
}

const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending
const getPaymentConfig = (status) => PAYMENT_CONFIG[status] || PAYMENT_CONFIG.none

const InfoCell = ({ label, value, icon }) => {
    const InfoIcon = icon

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.05]">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-white/35">
                <InfoIcon size={15} />
                {label}
            </p>
            <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">{value}</p>
        </div>
    )
}

const PersonPanel = ({ title, person, tone = 'blue', action }) => {
    const name = person?.name || 'Unknown'
    const email = person?.email || 'No email available'
    const image = person?.profilePic
    const toneClass = tone === 'emerald'
        ? 'from-emerald-500 to-teal-400 shadow-emerald-500/20'
        : 'from-blue-500 to-cyan-400 shadow-blue-500/20'

    return (
        <section>
            <h2 className="mb-4 text-xl font-black text-slate-950 dark:text-white">{title}</h2>
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${toneClass} text-lg font-black text-white shadow-lg`}>
                        {image ? (
                            <img src={image} alt={name} className="h-full w-full object-cover" />
                        ) : (
                            getInitials(name)
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
                            <User size={17} />
                            <span className="truncate">{name}</span>
                        </p>
                        <p className="truncate text-sm text-slate-500 dark:text-white/45">{email}</p>
                        {person?.category && (
                            <p className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-300">{person.category}</p>
                        )}
                        {person?.experience !== undefined && person?.experience !== null && (
                            <p className="text-sm text-slate-500 dark:text-white/45">{person.experience} years experience</p>
                        )}
                    </div>
                </div>
                {action}
            </div>
        </section>
    )
}

const ProjectDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useSelector(s => s.auth)

    const [project, setProject] = useState(null)
    const [payment, setPayment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [updating, setUpdating] = useState(false)
    const [releasing, setReleasing] = useState(false)
    const [payProject, setPayProject] = useState(null)
    const [selectedStatus, setSelectedStatus] = useState('')

    useEffect(() => {
        const fetchProject = async () => {
            setLoading(true)
            setError(null)
            setPayment(null)

            try {
                const response = await API.get(`/api/project/details/${id}`)

                if (!response.data) {
                    throw new Error('Project not found')
                }

                setProject(response.data)

                try {
                    const paymentResponse = await API.get(`/api/payment/project/${id}`)
                    setPayment(paymentResponse.data || null)
                } catch (paymentError) {
                    if (paymentError.response?.status !== 404) {
                        console.warn('Payment lookup failed:', paymentError.response?.data || paymentError.message)
                    }
                }
            } catch (err) {
                console.error('Error fetching project:', err)
                setError(err.response?.data?.message || err.message || 'Failed to load project details')
                toast.error('Failed to load project details')
            } finally {
                setLoading(false)
            }
        }

        if (id && user?.token) {
            fetchProject()
        }
    }, [id, user?.token])

    useEffect(() => {
        if (project?.status) {
            setSelectedStatus(project.status)
        }
    }, [project?.status])

    useEffect(() => {
        const socket = getSocket()
        if (!socket || !id) return undefined

        const handleRealtimeStatus = (data) => {
            if (String(data?.projectId) !== String(id)) return

            setProject(prev => (
                prev
                    ? {
                        ...prev,
                        ...(data.project || {}),
                        status: data.status || data.project?.status || prev.status,
                    }
                    : prev
            ))

            if (data.payment) {
                setPayment(data.payment)
            }
        }

        socket.on('status_update', handleRealtimeStatus)

        return () => {
            socket.off('status_update', handleRealtimeStatus)
        }
    }, [id])

    const handleStatusUpdate = async (newStatus) => {
        if (!newStatus || newStatus === project?.status) return

        setUpdating(true)
        try {
            const response = await API.put(`/api/project/${id}`, { status: newStatus })
            const updatedProject = response.data

            setProject(updatedProject)
            setSelectedStatus(updatedProject.status)
            toast.success(`Project status changed to ${getStatusConfig(updatedProject.status).label}`)
        } catch (err) {
            console.error('Error updating status:', err)
            toast.error(err.response?.data?.message || 'Failed to update status')
            setSelectedStatus(project?.status || '')
        } finally {
            setUpdating(false)
        }
    }

    const handleReleasePayment = async () => {
        setReleasing(true)
        try {
            const response = await API.post(`/api/payment/release/${id}`, {})

            setPayment(response.data.payment)
            setProject(prev => ({ ...prev, status: 'completed' }))
            toast.success('Payment released to freelancer wallet')
        } catch (err) {
            console.error('Error releasing payment:', err)
            toast.error(err.response?.data?.message || 'Failed to release payment')
        } finally {
            setReleasing(false)
        }
    }

    const technologies = useMemo(
        () => getTechnologies(project?.technology || ''),
        [project?.technology]
    )

    if (loading) return <LoaderGradient />

    if (error || !project) {
        return (
            <div className="min-h-screen bg-[#f6f9fc] pt-24 pb-14 text-slate-950 dark:bg-[#020617] dark:text-white">
                <div className="mx-auto max-w-4xl px-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700 dark:text-cyan-300 dark:hover:text-cyan-200"
                    >
                        <ArrowLeft size={18} />
                        Go back
                    </button>
                    <div className="rounded-[28px] border border-rose-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60 dark:border-rose-300/20 dark:bg-white/[0.04] dark:shadow-none">
                        <AlertCircle className="mx-auto mb-4 h-14 w-14 text-rose-500" />
                        <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                            {error ? 'Error loading project' : 'Project not found'}
                        </h1>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-white/50">
                            {error || 'This project is not available anymore.'}
                        </p>
                        <button
                            onClick={() => navigate('/assigned-projects')}
                            className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                        >
                            Back to projects
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const status = getStatusConfig(project.status)
    const StatusIcon = status.icon
    const paymentStatus = payment?.status || 'none'
    const paymentInfo = getPaymentConfig(paymentStatus)
    const PaymentIcon = paymentInfo.icon
    const isFreelancer = project.freelancer?.user?._id === user?._id
    const isClient = project.user?._id === user?._id
    const amount = payment?.totalAmount || project.finalAmount || project.budget
    const statusChangeBlocked = isFreelancer
        && project.status === 'accepted'
        && paymentStatus !== 'escrow'
        && paymentStatus !== 'released'
    const canSaveStatus = isFreelancer
        && !statusChangeBlocked
        && selectedStatus
        && selectedStatus !== project.status

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f6f9fc] pt-24 pb-16 text-slate-950 dark:bg-[#020617] dark:text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#eaf6ff_55%,rgba(246,249,252,0)_100%)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#071427_0%,#06101f_58%,rgba(2,6,23,0)_100%)]" />

            {payProject && (
                <PaymentModal
                    project={payProject}
                    onClose={() => setPayProject(null)}
                    onPaymentDone={() => {
                        setPayProject(null)
                        window.location.reload()
                    }}
                />
            )}

            <main className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700 dark:text-cyan-300 dark:hover:text-cyan-200"
                >
                    <ArrowLeft size={18} />
                    Go back
                </button>

                <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none">
                    <header className="border-b border-slate-200 bg-white px-6 py-7 dark:border-white/10 dark:bg-white/[0.035] sm:px-8">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${status.badge}`}>
                                    <StatusIcon size={14} />
                                    {status.label}
                                </span>
                                <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                                    {project.title}
                                </h1>
                                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-white/60">
                                    {project.description}
                                </p>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-right dark:border-white/10 dark:bg-white/[0.05]">
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-white/35">Project value</p>
                                <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-300">{formatCurrency(amount)}</p>
                            </div>
                        </div>
                    </header>

                    <div className="space-y-9 p-6 sm:p-8">
                        <section>
                            <h2 className="mb-4 text-xl font-black text-slate-950 dark:text-white">Project details</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <InfoCell label="Budget" value={formatCurrency(project.budget)} icon={IndianRupee} />
                                <InfoCell label="Duration" value={`${project.duration || 0} days`} icon={Clock} />
                                <InfoCell label="Category" value={project.category || 'General'} icon={Tag} />
                                <InfoCell label="Posted" value={formatDate(project.createdAt)} icon={Calendar} />
                                <InfoCell label="Level" value={project.level || 'Any'} icon={Award} />
                                <InfoCell label="Status" value={status.label} icon={StatusIcon} />
                            </div>
                        </section>

                        {technologies.length > 0 && (
                            <section>
                                <h2 className="mb-4 text-xl font-black text-slate-950 dark:text-white">Technologies</h2>
                                <div className="flex flex-wrap gap-2">
                                    {technologies.map(tech => (
                                        <span
                                            key={tech}
                                            className="rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-black text-blue-700 dark:border-cyan-300/20 dark:bg-cyan-400/10 dark:text-cyan-200"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {project.user && (
                            <PersonPanel
                                title="Client"
                                person={project.user}
                                action={isFreelancer && (
                                    <Link
                                        to={`/chat/${project.user._id}`}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-blue-700"
                                    >
                                        <MessageCircle size={17} />
                                        Message client
                                    </Link>
                                )}
                            />
                        )}

                        {project.freelancer && (
                            <PersonPanel
                                title="Assigned freelancer"
                                tone="emerald"
                                person={{
                                    ...(project.freelancer?.user || {}),
                                    category: project.freelancer?.category,
                                    experience: project.freelancer?.experience,
                                }}
                                action={isClient && (
                                    <Link
                                        to={`/chat/${project.freelancer?.user?._id}`}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-emerald-700"
                                    >
                                        <MessageCircle size={17} />
                                        Message freelancer
                                    </Link>
                                )}
                            />
                        )}

                        <section>
                            <h2 className="mb-4 text-xl font-black text-slate-950 dark:text-white">Payment status</h2>
                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.05]">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${paymentInfo.badge}`}>
                                                <PaymentIcon size={14} />
                                                {paymentInfo.label}
                                            </span>
                                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-white/55">{paymentInfo.description}</p>
                                        </div>
                                        <ShieldCheck className="text-slate-300 dark:text-white/20" size={30} />
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-white/35">Escrow amount</p>
                                    <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-300">{formatCurrency(amount)}</p>
                                    {payment?.platformFee !== undefined && (
                                        <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-white/45">
                                            Platform fee: {formatCurrency(payment.platformFee)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {isFreelancer && (
                            <section>
                                <h2 className="mb-4 text-xl font-black text-slate-950 dark:text-white">Freelancer action</h2>
                                <div className="mb-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.05]">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                                        <label className="flex-1">
                                            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-white/35">
                                                Project status
                                            </span>
                                            <select
                                                value={selectedStatus || project.status}
                                                onChange={event => setSelectedStatus(event.target.value)}
                                                disabled={updating || statusChangeBlocked}
                                                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-950 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:focus:border-cyan-300/40 dark:focus:ring-cyan-400/10 dark:disabled:bg-white/[0.03] dark:disabled:text-white/30"
                                            >
                                                {PROJECT_STATUS_OPTIONS.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => handleStatusUpdate(selectedStatus)}
                                            disabled={updating || !canSaveStatus}
                                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-100 dark:disabled:bg-white/10 dark:disabled:text-white/30"
                                        >
                                            {updating ? (
                                                <>
                                                    <Loader size={17} className="animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw size={17} />
                                                    Update status
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <p className="mt-3 text-xs font-semibold leading-5 text-slate-500 dark:text-white/45">
                                        The client sees this project status in real time. Status changes do not reverse payment release.
                                    </p>

                                    {statusChangeBlocked && (
                                        <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100">
                                            Client payment is still pending. Wait for escrow before moving work to in-progress or completed.
                                        </p>
                                    )}
                                </div>

                                {project.status === 'accepted' && (
                                    <div className={`rounded-3xl border p-5 ${getStatusConfig('accepted').panel}`}>
                                        <p className="font-bold text-amber-800 dark:text-amber-100">Payment is still pending.</p>
                                        <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-100/70">
                                            Do not start delivery until escrow is active.
                                        </p>
                                    </div>
                                )}

                                {project.status === 'in-progress' && (
                                    <button
                                        onClick={() => handleStatusUpdate('completed')}
                                        disabled={updating}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {updating ? (
                                            <>
                                                <Loader size={18} className="animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Submit work for client review
                                            </>
                                        )}
                                    </button>
                                )}

                                {project.status === 'completed' && (
                                    <div className={`rounded-3xl border p-5 ${getStatusConfig('completed').panel}`}>
                                        <p className="font-black text-emerald-800 dark:text-emerald-100">
                                            {paymentStatus === 'released' ? 'Payment released' : 'Submitted for client review'}
                                        </p>
                                        <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-100/70">
                                            {paymentStatus === 'released'
                                                ? 'The payout is now in your wallet flow.'
                                                : 'Client approval is still needed before escrow release.'}
                                        </p>
                                    </div>
                                )}
                            </section>
                        )}

                        {isClient && (
                            <section>
                                <h2 className="mb-4 text-xl font-black text-slate-950 dark:text-white">Client action</h2>
                                {project.status === 'accepted' && paymentStatus !== 'escrow' && paymentStatus !== 'released' && (
                                    <button
                                        onClick={() => setPayProject(project)}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25"
                                    >
                                        <CreditCard size={18} />
                                        Pay now to start project
                                    </button>
                                )}

                                {project.status === 'in-progress' && paymentStatus === 'escrow' && (
                                    <div className={`rounded-3xl border p-5 ${getStatusConfig('in-progress').panel}`}>
                                        <p className="font-black text-purple-800 dark:text-purple-100">Work is in progress.</p>
                                        <p className="mt-1 text-sm text-purple-700/80 dark:text-purple-100/70">
                                            Release payment only after the freelancer submits finished work.
                                        </p>
                                    </div>
                                )}

                                {project.status === 'completed' && paymentStatus === 'escrow' && (
                                    <button
                                        onClick={handleReleasePayment}
                                        disabled={releasing}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {releasing ? (
                                            <>
                                                <Loader size={18} className="animate-spin" />
                                                Releasing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={18} />
                                                Release escrow payment
                                            </>
                                        )}
                                    </button>
                                )}

                                {paymentStatus === 'released' && (
                                    <div className={`rounded-3xl border p-5 ${getStatusConfig('completed').panel}`}>
                                        <p className="font-black text-emerald-800 dark:text-emerald-100">Payment released.</p>
                                        <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-100/70">
                                            This project is complete and the freelancer has been paid.
                                        </p>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                </article>
            </main>
        </div>
    )
}

export default ProjectDetailPage
