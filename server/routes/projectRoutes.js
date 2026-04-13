import express from "express"
import projectController from "../controllers/projectController.js"
import protect from "../middlewere/authMiddleware.js"




const router = express.Router()

router.get("/", projectController.getListProjects)
router.post("/add", protect.forAuthUsers, projectController.listProject)
router.post("/:bid", protect.forAuthUsers, projectController.acceptProjectRequest)
router.put("/:pid", protect.forAuthUsers, projectController.updateProjectStatus)
router.get("/:pid", protect.forAuthUsers, projectController.checkProjectApplicatons)
// Ek project ke saare bids lao
router.get("/bids/:projectId", protect.forAuthUsers, projectController.getBidsByProject)





export default router