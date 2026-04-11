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
import errorHandler from "./middlewere/errorHandler.js"

const PORT = process.env.PORT || 5050
const app = express()

// Database Connection
connectDB()

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))

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

// Error Handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(` Server is Running on PORT ${PORT}`.bgBlue.white)
})