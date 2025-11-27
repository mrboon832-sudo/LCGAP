import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentApplications, getStudentJobApplications, getInstitution } from '../../services/api';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const StudentDashboard = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const fetchApplications = async () => {
    if (!user?.uid) {
      console.log('No user ID available');
      setLoading(false);
      return;
    }
    
    try {
      const [courseApps, jobApps] = await Promise.all([
        getStudentApplications(user.uid),
        getStudentJobApplications(user.uid)
      ]);
      
      // Set data immediately without waiting for institution enrichment
      setLoading(false); // Show dashboard immediately
      setApplications(courseApps.map(app => ({
        ...app,
        institutionName: app.institutionName || 'Loading...',
        courseName: app.courseName || app.courseId
      })));
      setJobApplications(jobApps);
      
      // Enrich with institution names in background if needed
      const uniqueInstitutionIds = [...new Set(
        courseApps
          .filter(app => !app.institutionName && app.institutionId)
          .map(app => app.institutionId)
      )];
      
      if (uniqueInstitutionIds.length > 0) {
        // Fetch all institutions in parallel
        const institutions = await Promise.all(
          uniqueInstitutionIds.map(async (instId) => {
            try {
              const inst = await getInstitution(instId);
              return { id: instId, name: inst?.name || instId };
            } catch (err) {
              return { id: instId, name: instId };
            }
          })
        );
        
        // Create lookup map
        const instMap = Object.fromEntries(institutions.map(i => [i.id, i.name]));
        
        // Update applications with institution names
        setApplications(courseApps.map(app => ({
          ...app,
          institutionName: app.institutionName || instMap[app.institutionId] || app.institutionId,
          courseName: app.courseName || app.courseId
        })));
      }
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

  const admittedCount = applications.filter(a => a.status === 'admitted').length;
  const totalApplications = applications.length;
  const applicationProgress = totalApplications > 0 ? (admittedCount / totalApplications) * 100 : 0;

  return (
    <div className="theme-student">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        {/* Welcome Card with Gradient */}
        <div className="card gradient-bg" style={{ 
          padding: 'var(--spacing-xl)',
          color: 'white',
          marginBottom: 'var(--spacing-xl)',
          borderRadius: '20px'
        }}>
          <h1 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', fontSize: '2rem' }}>
            Welcome back, {user?.displayName || 'Student'}! 👋
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '1.1rem' }}>
            Here's your progress overview
          </p>
          {/* Progress Bar */}
          {totalApplications > 0 && (
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: 'var(--spacing-sm)',
                fontSize: '0.9rem'
              }}>
                <span>Application Success Rate</span>
                <span>{Math.round(applicationProgress)}%</span>
              </div>
              <div className="progress" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${applicationProgress}%`,
                    backgroundColor: 'white'
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

      {/* Stats Cards with Icons */}
      <div className="grid grid-3" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div className="icon-badge">
              📝
            </div>
            <div>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.25rem', fontSize: '2rem' }}>
                {loading ? '...' : applications.length}
              </h3>
              <p className="text-muted" style={{ margin: 0 }}>Course Applications</p>
            </div>
          </div>
        </div>

        <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div className="icon-badge" style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              🎓
            </div>
            <div>
              <h3 style={{ color: '#10b981', marginBottom: '0.25rem', fontSize: '2rem' }}>
                {loading ? '...' : admittedCount}
              </h3>
              <p className="text-muted" style={{ margin: 0 }}>Admissions</p>
            </div>
          </div>
        </div>

        <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div className="icon-badge" style={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              💼
            </div>
            <div>
              <h3 style={{ color: '#f59e0b', marginBottom: '0.25rem', fontSize: '2rem' }}>
                {loading ? '...' : jobApplications.length}
              </h3>
              <p className="text-muted" style={{ margin: 0 }}>Job Applications</p>
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
            to="/institutions" 
            className="btn btn-primary hover-lift transition-all" 
            style={{ 
              padding: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              justifyContent: 'center'
            }}
          >
            🏫 Browse Institutions
          </Link>
          <Link 
            to="/jobs" 
            className="btn btn-secondary hover-lift transition-all"
            style={{ 
              padding: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              justifyContent: 'center'
            }}
          >
            💼 Find Jobs
          </Link>
          <Link 
            to="/profile" 
            className="btn btn-outline hover-lift transition-all"
            style={{ 
              padding: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              justifyContent: 'center'
            }}
          >
            👤 View Profile
          </Link>
        </div>
      </div>

      {/* Recent Course Applications - Enhanced */}
      <div className="card shadow-md" style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem' }}>📚 Recent Course Applications</h3>
          {applications.length > 0 && (
            <span className="badge badge-info">{applications.length} total</span>
          )}
        </div>
        {applications.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--spacing-xl)',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🎓</div>
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Ready to start your journey?</h4>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
              You haven't applied to any courses yet. Browse institutions and find the perfect program for you!
            </p>
            <Link to="/institutions" className="btn btn-primary hover-lift transition-all">
              🏫 Browse Institutions
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-2" style={{ gap: 'var(--spacing-md)' }}>
              {applications.slice(0, 4).map((app) => (
                <div 
                  key={app.id} 
                  className="card hover-scale-sm transition-all" 
                  style={{ 
                    marginBottom: 0,
                    border: '1px solid #e5e7eb',
                    padding: 'var(--spacing-lg)'
                  }}
                >
                  <div className="flex justify-between align-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>📝 Application</h4>
                    <span className={`badge ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 'var(--spacing-sm)' }}>
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      <strong>Institution:</strong> {app.institutionName || app.institutionId}
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      <strong>Course:</strong> {app.courseName || app.courseId}
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>
                      <strong>Applied:</strong> {app.appliedAt?.toDate?.().toLocaleDateString() || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {applications.length > 4 && (
              <div className="text-center" style={{ marginTop: 'var(--spacing-lg)' }}>
                <Link to="/applications" className="btn btn-outline hover-lift transition-all">
                  View All {applications.length} Applications →
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent Job Applications - Enhanced */}
      <div className="card shadow-md" style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem' }}>💼 Recent Job Applications</h3>
          {jobApplications.length > 0 && (
            <span className="badge badge-warning">{jobApplications.length} total</span>
          )}
        </div>
        {jobApplications.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--spacing-xl)',
            backgroundColor: '#fef3c7',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>💼</div>
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Ready to launch your career?</h4>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
              You haven't applied to any jobs yet. Explore opportunities from top companies in Lesotho!
            </p>
            <Link to="/jobs" className="btn btn-secondary hover-lift transition-all">
              🔍 Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-2" style={{ gap: 'var(--spacing-md)' }}>
            {jobApplications.slice(0, 4).map((app) => (
              <div 
                key={app.id} 
                className="card hover-scale-sm transition-all" 
                style={{ 
                  marginBottom: 0,
                  border: '1px solid #e5e7eb',
                  padding: 'var(--spacing-lg)'
                }}
              >
                <div className="flex justify-between align-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>💼 Job Application</h4>
                  <span className={`badge ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 'var(--spacing-sm)' }}>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <strong>Job:</strong> {app.jobId}
                  </p>
                  <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>
                    <strong>Applied:</strong> {app.appliedAt?.toDate?.().toLocaleDateString() || 'N/A'}
                  </p>
                </div>
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
