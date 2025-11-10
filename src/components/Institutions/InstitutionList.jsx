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
    <div className="student-theme">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <h1>Institutions</h1>
        <p className="text-muted">Browse and apply to educational institutions</p>

      <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="search-input">
          <input
            type="text"
            className="form-input"
            placeholder="Search institutions by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-input-icon">🔍</span>
        </div>
      </div>

      {filteredInstitutions.length === 0 ? (
        <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
          <div className="alert alert-info">
            <p>No institutions found matching your search.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-2" style={{ marginTop: 'var(--spacing-lg)' }}>
          {filteredInstitutions.map((institution) => (
            <div key={institution.id} className="card">
              <div className="card-header">
                <h3 className="card-title">{institution.name}</h3>
              </div>
              <div>
                <p className="text-muted">
                  📍 {institution.location || 'Location not specified'}
                </p>
                <p style={{ marginTop: 'var(--spacing-md)' }}>
                  {institution.profile?.substring(0, 150) || 'No description available'}
                  {institution.profile?.length > 150 ? '...' : ''}
                </p>
                <div className="flex gap-md" style={{ marginTop: 'var(--spacing-lg)' }}>
                  <Link
                    to={`/institutions/${institution.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/institutions/${institution.id}/apply`}
                    className="btn btn-outline btn-sm"
                  >
                    Apply Now
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
