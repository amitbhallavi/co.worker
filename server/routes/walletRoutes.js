// walletRoutes.js

import express from "express"
import walletController from "../controllers/walletController.js"
import protect from "../middlewere/authMiddleware.js"

const router = express.Router()

// User routes
router.get("/me", protect.forAuthUsers, walletController.getMyWallet)
router.post("/withdraw", protect.forAuthUsers, walletController.requestWithdrawal)
router.get("/withdrawals", protect.forAuthUsers, walletController.getMyWithdrawals)

// Admin routes
router.get("/admin/withdrawals", protect.forAdmin, walletController.getAllWithdrawals)
router.put("/admin/withdrawals/:id", protect.forAdmin, walletController.processWithdrawal)

export default router