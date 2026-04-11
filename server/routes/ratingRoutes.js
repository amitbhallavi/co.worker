import express from "express"
import ratingController from "../controllers/ratingController.js"
import protect from "../middlewere/authMiddleware.js"



const router = express.Router()


router.get("/", ratingController.getRatings)
router.post("/", protect.forAuthUsers, ratingController.addRating)




export default router 