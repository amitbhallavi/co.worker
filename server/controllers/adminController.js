
import User from "../models/userModel.js"
import Project from "../models/projectModel.js"
import Bid from "../models/bidModel.js"

// ─── GET ALL USERS ────────────────────────────────────────────────────────────

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find().select("-password").lean()
    res.status(200).json(allUsers)
  } catch (err) {
    res.status(500)
    throw new Error("Server error fetching users")
  }
}

// ─── UPDATE USER (any field: credits, status, role, etc.) ─────────────────────

const updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.uid,
      { $set: req.body },
      { new: true, runValidators: false }
    ).select("-password")

    if (!updated) {
      res.status(404)
      throw new Error("User not found")
    }
    res.status(200).json(updated)
  } catch (err) {
    res.status(500)
    throw new Error(err.message || "Cannot update user")
  }
}

// ─── DELETE USER ──────────────────────────────────────────────────────────────

const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.uid)
    if (!deleted) {
      res.status(404)
      throw new Error("User not found")
    }
    res.status(200).json({ message: "User deleted", _id: req.params.uid })
  } catch (err) {
    res.status(500)
    throw new Error(err.message || "Cannot delete user")
  }
}

// ─── GET ALL PROJECTS (with bids populated) ────────────────────────────────────

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("client", "name email")
      .populate({
        path: "bids",
        populate: { path: "freelancer", select: "name email" },
      })
      .lean()
    res.status(200).json(projects)
  } catch (err) {
    res.status(500)
    throw new Error("Server error fetching projects")
  }
}

// ─── UPDATE PROJECT STATUS ────────────────────────────────────────────────────
const updateProject = async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(
      req.params.pid,
      { $set: req.body },
      { new: true }
    )
    if (!updated) {
      res.status(404)
      throw new Error("Project not found")
    }
    res.status(200).json(updated)
  } catch (err) {
    res.status(500)
    throw new Error(err.message || "Cannot update project")
  }
}

// ─── GET ALL BIDS ─────────────────────────────────────────────────────────────
const getAllBids = async (req, res) => {
  try {
    const bids = await Bid.find()
      .populate("freelancer", "name email credits")
      .populate("project", "title budget")
      .lean()
    res.status(200).json(bids)
  } catch (err) {
    res.status(500)
    throw new Error("Server error fetching bids")
  }
}

// ─── UPDATE BID STATUS ────────────────────────────────────────────────────────
const updateBid = async (req, res) => {
  try {
    const updated = await Bid.findByIdAndUpdate(
      req.params.bid_id,
      { $set: req.body },
      { new: true }
    )
      .populate("freelancer", "name email")
      .populate("project", "title")
    if (!updated) {
      res.status(404)
      throw new Error("Bid not found")
    }
    res.status(200).json(updated)
  } catch (err) {
    res.status(500)
    throw new Error(err.message || "Cannot update bid")
  }
}

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalFreelancers, totalProjects, totalBids, creditAgg] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isFreelancer: true }),
        Project.countDocuments(),
        Bid.countDocuments(),
        User.aggregate([{ $group: { _id: null, total: { $sum: "$credits" } } }]),
      ])

    const totalCredits = creditAgg[0]?.total || 0

    res.status(200).json({
      totalUsers,
      totalFreelancers,
      totalProjects,
      totalBids,
      totalCredits,
    })
  } catch (err) {
    res.status(500)
    throw new Error("Server error fetching stats")
  }
}

const adminController = {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllProjects,
  updateProject,
  getAllBids,
  updateBid,
  getDashboardStats,
}

export default adminController