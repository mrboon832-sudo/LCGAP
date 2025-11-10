import React, { useState, useEffect } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import '../../styles/base.css';
import '../../styles/auth-background.css';
import featureFlags from '../../config/featureFlags';

const VerifyEmailNotice = ({ user }) => {
  const backgroundImages = [
    'https://thumbs.dreamstime.com/b/african-high-school-children-teacher-classroom-lesson-cape-town-south-africa-december-african-high-school-children-135349659.jpg',
    'https://media.istockphoto.com/id/1440160796/photo/two-college-students-reading-a-textbook-during-computer-class.jpg?s=612x612&w=0&k=20&c=_gnYPqDC1Y4mJXRerGkXdpUh7UF2dtvmdXd00MT5CqM=',
    'https://www.shutterstock.com/image-photo/young-graduates-standing-front-university-600nw-172074950.jpg',
    'https://c8.alamy.com/comp/2BPG5T5/personnel-manager-and-young-job-applicant-shaking-hands-at-modern-company-office-2BPG5T5.jpg',
    'https://i0.wp.com/technologysalon.org/wp-content/uploads/2018/06/south-africa-youth-employment.png?resize=600%2C380'
  ];
  
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If bypass is enabled or email is verified, go straight to dashboard
    if (featureFlags.bypassEmailVerification || (user && user.emailVerified)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendError('');
    setResendSuccess(false);

    try {
      await sendEmailVerification(auth.currentUser);
      setResendSuccess(true);
      setResendLoading(false);
    } catch (err) {
      console.error('Resend error:', err);
      if (err.code === 'auth/too-many-requests') {
        setResendError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setResendError('Failed to send verification email. Please try again.');
      }
      setResendLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        navigate('/dashboard');
      } else {
        setResendError('Email not verified yet. Please check your inbox.');
      }
    } catch (err) {
      console.error('Check status error:', err);
      setResendError('Failed to check verification status.');
    }
    setCheckingStatus(false);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
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

      {/* Verify Email Content */}
      <div className="auth-container">
        <div className="container-narrow">
          <div className="card">
            <div className="text-center">
              <div style={{
                fontSize: '4rem',
                marginBottom: 'var(--spacing-lg)'
              }}>
                ✉️
              </div>
              
              <h2 className="card-title">Verify Your Email</h2>
          
          <div className="alert alert-info" style={{ textAlign: 'left', marginTop: 'var(--spacing-lg)' }}>
            <p>
              We've sent a verification email to:
            </p>
            <p style={{ fontSize: '1.125rem', fontWeight: 600, margin: 'var(--spacing-md) 0' }}>
              {user?.email || 'your email address'}
            </p>
            <p>
              Please check your inbox and click the verification link to activate your account.
            </p>
          </div>

          {resendSuccess && (
            <div className="alert alert-success" style={{ marginTop: 'var(--spacing-md)' }}>
              Verification email sent! Please check your inbox.
            </div>
          )}

          {resendError && (
            <div className="alert alert-danger" style={{ marginTop: 'var(--spacing-md)' }}>
              {resendError}
            </div>
          )}

          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <h4>What to do next:</h4>
            <ol style={{
              textAlign: 'left',
              marginTop: 'var(--spacing-md)',
              paddingLeft: 'var(--spacing-lg)',
              color: 'var(--text-secondary)'
            }}>
              <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                Check your email inbox (and spam/junk folder)
              </li>
              <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                Click the verification link in the email
              </li>
              <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                Come back here and click "I've Verified My Email"
              </li>
            </ol>
          </div>

          <div className="flex flex-column gap-md" style={{ marginTop: 'var(--spacing-xl)' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleCheckStatus}
              disabled={checkingStatus}
              style={{ width: '100%' }}
            >
              {checkingStatus ? 'Checking...' : "I've Verified My Email"}
            </button>

            <button
              className="btn btn-outline"
              onClick={handleResendEmail}
              disabled={resendLoading}
              style={{ width: '100%' }}
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleLogout}
              style={{ width: '100%' }}
            >
              Logout
            </button>
          </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailNotice;
