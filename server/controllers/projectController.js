// ===== FILE: server/controllers/projectController.js =====

import Bid from "../models/bidModel.js"
import Project from "../models/projectModel.js"

// ── LIST PROJECT ──────────────────────────────────────────────────────────────
const listProject = async (req, res) => {
    const userId = req.user._id
    const { title, description, budget, technology, category, duration } = req.body

    if (!title || !description || !budget || !technology || !category || !duration) {
        res.status(409)
        throw new Error("Please Fill All Details!")
    }

    const project = new Project({
        user: userId, title, description, budget, technology, category, duration, freelancer: null,
    })

    await project.save()
    await project.populate("user", "-password")

    res.status(201).json(project)
}

// ── GET ALL PROJECTS ──────────────────────────────────────────────────────────
const getListProjects = async (req, res) => {
    const projects = await Project.find().populate("user", "-password")

    if (!projects || projects.length === 0) {
        res.status(404)
        throw new Error("No projects found")
    }

    res.status(200).json(projects)
}

// ── GET BIDS FOR A PROJECT (by projectId) ─────────────────────────────────────
const getBidsByProject = async (req, res) => {
    try {
        const bids = await Bid.find({ project: req.params.projectId })
            .populate({
                path: "freelancer",
                populate: { path: "user", select: "-password" },
            })
            .lean()

        res.status(200).json(bids)
    } catch (err) {
        res.status(500)
        throw new Error("Error fetching bids")
    }
}

// ── CHECK PROJECT APPLICATIONS (by pid) ───────────────────────────────────────
const checkProjectApplicatons = async (req, res) => {
    const projectId = req.params.pid

    const project = await Project.findById(projectId)
    if (!project) { res.status(404); throw new Error("Project Not Found!") }

    const bidding = await Bid.find({ project: projectId })
        .populate({
            path: "freelancer",
            populate: { path: "user", select: "-password" },
        })
        .populate("project")

    res.status(200).json(bidding || [])
}

// ── ACCEPT / UPDATE BID STATUS ────────────────────────────────────────────────
const acceptProjectRequest = async (req, res) => {
    const { status } = req.body
    if (!status) { res.status(409); throw new Error("Please Send Status") }

    const userId = req.user._id
    const bidId = req.params.bid

    const bid = await Bid.findById(bidId)
        .populate({ path: "freelancer", populate: { path: "user", select: "-password" } })
        .populate("project")

    if (!bid) { res.status(404); throw new Error("Bid Not Found") }

    if (bid.project.user.toString() !== userId.toString()) {
        res.status(403)
        throw new Error("You are not the owner of this project")
    }

    const updatedBid = await Bid.findByIdAndUpdate(bidId, { status }, { new: true })
        .populate({ path: "freelancer", populate: { path: "user", select: "-password" } })

    if (!updatedBid) { res.status(401); throw new Error("Bid Not Updated!") }

    const isAccepted = status === "accepted" || status === "Accepted"

    if (isAccepted) {
        const updatedProject = await Project.findByIdAndUpdate(
            bid.project._id,
            { freelancer: bid.freelancer._id },
            { new: true }
        ).populate("freelancer").populate("user", "-password")

        return res.status(200).json({ project: updatedProject, bid: updatedBid })
    }

    res.status(200).json(updatedBid)
}

// ── UPDATE PROJECT STATUS ─────────────────────────────────────────────────────
const updateProjectStatus = async (req, res) => {
    const { status } = req.body
    if (!status) { res.status(409); throw new Error("Please Send Status") }

    const project = await Project.findByIdAndUpdate(
        req.params.pid,
        { status },
        { new: true }
    ).populate("user", "-password").populate("freelancer")

    if (!project) { res.status(409); throw new Error("Project Not Found") }

    res.status(200).json(project)
}

const projectController = {
    getListProjects,
    listProject,
    acceptProjectRequest,
    updateProjectStatus,
    checkProjectApplicatons,
    getBidsByProject,
}

export default projectController