import express from "express"
import ratingController from "../controllers/ratingController.js"
import protect from "../middlewere/authMiddleware.js"

const router = express.Router()

router.get("/user/:userId/summary", ratingController.getRatingSummary)
router.get("/:userId", ratingController.getRatings)
router.post("/", protect.forAuthUsers, ratingController.addRating)
router.put("/:ratingId", protect.forAuthUsers, ratingController.updateRating)
router.delete("/:ratingId", protect.forAuthUsers, ratingController.deleteRating)
router.post("/:ratingId/report", protect.forAuthUsers, ratingController.reportRating)

export default router