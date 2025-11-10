import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/base.css';
import '../../styles/landing.css';
import '../../styles/auth-background.css';

const LandingPage = () => {
  const backgroundImages = [
    'https://thumbs.dreamstime.com/b/african-high-school-children-teacher-classroom-lesson-cape-town-south-africa-december-african-high-school-children-135349659.jpg',
    'https://media.istockphoto.com/id/1440160796/photo/two-college-students-reading-a-textbook-during-computer-class.jpg?s=612x612&w=0&k=20&c=_gnYPqDC1Y4mJXRerGkXdpUh7UF2dtvmdXd00MT5CqM=',
    'https://www.shutterstock.com/image-photo/young-graduates-standing-front-university-600nw-172074950.jpg',
    'https://c8.alamy.com/comp/2BPG5T5/personnel-manager-and-young-job-applicant-shaking-hands-at-modern-company-office-2BPG5T5.jpg',
    'https://i0.wp.com/technologysalon.org/wp-content/uploads/2018/06/south-africa-youth-employment.png?resize=600%2C380'
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-color)', position: 'relative' }}>
      {/* Animated Background - only for hero section */}
      <div className="auth-background" style={{ position: 'absolute', height: '100vh' }}>
        {backgroundImages.map((img, index) => (
          <div
            key={index}
            className="auth-background-image"
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="container">
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: 'var(--spacing-md)',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}>
            Lesotho Career Guidance & Advancement Platform
          </h1>
          <p style={{
            fontSize: '1.5rem',
            marginBottom: 'var(--spacing-xl)',
            maxWidth: '800px',
            margin: '0 auto var(--spacing-xl)'
          }}>
            Your one-stop platform for exploring educational opportunities and career pathways in Lesotho
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary" style={{
              backgroundColor: 'white',
              color: 'var(--primary-color)',
              fontSize: '1.1rem',
              padding: '15px 40px'
            }}>
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              fontSize: '1.1rem',
              padding: '15px 40px'
            }}>
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ backgroundColor: 'var(--background-color)', position: 'relative', zIndex: 2 }}>
        <div className="container" style={{ padding: '60px 20px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', fontSize: '2.5rem' }}>
            What We Offer
          </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)'
        }}>
          {/* Feature 1 */}
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: 'var(--spacing-md)'
            }}>🎓</div>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Browse Institutions</h3>
            <p className="text-muted">
              Explore a comprehensive list of educational institutions in Lesotho, their programs, and admission requirements.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: 'var(--spacing-md)'
            }}>📝</div>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Easy Applications</h3>
            <p className="text-muted">
              Apply to up to 2 courses per institution with our streamlined application process. Track all your applications in one place.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: 'var(--spacing-md)'
            }}>💼</div>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Career Opportunities</h3>
            <p className="text-muted">
              Discover job postings and internship opportunities from companies looking for talented graduates.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: 'var(--spacing-md)'
            }}>🔐</div>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Secure Platform</h3>
            <p className="text-muted">
              Your data is protected with enterprise-grade security. Email verification and role-based access ensure safety.
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={{ backgroundColor: 'var(--card-background)', padding: '60px 20px', position: 'relative', zIndex: 2 }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', fontSize: '2.5rem' }}>
            How It Works
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-lg)',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: '0 auto var(--spacing-md)'
              }}>1</div>
              <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Create Account</h3>
              <p className="text-muted">Sign up as a student, institution, or company</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: '0 auto var(--spacing-md)'
              }}>2</div>
              <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Verify Email</h3>
              <p className="text-muted">Confirm your email address to activate your account</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: '0 auto var(--spacing-md)'
              }}>3</div>
              <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Get Started</h3>
              <p className="text-muted">Browse, apply, or post opportunities</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ backgroundColor: 'var(--background-color)', position: 'relative', zIndex: 2 }}>
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: '2.5rem' }}>
            Ready to Get Started?
          </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
          Your future starts here
        </p>
        <Link to="/signup" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '15px 40px' }}>
          Create Your Account
        </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#000000',
        color: 'white',
        padding: 'var(--spacing-lg) 20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        <div className="container">
          <p style={{ color: 'white', margin: '0 0 var(--spacing-sm) 0' }}>
            © 2025 LCGAP - Lesotho Career Guidance & Advancement Platform
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', margin: 0 }}>
            Empowering education and career connections in Lesotho
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
