import mongoose from "mongoose";

const freelancerSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    description: {
        type: String,
        required: true,

    },
    skills: {
        type: String,
        required: true,

    },
    category: {
        type: String,
        required: true,

    },

    experience: {
        type: Number,
        required: true,
    },


}, {
    timestamps: true

})


const Freelancer = mongoose.model("Freelancer", freelancerSchema)

export default Freelancer