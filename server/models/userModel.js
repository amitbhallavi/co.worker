import mongoose from "mongoose";


const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please enter  Name "],
    },

    email: {
        type: String,
        unique: true,
        required: [true, "Please enter  Email "],
    },
    phone: {
        type: Number,
        unique: true,
        required: [true, "Please enter  Number "],
    },

    profilePic: {
        type: String,
    },


    password: {
        type: String,
        required: [true, " Please enter  Password "]
    },

    isAdmin: {
        type: Boolean,
        default: false,
        required: true,

    },

    isFreelancer: {

        type: Boolean,
        default: false,
        required: true,

    },

    credits: {

        type: Number,
        default: 5,
    },
     location: {

        type: String,
        
    },


}, { timestamps: true })


const User = mongoose.model("User", userSchema)


export default User 