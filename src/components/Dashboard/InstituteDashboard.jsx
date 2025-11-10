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

  return (
    <div className="theme-institute">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <h1>Institution Dashboard</h1>
        <p className="text-muted">Welcome back, {user.displayName}</p>

      <div className="grid grid-4" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card">
          <h3 style={{ color: 'var(--warning-color)', marginBottom: 'var(--spacing-sm)' }}>
            {stats.pending}
          </h3>
          <p className="text-muted">Pending Applications</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--success-color)', marginBottom: 'var(--spacing-sm)' }}>
            {stats.admitted}
          </h3>
          <p className="text-muted">Admitted Students</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--primary-color)', marginBottom: 'var(--spacing-sm)' }}>
            {stats.waiting}
          </h3>
          <p className="text-muted">Waiting List</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--danger-color)', marginBottom: 'var(--spacing-sm)' }}>
            {stats.rejected}
          </h3>
          <p className="text-muted">Rejected</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="flex gap-md flex-wrap">
          <Link to="/manage-institution" className="btn btn-primary">
            Manage Institution
          </Link>
          <Link to="/manage-applications" className="btn btn-primary">
            Review Applications
          </Link>
          <Link to="/faculties" className="btn btn-secondary">
            Manage Faculties
          </Link>
          <Link to="/courses" className="btn btn-secondary">
            Manage Courses
          </Link>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">Recent Applications</h3>
        </div>
        {applications.length === 0 ? (
          <div className="alert alert-info">
            <p>No applications yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Student</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Course</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 10).map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: 'var(--spacing-sm)' }}>{app.studentId}</td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>{app.courseId}</td>
                    <td style={{ padding: 'var(--spacing-sm)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {app.appliedAt?.toDate?.().toLocaleDateString() || 'N/A'}
                    </td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>
                      <span className={`badge ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {applications.length > 10 && (
          <div className="text-center" style={{ marginTop: 'var(--spacing-md)' }}>
            <Link to="/applications" className="btn btn-outline">
              View All Applications
            </Link>
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default InstituteDashboard;
