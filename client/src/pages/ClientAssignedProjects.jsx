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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-20 pb-12">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">👥 Assigned Freelancers</h1>
                    <p className="text-slate-600">Manage your projects and make payments</p>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Payment Instructions</p>
                        <p>Your payment is kept in escrow. Release it only after you are satisfied with the work.</p>
                    </div>
                </div>

                {/* Projects Grid */}
                {clientProjects.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                        <User className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                        <p className="text-slate-600 font-medium">No freelancers assigned yet</p>
                        <p className="text-slate-500 text-sm">Start by posting a project and accepting bids</p>
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
        pending: "bg-gray-100 text-gray-700",
        accepted: "bg-amber-100 text-amber-700",
        "in-progress": "bg-purple-100 text-purple-700",
        completed: "bg-emerald-100 text-emerald-700",
        rejected: "bg-red-100 text-red-700",
    }

    const statusIcons = {
        pending: "⏳",
        accepted: "⏳",
        "in-progress": "🔄",
        completed: "✅",
        rejected: "❌",
    }

    const statusMessages = {
        accepted: "Awaiting your payment",
        "in-progress": "Freelancer is working",
        completed: "Ready for review",
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-lg transition overflow-hidden">
            {/* Status Badge */}
            <div className={`${statusColors[project.status]} px-4 py-2 text-xs font-bold flex items-center gap-1`}>
                <span>{statusIcons[project.status]}</span>
                {project.status}
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Project Title */}
                <h3 className="font-bold text-slate-900 line-clamp-2">{project.title}</h3>

                {/* Freelancer Info */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium mb-1">Assigned Freelancer</p>
                    {project.freelancer?.user?._id ? (
                        <Link to={`/profile/${project.freelancer.user._id}`}>
                            <p className="font-bold text-slate-900 hover:text-blue-600 transition">
                                {project.freelancer.user?.name || 'Unknown'}
                            </p>
                        </Link>
                    ) : (
                        <p className="font-bold text-slate-900">Unknown</p>
                    )}
                </div>

                {/* Budget & Category */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">Budget</p>
                        <p className="text-lg font-bold text-emerald-600">₹{project.budget?.toLocaleString()}</p>
                    </div>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{project.category}</span>
                </div>

                {/* Status Message */}
                <div className="text-sm text-slate-600 px-3 py-2 bg-slate-50 rounded-lg">
                    {statusMessages[project.status]}
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock size={14} />
                    {project.duration} days
                </div>

                {/* Action Button */}
                <div className="pt-2 border-t border-slate-100">
                    {project.status === "accepted" && (
                        <button
                            onClick={onPaymentClick}
                            className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded hover:shadow-md transition text-sm"
                        >
                            💳 Make Payment
                        </button>
                    )}
                    {project.status === "in-progress" && (
                        <div className="text-center text-sm text-purple-600 font-medium py-2">
                            🔄 In Progress
                        </div>
                    )}
                    {project.status === "completed" && (
                        <button className="w-full py-2 bg-emerald-500 text-white font-medium rounded hover:bg-emerald-600 transition text-sm">
                            ✅ Review & Approve
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ClientAssignedProjects
