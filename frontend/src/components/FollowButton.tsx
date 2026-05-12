import React, { useState, useEffect, MouseEvent } from 'react';
import { useAppSelector } from '../redux/hooks';
import followerService from '../services/followerService';
import './FollowButton.css';

interface FollowButtonProps {
  userId: number;
  onFollowChange?: () => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId, onFollowChange }) => {
  const { user, token } = useAppSelector((state) => state.auth);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user && token && userId !== user.id) {
      checkFollowStatus();
    }
  }, [userId, user, token]);

  const checkFollowStatus = async (): Promise<void> => {
    try {
      const response = await followerService.checkFollowStatus(userId, token!);
      setIsFollowing(response.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();

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
    } catch (error: any) {
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
