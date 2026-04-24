const Rating = require('../models/Rating');

/**
 * @route   POST /api/ratings
 * @desc    Submit or update rating
 * @access  Private
 */
exports.submitRating = async (req, res) => {
  try {
    const { recipeId, rating } = req.body;
    const userId = req.user.id;

    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Validate recipeId
    if (!recipeId) {
      return res.status(400).json({
        success: false,
        message: 'Recipe ID is required'
      });
    }

    // Submit rating (creates or updates)
    const userRating = await Rating.submitRating(userId, recipeId, rating);

    // Get updated average rating
    const recipeRatings = await Rating.getRecipeRatings(recipeId);

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        userRating,
        averageRating: recipeRatings.averageRating,
        ratingCount: recipeRatings.ratingCount
      }
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting rating'
    });
  }
};

/**
 * @route   GET /api/recipes/:id/ratings
 * @desc    Get recipe ratings (average and count)
 * @access  Public
 */
exports.getRecipeRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Optional - to get user's rating

    // Get average rating and count
    const recipeRatings = await Rating.getRecipeRatings(id);

    // Get user's rating if authenticated
    let userRating = null;
    if (userId) {
      userRating = await Rating.getUserRating(userId, id);
    }

    res.status(200).json({
      success: true,
      data: {
        averageRating: recipeRatings.averageRating,
        ratingCount: recipeRatings.ratingCount,
        userRating: userRating ? userRating.rating : null
      }
    });
  } catch (error) {
    console.error('Error fetching recipe ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ratings'
    });
  }
};

/**
 * @route   DELETE /api/ratings/:recipeId
 * @desc    Delete user's rating
 * @access  Private
 */
exports.deleteRating = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const deleted = await Rating.deleteRating(userId, recipeId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Get updated ratings
    const recipeRatings = await Rating.getRecipeRatings(recipeId);

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully',
      data: recipeRatings
    });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting rating'
    });
  }
};
