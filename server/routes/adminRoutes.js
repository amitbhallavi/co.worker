import express from "express"
import adminController from "../controllers/adminController.js"
import protect from "../middlewere/authMiddleware.js"

const router = express.Router()

router.use(protect.forAdmin)

router.get("/users", adminController.getAllUsers)
router.put("/users/:uid", adminController.updateUser)
router.delete("/users/:uid", adminController.deleteUser)

router.get("/projects", adminController.getAllProjects)
router.put("/projects/:pid", adminController.updateProject)

router.get("/bids", adminController.getAllBids)
router.put("/bids/:bid_id", adminController.updateBid)

router.get("/stats", adminController.getDashboardStats)

export default router