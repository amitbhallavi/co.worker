// ===== FILE: client/src/pages/AssignedProjects.jsx =====
// Freelancer's view of assigned projects (with payment status)

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getAssignedProjects, addAssignedProject } from '../features/project/projectSlice'
import LoaderGradient from '../components/LoaderGradient'
import { Clock, MapPin, AlertCircle, CheckCircle2, Briefcase } from 'lucide-react'
import { getSocket } from '../utils/socketManager'

const AssignedProjects = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector(s => s.auth)
    const { assignedProjects, projectLoading } = useSelector(s => s.project)
    const [filter, setFilter] = useState("all") // all | in-progress | completed | pending-payment

    useEffect(() => {
        dispatch(getAssignedProjects())
    }, [dispatch])

    // ✅ Socket.IO listener for real-time project assignment
    useEffect(() => {
        const socket = getSocket()
        if (socket) {
            const handleProjectAssigned = (project) => {
                console.log('[Socket] Project assigned:', project)
                dispatch(addAssignedProject(project))
                toast.success(`🎉 Project "${project.title}" assigned to you!`, {
                    position: 'top-right',
                    autoClose: 5000,
                })
            }

            socket.on('projectAssigned', handleProjectAssigned)

            return () => {
                socket.off('projectAssigned', handleProjectAssigned)
            }
        }
    }, [dispatch])

    const filteredProjects = (assignedProjects || []).filter(p => {
        if (filter === "pending-payment") return p.status === "accepted"
        if (filter === "in-progress") return p.status === "in-progress"
        if (filter === "completed") return p.status === "completed"
        return true
    })

    const projectStats = {
        total: assignedProjects?.length || 0,
        pendingPayment: assignedProjects?.filter(p => p.status === "accepted").length || 0,
        inProgress: assignedProjects?.filter(p => p.status === "in-progress").length || 0,
        completed: assignedProjects?.filter(p => p.status === "completed").length || 0,
    }

    if (projectLoading) return <LoaderGradient />

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-20 pb-12">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">My Assigned Projects</h1>
                    <p className="text-slate-600">View and manage projects assigned to you</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total", value: projectStats.total, color: "blue" },
                        { label: "Pending Payment", value: projectStats.pendingPayment, color: "amber" },
                        { label: "In Progress", value: projectStats.inProgress, color: "purple" },
                        { label: "Completed", value: projectStats.completed, color: "green" },
                    ].map(stat => (
                        <div key={stat.label} className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 rounded-lg p-4 border border-${stat.color}-200`}>
                            <p className={`text-sm text-${stat.color}-700 font-medium`}>{stat.label}</p>
                            <p className={`text-2xl font-bold text-${stat.color}-900`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {[
                        { value: "all", label: "All Projects" },
                        { value: "pending-payment", label: "⏳ Pending Payment" },
                        { value: "in-progress", label: "🔄 In Progress" },
                        { value: "completed", label: "✅ Completed" },
                    ].map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                filter === f.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Projects List */}
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                        <Briefcase className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                        <p className="text-slate-600 font-medium">No projects found</p>
                        <p className="text-slate-500 text-sm">Check back soon or apply for new projects</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProjects.map(project => (
                            <ProjectCard key={project._id} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════════
// PROJECT CARD COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

function ProjectCard({ project }) {
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

    const clientName = project.user?.name || 'Unknown Client'
    const clientEmail = project.user?.email || '—'

    return (
        <Link to={`/project/${project._id}`}>
            <div className="bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-lg transition overflow-hidden cursor-pointer h-full flex flex-col">
                {/* Status Badge */}
                <div className={`${statusColors[project.status]} px-4 py-2 text-xs font-bold flex items-center gap-1`}>
                    <span>{statusIcons[project.status]}</span>
                    {project.status}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 line-clamp-2 mb-2">{project.title}</h3>
                        
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{project.description}</p>

                        {/* Client Info */}
                        <div className="bg-slate-50 rounded p-2 mb-3 text-xs">
                            <p className="text-slate-500 font-medium">Client</p>
                            <p className="font-semibold text-slate-900">{clientName}</p>
                            <p className="text-slate-500 truncate">{clientEmail}</p>
                        </div>
                    </div>

                    {/* Budget & Category */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-emerald-600">₹{project.budget?.toLocaleString()}</span>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{project.category}</span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={14} />
                        {project.duration} days
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-slate-100">
                        {project.status === "accepted" && (
                            <div className="w-full py-2 bg-amber-50 text-amber-700 font-medium rounded text-sm text-center border border-amber-200">
                                ⏳ Awaiting Payment
                            </div>
                        )}
                        {project.status === "in-progress" && (
                            <div className="w-full py-2 bg-purple-50 text-purple-700 font-medium rounded text-sm text-center border border-purple-200">
                                🔄 In Progress
                            </div>
                        )}
                        {project.status === "completed" && (
                            <div className="text-center text-sm text-emerald-600 font-medium py-2 bg-emerald-50 rounded border border-emerald-200">
                                ✅ Completed
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default AssignedProjects
