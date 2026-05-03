import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import FollowButton from '../components/FollowButton';
import './DiscoverUsersPage.css';

const DiscoverUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="discover-users-page">
      <h1>Discover Users</h1>
      <div className="users-grid">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <Link to={`/user/${user.id}`} className="user-link">
              <div className="user-avatar">
                {user.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt={user.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                )}
              </div>
              <h3>{user.first_name} {user.last_name}</h3>
              <p className="username">@{user.username}</p>
              <div className="user-stats">
                <span>{user.recipe_count} recipes</span>
                <span>{user.followers_count} followers</span>
              </div>
            </Link>
            <FollowButton userId={user.id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoverUsersPage;
