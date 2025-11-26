import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/base.css';
import '../../styles/landing.css';
import '../../styles/auth-background.css';

const LandingPage = () => {
  const [stats, setStats] = useState({ institutions: 0, students: 0, jobs: 0, applications: 0 });

  const backgroundImages = [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200'
  ];

  useEffect(() => {
    // Animate stats counter
    const timer = setTimeout(() => {
      animateValue('institutions', 0, 25, 2000);
      animateValue('students', 0, 500, 2000);
      animateValue('jobs', 0, 150, 2000);
      animateValue('applications', 0, 300, 2000);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, []);

  const animateValue = (key, start, end, duration) => {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
    }, 16);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-color)', position: 'relative' }}>
      {/* Animated Background with gradient overlay */}
      <div className="auth-background" style={{ position: 'absolute', height: '100vh' }}>
        {backgroundImages.map((img, index) => (
          <div
            key={index}
            className="auth-background-image"
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        {/* Gradient Overlay - Lighter Lesotho Flag Colors */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 40, 104, 0.75) 0%, rgba(0, 149, 67, 0.7) 100%)',
          zIndex: 1
        }}></div>
      </div>

      {/* Hero Section with Animation */}
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
        <div className="container hero-content">
          <div className="badge-floating" style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '8px 20px',
            borderRadius: '50px',
            marginBottom: 'var(--spacing-md)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            🇱🇸 Proudly Serving Lesotho
          </div>
          <h1 className="hero-title" style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 'bold',
            marginBottom: 'var(--spacing-md)',
            textShadow: '2px 4px 8px rgba(0,0,0,0.3)',
            lineHeight: '1.2',
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            Lesotho Career Guidance &<br />Advancement Platform
          </h1>
          <p className="hero-subtitle" style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
            marginBottom: 'var(--spacing-xl)',
            maxWidth: '800px',
            margin: '0 auto var(--spacing-xl)',
            textShadow: '1px 2px 4px rgba(0,0,0,0.3)',
            lineHeight: '1.6',
            animation: 'fadeInUp 0.8s ease-out 0.2s both'
          }}>
            Your one-stop platform for exploring educational opportunities and career pathways in Lesotho
          </p>
          <div style={{ 
            display: 'flex', 
            gap: 'var(--spacing-md)', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            animation: 'fadeInUp 0.8s ease-out 0.4s both'
          }}>
            <Link to="/signup" className="btn btn-primary btn-hero" style={{
              backgroundColor: 'white',
              color: '#002868',
              fontSize: '1.1rem',
              padding: '16px 48px',
              fontWeight: 600,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease'
            }}>
              Get Started →
            </Link>
            <Link to="/login" className="btn btn-secondary btn-hero" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '2px solid white',
              fontSize: '1.1rem',
              padding: '16px 48px',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}>
              Login
            </Link>
          </div>

          {/* Stats Counter */}
          <div style={{
            marginTop: '80px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 'var(--spacing-lg)',
            maxWidth: '800px',
            margin: '80px auto 0'
          }}>
            {[
              { label: 'Institutions', value: stats.institutions, suffix: '+' },
              { label: 'Students', value: stats.students, suffix: '+' },
              { label: 'Job Listings', value: stats.jobs, suffix: '+' },
              { label: 'Applications', value: stats.applications, suffix: '+' }
            ].map((stat, index) => (
              <div key={index} style={{
                animation: `fadeInUp 0.6s ease-out ${0.6 + index * 0.1}s both`
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {stat.value}{stat.suffix}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section with Glassmorphism */}
      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        backgroundColor: '#f8fafc', 
        padding: '100px 20px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
              marginBottom: 'var(--spacing-md)',
              color: '#1e293b',
              fontWeight: 700
            }}>
              Why Choose LCGAP?
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Everything you need to advance your education and career in one place
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--spacing-xl)'
          }}>
            {[
              {
                icon: '🎓',
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                title: 'Browse Institutions',
                description: 'Discover leading educational institutions offering various programs and courses'
              },
              {
                icon: '📝',
                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                title: 'Easy Applications',
                description: 'Apply to multiple institutions with a single profile and streamlined process'
              },
              {
                icon: '💼',
                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                title: 'Career Opportunities',
                description: 'Access job postings and internships from leading companies in Lesotho'
              },
              {
                icon: '🔐',
                gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                title: 'Secure Platform',
                description: 'Your data is protected with enterprise-grade security and privacy measures'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="feature-card-glass" 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: 'var(--spacing-xl)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  textAlign: 'center',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto var(--spacing-md)',
                  background: feature.gradient,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.3s ease'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ 
                  marginBottom: 'var(--spacing-sm)',
                  fontSize: '1.4rem',
                  color: '#1e293b',
                  fontWeight: 600
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section - Modern Timeline */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '100px 20px', 
        position: 'relative', 
        zIndex: 2 
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
              marginBottom: 'var(--spacing-md)',
              color: '#1e293b',
              fontWeight: 700
            }}>
              How It Works
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Get started in three simple steps
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-xl)',
            maxWidth: '1000px',
            margin: '0 auto',
            position: 'relative'
          }}>
            {[
              { num: '1', title: 'Create Account', desc: 'Sign up as a student, institution, or company', color: '#3b82f6' },
              { num: '2', title: 'Verify Email', desc: 'Confirm your email address to activate your account', color: '#8b5cf6' },
              { num: '3', title: 'Get Started', desc: 'Browse, apply, or post opportunities', color: '#10b981' }
            ].map((step, index) => (
              <div key={index} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}dd 100%)`,
                  color: 'white',
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  margin: '0 auto var(--spacing-md)',
                  boxShadow: `0 10px 30px ${step.color}40`,
                  transition: 'transform 0.3s ease'
                }}>{step.num}</div>
                <h3 style={{ 
                  marginBottom: 'var(--spacing-sm)', 
                  fontSize: '1.3rem',
                  color: '#1e293b',
                  fontWeight: 600
                }}>{step.title}</h3>
                <p style={{ color: '#64748b', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '100px 20px', 
        position: 'relative', 
        zIndex: 2 
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
              marginBottom: 'var(--spacing-md)',
              color: '#1e293b',
              fontWeight: 700
            }}>
              Success Stories
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Hear from students, institutions, and companies using LCGAP
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--spacing-xl)',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {[
              {
                quote: "LCGAP made it so easy to find the right institution and apply for courses. I got admitted to my dream program!",
                author: "Thato M.",
                role: "Student",
                color: '#10b981'
              },
              {
                quote: "Managing applications has never been simpler. The platform helps us connect with qualified students effortlessly.",
                author: "Limkokwing University",
                role: "Institution",
                color: '#3b82f6'
              },
              {
                quote: "We've found incredible talent through LCGAP. The platform streamlines our recruitment process.",
                author: "Lesotho Revenue Authority",
                role: "Employer",
                color: '#8b5cf6'
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: 'var(--spacing-xl)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  position: 'relative',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}>
                <div style={{
                  fontSize: '3rem',
                  color: testimonial.color,
                  opacity: 0.2,
                  position: 'absolute',
                  top: '20px',
                  left: '20px'
                }}>❝</div>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#475569',
                  lineHeight: 1.7,
                  marginBottom: 'var(--spacing-md)',
                  fontStyle: 'italic',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {testimonial.quote}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${testimonial.color} 0%, ${testimonial.color}dd 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{testimonial.author}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section - Enhanced */}
      <div style={{ 
        background: 'linear-gradient(135deg, #002868 0%, #009543 100%)',
        position: 'relative', 
        zIndex: 2,
        overflow: 'hidden'
      }}>
        <div className="container" style={{ 
          padding: '100px 20px', 
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{ 
            marginBottom: 'var(--spacing-md)', 
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'white',
            fontWeight: 700
          }}>
            Ready to Get Started?
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            marginBottom: 'var(--spacing-xl)', 
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto var(--spacing-xl)'
          }}>
            Join thousands of students, institutions, and employers shaping the future of Lesotho
          </p>
          <Link to="/signup" className="btn btn-hero" style={{ 
            fontSize: '1.1rem', 
            padding: '16px 48px',
            backgroundColor: 'white',
            color: '#002868',
            fontWeight: 600,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            border: 'none',
            transition: 'all 0.3s ease'
          }}>
            Create Your Account →
          </Link>
        </div>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: '-100px',
          right: '-100px'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          bottom: '-50px',
          left: '-50px'
        }}></div>
      </div>

      {/* Footer - Enhanced */}
      <footer style={{
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '60px 20px 30px',
        position: 'relative',
        zIndex: 2
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-xl)',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <div>
              <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.5rem', fontWeight: 700 }}>
                LCGAP
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7 }}>
                Empowering education and career connections in Lesotho
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <Link to="/signup" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}>Sign Up</Link>
                </li>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <Link to="/login" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}>Login</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>For Users</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: 'var(--spacing-sm)', color: 'rgba(255, 255, 255, 0.7)' }}>Students</li>
                <li style={{ marginBottom: 'var(--spacing-sm)', color: 'rgba(255, 255, 255, 0.7)' }}>Institutions</li>
                <li style={{ marginBottom: 'var(--spacing-sm)', color: 'rgba(255, 255, 255, 0.7)' }}>Companies</li>
              </ul>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: 'var(--spacing-lg)',
            textAlign: 'center'
          }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
              © 2025 LCGAP - Lesotho Career Guidance & Advancement Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
