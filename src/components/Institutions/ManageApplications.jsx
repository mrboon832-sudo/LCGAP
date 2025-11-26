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
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
          
          // Fetch student profile for grades and name
          let studentProfile = {};
          let studentName = appData.studentName || 'Unknown Student';
          let studentEmail = appData.studentEmail || '';
          
          if (appData.studentId) {
            try {
              const studentDoc = await getDoc(doc(db, 'users', appData.studentId));
              if (studentDoc.exists()) {
                studentProfile = studentDoc.data();
                // Use student name from profile if not in appData
                if (!appData.studentName) {
                  studentName = studentProfile.name || studentProfile.displayName || 'Unknown Student';
                }
                if (!appData.studentEmail) {
                  studentEmail = studentProfile.email || '';
                }
              }
            } catch (err) {
              console.error('Error fetching student:', err);
            }
          }
          
          // Use saved qualificationScore if available, otherwise calculate eligibility
          const eligibilityScore = appData.qualificationScore || calculateEligibility(studentProfile);
          
          // Fetch course name if not in appData
          let courseName = appData.courseName || '';
          if (!courseName && appData.courseId && appData.facultyId) {
            try {
              const courseDoc = await getDoc(doc(db, 'institutions', appData.institutionId, 'faculties', appData.facultyId, 'courses', appData.courseId));
              if (courseDoc.exists()) {
                courseName = courseDoc.data().name || appData.courseId;
              }
            } catch (err) {
              console.error('Error fetching course:', err);
              courseName = appData.courseId;
            }
          } else if (!courseName) {
            courseName = appData.courseId;
          }
          
          return {
            id: appDoc.id,
            ...appData,
            studentProfile,
            studentName,
            studentEmail,
            courseName,
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
    let breakdown = { highSchool: 0, academic: 0, certificates: 0, experience: 0, subjects: 0 };
    
    // High school GPA (35 points) - Enhanced scoring
    if (profile.highSchool && profile.highSchool.gpa) {
      const hsGpa = parseFloat(profile.highSchool.gpa);
      if (!isNaN(hsGpa)) {
        // For GPA scale (typically 0-4.0 or 0-5.0)
        if (hsGpa <= 5.0) {
          if (hsGpa >= 4.0) breakdown.highSchool = 35;
          else if (hsGpa >= 3.5) breakdown.highSchool = 30;
          else if (hsGpa >= 3.0) breakdown.highSchool = 25;
          else if (hsGpa >= 2.5) breakdown.highSchool = 18;
          else if (hsGpa >= 2.0) breakdown.highSchool = 10;
          else breakdown.highSchool = 5;
        }
        // For percentage scale (0-100)
        else if (hsGpa <= 100) {
          if (hsGpa >= 85) breakdown.highSchool = 35;
          else if (hsGpa >= 75) breakdown.highSchool = 30;
          else if (hsGpa >= 65) breakdown.highSchool = 25;
          else if (hsGpa >= 55) breakdown.highSchool = 18;
          else if (hsGpa >= 50) breakdown.highSchool = 10;
          else breakdown.highSchool = 5;
        }
      }
    }
    
    // High school subjects with grades (15 points)
    if (profile.highSchool && profile.highSchool.subjects && profile.highSchool.subjects.length > 0) {
      const subjectsCount = profile.highSchool.subjects.length;
      const avgGrade = profile.highSchool.subjects.reduce((sum, subj) => {
        const grade = parseFloat(subj.grade);
        return sum + (isNaN(grade) ? 0 : grade);
      }, 0) / subjectsCount;
      
      if (subjectsCount >= 5) {
        if (avgGrade >= 80 || avgGrade >= 3.5) breakdown.subjects = 15;
        else if (avgGrade >= 70 || avgGrade >= 3.0) breakdown.subjects = 12;
        else if (avgGrade >= 60 || avgGrade >= 2.5) breakdown.subjects = 8;
        else breakdown.subjects = 5;
      } else if (subjectsCount >= 3) {
        breakdown.subjects = 8;
      } else {
        breakdown.subjects = 5;
      }
    }
    
    // Current academic performance (30 points)
    if (profile.academicPerformance && profile.academicPerformance.gpa) {
      const gpa = parseFloat(profile.academicPerformance.gpa || 0);
      if (!isNaN(gpa)) {
        if (gpa <= 5.0) {
          if (gpa >= 3.7) breakdown.academic = 30;
          else if (gpa >= 3.3) breakdown.academic = 25;
          else if (gpa >= 3.0) breakdown.academic = 20;
          else if (gpa >= 2.5) breakdown.academic = 15;
          else if (gpa >= 2.0) breakdown.academic = 8;
          else breakdown.academic = 3;
        } else if (gpa <= 100) {
          if (gpa >= 85) breakdown.academic = 30;
          else if (gpa >= 75) breakdown.academic = 25;
          else if (gpa >= 65) breakdown.academic = 20;
          else if (gpa >= 55) breakdown.academic = 15;
          else breakdown.academic = 8;
        }
      }
    }
    
    // Certificates (10 points)
    if (profile.certificates && profile.certificates.length > 0) {
      breakdown.certificates = Math.min(profile.certificates.length * 3, 10);
    }
    
    // Work experience (10 points)
    if (profile.workExperience && profile.workExperience.length > 0) {
      breakdown.experience = Math.min(profile.workExperience.length * 3, 10);
    }
    
    // Calculate total
    score = breakdown.highSchool + breakdown.subjects + breakdown.academic + breakdown.certificates + breakdown.experience;
    
    return Math.min(score, 100);
  };

  const handleAction = async (appId, action) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    
    let message = '';
    let newStatus = '';
    
    if (action === 'accept') {
      if (app.eligibilityScore >= 60) {
        newStatus = 'accepted';
        message = 'Are you sure you want to accept this student?';
      } else {
        setError('Student must have at least 60% eligibility to be accepted directly');
        return;
      }
    } else if (action === 'waitlist') {
      if (app.eligibilityScore >= 40) {
        newStatus = 'waiting';
        message = 'Place this student on the waiting list?';
      } else {
        setError('Student must have at least 40% eligibility to be waitlisted');
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
    if (score >= 75) return { class: 'badge-success', text: 'Highly Qualified' };
    if (score >= 60) return { class: 'badge-success', text: 'Qualified' };
    if (score >= 40) return { class: 'badge-warning', text: 'Eligible for Waitlist' };
    return { class: 'badge-danger', text: 'Below Requirements' };
  };

  const handleViewDetails = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApp(null);
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
                <div style={{ 
                  display: 'flex', 
                  gap: 'var(--spacing-sm)', 
                  flexWrap: 'wrap',
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--background-secondary)',
                  borderRadius: '12px',
                  marginTop: 'var(--spacing-md)'
                }}>
                  <button
                    className="btn btn-primary hover-scale-sm"
                    onClick={() => handleViewDetails(app)}
                  >
                    👁️ View Details
                  </button>
                  
                  {app.status === 'pending' && (
                    <>
                      {app.eligibilityScore >= 60 && (
                        <button
                          className="btn btn-success hover-scale-sm"
                          onClick={() => handleAction(app.id, 'accept')}
                          disabled={processing === app.id}
                        >
                          ✅ Accept (60%+)
                        </button>
                      )}
                      {app.eligibilityScore >= 40 && app.eligibilityScore < 60 && (
                        <button
                          className="btn btn-warning hover-scale-sm"
                          onClick={() => handleAction(app.id, 'waitlist')}
                          disabled={processing === app.id}
                        >
                          📝 Waitlist (40-59%)
                        </button>
                      )}
                      <button
                        className="btn btn-danger hover-scale-sm"
                        onClick={() => handleAction(app.id, 'reject')}
                        disabled={processing === app.id}
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  📅 Applied: {app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {showModal && selectedApp && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
              <div className="modal-header gradient-bg" style={{ color: 'white' }}>
                <h2 style={{ margin: 0 }}>👤 Application Details</h2>
                <button className="close-btn" onClick={closeModal} style={{ color: 'white' }}>&times;</button>
              </div>

              <div className="modal-body">
                {/* Student Info */}
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, white 100%)' }}>
                  <h3 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    <span className="icon-badge">👤</span> Student Information
                  </h3>
                  <div className="grid grid-2">
                    <div>
                      <p><strong>Name:</strong> {selectedApp.studentProfile?.displayName || selectedApp.studentName || 'N/A'}</p>
                      <p><strong>Email:</strong> {selectedApp.studentProfile?.email || selectedApp.studentEmail || 'N/A'}</p>
                      <p><strong>Phone:</strong> {selectedApp.studentProfile?.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p><strong>Date of Birth:</strong> {selectedApp.studentProfile?.dateOfBirth || 'N/A'}</p>
                      <p><strong>Gender:</strong> {selectedApp.studentProfile?.gender || 'N/A'}</p>
                      <p><strong>Address:</strong> {selectedApp.studentProfile?.address || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedApp.studentProfile?.fieldsOfWork && selectedApp.studentProfile.fieldsOfWork.length > 0 && (
                    <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
                      <p><strong>Fields of Work Interest:</strong> {selectedApp.studentProfile.fieldsOfWork.join(', ')}</p>
                    </div>
                  )}
                  {selectedApp.studentProfile?.bio && (
                    <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
                      <p><strong>Bio:</strong></p>
                      <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{selectedApp.studentProfile.bio}</p>
                    </div>
                  )}
                </div>

                {/* Academic Performance */}
                {selectedApp.studentProfile?.academicPerformance && (
                  <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      <span className="icon-badge">🎓</span> Academic Performance
                    </h3>
                    <div className="grid grid-2">
                      <p><strong>GPA:</strong> {selectedApp.studentProfile.academicPerformance.gpa || 'N/A'}</p>
                      <p><strong>Level:</strong> {selectedApp.studentProfile.academicPerformance.level || 'N/A'}</p>
                      <p><strong>Major:</strong> {selectedApp.studentProfile.academicPerformance.major || 'N/A'}</p>
                      <p><strong>Institution:</strong> {selectedApp.studentProfile.academicPerformance.institution || 'N/A'}</p>
                    </div>
                  </div>
                )}

                {/* High School */}
                {selectedApp.studentProfile?.highSchool && (
                  <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      <span className="icon-badge">🏫</span> High School
                    </h3>
                    <p><strong>School:</strong> {selectedApp.studentProfile.highSchool.name || 'N/A'}</p>
                    <p><strong>Location:</strong> {selectedApp.studentProfile.highSchool.location || 'N/A'}</p>
                    <p><strong>Graduation Year:</strong> {selectedApp.studentProfile.highSchool.graduationYear || 'N/A'}</p>
                    <p><strong>GPA:</strong> {selectedApp.studentProfile.highSchool.gpa || 'N/A'}</p>
                    {selectedApp.studentProfile.highSchool.subjects && selectedApp.studentProfile.highSchool.subjects.length > 0 && (
                      <div style={{ marginTop: 'var(--spacing-sm)' }}>
                        <strong>Subjects ({selectedApp.studentProfile.highSchool.subjects.length}):</strong>
                        <div style={{ marginTop: 'var(--spacing-xs)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                          {selectedApp.studentProfile.highSchool.subjects.map((subj, idx) => (
                            <span key={idx} className="badge" style={{ fontSize: '0.875rem' }}>
                              {typeof subj === 'string' ? subj : `${subj.name} (${subj.grade})`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Certificates */}
                {selectedApp.studentProfile?.certificates && selectedApp.studentProfile.certificates.length > 0 && (
                  <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      <span className="icon-badge">📜</span> Certificates ({selectedApp.studentProfile.certificates.length})
                    </h3>
                    {selectedApp.studentProfile.certificates.map((cert, idx) => (
                      <div key={idx} style={{ marginBottom: 'var(--spacing-sm)', padding: 'var(--spacing-sm)', backgroundColor: 'var(--background-color)', borderRadius: '8px' }}>
                        <p><strong>{cert.name || 'Certificate'}</strong></p>
                        {cert.issuer && <p style={{ fontSize: '0.875rem' }}>Issued by: {cert.issuer}</p>}
                        {cert.dateIssued && <p style={{ fontSize: '0.875rem' }}>Date: {cert.dateIssued}</p>}
                        {cert.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{cert.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Work Experience */}
                {selectedApp.studentProfile?.workExperience && selectedApp.studentProfile.workExperience.length > 0 && (
                  <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      <span className="icon-badge">💼</span> Work Experience ({selectedApp.studentProfile.workExperience.length})
                    </h3>
                    {selectedApp.studentProfile.workExperience.map((exp, idx) => (
                      <div key={idx} style={{ marginBottom: 'var(--spacing-md)', paddingBottom: 'var(--spacing-md)', borderBottom: idx < selectedApp.studentProfile.workExperience.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <p><strong>{exp.title || exp.position || 'Position'}</strong> {exp.company && `at ${exp.company}`}</p>
                        {(exp.startDate || exp.endDate) && (
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            {exp.startDate || 'N/A'} - {exp.current ? 'Present' : (exp.endDate || 'N/A')}
                          </p>
                        )}
                        {exp.location && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>📍 {exp.location}</p>}
                        {exp.description && <p style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Motivation */}
                {selectedApp.motivation && (
                  <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      <span className="icon-badge">💡</span> Motivation
                    </h3>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{selectedApp.motivation}</p>
                  </div>
                )}

                {/* Eligibility Score */}
                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)' }}>
                  <h3 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    <span className="icon-badge">📊</span> Eligibility Assessment
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: selectedApp.eligibilityScore >= 70 ? '#10b981' : selectedApp.eligibilityScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                      {selectedApp.eligibilityScore}%
                    </div>
                    <div>
                      <span className={`badge ${getEligibilityBadge(selectedApp.eligibilityScore).class}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                        {getEligibilityBadge(selectedApp.eligibilityScore).text}
                      </span>
                      <p style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Based on academic performance, certificates, and experience
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons in Modal */}
                {selectedApp.status === 'pending' && (
                  <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                    {selectedApp.eligibilityScore >= 60 && (
                      <button
                        className="btn btn-success"
                        onClick={() => {
                          closeModal();
                          handleAction(selectedApp.id, 'accept');
                        }}
                        disabled={processing === selectedApp.id}
                      >
                        ✅ Accept Application (60%+)
                      </button>
                    )}
                    {selectedApp.eligibilityScore >= 40 && (
                      <button
                        className="btn btn-warning"
                        onClick={() => {
                          closeModal();
                          handleAction(selectedApp.id, 'waitlist');
                        }}
                        disabled={processing === selectedApp.id}
                      >
                        📝 Add to Waitlist (40%+)
                      </button>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        closeModal();
                        handleAction(selectedApp.id, 'reject');
                      }}
                      disabled={processing === selectedApp.id}
                    >
                      ❌ Reject Application
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ManageApplications;
