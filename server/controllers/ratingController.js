import Project from "../models/projectModel.js"
import Rating from "../models/ratingModel.js"
import User from "../models/userModel.js"
import { ensure, sendError } from "../utils/http.js"

const raterSelect = "name profilePic email"

const getResolvedUserType = (user) => (
    user.userType || (user.isFreelancer ? "freelancer" : "client")
)

const getSortOption = (sort) => {
    if (sort === "highest") {
        return { rating: -1, createdAt: -1 }
    }

    if (sort === "lowest") {
        return { rating: 1, createdAt: -1 }
    }

    return { createdAt: -1 }
}

const getRatingBreakdown = () => ({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

const buildStats = (ratings) => {
    const breakdown = getRatingBreakdown()

    if (!ratings.length) {
        return {
            averageRating: 0,
            totalReviews: 0,
            verifiedReviews: 0,
            breakdown,
        }
    }

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0)
    ratings.forEach((rating) => {
        breakdown[rating.rating] += 1
    })

    return {
        averageRating: Number((totalRating / ratings.length).toFixed(1)),
        totalReviews: ratings.length,
        verifiedReviews: ratings.filter((rating) => rating.isVerified).length,
        breakdown,
    }
}

const syncUserRatingStats = async (targetUserId) => {
    const ratings = await Rating.find({ targetUser: targetUserId, isReported: false })
    const stats = buildStats(ratings)

    await User.findByIdAndUpdate(
        targetUserId,
        {
            averageRating: stats.averageRating,
            totalRatings: stats.totalReviews,
        },
        { new: true }
    )

    return stats
}

const getRatings = async (req, res) => {
    try {
        const { sort = "latest", filter = "all" } = req.query
        ensure(req.params.userId, 400, "User ID is required")

        const user = await User.findById(req.params.userId)
        ensure(user, 404, "User not found")

        const query = {
            targetUser: req.params.userId,
            isReported: false,
        }

        if (filter !== "all") {
            const parsedFilter = Number.parseInt(filter, 10)
            if (parsedFilter >= 1 && parsedFilter <= 5) {
                query.rating = parsedFilter
            }
        }

        const ratings = await Rating.find(query)
            .populate("rater", raterSelect)
            .populate("project", "title")
            .sort(getSortOption(sort))
            .lean()

        const stats = buildStats(ratings)

        res.status(200).json({
            success: true,
            ratings,
            ...stats,
        })
    } catch (error) {
        sendError(res, error)
    }
}

const addRating = async (req, res) => {
    try {
        const { targetUserId, rating, review, projectId } = req.body
        ensure(targetUserId && rating && review, 400, "Missing required fields: targetUserId, rating, review")
        ensure(req.user._id.toString() !== targetUserId.toString(), 400, "You cannot rate yourself")
        ensure(rating >= 1 && rating <= 5, 400, "Rating must be between 1 and 5")
        ensure(review.trim().length >= 20, 400, "Review must be at least 20 characters long")

        const targetUser = await User.findById(targetUserId)
        ensure(targetUser, 404, "Target user not found")

        const existingRating = await Rating.findOne({
            rater: req.user._id,
            targetUser: targetUserId,
        })

        ensure(!existingRating, 400, "You have already rated this user")

        let isVerified = false
        if (projectId) {
            const project = await Project.findById(projectId)
            if (project?.status === "completed") {
                isVerified = true
            }
        }

        const newRating = await Rating.create({
            rater: req.user._id,
            targetUser: targetUserId,
            raterType: getResolvedUserType(req.user),
            targetUserType: getResolvedUserType(targetUser),
            project: projectId || null,
            rating: Number.parseInt(rating, 10),
            review: review.trim(),
            isVerified,
        })

        const populatedRating = await newRating.populate("rater", raterSelect)
        const stats = await syncUserRatingStats(targetUserId)

        if (global.io) {
            global.io.emit("ratingCreated", {
                _id: newRating._id,
                rater: populatedRating.rater,
                targetUser: targetUserId,
                rating: newRating.rating,
                review: newRating.review,
                isVerified: newRating.isVerified,
                createdAt: newRating.createdAt,
                averageRating: stats.averageRating,
                totalReviews: stats.totalReviews,
            })
        }

        res.status(201).json({
            success: true,
            message: "Rating created successfully",
            rating: populatedRating,
            averageRating: stats.averageRating,
            totalReviews: stats.totalReviews,
        })
    } catch (error) {
        sendError(res, error)
    }
}

const updateRating = async (req, res) => {
    try {
        const { rating, review } = req.body
        ensure(req.params.ratingId, 400, "Rating ID is required")
        ensure(rating || review, 400, "At least one field (rating or review) must be provided")

        const existingRating = await Rating.findById(req.params.ratingId)
        ensure(existingRating, 404, "Rating not found")
        ensure(
            existingRating.rater.toString() === req.user._id.toString() || req.user.isAdmin,
            403,
            "You can only edit your own ratings"
        )

        if (rating) {
            ensure(rating >= 1 && rating <= 5, 400, "Rating must be between 1 and 5")
        }

        if (review) {
            ensure(review.trim().length >= 20, 400, "Review must be at least 20 characters long")
        }

        const updatedRating = await Rating.findByIdAndUpdate(
            req.params.ratingId,
            {
                rating: rating !== undefined ? Number.parseInt(rating, 10) : existingRating.rating,
                review: review ? review.trim() : existingRating.review,
            },
            { new: true }
        ).populate("rater", raterSelect)

        const stats = await syncUserRatingStats(updatedRating.targetUser)

        if (global.io) {
            global.io.emit("ratingUpdated", {
                _id: updatedRating._id,
                rater: updatedRating.rater,
                targetUser: updatedRating.targetUser,
                rating: updatedRating.rating,
                review: updatedRating.review,
                isVerified: updatedRating.isVerified,
                updatedAt: updatedRating.updatedAt,
                averageRating: stats.averageRating,
                totalReviews: stats.totalReviews,
            })
        }

        res.status(200).json({
            success: true,
            message: "Rating updated successfully",
            rating: updatedRating,
            averageRating: stats.averageRating,
            totalReviews: stats.totalReviews,
        })
    } catch (error) {
        sendError(res, error)
    }
}

const deleteRating = async (req, res) => {
    try {
        ensure(req.params.ratingId, 400, "Rating ID is required")

        const rating = await Rating.findById(req.params.ratingId)
        ensure(rating, 404, "Rating not found")
        ensure(
            rating.rater.toString() === req.user._id.toString() || req.user.isAdmin,
            403,
            "You can only delete your own ratings"
        )

        await Rating.findByIdAndDelete(req.params.ratingId)
        const stats = await syncUserRatingStats(rating.targetUser)

        if (global.io) {
            global.io.emit("ratingDeleted", {
                ratingId: req.params.ratingId,
                targetUserId: rating.targetUser,
                averageRating: stats.averageRating,
                totalReviews: stats.totalReviews,
            })
        }

        res.status(200).json({
            success: true,
            message: "Rating deleted successfully",
            averageRating: stats.averageRating,
            totalReviews: stats.totalReviews,
        })
    } catch (error) {
        sendError(res, error)
    }
}

const reportRating = async (req, res) => {
    try {
        const { reason } = req.body
        ensure(req.params.ratingId, 400, "Rating ID is required")
        ensure(reason, 400, "Report reason is required")

        const rating = await Rating.findById(req.params.ratingId)
        ensure(rating, 404, "Rating not found")
        ensure(!rating.isReported, 400, "This rating has already been reported")

        const reportedRating = await Rating.findByIdAndUpdate(
            req.params.ratingId,
            { isReported: true, reportReason: reason },
            { new: true }
        )

        res.status(200).json({
            success: true,
            message: "Rating reported successfully",
            rating: reportedRating,
        })
    } catch (error) {
        sendError(res, error)
    }
}

const getRatingSummary = async (req, res) => {
    try {
        ensure(req.params.userId, 400, "User ID is required")

        const ratings = await Rating.find({
            targetUser: req.params.userId,
            isReported: false,
        }).lean()

        res.status(200).json({
            success: true,
            ...buildStats(ratings),
        })
    } catch (error) {
        sendError(res, error)
    }
}

const ratingController = {
    getRatings,
    addRating,
    updateRating,
    deleteRating,
    reportRating,
    getRatingSummary,
}

export default ratingController
