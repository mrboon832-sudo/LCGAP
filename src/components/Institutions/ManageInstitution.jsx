import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const ManageInstitution = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [institutionId, setInstitutionId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    type: '',
    location: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadInstitution();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInstitution = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      // Get user profile to find institutionId
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        setError('User profile not found');
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      if (!userData.institutionId) {
        setError('No institution associated with this account');
        setLoading(false);
        return;
      }

      setInstitutionId(userData.institutionId);

      // Load institution data
      const instDoc = await getDoc(doc(db, 'institutions', userData.institutionId));
      if (instDoc.exists()) {
        const data = instDoc.data();
        setFormData({
          name: data.name || '',
          shortName: data.shortName || '',
          type: data.type || '',
          location: data.location || '',
          description: data.description || '',
          website: data.website || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      } else {
        setError('Institution not found');
      }
    } catch (err) {
      console.error('Error loading institution:', err);
      setError('Failed to load institution details');
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
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Institution name is required');
      return;
    }
    if (!formData.type) {
      setError('Institution type is required');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateDoc(doc(db, 'institutions', institutionId), {
        name: formData.name.trim(),
        shortName: formData.shortName.trim(),
        type: formData.type,
        location: formData.location.trim(),
        description: formData.description.trim(),
        website: formData.website.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        updatedAt: new Date()
      });

      setSuccess('Institution details updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error updating institution:', err);
      setError('Failed to update institution details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-institute">
        <div className="container">
          <div className="loading">Loading institution details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="theme-institute">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-xl)' }}>
        {/* Header with Gradient */}
        <div className="card gradient-bg" style={{ 
          padding: 'var(--spacing-xl)',
          color: 'white',
          marginBottom: 'var(--spacing-xl)',
          borderRadius: '20px'
        }}>
          <h1 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', fontSize: '2rem' }}>
            🏛️ Manage Institution
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '1.1rem' }}>
            Update your institution's information and settings
          </p>
        </div>

        {error && (
          <div className="alert alert-danger shadow-md" style={{ 
            borderRadius: '12px',
            marginBottom: 'var(--spacing-lg)'
          }}>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success shadow-md" style={{ 
            borderRadius: '12px',
            marginBottom: 'var(--spacing-lg)'
          }}>
            {success}
          </div>
        )}

        <div className="card shadow-md" style={{ borderRadius: '16px' }}>
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <div className="card shadow-sm" style={{ 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                borderRadius: '12px',
                padding: 'var(--spacing-lg)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <h3 style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-sm)',
                  margin: 0,
                  marginBottom: 'var(--spacing-lg)',
                  fontSize: '1.3rem',
                  color: 'var(--primary-color)'
                }}>
                  <span className="icon-badge" style={{ fontSize: '1.3rem' }}>📋</span>
                  Basic Information
                </h3>
                
                <div className="form-group">
                  <label htmlFor="name" className="form-label form-label-required">Institution Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="shortName" className="form-label">Short Name / Acronym</label>
                    <input
                      type="text"
                      id="shortName"
                      name="shortName"
                      className="form-input"
                      value={formData.shortName}
                      onChange={handleChange}
                      placeholder="e.g., NUL, LCE"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="type" className="form-label form-label-required">Institution Type</label>
                    <select
                      id="type"
                      name="type"
                      className="form-input"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select type</option>
                      <option value="University">🎓 University</option>
                      <option value="College">🏫 College</option>
                      <option value="Technical Institute">🔧 Technical Institute</option>
                      <option value="Vocational School">⚙️ Vocational School</option>
                      <option value="Other">📚 Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location" className="form-label form-label-required">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="form-input"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, District"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">Physical Address</label>
                  <textarea
                    id="address"
                    name="address"
                    className="form-textarea"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Full address including postal code"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <div className="card shadow-sm" style={{ 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                borderRadius: '12px',
                padding: 'var(--spacing-lg)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <h3 style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-sm)',
                  margin: 0,
                  marginBottom: 'var(--spacing-lg)',
                  fontSize: '1.3rem',
                  color: 'var(--primary-color)'
                }}>
                  <span className="icon-badge" style={{ fontSize: '1.3rem' }}>📞</span>
                  Contact Information
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label form-label-required">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="info@institution.edu"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+266 XXXX XXXX"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="website" className="form-label">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    className="form-input"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.institution.edu"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-textarea"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Brief description of your institution, programs offered, and unique features..."
                  />
                </div>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: 'var(--spacing-md)', 
              justifyContent: 'flex-end',
              marginTop: 'var(--spacing-xl)',
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--background-secondary)',
              borderRadius: '12px'
            }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-outline hover-scale-sm"
                disabled={saving}
              >
                ❌ Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg hover-scale-sm"
                disabled={saving}
                style={{ minWidth: '160px' }}
              >
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ManageInstitution;
