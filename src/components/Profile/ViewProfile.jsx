import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUserProfile } from '../../services/api';
import { auth } from '../../services/firebase';
import Footer from '../Layout/Footer';
import '../../styles/base.css';
import '../../styles/forms.css';

const ViewProfile = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadProfile = async () => {
    try {
      if (!user) {
        // Try to get from auth as fallback
        const authUser = auth.currentUser;
        if (!authUser) {
          navigate('/login');
          return;
        }
        const profileData = await getUserProfile(authUser.uid);
        if (profileData) {
          setProfile(profileData);
        }
      } else {
        setProfile(user);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const calculateAverageGPA = () => {
    if (!profile?.highSchool?.gpa) return 'Not provided';
    
    const gpa = profile.highSchool.gpa;
    
    // If it's already a number, return it
    if (!isNaN(gpa)) {
      return parseFloat(gpa).toFixed(2);
    }
    
    // If it's a letter grade, convert to GPA scale (4.0)
    const gradeMap = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0
    };
    
    const upperGrade = gpa.toUpperCase().trim();
    if (gradeMap[upperGrade] !== undefined) {
      return gradeMap[upperGrade].toFixed(2);
    }
    
    return gpa; // Return as-is if can't convert
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
        <p className="loading-text">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="student-theme">
        <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
          <div className="alert alert-danger">
            {error || 'Profile not found'}
          </div>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const calculateCGPA = () => {
    if (!profile?.highSchool?.subjects || profile.highSchool.subjects.length === 0) {
      return '0.00';
    }
    
    const gradeValues = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'E': 0.0 };
    let total = 0;
    let count = 0;
    
    profile.highSchool.subjects.forEach(subject => {
      if (typeof subject === 'object' && subject.grade) {
        total += gradeValues[subject.grade] || 0;
        count++;
      }
    });
    
    return count > 0 ? (total / count).toFixed(2) : '0.00';
  };

  const profileCompletion = ((
    (profile.displayName ? 20 : 0) +
    (profile.profile?.phone ? 10 : 0) +
    (profile.profile?.bio ? 15 : 0) +
    (profile.highSchool?.name ? 15 : 0) +
    (profile.highSchool?.subjects?.length > 0 ? 20 : 0) +
    (profile.certificates?.length > 0 ? 10 : 0) +
    (profile.workExperience?.length > 0 ? 10 : 0)
  ));

  return (
    <div className="theme-student">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-xl)' }}>
        {/* Header with Gradient */}
        <div className="card gradient-bg" style={{ 
          padding: 'var(--spacing-xl)',
          color: 'white',
          marginBottom: 'var(--spacing-xl)',
          borderRadius: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            <div>
              <h1 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', fontSize: '2rem' }}>
                👤 {profile.displayName || 'My Profile'}
              </h1>
              <p style={{ margin: 0, opacity: 0.95, fontSize: '1.1rem' }}>
                📧 {profile.email}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ 
                textAlign: 'center',
                padding: 'var(--spacing-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                minWidth: '120px'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  {profileCompletion}%
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Complete</div>
              </div>
              <Link to="/profile/edit" className="btn" style={{ 
                backgroundColor: 'white',
                color: 'var(--primary-color)',
                fontWeight: 600,
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                ✏️ Edit Profile
              </Link>
            </div>
          </div>
          {/* Progress Bar */}
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <div className="progress" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', height: '12px' }}>
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${profileCompletion}%`,
                  backgroundColor: 'white',
                  transition: 'width 0.5s ease'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              📊
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {calculateCGPA()}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>CGPA</div>
          </div>

          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              📚
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {profile.highSchool?.subjects?.length || 0}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Subjects</div>
          </div>

          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              🏆
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {profile.certificates?.length || 0}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Certificates</div>
          </div>

          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              💼
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {profile.workExperience?.length || 0}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Experience</div>
          </div>
        </div>

        <div className="card shadow-md" style={{ borderRadius: '16px' }}>
          {/* Basic Information */}
          <section style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div className="card shadow-sm" style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              borderRadius: '12px',
              padding: 'var(--spacing-lg)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <h2 style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-sm)',
                margin: 0,
                marginBottom: 'var(--spacing-lg)',
                fontSize: '1.5rem',
                color: 'var(--primary-color)'
              }}>
                <span className="icon-badge" style={{ fontSize: '1.5rem' }}>📋</span>
                Basic Information
              </h2>
            
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                  Full Name
                </label>
                <p style={{ fontSize: '1.125rem' }}>{profile.displayName || 'Not provided'}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div>
                  <label style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                    Email Address
                  </label>
                  <p>{profile.email || 'Not provided'}</p>
                </div>

                <div>
                  <label style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                    Phone Number
                  </label>
                  <p>{profile.profile?.phone || 'Not provided'}</p>
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                  Bio
                </label>
                <p>{profile.profile?.bio || 'No bio provided'}</p>
              </div>
            </div>
            </div>
          </section>

          {/* High School Information */}
          <section style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div className="card shadow-sm" style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              borderRadius: '12px',
              padding: 'var(--spacing-lg)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <h2 style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-sm)',
                margin: 0,
                marginBottom: 'var(--spacing-lg)',
                fontSize: '1.5rem',
                color: 'var(--primary-color)'
              }}>
                <span className="icon-badge" style={{ fontSize: '1.5rem' }}>🎓</span>
                High School / Secondary Education
              </h2>
            
            {profile.highSchool && (profile.highSchool.name || profile.highSchool.gpa) ? (
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                      School Name
                    </label>
                    <p>{profile.highSchool.name || 'Not provided'}</p>
                  </div>

                  <div>
                    <label style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                      Location
                    </label>
                    <p>{profile.highSchool.location || 'Not provided'}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                      Graduation Year
                    </label>
                    <p>{profile.highSchool.graduationYear || 'Not provided'}</p>
                  </div>

                  <div>
                    <label style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                      Average GPA
                    </label>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--success-color)' }}>
                      {calculateAverageGPA()}
                    </p>
                    {profile.highSchool.gpa && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Original: {profile.highSchool.gpa}
                      </p>
                    )}
                  </div>
                </div>

                {profile.highSchool.subjects && profile.highSchool.subjects.length > 0 && (
                  <div>
                    <label style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                      Subjects
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xs)' }}>
                      {profile.highSchool.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="badge"
                          style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}
                        >
                          {typeof subject === 'string' ? subject : `${subject.name} (${subject.grade})`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted">No high school information provided yet</p>
            )}
            </div>
          </section>

          {/* Certificates */}
          <section style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div className="card shadow-sm" style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              borderRadius: '12px',
              padding: 'var(--spacing-lg)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <h2 style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-sm)',
                margin: 0,
                marginBottom: 'var(--spacing-lg)',
                fontSize: '1.5rem',
                color: 'var(--primary-color)'
              }}>
                <span className="icon-badge" style={{ fontSize: '1.5rem' }}>🏆</span>
                Certificates & Qualifications
                {profile.certificates?.length > 0 && (
                  <span style={{ 
                    marginLeft: 'auto',
                    fontSize: '1rem',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px'
                  }}>
                    {profile.certificates.length}
                  </span>
                )}
              </h2>
            
            {profile.certificates && profile.certificates.length > 0 ? (
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {profile.certificates.map((cert, index) => (
                  <div
                    key={cert.id || index}
                    className="card shadow-sm hover-lift transition-all"
                    style={{
                      padding: 'var(--spacing-md)',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      borderLeft: '4px solid var(--primary-color)'
                    }}
                  >
                    <h4 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--primary-color)', fontWeight: 600 }}>
                      🏆 {cert.name}
                    </h4>
                    <p style={{ fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>
                      {cert.issuer}
                    </p>
                    {cert.dateIssued && (
                      <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                        📅 Issued: {new Date(cert.dateIssued).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    )}
                    {cert.description && (
                      <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        {cert.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No certificates added yet</p>
            )}
            </div>
          </section>

          {/* Work Experience */}
          <section>
            <div className="card shadow-sm" style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              borderRadius: '12px',
              padding: 'var(--spacing-lg)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <h2 style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-sm)',
                margin: 0,
                marginBottom: 'var(--spacing-lg)',
                fontSize: '1.5rem',
                color: 'var(--primary-color)'
              }}>
                <span className="icon-badge" style={{ fontSize: '1.5rem' }}>💼</span>
                Work Experience
                {profile.workExperience?.length > 0 && (
                  <span style={{ 
                    marginLeft: 'auto',
                    fontSize: '1rem',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px'
                  }}>
                    {profile.workExperience.length}
                  </span>
                )}
              </h2>
            
            {profile.workExperience && profile.workExperience.length > 0 ? (
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {profile.workExperience.map((exp, index) => (
                  <div
                    key={exp.id || index}
                    className="card shadow-sm hover-lift transition-all"
                    style={{
                      padding: 'var(--spacing-md)',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      borderLeft: '4px solid var(--success-color)'
                    }}
                  >
                    <h4 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--primary-color)', fontWeight: 600 }}>
                      💼 {exp.title}
                    </h4>
                    <p style={{ fontWeight: 500, marginBottom: 'var(--spacing-xs)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                      🏢 {exp.company} {exp.location && <><span style={{ color: 'var(--text-muted)' }}>•</span> 📍 {exp.location}</>}
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                      📅 {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {' - '}
                      {exp.current ? <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>✨ Present</span> : (exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))}
                    </p>
                    {exp.description && (
                      <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No work experience added yet</p>
            )}
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-md)', 
          marginTop: 'var(--spacing-xl)',
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--background-secondary)',
          borderRadius: '12px',
          justifyContent: 'center'
        }}>
          <Link to="/profile/edit" className="btn btn-primary btn-lg hover-scale-sm" style={{ minWidth: '160px' }}>
            ✏️ Edit Profile
          </Link>
          <Link to="/dashboard" className="btn btn-outline btn-lg hover-scale-sm" style={{ minWidth: '160px' }}>
            🏠 Dashboard
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ViewProfile;
