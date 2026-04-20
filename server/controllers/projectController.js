import Bid from "../models/bidModel.js"
import Project from "../models/projectModel.js"
import Freelancer from "../models/freelancerModel.js"

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
    await project.populate("user")

    if (!project) { res.status(401); throw new Error("Project Not Listed") }
    res.status(201).json(project)
}

// ── GET ALL PROJECTS ──────────────────────────────────────────────────────────
const getListProjects = async (req, res) => {
    const project = await Project.find()
        .populate("user", "-password")
        .populate({
            path: "freelancer",
            populate: { path: "user", select: "-password" },
        })

    if (!project || project.length === 0) {
        res.status(404)
        throw new Error("Project Not Found")
    }

    res.status(200).json(project)
}

// ── GET BIDS FOR A PROJECT ────────────────────────────────────────────────────

const getBidsByProject = async (req, res) => {
  try {
    const bids = await Bid.find({ project: req.params.projectId })
      .populate({
        path: "freelancer",
        populate: { path: "user", select: "-password" }
      })
      .lean()
    
    res.status(200).json(bids)
  } catch (err) {
    res.status(500)
    throw new Error("Error fetching bids")
  }
}

// ── GET BIDS FOR A PROJECT ────────────────────────────────────────────────────
// ✅ KEY FIX: Was using wrong populate chain — bid.freelancer.user was always undefined
//
// ❌ WRONG (before):
//   .populate("freelancer")             ← only populates freelancer doc, NOT freelancer.user
//   .populate("project.freelancer.user") ← invalid chained path, does nothing
//
// ✅ CORRECT (now):
//   .populate({ path: "freelancer", populate: { path: "user" } })
//   ↑ This gives: bid.freelancer._id, bid.freelancer.user.name, bid.freelancer.user.email etc.
//
// Frontend accesses: bid.freelancer?.user?.name  ← now works!
const checkProjectApplicatons = async (req, res) => {
    const projectId = req.params.pid

    const project = await Project.findById(projectId)
    if (!project) { res.status(404); throw new Error("Project Not Found!") }

    const bidding = await Bid.find({ project: projectId })
        .populate({
            path: "freelancer",
            populate: { path: "user" }   // ← nested populate: freelancer.user now available
        })
        .populate("project")

    if (!bidding) { res.status(404); throw new Error("Bidding Not Found!") }

    res.status(200).json(bidding)
}

// ── ACCEPT / UPDATE BID STATUS ────────────────────────────────────────────────
const acceptProjectRequest = async (req, res) => {
    const { status } = req.body
    if (!status) { res.status(409); throw new Error("Please Send Status") }

    const userId = req.user._id
    const bidId = req.params.bid

    const bid = await Bid.findById(bidId)
        .populate({
            path: "freelancer",
            populate: { path: "user" }   // ← deep populate here too
        })
        .populate("project")

    if (!bid) { res.status(404); throw new Error("Bid Not Found") }

    // Ownership check
    if (bid.project.user.toString() !== userId.toString()) {
        res.status(403)
        throw new Error("You are not the rightful owner of this project")
    }

    const updatedBid = await Bid.findByIdAndUpdate(
        bidId, { status }, { new: true }
    ).populate({ path: "freelancer", populate: { path: "user" } })

    if (!updatedBid) { res.status(401); throw new Error("Bid Not Updated!") }

    // Check both cases (frontend might send "accepted" or "Accepted")
    const isAccepted = status === "accepted" || status === "Accepted"

    if (isAccepted) {
        // ✅ Enforce one accepted bid per project
        const alreadySelected = await Project.findById(bid.project._id).select("selectedBid finalAmount status")
        if (alreadySelected?.selectedBid) {
            res.status(409)
            throw new Error("A bid is already accepted for this project")
        }

        const updatedProject = await Project.findByIdAndUpdate(
            bid.project._id,
            // ✅ mark accepted (payment pending) + assign freelancer
            { freelancer: bid.freelancer._id, status: "accepted", selectedBid: bid._id, finalAmount: bid.amount },
            { new: true }
        )
            .populate("freelancer")
            .populate("user")
            .populate("selectedBid")

        // ✅ Notify freelancer that payment is required before assignment becomes active
        if (global.io) {
            global.io.to(`user_${bid.freelancer.user._id}`).emit("payment_pending", {
                projectId: updatedProject._id,
                title: updatedProject.title,
                status: updatedProject.status,
                message: `Client must complete payment to start "${updatedProject.title}".`,
            })

            // ✅ Client-side realtime sync: finalAmount locked to bid amount
            global.io.to(`user_${userId}`).emit("bidAccepted", {
                projectId: updatedProject._id,
                bidId: bid._id,
                finalAmount: bid.amount,
            })
        }

        return res.status(200).json({ project: updatedProject, bid: updatedBid })
    }

    res.status(200).json(updatedBid)
}

// ── GET ASSIGNED PROJECTS FOR FREELANCER ─────────────────────────────────────
// ✅ Returns projects where the logged-in user is assigned as freelancer
// Conditions: bid status === "accepted" OR project.status === "accepted"/"in-progress"
const getAssignedProjects = async (req, res) => {
    try {
        const userId = req.user._id

        // Find freelancer record for this user
        const freelancer = await Freelancer.findOne({ user: userId })
        if (!freelancer) {
            return res.status(200).json([])
        }

        // ✅ Payment condition:
        // Do NOT show "accepted" (payment pending) to freelancer. Show only active work.
        const assignedProjects = await Project.find({
            freelancer: freelancer._id,
            status: { $in: ["in-progress", "completed"] },
        })
            .populate("user", "-password")
            .populate({
                path: "freelancer",
                populate: { path: "user", select: "-password" }
            })
            .sort({ createdAt: -1 })

        res.status(200).json(assignedProjects)
    } catch (error) {
        res.status(500)
        throw new Error("Error fetching assigned projects")
    }
}

// ── GET SINGLE PROJECT WITH DETAILS ───────────────────────────────────────────
const getProjectDetails = async (req, res) => {
    try {
        const { id } = req.params

        const project = await Project.findById(id)
            .populate("user", "-password")
            .populate({
                path: "freelancer",
                populate: { path: "user", select: "-password" }
            })

        if (!project) {
            res.status(404)
            throw new Error("Project not found")
        }

        res.status(200).json(project)
    } catch (error) {
        res.status(error.statusCode || 500)
        throw error
    }
}

// ── UPDATE PROJECT STATUS ─────────────────────────────────────────────────────
const updateProjectStatus = async (req, res) => {
    const { status } = req.body
    if (!status) { res.status(409); throw new Error("Please Send Status") }

    const projectId = req.params.pid

    const project = await Project.findByIdAndUpdate(
        projectId, { status }, { new: true }
    ).populate("user").populate("freelancer")

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
    getAssignedProjects,
    getProjectDetails
}

export default projectController