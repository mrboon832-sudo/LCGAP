import React, { useState, useEffect } from 'react';
import { getFaculties, getCourses, createCourse, updateCourse, deleteCourse } from '../../services/api';
import Footer from '../Layout/Footer';
import '../../styles/base.css';
import '../../styles/forms.css';

const ManageCourses = ({ user, institutionId }) => {
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    level: 'undergraduate',
    requirements: ''
  });

  useEffect(() => {
    if (institutionId) {
      fetchFaculties();
    }
    // eslint-disable-next-line
  }, [institutionId]);

  useEffect(() => {
    if (selectedFaculty) {
      fetchCourses();
    }
    // eslint-disable-next-line
  }, [selectedFaculty]);

  const fetchFaculties = async () => {
    try {
      const data = await getFaculties(institutionId);
      setFaculties(data);
      if (data.length > 0) {
        setSelectedFaculty(data[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses for:', { institutionId, facultyId: selectedFaculty });
      const data = await getCourses({ 
        institutionId, 
        facultyId: selectedFaculty 
      });
      console.log('Courses fetched:', data);
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      console.error('Error details:', error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse(institutionId, selectedFaculty, editingCourse.id, formData);
      } else {
        await createCourse(institutionId, selectedFaculty, formData);
      }

      setShowForm(false);
      setEditingCourse(null);
      setFormData({
        name: '',
        description: '',
        duration: '',
        level: 'undergraduate',
        requirements: ''
      });
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course: ' + error.message);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name || '',
      description: course.description || '',
      duration: course.duration || '',
      level: course.level || 'undergraduate',
      requirements: course.requirements || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(institutionId, selectedFaculty, courseId);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course: ' + error.message);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
    setFormData({
      name: '',
      description: '',
      duration: '',
      level: 'undergraduate',
      requirements: ''
    });
  };

  if (loading) {
    return (
      <div className="theme-institute">
        <div className="container">
          <div className="spinner"></div>
          <p className="loading-text">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (faculties.length === 0) {
    return (
      <div className="theme-institute">
        <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
          <div className="alert alert-warning">
            <h3>No Faculties Found</h3>
            <p>You need to create faculties before you can add courses. Please create faculties first.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="theme-institute">
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-xl)' }}>
        {/* Header with Gradient */}
        <div className="card gradient-bg" style={{ 
          padding: 'var(--spacing-xl)',
          color: 'white',
          marginBottom: 'var(--spacing-xl)',
          borderRadius: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            <div>
              <h1 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', fontSize: '2rem' }}>
                📚 Manage Courses
              </h1>
              <p style={{ margin: 0, opacity: 0.95, fontSize: '1.1rem' }}>
                Create and manage your institution's course offerings
              </p>
            </div>
            {!showForm && (
              <button 
                className="btn btn-lg"
                onClick={() => setShowForm(true)}
                style={{ 
                  backgroundColor: 'white',
                  color: 'var(--primary-color)',
                  fontWeight: 600,
                  padding: 'var(--spacing-md) var(--spacing-xl)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                ➕ Create New Course
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-3" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              📖
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {courses.length}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Total Courses</div>
          </div>

          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              🏫
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {faculties.length}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Faculties</div>
          </div>

          <div className="card shadow-md hover-lift transition-all" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--spacing-sm)', fontSize: '1.5rem' }}>
              ✨
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              Active
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Status</div>
          </div>
        </div>

        {/* Faculty Selector */}
        <div className="card shadow-md" style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-lg)', borderRadius: '12px' }}>
          <label htmlFor="facultySelect" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
            <span className="icon-badge" style={{ fontSize: '1.2rem' }}>🎓</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Select Faculty</span>
          </label>
          <select
            id="facultySelect"
            className="form-input"
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            style={{ fontSize: '1rem' }}
          >
            {faculties.map(faculty => (
              <option key={faculty.id} value={faculty.id}>
                📚 {faculty.name}
              </option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="card shadow-md" style={{ 
            marginBottom: 'var(--spacing-lg)',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, white 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{
              padding: 'var(--spacing-lg)',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
              borderRadius: '16px 16px 0 0',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--primary-color)' }}>
                <span className="icon-badge" style={{ fontSize: '1.5rem' }}>{editingCourse ? '✏️' : '➕'}</span>
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '0 var(--spacing-lg) var(--spacing-lg)' }}>
              <div className="form-group">
                <label htmlFor="name" className="form-label form-label-required">Course Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Bachelor of Science in Computer Science"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the course"
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="duration" className="form-label form-label-required">Duration</label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    className="form-input"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 4 years"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="level" className="form-label form-label-required">Level</label>
                  <select
                    id="level"
                    name="level"
                    className="form-select"
                    value={formData.level}
                    onChange={handleChange}
                    required
                  >
                    <option value="certificate">Certificate</option>
                    <option value="diploma">Diploma</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="masters">Masters</option>
                    <option value="doctorate">Doctorate</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="requirements" className="form-label">Entry Requirements</label>
                <textarea
                  id="requirements"
                  name="requirements"
                  className="form-textarea"
                  rows="3"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="List entry requirements (one per line)"
                />
              </div>

              <div style={{ 
                display: 'flex', 
                gap: 'var(--spacing-md)', 
                marginTop: 'var(--spacing-xl)',
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--background-secondary)',
                borderRadius: '12px'
              }}>
                <button type="submit" className="btn btn-primary hover-scale-sm">
                  {editingCourse ? '💾 Update Course' : '✨ Create Course'}
                </button>
                <button type="button" className="btn btn-outline hover-scale-sm" onClick={handleCancel}>
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card shadow-md" style={{ borderRadius: '16px' }}>
          <div style={{
            padding: 'var(--spacing-lg)',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
            borderRadius: '16px 16px 0 0',
            borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <h2 style={{ 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              color: 'var(--primary-color)'
            }}>
              <span className="icon-badge" style={{ fontSize: '1.5rem' }}>📖</span>
              Courses in {faculties.find(f => f.id === selectedFaculty)?.name}
              <span style={{ 
                marginLeft: 'auto',
                fontSize: '1rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px'
              }}>
                {courses.length}
              </span>
            </h2>
          </div>
          <div style={{ padding: 'var(--spacing-lg)' }}>
          {courses.length === 0 ? (
            <p className="text-muted" style={{ margin: 0 }}>📋 No courses yet. Create your first course above!</p>
          ) : (
            <div className="grid grid-1" style={{ gap: 'var(--spacing-md)' }}>
              {courses.map(course => (
                <div
                  key={course.id}
                  className="card shadow-sm hover-lift transition-all"
                  style={{
                    padding: 'var(--spacing-lg)',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, white 100%)',
                    borderRadius: '12px',
                    border: '1px solid rgba(59, 130, 246, 0.15)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', color: 'var(--primary-color)', fontSize: '1.2rem' }}>
                        📚 {course.name}
                      </h3>
                      {course.description && (
                        <p style={{ margin: 0, marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                          {course.description.substring(0, 150)}
                          {course.description.length > 150 && '...'}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', marginTop: 'var(--spacing-md)' }}>
                        <span className="badge" style={{ 
                          backgroundColor: 'var(--primary-color)', 
                          color: 'white',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}>
                          🎓 {course.level}
                        </span>
                        <span className="badge" style={{ 
                          backgroundColor: 'var(--success-color)', 
                          color: 'white',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}>
                          ⏱️ {course.duration}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                      <button
                        className="btn btn-sm btn-outline hover-scale-sm"
                        onClick={() => handleEdit(course)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger hover-scale-sm"
                        onClick={() => handleDelete(course.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ManageCourses;
