import jwt from "jsonwebtoken"
import User from "../models/userModel.js"
import { createHttpError } from "./http.js"

export const createAuthToken = (id) => (
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "50d" })
)

export const getBearerToken = (authorizationHeader = "") => {
    if (!authorizationHeader.startsWith("Bearer ")) {
        throw createHttpError(401, "Unauthorized Access : Access Denied")
    }

    return authorizationHeader.split(" ")[1]
}

export const getUserFromAuthorization = async (authorizationHeader) => {
    const token = getBearerToken(authorizationHeader)

    let decodedToken
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
        throw createHttpError(401, "Unauthorized Access : Access Denied")
    }

    const user = await User.findById(decodedToken.id).select("-password")

    if (!user) {
        throw createHttpError(401, "Unauthorized Access : Access Denied")
    }

    return user
}
