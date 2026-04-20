import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import "colors"
import rateLimit from "express-rate-limit"
import connectDB from "./config/dbConfig.js"

// Local Imports
import authRoutes from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import freelancerRoutes from "./routes/freelancerRoutes.js"
import projectRoutes from "./routes/projectRoutes.js"
import clientRoutes from "./routes/clientRoutes.js"
import errorHandler from "./middlewere/errorHandler.js"

import paymentRoutes from "./routes/paymentRoutes.js"
import walletRoutes from "./routes/walletRoutes.js"
import PaymentController from "./controllers/paymentController.js"
import cron from "node-cron"

import http from "http"
import { initSocket } from "./middlewere/socketHandler.js"
import chatRoutes from "./routes/chatRoutes.js"
import ratingRoutes from "./routes/ratingRoutes.js"
import subscriptionRoutes from "./routes/subscriptionRoutes.js"
import { renewSubscriptionsJob, checkExpiredPlans } from "./jobs/renewSubscriptions.js"






const PORT = process.env.PORT || 5050
const app = express()



// ✅ Create HTTP server from Express app
const server = http.createServer(app)

// ✅ Init Socket.io
const io = initSocket(server)

// ✅ Store io globally for access in controllers
global.io = io



// Database Connection
connectDB()

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))


// ── CRON JOB — run every hour to auto-release escrow ──

cron.schedule("0 * * * *", () => {
  console.log("[CRON] Running escrow release check...")
  PaymentController.runEscrowReleaseCron()
})

// ── CRON JOB — run every 6 hours for subscription auto-renewal ──
cron.schedule("0 */6 * * *", () => {
  console.log("[CRON] Running subscription renewal check...")
  renewSubscriptionsJob()
})

// ── CRON JOB — run every hour to check expired plans ──
cron.schedule("30 * * * *", () => {
  console.log("[CRON] Checking for expired plans...")
  checkExpiredPlans()
})

// Body Parser Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate Limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many auth attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply Rate Limiters
app.use("/api", apiLimiter)
app.use("/api/auth", authLimiter)

// Health Check Route
app.get("/", (req, res) => {
  res.send("Server is Running ...")
})

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/freelancer", freelancerRoutes)
app.use("/api/project", projectRoutes)
// ✅ Alias routes (plural) for frontend spec compatibility
app.use("/api/projects", projectRoutes)
// ✅ Client routes (FREE plans - no payment)
app.use("/api/client", clientRoutes)
// Payment & Wallet Routes -> 
app.use("/api/payment", paymentRoutes)
app.use("/api/wallet", walletRoutes)


// ✅ Chat REST routes
app.use("/api/chat", chatRoutes)

// ✅ Rating routes
app.use("/api/ratings", ratingRoutes)

// ✅ Subscription routes
app.use("/api/subscription", subscriptionRoutes)

// Error Handler
app.use(errorHandler)

// app.listen(PORT, () => {
//   console.log(` Server is Running on PORT ${PORT}`.bgBlue.white)
// })

// ✅ CHANGE app.listen → server.listen
server.listen(PORT, () => console.log(`Server + Socket running on port ${PORT}`.bgBlue.white))
