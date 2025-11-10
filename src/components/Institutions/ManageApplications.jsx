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

  const statusIcons = {
    all: '📋',
    pending: '⏳',
    accepted: '✅',
    waiting: '📝',
    rejected: '❌'
  };

  return (
    <div className="theme-institute">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-xl)' }}>
        {/* Header with Gradient */}
        <div className="card gradient-bg" style={{ 
          padding: 'var(--spacing-xl)',
          color: 'white',
          marginBottom: 'var(--spacing-xl)',
          borderRadius: '20px'
        }}>
          <h1 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', fontSize: '2rem' }}>
            📝 Manage Applications
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '1.1rem' }}>
            Review and process student applications to your institution
          </p>
        </div>

        {error && (
          <div className="alert alert-danger shadow-md" style={{ 
            borderRadius: '12px',
            marginBottom: 'var(--spacing-lg)'
          }}>
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              📋
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {applications.length}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Total</div>
          </div>

          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              ⏳
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {applications.filter(a => a.status === 'pending').length}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Pending</div>
          </div>

          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              ✅
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
              {applications.filter(a => a.status === 'accepted').length}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Accepted</div>
          </div>

          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              📝
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {applications.filter(a => a.status === 'waiting').length}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Waiting</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="card shadow-md" style={{ 
          display: 'flex', 
          gap: 'var(--spacing-sm)', 
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          borderRadius: '12px',
          flexWrap: 'wrap'
        }}>
          {['all', 'pending', 'accepted', 'waiting', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`btn ${filter === status ? 'btn-primary' : 'btn-outline'} hover-scale-sm`}
              style={{
                textTransform: 'capitalize',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)'
              }}
            >
              {statusIcons[status]} {status} ({applications.filter(a => status === 'all' || a.status === status).length})
            </button>
          ))}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="card shadow-sm" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', borderRadius: '12px' }}>
            <p className="text-muted" style={{ margin: 0, fontSize: '1.1rem' }}>
              📋 No {filter !== 'all' ? filter : ''} applications found.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            {filteredApplications.map(app => (
              <div 
                key={app.id} 
                className="card shadow-md hover-lift transition-all" 
                style={{ 
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, white 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.15)'
                }}
              >
                <div style={{ 
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  borderRadius: '16px 16px 0 0',
                  marginBottom: 'var(--spacing-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-md)'
                }}>
                  <div>
                    <h3 style={{ margin: 0, marginBottom: 'var(--spacing-xs)', color: 'var(--primary-color)', fontSize: '1.3rem' }}>
                      👤 {app.studentName || 'Unknown Student'}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                      📧 {app.studentEmail}
                    </p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      📚 <strong>{app.courseName || app.courseId}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                    <span className={`badge ${getStatusBadge(app.status)}`} style={{ 
                      padding: '0.4rem 0.9rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {statusIcons[app.status] || '📋'} {app.status?.toUpperCase()}
                    </span>
                    <span className={`badge ${getEligibilityBadge(app.eligibilityScore).class}`} style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      📊 {app.eligibilityScore}% - {getEligibilityBadge(app.eligibilityScore).text}
                    </span>
                  </div>
                </div>

                {/* Student Details */}
                <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-lg)', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--primary-color)' }}>
                    <span className="icon-badge" style={{ fontSize: '1rem' }}>🎓</span>
                    Academic Information
                  </h4>
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
                  <div style={{ 
                    display: 'flex', 
                    gap: 'var(--spacing-sm)', 
                    flexWrap: 'wrap',
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--background-secondary)',
                    borderRadius: '12px',
                    marginTop: 'var(--spacing-md)'
                  }}>
                    {app.eligibilityScore >= 70 && (
                      <button
                        className="btn btn-success hover-scale-sm"
                        onClick={() => handleAction(app.id, 'accept')}
                        disabled={processing === app.id}
                      >
                        ✅ Accept (70%+)
                      </button>
                    )}
                    {app.eligibilityScore >= 50 && app.eligibilityScore < 70 && (
                      <button
                        className="btn btn-warning hover-scale-sm"
                        onClick={() => handleAction(app.id, 'waitlist')}
                        disabled={processing === app.id}
                      >
                        📝 Waitlist (50%+)
                      </button>
                    )}
                    <button
                      className="btn btn-danger hover-scale-sm"
                      onClick={() => handleAction(app.id, 'reject')}
                      disabled={processing === app.id}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  📅 Applied: {app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
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
