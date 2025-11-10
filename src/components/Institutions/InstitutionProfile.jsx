import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInstitution, getFaculties } from '../../services/api';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const InstitutionProfile = () => {
  const { institutionId } = useParams();
  const [institution, setInstitution] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institutionId]);

  const fetchData = async () => {
    try {
      const [instData, facultiesData] = await Promise.all([
        getInstitution(institutionId),
        getFaculties(institutionId)
      ]);
      setInstitution(instData);
      setFaculties(facultiesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching institution:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
        <p className="loading-text">Loading institution...</p>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <div className="alert alert-danger">
          <h3>Institution Not Found</h3>
          <p>The institution you're looking for doesn't exist.</p>
          <Link to="/institutions" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
            Back to Institutions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-student">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-xl)' }}>
        <Link to="/institutions" className="btn btn-outline btn-sm hover-scale-sm" style={{ marginBottom: 'var(--spacing-md)' }}>
          ← Back to Institutions
        </Link>

        {/* Header with Gradient */}
        <div className="card gradient-bg" style={{ 
          padding: 'var(--spacing-xl)',
          color: 'white',
          marginBottom: 'var(--spacing-xl)',
          borderRadius: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', fontSize: '2.5rem' }}>
                🏛️ {institution.name}
              </h1>
              <p style={{ margin: 0, opacity: 0.95, fontSize: '1.2rem', marginBottom: 'var(--spacing-md)' }}>
                📍 {institution.location || 'Location not specified'}
              </p>
              {institution.profile && (
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem', lineHeight: 1.6 }}>
                  {institution.profile}
                </p>
              )}
            </div>
            <Link
              to={`/institutions/${institutionId}/apply`}
              className="btn btn-lg"
              style={{ 
                backgroundColor: 'white',
                color: 'var(--primary-color)',
                fontWeight: 600,
                padding: 'var(--spacing-md) var(--spacing-xl)',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap'
              }}
            >
              📝 Apply Now
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-3" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              🎓
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {faculties.length}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Faculties</div>
          </div>

          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              📚
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {institution.type || 'University'}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Type</div>
          </div>

          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              ✨
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              Active
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Status</div>
          </div>
        </div>

      <div className="card shadow-md" style={{ borderRadius: '16px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
          padding: 'var(--spacing-lg)',
          borderRadius: '16px 16px 0 0',
          borderBottom: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <h2 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--spacing-sm)',
            margin: 0,
            fontSize: '1.5rem',
            color: 'var(--primary-color)'
          }}>
            <span className="icon-badge" style={{ fontSize: '1.5rem' }}>🏫</span>
            Faculties & Departments
            {faculties.length > 0 && (
              <span style={{ 
                marginLeft: 'auto',
                fontSize: '1rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px'
              }}>
                {faculties.length}
              </span>
            )}
          </h2>
        </div>
        <div style={{ padding: 'var(--spacing-lg)' }}>
        {faculties.length === 0 ? (
          <div className="alert alert-info" style={{ borderRadius: '12px' }}>
            <p style={{ margin: 0 }}>📋 No faculties available yet.</p>
          </div>
        ) : (
          <div className="grid grid-2" style={{ gap: 'var(--spacing-lg)' }}>
            {faculties.map((faculty) => (
              <Link
                key={faculty.id}
                to={`/institutions/${institutionId}/faculties/${faculty.id}`}
                className="card shadow-sm hover-lift transition-all"
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit', 
                  marginBottom: 0,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, white 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.15)'
                }}
              >
                <div style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                  borderRadius: '12px 12px 0 0',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  <h4 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.2rem' }}>
                    📚 {faculty.name}
                  </h4>
                </div>
                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.5, marginBottom: 'var(--spacing-md)' }}>
                  {faculty.description?.substring(0, 100) || 'No description'}
                  {faculty.description?.length > 100 && '...'}
                </p>
                <div style={{ 
                  marginTop: 'auto',
                  color: 'var(--primary-color)', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)'
                }}>
                  View Courses 
                  <span style={{ fontSize: '1.2rem' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        </div>
      </div>
      <Footer />
      </div>
    </div>
  );
};

export default InstitutionProfile;
