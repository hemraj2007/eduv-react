import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getStudentData, clearStudentAuth, isStudentAuthenticated } from '../utils/auth';
import Header from "./layout/header";
import Footer from "./layout/footer";
import {
  FaUser,
  FaEnvelope,
  FaMobile,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaVenusMars,
  FaBook,
  FaSignOutAlt,
  FaEdit,
  FaGraduationCap,
  FaUserCircle,
  FaArrowLeft
} from 'react-icons/fa';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if student is logged in
    if (!isStudentAuthenticated()) {
      navigate('/student/login');
      return;
    }

    try {
      const studentData = getStudentData();
      if (!studentData) {
        navigate('/student/login');
        return;
      }
      setStudentData(studentData);
    } catch (error) {
      console.error('Error getting student data:', error);
      navigate('/student/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear authentication data
        clearStudentAuth();

        // Show success message
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        // Redirect to login page
        setTimeout(() => {
          navigate('/student/login');
        }, 2000);
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProfileImage = () => {
    if (studentData?.profilePicture) {
      return `${process.env.REACT_APP_API_URL || `https://eduv-node-kxzd.onrender.com`}/${studentData.profilePicture}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="student-loading-container">
        <div className="student-loading-content">
          <div className="student-loading-spinner"></div>
          <p className="student-loading-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return null;
  }

  return (
    <div>
      <Header />

      <>
       

        {/* Profile Content Start */}
        <div className="container-xxl py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="card shadow">
                  {/* Profile Header */}
                  <div className="card-header bg-primary text-white text-center py-4">
                    <div className="row align-items-center">
                      <div className="col-md-3">
                        <div className="profile-avatar mx-auto" style={{width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '4px solid rgba(255,255,255,0.3)'}}>
                          {getProfileImage() ? (
                            <img
                              src={getProfileImage()}
                              alt="Profile"
                              style={{width: '100%', height: '100%', objectFit: 'cover'}}
                            />
                          ) : (
                            <div style={{width: '100%', height: '100%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'rgba(255,255,255,0.8)'}}>
                              <FaUserCircle />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <h2 className="mb-2">{studentData.name}</h2>
                        <p className="mb-2">{studentData.email}</p>
                      
                      </div>
                      <div className="col-md-3">
                        <button
                          onClick={handleLogout}
                          className="btn btn-outline-light"
                        >
                          <FaSignOutAlt />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="card-body p-4">
                    <div className="row">
                      {/* Personal Information */}
                      <div className="col-md-6">
                        <div className="card h-100">
                          <div className="card-header">
                            <h5 className="mb-0">
                              <FaUser className="me-2" />
                              Personal Information
                            </h5>
                          </div>
                          <div className="card-body">
                            <div className="row mb-3">
                              <div className="col-4 fw-bold">Full Name:</div>
                              <div className="col-8">{studentData.name}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-4 fw-bold">Email:</div>
                              <div className="col-8">{studentData.email}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-4 fw-bold">Mobile:</div>
                              <div className="col-8">{studentData.mobile}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-4 fw-bold">Gender:</div>
                              <div className="col-8">{studentData.gender}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-4 fw-bold">Date of Birth:</div>
                              <div className="col-8">{formatDate(studentData.dob)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="col-md-6">
                        <div className="card h-100">
                          <div className="card-header">
                            <h5 className="mb-0">
                              <FaBook className="me-2" />
                              Additional Information
                            </h5>
                          </div>
                          <div className="card-body">
                            <div className="row mb-3">
                              <div className="col-4 fw-bold">Address:</div>
                              <div className="col-8">{studentData.address || 'Not provided'}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-4 fw-bold">Enrolled Course:</div>
                              <div className="col-8">
                                {studentData.course_id && studentData.course_id.length > 0
                                  ? studentData.course_id.map(course => course.name).join(', ')
                                  : 'No course enrolled'
                                }
                              </div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-4 fw-bold">Member Since:</div>
                              <div className="col-8">{formatDate(studentData.createdDate)}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-4 fw-bold">Last Updated:</div>
                              <div className="col-8">{formatDate(studentData.updatedDate)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="text-center mt-4">
                      <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary me-3"
                      >
                        <FaArrowLeft />
                        Back
                      </button>
                      <button
                        onClick={() => {
                          Swal.fire({
                            title: 'Coming Soon!',
                            text: 'Profile editing feature will be available soon.',
                            icon: 'info',
                            confirmButtonText: 'OK'
                          });
                        }}
                        className="btn btn-secondary"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Profile Content End */}
      </>

      <Footer />
    </div>
  );
};

export default StudentProfile;
