import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import followerService from '../services/followerService';
import './FollowButton.css';

const FollowButton = ({ userId, onFollowChange }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token && userId !== user.id) {
      checkFollowStatus();
    }
  }, [userId, user, token]);

  const checkFollowStatus = async () => {
    try {
      const response = await followerService.checkFollowStatus(userId, token);
      setIsFollowing(response.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!token) {
      alert('Please login to follow users');
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        await followerService.unfollowUser(userId, token);
        setIsFollowing(false);
      } else {
        await followerService.followUser(userId, token);
        setIsFollowing(true);
      }
      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert(error.response?.data?.error || 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  // Don't show button for own profile
  if (!user || userId === user.id) {
    return null;
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`follow-button ${isFollowing ? 'following' : ''}`}
    >
      {loading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;
