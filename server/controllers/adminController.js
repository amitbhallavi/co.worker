
import User from "../models/userModel.js"
import Project from "../models/projectModel.js"
import Bid from "../models/bidModel.js"
import Payment from "../models/paymentModel.js"
import PlatformSettings from "../models/platformSettingsModel.js"
import { emitAdminDataChanged } from "../utils/adminRealtime.js"

const adminFreelancerPopulate = {
  path: "freelancer",
  populate: { path: "user", select: "name email profilePic credits isFreelancer" },
}

const toMonthlyRange = (monthsBack) => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)
  const end = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

const getPaymentTotal = async (startDate, endDate) => {
  const result = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ["escrow", "released"] },
      },
    },
    { $group: { _id: null, total: { $sum: "$platformFee" }, count: { $sum: 1 } } },
  ])

  return result[0] || { total: 0, count: 0 }
}

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
    emitAdminDataChanged("user_updated", { message: `User updated: ${updated.name || updated.email}` })
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
    emitAdminDataChanged("user_deleted", { message: `User deleted: ${deleted.name || deleted.email}` })
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
      .populate("user", "name email profilePic")
      .populate(adminFreelancerPopulate)
      .populate("selectedBid")
      .sort({ createdAt: -1 })
      .lean()

    const projectIds = projects.map(project => project._id)
    const bids = await Bid.find({ project: { $in: projectIds } })
      .populate(adminFreelancerPopulate)
      .lean()

    const projectsWithBids = projects.map(project => ({
      ...project,
      bids: bids.filter(bid => bid.project?.toString() === project._id.toString()),
    }))

    res.status(200).json(projectsWithBids)
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
      .populate("user", "name email profilePic")
      .populate(adminFreelancerPopulate)
      .populate("selectedBid")
    if (!updated) {
      res.status(404)
      throw new Error("Project not found")
    }
    emitAdminDataChanged("project_updated", { message: `Project updated: ${updated.title}` })
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
      .populate(adminFreelancerPopulate)
      .populate({ path: "project", select: "title budget user status", populate: { path: "user", select: "name email" } })
      .sort({ createdAt: -1 })
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
      .populate(adminFreelancerPopulate)
      .populate({ path: "project", select: "title budget user status", populate: { path: "user", select: "name email" } })
    if (!updated) {
      res.status(404)
      throw new Error("Bid not found")
    }
    emitAdminDataChanged("bid_updated", { message: `Bid updated: ${updated.status}` })
    res.status(200).json(updated)
  } catch (err) {
    res.status(500)
    throw new Error(err.message || "Cannot update bid")
  }
}

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalFreelancers, totalProjects, totalBids, totalPayments, successfulPayments, creditAgg, revenueAgg] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isFreelancer: true }),
        Project.countDocuments(),
        Bid.countDocuments(),
        Payment.countDocuments(),
        Payment.countDocuments({ status: { $in: ["escrow", "released"] } }),
        User.aggregate([{ $group: { _id: null, total: { $sum: "$credits" } } }]),
        Payment.aggregate([
          { $match: { status: { $in: ["escrow", "released"] } } },
          { $group: { _id: null, total: { $sum: "$platformFee" } } },
        ]),
      ])

    const totalCredits = creditAgg[0]?.total || 0
    const totalRevenue = revenueAgg[0]?.total || 0

    res.status(200).json({
      totalUsers,
      totalFreelancers,
      totalProjects,
      totalBids,
      totalCredits,
      totalRevenue,
      totalPayments,
      successfulPayments,
    })
  } catch (err) {
    res.status(500)
    throw new Error("Server error fetching stats")
  }
}

// ─── MONTHLY ANALYTICS (Real-time data aggregation) ──────────────────────────
const getMonthlyAnalytics = async (req, res) => {
  try {
    const monthsData = []

    // Generate data for last 12 months
    for (let i = 11; i >= 0; i--) {
      const { start: startDate, end: endDate } = toMonthlyRange(i)

      const [bidsCount, projectsCount, usersCount, freelancersCount, paymentStats] = await Promise.all([
        Bid.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        Project.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        User.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        User.countDocuments({
          isFreelancer: true,
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        getPaymentTotal(startDate, endDate),
      ])

      monthsData.push({
        month: startDate.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        bids: bidsCount,
        projects: projectsCount,
        revenue: paymentStats.total,
        users: usersCount,
        freelancers: freelancersCount,
      })
    }

    res.status(200).json({
      months: monthsData.map(m => m.month.split(' ')[0]),
      bids: monthsData.map(m => m.bids),
      projects: monthsData.map(m => m.projects),
      revenue: monthsData.map(m => m.revenue),
      userGrowth: monthsData.map(m => m.users),
      freelancers: monthsData.map(m => m.freelancers),
      chartData: monthsData
    })
  } catch (err) {
    res.status(500)
    throw new Error("Server error fetching monthly analytics")
  }
}

// ─── PAYMENT TRANSACTIONS (Real-time payments list) ──────────────────────────
const getRecentPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("project", "title budget")
      .populate("client", "name email")
      .populate("freelancer", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    res.status(200).json(payments)
  } catch (err) {
    res.status(500)
    throw new Error("Server error fetching payments")
  }
}

// ─── GET PLATFORM SETTINGS (Persistent toggles) ────────────────────────────
const getPlatformSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.getInstance()
    res.status(200).json(settings)
  } catch (err) {
    res.status(500)
    throw new Error("Server error fetching platform settings")
  }
}

// ─── UPDATE PLATFORM SETTINGS ──────────────────────────────────────────────
const updatePlatformSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.getInstance()

    Object.assign(settings, req.body)
    settings.lastUpdatedBy = req.user?._id

    const updated = await settings.save()
    emitAdminDataChanged("settings_updated", { message: "Platform settings updated" })
    res.status(200).json(updated)
  } catch (err) {
    res.status(500)
    throw new Error("Server error updating platform settings")
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
  getMonthlyAnalytics,
  getRecentPayments,
  getPlatformSettings,
  updatePlatformSettings,
}

export default adminController
