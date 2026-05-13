import Bid from "../models/bidModel.js"
import Freelancer from "../models/freelancerModel.js"
import Payment from "../models/paymentModel.js"
import Project from "../models/projectModel.js"
import { emitAdminDataChanged } from "../utils/adminRealtime.js"
import { ensure } from "../utils/http.js"
import { emitProjectStatusUpdate } from "../utils/projectRealtime.js"

const freelancerUserPopulate = {
    path: "freelancer",
    populate: { path: "user", select: "-password" },
}

const bidFreelancerPopulate = {
    path: "freelancer",
    populate: { path: "user", select: "-password" },
}

const isAcceptedBidStatus = (status) => ["accepted", "Accepted"].includes(status)
const PROJECT_STATUSES = ["pending", "accepted", "in-progress", "completed", "rejected"]
const PAYMENT_REQUIRED_STATUSES = new Set(["in-progress", "completed"])

const idsMatch = (a, b) => a && b && a.toString() === b.toString()

const listProject = async (req, res) => {
    const { title, description, budget, technology, category, duration } = req.body

    ensure(title && description && budget && technology && category && duration, 409, "Please Fill All Details!")

    const project = new Project({
        user: req.user._id,
        title,
        description,
        budget,
        technology,
        category,
        duration,
        freelancer: null,
    })

    await project.save()
    await project.populate("user")
    emitAdminDataChanged("project_created", { message: `Project posted: ${project.title}` })

    res.status(201).json(project)
}

const getListProjects = async (req, res) => {
    const projects = await Project.find()
        .populate("user", "-password")
        .populate(freelancerUserPopulate)

    ensure(projects.length > 0, 404, "Project Not Found")
    res.status(200).json(projects)
}

const getBidsByProject = async (req, res) => {
    const bids = await Bid.find({ project: req.params.projectId })
        .populate(bidFreelancerPopulate)
        .lean()

    res.status(200).json(bids)
}

const checkProjectApplicatons = async (req, res) => {
    const project = await Project.findById(req.params.pid)
    ensure(project, 404, "Project Not Found!")

    const bids = await Bid.find({ project: req.params.pid })
        .populate(bidFreelancerPopulate)
        .populate("project")

    res.status(200).json(bids)
}

const acceptProjectRequest = async (req, res) => {
    const { status } = req.body
    ensure(status, 409, "Please Send Status")

    const bid = await Bid.findById(req.params.bid)
        .populate(bidFreelancerPopulate)
        .populate("project")

    ensure(bid, 404, "Bid Not Found")
    ensure(bid.project.user.toString() === req.user._id.toString(), 403, "You are not the rightful owner of this project")

    const updatedBid = await Bid.findByIdAndUpdate(req.params.bid, { status }, { new: true })
        .populate(bidFreelancerPopulate)

    ensure(updatedBid, 401, "Bid Not Updated!")

    if (!isAcceptedBidStatus(status)) {
        emitAdminDataChanged("bid_updated", { message: `Bid updated: ${status}` })
        return res.status(200).json(updatedBid)
    }

    const selectedProject = await Project.findById(bid.project._id).select("selectedBid")
    ensure(!selectedProject?.selectedBid, 409, "A bid is already accepted for this project")

    const updatedProject = await Project.findByIdAndUpdate(
        bid.project._id,
        {
            freelancer: bid.freelancer._id,
            status: "accepted",
            selectedBid: bid._id,
            finalAmount: bid.amount,
        },
        { new: true }
    )
        .populate("freelancer")
        .populate("user")
        .populate("selectedBid")

    if (global.io) {
        const assignedPayload = {
            _id: updatedProject._id,
            title: updatedProject.title,
            description: updatedProject.description,
            user: updatedProject.user,
            freelancer: updatedProject.freelancer,
            status: updatedProject.status,
            budget: updatedProject.budget,
            duration: updatedProject.duration,
            category: updatedProject.category,
            technology: updatedProject.technology,
            createdAt: updatedProject.createdAt,
            message: `Project "${updatedProject.title}" assigned to you. Payment is pending.`,
        }

        global.io.to(`user_${bid.freelancer.user._id}`).emit("projectAssigned", assignedPayload)
        global.io.to(`user_${bid.freelancer.user._id}`).emit("payment_pending", {
            projectId: updatedProject._id,
            title: updatedProject.title,
            status: updatedProject.status,
            message: `Client must complete payment to start "${updatedProject.title}".`,
        })

        global.io.to(`user_${req.user._id}`).emit("bidAccepted", {
            projectId: updatedProject._id,
            bidId: bid._id,
            finalAmount: bid.amount,
        })
    }

    emitAdminDataChanged("project_assigned", { message: `Project assigned: ${updatedProject.title}` })

    res.status(200).json({
        project: updatedProject,
        bid: updatedBid,
    })
}

const getAssignedProjects = async (req, res) => {
    const freelancer = await Freelancer.findOne({ user: req.user._id })

    if (!freelancer) {
        return res.status(200).json([])
    }

    const assignedProjects = await Project.find({
        freelancer: freelancer._id,
        status: { $in: PROJECT_STATUSES },
    })
        .populate("user", "-password")
        .populate(freelancerUserPopulate)
        .sort({ createdAt: -1 })

    res.status(200).json(assignedProjects)
}

const getProjectDetails = async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate("user", "-password")
        .populate(freelancerUserPopulate)

    ensure(project, 404, "Project not found")
    res.status(200).json(project)
}

const updateProjectStatus = async (req, res) => {
    const { status } = req.body
    ensure(status, 409, "Please Send Status")
    ensure(PROJECT_STATUSES.includes(status), 400, `Invalid project status. Allowed: ${PROJECT_STATUSES.join(", ")}`)

    const project = await Project.findById(req.params.pid)
        .populate("user", "-password")
        .populate(freelancerUserPopulate)

    ensure(project, 404, "Project Not Found")

    const clientId = project.user?._id || project.user
    const freelancerUserId = project.freelancer?.user?._id || project.freelancer?.user
    const isClient = idsMatch(clientId, req.user._id)
    const isAssignedFreelancer = idsMatch(freelancerUserId, req.user._id)

    ensure(isClient || isAssignedFreelancer, 403, "Only the client or assigned freelancer can update this project")

    if (PAYMENT_REQUIRED_STATUSES.has(status)) {
        const activePayment = await Payment.findOne({
            project: project._id,
            status: { $in: ["escrow", "released"] },
        }).select("_id status")

        ensure(activePayment, 409, "Client payment must be in escrow before this status can be selected")
    }

    project.status = status
    await project.save()
    await project.populate("user", "-password")
    await project.populate(freelancerUserPopulate)

    emitProjectStatusUpdate(project, {
        updatedBy: req.user._id,
        message: `Project "${project.title}" status changed to ${status}`,
    })
    emitAdminDataChanged("project_status_updated", { message: `Project status updated: ${project.title} -> ${status}` })

    res.status(200).json(project)
}

const projectController = {
    getListProjects,
    listProject,
    acceptProjectRequest,
    updateProjectStatus,
    checkProjectApplicatons,
    getBidsByProject,
    getAssignedProjects,
    getProjectDetails,
}

export default projectController
