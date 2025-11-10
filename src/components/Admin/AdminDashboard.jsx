import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalInstitutions: 0,
    totalCompanies: 0,
    totalStudents: 0,
    totalApplications: 0,
    pendingCompanies: 0,
    activeJobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch institutions
      const institutionsSnap = await getDocs(collection(db, 'institutions'));
      const totalInstitutions = institutionsSnap.size;

      // Fetch all users to count by role
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(doc => doc.data());
      
      const totalStudents = users.filter(u => u.role === 'student').length;
      const totalCompanies = users.filter(u => u.role === 'company').length;
      const pendingCompanies = users.filter(u => u.role === 'company' && u.status === 'pending').length;

      // Fetch applications
      const applicationsSnap = await getDocs(collection(db, 'applications'));
      const totalApplications = applicationsSnap.size;

      // Fetch active jobs
      const jobsSnap = await getDocs(collection(db, 'jobs'));
      const activeJobs = jobsSnap.size;

      setStats({
        totalInstitutions,
        totalCompanies,
        totalStudents,
        totalApplications,
        pendingCompanies,
        activeJobs
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-admin">
        <div className="container">
          <div className="spinner"></div>
          <p className="loading-text">Loading admin dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="theme-admin">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <h1>Admin Dashboard</h1>
        <p className="text-muted">System Overview & Management</p>

        {/* Stats Grid */}
        <div className="grid grid-4" style={{ marginTop: 'var(--spacing-xl)' }}>
          <div className="card">
            <h3 style={{ color: 'var(--primary-color)', marginBottom: 'var(--spacing-sm)' }}>
              {stats.totalInstitutions}
            </h3>
            <p className="text-muted">Total Institutions</p>
          </div>

          <div className="card">
            <h3 style={{ color: 'var(--success-color)', marginBottom: 'var(--spacing-sm)' }}>
              {stats.totalStudents}
            </h3>
            <p className="text-muted">Registered Students</p>
          </div>

          <div className="card">
            <h3 style={{ color: 'var(--warning-color)', marginBottom: 'var(--spacing-sm)' }}>
              {stats.totalCompanies}
            </h3>
            <p className="text-muted">Total Companies</p>
            {stats.pendingCompanies > 0 && (
              <span className="badge badge-warning" style={{ marginTop: 'var(--spacing-xs)' }}>
                {stats.pendingCompanies} Pending Approval
              </span>
            )}
          </div>

          <div className="card">
            <h3 style={{ color: 'var(--info-color)', marginBottom: 'var(--spacing-sm)' }}>
              {stats.totalApplications}
            </h3>
            <p className="text-muted">Total Applications</p>
          </div>
        </div>

        {/* Management Actions */}
        <div className="grid grid-3" style={{ marginTop: 'var(--spacing-xl)' }}>
          <Link to="/admin/institutions" className="card card-hover" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>🏫</div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Manage Institutions</h3>
            <p className="text-muted">Add, edit, or remove institutions, faculties, and courses</p>
          </Link>

          <Link to="/admin/companies" className="card card-hover" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>🏢</div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Manage Companies</h3>
            <p className="text-muted">Approve, suspend, or delete company accounts</p>
            {stats.pendingCompanies > 0 && (
              <span className="badge badge-danger" style={{ marginTop: 'var(--spacing-sm)' }}>
                {stats.pendingCompanies} Pending
              </span>
            )}
          </Link>

          <Link to="/admin/reports" className="card card-hover" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>📊</div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>System Reports</h3>
            <p className="text-muted">View detailed analytics and system reports</p>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
          <h3 className="card-title">Quick Stats</h3>
          <div className="grid grid-2" style={{ marginTop: 'var(--spacing-md)' }}>
            <div>
              <p className="text-muted">Active Job Postings</p>
              <h4>{stats.activeJobs}</h4>
            </div>
            <div>
              <p className="text-muted">Admission Applications</p>
              <h4>{stats.totalApplications}</h4>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
