
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const forAuthUsers = async (req, res, next) => {
    try {
        let token = req.headers.authorization.split(" ")[1];
        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user = await User.findById(decoded.id).select("-password");
        req.user = user;
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Unauthorized Access : Access Denied");
    }
};

const forAdmin = async (req, res, next) => {
    try {
        let token = req.headers.authorization.split(" ")[1];
        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user = await User.findById(decoded.id).select("-password");
        req.user = user;

        if (user.isAdmin) {
            next();
        } else {
            res.status(403);
            throw new Error("Unauthorized Access : Admin Only");
        }
    } catch (error) {
        res.status(403);
        throw new Error("Unauthorized Access : Access Denied");
    }
};

const protect = { forAuthUsers, forAdmin };

export default protect;