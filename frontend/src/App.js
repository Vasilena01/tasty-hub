import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './redux/slices/authSlice';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BrowseRecipesPage from './pages/BrowseRecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import MyRecipesPage from './pages/MyRecipesPage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import MealPlannerPage from './pages/MealPlannerPage';
import ShoppingListPage from './pages/ShoppingListPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function Navigation() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="main-nav">
      <Link to="/" className="nav-logo">Recipe Hub</Link>
      <div className="nav-links">
        <Link to="/recipes">Browse Recipes</Link>
        {isAuthenticated ? (
          <>
            <Link to="/my-recipes">My Recipes</Link>
            <Link to="/saved-recipes">Saved Recipes</Link>
            <Link to="/meal-planner">Meal Planner</Link>
            <Link to="/shopping-list">Shopping List</Link>
            <Link to="/create-recipe" className="create-nav-btn">+ Create</Link>
            <Link to="/dashboard">Dashboard</Link>
            <span className="user-name">{user?.username}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navigation />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipes" element={<BrowseRecipesPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-recipe"
              element={
                <ProtectedRoute>
                  <CreateRecipePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-recipe/:id"
              element={
                <ProtectedRoute>
                  <EditRecipePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-recipes"
              element={
                <ProtectedRoute>
                  <MyRecipesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved-recipes"
              element={
                <ProtectedRoute>
                  <SavedRecipesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-planner"
              element={
                <ProtectedRoute>
                  <MealPlannerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shopping-list"
              element={
                <ProtectedRoute>
                  <ShoppingListPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// Simple home page component
function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to Recipe Hub</h1>
        <p className="hero-tagline">Discover, share, and savor delicious recipes from around the world</p>
        <div className="home-actions">
          <Link to="/recipes" className="home-button primary">Browse Recipes</Link>
          <Link to="/register" className="home-button secondary">Get Started</Link>
        </div>
      </div>
    </div>
  );
}

export default App;
