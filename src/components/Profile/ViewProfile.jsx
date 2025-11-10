import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUserProfile } from '../../services/api';
import { auth } from '../../services/firebase';
import Footer from '../Layout/Footer';
import '../../styles/base.css';
import '../../styles/forms.css';

const ViewProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      const profileData = await getUserProfile(user.uid);
      if (profileData) {
        setProfile(profileData);
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

  return (
    <div className="student-theme">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h1>My Profile</h1>
          <Link to="/profile/edit" className="btn btn-primary">
            Edit Profile
          </Link>
        </div>

        <div className="card">
          {/* Basic Information */}
          <section style={{ paddingBottom: 'var(--spacing-xl)', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary-color)', marginBottom: 'var(--spacing-lg)' }}>
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
          </section>

          {/* High School Information */}
          <section style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary-color)', marginBottom: 'var(--spacing-lg)' }}>
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
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted">No high school information provided yet</p>
            )}
          </section>

          {/* Certificates */}
          <section style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary-color)', marginBottom: 'var(--spacing-lg)' }}>
              Certificates & Qualifications
            </h2>
            
            {profile.certificates && profile.certificates.length > 0 ? (
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {profile.certificates.map((cert, index) => (
                  <div
                    key={cert.id || index}
                    style={{
                      padding: 'var(--spacing-md)',
                      backgroundColor: 'var(--background-secondary)',
                      borderRadius: 'var(--border-radius)',
                      borderLeft: '4px solid var(--primary-color)'
                    }}
                  >
                    <h4 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--primary-color)' }}>
                      {cert.name}
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
                      <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
                        {cert.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No certificates added yet</p>
            )}
          </section>

          {/* Work Experience */}
          <section style={{ paddingTop: 'var(--spacing-xl)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary-color)', marginBottom: 'var(--spacing-lg)' }}>
              Work Experience
            </h2>
            
            {profile.workExperience && profile.workExperience.length > 0 ? (
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {profile.workExperience.map((exp, index) => (
                  <div
                    key={exp.id || index}
                    style={{
                      padding: 'var(--spacing-md)',
                      backgroundColor: 'var(--background-secondary)',
                      borderRadius: 'var(--border-radius)',
                      borderLeft: '4px solid var(--success-color)'
                    }}
                  >
                    <h4 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--primary-color)' }}>
                      {exp.title}
                    </h4>
                    <p style={{ fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>
                      {exp.company} {exp.location && `• ${exp.location}`}
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                      📅 {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {' - '}
                      {exp.current ? '✨ Present' : (exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))}
                    </p>
                    {exp.description && (
                      <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No work experience added yet</p>
            )}
          </section>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)' }}>
          <Link to="/profile/edit" className="btn btn-primary">
            Edit Profile
          </Link>
          <Link to="/dashboard" className="btn btn-outline">
            Back to Dashboard
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ViewProfile;
