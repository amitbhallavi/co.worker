// ===== FILE: client/src/pages/ClientAssignedProjects.jsx =====
// Client's view of assigned projects with payment management

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getProjects } from '../features/project/projectSlice'
import PaymentModal from '../components/Paymentmodal'
import LoaderGradient from '../components/LoaderGradient'
import { Clock, User, AlertCircle } from 'lucide-react'

const ClientAssignedProjects = () => {
    const dispatch = useDispatch()
    const { user } = useSelector(s => s.auth)
    const { listedProjects, projectLoading } = useSelector(s => s.project)
    const [selectedProject, setSelectedProject] = useState(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)

    useEffect(() => {
        dispatch(getProjects())
    }, [dispatch])

    // Filter projects created by current user (client)
    const clientProjects = listedProjects.filter(p => p.user?._id === user?._id && p.freelancer)

    if (projectLoading) return <LoaderGradient />

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-20 pb-12 text-slate-900 dark:from-[#020617] dark:via-[#071427] dark:to-[#020617] dark:text-white">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">👥 Assigned Freelancers</h1>
                    <p className="text-slate-600 dark:text-white/60">Manage your projects and make payments</p>
                </div>

                {/* Info Banner */}
                <div className="mb-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-cyan-300/20 dark:bg-cyan-400/10">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 dark:text-cyan-200" />
                    <div className="text-sm text-blue-800 dark:text-cyan-100">
                        <p className="font-semibold mb-1">Payment Instructions</p>
                        <p className="dark:text-cyan-100/75">Your payment is kept in escrow. Release it only after you are satisfied with the work.</p>
                    </div>
                </div>

                {/* Projects Grid */}
                {clientProjects.length === 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-white py-12 text-center dark:border-white/10 dark:bg-white/[0.04]">
                        <User className="w-12 h-12 mx-auto text-slate-400 mb-3 dark:text-white/35" />
                        <p className="text-slate-600 font-medium dark:text-white">No freelancers assigned yet</p>
                        <p className="text-slate-500 text-sm dark:text-white/50">Start by posting a project and accepting bids</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {clientProjects.map(project => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                onPaymentClick={() => {
                                    setSelectedProject(project)
                                    setShowPaymentModal(true)
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedProject && (
                <PaymentModal
                    project={selectedProject}
                    onClose={() => {
                        setShowPaymentModal(false)
                        setSelectedProject(null)
                    }}
                    onPaymentDone={() => {
                        toast.success('Payment processing...')
                        setShowPaymentModal(false)
                        setTimeout(() => dispatch(getProjects()), 1500)
                    }}
                />
            )}
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════════
// PROJECT CARD COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

function ProjectCard({ project, onPaymentClick }) {
    const statusColors = {
        pending: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/75",
        accepted: "bg-amber-100 text-amber-700 dark:bg-amber-300/15 dark:text-amber-100",
        "in-progress": "bg-purple-100 text-purple-700 dark:bg-purple-400/15 dark:text-purple-100",
        completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-100",
        rejected: "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-100",
    }

    const statusIcons = {
        pending: "⏳",
        accepted: "⏳",
        "in-progress": "🔄",
        completed: "✅",
        rejected: "❌",
    }

    const statusMessages = {
        pending: "Waiting for project confirmation",
        accepted: "Awaiting your payment",
        "in-progress": "Freelancer is working",
        completed: "Ready for review",
        rejected: "Assignment was rejected",
    }

    const statusLabels = {
        pending: "Pending",
        accepted: "Pending Payment",
        "in-progress": "In Progress",
        completed: "Completed",
        rejected: "Rejected",
    }

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-cyan-300/40 dark:hover:shadow-none">
            {/* Status Badge */}
            <div className={`${statusColors[project.status]} px-4 py-2 text-xs font-bold flex items-center gap-1`}>
                <span>{statusIcons[project.status]}</span>
                {statusLabels[project.status] || project.status}
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Project Title */}
                <h3 className="font-bold text-slate-900 line-clamp-2 dark:text-white">{project.title}</h3>

                {/* Freelancer Info */}
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-cyan-300/20 dark:bg-cyan-400/10">
                    <p className="mb-1 text-xs font-medium text-blue-600 dark:text-cyan-200">Assigned Freelancer</p>
                    {project.freelancer?.user?._id ? (
                        <Link to={`/profile/${project.freelancer.user._id}`}>
                            <p className="font-bold text-slate-900 transition hover:text-blue-600 dark:text-white dark:hover:text-cyan-200">
                                {project.freelancer.user?.name || 'Unknown'}
                            </p>
                        </Link>
                    ) : (
                        <p className="font-bold text-slate-900 dark:text-white">Unknown</p>
                    )}
                </div>

                {/* Budget & Category */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-white/45">Budget</p>
                        <p className="text-lg font-bold text-emerald-600">₹{project.budget?.toLocaleString()}</p>
                    </div>
                    <span className="rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">{project.category}</span>
                </div>

                {/* Status Message */}
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-white/[0.05] dark:text-white/60">
                    {statusMessages[project.status] || "Status updated by freelancer"}
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-white/45">
                    <Clock size={14} />
                    {project.duration} days
                </div>

                {/* Action Button */}
                <div className="border-t border-slate-100 pt-2 dark:border-white/10">
                    {project.status === "accepted" && (
                        <button
                            onClick={onPaymentClick}
                            className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded hover:shadow-md transition text-sm"
                        >
                            💳 Make Payment
                        </button>
                    )}
                    {project.status === "in-progress" && (
                        <div className="py-2 text-center text-sm font-medium text-purple-600 dark:text-purple-200">
                            🔄 In Progress
                        </div>
                    )}
                    {project.status === "completed" && (
                        <Link
                            to={`/project/${project._id}`}
                            className="block w-full rounded bg-emerald-500 py-2 text-center text-sm font-medium text-white no-underline transition hover:bg-emerald-600 dark:bg-emerald-500/90 dark:hover:bg-emerald-500"
                        >
                            ✅ Review & Approve
                        </Link>
                    )}
                    {(project.status === "pending" || project.status === "rejected") && (
                        <Link
                            to={`/project/${project._id}`}
                            className="block w-full rounded border border-slate-200 bg-white py-2 text-center text-sm font-medium text-slate-700 no-underline transition hover:border-blue-300 hover:text-blue-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70 dark:hover:border-cyan-300/40 dark:hover:text-white"
                        >
                            View details
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ClientAssignedProjects
