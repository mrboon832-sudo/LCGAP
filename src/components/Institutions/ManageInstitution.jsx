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
      <div className="container">
        <div className="page-header">
          <h1>Manage Institution</h1>
          <p>Update your institution's information</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Basic Information */}
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-group">
                  <label htmlFor="name">Institution Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shortName">Short Name / Acronym</label>
                  <input
                    type="text"
                    id="shortName"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleChange}
                    placeholder="e.g., NUL, LCE"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Institution Type *</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="University">University</option>
                    <option value="College">College</option>
                    <option value="Technical Institute">Technical Institute</option>
                    <option value="Vocational School">Vocational School</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, District"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Physical Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Full address including postal code"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-section">
                <h3>Contact Information</h3>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="info@institution.edu"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+266 XXXX XXXX"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.institution.edu"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Brief description of your institution, programs offered, and unique features..."
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
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
