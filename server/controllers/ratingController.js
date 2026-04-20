import Rating from "../models/ratingModel.js"
import User from "../models/userModel.js"
import Project from "../models/projectModel.js"

// ✅ GET /api/ratings/:userId
// Fetch all ratings for a user with average calculation and breakdown
const getRatings = async (req, res) => {
    try {
        const { userId } = req.params
        const { sort = "latest", filter = "all" } = req.query

        if (!userId) {
            res.status(400)
            throw new Error("User ID is required")
        }

        // Verify user exists
        const user = await User.findById(userId)
        if (!user) {
            res.status(404)
            throw new Error("User not found")
        }

        // Build query
        let query = { targetUser: userId, isReported: false }

        if (filter !== "all") {
            const filterRating = parseInt(filter)
            if (filterRating >= 1 && filterRating <= 5) {
                query.rating = filterRating
            }
        }

        // Determine sort
        let sortOption = { createdAt: -1 } // latest
        if (sort === "highest") {
            sortOption = { rating: -1, createdAt: -1 }
        } else if (sort === "lowest") {
            sortOption = { rating: 1, createdAt: -1 }
        }

        // Fetch ratings
        const ratings = await Rating.find(query)
            .populate("rater", "firstName lastName avatar email")
            .populate("project", "title")
            .sort(sortOption)
            .lean()

        // Calculate statistics
        let averageRating = 0
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

        if (ratings.length > 0) {
            const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0)
            averageRating = (totalRating / ratings.length).toFixed(1)

            // Count breakdown
            ratings.forEach(r => {
                breakdown[r.rating]++
            })
        }

        const verifiedCount = ratings.filter(r => r.isVerified).length

        res.status(200).json({
            success: true,
            ratings,
            averageRating: parseFloat(averageRating),
            totalReviews: ratings.length,
            verifiedReviews: verifiedCount,
            breakdown,
        })
    } catch (error) {
        res.status(res.statusCode || 500).json({
            success: false,
            error: error.message,
        })
    }
}


// ✅ POST /api/ratings
// Create a new rating (open system - any user can rate any user)
const addRating = async (req, res) => {
    try {
        const userId = req.user._id
        const userType = req.user.userType // "client" or "freelancer"
        const { targetUserId, rating, review, projectId } = req.body

        // Validation: Check all required fields
        if (!targetUserId || !rating || !review) {
            res.status(400)
            throw new Error("Missing required fields: targetUserId, rating, review")
        }

        // Validation: Self-rating check
        if (userId.toString() === targetUserId.toString()) {
            res.status(400)
            throw new Error("You cannot rate yourself")
        }

        // Validation: Rating range
        if (rating < 1 || rating > 5) {
            res.status(400)
            throw new Error("Rating must be between 1 and 5")
        }

        // Validation: Review text length
        if (review.trim().length < 20) {
            res.status(400)
            throw new Error("Review must be at least 20 characters long")
        }

        // Get target user info
        const targetUser = await User.findById(targetUserId)
        if (!targetUser) {
            res.status(404)
            throw new Error("Target user not found")
        }

        // Check for duplicate rating (one per rater per target user)
        const existingRating = await Rating.findOne({
            rater: userId,
            targetUser: targetUserId,
        })

        if (existingRating) {
            res.status(400)
            throw new Error("You have already rated this user")
        }

        // Determine if this is a verified rating (project-based)
        let isVerified = false
        if (projectId) {
            const project = await Project.findById(projectId)
            if (project && project.status === "completed") {
                isVerified = true
            }
        }

        // Create new rating
        const newRating = await Rating.create({
            rater: userId,
            targetUser: targetUserId,
            raterType: userType,
            targetUserType: targetUser.userType,
            project: projectId || null,
            rating: parseInt(rating),
            review: review.trim(),
            isVerified,
        })

        // Populate rater and project details
        const populatedRating = await newRating.populate("rater", "firstName lastName avatar email")

        // Calculate updated stats for target user
        const allRatings = await Rating.find({ targetUser: targetUserId, isReported: false })
        const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0)
        const avgRating = (totalRating / allRatings.length).toFixed(1)

        // Update user model with ratings stats
        await User.findByIdAndUpdate(
            targetUserId,
            {
                averageRating: parseFloat(avgRating),
                totalRatings: allRatings.length,
            },
            { new: true }
        )

        // Emit Socket event for real-time update
        if (global.io) {
            global.io.emit("ratingCreated", {
                _id: newRating._id,
                rater: populatedRating.rater,
                targetUser: targetUserId,
                rating: newRating.rating,
                review: newRating.review,
                isVerified: newRating.isVerified,
                createdAt: newRating.createdAt,
                averageRating: parseFloat(avgRating),
                totalReviews: allRatings.length,
            })
        }

        res.status(201).json({
            success: true,
            message: "Rating created successfully",
            rating: populatedRating,
            averageRating: parseFloat(avgRating),
            totalReviews: allRatings.length,
        })
    } catch (error) {
        res.status(res.statusCode || 500).json({
            success: false,
            error: error.message,
        })
    }
}


