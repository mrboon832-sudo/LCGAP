import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../Layout/Footer';
import featureFlags from '../../config/featureFlags';
import '../../styles/base.css';
import '../../styles/forms.css';
import '../../styles/auth-background.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const navigate = useNavigate();

  const backgroundImages = [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200'
  ];

  // Clear any previous errors when component mounts
  useEffect(() => {
    setError('');
    console.log('Login page loaded');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Attempting login for:', email);

    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      console.log('✅ Login successful!');
      console.log('Email verified:', userCredential.user.emailVerified);
      
      // Check email verification (unless bypassed)
      if (!featureFlags.bypassEmailVerification && !userCredential.user.emailVerified) {
        console.log('⚠️ Email not verified, redirecting to verification page');
        setError('Please verify your email address before logging in. Check your inbox for the verification link.');
        setLoading(false);
        // Optionally redirect to verification page
        navigate('/verify-email');
        return;
      }
      
      console.log('✅ Navigating to dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email. Please sign up first.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Contact support.');
          break;
        case 'auth/invalid-credential':
          setError('Invalid email or password. Make sure you entered the correct credentials. If you just signed up, make sure the account was created successfully.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please wait a few minutes and try again.');
          break;
        default:
          setError(`Login failed: ${err.message || 'Please try again.'}`);
      }
      setLoading(false);
    }
  };

  return (
    <>
      {/* Animated Background */}
      <div className="auth-background">
        {backgroundImages.map((img, index) => (
          <div
            key={index}
            className="auth-background-image"
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
      </div>

      {/* Login Form */}
      <div className="auth-container">
        <div className="container-narrow">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title text-center">
                {isAdminLogin ? 'Admin Login' : 'Login to LCGAP'}
              </h2>
            </div>

            {/* Admin Toggle */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: 'var(--spacing-md)',
              gap: 'var(--spacing-sm)'
            }}>
              <button
                type="button"
                className={`btn ${!isAdminLogin ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setIsAdminLogin(false)}
                style={{ padding: '8px 16px' }}
              >
                User Login
              </button>
              <button
                type="button"
                className={`btn ${isAdminLogin ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setIsAdminLogin(true)}
                style={{ padding: '8px 16px' }}
              >
                Admin Login
              </button>
            </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email" className="form-label form-label-required">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label form-label-required">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
              width: '100%',
              backgroundColor: isAdminLogin ? '#dc2626' : undefined,
              borderColor: isAdminLogin ? '#dc2626' : undefined
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : isAdminLogin ? '🔐 Admin Login' : 'Login'}
          </button>
        </form>

        {isAdminLogin && (
          <div className="alert alert-warning" style={{ marginTop: 'var(--spacing-md)' }}>
            <strong>⚠️ Admin Login</strong>
            <p style={{ marginTop: 'var(--spacing-xs)', fontSize: '0.875rem' }}>
              Only authorized administrators can access the admin panel. Unauthorized access attempts are logged.
            </p>
          </div>
        )}

        <div className="text-center mt-lg">
          <p className="text-muted">
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
              Sign up here
            </Link>
          </p>
        </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
