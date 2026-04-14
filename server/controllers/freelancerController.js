// ===== FILE: server/controllers/freelancerController.js =====

import Bid from "../models/bidModel.js"
import Freelancer from "../models/freelancerModel.js"
import Project from "../models/projectModel.js"
import User from "../models/userModel.js"
import PreviousWork from "../models/previousWorks.js"

// ── BECOME FREELANCER ──────────────────────────────────────────────────────────
// POST /api/freelancer/add-me
const becomeFreelancer = async (req, res) => {
    const userId = req.user._id
    const { description, skills, category, experience } = req.body

    // ✅ experience is OPTIONAL — defaults to 0
    if (!description || !skills || !category) {
        res.status(400)
        throw new Error("Please fill all required fields: description, skills, category")
    }

    if (description.trim().length < 20) {
        res.status(400)
        throw new Error("Description must be at least 20 characters")
    }

    // ✅ Prevent duplicate profile
    const existing = await Freelancer.findOne({ user: userId })
    if (existing) {
        res.status(409)
        throw new Error("You already have a freelancer profile")
    }

    const freelancer = await Freelancer.create({
        user: userId,
        description: description.trim(),
        skills: typeof skills === "string" ? skills.trim() : skills.join(", "),
        category,
        experience: Number(experience) || 0,  // ✅ default 0 if not sent
    })

    await freelancer.populate("user", "-password")

    // ✅ Update user isFreelancer flag
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { isFreelancer: true },
        { new: true }
    ).select("-password")

    if (!updatedUser) {
        res.status(500)
        throw new Error("Failed to update user freelancer status")
    }

    res.status(201).json({
        success: true,
        message: "Freelancer profile created successfully!",
        user: updatedUser,
        freelancer: {
            profile: freelancer,
            previousWorks: [],
        },
    })
}

// ── APPLY FOR PROJECT (BID) ────────────────────────────────────────────────────
// POST /api/freelancer/project/:pid
const applyForProject = async (req, res) => {
    const projectId = req.params.pid
    const userId = req.user._id
    const { amount } = req.body

    if (!amount || Number(amount) <= 0) {
        res.status(400)
        throw new Error("Please enter a valid bid amount greater than 0")
    }

    const project = await Project.findById(projectId)
    if (!project) { res.status(404); throw new Error("Project not found") }

    const user = await User.findById(userId)
    if (!user) { res.status(404); throw new Error("User not found") }

    const freelancer = await Freelancer.findOne({ user: userId })
    if (!freelancer) {
        res.status(403)
        throw new Error("Only freelancers can bid on projects")
    }

    // ✅ Prevent duplicate bid
    const existingBid = await Bid.findOne({ freelancer: freelancer._id, project: projectId })
    if (existingBid) {
        res.status(409)
        throw new Error("You have already placed a bid on this project")
    }

    if (user.credits <= 0) {
        res.status(402)
        throw new Error("Not enough credits to place a bid")
    }

    const bid = new Bid({
        freelancer: freelancer._id,
        project: projectId,
        amount: Number(amount),
    })

    await bid.save()
    await bid.populate({ path: "freelancer", populate: { path: "user", select: "-password" } })
    await bid.populate("project")

    // ✅ Deduct one credit
    await User.findByIdAndUpdate(userId, { credits: user.credits - 1 })

    res.status(201).json(bid)
}

// ── SUBMIT PROJECT ─────────────────────────────────────────────────────────────
const submitProject = async (req, res) => {
    const projectId = req.params.pid
    const workProgress = await Project.findByIdAndUpdate(
        projectId,
        { status: "in-progress" },
        { new: true }
    ).populate("user", "-password").populate("freelancer")

    if (!workProgress) { res.status(404); throw new Error("Project not found") }

    res.status(200).json(workProgress)
}

// ── GET MY PREVIOUS PROJECTS ───────────────────────────────────────────────────
const getMypreviousProject = async (req, res) => {
    const userId = req.user._id
    const freelancer = await Freelancer.findOne({ user: userId })

    if (!freelancer) { res.status(404); throw new Error("Freelancer profile not found") }

    const previousProject = await Project.find({ freelancer: freelancer._id })
        .populate("freelancer")

    res.status(200).json(previousProject || [])
}

// ── GET MY WORK (portfolio) ────────────────────────────────────────────────────
const getMyWork = async (req, res) => {
    const userId = req.user._id
    const freelancer = await Freelancer.findOne({ user: userId })

    if (!freelancer) { res.status(404); throw new Error("Freelancer profile not found") }

    const myWorks = await PreviousWork.find({ freelancer: freelancer._id })
    res.status(200).json(myWorks || [])
}

// ── ADD MY WORK (portfolio) ────────────────────────────────────────────────────
const addMyWork = async (req, res) => {
    const userId = req.user._id
    const { projectLink, projectDescription, projectImage } = req.body

    const freelancer = await Freelancer.findOne({ user: userId })
    if (!freelancer) { res.status(404); throw new Error("Freelancer profile not found") }

    const work = await PreviousWork.create({
        freelancer: freelancer._id,
        projectLink,
        projectDescription,
        projectImage,
    })

    await work.populate("freelancer")
    res.status(201).json(work)
}

// ── UPDATE MY WORK ────────────────────────────────────────────────────────────
const updateMyWork = async (req, res) => {
    const userId = req.user._id
    const workId = req.params.wid
    const freelancer = await Freelancer.findOne({ user: userId })

    if (!freelancer) { res.status(404); throw new Error("Freelancer profile not found") }

    const updateWork = await PreviousWork.findByIdAndUpdate(workId, req.body, { new: true })
    if (!updateWork) { res.status(404); throw new Error("Work not found") }

    res.status(200).json(updateWork)
}

// ── REMOVE MY WORK ────────────────────────────────────────────────────────────
const removeMyWork = async (req, res) => {
    const userId = req.user._id
    const workId = req.params.wid
    const freelancer = await Freelancer.findOne({ user: userId })

    if (!freelancer) { res.status(404); throw new Error("Freelancer profile not found") }

    await PreviousWork.findByIdAndDelete(workId)
    res.status(200).json({ success: true, workId, message: "Work removed successfully" })
}

// ── UPDATE PROFILE ────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
    const userId = req.user._id
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true }).select("-password")

    if (!updatedUser) { res.status(500); throw new Error("Profile update failed") }

    res.status(200).json(updatedUser)
}

// ── GET ALL FREELANCERS ───────────────────────────────────────────────────────
const getFreelancers = async (req, res) => {
    const freelancers = await Freelancer.find().populate("user", "-password")
    res.status(200).json(freelancers || [])
}

// ── GET SINGLE FREELANCER ─────────────────────────────────────────────────────
const getFreelancer = async (req, res) => {
    const freelancer = await Freelancer.findOne({ user: req.params.uid })
        .populate("user", "-password")

    if (!freelancer) { res.status(404); throw new Error("Freelancer not found") }

    const previousWorks = await PreviousWork.find({ freelancer: freelancer._id })

    res.status(200).json({
        profile: freelancer,
        previousWorks: previousWorks || [],
    })
}

const FreelancerController = {
    becomeFreelancer,
    applyForProject,
    submitProject,
    getMypreviousProject,
    getMyWork,
    addMyWork,
    updateProfile,
    updateMyWork,
    removeMyWork,
    getFreelancers,
    getFreelancer,
}

export default FreelancerController