import express, { Router } from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getFollowCounts
} from '../controllers/followerController';
import { verifyToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.post('/:userId/follow', verifyToken, followUser);
router.delete('/:userId/follow', verifyToken, unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.get('/:userId/check', verifyToken, checkFollowStatus);
router.get('/:userId/counts', getFollowCounts);

export default router;
