import { Request, Response } from 'express';
import Rating from '../models/Rating';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiResponse } from '../types/api.types';
import { IRating } from '../types/models.types';

interface SubmitRatingRequestBody {
  recipeId: number;
  rating: number;
}

interface RatingData {
  userRating: IRating;
  averageRating: number | null;
  ratingCount: number;
}

interface RecipeRatingsData {
  averageRating: number | null;
  ratingCount: number;
  userRating: number | null;
}

/**
 * @route   POST /api/ratings
 * @desc    Submit or update rating
 * @access  Private
 */
const submitRating = async (
  req: AuthRequest,
  res: Response<ApiResponse<RatingData>>
): Promise<void> => {
  try {
    const { recipeId, rating } = req.body as SubmitRatingRequestBody;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
      return;
    }

    // Validate recipeId
    if (!recipeId) {
      res.status(400).json({
        success: false,
        message: 'Recipe ID is required'
      });
      return;
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
const getRecipeRatings = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<RecipeRatingsData>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user?.id; // Optional - to get user's rating

    // Get average rating and count
    const recipeRatings = await Rating.getRecipeRatings(parseInt(id, 10));

    // Get user's rating if authenticated
    let userRating: IRating | undefined = undefined;
    if (userId) {
      userRating = await Rating.getUserRating(userId, parseInt(id, 10));
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
const deleteRating = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { recipeId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const deleted = await Rating.deleteRating(userId, parseInt(recipeId, 10));

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
      return;
    }

    // Get updated ratings
    const recipeRatings = await Rating.getRecipeRatings(parseInt(recipeId, 10));

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

export { submitRating, getRecipeRatings, deleteRating };
