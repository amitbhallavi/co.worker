import Bid from "../models/bidModel.js"
import Freelancer from "../models/freelancerModel.js"
import PreviousWork from "../models/previousWorks.js"
import Project from "../models/projectModel.js"
import User from "../models/userModel.js"
import { ensure } from "../utils/http.js"

const getFreelancerProfileByUserId = async (userId) => {
    const freelancer = await Freelancer.findOne({ user: userId })
    ensure(freelancer, 404, "Freelancer profile not found")
    return freelancer
}

const normalizeSkills = (skills) => (
    typeof skills === "string" ? skills.trim() : skills.join(", ")
)

const becomeFreelancer = async (req, res) => {
    const { description, skills, category, experience } = req.body

    ensure(description && skills && category && experience, 400, "Please fill all required fields: description, skills, category, experience")
    ensure(description.trim().length >= 20, 400, "Description must be at least 20 characters")
    ensure(Number(experience) >= 0 && Number(experience) <= 50, 400, "Experience must be between 0 and 50 years")

    const existingProfile = await Freelancer.findOne({ user: req.user._id })
    ensure(!existingProfile, 409, "You already have a freelancer profile")

    const freelancer = await Freelancer.create({
        user: req.user._id,
        description: description.trim(),
        skills: normalizeSkills(skills),
        category,
        experience: Number(experience),
    })

    await freelancer.populate("user", "-password")

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { isFreelancer: true },
        { new: true }
    ).select("-password")

    ensure(updatedUser, 500, "Failed to update user freelancer status")

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

const applyForProject = async (req, res) => {
    const { amount } = req.body
    ensure(amount && Number(amount) > 0, 400, "Please enter a valid bid amount greater than 0")

    const project = await Project.findById(req.params.pid)
    ensure(project, 404, "Project not found")

    const user = await User.findById(req.user._id)
    ensure(user, 404, "User not found")

    const freelancer = await Freelancer.findOne({ user: req.user._id })
    ensure(freelancer, 403, "Only freelancers can bid on projects")

    const existingBid = await Bid.findOne({ freelancer: freelancer._id, project: req.params.pid })
    ensure(!existingBid, 409, "You have already placed a bid on this project")
    ensure(user.credits > 0, 402, "Not enough credits to place a bid")

    const bid = await Bid.create({
        freelancer: freelancer._id,
        project: req.params.pid,
        amount: Number(amount),
    })

    await bid.populate("freelancer")
    await bid.populate("project")

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { credits: user.credits - 1 },
        { new: true }
    )

    if (global.io) {
        global.io.emit("creditsUpdated", {
            userId: req.user._id,
            credits: updatedUser.credits,
        })
    }

    res.status(201).json(bid)
}

const submitProject = async (req, res) => {
    const project = await Project.findByIdAndUpdate(
        req.params.pid,
        { status: "in-progress" },
        { new: true }
    ).populate("user").populate("freelancer")

    ensure(project, 404, "Project not found")
    res.status(200).json(project)
}

const getMypreviousProject = async (req, res) => {
    const freelancer = await getFreelancerProfileByUserId(req.user._id)
    const previousProjects = await Project.find({ freelancer: freelancer._id }).populate("freelancer")
    res.status(200).json(previousProjects || [])
}

const getMyWork = async (req, res) => {
    const freelancer = await getFreelancerProfileByUserId(req.user._id)
    const previousWorks = await PreviousWork.find({ freelancer: freelancer._id })
    res.status(200).json(previousWorks || [])
}

const addMyWork = async (req, res) => {
    const freelancer = await getFreelancerProfileByUserId(req.user._id)

    const work = await PreviousWork.create({
        freelancer: freelancer._id,
        projectLink: req.body.projectLink,
        projectDescription: req.body.projectDescription,
        projectImage: req.body.projectImage,
    })

    await work.populate("freelancer")
    res.status(201).json(work)
}

const updateMyWork = async (req, res) => {
    await getFreelancerProfileByUserId(req.user._id)

    const updatedWork = await PreviousWork.findByIdAndUpdate(req.params.wid, req.body, { new: true })
    ensure(updatedWork, 404, "Work not found")
    res.status(200).json(updatedWork)
}

const removeMyWork = async (req, res) => {
    await getFreelancerProfileByUserId(req.user._id)
    await PreviousWork.findByIdAndDelete(req.params.wid)

    res.status(200).json({
        success: true,
        workId: req.params.wid,
        message: "Work removed successfully",
    })
}

const updateProfile = async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select("-password")
    ensure(updatedUser, 500, "Profile update failed")
    res.status(200).json(updatedUser)
}

const getFreelancers = async (req, res) => {
    const limit = req.query.limit ? Number.parseInt(req.query.limit, 10) : 0

    const freelancers = await Freelancer.find()
        .populate("user", "-password")
        .limit(limit)

    res.status(200).json(freelancers || [])
}

const getFreelancer = async (req, res) => {
    const freelancer = await Freelancer.findOne({ user: req.params.uid }).populate("user", "-password")

    if (!freelancer) {
        return res.status(200).json({
            profile: null,
            previousWorks: [],
        })
    }

    const previousWorks = await PreviousWork.find({ freelancer: freelancer._id })

    res.status(200).json({
        profile: freelancer,
        previousWorks: previousWorks || [],
    })
}

const freelancerController = {
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

export default freelancerController
