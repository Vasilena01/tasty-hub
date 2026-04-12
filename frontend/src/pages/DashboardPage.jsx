import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>Welcome, {user?.first_name || user?.username}!</h1>
        <p>You are now logged in to Recipe Hub.</p>

        <div className="dashboard-info">
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
        </div>

        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
