import axios from "axios"
import { getStoredUser } from "./apiHelpers"
import { getApiBaseUrl } from "./apiConfig"

const API = axios.create({
    baseURL: getApiBaseUrl(),
})

API.interceptors.request.use((config) => {
    const user = getStoredUser()

    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`
    }

    return config
})

export default API
