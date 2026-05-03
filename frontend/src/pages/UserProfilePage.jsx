import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import followerService from '../services/followerService';
import recipeService from '../services/recipeService';
import userService from '../services/userService';
import FollowButton from '../components/FollowButton';
import RecipeGrid from '../components/recipes/RecipeGrid';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [profileUser, setProfileUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [counts, setCounts] = useState({ followers_count: 0, following_count: 0 });
  const [activeTab, setActiveTab] = useState('recipes'); // recipes, followers, following
  const [loading, setLoading] = useState(true);
  const [recipesLoading, setRecipesLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchFollowCounts();
    fetchRecipes();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await userService.getUserById(userId);
      setProfileUser(response.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowCounts = async () => {
    try {
      const response = await followerService.getFollowCounts(userId);
      setCounts(response.counts);
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await followerService.getFollowers(userId);
      setFollowers(response.followers);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await followerService.getFollowing(userId);
      setFollowing(response.following);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const fetchRecipes = async () => {
    try {
      setRecipesLoading(true);
      const response = await recipeService.getRecipesByUserId(userId);
      setRecipes(response.recipes || []);
    } catch (error) {
      console.error('Error fetching user recipes:', error);
    } finally {
      setRecipesLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'followers' && followers.length === 0) {
      fetchFollowers();
    } else if (tab === 'following' && following.length === 0) {
      fetchFollowing();
    }
  };

  const handleFollowChange = () => {
    fetchFollowCounts();
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-picture">
            {profileUser?.profile_picture_url ? (
              <img src={profileUser.profile_picture_url} alt={profileUser.username} />
            ) : (
              <div className="profile-picture-placeholder">
                {profileUser?.first_name?.[0]}{profileUser?.last_name?.[0]}
              </div>
            )}
          </div>
          <div className="profile-details">
            <h1>{profileUser?.first_name} {profileUser?.last_name}</h1>
            <p className="username">@{profileUser?.username}</p>

            <div className="profile-stats">
              <div className="stat">
                <strong>{counts.followers_count}</strong>
                <span>Followers</span>
              </div>
              <div className="stat">
                <strong>{counts.following_count}</strong>
                <span>Following</span>
              </div>
            </div>

            {profileUser && (
              <FollowButton
                userId={parseInt(userId)}
                onFollowChange={handleFollowChange}
              />
            )}
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === 'recipes' ? 'active' : ''}`}
          onClick={() => handleTabChange('recipes')}
        >
          Recipes
        </button>
        <button
          className={`tab ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => handleTabChange('followers')}
        >
          Followers
        </button>
        <button
          className={`tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => handleTabChange('following')}
        >
          Following
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'recipes' && (
          <div className="recipes-tab">
            <RecipeGrid
              recipes={recipes}
              loading={recipesLoading}
              emptyMessage="No recipes yet"
              showSaveButton={true}
            />
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="followers-tab">
            {followers.length === 0 ? (
              <p>No followers yet</p>
            ) : (
              <div className="user-list">
                {followers.map((follower) => (
                  <div key={follower.follower_user_id} className="user-card">
                    <div className="user-avatar">
                      {follower.profile_picture_url ? (
                        <img src={follower.profile_picture_url} alt={follower.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {follower.first_name?.[0]}{follower.last_name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="user-info">
                      <h3>{follower.first_name} {follower.last_name}</h3>
                      <p>@{follower.username}</p>
                      <span className="recipe-count">{follower.recipe_count} recipes</span>
                    </div>
                    <FollowButton userId={follower.follower_user_id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="following-tab">
            {following.length === 0 ? (
              <p>Not following anyone yet</p>
            ) : (
              <div className="user-list">
                {following.map((followedUser) => (
                  <div key={followedUser.followed_user_id} className="user-card">
                    <div className="user-avatar">
                      {followedUser.profile_picture_url ? (
                        <img src={followedUser.profile_picture_url} alt={followedUser.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {followedUser.first_name?.[0]}{followedUser.last_name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="user-info">
                      <h3>{followedUser.first_name} {followedUser.last_name}</h3>
                      <p>@{followedUser.username}</p>
                      <span className="recipe-count">{followedUser.recipe_count} recipes</span>
                    </div>
                    <FollowButton userId={followedUser.followed_user_id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
