import Bid from "../models/bidModel.js"
import Freelancer from "../models/freelancerModel.js"
import Project from "../models/projectModel.js"
import { ensure } from "../utils/http.js"

const freelancerUserPopulate = {
    path: "freelancer",
    populate: { path: "user", select: "-password" },
}

const bidFreelancerPopulate = {
    path: "freelancer",
    populate: { path: "user", select: "-password" },
}

const isAcceptedBidStatus = (status) => ["accepted", "Accepted"].includes(status)

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
        status: { $in: ["in-progress", "completed"] },
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
    ensure(req.body.status, 409, "Please Send Status")

    const project = await Project.findByIdAndUpdate(
        req.params.pid,
        { status: req.body.status },
        { new: true }
    ).populate("user").populate("freelancer")

    ensure(project, 409, "Project Not Found")
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
