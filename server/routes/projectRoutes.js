import express from "express"
import projectController from "../controllers/projectController.js"
import protect from "../middlewere/authMiddleware.js"
import { checkPlanFeature } from "../middlewere/planMiddleware.js"

const router = express.Router()

router.get("/", projectController.getListProjects)
router.get("/assigned/mine", protect.forAuthUsers, projectController.getAssignedProjects)
router.get("/assigned", protect.forAuthUsers, projectController.getAssignedProjects)
router.get("/details/:id", protect.forAuthUsers, projectController.getProjectDetails)
router.post("/add", protect.forAuthUsers, checkPlanFeature("createProject"), projectController.listProject)
router.post("/:bid", protect.forAuthUsers, projectController.acceptProjectRequest)
router.put("/:pid", protect.forAuthUsers, projectController.updateProjectStatus)
router.get("/:pid", protect.forAuthUsers, projectController.checkProjectApplicatons)
router.get("/bids/:projectId", protect.forAuthUsers, projectController.getBidsByProject)

export default router