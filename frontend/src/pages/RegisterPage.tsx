import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../redux/slices/authSlice';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  first_name: string;
  last_name: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    first_name: '',
    last_name: ''
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.username) errors.push('Username is required');
    if (!formData.email) errors.push('Email is required');
    if (!formData.password) errors.push('Password is required');
    if (!formData.passwordConfirm) errors.push('Password confirmation is required');
    if (!formData.first_name) errors.push('First name is required');
    if (!formData.last_name) errors.push('Last name is required');

    if (formData.password && formData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (formData.password && formData.passwordConfirm && formData.password !== formData.passwordConfirm) {
      errors.push('Passwords do not match');
    }

    // Basic email format
    if (formData.email && !formData.email.includes('@')) {
      errors.push('Please enter a valid email address');
    }

    return errors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    const { passwordConfirm, ...userData } = formData;
    dispatch(register(userData));
  };

  const allErrors = [...validationErrors];
  if (error) allErrors.push(error);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Create Account</h1>

        {allErrors.length > 0 && (
          <div className="error-message">
            <ul>
              {allErrors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">Confirm Password</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
