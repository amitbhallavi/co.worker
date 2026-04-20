import express from "express"
import clientController from "../controllers/clientController.js"
import protect from "../middlewere/authMiddleware.js"

const router = express.Router()

// ✅ Activate free client plan (no payment required)
router.post("/activate-plan", protect.forAuthUsers, clientController.activateClientPlan)

// ✅ Get client features
router.get("/features", protect.forAuthUsers, clientController.getClientFeatures)

export default router
