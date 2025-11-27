import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInstitutions } from '../../services/api';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const InstitutionList = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const data = await getInstitutions();
      setInstitutions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setLoading(false);
    }
  };

  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
        <p className="loading-text">Loading institutions...</p>
      </div>
    );
  }

  return (
    <div className="theme-student">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        {/* Header with Stats */}
        <div className="card gradient-bg" style={{ 
          padding: 'var(--spacing-xl)',
          color: 'white',
          marginBottom: 'var(--spacing-xl)',
          borderRadius: '20px'
        }}>
          <h1 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', fontSize: '2rem' }}>
            🏫 Explore Institutions
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '1.1rem' }}>
            Discover {institutions.length} educational institutions in Lesotho
          </p>
        </div>

      {/* Enhanced Search Card */}
      <div className="card shadow-md" style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-lg)' }}>
        <div className="search-input">
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search institutions by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: 'var(--spacing-md)',
              fontSize: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              transition: 'all 0.3s ease'
            }}
          />
        </div>
        {searchTerm && (
          <p style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Found {filteredInstitutions.length} result{filteredInstitutions.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {filteredInstitutions.length === 0 ? (
        <div className="card shadow-md" style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-xl)' }}>
          <div style={{ 
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🔍</div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--text-color)' }}>No Institutions Found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search criteria</p>
          </div>
        </div>
      ) : (
        <div className="card shadow-md" style={{ marginTop: 'var(--spacing-lg)' }}>
          <h2>Institutions ({filteredInstitutions.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Institution Name</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstitutions.map((institution) => (
                  <tr key={institution.id}>
                    <td><strong>{institution.name}</strong></td>
                    <td>📍 {institution.location || 'Location not specified'}</td>
                    <td>
                      {institution.description?.substring(0, 100) || 'No description available'}
                      {institution.description?.length > 100 ? '...' : ''}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={`/institutions/${institution.id}`}
                          className="btn btn-sm btn-primary"
                        >
                          View
                        </Link>
                        <Link
                          to={`/institutions/${institution.id}/apply`}
                          className="btn btn-sm btn-success"
                        >
                          Apply
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Footer />
      </div>
    </div>
  );
};

export default InstitutionList;
