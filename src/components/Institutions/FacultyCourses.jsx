import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getInstitution, getFaculty, getCourses } from '../../services/api';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const FacultyCourses = () => {
  const { institutionId, facultyId } = useParams();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [institutionId, facultyId]);

  const loadData = async () => {
    try {
      const [instData, facultyData, coursesData] = await Promise.all([
        getInstitution(institutionId),
        getFaculty(institutionId, facultyId),
        getCourses({ institutionId, facultyId })
      ]);
      
      setInstitution(instData);
      setFaculty(facultyData);
      setCourses(coursesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-student">
        <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
          <div className="spinner"></div>
          <p className="loading-text">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="theme-student">
        <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
          <div className="alert alert-danger">{error}</div>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-student">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <Link to="/institutions" style={{ color: 'var(--primary-color)' }}>
            Institutions
          </Link>
          <span style={{ margin: '0 var(--spacing-xs)' }}>→</span>
          <Link to={`/institutions/${institutionId}`} style={{ color: 'var(--primary-color)' }}>
            {institution?.name}
          </Link>
          <span style={{ margin: '0 var(--spacing-xs)' }}>→</span>
          <span>{faculty?.name}</span>
        </div>

        {/* Header */}
        <div className="card gradient-bg" style={{ 
          padding: 'var(--spacing-xl)',
          color: 'white',
          marginBottom: 'var(--spacing-xl)',
          borderRadius: '20px'
        }}>
          <h1 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', fontSize: '2rem' }}>
            📚 {faculty?.name}
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '1rem' }}>
            {institution?.name}
          </p>
          {faculty?.description && (
            <p style={{ margin: 0, marginTop: 'var(--spacing-md)', opacity: 0.9, fontSize: '0.95rem' }}>
              {faculty.description}
            </p>
          )}
        </div>

        {/* Courses List */}
        {courses.length === 0 ? (
          <div className="card shadow-md" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📖</div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No Courses Available</h3>
            <p className="text-muted">This faculty has no courses available at the moment.</p>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate(-1)}
              style={{ marginTop: 'var(--spacing-md)' }}
            >
              Back to Faculty List
            </button>
          </div>
        ) : (
          <>
            <div style={{ 
              marginBottom: 'var(--spacing-md)', 
              color: 'var(--text-secondary)',
              fontSize: '0.95rem'
            }}>
              Found {courses.length} course{courses.length !== 1 ? 's' : ''}
            </div>
            
            <div className="grid grid-2" style={{ gap: 'var(--spacing-lg)' }}>
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className="card shadow-md hover-lift transition-all"
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    padding: 'var(--spacing-lg)',
                    color: 'white'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'white' }}>
                      {course.name}
                    </h3>
                    {course.code && (
                      <p style={{ margin: 0, marginTop: 'var(--spacing-xs)', opacity: 0.9, fontSize: '0.9rem' }}>
                        Code: {course.code}
                      </p>
                    )}
                  </div>

                  <div style={{ padding: 'var(--spacing-lg)' }}>
                    {course.level && (
                      <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {course.level}
                        </span>
                      </div>
                    )}

                    {course.duration && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'var(--spacing-sm)',
                        marginBottom: 'var(--spacing-sm)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem'
                      }}>
                        <span>⏱️</span>
                        <span>Duration: {course.duration}</span>
                      </div>
                    )}

                    {course.description && (
                      <p style={{ 
                        color: 'var(--text-color)',
                        lineHeight: 1.6,
                        marginBottom: 'var(--spacing-md)',
                        fontSize: '0.95rem'
                      }}>
                        {course.description.substring(0, 150)}
                        {course.description.length > 150 && '...'}
                      </p>
                    )}

                    {course.requirements && (
                      <div style={{ 
                        backgroundColor: '#fef3c7',
                        padding: 'var(--spacing-sm)',
                        borderRadius: '8px',
                        marginBottom: 'var(--spacing-md)',
                        fontSize: '0.875rem'
                      }}>
                        <strong style={{ color: '#92400e' }}>Requirements:</strong>
                        <p style={{ margin: 0, marginTop: 'var(--spacing-xs)', color: '#78350f' }}>
                          {course.requirements.substring(0, 100)}
                          {course.requirements.length > 100 && '...'}
                        </p>
                      </div>
                    )}

                    <Link
                      to={`/institutions/${institutionId}/apply?courseId=${course.id}`}
                      className="btn btn-primary"
                      style={{ width: '100%', textAlign: 'center' }}
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FacultyCourses;
