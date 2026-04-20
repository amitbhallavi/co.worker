import express from "express"
import ratingController from "../controllers/ratingController.js"
import protect from "../middlewere/authMiddleware.js"

const router = express.Router()

// ✅ IMPORTANT: More specific routes MUST come first!
// ✅ GET /api/ratings/user/:userId/summary - Quick rating summary (FIRST - more specific)
router.get("/user/:userId/summary", ratingController.getRatingSummary)

// ✅ GET /api/ratings/:userId - Get all ratings for a user with filter & sort (SECOND - general)
router.get("/:userId", ratingController.getRatings)

// ✅ POST /api/ratings - Create a new rating (open system)
router.post("/", protect.forAuthUsers, ratingController.addRating)

// ✅ PUT /api/ratings/:ratingId - Update a rating
router.put("/:ratingId", protect.forAuthUsers, ratingController.updateRating)

// ✅ DELETE /api/ratings/:ratingId - Delete a rating
router.delete("/:ratingId", protect.forAuthUsers, ratingController.deleteRating)

// ✅ POST /api/ratings/:ratingId/report - Report a review
router.post("/:ratingId/report", protect.forAuthUsers, ratingController.reportRating)

export default router