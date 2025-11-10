import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const SystemReports = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({
    userRegistrations: {
      total: 0,
      students: 0,
      companies: 0,
      institutes: 0,
      admins: 0,
      byMonth: []
    },
    applications: {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      waiting: 0
    },
    institutions: {
      total: 0,
      totalFaculties: 0,
      totalCourses: 0,
      byType: {}
    },
    jobs: {
      total: 0,
      totalApplications: 0,
      byStatus: {}
    }
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Fetch Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const usersByRole = {
        students: users.filter(u => u.role === 'student').length,
        companies: users.filter(u => u.role === 'company').length,
        institutes: users.filter(u => u.role === 'institute').length,
        admins: users.filter(u => u.role === 'admin').length
      };

      // Calculate users by month (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const usersByMonth = users.reduce((acc, user) => {
        if (user.createdAt) {
          const date = new Date(user.createdAt.seconds * 1000);
          if (date > sixMonthsAgo) {
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            acc[monthYear] = (acc[monthYear] || 0) + 1;
          }
        }
        return acc;
      }, {});

      // Fetch Applications
      const applicationsSnap = await getDocs(collection(db, 'applications'));
      const applications = applicationsSnap.docs.map(doc => doc.data());
      
      const applicationsByStatus = {
        pending: applications.filter(a => a.status === 'pending').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        waiting: applications.filter(a => a.status === 'waiting').length
      };

      // Fetch Institutions
      const institutionsSnap = await getDocs(collection(db, 'institutions'));
      const institutions = institutionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const institutionsByType = institutions.reduce((acc, inst) => {
        acc[inst.type] = (acc[inst.type] || 0) + 1;
        return acc;
      }, {});

      // Fetch Faculties and Courses
      let totalFaculties = 0;
      let totalCourses = 0;
      
      for (const inst of institutions) {
        const facultiesSnap = await getDocs(collection(db, 'institutions', inst.id, 'faculties'));
        totalFaculties += facultiesSnap.size;
      }
      
      const coursesSnap = await getDocs(collection(db, 'courses'));
      totalCourses = coursesSnap.size;

      // Fetch Jobs
      const jobsSnap = await getDocs(collection(db, 'jobs'));
      const jobs = jobsSnap.docs.map(doc => doc.data());
      
      const jobsByStatus = jobs.reduce((acc, job) => {
        const status = job.status || 'active';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Fetch Job Applications
      const jobAppsSnap = await getDocs(collection(db, 'jobApplications'));

      setReports({
        userRegistrations: {
          total: users.length,
          ...usersByRole,
          byMonth: Object.entries(usersByMonth).map(([month, count]) => ({ month, count }))
        },
        applications: {
          total: applications.length,
          ...applicationsByStatus
        },
        institutions: {
          total: institutions.length,
          totalFaculties,
          totalCourses,
          byType: institutionsByType
        },
        jobs: {
          total: jobs.length,
          totalApplications: jobAppsSnap.size,
          byStatus: jobsByStatus
        }
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-admin">
        <div className="container">
          <div className="spinner"></div>
          <p className="loading-text">Generating reports...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="theme-admin">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <h1>System Reports</h1>
        <p className="text-muted">Comprehensive analytics and statistics</p>

        {/* User Registrations */}
        <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
          <h2 className="card-title">User Registrations</h2>
          <div className="grid grid-4" style={{ marginTop: 'var(--spacing-md)' }}>
            <div>
              <h3 style={{ color: 'var(--primary-color)' }}>{reports.userRegistrations.total}</h3>
              <p className="text-muted">Total Users</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--success-color)' }}>{reports.userRegistrations.students}</h3>
              <p className="text-muted">Students</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--warning-color)' }}>{reports.userRegistrations.companies}</h3>
              <p className="text-muted">Companies</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--info-color)' }}>{reports.userRegistrations.institutes}</h3>
              <p className="text-muted">Institutions</p>
            </div>
          </div>

          {reports.userRegistrations.byMonth.length > 0 && (
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-md)' }}>Registration Trend (Last 6 Months)</h3>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-end', height: '200px' }}>
                {reports.userRegistrations.byMonth.map(({ month, count }) => (
                  <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '100%',
                      height: `${(count / Math.max(...reports.userRegistrations.byMonth.map(m => m.count))) * 150}px`,
                      backgroundColor: 'var(--primary-color)',
                      borderRadius: '4px 4px 0 0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      padding: 'var(--spacing-xs)'
                    }}>
                      <strong style={{ color: 'white' }}>{count}</strong>
                    </div>
                    <p style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-xs)' }}>{month}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Applications */}
        <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
          <h2 className="card-title">Admission Applications</h2>
          <div className="grid grid-4" style={{ marginTop: 'var(--spacing-md)' }}>
            <div>
              <h3 style={{ color: 'var(--primary-color)' }}>{reports.applications.total}</h3>
              <p className="text-muted">Total Applications</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--warning-color)' }}>{reports.applications.pending}</h3>
              <p className="text-muted">Pending</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--success-color)' }}>{reports.applications.accepted}</h3>
              <p className="text-muted">Accepted</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--danger-color)' }}>{reports.applications.rejected}</h3>
              <p className="text-muted">Rejected</p>
            </div>
          </div>
        </div>

        {/* Institutions */}
        <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
          <h2 className="card-title">Institutions Overview</h2>
          <div className="grid grid-3" style={{ marginTop: 'var(--spacing-md)' }}>
            <div>
              <h3 style={{ color: 'var(--primary-color)' }}>{reports.institutions.total}</h3>
              <p className="text-muted">Total Institutions</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--info-color)' }}>{reports.institutions.totalFaculties}</h3>
              <p className="text-muted">Total Faculties</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--success-color)' }}>{reports.institutions.totalCourses}</h3>
              <p className="text-muted">Total Courses</p>
            </div>
          </div>

          {Object.keys(reports.institutions.byType).length > 0 && (
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-md)' }}>Institutions by Type</h3>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                {Object.entries(reports.institutions.byType).map(([type, count]) => (
                  <div key={type} className="badge badge-primary" style={{ fontSize: '1rem', padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                    {type}: {count}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Jobs */}
        <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
          <h2 className="card-title">Job Postings</h2>
          <div className="grid grid-3" style={{ marginTop: 'var(--spacing-md)' }}>
            <div>
              <h3 style={{ color: 'var(--primary-color)' }}>{reports.jobs.total}</h3>
              <p className="text-muted">Total Job Postings</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--success-color)' }}>{reports.jobs.totalApplications}</h3>
              <p className="text-muted">Total Applications</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--info-color)' }}>
                {reports.jobs.total > 0 ? (reports.jobs.totalApplications / reports.jobs.total).toFixed(1) : 0}
              </h3>
              <p className="text-muted">Avg. Applications per Job</p>
            </div>
          </div>

          {Object.keys(reports.jobs.byStatus).length > 0 && (
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-md)' }}>Jobs by Status</h3>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                {Object.entries(reports.jobs.byStatus).map(([status, count]) => (
                  <div key={status} className="badge" style={{ fontSize: '1rem', padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                    {status}: {count}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SystemReports;
