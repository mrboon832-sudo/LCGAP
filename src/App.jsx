import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { getUserProfile } from './services/api';
import featureFlags from './config/featureFlags';

// Components
import Header from './components/Layout/Header';
import LandingPage from './components/Home/LandingPage';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import VerifyEmailNotice from './components/Auth/VerifyEmailNotice';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import InstituteDashboard from './components/Dashboard/InstituteDashboard';
import CompanyDashboard from './components/Dashboard/CompanyDashboard';
import InstitutionList from './components/Institutions/InstitutionList';
import InstitutionProfile from './components/Institutions/InstitutionProfile';
import ManageFaculties from './components/Institutions/ManageFaculties';
import ManageCourses from './components/Institutions/ManageCourses';
import ManageInstitution from './components/Institutions/ManageInstitution';
import JobsPage from './components/Jobs/JobsPage';
import JobDetails from './components/Jobs/JobDetails';
import JobApplyForm from './components/Jobs/JobApplyForm';
import ManageJobs from './components/Jobs/ManageJobs';
import ApplicationsPage from './components/Applications/ApplicationsPage';
import ApplicantsPage from './components/Company/ApplicantsPage';
import StudentProfile from './components/Profile/StudentProfile';
import ViewProfile from './components/Profile/ViewProfile';

// Styles
import './styles/base.css';
import './styles/header.css';
import './styles/forms.css';
import './styles/themes.css';

// Protected Route Component
const ProtectedRoute = ({ children, user, requireVerified = false }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Email verification no longer required for login
  return children;
};

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children, user }) => {
  // If feature flag is on, any authenticated user should be redirected away from public pages
  if (user && (featureFlags.bypassEmailVerification || user.emailVerified)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // User state will be cleared by onAuthStateChanged
      // Navigation handled by route protection
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  const DashboardRouter = () => {
    if (!userProfile) {
      return <div className="container"><p>Loading profile...</p></div>;
    }

    switch (userProfile.role) {
      case 'admin':
        return <AdminDashboard user={userProfile} />;
      case 'student':
        return <StudentDashboard user={userProfile} />;
      case 'institute':
        return <InstituteDashboard user={userProfile} institutionId={userProfile.institutionId} />;
      case 'company':
        return <CompanyDashboard user={userProfile} />;
      default:
        return <div className="container"><p>Invalid user role</p></div>;
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute user={user}>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute user={user}>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            // If bypass flag is enabled, skip the verify page entirely
            featureFlags.bypassEmailVerification
              ? <Navigate to="/dashboard" replace />
              : (user ? <VerifyEmailNotice user={user} /> : <Navigate to="/login" replace />)
          }
        />

        {/* Protected routes - with Header */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <DashboardRouter />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutions"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <InstitutionList />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutions/:institutionId"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <InstitutionProfile />
              </>
            </ProtectedRoute>
          }
        />

        {/* Jobs Page */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <JobsPage user={userProfile} />
              </>
            </ProtectedRoute>
          }
        />

        {/* Job Details Page */}
        <Route
          path="/jobs/:jobId"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <JobDetails user={userProfile} />
              </>
            </ProtectedRoute>
          }
        />

        {/* Job Apply Form */}
        <Route
          path="/jobs/:jobId/apply"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <JobApplyForm user={userProfile} />
              </>
            </ProtectedRoute>
          }
        />

        {/* Manage Jobs (Company) */}
        <Route
          path="/manage-jobs"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <ManageJobs user={userProfile} />
              </>
            </ProtectedRoute>
          }
        />

        {/* Manage Faculties (Institute) */}
        <Route
          path="/faculties"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <ManageFaculties user={userProfile} institutionId={userProfile?.institutionId} />
              </>
            </ProtectedRoute>
          }
        />

        {/* Manage Courses (Institute) */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <ManageCourses user={userProfile} institutionId={userProfile?.institutionId} />
              </>
            </ProtectedRoute>
          }
        />

        {/* Manage Institution (Institute) */}
        <Route
          path="/manage-institution"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <ManageInstitution />
              </>
            </ProtectedRoute>
          }
        />

        {/* Applications Page */}
        <Route
          path="/applications"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <ApplicationsPage user={userProfile} />
              </>
            </ProtectedRoute>
          }
        />

        {/* Applicants Page (for companies) */}
        <Route
          path="/applicants"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <ApplicantsPage user={userProfile} />
              </>
            </ProtectedRoute>
          }
        />

        {/* Student Profile Pages */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <ViewProfile />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <StudentProfile />
              </>
            </ProtectedRoute>
          }
        />

        {/* Home/Landing Page */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
              <div className="card">
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
