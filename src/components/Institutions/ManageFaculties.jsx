import React, { useState, useEffect } from 'react';
import { getFaculties, createFaculty, updateFaculty, deleteFaculty } from '../../services/api';
import Footer from '../Layout/Footer';
import '../../styles/base.css';
import '../../styles/forms.css';

const ManageFaculties = ({ user, institutionId }) => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dean: ''
  });

  useEffect(() => {
    if (institutionId) {
      fetchFaculties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institutionId]);

  const fetchFaculties = async () => {
    try {
      const data = await getFaculties(institutionId);
      setFaculties(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await updateFaculty(institutionId, editingFaculty.id, formData);
      } else {
        await createFaculty(institutionId, formData);
      }

      setShowForm(false);
      setEditingFaculty(null);
      setFormData({ name: '', description: '', dean: '' });
      fetchFaculties();
    } catch (error) {
      console.error('Error saving faculty:', error);
      alert('Failed to save faculty: ' + error.message);
    }
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name || '',
      description: faculty.description || '',
      dean: faculty.dean || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (facultyId) => {
    if (window.confirm('Are you sure you want to delete this faculty? This will also delete all courses under it.')) {
      try {
        await deleteFaculty(institutionId, facultyId);
        fetchFaculties();
      } catch (error) {
        console.error('Error deleting faculty:', error);
        alert('Failed to delete faculty: ' + error.message);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFaculty(null);
    setFormData({ name: '', description: '', dean: '' });
  };

  if (loading) {
    return (
      <div className="theme-institute">
        <div className="container">
          <div className="spinner"></div>
          <p className="loading-text">Loading faculties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-institute">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h1>Manage Faculties</h1>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Create New Faculty
            </button>
          )}
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h2>{editingFaculty ? 'Edit Faculty' : 'Create New Faculty'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label form-label-required">Faculty Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Faculty of Science"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the faculty"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dean" className="form-label">Dean Name</label>
                <input
                  type="text"
                  id="dean"
                  name="dean"
                  className="form-input"
                  value={formData.dean}
                  onChange={handleChange}
                  placeholder="Name of the faculty dean"
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                <button type="submit" className="btn btn-primary">
                  {editingFaculty ? 'Update Faculty' : 'Create Faculty'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h2>Your Faculties ({faculties.length})</h2>
          {faculties.length === 0 ? (
            <p className="text-muted">No faculties yet. Create your first faculty above!</p>
          ) : (
            <div className="grid grid-2" style={{ marginTop: 'var(--spacing-md)' }}>
              {faculties.map(faculty => (
                <div key={faculty.id} className="card" style={{ marginBottom: 0 }}>
                  <h3>{faculty.name}</h3>
                  {faculty.dean && (
                    <p className="text-muted"><strong>Dean:</strong> {faculty.dean}</p>
                  )}
                  {faculty.description && (
                    <p style={{ fontSize: '0.9rem', marginTop: 'var(--spacing-sm)' }}>
                      {faculty.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'var(--spacing-md)' }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(faculty)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(faculty.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ManageFaculties;
