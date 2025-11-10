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
      const data = await getCourses(institutionId, selectedFaculty);
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
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
      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h1>Manage Courses</h1>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Create New Course
            </button>
          )}
        </div>

        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label htmlFor="facultySelect" className="form-label">Select Faculty</label>
          <select
            id="facultySelect"
            className="form-select"
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
          >
            {faculties.map(faculty => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name}
              </option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h2>{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
            <form onSubmit={handleSubmit}>
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

              <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                <button type="submit" className="btn btn-primary">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h2>Courses in {faculties.find(f => f.id === selectedFaculty)?.name} ({courses.length})</h2>
          {courses.length === 0 ? (
            <p className="text-muted">No courses yet. Create your first course above!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Level</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.id}>
                      <td>
                        <strong>{course.name}</strong>
                        {course.description && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {course.description.substring(0, 100)}
                            {course.description.length > 100 && '...'}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {course.level}
                        </span>
                      </td>
                      <td>{course.duration}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleEdit(course)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(course.id)}
                          >
                            Delete
                          </button>
                        </div>
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

export default ManageCourses;
