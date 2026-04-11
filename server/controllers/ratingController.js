import Rating from "../models/ratingModel.js"




const getRatings = async (req, res) => {

    let freelancerId = req.params.fid

    let ratings = await Rating.find({ freelancer: freelancerId }).populate('user')

    if (!ratings) {
        res.status(404)
        throw new Error(" Rating Not Found !")

    };

    res.status(200).json(ratings)

};


const addRating = async (req, res) => {


    let userId = req.user._id


    const { rating, review } = req.body

    if (!rating || !review) {
        res.status(409)
        throw new Error(" Please fill All Details !")

    };


    const newRating = await Rating.create({
        user: userId,
        rating,
        review,

    })

    if (!newRating) {
        res.status(409)
        throw new Error(" New Rating Not Created ")

    };
    res.status(201).json(newRating)

};


const ratingController = { getRatings, addRating }


export default ratingController;
