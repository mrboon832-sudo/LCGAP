import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Footer from '../Layout/Footer';
import '../../styles/base.css';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstitutions: 0,
    totalCompanies: 0,
    totalApplications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all collections in parallel using limit queries for better performance
      const [usersSnap, institutionsSnap, companiesSnap, applicationsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'institutions')),
        getDocs(collection(db, 'companies')),
        getDocs(collection(db, 'applications'))
      ]);

      setStats({
        totalUsers: usersSnap.size,
        totalInstitutions: institutionsSnap.size,
        totalCompanies: companiesSnap.size,
        totalApplications: applicationsSnap.size
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  return (
    <div className="theme-admin">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <h1>Admin Dashboard</h1>
        <p className="text-muted">Welcome back, {user?.displayName || 'Administrator'}</p>

      <div className="grid grid-4" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card">
          <h3 style={{ color: 'var(--primary-color)', marginBottom: 'var(--spacing-sm)' }}>
            {stats.totalUsers}
          </h3>
          <p className="text-muted">Total Users</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--success-color)', marginBottom: 'var(--spacing-sm)' }}>
            {stats.totalInstitutions}
          </h3>
          <p className="text-muted">Institutions</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--warning-color)', marginBottom: 'var(--spacing-sm)' }}>
            {stats.totalCompanies}
          </h3>
          <p className="text-muted">Companies</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--danger-color)', marginBottom: 'var(--spacing-sm)' }}>
            {stats.totalApplications}
          </h3>
          <p className="text-muted">Applications</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="flex gap-md flex-wrap">
          <button className="btn btn-primary">Add Institution</button>
          <button className="btn btn-secondary">Manage Users</button>
          <a href="/jobs" className="btn btn-outline">View Jobs</a>
          <a href="/applications" className="btn btn-outline">View Applications</a>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">System Information</h3>
        </div>
        <div className="alert alert-info">
          <p><strong>Role:</strong> Administrator</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Access Level:</strong> Full System Access</p>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
