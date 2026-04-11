// ===== FILE: server/routes/adminRoutes.js =====

import express from "express"
import adminController from "../controllers/adminController.js"
import protect from "../middlewere/authMiddleware.js"

const router = express.Router()

// All routes protected by forAdmin middleware
router.use(protect.forAdmin)

// ── Users ──────────────────────────────────────────────────────────────────
router.get("/users", adminController.getAllUsers)
router.put("/users/:uid", adminController.updateUser)
router.delete("/users/:uid", adminController.deleteUser)

// ── Projects ───────────────────────────────────────────────────────────────
router.get("/projects", adminController.getAllProjects)
router.put("/projects/:pid", adminController.updateProject)

// ── Bids ────────────────────────────────────────────────────────────────────
router.get("/bids", adminController.getAllBids)
router.put("/bids/:bid_id", adminController.updateBid)

// ── Dashboard Stats ─────────────────────────────────────────────────────────
router.get("/stats", adminController.getDashboardStats)

export default router