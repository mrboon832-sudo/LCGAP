import React, { useState, useEffect } from 'react';
import { getQualifiedJobs } from '../../services/api';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const fetchJobs = async () => {
    try {
      let jobsList = [];
      
      // For students, only show qualified jobs
      if (user?.role === 'student' && user?.uid) {
        jobsList = await getQualifiedJobs(user.uid);
      } else {
        // For non-students or non-logged in users, show all jobs
        const { getJobs } = await import('../../services/api');
        jobsList = await getJobs();
      }
      
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
        {/* Header with Gradient */}
        <div className="card gradient-bg" style={{ 
          padding: 'var(--spacing-xl)',
          color: 'white',
          marginBottom: 'var(--spacing-xl)',
          borderRadius: '20px'
        }}>
          <h1 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', fontSize: '2rem' }}>
            💼 Job Opportunities
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '1.1rem' }}>
            Explore {jobs.length} career opportunities from top companies in Lesotho
          </p>
        </div>

      {error && (
        <div className="alert alert-danger" style={{ 
          borderRadius: '12px',
          border: '1px solid #fee2e2'
        }}>
          {error}
        </div>
      )}

      {/* Enhanced Filter Buttons */}
      <div className="card shadow-md" style={{ 
        padding: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.1rem' }}>🔍 Filter by Type</h3>
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-sm)', 
          flexWrap: 'wrap'
        }}>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} hover-lift transition-all`}
            onClick={() => setFilter('all')}
          >
            All Jobs ({jobs.length})
          </button>
          <button 
            className={`btn ${filter === 'fulltime' ? 'btn-primary' : 'btn-outline'} hover-lift transition-all`}
            onClick={() => setFilter('fulltime')}
          >
            Full-time
          </button>
          <button 
            className={`btn ${filter === 'parttime' ? 'btn-primary' : 'btn-outline'} hover-lift transition-all`}
            onClick={() => setFilter('parttime')}
          >
            Part-time
          </button>
          <button 
            className={`btn ${filter === 'internship' ? 'btn-primary' : 'btn-outline'} hover-lift transition-all`}
            onClick={() => setFilter('internship')}
          >
            Internships
          </button>
        </div>
        {filteredJobs.length < jobs.length && (
          <p className="text-muted" style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.875rem' }}>
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        )}
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="card shadow-md" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <div style={{ 
            padding: 'var(--spacing-xl)',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>💼</div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No Jobs Found</h3>
            <p className="text-muted">Try adjusting your filters or check back later</p>
            {user?.role === 'company' && (
              <Link to="/post-job" className="btn btn-primary hover-lift transition-all" style={{ marginTop: 'var(--spacing-lg)' }}>
                ➕ Post a Job
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <h2>Available Jobs ({filteredJobs.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(job => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.title}</strong>
                      <div className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {job.description?.substring(0, 80)}...
                      </div>
                    </td>
                    <td>{job.companyName || 'Company'}</td>
                    <td>
                      <span className="badge badge-primary">{job.type || 'Full-time'}</span>
                    </td>
                    <td>{job.location || 'N/A'}</td>
                    <td>
                      {job.salary ? (
                        <div style={{ fontWeight: '600', color: '#059669' }}>
                          {typeof job.salary === 'object' && job.salary !== null
                            ? `${job.salary.currency || 'LSL'} ${job.salary.min || 0}-${job.salary.max || 0}`
                            : (typeof job.salary === 'string' ? job.salary : 'N/A')}
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td>
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link 
                          to={`/jobs/${job.id}`} 
                          className="btn btn-sm btn-primary"
                        >
                          View
                        </Link>
                        {user?.role === 'student' && (
                          <Link 
                            to={`/jobs/${job.id}/apply`} 
                            className="btn btn-sm btn-success"
                          >
                            Apply
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
};

export default JobsPage;
