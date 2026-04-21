export const createHttpError = (statusCode, message, details) => {
    const error = new Error(message)
    error.statusCode = statusCode

    if (details !== undefined) {
        error.details = details
    }

    return error
}

export const ensure = (condition, statusCode, message, details) => {
    if (!condition) {
        throw createHttpError(statusCode, message, details)
    }
}

export const getStatusCode = (res, error, fallback = 500) => {
    if (error?.statusCode) {
        return error.statusCode
    }

    if (res.statusCode >= 400) {
        return res.statusCode
    }

    return fallback
}

export const sendError = (res, error, fallback = 500, extra = {}) => {
    res.status(getStatusCode(res, error, fallback)).json({
        success: false,
        error: error.message,
        ...extra,
    })
}
