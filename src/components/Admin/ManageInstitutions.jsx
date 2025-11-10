import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const ManageInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'university',
    location: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    establishedYear: ''
  });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'institutions'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInstitutions(data);
    } catch (err) {
      console.error('Error fetching institutions:', err);
      setError('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (institution = null) => {
    if (institution) {
      setEditingInstitution(institution);
      setFormData({
        name: institution.name || '',
        type: institution.type || 'university',
        location: institution.location || '',
        description: institution.description || '',
        email: institution.contactInfo?.email || '',
        phone: institution.contactInfo?.phone || '',
        website: institution.contactInfo?.website || '',
        establishedYear: institution.establishedYear || ''
      });
    } else {
      setEditingInstitution(null);
      setFormData({
        name: '',
        type: 'university',
        location: '',
        description: '',
        email: '',
        phone: '',
        website: '',
        establishedYear: ''
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingInstitution(null);
    setFormData({
      name: '',
      type: 'university',
      location: '',
      description: '',
      email: '',
      phone: '',
      website: '',
      establishedYear: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const institutionData = {
        name: formData.name,
        type: formData.type,
        location: formData.location,
        description: formData.description,
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          website: formData.website
        },
        establishedYear: formData.establishedYear,
        updatedAt: serverTimestamp()
      };

      if (editingInstitution) {
        // Update existing institution
        await updateDoc(doc(db, 'institutions', editingInstitution.id), institutionData);
        setSuccess('Institution updated successfully');
      } else {
        // Add new institution
        institutionData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'institutions'), institutionData);
        setSuccess('Institution added successfully');
      }

      await fetchInstitutions();
      setTimeout(() => {
        closeModal();
        setSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Error saving institution:', err);
      setError('Failed to save institution');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also delete all associated faculties and courses.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'institutions', id));
      setSuccess('Institution deleted successfully');
      await fetchInstitutions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting institution:', err);
      setError('Failed to delete institution');
    }
  };

  if (loading) {
    return (
      <div className="theme-admin">
        <div className="container">
          <div className="spinner"></div>
          <p className="loading-text">Loading institutions...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="theme-admin">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h1>Manage Institutions</h1>
          <button className="btn btn-primary" onClick={() => openModal()}>
            + Add Institution
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Institutions Table */}
        <div className="card">
          {institutions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <p className="text-muted">No institutions found. Add your first institution.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Location</th>
                    <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Contact</th>
                    <th style={{ padding: 'var(--spacing-sm)', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.map(institution => (
                    <tr key={institution.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 'var(--spacing-sm)' }}>
                        <strong>{institution.name}</strong>
                      </td>
                      <td style={{ padding: 'var(--spacing-sm)' }}>
                        <span className="badge">{institution.type}</span>
                      </td>
                      <td style={{ padding: 'var(--spacing-sm)' }}>{institution.location}</td>
                      <td style={{ padding: 'var(--spacing-sm)', fontSize: '0.875rem' }}>
                        {institution.contactInfo?.email || 'N/A'}
                      </td>
                      <td style={{ padding: 'var(--spacing-sm)', textAlign: 'center' }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => openModal(institution)}
                          style={{ marginRight: 'var(--spacing-xs)' }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(institution.id, institution.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{editingInstitution ? 'Edit Institution' : 'Add New Institution'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Institution Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select
                    name="type"
                    className="form-input"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="university">University</option>
                    <option value="college">College</option>
                    <option value="technical">Technical Institute</option>
                    <option value="vocational">Vocational School</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Established Year</label>
                  <input
                    type="number"
                    name="establishedYear"
                    className="form-input"
                    value={formData.establishedYear}
                    onChange={handleInputChange}
                    min="1800"
                    max="2030"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location *</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-input"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    name="website"
                    className="form-input"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://"
                  />
                </div>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end', marginTop: 'var(--spacing-lg)' }}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingInstitution ? 'Update' : 'Add'} Institution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ManageInstitutions;