// ✅ PUT /api/ratings/:ratingId
// Update an existing rating (only by original rater or admin)
const updateRating = async (req, res) => {
    try {
        const userId = req.user._id
        const { ratingId } = req.params
        const { rating, review } = req.body

        if (!ratingId) {
            res.status(400)
            throw new Error("Rating ID is required")
        }

        if (!rating && !review) {
            res.status(400)
            throw new Error("At least one field (rating or review) must be provided")
        }

        // Find the rating
        const existingRating = await Rating.findById(ratingId)
        if (!existingRating) {
            res.status(404)
            throw new Error("Rating not found")
        }

        // Validate: Only the original rater can edit (or admin)
        if (existingRating.rater.toString() !== userId.toString() && !req.user.isAdmin) {
            res.status(403)
            throw new Error("You can only edit your own ratings")
        }

        // Validation: Rating range
        if (rating && (rating < 1 || rating > 5)) {
            res.status(400)
            throw new Error("Rating must be between 1 and 5")
        }

        // Validation: Review text length
        if (review && review.trim().length < 20) {
            res.status(400)
            throw new Error("Review must be at least 20 characters long")
        }

        // Update rating
        const updatedRating = await Rating.findByIdAndUpdate(
            ratingId,
            {
                rating: rating !== undefined ? parseInt(rating) : existingRating.rating,
                review: review ? review.trim() : existingRating.review,
            },
            { new: true }
        ).populate("rater", "firstName lastName avatar email")

        // Recalculate target user average rating
        const allRatings = await Rating.find({
            targetUser: updatedRating.targetUser,
            isReported: false,
        })
        const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0)
        const avgRating = (totalRating / allRatings.length).toFixed(1)

        await User.findByIdAndUpdate(
            updatedRating.targetUser,
            {
                averageRating: parseFloat(avgRating),
                totalRatings: allRatings.length,
            },
            { new: true }
        )

        // Emit Socket event for real-time update
        if (global.io) {
            global.io.emit("ratingUpdated", {
                _id: updatedRating._id,
                rater: updatedRating.rater,
                targetUser: updatedRating.targetUser,
                rating: updatedRating.rating,
                review: updatedRating.review,
                isVerified: updatedRating.isVerified,
                updatedAt: updatedRating.updatedAt,
                averageRating: parseFloat(avgRating),
                totalReviews: allRatings.length,
            })
        }

        res.status(200).json({
            success: true,
            message: "Rating updated successfully",
            rating: updatedRating,
            averageRating: parseFloat(avgRating),
            totalReviews: allRatings.length,
        })
    } catch (error) {
        res.status(res.statusCode || 500).json({
            success: false,
            error: error.message,
        })
    }
}

