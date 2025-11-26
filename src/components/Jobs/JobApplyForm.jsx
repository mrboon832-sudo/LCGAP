import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import Footer from '../Layout/Footer';
import '../../styles/base.css';
import '../../styles/forms.css';

const JobApplyForm = ({ user }) => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    coverLetter: '',
    resume: '',
    portfolio: '',
    availability: '',
    fieldOfWork: '' // Primary field for this application
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

  useEffect(() => {
    fetchJobDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobSnap = await getDoc(jobRef);
      
      if (jobSnap.exists()) {
        setJob({ id: jobSnap.id, ...jobSnap.data() });
      } else {
        setError('Job not found');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Failed to load job details');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Get current auth user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('You must be logged in to apply');
        setSubmitting(false);
        return;
      }

      // Validate field of work is selected
      if (!formData.fieldOfWork) {
        setError('Please select the field of work that best matches this position.');
        setSubmitting(false);
        return;
      }

      // Create job application
      await addDoc(collection(db, 'jobApplications'), {
        studentId: currentUser.uid,
        studentName: user?.displayName || user?.email || currentUser.email,
        studentEmail: user?.email || currentUser.email,
        jobId: jobId,
        companyId: job.companyId,
        jobTitle: job.title,
        companyName: job.companyName,
        coverLetter: formData.coverLetter,
        resume: formData.resume,
        portfolio: formData.portfolio || '',
        availability: formData.availability,
        fieldOfWork: formData.fieldOfWork, // Primary field for this specific application
        // Include both old and new profile structures for compatibility
        academicPerformance: user?.academicPerformance || { gpa: user?.highSchool?.gpa || 'N/A' },
        highSchool: user?.highSchool || {},
        workExperience: user?.workExperience || [],
        certificates: user?.certificates || [],
        fieldsOfWork: user?.fieldsOfWork || [], // All fields from profile
        status: 'pending',
        createdAt: serverTimestamp()
      });

      alert('Application submitted successfully!');
      navigate('/applications');
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <div className="spinner"></div>
        <p className="loading-text">Loading application form...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <div className="alert alert-danger">{error}</div>
        <Link to="/jobs" className="btn btn-primary">Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="student-theme">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <Link to="/jobs" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
            Jobs
          </Link>
        {' > '}
        <Link to={`/jobs/${jobId}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
          {job?.title}
        </Link>
        {' > Apply'}
      </div>

      <div className="container-narrow">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Apply for {job?.title}</h2>
            <p className="text-muted">{job?.companyName}</p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Cover Letter */}
            <div className="form-group">
              <label htmlFor="coverLetter" className="form-label form-label-required">
                Cover Letter
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                className="form-input"
                value={formData.coverLetter}
                onChange={handleChange}
                required
                rows="8"
                placeholder="Explain why you're interested in this position and what makes you a great fit..."
              />
              <small className="text-muted">
                Highlight your relevant experience and skills
              </small>
            </div>

            {/* Resume/CV Link */}
            <div className="form-group">
              <label htmlFor="resume" className="form-label form-label-required">
                Resume/CV Link
              </label>
              <input
                type="url"
                id="resume"
                name="resume"
                className="form-input"
                value={formData.resume}
                onChange={handleChange}
                required
                placeholder="https://drive.google.com/... or Dropbox link"
              />
              <small className="text-muted">
                Provide a link to your resume (Google Drive, Dropbox, etc.)
              </small>
            </div>

            {/* Portfolio (Optional) */}
            <div className="form-group">
              <label htmlFor="portfolio" className="form-label">
                Portfolio/LinkedIn (Optional)
              </label>
              <input
                type="url"
                id="portfolio"
                name="portfolio"
                className="form-input"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/... or portfolio website"
              />
            </div>

            {/* Field of Work for This Application */}
            <div className="form-group">
              <label htmlFor="fieldOfWork" className="form-label form-label-required">
                Field of Work for This Position
              </label>
              <select
                id="fieldOfWork"
                name="fieldOfWork"
                className="form-input"
                value={formData.fieldOfWork}
                onChange={handleChange}
                required
              >
                <option value="">Select the field that best matches this job...</option>
                {workFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
              <small className="text-muted">
                Select the primary field of work that best describes this position. This helps us better match your application.
              </small>
              {user.fieldsOfWork && user.fieldsOfWork.length > 0 && (
                <div style={{ 
                  marginTop: 'var(--spacing-xs)',
                  padding: 'var(--spacing-xs)',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}>
                  <strong>Your profile fields:</strong> {user.fieldsOfWork.join(', ')}
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="form-group">
              <label htmlFor="availability" className="form-label form-label-required">
                Availability
              </label>
              <select
                id="availability"
                name="availability"
                className="form-input"
                value={formData.availability}
                onChange={handleChange}
                required
              >
                <option value="">Select availability...</option>
                <option value="immediate">Immediate</option>
                <option value="2-weeks">2 Weeks Notice</option>
                <option value="1-month">1 Month Notice</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>

            {/* Profile Summary - Academic & Professional Information */}
            <div className="alert alert-info">
              <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>📊 Your Profile Summary</h4>
              
              {/* Academic Performance */}
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                <strong>Academic Performance:</strong>
                <div style={{ marginLeft: 'var(--spacing-md)', marginTop: 'var(--spacing-xs)' }}>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>GPA:</strong> {user.highSchool?.gpa || user.academicPerformance?.gpa || user.academicPerformance?.grade || 'Not provided'}
                  </p>
                  {user.highSchool?.name && (
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>School:</strong> {user.highSchool.name}
                    </p>
                  )}
                  {user.highSchool?.graduationYear && (
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Graduation Year:</strong> {user.highSchool.graduationYear}
                    </p>
                  )}
                  {user.highSchool?.subjects && user.highSchool.subjects.length > 0 && (
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Subjects ({user.highSchool.subjects.length}):</strong>{' '}
                      {user.highSchool.subjects.map(s => typeof s === 'string' ? s : `${s.name} (${s.grade})`).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <p style={{ margin: '0.5rem 0' }}><strong>Fields of Work:</strong> {user.fieldsOfWork?.join(', ') || 'Not specified'}</p>
              <p style={{ margin: '0.5rem 0' }}><strong>Work Experience:</strong> {user.workExperience?.length || 0} positions</p>
              <p style={{ margin: '0.5rem 0' }}><strong>Certificates:</strong> {user.certificates?.length || 0}</p>
              
              {(!user.fieldsOfWork || user.fieldsOfWork.length === 0 || !user.highSchool?.gpa) && (
                <div style={{ 
                  marginTop: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '4px'
                }}>
                  ⚠️ Complete your profile to improve your application success rate. <Link to="/profile/edit" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Update your profile</Link>
                </div>
              )}
              <Link to="/profile/edit" style={{ color: 'var(--primary-color)' }}>
                Update your profile
              </Link>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
              <Link to={`/jobs/${jobId}`} className="btn btn-outline">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
      <Footer />
      </div>
    </div>
  );
};

export default JobApplyForm;
