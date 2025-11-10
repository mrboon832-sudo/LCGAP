import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../../services/api';
import { auth } from '../../services/firebase';
import Footer from '../Layout/Footer';
import '../../styles/base.css';
import '../../styles/forms.css';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    // Basic Info
    displayName: '',
    email: '',
    phone: '',
    bio: '',
    
    // High School Info
    highSchool: {
      name: '',
      location: '',
      graduationYear: '',
      gpa: '',
      subjects: []
    },
    
    // Certificates
    certificates: [],
    
    // Work Experience
    workExperience: []
  });

  // Temporary state for adding new items
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    issuer: '',
    dateIssued: '',
    description: ''
  });

  const [newWorkExperience, setNewWorkExperience] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const [newSubject, setNewSubject] = useState({ name: '', grade: 'C' });

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

      const profile = await getUserProfile(user.uid);
      if (profile) {
        setFormData({
          displayName: profile.displayName || '',
          email: profile.email || '',
          phone: profile.profile?.phone || '',
          bio: profile.profile?.bio || '',
          highSchool: profile.highSchool || {
            name: '',
            location: '',
            graduationYear: '',
            gpa: '',
            subjects: []
          },
          certificates: profile.certificates || [],
          workExperience: profile.workExperience || []
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHighSchoolChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      highSchool: {
        ...prev.highSchool,
        [name]: value
      }
    }));
  };

  const addSubject = () => {
    if (newSubject.name.trim()) {
      setFormData(prev => ({
        ...prev,
        highSchool: {
          ...prev.highSchool,
          subjects: [...prev.highSchool.subjects, { 
            name: newSubject.name.trim(), 
            grade: newSubject.grade,
            id: Date.now()
          }]
        }
      }));
      setNewSubject({ name: '', grade: 'C' });
    }
  };

  const calculateCGPA = () => {
    const subjects = formData.highSchool.subjects;
    if (!subjects || subjects.length === 0) return '0.00';
    
    const gradePoints = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'E': 0.0 };
    const total = subjects.reduce((sum, subject) => {
      const points = gradePoints[subject.grade] || 0;
      return sum + points;
    }, 0);
    
    return (total / subjects.length).toFixed(2);
  };

  const removeSubject = (index) => {
    setFormData(prev => ({
      ...prev,
      highSchool: {
        ...prev.highSchool,
        subjects: prev.highSchool.subjects.filter((_, i) => i !== index)
      }
    }));
  };

  const addCertificate = () => {
    if (newCertificate.name.trim() && newCertificate.issuer.trim()) {
      setFormData(prev => ({
        ...prev,
        certificates: [...prev.certificates, { ...newCertificate, id: Date.now() }]
      }));
      setNewCertificate({
        name: '',
        issuer: '',
        dateIssued: '',
        description: ''
      });
    }
  };

  const removeCertificate = (id) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter(cert => cert.id !== id)
    }));
  };

  const addWorkExperience = () => {
    if (newWorkExperience.title.trim() && newWorkExperience.company.trim()) {
      setFormData(prev => ({
        ...prev,
        workExperience: [...prev.workExperience, { ...newWorkExperience, id: Date.now() }]
      }));
      setNewWorkExperience({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      });
    }
  };

  const removeWorkExperience = (id) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(exp => exp.id !== id)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      await updateUserProfile(user.uid, {
        displayName: formData.displayName,
        profile: {
          phone: formData.phone,
          bio: formData.bio
        },
        highSchool: formData.highSchool,
        certificates: formData.certificates,
        workExperience: formData.workExperience
      });

      setSuccess('Profile updated successfully!');
      setSaving(false);
      
      // Redirect to view profile after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
        <p className="loading-text">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="student-theme">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-xl)' }}>
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">My Profile</h1>
            <p className="text-muted">Complete your profile to improve your application chances</p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* Basic Information */}
            <section className="form-section">
              <h2 className="form-section-title">Basic Information</h2>
              
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
                  onChange={handleBasicChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    disabled
                    style={{ backgroundColor: 'var(--background-secondary)', cursor: 'not-allowed' }}
                  />
                  <span className="form-help">Email cannot be changed</span>
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleBasicChange}
                    placeholder="+266 XXXX XXXX"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio" className="form-label">
                  Bio / About Me
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  className="form-textarea"
                  value={formData.bio}
                  onChange={handleBasicChange}
                  placeholder="Tell us about yourself, your goals, and interests..."
                  rows="4"
                />
              </div>
            </section>

            {/* High School Information */}
            <section className="form-section">
              <h2 className="form-section-title">High School / Secondary Education</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    School Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={formData.highSchool.name}
                    onChange={handleHighSchoolChange}
                    placeholder="e.g., Maseru High School"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="form-input"
                    value={formData.highSchool.location}
                    onChange={handleHighSchoolChange}
                    placeholder="e.g., Maseru, Lesotho"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="graduationYear" className="form-label">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    id="graduationYear"
                    name="graduationYear"
                    className="form-input"
                    value={formData.highSchool.graduationYear}
                    onChange={handleHighSchoolChange}
                    placeholder="e.g., 2025"
                    min="1950"
                    max="2040"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gpa" className="form-label">
                    GPA / Average Grade
                  </label>
                  <input
                    type="text"
                    id="gpa"
                    name="gpa"
                    className="form-input"
                    value={formData.highSchool.gpa}
                    onChange={handleHighSchoolChange}
                    placeholder="e.g., 3.8 or A"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subjects / Courses & Grades</label>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: '1 1 200px' }}
                    value={newSubject.name}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Mathematics"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                  />
                  <select
                    className="form-input"
                    style={{ flex: '0 0 100px' }}
                    value={newSubject.grade}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, grade: e.target.value }))}
                  >
                    <option value="A">A (4.0)</option>
                    <option value="B">B (3.0)</option>
                    <option value="C">C (2.0)</option>
                    <option value="D">D (1.0)</option>
                    <option value="E">E (0.0)</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={addSubject}
                  >
                    Add Subject
                  </button>
                </div>
                
                {formData.highSchool.subjects.length > 0 && (
                  <div style={{ 
                    padding: 'var(--spacing-sm)', 
                    backgroundColor: 'var(--background-color)', 
                    borderRadius: '4px',
                    marginBottom: 'var(--spacing-sm)'
                  }}>
                    <strong>CGPA: {calculateCGPA()}</strong> / 4.00
                  </div>
                )}
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                  {formData.highSchool.subjects.map((subject, index) => (
                    <span
                      key={subject.id || index}
                      className="badge"
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}
                    >
                      {typeof subject === 'string' ? subject : `${subject.name} (${subject.grade})`}
                      <button
                        type="button"
                        onClick={() => removeSubject(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'inherit',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '1.2rem',
                          lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Certificates */}
            <section className="form-section">
              <h2 className="form-section-title">Certificates & Qualifications</h2>
              
              <div className="card" style={{ backgroundColor: 'var(--background-secondary)', marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem' }}>Add New Certificate</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Certificate Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newCertificate.name}
                      onChange={(e) => setNewCertificate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., First Aid Certificate"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Issuing Organization</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newCertificate.issuer}
                      onChange={(e) => setNewCertificate(prev => ({ ...prev, issuer: e.target.value }))}
                      placeholder="e.g., Red Cross"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date Issued</label>
                  <input
                    type="month"
                    className="form-input"
                    value={newCertificate.dateIssued}
                    onChange={(e) => setNewCertificate(prev => ({ ...prev, dateIssued: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={newCertificate.description}
                    onChange={(e) => setNewCertificate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of skills or knowledge gained..."
                    rows="2"
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addCertificate}
                >
                  Add Certificate
                </button>
              </div>

              {/* List of Certificates */}
              {formData.certificates.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem' }}>Your Certificates</h3>
                  {formData.certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="card"
                      style={{ marginBottom: 'var(--spacing-md)', position: 'relative' }}
                    >
                      <button
                        type="button"
                        onClick={() => removeCertificate(cert.id)}
                        className="btn btn-danger"
                        style={{ position: 'absolute', top: 'var(--spacing-sm)', right: 'var(--spacing-sm)' }}
                      >
                        Remove
                      </button>
                      <h4 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--primary-color)' }}>
                        {cert.name}
                      </h4>
                      <p style={{ marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
                        {cert.issuer}
                      </p>
                      {cert.dateIssued && (
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                          Issued: {new Date(cert.dateIssued).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      )}
                      {cert.description && (
                        <p style={{ marginTop: 'var(--spacing-sm)' }}>{cert.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Work Experience */}
            <section className="form-section">
              <h2 className="form-section-title">Work Experience</h2>
              
              <div className="card" style={{ backgroundColor: 'var(--background-secondary)', marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem' }}>Add Work Experience</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newWorkExperience.title}
                      onChange={(e) => setNewWorkExperience(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Sales Assistant"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newWorkExperience.company}
                      onChange={(e) => setNewWorkExperience(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="e.g., ABC Store"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newWorkExperience.location}
                    onChange={(e) => setNewWorkExperience(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Maseru, Lesotho"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="month"
                      className="form-input"
                      value={newWorkExperience.startDate}
                      onChange={(e) => setNewWorkExperience(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="month"
                      className="form-input"
                      value={newWorkExperience.endDate}
                      onChange={(e) => setNewWorkExperience(prev => ({ ...prev, endDate: e.target.value }))}
                      disabled={newWorkExperience.current}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      checked={newWorkExperience.current}
                      onChange={(e) => setNewWorkExperience(prev => ({ 
                        ...prev, 
                        current: e.target.checked,
                        endDate: e.target.checked ? '' : prev.endDate 
                      }))}
                    />
                    <span>I currently work here</span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={newWorkExperience.description}
                    onChange={(e) => setNewWorkExperience(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your responsibilities and achievements..."
                    rows="3"
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addWorkExperience}
                >
                  Add Work Experience
                </button>
              </div>

              {/* List of Work Experience */}
              {formData.workExperience.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem' }}>Your Work Experience</h3>
                  {formData.workExperience.map((exp) => (
                    <div
                      key={exp.id}
                      className="card"
                      style={{ marginBottom: 'var(--spacing-md)', position: 'relative' }}
                    >
                      <button
                        type="button"
                        onClick={() => removeWorkExperience(exp.id)}
                        className="btn btn-danger"
                        style={{ position: 'absolute', top: 'var(--spacing-sm)', right: 'var(--spacing-sm)' }}
                      >
                        Remove
                      </button>
                      <h4 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--primary-color)' }}>
                        {exp.title}
                      </h4>
                      <p style={{ marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
                        {exp.company} {exp.location && `• ${exp.location}`}
                      </p>
                      <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                        {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        {' - '}
                        {exp.current ? 'Present' : (exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))}
                      </p>
                      {exp.description && (
                        <p style={{ marginTop: 'var(--spacing-sm)' }}>{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Save Button */}
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/profile')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StudentProfile;
