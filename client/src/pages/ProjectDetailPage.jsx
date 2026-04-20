import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import axios from 'axios'
import { ArrowLeft, MapPin, Clock, Award, CheckCircle2, AlertCircle, Loader } from 'lucide-react'
import LoaderGradient from '../components/LoaderGradient'
import PaymentModal from '../components/Paymentmodal'

const BASE_URL = import.meta.env.VITE_API_URL || ""

const ProjectDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useSelector(s => s.auth)

    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [updating, setUpdating] = useState(false)
    const [payProject, setPayProject] = useState(null)

    // ── Fetch Project Details ──────────────────────────────────────────────────
    useEffect(() => {
        const fetchProject = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await axios.get(
                    `${BASE_URL}/api/project/details/${id}`,
                    { headers: { authorization: `Bearer ${user?.token}` } }
                )
                
                const projectData = response.data

                if (!projectData) {
                    throw new Error("Project not found")
                }

                setProject(projectData)
                console.log("📋 Project loaded:", projectData)
            } catch (err) {
                console.error("❌ Error fetching project:", err)
                setError(err.response?.data?.message || err.message || "Failed to load project details")
                toast.error("Failed to load project details")
            } finally {
                setLoading(false)
            }
        }

        if (id && user?.token) {
            fetchProject()
        }
    }, [id, user?.token])

    // ── Update Project Status ──────────────────────────────────────────────────
    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true)
        try {
            const response = await axios.put(
                `${BASE_URL}/api/project/${id}`,
                { status: newStatus },
                { headers: { authorization: `Bearer ${user?.token}` } }
            )

            setProject(prev => ({
                ...prev,
                status: newStatus
            }))

            console.log("✅ Status updated:", newStatus)
            toast.success(`✅ Project marked as ${newStatus}`)
        } catch (err) {
            console.error("❌ Error updating status:", err)
            toast.error(err.response?.data?.message || "Failed to update status")
        } finally {
            setUpdating(false)
        }
    }

    if (loading) return <LoaderGradient />

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 pt-20 pb-12">
                <div className="max-w-4xl mx-auto px-4">
                    <button onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium">
                        <ArrowLeft size={18} /> Go Back
                    </button>
                    <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
                        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                        <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Project</h1>
                        <p className="text-slate-600 mb-6">{error}</p>
                        <button onClick={() => navigate('/assigned-projects')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            Back to Projects
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-slate-50 pt-20 pb-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                        <p className="text-slate-600">Project not found</p>
                    </div>
                </div>
            </div>
        )
    }

    const isFreelancer = project.freelancer?.user?._id === user?._id
    const isClient = project.user?._id === user?._id

    const statusColors = {
        pending: { bg: "bg-gray-100", text: "text-gray-700", label: "⏳ Pending" },
        accepted: { bg: "bg-amber-100", text: "text-amber-700", label: "⏳ Pending Payment" },
        "in-progress": { bg: "bg-purple-100", text: "text-purple-700", label: "🔄 In Progress" },
        completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "✅ Completed" },
        rejected: { bg: "bg-red-100", text: "text-red-700", label: "❌ Rejected" },
    }

    const currentStatus = statusColors[project.status] || statusColors.pending

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-20 pb-12">
            {/* ── Payment Modal ── */}
            {payProject && (
                <PaymentModal
                    project={payProject}
                    onClose={() => setPayProject(null)}
                    onPaymentDone={() => {
                        setPayProject(null)
                        // Reload project data
                        window.location.reload()
                    }}
                />
            )}

            <div className="max-w-4xl mx-auto px-4">
                {/* Back Button */}
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium transition">
                    <ArrowLeft size={18} /> Go Back
                </button>

                {/* Main Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className={`${currentStatus.bg} px-6 sm:px-8 py-5 border-b border-slate-200`}>
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{project.title}</h1>
                            <span className={`${currentStatus.bg} ${currentStatus.text} px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap`}>
                                {currentStatus.label}
                            </span>
                        </div>
                        <p className="text-slate-600">{project.description}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8 space-y-8">
                        {/* Project Details */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Project Details</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    { label: "Budget", value: `₹${project.budget?.toLocaleString() || '—'}`, icon: "💰" },
                                    { label: "Duration", value: `${project.duration || '—'} days`, icon: <Clock size={18} /> },
                                    { label: "Category", value: project.category || '—', icon: "📂" },
                                    { label: "Posted", value: project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-IN') : '—', icon: "📅" },
                                    { label: "Level", value: project.level || 'Any', icon: <Award size={18} /> },
                                    { label: "Status", value: currentStatus.label, icon: "📊" },
                                ].map((item, i) => (
                                    <div key={i} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">
                                            {typeof item.icon === 'string' ? item.icon : ''} {item.label}
                                        </p>
                                        <p className="text-lg font-bold text-slate-900">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Technologies */}
                        {project.technology && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Technologies</h2>
                                <div className="flex flex-wrap gap-2">
                                    {project.technology.split(',').map((tech, i) => (
                                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                            {tech.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Client Details */}
                        {project.user && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Client Details</h2>
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex-shrink-0 flex items-center justify-center">
                                        {project.user.profilePic ? (
                                            <img src={project.user.profilePic} alt={project.user.name} className="w-full h-full rounded-lg object-cover" />
                                        ) : (
                                            <span className="text-white font-bold text-xl">
                                                {project.user.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-lg font-bold text-slate-900">{project.user.name}</p>
                                        <p className="text-slate-600 text-sm">{project.user.email}</p>
                                        {isFreelancer && (
                                            <Link to={`/chat/${project.user._id}`}
                                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm no-underline">
                                                💬 Message Client
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Freelancer Details (if assigned) */}
                        {project.freelancer && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Assigned Freelancer</h2>
                                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0 flex items-center justify-center">
                                        {project.freelancer?.user?.profilePic ? (
                                            <img src={project.freelancer.user.profilePic} alt={project.freelancer.user.name} className="w-full h-full rounded-lg object-cover" />
                                        ) : (
                                            <span className="text-white font-bold text-xl">
                                                {project.freelancer?.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-lg font-bold text-slate-900">{project.freelancer?.user?.name}</p>
                                        <p className="text-slate-600 text-sm">{project.freelancer?.user?.email}</p>
                                        {project.freelancer?.category && (
                                            <p className="text-emerald-600 text-sm font-medium mt-1">Category: {project.freelancer.category}</p>
                                        )}
                                        {project.freelancer?.experience && (
                                            <p className="text-slate-600 text-sm">Experience: {project.freelancer.experience} years</p>
                                        )}
                                        {isClient && (
                                            <Link to={`/chat/${project.freelancer?.user?._id}`}
                                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm no-underline">
                                                💬 Message Freelancer
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Status */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Payment Status</h2>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600 font-medium">Payment Status</p>
                                        <p className="text-2xl font-bold text-slate-900 mt-1">
                                            {project.paymentStatus === 'escrowed' && '🔒 In Escrow'}
                                            {project.paymentStatus === 'released' && '✅ Released'}
                                            {project.paymentStatus === 'pending' && '⏳ Pending'}
                                            {!project.paymentStatus && '—'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-600 font-medium">Amount</p>
                                        <p className="text-2xl font-bold text-emerald-600 mt-1">₹{project.budget?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Update Buttons (Freelancer) */}
                        {isFreelancer && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Update Status</h2>
                                <div className="space-y-3">
                                    {project.status === 'accepted' && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                            <p className="text-sm text-amber-700 font-medium mb-3">
                                                ⏳ Waiting for client to complete payment before you can start work.
                                            </p>
                                        </div>
                                    )}

                                    {project.status === 'in-progress' && (
                                        <button
                                            onClick={() => handleStatusUpdate('completed')}
                                            disabled={updating}
                                            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                                            {updating ? (
                                                <>
                                                    <Loader size={18} className="animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={20} />
                                                    ✅ Mark as Completed
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {project.status === 'completed' && (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                                            <p className="text-emerald-700 font-bold">🎉 Project Completed!</p>
                                            <p className="text-emerald-600 text-sm mt-1">Payment has been released to your wallet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Status Update Buttons (Client) */}
                        {isClient && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Client Actions</h2>
                                <div className="space-y-3">
                                    {project.status === 'accepted' && project.paymentStatus !== 'escrowed' && (
                                        <button
                                            onClick={() => setPayProject(project)}
                                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer border-none">
                                            💳 Pay Now to Start Project
                                        </button>
                                    )}

                                    {project.paymentStatus === 'escrowed' && project.status === 'in-progress' && (
                                        <button
                                            className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 cursor-pointer border-none">
                                            👀 Review Work & Approve
                                        </button>
                                    )}

                                    {project.paymentStatus === 'released' && project.status === 'completed' && (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                                            <p className="text-emerald-700 font-bold">✅ Payment Released</p>
                                            <p className="text-emerald-600 text-sm mt-1">Freelancer has been paid for this project.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectDetailPage
