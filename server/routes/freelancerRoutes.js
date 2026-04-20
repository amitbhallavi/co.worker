import express from "express"
import freelancerController from "../controllers/freelancerController.js"
import rantingRoutes from "./ratingRoutes.js"
import protect from "../middlewere/authMiddleware.js"
import { checkPlanFeature } from "../middlewere/planMiddleware.js"

const router = express.Router({ mergeParams: true })


router.get("/", freelancerController.getFreelancers)
router.get("/profile/:uid", freelancerController.getFreelancer)


router.post("/add-me", protect.forAuthUsers, freelancerController.becomeFreelancer)

router.get("/project", protect.forAuthUsers, freelancerController.getMypreviousProject)

router.post("/project/:pid", protect.forAuthUsers, checkPlanFeature("createBid"), freelancerController.applyForProject)

router.put("/project/:pid", freelancerController.submitProject)

router.get("/my-work", protect.forAuthUsers, freelancerController.getMyWork)

router.post("/my-work", protect.forAuthUsers,  freelancerController.addMyWork)

router.put("/my-work/:wid", protect.forAuthUsers, freelancerController.updateMyWork)

router.delete("/my-work/:wid", protect.forAuthUsers, freelancerController.removeMyWork)

router.put("/profile", protect.forAuthUsers, freelancerController.updateProfile)

router.use("/:fid/ratings", rantingRoutes)



export default router; 