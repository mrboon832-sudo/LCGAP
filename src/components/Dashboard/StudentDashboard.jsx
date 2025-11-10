import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentApplications, getStudentJobApplications } from '../../services/api';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const StudentDashboard = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  const fetchApplications = async () => {
    try {
      const [courseApps, jobApps] = await Promise.all([
        getStudentApplications(user.uid),
        getStudentJobApplications(user.uid)
      ]);
      setApplications(courseApps);
      setJobApplications(jobApps);
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
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="theme-student">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <h1>Student Dashboard</h1>
        <p className="text-muted">Welcome back, {user.displayName}!</p>

      <div className="grid grid-3" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card">
          <h3 style={{ color: 'var(--primary-color)', marginBottom: 'var(--spacing-sm)' }}>
            {applications.length}
          </h3>
          <p className="text-muted">Course Applications</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--success-color)', marginBottom: 'var(--spacing-sm)' }}>
            {applications.filter(a => a.status === 'admitted').length}
          </h3>
          <p className="text-muted">Admissions</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--warning-color)', marginBottom: 'var(--spacing-sm)' }}>
            {jobApplications.length}
          </h3>
          <p className="text-muted">Job Applications</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="flex gap-md flex-wrap">
          <Link to="/institutions" className="btn btn-primary">
            Browse Institutions
          </Link>
          <Link to="/jobs" className="btn btn-secondary">
            Find Jobs
          </Link>
          <Link to="/profile" className="btn btn-outline">
            View My Profile
          </Link>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">Recent Course Applications</h3>
        </div>
        {applications.length === 0 ? (
          <div className="alert alert-info">
            <p>You haven't applied to any courses yet.</p>
            <Link to="/institutions" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
              Start Applying
            </Link>
          </div>
        ) : (
          <div className="grid grid-2">
            {applications.slice(0, 4).map((app) => (
              <div key={app.id} className="card" style={{ marginBottom: 0 }}>
                <div className="flex justify-between align-center" style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <h4 style={{ margin: 0 }}>Application</h4>
                  <span className={`badge ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                  Institution: {app.institutionId}
                </p>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                  Course: {app.courseId}
                </p>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                  Applied: {app.appliedAt?.toDate?.().toLocaleDateString() || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}
        {applications.length > 4 && (
          <div className="text-center" style={{ marginTop: 'var(--spacing-md)' }}>
            <Link to="/applications" className="btn btn-outline">
              View All Applications
            </Link>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">Recent Job Applications</h3>
        </div>
        {jobApplications.length === 0 ? (
          <div className="alert alert-info">
            <p>You haven't applied to any jobs yet.</p>
            <Link to="/jobs" className="btn btn-secondary" style={{ marginTop: 'var(--spacing-md)' }}>
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-2">
            {jobApplications.slice(0, 4).map((app) => (
              <div key={app.id} className="card" style={{ marginBottom: 0 }}>
                <div className="flex justify-between align-center" style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <h4 style={{ margin: 0 }}>Job Application</h4>
                  <span className={`badge ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                  Job: {app.jobId}
                </p>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                  Applied: {app.appliedAt?.toDate?.().toLocaleDateString() || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
