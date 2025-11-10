import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, active, suspended
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      // Fetch all users with company role
      const usersQuery = query(collection(db, 'users'), where('role', '==', 'company'));
      const snapshot = await getDocs(usersQuery);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompanies(data);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (companyId, newStatus) => {
    const statusMessages = {
      active: 'approve',
      suspended: 'suspend',
      rejected: 'reject'
    };

    if (!window.confirm(`Are you sure you want to ${statusMessages[newStatus]} this company?`)) {
      return;
    }

    try {
      await updateDoc(doc(db, 'users', companyId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setSuccess(`Company ${statusMessages[newStatus]}d successfully`);
      await fetchCompanies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating company status:', err);
      setError('Failed to update company status');
    }
  };

  const handleDelete = async (companyId, companyName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${companyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete company user account
      await deleteDoc(doc(db, 'users', companyId));
      
      // Note: In production, you should also delete related data (jobs, applications, etc.)
      
      setSuccess('Company deleted successfully');
      await fetchCompanies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting company:', err);
      setError('Failed to delete company');
    }
  };

  const viewDetails = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCompany(null);
  };

  const filteredCompanies = companies.filter(company => {
    if (filter === 'all') return true;
    return company.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      active: 'badge-success',
      suspended: 'badge-danger',
      rejected: 'badge-secondary'
    };
    return badges[status] || 'badge-secondary';
  };

  if (loading) {
    return (
      <div className="theme-admin">
        <div className="container">
          <div className="spinner"></div>
          <p className="loading-text">Loading companies...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="theme-admin">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <h1>Manage Companies</h1>
        <p className="text-muted">Approve, suspend, or delete company accounts</p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Filter Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-sm)', 
          marginTop: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-lg)',
          borderBottom: '2px solid var(--border-color)'
        }}>
          {['all', 'pending', 'active', 'suspended', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-md)',
                background: 'none',
                border: 'none',
                borderBottom: filter === status ? '2px solid var(--primary-color)' : '2px solid transparent',
                color: filter === status ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: filter === status ? 600 : 400,
                cursor: 'pointer',
                marginBottom: '-2px',
                textTransform: 'capitalize'
              }}
            >
              {status} ({companies.filter(c => status === 'all' || c.status === status).length})
            </button>
          ))}
        </div>

        {/* Companies Table */}
        <div className="card">
          {filteredCompanies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <p className="text-muted">No {filter !== 'all' ? filter : ''} companies found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Company Name</th>
                    <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Contact</th>
                    <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Industry</th>
                    <th style={{ padding: 'var(--spacing-sm)', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: 'var(--spacing-sm)', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map(company => (
                    <tr key={company.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 'var(--spacing-sm)' }}>
                        <strong>{company.companyName || company.displayName}</strong>
                      </td>
                      <td style={{ padding: 'var(--spacing-sm)', fontSize: '0.875rem' }}>
                        <div>{company.email}</div>
                        <div className="text-muted">{company.profile?.phone || 'N/A'}</div>
                      </td>
                      <td style={{ padding: 'var(--spacing-sm)' }}>
                        {company.profile?.industry || 'N/A'}
                      </td>
                      <td style={{ padding: 'var(--spacing-sm)', textAlign: 'center' }}>
                        <span className={`badge ${getStatusBadge(company.status)}`}>
                          {(company.status || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--spacing-sm)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => viewDetails(company)}
                          >
                            View
                          </button>
                          {company.status !== 'active' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleStatusChange(company.id, 'active')}
                            >
                              Approve
                            </button>
                          )}
                          {company.status !== 'suspended' && (
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => handleStatusChange(company.id, 'suspended')}
                            >
                              Suspend
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(company.id, company.companyName || company.displayName)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedCompany && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Company Details</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            <div style={{ padding: 'var(--spacing-md)' }}>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <h3>{selectedCompany.companyName || selectedCompany.displayName}</h3>
                <span className={`badge ${getStatusBadge(selectedCompany.status)}`}>
                  {(selectedCompany.status || 'pending').toUpperCase()}
                </span>
              </div>

              <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                <strong>Email:</strong> {selectedCompany.email}
              </div>
              
              {selectedCompany.profile?.phone && (
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <strong>Phone:</strong> {selectedCompany.profile.phone}
                </div>
              )}

              {selectedCompany.profile?.industry && (
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <strong>Industry:</strong> {selectedCompany.profile.industry}
                </div>
              )}

              {selectedCompany.profile?.location && (
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <strong>Location:</strong> {selectedCompany.profile.location}
                </div>
              )}

              {selectedCompany.profile?.website && (
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <strong>Website:</strong>{' '}
                  <a href={selectedCompany.profile.website} target="_blank" rel="noopener noreferrer">
                    {selectedCompany.profile.website}
                  </a>
                </div>
              )}

              {selectedCompany.profile?.description && (
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <strong>Description:</strong>
                  <p style={{ marginTop: 'var(--spacing-xs)', color: 'var(--text-muted)' }}>
                    {selectedCompany.profile.description}
                  </p>
                </div>
              )}

              <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <div>Registered: {selectedCompany.createdAt ? new Date(selectedCompany.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end', padding: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-outline" onClick={closeModal}>
                Close
              </button>
              {selectedCompany.status !== 'active' && (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    handleStatusChange(selectedCompany.id, 'active');
                    closeModal();
                  }}
                >
                  Approve
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ManageCompanies;
