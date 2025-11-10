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

      // Fetch course applications
      const appsRef = collection(db, 'applications');
      let courseQuery;

      if (user.role === 'student') {
        // Students see their own applications
        courseQuery = query(appsRef, where('studentId', '==', currentUser.uid));
      } else if (user.role === 'institute') {
        // Institutions see applications to their courses
        courseQuery = query(appsRef, where('institutionId', '==', user.institutionId));
      } else if (user.role === 'admin') {
        // Admins see all applications
        courseQuery = query(appsRef);
      }

      // Fetch job applications for students
      const jobAppsRef = collection(db, 'jobApplications');
      let jobQuery;
      
      if (user.role === 'student') {
        jobQuery = query(jobAppsRef, where('studentId', '==', currentUser.uid));
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
      setLoading(false);
    } catch (err) {
      console.error('Error fetching applications:', err);
      console.error('Error details:', err.message);
      setError('Failed to load applications. Please try again.');
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
      const result = await selectFinalAdmission(currentUser.uid, appId);
      setSuccess(result.message);
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error selecting final admission:', err);
      setError(err.message || 'Failed to select final admission. Please try again.');
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
  const acceptedCount = applications.filter(app => app.status === 'accepted').length;

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
          All ({applications.length})
        </button>
        <button 
          className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({applications.filter(a => a.status === 'pending').length})
        </button>
        <button 
          className={`btn ${filter === 'accepted' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('accepted')}
        >
          Accepted ({applications.filter(a => a.status === 'accepted').length})
        </button>
        <button 
          className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({applications.filter(a => a.status === 'rejected').length})
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
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
          {filteredApplications.map(app => (
            <div key={app.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                <div>
                  {/* Display type badge */}
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    marginBottom: 'var(--spacing-xs)',
                    backgroundColor: app.type === 'job' ? 'var(--success-color)' : 'var(--primary-color)',
                    color: 'white'
                  }}>
                    {app.type === 'job' ? 'JOB' : 'COURSE'}
                  </span>
                  <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                    {app.type === 'job' ? (app.jobTitle || 'Job Application') : (app.courseName || 'Course Application')}
                  </h3>
                  <p className="text-muted" style={{ marginBottom: 'var(--spacing-xs)' }}>
                    {app.type === 'job' ? (app.companyName || 'Company') : (app.institutionName || 'Institution')}
                  </p>
                  {user.role !== 'student' && (
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                      Applicant: {app.studentName || app.studentEmail}
                    </p>
                  )}
                </div>
                <span className={getStatusBadge(app.status)}>
                  {app.status?.toUpperCase()}
                </span>
              </div>

              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Applied: {app.appliedAt ? new Date(app.appliedAt.seconds * 1000).toLocaleDateString() : (app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleDateString() : 'N/A')}
                </p>
              </div>

              {app.type === 'course' && app.motivation && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <strong>Motivation:</strong>
                  <p style={{ marginTop: 'var(--spacing-xs)', color: 'var(--text-muted)' }}>
                    {app.motivation.substring(0, 150)}...
                  </p>
                </div>
              )}

              {app.type === 'job' && app.coverLetter && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <strong>Cover Letter:</strong>
                  <p style={{ marginTop: 'var(--spacing-xs)', color: 'var(--text-muted)' }}>
                    {app.coverLetter.substring(0, 150)}...
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                <Link to={`/applications/${app.id}`} className="btn btn-primary">
                  View Details
                </Link>
                {user.role === 'institute' && app.status === 'pending' && (
                  <>
                    <button className="btn btn-success">Accept</button>
                    <button className="btn btn-danger">Reject</button>
                  </>
                )}
                {user.role === 'student' && app.type === 'course' && app.status === 'accepted' && !app.finalAdmissionConfirmed && (
                  <>
                    {applications.filter(a => a.status === 'accepted').length > 1 ? (
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleSelectFinalAdmission(app.id)}
                        disabled={processingApp === app.id}
                        style={{ fontWeight: 600 }}
                      >
                        {processingApp === app.id ? 'Processing...' : '✓ Select as Final Admission'}
                      </button>
                    ) : (
                      <button 
                        className="btn btn-success"
                        onClick={() => handleAcceptAdmission(app.id)}
                        disabled={processingApp === app.id}
                      >
                        {processingApp === app.id ? 'Processing...' : 'Accept Admission'}
                      </button>
                    )}
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleRejectAdmission(app.id)}
                      disabled={processingApp === app.id}
                    >
                      {processingApp === app.id ? 'Processing...' : 'Decline Offer'}
                    </button>
                  </>
                )}
                {app.promotedFromWaiting && (
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    backgroundColor: 'var(--info-color)',
                    color: 'white',
                    alignSelf: 'center'
                  }}>
                    Promoted from Waiting List
                  </span>
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

export default ApplicationsPage;
