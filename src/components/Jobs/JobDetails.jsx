import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const JobDetails = ({ user }) => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobDetails = async () => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobSnap = await getDoc(jobRef);
      
      if (jobSnap.exists()) {
        setJob({ id: jobSnap.id, ...jobSnap.data() });
      } else {
        setError('Job not found');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to load job details. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const formatSalary = (salary) => {
    if (!salary) return 'Competitive';
    if (typeof salary === 'string') return salary;
    if (typeof salary === 'object') {
      const { currency = 'LSL', min = 0, max = 0 } = salary;
      if (min && max) {
        return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
      }
      return `${currency} ${min || max}`;
    }
    return 'Competitive';
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <div className="spinner"></div>
        <p className="loading-text">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <div className="alert alert-danger">
          {error || 'Job not found'}
        </div>
        <Link to="/jobs" className="btn btn-primary">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="student-theme">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <Link to="/jobs" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
            ← Back to Jobs
          </Link>
        </div>

      {/* Job Header */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>{job.title}</h1>
            <p className="text-muted" style={{ fontSize: '1.125rem', marginBottom: 'var(--spacing-sm)' }}>
              {job.companyName || 'Company'}
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{job.type || 'Full-time'}</span>
              {job.remote && <span className="badge badge-success">Remote</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: 'var(--spacing-xs)' }}>
              {formatSalary(job.salary)}
            </p>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>per month</p>
          </div>
        </div>

        {/* Job Meta Info */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 'var(--spacing-md)',
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--background-color)',
          borderRadius: 'var(--border-radius)',
          marginBottom: 'var(--spacing-md)'
        }}>
          {job.location && (
            <div>
              <strong style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>📍 Location</strong>
              <p>{job.location}</p>
            </div>
          )}
          {job.deadline && (
            <div>
              <strong style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>📅 Application Deadline</strong>
              <p>{new Date(job.deadline).toLocaleDateString()}</p>
            </div>
          )}
          {job.experience && (
            <div>
              <strong style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>💼 Experience</strong>
              <p>{job.experience}</p>
            </div>
          )}
          {job.createdAt && (
            <div>
              <strong style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>📤 Posted</strong>
              <p>{new Date(job.createdAt.seconds * 1000).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Apply Button */}
        {user?.role === 'student' && (
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <Link to={`/jobs/${job.id}/apply`} className="btn btn-primary">
              Apply for this Position
            </Link>
            <button className="btn btn-outline">Save Job</button>
          </div>
        )}

        {user?.role === 'company' && user?.companyId === job.companyId && (
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <Link to={`/jobs/${job.id}/edit`} className="btn btn-primary">
              Edit Job
            </Link>
            <button className="btn btn-danger">Delete Job</button>
          </div>
        )}
      </div>

      {/* Job Description */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Job Description</h3>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
          {job.description || 'No description provided.'}
        </div>
      </div>

      {/* Requirements */}
      {job.requirements && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Requirements</h3>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {typeof job.requirements === 'string' 
              ? job.requirements 
              : job.requirements.join('\n')}
          </div>
        </div>
      )}

      {/* Responsibilities */}
      {job.responsibilities && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Responsibilities</h3>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {typeof job.responsibilities === 'string' 
              ? job.responsibilities 
              : job.responsibilities.join('\n')}
          </div>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Benefits</h3>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {typeof job.benefits === 'string' 
              ? job.benefits 
              : job.benefits.join('\n')}
          </div>
        </div>
      )}

      {/* Company Info */}
      {job.companyInfo && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>About {job.companyName || 'the Company'}</h3>
          <p style={{ lineHeight: '1.6' }}>
            {job.companyInfo}
          </p>
        </div>
      )}

      {/* Contact Information */}
      {(job.contactEmail || job.contactPhone) && (
        <div className="card">
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Contact Information</h3>
          {job.contactEmail && (
            <p style={{ marginBottom: 'var(--spacing-sm)' }}>
              <strong>Email:</strong> <a href={`mailto:${job.contactEmail}`}>{job.contactEmail}</a>
            </p>
          )}
          {job.contactPhone && (
            <p>
              <strong>Phone:</strong> {job.contactPhone}
            </p>
          )}
        </div>
      )}

      {/* Bottom Apply Button */}
      {user?.role === 'student' && (
        <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center' }}>
          <Link to={`/jobs/${job.id}/apply`} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            Apply for this Position
          </Link>
        </div>
      )}
      <Footer />
      </div>
    </div>
  );
};

export default JobDetails;
