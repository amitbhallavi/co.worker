const splitOrigins = (value = "") =>
    value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)

const defaultAllowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://co-worker-pro.vercel.app",
    "https://coworkers.live",
    "https://www.coworkers.live",
]

export const getAllowedOrigins = () => [...new Set([
    ...defaultAllowedOrigins,
    ...splitOrigins(process.env.CLIENT_URL),
    ...splitOrigins(process.env.CLIENT_URLS),
    ...splitOrigins(process.env.CLIENT_ORIGINS),
])]

export const isOriginAllowed = (origin) => !origin || new Set(getAllowedOrigins()).has(origin)

export const corsOrigin = (origin, callback) => {
    if (isOriginAllowed(origin)) {
        callback(null, true)
        return
    }

    callback(new Error("Not allowed by CORS"))
}

export const corsOptions = {
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}
