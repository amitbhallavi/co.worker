const trimTrailingSlash = (value) => value.replace(/\/+$/, "")

const getConfiguredApiUrl = () => {
    const url = import.meta.env.VITE_API_URL?.trim()
    return url ? trimTrailingSlash(url) : ""
}

const isLocalBrowser = () => {
    if (typeof window === "undefined") {
        return false
    }

    return ["localhost", "127.0.0.1", "0.0.0.0"].includes(window.location.hostname)
}

export const getApiBaseUrl = () => {
    const configuredUrl = getConfiguredApiUrl()

    if (configuredUrl) {
        return configuredUrl
    }

    if (import.meta.env.DEV || isLocalBrowser()) {
        return "http://localhost:5050"
    }

    return ""
}

export const getSocketBaseUrl = () => {
    const configuredUrl = getConfiguredApiUrl()

    if (configuredUrl) {
        return configuredUrl
    }

    if (import.meta.env.DEV || isLocalBrowser()) {
        return "http://localhost:5050"
    }

    return null
}
