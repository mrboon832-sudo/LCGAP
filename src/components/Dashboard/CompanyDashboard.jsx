import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const CompanyDashboard = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [qualifiedApplicants, setQualifiedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Use user.companyId instead of prop
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

      // Fetch job applications
      const appsRef = collection(db, 'jobApplications');
      const jobIds = jobsData.map(j => j.id);
      
      let allApplications = [];
      if (jobIds.length > 0) {
        // Fetch applications for each job
        for (const jobId of jobIds) {
          const appQuery = query(appsRef, where('jobId', '==', jobId));
          const appSnapshot = await getDocs(appQuery);
          const apps = appSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          allApplications.push(...apps);
        }
      }
      
      setApplications(allApplications);
      
      // Filter qualified applicants (ready for interview)
      const qualified = allApplications.filter(app => app.status === 'qualified' || app.isQualified);
      setQualifiedApplicants(qualified);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  const qualificationRate = applications.length > 0 
    ? ((qualifiedApplicants.length / applications.length) * 100).toFixed(1) 
    : 0;

  return (
    <div className="theme-company">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        {/* Welcome Card with Gradient */}
        <div className="card gradient-bg" style={{ 
          padding: 'var(--spacing-xl)',
          color: 'white',
          marginBottom: 'var(--spacing-xl)',
          borderRadius: '20px'
        }}>
          <h1 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', fontSize: '2rem' }}>
            Welcome back, {user.displayName}! 💼
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '1.1rem' }}>
            Manage your job postings and review applicants
          </p>
          {applications.length > 0 && (
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: 'var(--spacing-sm)',
                fontSize: '0.9rem'
              }}>
                <span>Qualification Rate</span>
                <span>{qualificationRate}%</span>
              </div>
              <div className="progress" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${qualificationRate}%`,
                    backgroundColor: 'white'
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

      {/* Stats Cards with Icons */}
      <div className="grid grid-4" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div className="icon-badge">
              📢
            </div>
            <div>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.25rem', fontSize: '2rem' }}>
                {jobs.length}
              </h3>
              <p className="text-muted" style={{ margin: 0 }}>Active Jobs</p>
            </div>
          </div>
        </div>

        <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div className="icon-badge" style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              📝
            </div>
            <div>
              <h3 style={{ color: '#10b981', marginBottom: '0.25rem', fontSize: '2rem' }}>
                {applications.length}
              </h3>
              <p className="text-muted" style={{ margin: 0 }}>Total Applications</p>
            </div>
          </div>
        </div>

        <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div className="icon-badge" style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              ⭐
            </div>
            <div>
              <h3 style={{ color: '#3b82f6', marginBottom: '0.25rem', fontSize: '2rem' }}>
                {qualifiedApplicants.length}
              </h3>
              <p className="text-muted" style={{ margin: 0 }}>Qualified</p>
            </div>
          </div>
        </div>

        <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div className="icon-badge" style={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              ⏳
            </div>
            <div>
              <h3 style={{ color: '#f59e0b', marginBottom: '0.25rem', fontSize: '2rem' }}>
                {applications.filter(a => a.status === 'pending').length}
              </h3>
              <p className="text-muted" style={{ margin: 0 }}>Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions with Icons */}
      <div className="card shadow-md" style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-xl)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-lg)', fontSize: '1.5rem' }}>⚡ Quick Actions</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-md)'
        }}>
          <Link 
            to="/manage-jobs" 
            className="btn btn-primary hover-lift transition-all"
            style={{ 
              padding: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              justifyContent: 'center'
            }}
          >
            📢 Manage Jobs
          </Link>
          <Link 
            to="/applicants" 
            className="btn btn-secondary hover-lift transition-all"
            style={{ 
              padding: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              justifyContent: 'center'
            }}
          >
            👥 View Applicants
          </Link>
          <Link 
            to="/jobs" 
            className="btn btn-outline hover-lift transition-all"
            style={{ 
              padding: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              justifyContent: 'center'
            }}
          >
            🔍 Browse Jobs
          </Link>
        </div>
      </div>

      {/* Active Job Postings - Enhanced */}
      <div className="card shadow-md" style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem' }}>📢 Active Job Postings</h3>
          {jobs.length > 0 && (
            <span className="badge badge-success">{jobs.length} active</span>
          )}
        </div>
        {jobs.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--spacing-xl)',
            backgroundColor: '#f5f3ff',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📢</div>
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Post Your First Job</h4>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
              Start attracting talented candidates by posting your job opportunities.
            </p>
            <Link to="/jobs/create" className="btn btn-primary hover-lift transition-all">
              ➕ Create Job Posting
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-2" style={{ gap: 'var(--spacing-md)' }}>
              {jobs.slice(0, 4).map((job) => (
                <div 
                  key={job.id} 
                  className="card hover-scale-sm transition-all" 
                  style={{ 
                    marginBottom: 0,
                    border: '1px solid #e5e7eb',
                    padding: 'var(--spacing-lg)'
                  }}
                >
                  <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>{job.title || 'Untitled Job'}</h4>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>
                    {job.description?.substring(0, 100) || 'No description'}...
                  </p>
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 'var(--spacing-sm)' }}>
                    <div className="flex justify-between align-center">
                      <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                        📅 {job.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                      </span>
                      <Link to={`/jobs/${job.id}`} className="btn btn-sm btn-outline hover-lift transition-all">
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {jobs.length > 4 && (
              <div className="text-center" style={{ marginTop: 'var(--spacing-lg)' }}>
                <Link to="/jobs" className="btn btn-outline hover-lift transition-all">
                  View All {jobs.length} Jobs →
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent Applications - Enhanced */}
      <div className="card shadow-md" style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem' }}>📋 Recent Applications</h3>
          {applications.length > 0 && (
            <span className="badge badge-info">{applications.length} total</span>
          )}
        </div>
        {applications.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--spacing-xl)',
            backgroundColor: '#f5f3ff',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📝</div>
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>No Applications Yet</h4>
            <p className="text-muted">
              Applications from students will appear here once they start applying to your jobs.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  borderBottom: '2px solid var(--border-color)',
                  backgroundColor: '#f8fafc'
                }}>
                  <th style={{ 
                    padding: 'var(--spacing-md)', 
                    textAlign: 'left',
                    fontWeight: 600
                  }}>👤 Applicant</th>
                  <th style={{ 
                    padding: 'var(--spacing-md)', 
                    textAlign: 'left',
                    fontWeight: 600
                  }}>💼 Job</th>
                  <th style={{ 
                    padding: 'var(--spacing-md)', 
                    textAlign: 'left',
                    fontWeight: 600
                  }}>📅 Date</th>
                  <th style={{ 
                    padding: 'var(--spacing-md)', 
                    textAlign: 'left',
                    fontWeight: 600
                  }}>📊 Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 10).map((app) => (
                  <tr 
                    key={app.id} 
                    className="hover-scale-sm transition-all"
                    style={{ 
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <strong>{app.studentId}</strong>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>{app.jobId}</td>
                    <td style={{ 
                      padding: 'var(--spacing-md)', 
                      fontSize: '0.875rem', 
                      color: 'var(--text-secondary)' 
                    }}>
                      {app.appliedAt?.toDate?.().toLocaleDateString() || 'N/A'}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <span className="badge badge-warning">{app.status}</span>
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

export default CompanyDashboard;
