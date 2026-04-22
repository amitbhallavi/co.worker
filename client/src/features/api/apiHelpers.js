const USER_STORAGE_KEY = "user"

export const getStoredUser = () => {
    if (typeof window === "undefined") {
        return null
    }

    const rawUser = window.localStorage.getItem(USER_STORAGE_KEY)

    if (!rawUser) {
        return null
    }

    try {
        return JSON.parse(rawUser)
    } catch {
        window.localStorage.removeItem(USER_STORAGE_KEY)
        return null
    }
}

export const saveStoredUser = (user) => {
    if (typeof window !== "undefined") {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    }

    return user
}

export const clearStoredUser = () => {
    if (typeof window !== "undefined") {
        window.localStorage.removeItem(USER_STORAGE_KEY)
    }
}

export const buildAuthConfig = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
})

export const getAuthToken = (thunkAPI) => thunkAPI.getState().auth.user?.token

export const getApiErrorMessage = (error, fallback = "Something went wrong") => (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
)
