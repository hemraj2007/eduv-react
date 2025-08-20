// CourseDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import courseService from '../../services/courseService';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, Globe, Flag, Building, Hash, Github, Linkedin, Clock, FileText, X } from 'lucide-react';
import Moment from 'react-moment';
import Loader from '../../components/Loader';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImagePopup, setShowImagePopup] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const response = await courseService.getCourseById(id);
        console.log("API Response:", response);

        // Correctly access the course object from the response
        if (response && response.course) {
          setCourse(response.course);
          setError(null);
        } else {
          setError(response.message || 'Failed to load course data. Please try again.');
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    } else {
      setIsLoading(false);
      setError('No course ID provided.');
    }
  }, [id]);

  const handleBack = () => {
    navigate('/admin/course');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Loader title="Loading Course Details" subtitle="Please wait..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-error-container">
          <div className="admin-dashboard-error-message">{error}</div>
          <button onClick={handleBack} className="admin-dashboard-btn admin-dashboard-btn-primary">
            <ArrowLeft size={18} />
            Back to Courses
          </button>
        </div>
      </AdminLayout>
    );
  }

  // If the course is null after loading, display an error message
  if (!course) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-error-container">
          <div className="admin-dashboard-error-message">Course not found.</div>
          <button onClick={handleBack} className="admin-dashboard-btn admin-dashboard-btn-primary">
            <ArrowLeft size={18} />
            Back to Courses
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard-detail-container animated animate__animated animate__fadeIn">
        <div className="admin-dashboard-detail-header">
          <h1 className="admin-dashboard-detail-title">Course Details</h1>
        </div>

        <div className="admin-dashboard-detail-content">
          <div className="admin-dashboard-detail-card admin-dashboard-user-profile-card">
            <div className="admin-dashboard-user-profile-header">
              <div className="admin-dashboard-user-profile-image">
                {course.courseImage ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/${course.courseImage}`}
                    alt={course.name}
                    className="admin-dashboard-user-avatar-large round-image"
                    onClick={() => setShowImagePopup(true)}
                    style={{ cursor: 'pointer', borderRadius: '50%', width: '120px', height: '120px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/dummy-user.jpg';
                    }}
                  />
                ) : (
                  <div
                    className="admin-dashboard-user-avatar-placeholder"
                    style={{ borderRadius: '50%', width: '120px', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <User size={40} />
                  </div>
                )}
              </div>
              <div className="admin-dashboard-user-profile-info">
                <h2 className="admin-dashboard-user-profile-name">{course?.name}</h2>
                <div className="admin-dashboard-user-profile-status">
                  <span className={`admin-dashboard-status-badge ${course?.status === 'Y' ? 'active' : 'inactive'}`}>
                    {course?.status === 'Y' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-dashboard-detail-grid">
            <div className="admin-dashboard-detail-card">
              <div className="admin-dashboard-detail-card-header">
                <User size={18} />
                <h3>Course Information</h3>
              </div>
              <div className="admin-dashboard-detail-card-content">
                <div className="admin-dashboard-detail-item">
                  <div className="admin-dashboard-detail-item-label">
                    <User size={16} /> Course Name
                  </div>
                  <div className="admin-dashboard-detail-item-value">{course?.name || 'N/A'}</div>
                </div>
                <div className="admin-dashboard-detail-item">
                  <div className="admin-dashboard-detail-item-label">
                    <Clock size={16} /> Duration
                  </div>
                  <div className="admin-dashboard-detail-item-value">{course?.duration || 'N/A'}</div>
                </div>

              </div>

            </div>








            <div className="admin-dashboard-detail-card">
              <div className="admin-dashboard-detail-card-header">
                <Calendar size={18} />
                <h3>Fee Information</h3>
              </div>

              <div className="admin-dashboard-detail-card-content">

                <div className="admin-dashboard-detail-item">
                  <div className="admin-dashboard-detail-item-label">
                    <FileText size={16} /> Actual Fees
                  </div>
                  <div className="admin-dashboard-detail-item-value">{course?.actualFees || 'N/A'}</div>
                </div>
                <div className="admin-dashboard-detail-item">
                  <div className="admin-dashboard-detail-item-label">
                    <FileText size={16} /> Discount
                  </div>
                  <div className="admin-dashboard-detail-item-value">{course?.discount || 'N/A'}</div>
                </div>
                <div className="admin-dashboard-detail-item">
                  <div className="admin-dashboard-detail-item-label">
                    <FileText size={16} /> Final Fees
                  </div>
                  <div className="admin-dashboard-detail-item-value">{course?.finalFees || 'N/A'}</div>
                </div>

              </div>
            </div>

            <div className="admin-dashboard-detail-card">
              <div className="admin-dashboard-detail-card-header">
                <Calendar size={18} />
                <h3>Additional Information</h3>
              </div>
              <div className="admin-dashboard-detail-card-content">
                <div className="admin-dashboard-detail-item">
                  <div className="admin-dashboard-detail-item-label">
                    <Calendar size={16} /> Created Date
                  </div>
                  <div className="admin-dashboard-detail-item-value">
                    {course?.createdAt ? (
                      <Moment format="MMMM Do, YYYY">{course?.createdAt}</Moment>
                    ) : 'N/A'}
                  </div>
                </div>
                <div className="admin-dashboard-detail-item">
                  <div className="admin-dashboard-detail-item-label">
                    <Calendar size={16} /> Last Updated
                  </div>
                  <div className="admin-dashboard-detail-item-value">
                    {course?.updatedAt ? (
                      <Moment format="MMMM Do, YYYY">{course?.updatedAt}</Moment>
                    ) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Courses button at bottom left */}
      <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 10 }}>
        <button
          onClick={handleBack}
          className="admin-dashboard-btn admin-dashboard-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <ArrowLeft size={18} />
          Back to Courses
        </button>
      </div>

      {/* Image Popup */}
      {showImagePopup && course && course.courseImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <button
              onClick={() => setShowImagePopup(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>
            <img
              src={`${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/${course.courseImage}`}
              alt={course?.name}
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/dummy-user.jpg';
              }}
            />
          </div>
        </div>
      )}

      <div className="admin-dashboard-detail-header">
        <button
          type="button"
          className="admin-dashboard-btn-styled admin-dashboard-btn-styled-secondary"
          style={{ backgroundColor: "#3498db", color: "#fff" }}
          onClick={() => navigate("/admin/course")}
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>
    </AdminLayout>
  );
};

export default CourseDetail;