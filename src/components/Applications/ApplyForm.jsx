import React, { useState } from 'react';
import { applyToCourse } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Footer from '../Layout/Footer';
import '../../styles/base.css';
import '../../styles/forms.css';

const ApplyForm = ({ user, institutionId, courseId, courseName, institutionName }) => {
  const [formData, setFormData] = useState({
    motivation: '',
    previousEducation: '',
    additionalInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    setLoading(true);

    try {
      await applyToCourse(user.uid, institutionId, courseId, formData);
      navigate('/applications', {
        state: { success: 'Application submitted successfully!' }
      });
    } catch (err) {
      console.error('Application error:', err);
      setError(err.message || 'Failed to submit application. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="student-theme">
      <div className="container-narrow" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Apply to Course</h2>
          </div>

        <div className="alert alert-info">
          <p><strong>Institution:</strong> {institutionName}</p>
          <p><strong>Course:</strong> {courseName}</p>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-sm)' }}>
            You can apply to a maximum of 2 courses per institution.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="motivation" className="form-label form-label-required">
              Why do you want to pursue this course?
            </label>
            <textarea
              id="motivation"
              name="motivation"
              className="form-textarea"
              value={formData.motivation}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Explain your motivation and interest in this course..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="previousEducation" className="form-label form-label-required">
              Previous Education Background
            </label>
            <textarea
              id="previousEducation"
              name="previousEducation"
              className="form-textarea"
              value={formData.previousEducation}
              onChange={handleChange}
              required
              rows="4"
              placeholder="List your qualifications, schools attended, grades..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="additionalInfo" className="form-label">
              Additional Information (Optional)
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              className="form-textarea"
              value={formData.additionalInfo}
              onChange={handleChange}
              rows="3"
              placeholder="Any other relevant information..."
            />
          </div>

          <div className="form-actions form-actions-right">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
      <Footer />
      </div>
    </div>
  );
};

export default ApplyForm;
