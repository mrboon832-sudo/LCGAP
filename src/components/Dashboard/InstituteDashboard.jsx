import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInstitutionApplications } from '../../services/api';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const InstituteDashboard = ({ user, institutionId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    admitted: 0,
    rejected: 0,
    waiting: 0
  });

  useEffect(() => {
    if (institutionId) {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institutionId]);

  const fetchApplications = async () => {
    try {
      const apps = await getInstitutionApplications(institutionId);
      setApplications(apps);
      
      // Calculate stats
      const statsData = apps.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, { pending: 0, admitted: 0, rejected: 0, waiting: 0 });
      
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'badge-warning',
      admitted: 'badge-success',
      rejected: 'badge-danger',
      waiting: 'badge-primary'
    };
    return statusMap[status] || 'badge-primary';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  const totalApplications = applications.length;
  const admissionRate = totalApplications > 0 ? ((stats.admitted / totalApplications) * 100).toFixed(1) : 0;

  return (
    <div className="theme-institute">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        {/* Welcome Card with Gradient */}
        <div className="card gradient-bg" style={{ 
          padding: 'var(--spacing-xl)',
          color: 'white',
          marginBottom: 'var(--spacing-xl)',
          borderRadius: '20px'
        }}>
          <h1 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', fontSize: '2rem' }}>
            Welcome back, {user.displayName}! 🏫
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '1.1rem' }}>
            Manage your institution and review applications
          </p>
          {totalApplications > 0 && (
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: 'var(--spacing-sm)',
                fontSize: '0.9rem'
              }}>
                <span>Admission Rate</span>
                <span>{admissionRate}%</span>
              </div>
              <div className="progress" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${admissionRate}%`,
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
            <div className="icon-badge" style={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              ⏳
            </div>
            <div>
              <h3 style={{ color: '#f59e0b', marginBottom: '0.25rem', fontSize: '2rem' }}>
                {stats.pending}
              </h3>
              <p className="text-muted" style={{ margin: 0 }}>Pending</p>
            </div>
          </div>
        </div>

        <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div className="icon-badge" style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              ✅
            </div>
            <div>
              <h3 style={{ color: '#10b981', marginBottom: '0.25rem', fontSize: '2rem' }}>
                {stats.admitted}
              </h3>
              <p className="text-muted" style={{ margin: 0 }}>Admitted</p>
            </div>
          </div>
        </div>

        <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div className="icon-badge">
              📋
            </div>
            <div>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.25rem', fontSize: '2rem' }}>
                {stats.waiting}
              </h3>
              <p className="text-muted" style={{ margin: 0 }}>Waiting List</p>
            </div>
          </div>
        </div>

        <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div className="icon-badge" style={{ 
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}>
              ❌
            </div>
            <div>
              <h3 style={{ color: '#ef4444', marginBottom: '0.25rem', fontSize: '2rem' }}>
                {stats.rejected}
              </h3>
              <p className="text-muted" style={{ margin: 0 }}>Rejected</p>
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
            to="/manage-institution" 
            className="btn btn-primary hover-lift transition-all"
            style={{ 
              padding: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              justifyContent: 'center'
            }}
          >
            🏫 Manage Institution
          </Link>
          <Link 
            to="/manage-applications" 
            className="btn btn-primary hover-lift transition-all"
            style={{ 
              padding: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              justifyContent: 'center'
            }}
          >
            📝 Review Applications
          </Link>
          <Link 
            to="/faculties" 
            className="btn btn-secondary hover-lift transition-all"
            style={{ 
              padding: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              justifyContent: 'center'
            }}
          >
            📚 Manage Faculties
          </Link>
          <Link 
            to="/courses" 
            className="btn btn-secondary hover-lift transition-all"
            style={{ 
              padding: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              justifyContent: 'center'
            }}
          >
            📖 Manage Courses
          </Link>
        </div>
      </div>

      {/* Recent Applications - Enhanced Table */}
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
            backgroundColor: '#eff6ff',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📝</div>
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>No Applications Yet</h4>
            <p className="text-muted">
              Applications from students will appear here once they start applying to your courses.
            </p>
          </div>
        ) : (
          <>
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
                    }}>👤 Student</th>
                    <th style={{ 
                      padding: 'var(--spacing-md)', 
                      textAlign: 'left',
                      fontWeight: 600
                    }}>📖 Course</th>
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
                      <td style={{ padding: 'var(--spacing-md)' }}>{app.courseId}</td>
                      <td style={{ 
                        padding: 'var(--spacing-md)', 
                        fontSize: '0.875rem', 
                        color: 'var(--text-secondary)' 
                      }}>
                        {app.appliedAt?.toDate?.().toLocaleDateString() || 'N/A'}
                      </td>
                      <td style={{ padding: 'var(--spacing-md)' }}>
                        <span className={`badge ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {applications.length > 10 && (
              <div className="text-center" style={{ marginTop: 'var(--spacing-lg)' }}>
                <Link to="/applications" className="btn btn-outline hover-lift transition-all">
                  View All {applications.length} Applications →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default InstituteDashboard;
