import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../../services/firebase';
import { createUserProfile, createCompany } from '../../services/api';
import featureFlags from '../../config/featureFlags';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../Layout/Footer';
import '../../styles/base.css';
import '../../styles/forms.css';
import '../../styles/auth-background.css';

const Signup = () => {
  const backgroundImages = [
    'https://thumbs.dreamstime.com/b/african-high-school-children-teacher-classroom-lesson-cape-town-south-africa-december-african-high-school-children-135349659.jpg',
    'https://media.istockphoto.com/id/1440160796/photo/two-college-students-reading-a-textbook-during-computer-class.jpg?s=612x612&w=0&k=20&c=_gnYPqDC1Y4mJXRerGkXdpUh7UF2dtvmdXd00MT5CqM=',
    'https://www.shutterstock.com/image-photo/young-graduates-standing-front-university-600nw-172074950.jpg',
    'https://c8.alamy.com/comp/2BPG5T5/personnel-manager-and-young-job-applicant-shaking-hands-at-modern-company-office-2BPG5T5.jpg',
    'https://i0.wp.com/technologysalon.org/wp-content/uploads/2018/06/south-africa-youth-employment.png?resize=600%2C380'
  ];
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phone: '',
    bio: '',
    companyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (!formData.displayName.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Create user profile base object
      const profileData = {
        displayName: formData.displayName,
        email: formData.email,
        role: formData.role,
        emailVerified: featureFlags.bypassEmailVerification ? true : false,
        profile: {
          phone: formData.phone,
          bio: formData.bio
        }
      };

      // Create company document and link companyId for company representatives
      if (formData.role === 'company' && formData.companyName) {
        // Create company document in companies collection
        const companyId = await createCompany({
          name: formData.companyName,
          contactEmail: formData.email,
          contactPerson: formData.displayName,
          phone: formData.phone,
          status: 'active',
          createdBy: userCredential.user.uid
        });
        
        // Add company info to profile
        profileData.companyId = companyId;
        profileData.companyName = formData.companyName;
        profileData.profile.companyName = formData.companyName;
      }

      await createUserProfile(userCredential.user.uid, profileData);

      if (!featureFlags.bypassEmailVerification) {
        // Send email verification only when not bypassing
        try {
          await sendEmailVerification(userCredential.user);
          console.log('✅ Verification email sent successfully to:', formData.email);
        } catch (emailErr) {
          console.error('⚠️ Email verification send failed:', emailErr);
          console.log('Email error code:', emailErr.code);
          console.log('Email error message:', emailErr.message);
          // Continue anyway - user can resend from verification page
        }
      } else {
        console.log('⚡ Email verification bypass enabled: skipping sendEmailVerification');
      }

      setSuccess(true);
      setLoading(false);

      // Redirect based on feature flag
      setTimeout(() => {
        if (featureFlags.bypassEmailVerification) {
          navigate('/dashboard');
        } else {
          navigate('/verify-email');
        }
      }, 1500);

    } catch (err) {
      console.error('Signup error:', err);
      console.log('Error code:', err.code);
      console.log('Error message:', err.message);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Use at least 6 characters.');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password authentication is not enabled. Please contact admin.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection.');
          break;
        default:
          setError(`Signup failed: ${err.message}. Please try again.`);
      }
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <div className="auth-background">
          {backgroundImages.map((img, index) => (
            <div
              key={index}
              className="auth-background-image"
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
        <div className="auth-container">
          <div className="container-narrow" style={{ paddingTop: '60px' }}>
            <div className="card">
              <div className="alert alert-success">
                <h3>Account Created Successfully!</h3>
                <p>
                  {featureFlags.bypassEmailVerification ? (
                    <>Email verification bypass is active. Redirecting you to your dashboard...</>
                  ) : (
                    <>A verification email has been sent to <strong>{formData.email}</strong>. Please check your inbox and verify your email before logging in.</>
                  )}
                </p>
                <p className="text-muted mt-md">Redirecting...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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

      {/* Signup Form */}
      <div className="auth-container">
        <div className="container-narrow">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title text-center">Create LCGAP Account</h2>
            </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="displayName" className="form-label form-label-required">
              Full Name
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              className="form-input"
              value={formData.displayName}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label form-label-required">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
              autoComplete="email"
            />
            {!featureFlags.bypassEmailVerification && (
              <span className="form-help">
                You will need to verify this email address
              </span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label form-label-required">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label form-label-required">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label form-label-required">
              Account Type
            </label>
            <select
              id="role"
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="institute">Institution Representative</option>
              <option value="company">Company Representative</option>
            </select>
          </div>

          {/* Company Name - Only show for company representatives */}
          {formData.role === 'company' && (
            <div className="form-group">
              <label htmlFor="companyName" className="form-label form-label-required">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                className="form-input"
                value={formData.companyName}
                onChange={handleChange}
                required={formData.role === 'company'}
                placeholder="Enter your company name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+266 XXXX XXXX"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio" className="form-label">
              Bio / About (Optional)
            </label>
            <textarea
              id="bio"
              name="bio"
              className="form-textarea"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about yourself..."
              rows="4"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-lg">
          <p className="text-muted">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
              Login here
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

export default Signup;
