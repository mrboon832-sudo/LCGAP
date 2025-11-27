import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { getUserProfile } from './services/api';
import featureFlags from './config/featureFlags';

// Styles
import './styles/base.css';
import './styles/header.css';
import './styles/forms.css';
import './styles/themes.css';

// Critical components (loaded immediately)
import Header from './components/Layout/Header';
import LandingPage from './components/Home/LandingPage';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

// Lazy-loaded components (loaded on demand)
const VerifyEmailNotice = lazy(() => import('./components/Auth/VerifyEmailNotice'));
const StudentDashboard = lazy(() => import('./components/Dashboard/StudentDashboard'));
const InstituteDashboard = lazy(() => import('./components/Dashboard/InstituteDashboard'));
const CompanyDashboard = lazy(() => import('./components/Dashboard/CompanyDashboard'));
const InstitutionList = lazy(() => import('./components/Institutions/InstitutionList'));
const InstitutionProfile = lazy(() => import('./components/Institutions/InstitutionProfile'));
const FacultyCourses = lazy(() => import('./components/Institutions/FacultyCourses'));
const ManageFaculties = lazy(() => import('./components/Institutions/ManageFaculties'));
const ManageCourses = lazy(() => import('./components/Institutions/ManageCourses'));
const ManageInstitution = lazy(() => import('./components/Institutions/ManageInstitution'));
const ManageApplications = lazy(() => import('./components/Institutions/ManageApplications'));
const JobsPage = lazy(() => import('./components/Jobs/JobsPage'));
// Admin components
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const ManageInstitutions = lazy(() => import('./components/Admin/ManageInstitutions'));
const ManageCompanies = lazy(() => import('./components/Admin/ManageCompanies'));
const SystemReports = lazy(() => import('./components/Admin/SystemReports'));
const JobDetails = lazy(() => import('./components/Jobs/JobDetails'));
const JobApplyForm = lazy(() => import('./components/Jobs/JobApplyForm'));
const ManageJobs = lazy(() => import('./components/Jobs/ManageJobs'));
const ApplicationsPage = lazy(() => import('./components/Applications/ApplicationsPage'));
const ApplyForm = lazy(() => import('./components/Applications/ApplyForm'));
const ApplicantsPage = lazy(() => import('./components/Company/ApplicantsPage'));
const StudentProfile = lazy(() => import('./components/Profile/StudentProfile'));
const ViewProfile = lazy(() => import('./components/Profile/ViewProfile'));

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
        setUser(firebaseUser);
        setLoading(false); // Show UI immediately while profile loads
        
        // Fetch user profile from Firestore in background
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            console.error('User profile not found in Firestore');
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
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

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="spinner"></div>
      <p className="loading-text">Loading...</p>
    </div>
  );

  if (loading) {
    return <LoadingFallback />;
  }

  const DashboardRouter = () => {
    if (!userProfile) {
      return (
        <div className="container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div className="spinner"></div>
          <p className="loading-text">Loading your profile...</p>
        </div>
      );
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
      <Suspense fallback={<LoadingFallback />}>
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

        {/* Faculty Courses */}
        <Route
          path="/institutions/:institutionId/faculties/:facultyId"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <FacultyCourses />
              </>
            </ProtectedRoute>
          }
        />

        {/* Apply to Institution */}
        <Route
          path="/institutions/:institutionId/apply"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <ApplyForm user={userProfile} />
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

        {/* Manage Applications (Institute) */}
        <Route
          path="/manage-applications"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <ManageApplications user={user} institutionId={userProfile?.institutionId} />
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

        {/* Admin Routes */}
        <Route
          path="/admin/institutions"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <ManageInstitutions />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <ManageCompanies />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <SystemReports />
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

        {/* Profile Pages - Available for all authenticated users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header user={userProfile} onLogout={handleLogout} />
                <ViewProfile user={userProfile} />
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
                <StudentProfile user={userProfile} />
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
      </Suspense>
    </Router>
  );
}

export default App;
