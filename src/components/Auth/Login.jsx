import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../Layout/Footer';
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
    'https://thumbs.dreamstime.com/b/african-high-school-children-teacher-classroom-lesson-cape-town-south-africa-december-african-high-school-children-135349659.jpg',
    'https://media.istockphoto.com/id/1440160796/photo/two-college-students-reading-a-textbook-during-computer-class.jpg?s=612x612&w=0&k=20&c=_gnYPqDC1Y4mJXRerGkXdpUh7UF2dtvmdXd00MT5CqM=',
    'https://www.shutterstock.com/image-photo/young-graduates-standing-front-university-600nw-172074950.jpg',
    'https://c8.alamy.com/comp/2BPG5T5/personnel-manager-and-young-job-applicant-shaking-hands-at-modern-company-office-2BPG5T5.jpg',
    'https://i0.wp.com/technologysalon.org/wp-content/uploads/2018/06/south-africa-youth-employment.png?resize=600%2C380'
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
