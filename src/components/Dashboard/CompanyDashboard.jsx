import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const CompanyDashboard = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [qualifiedApplicants, setQualifiedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Use user.companyId instead of prop
      const companyId = user?.companyId || user?.uid;
      
      if (!companyId) {
        setLoading(false);
        return;
      }
      
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, where('companyId', '==', companyId));
      const querySnapshot = await getDocs(q);
      
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setJobs(jobsData);

      // Fetch job applications
      const appsRef = collection(db, 'jobApplications');
      const jobIds = jobsData.map(j => j.id);
      
      let allApplications = [];
      if (jobIds.length > 0) {
        // Fetch applications for each job
        for (const jobId of jobIds) {
          const appQuery = query(appsRef, where('jobId', '==', jobId));
          const appSnapshot = await getDocs(appQuery);
          const apps = appSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          allApplications.push(...apps);
        }
      }
      
      setApplications(allApplications);
      
      // Filter qualified applicants (ready for interview)
      const qualified = allApplications.filter(app => app.status === 'qualified' || app.isQualified);
      setQualifiedApplicants(qualified);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="theme-company">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <h1>Company Dashboard</h1>
        <p className="text-muted">Welcome back, {user.displayName}</p>

      <div className="grid grid-4" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card">
          <h3 style={{ color: 'var(--primary-color)', marginBottom: 'var(--spacing-sm)' }}>
            {jobs.length}
          </h3>
          <p className="text-muted">Active Job Posts</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--success-color)', marginBottom: 'var(--spacing-sm)' }}>
            {applications.length}
          </h3>
          <p className="text-muted">Total Applications</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--info-color)', marginBottom: 'var(--spacing-sm)' }}>
            {qualifiedApplicants.length}
          </h3>
          <p className="text-muted">Qualified for Interview</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--warning-color)', marginBottom: 'var(--spacing-sm)' }}>
            {applications.filter(a => a.status === 'pending').length}
          </h3>
          <p className="text-muted">Pending Review</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="flex gap-md flex-wrap">
          <Link to="/manage-jobs" className="btn btn-primary">
            Manage Job Postings
          </Link>
          <Link to="/applicants" className="btn btn-secondary">
            View Applicants
          </Link>
          <Link to="/jobs" className="btn btn-outline">
            Browse All Jobs
          </Link>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">Active Job Postings</h3>
        </div>
        {jobs.length === 0 ? (
          <div className="alert alert-info">
            <p>You haven't posted any jobs yet.</p>
            <Link to="/jobs/create" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="grid grid-2">
            {jobs.slice(0, 4).map((job) => (
              <div key={job.id} className="card" style={{ marginBottom: 0 }}>
                <h4>{job.title || 'Untitled Job'}</h4>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>
                  {job.description?.substring(0, 100) || 'No description'}...
                </p>
                <div className="flex justify-between align-center">
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Posted: {job.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                  </span>
                  <Link to={`/jobs/${job.id}`} className="btn btn-sm btn-outline">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {jobs.length > 4 && (
          <div className="text-center" style={{ marginTop: 'var(--spacing-md)' }}>
            <Link to="/jobs" className="btn btn-outline">
              View All Jobs
            </Link>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">Recent Applications</h3>
        </div>
        {applications.length === 0 ? (
          <div className="alert alert-info">
            <p>No applications received yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Applicant</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Job</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 10).map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: 'var(--spacing-sm)' }}>{app.studentId}</td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>{app.jobId}</td>
                    <td style={{ padding: 'var(--spacing-sm)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {app.appliedAt?.toDate?.().toLocaleDateString() || 'N/A'}
                    </td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>
                      <span className="badge badge-warning">{app.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default CompanyDashboard;
