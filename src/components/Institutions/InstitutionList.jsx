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
        <div className="grid grid-2" style={{ marginTop: 'var(--spacing-lg)', gap: 'var(--spacing-lg)' }}>
          {filteredInstitutions.map((institution) => (
            <div 
              key={institution.id} 
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
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'white' }}>{institution.name}</h3>
              </div>
              <div style={{ padding: 'var(--spacing-lg)' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-sm)',
                  marginBottom: 'var(--spacing-md)',
                  color: 'var(--text-color)',
                  fontSize: '0.95rem'
                }}>
                  <span>📍</span>
                  <span>{institution.location || 'Location not specified'}</span>
                </div>
                <p style={{ 
                  color: 'var(--text-color)',
                  lineHeight: 1.6,
                  marginBottom: 'var(--spacing-lg)',
                  fontSize: '0.95rem'
                }}>
                  {institution.description?.substring(0, 150) || 'No description available'}
                  {institution.description?.length > 150 ? '...' : ''}
                </p>
                <div className="flex gap-md" style={{ marginTop: 'var(--spacing-lg)' }}>
                  <Link
                    to={`/institutions/${institution.id}`}
                    className="btn btn-primary btn-sm hover-lift transition-all"
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    📋 View Details
                  </Link>
                  <Link
                    to={`/institutions/${institution.id}/apply`}
                    className="btn btn-outline btn-sm hover-lift transition-all"
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    ✏️ Apply Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Footer />
      </div>
    </div>
  );
};

export default InstitutionList;
