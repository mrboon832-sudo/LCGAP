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
    <div className="student-theme">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <Link to="/institutions" className="btn btn-outline btn-sm" style={{ marginBottom: 'var(--spacing-md)' }}>
          ← Back to Institutions
        </Link>

      <div className="card">
        <h1>{institution.name}</h1>
        <p className="text-muted" style={{ fontSize: '1.125rem' }}>
          📍 {institution.location || 'Location not specified'}
        </p>

        <div style={{ marginTop: 'var(--spacing-xl)' }}>
          <h3>About</h3>
          <p>{institution.profile || 'No description available.'}</p>
        </div>

        <div style={{ marginTop: 'var(--spacing-xl)' }}>
          <Link
            to={`/institutions/${institutionId}/apply`}
            className="btn btn-primary btn-lg"
          >
            Apply to This Institution
          </Link>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
        <div className="card-header">
          <h2 className="card-title">Faculties & Departments</h2>
        </div>
        {faculties.length === 0 ? (
          <div className="alert alert-info">
            <p>No faculties available yet.</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {faculties.map((faculty) => (
              <Link
                key={faculty.id}
                to={`/institutions/${institutionId}/faculties/${faculty.id}`}
                className="card"
                style={{ textDecoration: 'none', color: 'inherit', marginBottom: 0 }}
              >
                <h4>{faculty.name}</h4>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                  {faculty.description?.substring(0, 100) || 'No description'}
                </p>
                <div style={{ marginTop: 'var(--spacing-md)', color: 'var(--primary-color)', fontWeight: 500 }}>
                  View Courses →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
      </div>
    </div>
  );
};

export default InstitutionProfile;
