import express from "express"
import subscriptionController from "../controllers/subscriptionController.js"
import protect from "../middlewere/authMiddleware.js"

const router = express.Router()

router.get("/plans", subscriptionController.getAllPlans)

router.post("/create-order", protect.forAuthUsers, subscriptionController.createSubscriptionOrder)
router.post("/verify", protect.forAuthUsers, subscriptionController.verifySubscriptionSignature)
router.post("/cancel", protect.forAuthUsers, subscriptionController.cancelSubscription)
router.post("/extend", protect.forAuthUsers, subscriptionController.extendPlan)
router.get("/status", protect.forAuthUsers, subscriptionController.getUserPlanStatus)
router.get("/history", protect.forAuthUsers, subscriptionController.getSubscriptionHistory)

export default router