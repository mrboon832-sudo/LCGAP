import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { updateApplicationStatus } from '../../services/api';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const ManageApplications = ({ user, institutionId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institutionId]);

  const fetchApplications = async () => {
    try {
      const q = query(
        collection(db, 'applications'),
        where('institutionId', '==', institutionId)
      );
      const snapshot = await getDocs(q);
      
      const appsWithDetails = await Promise.all(
        snapshot.docs.map(async (appDoc) => {
          const appData = appDoc.data();
          
          // Fetch student profile for grades
          let studentProfile = {};
          if (appData.studentId) {
            try {
              const studentDoc = await getDoc(doc(db, 'users', appData.studentId));
              if (studentDoc.exists()) {
                studentProfile = studentDoc.data();
              }
            } catch (err) {
              console.error('Error fetching student:', err);
            }
          }
          
          // Calculate eligibility score
          const eligibilityScore = calculateEligibility(studentProfile);
          
          return {
            id: appDoc.id,
            ...appData,
            studentProfile,
            eligibilityScore
          };
        })
      );
      
      // Sort by date and eligibility
      appsWithDetails.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      
      setApplications(appsWithDetails);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const calculateEligibility = (profile) => {
    let score = 0;
    
    // High school info (30 points)
    if (profile.highSchool) {
      if (profile.highSchool.gpa) score += 20;
      if (profile.highSchool.subjects && profile.highSchool.subjects.length > 0) score += 10;
    }
    
    // Academic performance (40 points)
    if (profile.academicPerformance) {
      const gpa = parseFloat(profile.academicPerformance.gpa || 0);
      if (gpa >= 3.5) score += 40;
      else if (gpa >= 3.0) score += 30;
      else if (gpa >= 2.5) score += 20;
      else if (gpa > 0) score += 10;
    }
    
    // Certificates (15 points)
    if (profile.certificates && profile.certificates.length > 0) {
      score += Math.min(profile.certificates.length * 5, 15);
    }
    
    // Work experience (15 points)
    if (profile.workExperience && profile.workExperience.length > 0) {
      score += Math.min(profile.workExperience.length * 5, 15);
    }
    
    return Math.min(score, 100);
  };

  const handleAction = async (appId, action) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    
    let message = '';
    let newStatus = '';
    
    if (action === 'accept') {
      if (app.eligibilityScore >= 70) {
        newStatus = 'accepted';
        message = 'Are you sure you want to accept this student?';
      } else {
        setError('Student must have at least 70% eligibility to be accepted directly');
        return;
      }
    } else if (action === 'waitlist') {
      if (app.eligibilityScore >= 50) {
        newStatus = 'waiting';
        message = 'Place this student on the waiting list?';
      } else {
        setError('Student must have at least 50% eligibility to be waitlisted');
        return;
      }
    } else if (action === 'reject') {
      newStatus = 'rejected';
      message = 'Are you sure you want to reject this application?';
    }
    
    if (!window.confirm(message)) return;
    
    setProcessing(appId);
    setError('');
    
    try {
      await updateApplicationStatus(appId, newStatus);
      await fetchApplications();
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update application status');
    } finally {
      setProcessing(null);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      accepted: 'badge-success',
      rejected: 'badge-danger',
      waiting: 'badge-info'
    };
    return badges[status] || 'badge-secondary';
  };

  const getEligibilityBadge = (score) => {
    if (score >= 70) return { class: 'badge-success', text: 'Highly Eligible' };
    if (score >= 50) return { class: 'badge-warning', text: 'Eligible for Waitlist' };
    return { class: 'badge-danger', text: 'Not Eligible' };
  };

  if (loading) {
    return (
      <div className="theme-institute">
        <div className="container">
          <div className="spinner"></div>
          <p className="loading-text">Loading applications...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="theme-institute">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <h1 style={{ marginBottom: 'var(--spacing-md)' }}>Manage Applications</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Filter Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-sm)', 
          marginBottom: 'var(--spacing-lg)',
          borderBottom: '2px solid var(--border-color)'
        }}>
          {['all', 'pending', 'accepted', 'waiting', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-md)',
                background: 'none',
                border: 'none',
                borderBottom: filter === status ? '2px solid var(--primary-color)' : '2px solid transparent',
                color: filter === status ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: filter === status ? 600 : 400,
                cursor: 'pointer',
                marginBottom: '-2px',
                textTransform: 'capitalize'
              }}
            >
              {status} ({applications.filter(a => status === 'all' || a.status === status).length})
            </button>
          ))}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <p className="text-muted">No {filter !== 'all' ? filter : ''} applications found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            {filteredApplications.map(app => (
              <div key={app.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                  <div>
                    <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>{app.studentName || 'Unknown Student'}</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>{app.studentEmail}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      Course: <strong>{app.courseName || app.courseId}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${getStatusBadge(app.status)}`} style={{ marginBottom: 'var(--spacing-xs)' }}>
                      {app.status?.toUpperCase()}
                    </span>
                    <div>
                      <span className={`badge ${getEligibilityBadge(app.eligibilityScore).class}`}>
                        {app.eligibilityScore}% - {getEligibilityBadge(app.eligibilityScore).text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Student Details */}
                <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', backgroundColor: 'var(--background-color)', borderRadius: '4px' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>Academic Information</h4>
                  {app.studentProfile.academicPerformance && (
                    <p style={{ fontSize: '0.875rem' }}>
                      <strong>GPA:</strong> {app.studentProfile.academicPerformance.gpa || 'N/A'} | 
                      <strong> Level:</strong> {app.studentProfile.academicPerformance.level || 'N/A'}
                    </p>
                  )}
                  {app.studentProfile.highSchool && (
                    <p style={{ fontSize: '0.875rem' }}>
                      <strong>High School:</strong> {app.studentProfile.highSchool.name || 'N/A'} ({app.studentProfile.highSchool.graduationYear})
                    </p>
                  )}
                  {app.motivation && (
                    <div style={{ marginTop: 'var(--spacing-sm)' }}>
                      <strong>Motivation:</strong>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        {app.motivation.substring(0, 200)}...
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {app.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    {app.eligibilityScore >= 70 && (
                      <button
                        className="btn btn-success"
                        onClick={() => handleAction(app.id, 'accept')}
                        disabled={processing === app.id}
                      >
                        Accept (70%+)
                      </button>
                    )}
                    {app.eligibilityScore >= 50 && app.eligibilityScore < 70 && (
                      <button
                        className="btn btn-warning"
                        onClick={() => handleAction(app.id, 'waitlist')}
                        disabled={processing === app.id}
                      >
                        Waitlist (50%+)
                      </button>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => handleAction(app.id, 'reject')}
                      disabled={processing === app.id}
                    >
                      Reject
                    </button>
                  </div>
                )}

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-md)' }}>
                  Applied: {app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ManageApplications;
