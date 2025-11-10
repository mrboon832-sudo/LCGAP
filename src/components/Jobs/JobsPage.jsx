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
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
          {filteredJobs.map(job => (
            <div 
              key={job.id} 
              className="card shadow-md hover-scale-sm transition-all" 
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: 'var(--spacing-xl)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                    <div className="icon-badge" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                      💼
                    </div>
                    <h3 style={{ margin: 0 }}>{job.title}</h3>
                  </div>
                  <p className="text-muted" style={{ marginBottom: 'var(--spacing-sm)', marginLeft: '52px' }}>
                    🏢 {job.companyName || 'Company'}
                  </p>
                  <div style={{ marginLeft: '52px' }}>
                    <span className="badge badge-primary">{job.type || 'Full-time'}</span>
                  </div>
                </div>
                {job.salary && (
                  <div style={{ 
                    textAlign: 'right',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px'
                  }}>
                    <p style={{ 
                      fontWeight: 'bold', 
                      color: '#059669',
                      fontSize: '1.1rem',
                      margin: 0
                    }}>
                      {typeof job.salary === 'object' && job.salary !== null
                        ? `${job.salary.currency || 'LSL'} ${job.salary.min || 0} - ${job.salary.max || 0}`
                        : (typeof job.salary === 'string' ? job.salary : '')}
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>per month</p>
                  </div>
                )}
              </div>

              <p style={{ 
                marginBottom: 'var(--spacing-md)', 
                color: '#475569',
                lineHeight: 1.6,
                borderLeft: '3px solid var(--primary-color)',
                paddingLeft: 'var(--spacing-md)'
              }}>
                {job.description?.substring(0, 200)}...
              </p>

              <div style={{ 
                display: 'flex', 
                gap: 'var(--spacing-lg)', 
                flexWrap: 'wrap', 
                marginBottom: 'var(--spacing-lg)',
                padding: 'var(--spacing-md)',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
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
                <Link 
                  to={`/jobs/${job.id}`} 
                  className="btn btn-primary hover-lift transition-all"
                  style={{ flex: 1 }}
                >
                  📋 View Details
                </Link>
                {user?.role === 'student' && (
                  <Link 
                    to={`/jobs/${job.id}/apply`} 
                    className="btn btn-outline hover-lift transition-all"
                    style={{ flex: 1 }}
                  >
                    ✏️ Apply Now
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
