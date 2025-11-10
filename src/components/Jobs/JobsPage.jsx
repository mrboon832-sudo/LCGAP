import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Link } from 'react-router-dom';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const JobsPage = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const jobsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setJobs(jobsList);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'fulltime') return job.type === 'Full-time' || job.type === 'full-time';
    if (filter === 'parttime') return job.type === 'Part-time' || job.type === 'part-time';
    if (filter === 'internship') return job.type === 'Internship' || job.type === 'internship';
    return true;
  });

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <div className="spinner"></div>
        <p className="loading-text">Loading jobs...</p>
      </div>
    );
  }

  const getThemeClass = () => {
    if (!user) return '';
    switch (user.role) {
      case 'student': return 'theme-student';
      case 'company': return 'theme-company';
      case 'admin': return 'theme-admin';
      default: return '';
    }
  };

  return (
    <div className={getThemeClass()}>
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>Job Opportunities</h1>
          <p className="text-muted">Explore career opportunities from top companies in Lesotho</p>
        </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Filter Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--spacing-sm)', 
        marginBottom: 'var(--spacing-lg)',
        flexWrap: 'wrap'
      }}>
        <button 
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('all')}
        >
          All Jobs
        </button>
        <button 
          className={`btn ${filter === 'fulltime' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('fulltime')}
        >
          Full-time
        </button>
        <button 
          className={`btn ${filter === 'parttime' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('parttime')}
        >
          Part-time
        </button>
        <button 
          className={`btn ${filter === 'internship' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('internship')}
        >
          Internships
        </button>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <p className="text-muted">No jobs available at the moment.</p>
          {user?.role === 'company' && (
            <Link to="/post-job" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
              Post a Job
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
          {filteredJobs.map(job => (
            <div key={job.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                <div>
                  <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>{job.title}</h3>
                  <p className="text-muted" style={{ marginBottom: 'var(--spacing-xs)' }}>
                    {job.companyName || 'Company'}
                  </p>
                  <span className="badge badge-primary">{job.type || 'Full-time'}</span>
                </div>
                {job.salary && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                      {typeof job.salary === 'object' && job.salary !== null
                        ? `${job.salary.currency || 'LSL'} ${job.salary.min || 0} - ${job.salary.max || 0}`
                        : (typeof job.salary === 'string' ? job.salary : '')}
                    </p>
                  </div>
                )}
              </div>

              <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-color)' }}>
                {job.description?.substring(0, 200)}...
              </p>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', marginBottom: 'var(--spacing-md)' }}>
                {job.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.875rem' }}>
                    📍 {job.location}
                  </span>
                )}
                {job.deadline && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.875rem' }}>
                    📅 Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <Link to={`/jobs/${job.id}`} className="btn btn-primary">
                  View Details
                </Link>
                {user?.role === 'student' && (
                  <Link to={`/jobs/${job.id}/apply`} className="btn btn-outline">
                    Apply Now
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
};

export default JobsPage;
