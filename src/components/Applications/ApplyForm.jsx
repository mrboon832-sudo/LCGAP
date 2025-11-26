import React, { useState, useEffect } from 'react';
import { applyToCourse, getInstitution, getCourses, getUserProfile } from '../../services/api';
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
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    motivation: '',
    // Primary School
    primarySchool: {
      name: '',
      location: '',
      yearCompleted: ''
    },
    // High School (auto-filled from profile)
    highSchool: {
      name: '',
      location: '',
      graduationYear: '',
      subjects: []
    },
    additionalInfo: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institutionId]);

  const loadData = async () => {
    try {
      const [instData, coursesData, profileData] = await Promise.all([
        getInstitution(institutionId),
        getCourses({ institutionId }),
        getUserProfile(user.id)
      ]);
      setInstitution(instData);
      setCourses(coursesData);
      setUserProfile(profileData);
      
      // Auto-fill high school data from profile
      if (profileData?.highSchool) {
        setFormData(prev => ({
          ...prev,
          highSchool: {
            name: profileData.highSchool.name || '',
            location: profileData.highSchool.location || '',
            graduationYear: profileData.highSchool.graduationYear || '',
            subjects: profileData.highSchool.subjects || []
          }
        }));
      }
      
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

  const handlePrimarySchoolChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      primarySchool: {
        ...prev.primarySchool,
        [name]: value
      }
    }));
  };

  // Calculate qualification score based on course requirements
  const calculateQualificationScore = (course) => {
    if (!course || !formData.highSchool.subjects.length) return 0;
    
    let score = 0;
    const subjects = formData.highSchool.subjects;
    
    // English is critical for most courses (20 points if C or higher)
    const english = subjects.find(s => s.name.toLowerCase().includes('english'));
    if (english) {
      const grade = english.grade || '';
      if (['A', 'B', 'C'].includes(grade.toUpperCase())) {
        score += 20;
      } else if (['D', 'E'].includes(grade.toUpperCase())) {
        score += 10;
      }
    }
    
    // Math for technical/science courses (20 points)
    if (course.name.toLowerCase().match(/engineering|science|math|computer|tech|accounting/)) {
      const math = subjects.find(s => s.name.toLowerCase().includes('math'));
      if (math) {
        const grade = math.grade || '';
        if (['A', 'B', 'C'].includes(grade.toUpperCase())) {
          score += 20;
        } else if (['D', 'E'].includes(grade.toUpperCase())) {
          score += 10;
        }
      }
    }
    
    // Science for science/health courses (20 points)
    if (course.name.toLowerCase().match(/science|biology|chemistry|physics|health|nursing|medicine/)) {
      const science = subjects.find(s => 
        s.name.toLowerCase().includes('science') || 
        s.name.toLowerCase().includes('biology') ||
        s.name.toLowerCase().includes('chemistry') ||
        s.name.toLowerCase().includes('physics')
      );
      if (science) {
        const grade = science.grade || '';
        if (['A', 'B', 'C'].includes(grade.toUpperCase())) {
          score += 20;
        } else if (['D', 'E'].includes(grade.toUpperCase())) {
          score += 10;
        }
      }
    }
    
    // Overall GPA (40 points) - High school grades are worth 90% total
    const avgGrade = subjects.reduce((sum, s) => {
      const gradePoints = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };
      return sum + (gradePoints[s.grade?.toUpperCase()] || 0);
    }, 0) / subjects.length;
    
    score += (avgGrade / 5) * 40;
    
    // Certificates contribute only 10%
    const certCount = userProfile?.certificates?.length || 0;
    score += Math.min(certCount * 2, 10);
    
    return Math.round(score);
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

    if (!formData.highSchool.name || formData.highSchool.subjects.length === 0) {
      setError('High school information is required. Please complete your profile first.');
      return;
    }

    setError('');
    setWarning('');
    setSubmitting(true);

    try {
      const selectedCourseData = courses.find(c => c.id === selectedCourse);
      const qualificationScore = calculateQualificationScore(selectedCourseData);
      
      await applyToCourse(user.id, institutionId, selectedCourse, {
        ...formData,
        qualificationScore,
        gpa: userProfile?.gpa || 0,
        facultyId: selectedCourseData?.facultyId || '',
        facultyName: selectedCourseData?.facultyName || '',
        courseName: selectedCourseData?.name || '',
        institutionName: institution?.name || '',
        studentEmail: user.email || '',
        studentName: userProfile?.name || user.displayName || ''
      });
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
          {selectedCourseData && (
            <>
              <p><strong>Selected Course:</strong> {selectedCourseData.name}</p>
              <p style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.9rem' }}>
                <strong>Qualification Score:</strong> {calculateQualificationScore(selectedCourseData)}/100
              </p>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                High school grades: 90% | Certificates: 10%
              </p>
            </>
          )}
          <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-sm)' }}>
            You can apply to a maximum of 2 courses per institution.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {warning && (
          <div className="alert alert-warning">
            {warning}
          </div>
        )}

        {courses.length === 0 && (
          <div className="alert alert-warning">
            No courses available at this institution. Please contact the institution for more information.
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
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                const course = courses.find(c => c.id === e.target.value);
                if (course) {
                  const score = calculateQualificationScore(course);
                  if (score < 40) {
                    setWarning('Your qualification score is low. Consider improving your high school grades or adding relevant certificates.');
                  } else {
                    setWarning('');
                  }
                }
              }}
              className="form-select"
              required
            >
              <option value="">-- Select a Course --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}{course.code ? ` - ${course.code}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Primary School Section */}
          <div style={{ 
            padding: 'var(--spacing-md)', 
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.1rem' }}>
              Primary School Information
            </h3>
            
            <div className="form-group">
              <label htmlFor="primarySchoolName" className="form-label form-label-required">
                Primary School Name
              </label>
              <input
                type="text"
                id="primarySchoolName"
                name="name"
                className="form-input"
                value={formData.primarySchool.name}
                onChange={handlePrimarySchoolChange}
                required
                placeholder="e.g., Maseru Primary School"
              />
            </div>

            <div className="form-group">
              <label htmlFor="primarySchoolLocation" className="form-label form-label-required">
                Location
              </label>
              <input
                type="text"
                id="primarySchoolLocation"
                name="location"
                className="form-input"
                value={formData.primarySchool.location}
                onChange={handlePrimarySchoolChange}
                required
                placeholder="e.g., Maseru"
              />
            </div>

            <div className="form-group">
              <label htmlFor="primaryYearCompleted" className="form-label form-label-required">
                Year Completed
              </label>
              <input
                type="number"
                id="primaryYearCompleted"
                name="yearCompleted"
                className="form-input"
                value={formData.primarySchool.yearCompleted}
                onChange={handlePrimarySchoolChange}
                required
                min="1950"
                max={new Date().getFullYear()}
                placeholder="e.g., 2018"
              />
            </div>
          </div>

          {/* High School Section - Auto-filled */}
          <div style={{ 
            padding: 'var(--spacing-md)', 
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.1rem' }}>
              High School Information
              <span style={{ fontSize: '0.875rem', color: 'var(--success-color)', marginLeft: 'var(--spacing-sm)' }}>
                ✓ Auto-filled from profile
              </span>
            </h3>
            
            {formData.highSchool.name ? (
              <>
                <p><strong>School:</strong> {formData.highSchool.name}</p>
                {formData.highSchool.location && <p><strong>Location:</strong> {formData.highSchool.location}</p>}
                {formData.highSchool.graduationYear && <p><strong>Graduation Year:</strong> {formData.highSchool.graduationYear}</p>}
                
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <strong>Subjects & Grades ({formData.highSchool.subjects.length}):</strong>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 'var(--spacing-sm)',
                    marginTop: 'var(--spacing-sm)'
                  }}>
                    {formData.highSchool.subjects.map((subject, index) => (
                      <div key={index} style={{
                        padding: 'var(--spacing-sm)',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <strong>{subject.name}</strong>: {subject.grade}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedCourseData && (
                  <div className="alert alert-info" style={{ marginTop: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                    <strong>Course Requirements:</strong>
                    <ul style={{ marginTop: 'var(--spacing-xs)', marginBottom: 0, paddingLeft: 'var(--spacing-lg)' }}>
                      <li>English: C or higher (Critical for all courses)</li>
                      {selectedCourseData.name.toLowerCase().match(/engineering|science|math|computer|tech|accounting/) && (
                        <li>Mathematics: C or higher (Required for technical courses)</li>
                      )}
                      {selectedCourseData.name.toLowerCase().match(/science|biology|chemistry|physics|health|nursing|medicine/) && (
                        <li>Science subjects: C or higher (Required for science/health courses)</li>
                      )}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="alert alert-warning">
                <p>⚠️ Please complete your high school information in your profile before applying.</p>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => navigate('/profile')}
                  style={{ marginTop: 'var(--spacing-sm)' }}
                >
                  Complete Profile
                </button>
              </div>
            )}
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
            <label htmlFor="additionalInfo" className="form-label">
              Additional Information
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              className="form-textarea"
              value={formData.additionalInfo}
              onChange={handleChange}
              rows="3"
              placeholder="Certificates, achievements, work experience, etc. (Contributes up to 10% to qualification score)"
            />
            <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>
              Note: Certificates contribute a maximum of 10% to your qualification score. High school grades are the primary factor (90%).
            </p>
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
