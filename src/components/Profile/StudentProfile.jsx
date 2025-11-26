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
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bio: '',
    isForeign: false,
    fieldsOfWork: [], // Multiple fields for better matching
    
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

  // Comprehensive list of work fields
  const workFields = [
    'Accounting & Finance',
    'Administration & Office Support',
    'Agriculture & Farming',
    'Arts & Creative Design',
    'Automotive & Mechanics',
    'Banking & Financial Services',
    'Building & Construction',
    'Business Management',
    'Call Centre & Customer Service',
    'Carpentry & Woodwork',
    'Cleaning & Janitorial Services',
    'Community Services & Development',
    'Consulting & Strategy',
    'Education & Training',
    'Electrical & Electronics',
    'Engineering',
    'Healthcare & Medical',
    'Hospitality & Tourism',
    'Human Resources',
    'Information Technology',
    'Insurance',
    'Legal Services',
    'Logistics & Supply Chain',
    'Manufacturing & Production',
    'Marketing & Communications',
    'Mining & Resources',
    'Nursing & Aged Care',
    'Painting & Decorating',
    'Plumbing & HVAC',
    'Real Estate & Property',
    'Retail & Sales',
    'Science & Research',
    'Security & Safety',
    'Social Work & Counselling',
    'Sport & Recreation',
    'Telecommunications',
    'Trades & Services',
    'Transport & Delivery',
    'Welding & Metal Work',
    'Other'
  ];

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
          phoneNumber: profile.phoneNumber || '',
          dateOfBirth: profile.dateOfBirth || '',
          gender: profile.gender || '',
          address: profile.address || '',
          bio: profile.bio || '',
          isForeign: profile.isForeign || false,
          fieldsOfWork: profile.fieldsOfWork || [],
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

  // Validation for subjects
  const getMandatorySubjects = () => {
    const mandatory = ['English', 'Biology', 'Chemistry', 'Physics'];
    if (!formData.isForeign) {
      mandatory.push('Sesotho');
    }
    return mandatory;
  };

  const getMissingMandatorySubjects = () => {
    const mandatorySubjects = getMandatorySubjects();
    const currentSubjects = formData.highSchool.subjects.map(s => 
      s.name.toLowerCase().trim()
    );
    
    return mandatorySubjects.filter(required => 
      !currentSubjects.some(current => 
        current.includes(required.toLowerCase())
      )
    );
  };

  const validateSubjects = () => {
    const subjects = formData.highSchool.subjects;
    
    // Check minimum count
    if (subjects.length < 7) {
      return `You need at least 7 subjects. Currently have ${subjects.length}.`;
    }
    
    // Check mandatory subjects
    const missing = getMissingMandatorySubjects();
    if (missing.length > 0) {
      return `Missing mandatory subjects: ${missing.join(', ')}`;
    }
    
    return null;
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

      // Validate subjects before saving
      const subjectValidationError = validateSubjects();
      if (subjectValidationError) {
        setError(subjectValidationError);
        setSaving(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Validate fields of work
      if (formData.fieldsOfWork.length === 0) {
        setError('Please select at least one field of work to help match you with relevant jobs.');
        setSaving(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      await updateUserProfile(user.uid, {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        bio: formData.bio,
        isForeign: formData.isForeign,
        fieldsOfWork: formData.fieldsOfWork,
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

  const cgpa = calculateCGPA();
  const profileCompletion = ((
    (formData.displayName ? 10 : 0) +
    (formData.phoneNumber ? 8 : 0) +
    (formData.dateOfBirth ? 7 : 0) +
    (formData.gender ? 5 : 0) +
    (formData.address ? 5 : 0) +
    (formData.bio ? 10 : 0) +
    (formData.fieldsOfWork && formData.fieldsOfWork.length > 0 ? 10 : 0) +
    (formData.highSchool.name ? 10 : 0) +
    (formData.highSchool.subjects.length >= 7 ? 15 : formData.highSchool.subjects.length > 0 ? 8 : 0) +
    (formData.certificates.length > 0 ? 10 : 0) +
    (formData.workExperience.length > 0 ? 10 : 0)
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
                👤 My Profile
              </h1>
              <p style={{ margin: 0, opacity: 0.95, fontSize: '1.1rem' }}>
                Complete your profile to improve your application chances
              </p>
            </div>
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
              {cgpa}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>CGPA</div>
          </div>

          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              📚
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {formData.highSchool.subjects.length}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Subjects</div>
          </div>

          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              🏆
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {formData.certificates.length}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Certificates</div>
          </div>

          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              💼
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {formData.workExperience.length}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Experience</div>
          </div>
        </div>

        <div className="card shadow-md" style={{ borderRadius: '16px' }}>
          {error && (
            <div className="alert alert-danger shadow-md" role="alert" style={{ 
              borderRadius: '12px',
              border: '1px solid #fee2e2',
              margin: 'var(--spacing-lg)'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success shadow-md" role="alert" style={{ 
              borderRadius: '12px',
              border: '1px solid #d1fae5',
              margin: 'var(--spacing-lg)'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* Basic Information */}
            <section className="form-section">
              <div className="card shadow-md" style={{ 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                borderRadius: '12px',
                padding: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xl)',
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
                  <label htmlFor="phoneNumber" className="form-label form-label-required">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    className="form-input"
                    value={formData.phoneNumber}
                    onChange={handleBasicChange}
                    placeholder="+266 XXXX XXXX"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth" className="form-label form-label-required">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    className="form-input"
                    value={formData.dateOfBirth}
                    onChange={handleBasicChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender" className="form-label form-label-required">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className="form-input"
                    value={formData.gender}
                    onChange={handleBasicChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label form-label-required">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  className="form-textarea"
                  value={formData.address}
                  onChange={handleBasicChange}
                  placeholder="Enter your full address..."
                  rows="2"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <input
                    type="checkbox"
                    name="isForeign"
                    checked={formData.isForeign}
                    onChange={(e) => setFormData(prev => ({ ...prev, isForeign: e.target.checked }))}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  I am a foreign/international student
                </label>
                <small className="text-muted" style={{ display: 'block', marginTop: 'var(--spacing-xs)' }}>
                  Check this if you are not from Lesotho (exempts you from Sesotho subject requirement)
                </small>
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

              <div className="form-group">
                <label className="form-label form-label-required">
                  Field(s) of Work / Career Interest
                </label>
                <small className="text-muted" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                  Select all fields you're interested in or qualified for. This helps match you with relevant job opportunities.
                </small>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: 'var(--spacing-xs)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: 'var(--spacing-sm)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--background-color)'
                }}>
                  {workFields.map((field) => (
                    <label 
                      key={field}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'var(--spacing-xs)',
                        cursor: 'pointer',
                        padding: 'var(--spacing-xs)',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={formData.fieldsOfWork.includes(field)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              fieldsOfWork: [...prev.fieldsOfWork, field]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              fieldsOfWork: prev.fieldsOfWork.filter(f => f !== field)
                            }));
                          }
                        }}
                        style={{ width: 'auto', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>{field}</span>
                    </label>
                  ))}
                </div>
                {formData.fieldsOfWork.length > 0 && (
                  <div style={{ 
                    marginTop: 'var(--spacing-sm)',
                    padding: 'var(--spacing-sm)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <strong>Selected ({formData.fieldsOfWork.length}):</strong>{' '}
                    {formData.fieldsOfWork.join(', ')}
                  </div>
                )}
                {formData.fieldsOfWork.length === 0 && (
                  <small className="text-muted" style={{ display: 'block', marginTop: 'var(--spacing-xs)', color: '#ef4444' }}>
                    ⚠️ Please select at least one field of work to help match you with relevant jobs
                  </small>
                )}
              </div>
              </div>
            </section>

            {/* High School Information */}
            <section className="form-section">
              <div className="card shadow-md" style={{ 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                borderRadius: '12px',
                padding: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xl)',
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
                
                {/* Subject Requirements Info */}
                <div style={{ 
                  padding: 'var(--spacing-sm)',
                  marginBottom: 'var(--spacing-md)',
                  backgroundColor: formData.highSchool.subjects.length >= 7 && getMissingMandatorySubjects().length === 0 
                    ? '#d1fae5' 
                    : '#fef3c7',
                  borderRadius: '8px',
                  border: `1px solid ${formData.highSchool.subjects.length >= 7 && getMissingMandatorySubjects().length === 0 ? '#10b981' : '#f59e0b'}`
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>
                    📚 Requirements:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)', fontSize: '0.875rem' }}>
                    <li style={{ color: formData.highSchool.subjects.length >= 7 ? '#10b981' : '#f59e0b' }}>
                      Minimum 7 subjects required ({formData.highSchool.subjects.length}/7)
                    </li>
                    <li>
                      Mandatory subjects: {getMandatorySubjects().join(', ')}
                      {getMissingMandatorySubjects().length > 0 && (
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>
                          {' '}(Missing: {getMissingMandatorySubjects().join(', ')})
                        </span>
                      )}
                      {getMissingMandatorySubjects().length === 0 && formData.highSchool.subjects.length > 0 && (
                        <span style={{ color: '#10b981', fontWeight: 600 }}>
                          {' '}✓ All mandatory subjects added
                        </span>
                      )}
                    </li>
                  </ul>
                </div>

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
              </div>
            </section>

            {/* Certificates */}
            <section className="form-section">
              <div className="card shadow-md" style={{ 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                borderRadius: '12px',
                padding: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xl)',
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
                </h2>
              
              <div className="card shadow-sm" style={{ backgroundColor: 'white', marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-lg)', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem', fontWeight: 600 }}>Add New Certificate</h3>
                
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
                  className="btn btn-primary hover-scale-sm"
                  onClick={addCertificate}
                >
                  ✨ Add Certificate
                </button>
              </div>

              {/* List of Certificates */}
              {formData.certificates.length > 0 && (
                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                  <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem', fontWeight: 600 }}>Your Certificates ({formData.certificates.length})</h3>
                  {formData.certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="card shadow-sm hover-lift transition-all"
                      style={{ marginBottom: 'var(--spacing-md)', position: 'relative', backgroundColor: 'white', borderRadius: '12px' }}
                    >
                      <button
                        type="button"
                        onClick={() => removeCertificate(cert.id)}
                        className="btn btn-danger btn-sm hover-scale-sm"
                        style={{ position: 'absolute', top: 'var(--spacing-sm)', right: 'var(--spacing-sm)' }}
                      >
                        🗑️ Remove
                      </button>
                      <h4 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--primary-color)', fontSize: '1.1rem', fontWeight: 600 }}>
                        🏆 {cert.name}
                      </h4>
                      <p style={{ marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
                        {cert.issuer}
                      </p>
                      {cert.dateIssued && (
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                          📅 Issued: {new Date(cert.dateIssued).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      )}
                      {cert.description && (
                        <p style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.95rem' }}>{cert.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              </div>
            </section>

            {/* Work Experience */}
            <section className="form-section">
              <div className="card shadow-md" style={{ 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                borderRadius: '12px',
                padding: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xl)',
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
                </h2>
              
              <div className="card shadow-sm" style={{ backgroundColor: 'white', marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-lg)', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem', fontWeight: 600 }}>Add Work Experience</h3>
                
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
                  className="btn btn-primary hover-scale-sm"
                  onClick={addWorkExperience}
                >
                  ✨ Add Work Experience
                </button>
              </div>

              {/* List of Work Experience */}
              {formData.workExperience.length > 0 && (
                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                  <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem', fontWeight: 600 }}>Your Work Experience ({formData.workExperience.length})</h3>
                  {formData.workExperience.map((exp) => (
                    <div
                      key={exp.id}
                      className="card shadow-sm hover-lift transition-all"
                      style={{ marginBottom: 'var(--spacing-md)', position: 'relative', backgroundColor: 'white', borderRadius: '12px' }}
                    >
                      <button
                        type="button"
                        onClick={() => removeWorkExperience(exp.id)}
                        className="btn btn-danger btn-sm hover-scale-sm"
                        style={{ position: 'absolute', top: 'var(--spacing-sm)', right: 'var(--spacing-sm)' }}
                      >
                        🗑️ Remove
                      </button>
                      <h4 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--primary-color)', fontSize: '1.1rem', fontWeight: 600 }}>
                        💼 {exp.title}
                      </h4>
                      <p style={{ marginBottom: 'var(--spacing-xs)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        🏢 {exp.company} {exp.location && <><span style={{ color: 'var(--text-muted)' }}>•</span> 📍 {exp.location}</>}
                      </p>
                      <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                        📅 {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        {' - '}
                        {exp.current ? <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Present</span> : (exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))}
                      </p>
                      {exp.description && (
                        <p style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.95rem' }}>{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              </div>
            </section>

            {/* Save Button */}
            <div style={{ 
              display: 'flex', 
              gap: 'var(--spacing-md)', 
              justifyContent: 'flex-end',
              marginTop: 'var(--spacing-xl)',
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--background-secondary)',
              borderRadius: '12px'
            }}>
              <button
                type="button"
                className="btn btn-outline hover-scale-sm"
                onClick={() => navigate('/profile')}
              >
                ❌ Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg hover-scale-sm"
                disabled={saving}
                style={{ minWidth: '160px' }}
              >
                {saving ? '⏳ Saving...' : '💾 Save Profile'}
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
