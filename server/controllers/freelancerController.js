import Bid from "../models/bidModel.js";
import Freelancer from "../models/freelancerModel.js";
import Project from "../models/projectModel.js";
import User from "../models/userModel.js"
import PreviousWork from "../models/previousWorks.js";

const becomeFreelancer = async (req, res) => {

    let userId = req.user._id

    const { description, skills, category, experience, } = req.body

    if (!description || !skills || !category || !experience) {

        res.status(409)
        throw new Error(" Please Fill All Details")
    }

    let freelancer = new Freelancer({

        user: userId,
        description,
        skills,
        category,
        experience

    })

    await freelancer.save()


    const updatedUser = await User.findByIdAndUpdate(req.user._id, { isFreelancer: true }, { new: true })

    if (!updatedUser) {
        res.status(409)
        throw new Error(" User Cannot be Updated as Freelancer")
    }
    res.status(201).json({
        user: updatedUser,
        freelancer: freelancer
    })

};


// Apply Projects -> 


const applyForProject = async (req, res) => {


    let projectId = req.params.pid
    let userId = req.user._id


    const { amount } = req.body

    if (!amount) {

        res.status(409)
        throw new Error(" Please Enter Your Bid Amount")

    };




    //  check if project exists 

    const project = await Project.findById(projectId)

    if (!project) {
        res.status(404)
        throw new Error(" Project Not Found")

    };

    // check if user exists 

    const user = await User.findById(userId)

    if (!user) {
        res.status(404)
        throw new Error(" User Not Found")

    };


    const freelancer = await Freelancer.findOne({ user: user._id })


    if (!freelancer) {
        res.status(409)
        throw new Error(" Freelancer Not Fount ")

    }

    // Check if bidder has Credits 

    if (user.credits <= 0) {
        res.status(409)
        throw new Error(" Not Enough Credits ! ")

    };


    // Create Bid

    const bid = new Bid({
        freelancer: freelancer._id,
        project: projectId,
        amount: amount
    })

    await bid.save()
    await bid.populate('freelancer')
    await bid.populate('project')


    // Update Credits 

    await User.findByIdAndUpdate(userId, { credits: user.credits - 1 }, { new: true })


    res.status(201).json(bid)

}


// Submit Project -> 

const submitProject = async (req, res) => {

    const projectId = req.params.pid

    const workProgress = await Project.findByIdAndUpdate(projectId, { status: "in-progress" }, { new: true }).populate('user').populate('freelancer')

    if (!workProgress) {

        res.status(409)
        throw new Error(" Work Progress Not Exist")

    }

    res.status(200).json(workProgress)

};


// Previous Projects ->

const getMypreviousProject = async (req, res) => {

    const userId = req.user._id


    // chech if freelancer

    const freelancer = await Freelancer.findOne({ user: userId })

    if (!freelancer) {
        res.status(404)
        throw new Error(" Freelancer Not Found")

    };


    // Get Previous Project

    const previousProject = await Project.find({ freelancer: freelancer._id }).populate('freelancer')

    if (!previousProject) {
        res.status(404)
        throw new Error(" Previous Project Not Found !")

    };


    res.status(200).json(previousProject)

}

// Get My Work ! -> 

const getMyWork = async (req, res) => {
    let userId = req.user._id

    // check Freelancer 
    let freelancer = await Freelancer.findOne({ user: userId })

    if (!freelancer) {
        res.status(404)
        throw new Error(" Freelancer Not Found ")
    }

    let myWorks = await PreviousWork.find({ freelancer: freelancer._id })

    if (!myWorks) {
        res.status("404")
        throw new Error(" No Previous Work Found ")

    }

    res.status(200).json(myWorks)



};


// Add My Work -> 

const addMyWork = async (req, res) => {

    let userId = req.user._id



    const { projectLink, projectDescription , projectImage } = req.body


    // check Freelancer 
    let freelancer = await Freelancer.findOne({ user: userId })


    if (!freelancer) {
        res.status(404)
        throw new Error(" Freelancer Not Found ")
    }
    //   console.log(userId)    

    const work = await PreviousWork.create({
        freelancer: freelancer._id,
        projectLink,
        projectDescription,
        projectImage

    })

    await work.populate("freelancer")

    if (!work) {
        res.status(401)
        throw new Error(" Work Not Added ")
    }

    res.status(201).json(work)



};

// Update My Work ! -> 

const updateMyWork = async (req, res) => {
    let userId = req.user._id
    let workId = req.params.wid

    // check Freelancer 
    let freelancer = await Freelancer.findOne({ user: userId })


    if (!freelancer) {
        res.status(404)
        throw new Error(" Freelancer Not Found ")
    }


    // Update work

    const updateWork = await PreviousWork.findByIdAndUpdate(workId, req.body, { new: true })

    if (!updateWork) {
        res.status(409)
        throw new Error(" Work Not Updated ")

    }


    res.status(200).json(updateWork)
};





// Remove my Worked 

const removeMyWork = async (req, res) => {

    let userId = req.user._id
    let workId = req.params.wid

    // check Freelancer 
    let freelancer = await Freelancer.findOne({ user: userId })


    if (!freelancer) {
        res.status(404)
        throw new Error(" Freelancer Not Found ")
    }

    await PreviousWork.findByIdAndDelete(workId)

    res.status(200).json({
        success: true,
        workId: workId,
        message: " Work Removed !"
    })

};

// Updated Your Profiles -> 

const updateProfile = async (req, res) => {


    let userId = req.user._id

    // update profile

    const updateProfile = await User.findByIdAndUpdate(userId, req.body, { new: true }).select("-password")

    if (!updateProfile) {
        req.status(409)
        throw new Error(" Profile Not Updated ! ")

    }
    res.status(200).json(updateProfile)

};


// GET ALL FREELANCERS HERE -> 

const getFreelancers = async (req, res) => {

    const freelancers = await Freelancer.find().populate('user' , "-password")




    if (!freelancers) {
        res.status(404)
        throw new Error("Freelancer Not Found ")
    }

    res.status(200).json(freelancers)
};


// GET SINGLE FREELANCER ->

const getFreelancer = async (req, res) => {

    const freelancer = await Freelancer.findOne({user : req.params.uid}).populate('user' , "-password")
   
   const previousWorks = await PreviousWork.find({freelancer: freelancer._id})
          

    if (!freelancer || !previousWorks ) {
        res.status(404)
        throw new Error("Freelancer Not Found ")
    }

    res.status(200).json({
        profile : freelancer,
        previousWorks : previousWorks
       
    })
};





const FreelancerController = { becomeFreelancer, applyForProject, submitProject, getMypreviousProject, getMyWork, addMyWork, updateProfile, updateMyWork, removeMyWork, getFreelancers, getFreelancer }


export default FreelancerController;
