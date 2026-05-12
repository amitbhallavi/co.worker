import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import "colors"
import rateLimit from "express-rate-limit"
import connectDB from "./config/dbConfig.js"
import { corsOptions } from "./config/cors.js"
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
const routeDefinitions = [
    ["/api/auth", authRoutes],
    ["/api/admin", adminRoutes],
    ["/api/freelancer", freelancerRoutes],
    ["/api/project", projectRoutes],
    ["/api/projects", projectRoutes],
    ["/api/client", clientRoutes],
    ["/api/payment", paymentRoutes],
    ["/api/wallet", walletRoutes],
    ["/api/chat", chatRoutes],
    ["/api/ratings", ratingRoutes],
    ["/api/subscription", subscriptionRoutes],
]

const scheduleJob = (expression, label, job) => {
    cron.schedule(expression, () => {
        console.log(`[CRON] ${label}`)
        job()
    })
}

const io = initSocket(server)
global.io = io

connectDB()

app.use(cors(corsOptions))


scheduleJob("0 * * * *", "Running escrow release check...", () => PaymentController.runEscrowReleaseCron())
scheduleJob("0 */6 * * *", "Running subscription renewal check...", renewSubscriptionsJob)
scheduleJob("30 * * * *", "Checking for expired plans...", checkExpiredPlans)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
})

const authMutationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "Too many auth attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
})

app.use("/api", apiLimiter)
app.use("/api/auth/login", authMutationLimiter)
app.use("/api/auth/register", authMutationLimiter)

app.get("/", (req, res) => {
    res.send("Server is Running ...")
})

app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" })
})

routeDefinitions.forEach(([path, router]) => {
    app.use(path, router)
})

app.use(errorHandler)

server.listen(PORT, () => console.log(`Server + Socket running on port ${PORT}`.bgBlue.white))
