import React, { useState, useEffect } from 'react';
import { applyToCourse, getInstitution, getCourses } from '../../services/api';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Footer from '../Layout/Footer';
import '../../styles/base.css';
import '../../styles/forms.css';

const ApplyForm = ({ user }) => {
  const { institutionId } = useParams();
  const [searchParams] = useSearchParams();
  const courseIdFromUrl = searchParams.get('courseId');
  
  const [institution, setInstitution] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courseIdFromUrl || '');
  const [formData, setFormData] = useState({
    motivation: '',
    previousEducation: '',
    additionalInfo: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institutionId]);

  const loadData = async () => {
    try {
      const [instData, coursesData] = await Promise.all([
        getInstitution(institutionId),
        getCourses({ institutionId })
      ]);
      setInstitution(instData);
      setCourses(coursesData);
      if (courseIdFromUrl && coursesData.find(c => c.id === courseIdFromUrl)) {
        setSelectedCourse(courseIdFromUrl);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load institution data');
    } finally {
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
    
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    if (!formData.motivation.trim()) {
      setError('Please provide your motivation');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await applyToCourse(user.id, institutionId, selectedCourse, formData);
      navigate('/applications', {
        state: { success: 'Application submitted successfully!' }
      });
    } catch (err) {
      console.error('Application error:', err);
      setError(err.message || 'Failed to submit application. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="student-theme">
        <div className="container">
          <div className="spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  return (
    <div className="student-theme">
      <div className="container-narrow" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Apply to Institution</h2>
          </div>

        <div className="alert alert-info">
          <p><strong>Institution:</strong> {institution?.name || 'Loading...'}</p>
          {selectedCourseData && <p><strong>Selected Course:</strong> {selectedCourseData.name}</p>}
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
            <label htmlFor="course" className="form-label form-label-required">
              Select Course
            </label>
            <select
              id="course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="form-select"
              required
            >
              <option value="">-- Select a Course --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} - {course.code}
                </option>
              ))}
            </select>
          </div>
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
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ApplyForm;
