import express from "express"
import ChatController from "../controllers/chatController.js"
import protect from "../middlewere/authMiddleware.js"

const router = express.Router()

router.post("/conversation", protect.forAuthUsers, ChatController.getOrCreateConversation)
router.get("/conversations", protect.forAuthUsers, ChatController.getMyConversations)
router.get("/conversation/:conversationId/messages", protect.forAuthUsers, ChatController.getMessages)
router.post("/conversation/:conversationId/message", protect.forAuthUsers, ChatController.sendMessage)
router.get("/unread", protect.forAuthUsers, ChatController.getUnreadCount)
router.delete("/conversation/:conversationId", protect.forAuthUsers, ChatController.deleteConversation)

export default router