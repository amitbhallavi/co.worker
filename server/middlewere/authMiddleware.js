
import jwt, { decode } from "jsonwebtoken";
import User from "../models/userModel.js";

const forAuthUsers = async (req, res, next) => {

    try {
        // Get Token From Headers 
        let token = req.headers.authorization.split(" ")[1];

        let decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find Users By ID
        let user = await User.findById(decoded.id).select("-password");


        // add User Into Request Object

        req.user = user;

        next()


    } catch (error) {

        res.status(400)
        throw new Error("Unauthorized Access : Access Denied")

    }


} ;


const forAdmin = async (req, res, next) => {

    try {
        // Get Token From Headers 
        let token = req.headers.authorization.split(" ")[1];

        let decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find Users By ID
        let user = await User.findById(decoded.id).select("-password");


        // add User Into Request Object

        req.user = user;

        // check if User is Admin 

        if (user.isAdmin) {
            next()

        } else {

            res.status(400)
            throw new Error(" Unauthorized Access : Admin Only ")
        }



    } catch (error) {

        res.status(400)
        throw new Error("Unauthorized Access : Access Denied")

    }


} ;


const protect = { forAuthUsers, forAdmin } ;


export default protect;