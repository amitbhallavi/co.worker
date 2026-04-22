import API from "../api/axiosInstance"
import { buildAuthConfig, clearStoredUser, saveStoredUser } from "../api/apiHelpers"

const register = async (formData) => {
    const response = await API.post("/api/auth/register", formData)
    return saveStoredUser(response.data)
}

const login = async (formData) => {
    const response = await API.post("/api/auth/login", formData)
    return saveStoredUser(response.data)
}

const logout = () => {
    clearStoredUser()
}

const refreshProfile = async (token) => {
    const response = await API.get("/api/auth/me", buildAuthConfig(token))
    return response.data
}

const authService = {
    register,
    login,
    logout,
    refreshProfile,
}

export default authService
