import express from "express"
import clientController from "../controllers/clientController.js"
import protect from "../middlewere/authMiddleware.js"

const router = express.Router()

router.post("/activate-plan", protect.forAuthUsers, clientController.activateClientPlan)
router.get("/features", protect.forAuthUsers, clientController.getClientFeatures)

export default router