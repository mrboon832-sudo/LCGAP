import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/header.css';

const Header = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          LCGAP
        </Link>

        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          ☰
        </button>

        <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/dashboard">Dashboard</Link>
          {user?.role === 'student' && (
            <>
              <Link to="/profile">My Profile</Link>
              <Link to="/institutions">Institutions</Link>
              <Link to="/jobs">Jobs</Link>
              <Link to="/applications">My Applications</Link>
            </>
          )}
          {user?.role === 'institute' && (
            <>
              <Link to="/faculties">Faculties</Link>
              <Link to="/courses">Courses</Link>
              <Link to="/applications">Applications</Link>
            </>
          )}
          {user?.role === 'company' && (
            <>
              <Link to="/manage-jobs">Manage Jobs</Link>
              <Link to="/applicants">Applicants</Link>
              <Link to="/jobs">Browse Jobs</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/institutions">Institutions</Link>
              <Link to="/companies">Companies</Link>
              <Link to="/users">Users</Link>
              <Link to="/jobs">Jobs</Link>
              <Link to="/applications">Applications</Link>
            </>
          )}
        </nav>

        <div className="header-user">
          <div>
            <div className="header-user-name">
              {user?.displayName || 'User'}
              {user?.role === 'company' && user?.companyName && (
                <span style={{ fontSize: '0.85em', color: 'rgba(255,255,255,0.7)' }}>
                  {' '}({user.companyName})
                </span>
              )}
            </div>
            <div className="header-user-role">{user?.role || 'N/A'}</div>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
