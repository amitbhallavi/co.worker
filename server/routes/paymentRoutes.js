import express from "express"
import paymentController from "../controllers/paymentController.js"
import walletController from "../controllers/walletController.js"
import protect from "../middlewere/authMiddleware.js"

const router = express.Router()

router.post("/create-order", protect.forAuthUsers, paymentController.createOrder)
router.post("/verify", protect.forAuthUsers, paymentController.verifyPayment)
router.post("/release/:projectId", protect.forAuthUsers, paymentController.releaseEscrow)
router.get("/project/:projectId", protect.forAuthUsers, paymentController.getProjectPayment)
router.get("/all", protect.forAdmin, paymentController.getAllPayments)
router.get("/me", protect.forAuthUsers, paymentController.getMyPayments)
router.post("/cron/clear-pending", protect.forAdmin, paymentController.clearPendingBalances)

router.get("/wallet/me", protect.forAuthUsers, walletController.getMyWallet)
router.post("/wallet/withdraw", protect.forAuthUsers, walletController.requestWithdrawal)
router.get("/wallet/withdrawals", protect.forAuthUsers, walletController.getMyWithdrawals)
router.get("/wallet/admin/withdrawals", protect.forAdmin, walletController.getAllWithdrawals)
router.put("/wallet/admin/withdrawals/:id", protect.forAdmin, walletController.processWithdrawal)

export default router