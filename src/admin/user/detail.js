import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import userService from '../../services/userService';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, Globe, Flag, Building, Hash, Github, Linkedin, Clock, FileText, X } from 'lucide-react';
import Moment from 'react-moment';
import Loader from '../../components/Loader';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImagePopup, setShowImagePopup] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await userService.getUserById(id);
        setUserData(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleBack = () => {
    navigate('/admin/user');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Loader title="Loading User Details" subtitle="Please wait..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        {/* <div className="admin-dashboard-error-container">
          <div className="admin-dashboard-error-message">{error}</div>
          <button onClick={handleBack} className="admin-dashboard-btn admin-dashboard-btn-primary">
            <ArrowLeft size={18} />
            Back to Users
          </button>
        </div> */}
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard-detail-container animated animate__animated animate__fadeIn">
        <div className="admin-dashboard-detail-header">

          <h1 className="admin-dashboard-detail-title">User Details</h1>
        </div>

        {userData && (
          <div className="admin-dashboard-detail-content">
            <div className="admin-dashboard-detail-card admin-dashboard-user-profile-card">
              <div className="admin-dashboard-user-profile-header">
                <div className="admin-dashboard-user-profile-image">
                  {userData.image ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/${userData.image}`}
                      alt={userData.fullName}
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
                  <h2 className="admin-dashboard-user-profile-name">{userData.fullName}</h2>
                  <div className="admin-dashboard-user-profile-email">
                    <Mail size={16} />
                    {userData.email}
                  </div>
                  <div className="admin-dashboard-user-profile-status">
                    <span className={`admin-dashboard-status-badge ${userData.status === 'Y' ? 'active' : 'inactive'}`}>
                      {userData.status === 'Y' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="admin-dashboard-user-profile-actions">
                  <button
                    onClick={() => navigate(`/admin/user/edit/${userData._id}`)}
                    className="admin-dashboard-btn admin-dashboard-btn-primary"
                  >
                    Edit User
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-dashboard-detail-grid">
              <div className="admin-dashboard-detail-card">
                <div className="admin-dashboard-detail-card-header">
                  <User size={18} />
                  <h3>Personal Information</h3>
                </div>
                <div className="admin-dashboard-detail-card-content">
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <User size={16} /> Full Name
                    </div>
                    <div className="admin-dashboard-detail-item-value">{userData.fullName || 'N/A'}</div>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <Mail size={16} /> Email
                    </div>
                    <div className="admin-dashboard-detail-item-value">{userData.email || 'N/A'}</div>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <Phone size={16} /> Mobile
                    </div>
                    <div className="admin-dashboard-detail-item-value">{userData.mobile || 'N/A'}</div>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <User size={16} /> Gender
                    </div>
                    <div className="admin-dashboard-detail-item-value">{userData.gender || 'N/A'}</div>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <Calendar size={16} /> Date of Birth
                    </div>
                    <div className="admin-dashboard-detail-item-value">
                      {userData.dob ? (
                        <Moment format="MMMM Do, YYYY">{userData.dob}</Moment>
                      ) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-dashboard-detail-card">
                <div className="admin-dashboard-detail-card-header">
                  <MapPin size={18} />
                  <h3>Location Information</h3>
                </div>
                <div className="admin-dashboard-detail-card-content">
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <MapPin size={16} /> Address
                    </div>
                    <div className="admin-dashboard-detail-item-value">{userData.address || 'N/A'}</div>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <Building size={16} /> City
                    </div>
                    <div className="admin-dashboard-detail-item-value">{userData.city || 'N/A'}</div>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <Flag size={16} /> State
                    </div>
                    <div className="admin-dashboard-detail-item-value">{userData.state || 'N/A'}</div>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <Globe size={16} /> Country
                    </div>
                    <div className="admin-dashboard-detail-item-value">{userData.country || 'N/A'}</div>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <Hash size={16} /> Pincode
                    </div>
                    <div className="admin-dashboard-detail-item-value">{userData.pincode || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="admin-dashboard-detail-card">
                <div className="admin-dashboard-detail-card-header">
                  <Globe size={18} />
                  <h3>Social & Additional Information</h3>
                </div>
                <div className="admin-dashboard-detail-card-content">
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <Github size={16} /> Github URL
                    </div>
                    <div className="admin-dashboard-detail-item-value">
                      {userData.githubUrl ? (
                        <a href={userData.githubUrl} target="_blank" rel="noopener noreferrer" className="admin-dashboard-link">
                          {userData.githubUrl}
                        </a>
                      ) : 'N/A'}
                    </div>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <Linkedin size={16} /> LinkedIn URL
                    </div>
                    <div className="admin-dashboard-detail-item-value">
                      {userData.linkedinUrl ? (
                        <a href={userData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="admin-dashboard-link">
                          {userData.linkedinUrl}
                        </a>
                      ) : 'N/A'}
                    </div>
                  </div>
                  {/* <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <Globe size={16} /> Account On
                    </div>
                    <div className="admin-dashboard-detail-item-value">{userData.accountOn || 'N/A'}</div>
                  </div> */}
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <FileText size={16} /> Hobbies
                    </div>
                    <div className="admin-dashboard-detail-item-value">
                      {userData.hobbies && userData.hobbies.length > 0 ? (
                        <div className="admin-dashboard-hobbies-list">
                          {userData.hobbies.map((hobby, index) => (
                            <span key={index} className="admin-dashboard-hobby-tag">{hobby}</span>
                          ))}
                        </div>
                      ) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              {userData.documents && userData.documents.length > 0 && (
                <div className="admin-dashboard-detail-card admin-dashboard-documents-card">
                  <div className="admin-dashboard-detail-card-header">
                    <FileText size={18} />
                    <h3>Documents</h3>
                  </div>
                  <div className="admin-dashboard-detail-card-content">
                    <div className="admin-dashboard-documents-grid">
                      {userData.documents.map((doc, index) => (
                        <div key={index} className="admin-dashboard-document-item">
                          <div className="admin-dashboard-document-icon">
                            <FileText size={24} />
                          </div>
                          <div className="admin-dashboard-document-info">
                            <div className="admin-dashboard-document-name">Document {index + 1}</div>
                            <a
                              href={`${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/documents/${doc}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-dashboard-document-link"
                            >
                              View Document
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Back to User button at bottom left */}
      <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 10 }}>
        <button
          onClick={handleBack}
          className="admin-dashboard-btn admin-dashboard-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <ArrowLeft size={18} />
          Back to Users
        </button>
      </div>

      {/* Image Popup */}
      {showImagePopup && userData && userData.image && (
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
              src={`${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/${userData.image}`}
              alt={userData.fullName}
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
          onClick={() => navigate("/admin/user")}
        >
          <ArrowLeft size={18} /> Back 
        </button>

      </div>
    </AdminLayout>
  );
};

export default UserDetail;