import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
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
    availability: ''
  });

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

      // Create job application
      await addDoc(collection(db, 'jobApplications'), {
        studentId: currentUser.uid,
        studentName: user.displayName || user.email,
        studentEmail: user.email,
        jobId: jobId,
        companyId: job.companyId,
        jobTitle: job.title,
        companyName: job.companyName,
        coverLetter: formData.coverLetter,
        resume: formData.resume,
        portfolio: formData.portfolio,
        availability: formData.availability,
        // Include both old and new profile structures for compatibility
        academicPerformance: user.academicPerformance || { gpa: user.highSchool?.gpa },
        highSchool: user.highSchool || {},
        workExperience: user.workExperience || [],
        certificates: user.certificates || [],
        field: user.field || user.highSchool?.subjects?.join(', ') || '',
        status: 'pending',
        createdAt: Timestamp.now()
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

            {/* Profile Summary */}
            <div className="alert alert-info">
              <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Your Profile Summary</h4>
              <p><strong>Academic Performance:</strong> {user.highSchool?.gpa || user.academicPerformance?.gpa || user.academicPerformance?.grade || 'Not provided'}</p>
              <p><strong>Field of Study:</strong> {user.highSchool?.subjects?.join(', ') || user.field || 'Not specified'}</p>
              <p><strong>Work Experience:</strong> {user.workExperience?.length || 0} positions</p>
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
