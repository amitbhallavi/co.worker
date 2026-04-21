import API from "../api/axiosInstance"

const register = async (formData) => {
    const response = await API.post("/api/auth/register", formData)
    localStorage.setItem("user", JSON.stringify(response.data))
    return response.data
}

const login = async (formData) => {
    const response = await API.post("/api/auth/login", formData)
    localStorage.setItem("user", JSON.stringify(response.data))
    return response.data
}

const authService = { register, login }

export default authService