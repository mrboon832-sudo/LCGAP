import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { updateApplicationStatus, selectFinalAdmission } from '../../services/api';
import { Link } from 'react-router-dom';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const ApplicationsPage = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewType, setViewType] = useState('all'); // 'all', 'courses', 'jobs'
  const [processingApp, setProcessingApp] = useState(null);

  const fetchApplications = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('You must be logged in to view applications');
        setLoading(false);
        return;
      }

      if (!user || !user.role) {
        setError('User profile not loaded');
        setLoading(false);
        return;
      }

      // Fetch course applications
      const appsRef = collection(db, 'applications');
      let courseQuery;

      if (user.role === 'student') {
        // Students see their own applications
        courseQuery = query(appsRef, where('studentId', '==', currentUser.uid));
      } else if (user.role === 'institute') {
        // Institutions see applications to their courses
        if (!user.institutionId) {
          setError('Institution ID not found');
          setLoading(false);
          return;
        }
        courseQuery = query(appsRef, where('institutionId', '==', user.institutionId));
      } else if (user.role === 'admin') {
        // Admins see all applications
        courseQuery = query(appsRef);
      }

      // Fetch job applications
      const jobAppsRef = collection(db, 'jobApplications');
      let jobQuery;
      
      if (user.role === 'student') {
        jobQuery = query(jobAppsRef, where('studentId', '==', currentUser.uid));
      } else if (user.role === 'company') {
        // Companies see applications to their jobs
        if (!user.companyId) {
          setError('Company ID not found');
          setLoading(false);
          return;
        }
        jobQuery = query(jobAppsRef, where('companyId', '==', user.companyId));
      }

      // Execute queries
      const promises = [];
      if (courseQuery) promises.push(getDocs(courseQuery));
      if (jobQuery) promises.push(getDocs(jobQuery));

      const results = await Promise.all(promises);
      
      let courseAppsList = [];
      let jobAppsList = [];

      if (results[0]) {
        courseAppsList = results[0].docs.map(doc => ({
          id: doc.id,
          type: 'course',
          ...doc.data()
        }));
      }

      if (results[1]) {
        jobAppsList = results[1].docs.map(doc => ({
          id: doc.id,
          type: 'job',
          ...doc.data()
        }));
      }

      // Sort by appliedAt or createdAt on client side
      const sortByDate = (list) => list.sort((a, b) => {
        const aTime = a.appliedAt?.seconds || a.createdAt?.seconds || 0;
        const bTime = b.appliedAt?.seconds || b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      
      setApplications(sortByDate(courseAppsList));
      setJobApplications(sortByDate(jobAppsList));
      setError(''); // Clear any previous errors
      setLoading(false);
    } catch (err) {
      console.error('Error fetching applications:', err);
      console.error('Error details:', err.message);
      console.error('Error code:', err.code);
      setError(err.message || 'Failed to load applications. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAcceptAdmission = async (appId) => {
    if (!window.confirm('Are you sure you want to accept this admission offer? You can only accept one final admission.')) {
      return;
    }
    
    setProcessingApp(appId);
    setError('');
    setSuccess('');
    
    try {
      await updateApplicationStatus(appId, 'accepted', {
        acceptedBy: 'student',
        acceptedAt: new Date()
      });
      setSuccess('Admission accepted successfully! Congratulations!');
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error accepting admission:', err);
      setError(err.message || 'Failed to accept admission. Please try again.');
    } finally {
      setProcessingApp(null);
    }
  };

  const handleSelectFinalAdmission = async (appId) => {
    const acceptedApps = applications.filter(app => app.status === 'accepted');
    
    if (acceptedApps.length <= 1) {
      setError('You only have one acceptance. No need to select.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to confirm this as your FINAL admission? All other acceptances will be automatically declined and those spots will go to waiting list students.')) {
      return;
    }
    
    setProcessingApp(appId);
    setError('');
    setSuccess('');
    
    try {
      const currentUser = auth.currentUser;
      console.log('Selecting final admission for:', currentUser.uid, appId);
      const result = await selectFinalAdmission(currentUser.uid, appId);
      console.log('Final admission selected successfully:', result);
      setSuccess(result.message);
      setError(''); // Explicitly clear error
      await fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error selecting final admission:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      setError(err.message || 'Failed to select final admission. Please try again.');
      setSuccess(''); // Clear success message on error
    } finally {
      setProcessingApp(null);
    }
  };

  const handleRejectAdmission = async (appId) => {
    if (!window.confirm('Are you sure you want to reject this admission offer? This action cannot be undone.')) {
      return;
    }
    
    setProcessingApp(appId);
    setError('');
    setSuccess('');
    
    try {
      await updateApplicationStatus(appId, 'rejected');
      setSuccess('Admission offer declined.');
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error rejecting admission:', err);
      setError('Failed to reject admission. Please try again.');
    } finally {
      setProcessingApp(null);
    }
  };

  // Combine and filter applications
  const allApplications = [...applications, ...jobApplications];
  
  const filteredApplications = allApplications.filter(app => {
    // Filter by view type
    if (viewType === 'courses' && app.type !== 'course') return false;
    if (viewType === 'jobs' && app.type !== 'job') return false;
    
    // Filter by status
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'badge-warning',
      accepted: 'badge-success',
      rejected: 'badge-danger'
    };
    return `badge ${styles[status] || 'badge-secondary'}`;
  };

  const getThemeClass = () => {
    if (!user) return '';
    switch (user.role) {
      case 'student': return 'theme-student';
      case 'institute': return 'theme-institute';
      case 'admin': return 'theme-admin';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className={getThemeClass()}>
        <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
          <div className="spinner"></div>
          <p className="loading-text">Loading applications...</p>
        </div>
      </div>
    );
  }

  const totalApplications = applications.length + jobApplications.length;
  const acceptedCount = applications.filter(app => app.status === 'accepted').length + 
                        jobApplications.filter(app => app.status === 'accepted').length;

  return (
    <div className={getThemeClass()}>
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
      {/* Breadcrumb Navigation */}
      <nav style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.875rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Dashboard</Link>
        <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>›</span>
        <span style={{ color: 'var(--text-muted)' }}>My Applications</span>
      </nav>
      {/* Header with Gradient */}
      <div className="card gradient-bg" style={{ 
        padding: 'var(--spacing-xl)',
        color: 'white',
        marginBottom: 'var(--spacing-xl)',
        borderRadius: '20px'
      }}>
        <h1 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', fontSize: '2rem' }}>
          📋 {user.role === 'student' ? 'My Applications' : 'Applications'}
        </h1>
        <p style={{ margin: 0, opacity: 0.95, fontSize: '1.1rem' }}>
          {user.role === 'student' 
            ? `Tracking ${totalApplications} application${totalApplications !== 1 ? 's' : ''} across institutions and jobs`
            : 'Manage and review course applications'}
        </p>
        {user.role === 'student' && totalApplications > 0 && (
          <div style={{ 
            marginTop: 'var(--spacing-lg)',
            display: 'flex',
            gap: 'var(--spacing-lg)',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{applications.length}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Course Applications</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{acceptedCount}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Accepted</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{jobApplications.length}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Job Applications</div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger shadow-md" style={{ 
          borderRadius: '12px',
          border: '1px solid #fee2e2'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success shadow-md" style={{ 
          borderRadius: '12px',
          border: '1px solid #d1fae5'
        }}>
          {success}
        </div>
      )}

      {/* Multiple Acceptances Warning - Enhanced */}
      {user.role === 'student' && applications.filter(app => app.status === 'accepted' && !app.finalAdmissionConfirmed).length > 1 && (
        <div className="card shadow-lg" style={{ 
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-xl)',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #f59e0b',
          borderRadius: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-md)' }}>
            <div style={{ fontSize: '2.5rem' }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ marginBottom: 'var(--spacing-md)', color: '#92400e' }}>
                Multiple Acceptances Detected
              </h4>
              <p style={{ color: '#78350f', marginBottom: 'var(--spacing-sm)' }}>
                You have been accepted to {applications.filter(app => app.status === 'accepted').length} institutions. 
                You must select ONE final admission. When you confirm your choice:
              </p>
              <ul style={{ 
                marginLeft: 'var(--spacing-lg)', 
                marginTop: 'var(--spacing-md)',
                color: '#78350f'
              }}>
                <li>Your other acceptances will be automatically declined</li>
                <li>Students on the waiting lists will be promoted to take your declined spots</li>
                <li>This action cannot be undone</li>
              </ul>
              <p style={{ 
                marginTop: 'var(--spacing-md)', 
                fontWeight: 600,
                color: '#92400e',
                padding: 'var(--spacing-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '8px'
              }}>
                👉 Please click "Select as Final Admission" on your preferred institution below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View Type Tabs (for students) */}
      {user.role === 'student' && (
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-sm)', 
          marginBottom: 'var(--spacing-md)',
          borderBottom: '2px solid var(--border-color)'
        }}>
          <button
            onClick={() => setViewType('all')}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: 'none',
              border: 'none',
              borderBottom: viewType === 'all' ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: viewType === 'all' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: viewType === 'all' ? 600 : 400,
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            All ({allApplications.length})
          </button>
          <button
            onClick={() => setViewType('courses')}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: 'none',
              border: 'none',
              borderBottom: viewType === 'courses' ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: viewType === 'courses' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: viewType === 'courses' ? 600 : 400,
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Course Applications ({applications.length})
          </button>
          <button
            onClick={() => setViewType('jobs')}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: 'none',
              border: 'none',
              borderBottom: viewType === 'jobs' ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: viewType === 'jobs' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: viewType === 'jobs' ? 600 : 400,
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Job Applications ({jobApplications.length})
          </button>
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
          All ({allApplications.filter(app => {
            if (viewType === 'courses') return app.type === 'course';
            if (viewType === 'jobs') return app.type === 'job';
            return true;
          }).length})
        </button>
        <button 
          className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({allApplications.filter(app => {
            if (viewType === 'courses' && app.type !== 'course') return false;
            if (viewType === 'jobs' && app.type !== 'job') return false;
            return app.status === 'pending';
          }).length})
        </button>
        <button 
          className={`btn ${filter === 'accepted' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('accepted')}
        >
          Accepted ({allApplications.filter(app => {
            if (viewType === 'courses' && app.type !== 'course') return false;
            if (viewType === 'jobs' && app.type !== 'job') return false;
            return app.status === 'accepted';
          }).length})
        </button>
        <button 
          className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({allApplications.filter(app => {
            if (viewType === 'courses' && app.type !== 'course') return false;
            if (viewType === 'jobs' && app.type !== 'job') return false;
            return app.status === 'rejected';
          }).length})
        </button>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <p className="text-muted">No applications found.</p>
          {user.role === 'student' && (
            <Link to="/institutions" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
              Browse Institutions
            </Link>
          )}
        </div>
      ) : (
        <div className="card">
          <h2>Applications ({filteredApplications.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Organization</th>
                  {user.role !== 'student' && <th>Applicant</th>}
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map(app => (
                  <tr key={app.id}>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: app.type === 'job' ? 'var(--success-color)' : 'var(--primary-color)',
                        color: 'white'
                      }}>
                        {app.type === 'job' ? 'JOB' : 'COURSE'}
                      </span>
                    </td>
                    <td>
                      <strong>{app.type === 'job' ? (app.jobTitle || 'Job Application') : (app.courseName || 'Course Application')}</strong>
                      {app.promotedFromWaiting && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--info-color)',
                          marginTop: '0.25rem'
                        }}>
                          ⬆️ Promoted from Waiting List
                        </div>
                      )}
                    </td>
                    <td>{app.type === 'job' ? (app.companyName || 'Company') : (app.institutionName || 'Institution')}</td>
                    {user.role !== 'student' && (
                      <td>{app.studentName || app.studentEmail}</td>
                    )}
                    <td>
                      <span className={getStatusBadge(app.status)}>
                        {app.status?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {app.appliedAt ? new Date(app.appliedAt.seconds * 1000).toLocaleDateString() : (app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleDateString() : 'N/A')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {user.role === 'institute' && app.status === 'pending' && (
                          <>
                            <button className="btn btn-sm btn-success">Accept</button>
                            <button className="btn btn-sm btn-danger">Reject</button>
                          </>
                        )}
                        {user.role === 'student' && app.type === 'course' && app.status === 'accepted' && !app.finalAdmissionConfirmed && (
                          <>
                            {applications.filter(a => a.status === 'accepted').length > 1 ? (
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => handleSelectFinalAdmission(app.id)}
                                disabled={processingApp === app.id}
                              >
                                {processingApp === app.id ? 'Processing...' : 'Select Final'}
                              </button>
                            ) : (
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => handleAcceptAdmission(app.id)}
                                disabled={processingApp === app.id}
                              >
                                {processingApp === app.id ? 'Processing...' : 'Accept'}
                              </button>
                            )}
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRejectAdmission(app.id)}
                              disabled={processingApp === app.id}
                            >
                              {processingApp === app.id ? 'Processing...' : 'Decline'}
                            </button>
                          </>
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

export default ApplicationsPage;
