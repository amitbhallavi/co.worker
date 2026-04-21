import { getUserFromAuthorization } from "../utils/auth.js"
import { createHttpError } from "../utils/http.js"

const forAuthUsers = async (req, res, next) => {
    try {
        req.user = await getUserFromAuthorization(req.headers.authorization || "")
        next()
    } catch (error) {
        next(createHttpError(401, "Unauthorized Access : Access Denied"))
    }
}

const forAdmin = async (req, res, next) => {
    try {
        const user = await getUserFromAuthorization(req.headers.authorization || "")
        req.user = user

        if (!user.isAdmin) {
            throw createHttpError(403, "Unauthorized Access : Admin Only")
        }

        next()
    } catch (error) {
        if (error?.statusCode === 403) {
            return next(error)
        }

        next(createHttpError(403, "Unauthorized Access : Access Denied"))
    }
}

const protect = { forAuthUsers, forAdmin }

export default protect
