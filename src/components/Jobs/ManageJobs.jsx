import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { createJob, updateJob, deleteJob } from '../../services/api';
import Footer from '../Layout/Footer';
import '../../styles/base.css';
import '../../styles/forms.css';

const ManageJobs = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    type: 'full-time',
    experienceLevel: 'entry',
    fieldOfWork: ''
  });

  // Comprehensive list of work fields
  const workFields = [
    'Accounting & Finance',
    'Administration & Office Support',
    'Agriculture & Farming',
    'Arts & Creative Design',
    'Automotive & Mechanics',
    'Banking & Financial Services',
    'Building & Construction',
    'Business Management',
    'Call Centre & Customer Service',
    'Carpentry & Woodwork',
    'Cleaning & Janitorial Services',
    'Community Services & Development',
    'Consulting & Strategy',
    'Education & Training',
    'Electrical & Electronics',
    'Engineering',
    'Healthcare & Medical',
    'Hospitality & Tourism',
    'Human Resources',
    'Information Technology',
    'Insurance',
    'Legal Services',
    'Logistics & Supply Chain',
    'Manufacturing & Production',
    'Marketing & Communications',
    'Mining & Resources',
    'Nursing & Aged Care',
    'Painting & Decorating',
    'Plumbing & HVAC',
    'Real Estate & Property',
    'Retail & Sales',
    'Science & Research',
    'Security & Safety',
    'Social Work & Counselling',
    'Sport & Recreation',
    'Telecommunications',
    'Trades & Services',
    'Transport & Delivery',
    'Welding & Metal Work',
    'Other'
  ];

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchJobs = async () => {
    try {
      const companyId = user?.companyId || user?.uid;
      
      if (!companyId) {
        setLoading(false);
        return;
      }
      
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, where('companyId', '==', companyId));
      const querySnapshot = await getDocs(q);
      
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setJobs(jobsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
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
      const companyId = user?.companyId || user?.uid;
      
      if (!companyId) {
        alert('Unable to create job: Company ID not found');
        return;
      }
      
      const jobData = {
        ...formData,
        companyName: user?.companyName || user?.displayName || 'Unknown Company'
      };

      if (editingJob) {
        await updateJob(editingJob.id, jobData);
      } else {
        await createJob(companyId, jobData);
      }

      setShowForm(false);
      setEditingJob(null);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        location: '',
        salary: '',
        type: 'full-time',
        experienceLevel: 'entry',
        fieldOfWork: ''
      });
      fetchJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job: ' + error.message);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      location: job.location || '',
      salary: job.salary || '',
      type: job.type || 'full-time',
      experienceLevel: job.experienceLevel || 'entry',
      fieldOfWork: job.fieldOfWork || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await deleteJob(jobId);
        fetchJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job: ' + error.message);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingJob(null);
    setFormData({
      title: '',
      description: '',
      requirements: '',
      location: '',
      salary: '',
      type: 'full-time',
      experienceLevel: 'entry',
      fieldOfWork: ''
    });
  };

  if (loading) {
    return (
      <div className="theme-company">
        <div className="container">
          <div className="spinner"></div>
          <p className="loading-text">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-company">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h1>Manage Job Postings</h1>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Create New Job
            </button>
          )}
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h2>{editingJob ? 'Edit Job' : 'Create New Job'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title" className="form-label form-label-required">Job Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label form-label-required">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="requirements" className="form-label form-label-required">Requirements</label>
                <textarea
                  id="requirements"
                  name="requirements"
                  className="form-textarea"
                  rows="4"
                  value={formData.requirements}
                  onChange={handleChange}
                  required
                  placeholder="List job requirements (one per line)"
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="location" className="form-label form-label-required">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="form-input"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="salary" className="form-label">Salary</label>
                  <input
                    type="text"
                    id="salary"
                    name="salary"
                    className="form-input"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g., LSL 15,000 - 20,000"
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="type" className="form-label form-label-required">Employment Type</label>
                  <select
                    id="type"
                    name="type"
                    className="form-select"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="experienceLevel" className="form-label form-label-required">Experience Level</label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    className="form-select"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    required
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="fieldOfWork" className="form-label form-label-required">
                  Field of Work
                </label>
                <select
                  id="fieldOfWork"
                  name="fieldOfWork"
                  className="form-select"
                  value={formData.fieldOfWork}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select field of work...</option>
                  {workFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
                <small className="text-muted">
                  Select the field that best describes this position. This helps match qualified candidates.
                </small>
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                <button type="submit" className="btn btn-primary">
                  {editingJob ? 'Update Job' : 'Create Job'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h2>Your Job Postings ({jobs.length})</h2>
          {jobs.length === 0 ? (
            <p className="text-muted">No job postings yet. Create your first job posting above!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Experience</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id}>
                      <td><strong>{job.title}</strong></td>
                      <td>{job.location}</td>
                      <td>
                        <span className="badge badge-primary">
                          {job.type}
                        </span>
                      </td>
                      <td>{job.experienceLevel}</td>
                      <td>{job.createdAt?.toDate().toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleEdit(job)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(job.id)}
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
      <Footer />
    </div>
  );
};

export default ManageJobs;
