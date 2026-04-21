import express from "express"
import authController from "../controllers/authController.js"
import protect from "../middlewere/authMiddleware.js"



const router = express.Router()


router.post("/register",  authController.registerUser)
router.post("/login", authController.loginUser)
router.post("/private", protect.forAdmin, authController.privateController)
router.get("/me", protect.forAuthUsers, authController.getMe)



export default router 
