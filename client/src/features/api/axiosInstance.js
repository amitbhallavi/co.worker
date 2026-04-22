import axios from "axios"
import { getStoredUser } from "./apiHelpers"

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5050",
})

API.interceptors.request.use((config) => {
    const user = getStoredUser()

    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`
    }

    return config
})

export default API
