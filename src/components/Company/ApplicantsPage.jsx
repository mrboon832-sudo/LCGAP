import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Link } from 'react-router-dom';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const ApplicantsPage = ({ user }) => {
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      const companyId = user?.companyId || user?.uid;
      
      if (!companyId) {
        setError('Company ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Fetch company's jobs
      const jobsRef = collection(db, 'jobs');
      const jobsQuery = query(jobsRef, where('companyId', '==', companyId));
      const jobsSnapshot = await getDocs(jobsQuery);
      
      const jobsData = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setJobs(jobsData);

      // Fetch all job applications for company's jobs
      const appsRef = collection(db, 'jobApplications');
      const allApplicants = [];
      
      for (const job of jobsData) {
        const appsQuery = query(appsRef, where('jobId', '==', job.id));
        const appsSnapshot = await getDocs(appsQuery);
        
        for (const appDoc of appsSnapshot.docs) {
          const appData = appDoc.data();
          
          // Fetch student profile to get academic performance and experience
          const studentRef = doc(db, 'users', appData.studentId);
          const studentSnap = await getDoc(studentRef);
          const studentData = studentSnap.exists() ? studentSnap.data() : {};
          
          // Calculate qualification score
          const qualificationScore = calculateQualificationScore(appData, studentData, job);
          
          allApplicants.push({
            id: appDoc.id,
            ...appData,
            jobTitle: job.title,
            jobId: job.id,
            studentName: studentData.displayName || appData.studentName || 'Unknown',
            studentEmail: studentData.email || appData.studentEmail,
            academicPerformance: studentData.academicPerformance || appData.academicPerformance,
            workExperience: studentData.workExperience || appData.workExperience || [],
            qualificationScore,
            isQualified: qualificationScore >= 70 // 70% threshold for interview
          });
        }
      }
      
      // Sort by qualification score (highest first)
      allApplicants.sort((a, b) => b.qualificationScore - a.qualificationScore);
      
      setApplicants(allApplicants);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError('Failed to load applicants. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Calculate qualification score based on requirements
  const calculateQualificationScore = (application, student, job) => {
    let score = 0;
    let maxScore = 100;
    
    // Field of Work Match (35 points) - Most important for job matching
    const applicationField = (application.fieldOfWork || '').toLowerCase();
    const studentFields = (application.fieldsOfWork || student.fieldsOfWork || []).map(f => f.toLowerCase());
    const jobTitle = (job.title || '').toLowerCase();
    const jobRequirements = (job.requirements || '').toLowerCase();
    const jobDescription = (job.description || '').toLowerCase();
    
    // Exact match with application field
    if (applicationField) {
      if (jobTitle.includes(applicationField) || 
          jobRequirements.includes(applicationField) || 
          jobDescription.includes(applicationField)) {
        score += 35; // Perfect match
      } else if (studentFields.some(field => 
          jobTitle.includes(field) || 
          jobRequirements.includes(field) || 
          jobDescription.includes(field))) {
        score += 25; // Profile fields match
      } else {
        score += 10; // Field specified but no match
      }
    } else if (studentFields.length > 0) {
      // Check if any student field matches
      if (studentFields.some(field => 
          jobTitle.includes(field) || 
          jobRequirements.includes(field) || 
          jobDescription.includes(field))) {
        score += 25;
      } else {
        score += 5; // Has fields but no match
      }
    }
    
    // Academic Performance (30 points)
    const gpa = parseFloat(
      student.highSchool?.gpa || 
      student.academicPerformance?.gpa || 
      student.academicPerformance?.grade || 
      0
    );
    if (gpa >= 3.5 || gpa >= 80) score += 30; // 3.5/4.0 or 80%+
    else if (gpa >= 3.0 || gpa >= 70) score += 22;
    else if (gpa >= 2.5 || gpa >= 60) score += 15;
    else if (gpa > 0) score += 8;
    
    // Work Experience (20 points)
    const experience = student.workExperience || application.workExperience || [];
    if (experience.length >= 3) score += 20;
    else if (experience.length === 2) score += 14;
    else if (experience.length === 1) score += 8;
    
    // Certificates (15 points)
    const certificates = student.certificates || application.certificates || [];
    if (certificates.length >= 3) score += 15;
    else if (certificates.length === 2) score += 10;
    else if (certificates.length === 1) score += 5;
    
    return Math.min(score, maxScore);
  };

  const getQualificationBadge = (score) => {
    if (score >= 65) return { class: 'badge-success', text: 'Qualified for Interview' };
    if (score >= 45) return { class: 'badge-warning', text: 'Under Review' };
    return { class: 'badge-danger', text: 'Not Qualified' };
  };

  const handleStatusUpdate = async (applicantId, newStatus) => {
    try {
      const appRef = doc(db, 'jobApplications', applicantId);
      await updateDoc(appRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const viewApplicantDetails = (applicant) => {
    setSelectedApplicant(applicant);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplicant(null);
  };

  const filteredApplicants = applicants.filter(app => {
    // Filter by qualification status
    if (filter === 'qualified' && !app.isQualified) return false;
    if (filter === 'under-review' && (app.qualificationScore < 50 || app.qualificationScore >= 70)) return false;
    if (filter === 'not-qualified' && app.qualificationScore >= 50) return false;
    
    // Filter by job
    if (selectedJob !== 'all' && app.jobId !== selectedJob) return false;
    
    return true;
  });

  if (loading) {
    return (
      <div className="theme-company">
        <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
          <div className="spinner"></div>
          <p className="loading-text">Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-company">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>Job Applicants</h1>
        <p className="text-muted">
          View filtered and qualified applicants based on academic performance, work experience, and job relevance
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Filter Controls */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        {/* Qualification Filter */}
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 'bold' }}>
            Filter by Qualification:
          </label>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('all')}
            >
              All ({applicants.length})
            </button>
            <button 
              className={`btn ${filter === 'qualified' ? 'btn-success' : 'btn-outline'}`}
              onClick={() => setFilter('qualified')}
            >
              Qualified for Interview ({applicants.filter(a => a.isQualified).length})
            </button>
            <button 
              className={`btn ${filter === 'under-review' ? 'btn-warning' : 'btn-outline'}`}
              onClick={() => setFilter('under-review')}
            >
              Under Review ({applicants.filter(a => a.qualificationScore >= 50 && a.qualificationScore < 70).length})
            </button>
            <button 
              className={`btn ${filter === 'not-qualified' ? 'btn-danger' : 'btn-outline'}`}
              onClick={() => setFilter('not-qualified')}
            >
              Not Qualified ({applicants.filter(a => a.qualificationScore < 50).length})
            </button>
          </div>
        </div>

        {/* Job Filter */}
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 'bold' }}>
            Filter by Job:
          </label>
          <select 
            value={selectedJob} 
            onChange={(e) => setSelectedJob(e.target.value)}
            className="form-input"
            style={{ maxWidth: '400px' }}
          >
            <option value="all">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title} ({applicants.filter(a => a.jobId === job.id).length} applicants)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applicants List */}
      {filteredApplicants.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <p className="text-muted">No applicants found matching your filters.</p>
          {applicants.length === 0 && (
            <Link to="/jobs/create" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
              Post a Job
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
          {filteredApplicants.map(applicant => {
            const qualBadge = getQualificationBadge(applicant.qualificationScore);
            
            return (
              <div key={applicant.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                      {applicant.studentName}
                    </h3>
                    <p className="text-muted" style={{ marginBottom: 'var(--spacing-xs)' }}>
                      Applied for: <strong>{applicant.jobTitle}</strong>
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                      {applicant.studentEmail}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '2rem', 
                      fontWeight: 'bold', 
                      color: applicant.isQualified ? 'var(--success-color)' : 'var(--warning-color)',
                      marginBottom: 'var(--spacing-xs)'
                    }}>
                      {applicant.qualificationScore}%
                    </div>
                    <span className={`badge ${qualBadge.class}`}>
                      {qualBadge.text}
                    </span>
                  </div>
                </div>

                {/* Qualification Breakdown */}
                <div style={{ 
                  padding: 'var(--spacing-md)', 
                  backgroundColor: 'var(--background-color)', 
                  borderRadius: 'var(--border-radius)',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  <h4 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', textTransform: 'uppercase' }}>
                    Qualification Breakdown
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-sm)' }}>
                    <div>
                      <strong>📚 Academic:</strong> {applicant.academicPerformance?.gpa || applicant.academicPerformance?.grade || 'N/A'}
                    </div>
                    <div>
                      <strong>💼 Experience:</strong> {applicant.workExperience?.length || 0} positions
                    </div>
                    <div>
                      <strong>🎯 Relevance:</strong> {applicant.qualificationScore >= 70 ? 'High' : applicant.qualificationScore >= 50 ? 'Medium' : 'Low'}
                    </div>
                  </div>
                </div>

                {/* Application Date */}
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)' }}>
                  Applied: {applicant.createdAt ? new Date(applicant.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => viewApplicantDetails(applicant)}
                  >
                    View Full Profile
                  </button>
                  {applicant.isQualified && (
                    <>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleStatusUpdate(applicant.id, 'interview')}
                      >
                        Schedule Interview
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => handleStatusUpdate(applicant.id, 'shortlisted')}
                      >
                        Shortlist
                      </button>
                    </>
                  )}
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleStatusUpdate(applicant.id, 'rejected')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="card" style={{ marginTop: 'var(--spacing-xl)', backgroundColor: 'var(--background-color)' }}>
        <h4 style={{ marginBottom: 'var(--spacing-md)' }}>📊 Qualification Scoring System</h4>
        <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
          <p><strong>Academic Performance (40%):</strong> GPA/Grade score</p>
          <p><strong>Work Experience (30%):</strong> Number and relevance of previous positions</p>
          <p><strong>Job Relevance (30%):</strong> Match between applicant's field and job requirements</p>
          <p style={{ marginTop: 'var(--spacing-md)', fontStyle: 'italic' }}>
            ✅ Applicants with 70% or higher are automatically qualified for interview consideration
          </p>
        </div>
      </div>

      {/* Applicant Details Modal */}
      {showModal && selectedApplicant && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--spacing-md)'
          }}
          onClick={closeModal}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: 'var(--spacing-xl)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: 'var(--spacing-md)',
                right: 'var(--spacing-md)',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              ×
            </button>

            {/* Header */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h2 style={{ marginBottom: 'var(--spacing-sm)' }}>{selectedApplicant.studentName}</h2>
              <p style={{ color: 'var(--text-muted)' }}>{selectedApplicant.studentEmail}</p>
              <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                Applied for: <strong>{selectedApplicant.jobTitle}</strong>
              </p>
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <span className={`badge ${selectedApplicant.isQualified ? 'badge-success' : 'badge-warning'}`}>
                  Qualification Score: {selectedApplicant.qualificationScore}%
                </span>
              </div>
            </div>

            {/* Academic Performance */}
            {selectedApplicant.academicPerformance && (
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.2rem' }}>📚 Academic Performance</h3>
                <div style={{ backgroundColor: 'var(--background-color)', padding: 'var(--spacing-md)', borderRadius: '4px' }}>
                  <p><strong>GPA/Grade:</strong> {selectedApplicant.academicPerformance.gpa || selectedApplicant.academicPerformance.grade || 'N/A'}</p>
                  <p><strong>Level:</strong> {selectedApplicant.academicPerformance.level || 'N/A'}</p>
                  {selectedApplicant.field && (
                    <p><strong>Field of Study:</strong> {selectedApplicant.field}</p>
                  )}
                </div>
              </div>
            )}

            {/* Work Experience */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.2rem' }}>💼 Work Experience</h3>
              {selectedApplicant.workExperience && selectedApplicant.workExperience.length > 0 ? (
                <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                  {selectedApplicant.workExperience.map((exp, index) => (
                    <div key={index} style={{ backgroundColor: 'var(--background-color)', padding: 'var(--spacing-md)', borderRadius: '4px' }}>
                      <p><strong>{exp.title}</strong></p>
                      <p style={{ color: 'var(--text-muted)' }}>{exp.company}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{exp.duration}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No work experience listed</p>
              )}
            </div>

            {/* Cover Letter */}
            {selectedApplicant.coverLetter && (
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.2rem' }}>✉️ Cover Letter</h3>
                <div style={{ backgroundColor: 'var(--background-color)', padding: 'var(--spacing-md)', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                  {selectedApplicant.coverLetter}
                </div>
              </div>
            )}

            {/* Skills/Availability */}
            {selectedApplicant.skills && (
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.2rem' }}>🎯 Skills</h3>
                <p style={{ backgroundColor: 'var(--background-color)', padding: 'var(--spacing-md)', borderRadius: '4px' }}>
                  {selectedApplicant.skills}
                </p>
              </div>
            )}

            {selectedApplicant.availability && (
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.2rem' }}>📅 Availability</h3>
                <p style={{ backgroundColor: 'var(--background-color)', padding: 'var(--spacing-md)', borderRadius: '4px' }}>
                  {selectedApplicant.availability}
                </p>
              </div>
            )}

            {/* Application Date */}
            <div style={{ marginBottom: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Applied on: {selectedApplicant.createdAt ? new Date(selectedApplicant.createdAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-outline"
                onClick={closeModal}
              >
                Close
              </button>
              {selectedApplicant.isQualified && (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      handleStatusUpdate(selectedApplicant.id, 'interview');
                      closeModal();
                    }}
                  >
                    Schedule Interview
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      handleStatusUpdate(selectedApplicant.id, 'shortlisted');
                      closeModal();
                    }}
                  >
                    Shortlist
                  </button>
                </>
              )}
              <button 
                className="btn btn-danger"
                onClick={() => {
                  handleStatusUpdate(selectedApplicant.id, 'rejected');
                  closeModal();
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
      <Footer />
    </div>
  );
};

export default ApplicantsPage;