// ✅ DELETE /api/ratings/:ratingId
// Delete a rating (only by original rater or admin)
const deleteRating = async (req, res) => {
    try {
        const userId = req.user._id
        const { ratingId } = req.params

        if (!ratingId) {
            res.status(400)
            throw new Error("Rating ID is required")
        }

        // Find the rating
        const rating = await Rating.findById(ratingId)
        if (!rating) {
            res.status(404)
            throw new Error("Rating not found")
        }

        // Validate: Only the original rater can delete (or admin)
        if (rating.rater.toString() !== userId.toString() && !req.user.isAdmin) {
            res.status(403)
            throw new Error("You can only delete your own ratings")
        }

        const targetUserId = rating.targetUser

        // Delete the rating
        await Rating.findByIdAndDelete(ratingId)

        // Recalculate target user average rating
        const remainingRatings = await Rating.find({
            targetUser: targetUserId,
            isReported: false,
        })
        let avgRating = 0
        if (remainingRatings.length > 0) {
            const totalRating = remainingRatings.reduce((sum, r) => sum + r.rating, 0)
            avgRating = (totalRating / remainingRatings.length).toFixed(1)
        }

        await User.findByIdAndUpdate(
            targetUserId,
            {
                averageRating: parseFloat(avgRating),
                totalRatings: remainingRatings.length,
            },
            { new: true }
        )

        // Emit Socket event for real-time update
        if (global.io) {
            global.io.emit("ratingDeleted", {
                ratingId,
                targetUserId,
                averageRating: parseFloat(avgRating),
                totalReviews: remainingRatings.length,
            })
        }

        res.status(200).json({
            success: true,
            message: "Rating deleted successfully",
            averageRating: parseFloat(avgRating),
            totalReviews: remainingRatings.length,
        })
    } catch (error) {
        res.status(res.statusCode || 500).json({
            success: false,
            error: error.message,
        })
    }
}

// ✅ POST /api/ratings/:ratingId/report
// Report a review as inappropriate
const reportRating = async (req, res) => {
    try {
        const { ratingId } = req.params
        const { reason } = req.body

        if (!ratingId) {
            res.status(400)
            throw new Error("Rating ID is required")
        }

        if (!reason) {
            res.status(400)
            throw new Error("Report reason is required")
        }

        const rating = await Rating.findById(ratingId)
        if (!rating) {
            res.status(404)
            throw new Error("Rating not found")
        }

        if (rating.isReported) {
            res.status(400)
            throw new Error("This rating has already been reported")
        }

        // Mark as reported
        const reportedRating = await Rating.findByIdAndUpdate(
            ratingId,
            { isReported: true, reportReason: reason },
            { new: true }
        )

        res.status(200).json({
            success: true,
            message: "Rating reported successfully",
            rating: reportedRating,
        })
    } catch (error) {
        res.status(res.statusCode || 500).json({
            success: false,
            error: error.message,
        })
    }
}

// ✅ GET /api/ratings/user/:userId/summary
// Get quick rating summary (no detailed reviews)
const getRatingSummary = async (req, res) => {
    try {
        const { userId } = req.params

        if (!userId) {
            res.status(400)
            throw new Error("User ID is required")
        }

        const ratings = await Rating.find({ targetUser: userId, isReported: false }).lean()

        let averageRating = 0
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

        if (ratings.length > 0) {
            const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0)
            averageRating = (totalRating / ratings.length).toFixed(1)

            ratings.forEach(r => {
                breakdown[r.rating]++
            })
        }

        const verifiedCount = ratings.filter(r => r.isVerified).length

        res.status(200).json({
            success: true,
            averageRating: parseFloat(averageRating),
            totalReviews: ratings.length,
            verifiedReviews: verifiedCount,
            breakdown,
        })
    } catch (error) {
        res.status(res.statusCode || 500).json({
            success: false,
            error: error.message,
        })
    }
}

export default {
    getRatings,
    addRating,
    updateRating,
    deleteRating,
    reportRating,
    getRatingSummary,
}
