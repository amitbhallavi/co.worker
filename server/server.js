import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import "colors"
import rateLimit from "express-rate-limit"
import connectDB from "./config/dbConfig.js"
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
const server = http.createServer(app)

const io = initSocket(server)
global.io = io

connectDB()

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
)

cron.schedule("0 * * * *", () => {
    console.log("[CRON] Running escrow release check...")
    PaymentController.runEscrowReleaseCron()
})

cron.schedule("0 */6 * * *", () => {
    console.log("[CRON] Running subscription renewal check...")
    renewSubscriptionsJob()
})

cron.schedule("30 * * * *", () => {
    console.log("[CRON] Checking for expired plans...")
    checkExpiredPlans()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

app.use("/api", apiLimiter)
app.use("/api/auth", authLimiter)

app.get("/", (req, res) => {
    res.send("Server is Running ...")
})

app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" })
})

app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/freelancer", freelancerRoutes)
app.use("/api/project", projectRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/client", clientRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/wallet", walletRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/ratings", ratingRoutes)
app.use("/api/subscription", subscriptionRoutes)

app.use(errorHandler)

server.listen(PORT, () => console.log(`Server + Socket running on port ${PORT}`.bgBlue.white))