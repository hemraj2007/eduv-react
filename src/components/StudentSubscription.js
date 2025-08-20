import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getStudentData, isStudentAuthenticated } from '../utils/auth';
import subscriptionService from '../services/subscriptionService';
import courseService from '../services/courseService';
import Header from "./layout/header";
import Footer from "./layout/footer";
import {
  FaCreditCard,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaGraduationCap,
  FaPlay,
  FaClock,
  FaStar,
  FaUsers,
  FaBookOpen
} from 'react-icons/fa';

const StudentSubscription = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if student is logged in
    if (!isStudentAuthenticated()) {
      navigate('/student/login');
      return;
    }

    const fetchData = async () => {
      try {
        const data = getStudentData();
        if (!data) {
          navigate('/student/login');
          return;
        }
        setStudentData(data);

        // Fetch subscription details
        const subscriptionResponse = await subscriptionService.getSubscriptionsByStudentId(data._id);
        if (subscriptionResponse.subscriptions && subscriptionResponse.subscriptions.length > 0) {
          // Check if subscription is not expired
          const currentDate = new Date();
          const activeSubscriptions = subscriptionResponse.subscriptions.filter(subscription => {
            const endDate = new Date(subscription.endDate);
            return endDate > currentDate; // Only show non-expired subscriptions
          });
          
          if (activeSubscriptions.length > 0) {
            // Get the most recent active subscription
            activeSubscriptions.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
            setSubscriptionData(activeSubscriptions[0]);
          } else {
            // All subscriptions are expired
            setSubscriptionData(null);
          }
        }

        // Fetch assigned courses
        const coursesResponse = await courseService.getCoursesByStudentId(data._id);
        if (coursesResponse.courses) {
          setAssignedCourses(coursesResponse.courses);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load subscription data. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const isSubscriptionExpired = (endDate) => {
    const currentDate = new Date();
    const expiryDate = new Date(endDate);
    return expiryDate <= currentDate;
  };

  const isSubscriptionExpiringSoon = (endDate) => {
    const currentDate = new Date();
    const expiryDate = new Date(endDate);
    const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0; // Expiring within 7 days
  };

  const getDaysUntilExpiry = (endDate) => {
    const currentDate = new Date();
    const expiryDate = new Date(endDate);
    return Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="student-loading-container">
        <div className="student-loading-content">
          <div className="student-loading-spinner"></div>
          <p className="student-loading-text">Loading subscription...</p>
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
      

        {/* Subscription Content Start */}
        <div className="container-xxl py-5">
          <div className="container">
            {/* Student Info Section */}
            <div className="row mb-5">
              <div className="col-12">
                <div className="card shadow">
                  <div className="card-body p-4">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h4 className="mb-2">Welcome, {studentData.name}!</h4>
                        <p className="text-muted mb-0">{studentData.email} | {studentData.mobile}</p>
                      </div>
                      <div className="col-md-4 text-end">
                        {/* <span className={`badge ${studentData.status === 'Y' ? 'bg-success' : 'bg-danger'} fs-6`}>
                          {studentData.status === 'Y' ? 'Active Student' : 'Inactive Student'}
                        </span> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Details Section */}
            {subscriptionData ? (
              <div className="row mb-5">
                <div className="col-12">
                  <div className="card shadow">
                    <div className="card-header bg-primary text-white">
                      <h4 className="mb-0">
                        <FaCreditCard className="me-2" />
                        Subscription Plan Details
                      </h4>
                    </div>
                    <div className="card-body p-4">
                      {/* Expiry Warning */}
                      {isSubscriptionExpiringSoon(subscriptionData.endDate) && (
                        <div className="alert alert-warning mb-4">
                          <FaClock className="me-2" />
                          <strong>Warning:</strong> Your subscription will expire in {getDaysUntilExpiry(subscriptionData.endDate)} days. 
                          Please renew to continue accessing videos.
                        </div>
                      )}

                      <div className="row">
                                                 {/* Package Details */}
                         <div className="col-lg-6 mb-4">
                           <div className="card border-primary h-100">
                             <div className="card-header bg-light">
                               <h5 className="mb-0 text-primary">
                                 <FaStar className="me-2" />
                                 {subscriptionData.packageId?.name || 'Package Details'}
                               </h5>
                             </div>
                             <div className="card-body">
                               <div className="mb-3 d-flex justify-content-between align-items-center">
                                 <h6 className="text-muted mb-0">Duration:</h6>
                                 <p className="mb-0 fw-bold">{subscriptionData.membership_id?.duration || 0} days</p>
                               </div>
                               <div className="mb-3 d-flex justify-content-between align-items-center">
                                 <h6 className="text-muted mb-0">Video Limit:</h6>
                                 <p className="mb-0 fw-bold">
                                   {subscriptionData.video_limit === 0 ? 'Unlimited' : subscriptionData.video_limit || 'N/A'}
                                 </p>
                               </div>
                               <div className="mb-3 d-flex justify-content-between align-items-center">
                                 <h6 className="text-muted mb-0">Package Status:</h6>
                                 <span className={`badge ${subscriptionData.packageId?.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                   {subscriptionData.packageId?.status || 'N/A'}
                                 </span>
                               </div>
                               <div className="mb-3 d-flex justify-content-between align-items-center">
                                 <h6 className="text-muted mb-0">Subscription Status:</h6>
                                 <span className="badge bg-success">
                                   <FaCheckCircle className="me-1" />
                                   Active
                                 </span>
                               </div>
                             </div>
                           </div>
                         </div>

                                                 {/* Pricing Details */}
                         <div className="col-lg-6 mb-4">
                           <div className="card border-success h-100">
                             <div className="card-header bg-light">
                               <h5 className="mb-0 text-success">
                                 <FaCreditCard className="me-2" />
                                 Pricing Information
                               </h5>
                             </div>
                             <div className="card-body">
                               <div className="mb-3 d-flex justify-content-between align-items-center">
                                 <h6 className="text-muted mb-0">Plan Type:</h6>
                                 <p className="mb-0 fw-bold text-primary">{subscriptionData.membership_id?.planName || 'N/A'}</p>
                               </div>
                               <div className="mb-3 d-flex justify-content-between align-items-center">
                                 <h6 className="text-muted mb-0">Original Price:</h6>
                                 <p className="mb-0 fw-bold text-decoration-line-through">{formatCurrency(subscriptionData.price || 0)}</p>
                               </div>
                               <div className="mb-3 d-flex justify-content-between align-items-center">
                                 <h6 className="text-muted mb-0">Discount Applied:</h6>
                                 <p className="mb-0 fw-bold text-success">-{formatCurrency(subscriptionData.discount || 0)}</p>
                               </div>
                               <div className="mb-3 d-flex justify-content-between align-items-center">
                                 <h6 className="text-muted mb-0">Final Price:</h6>
                                 <p className="mb-0 fw-bold fs-5 text-primary">{formatCurrency(subscriptionData.finalPrice || 0)}</p>
                               </div>
                             </div>
                           </div>
                         </div>

                        {/* Package Features */}
                        {subscriptionData.packageId?.package_info && (
                          <div className="col-12 mb-4">
                            <div className="card border-info">
                              <div className="card-header bg-light">
                                <h5 className="mb-0 text-info">
                                  <FaCheckCircle className="me-2" />
                                  Package Features
                                </h5>
                              </div>
                              <div className="card-body">
                                <div className="row">
                                  {Object.entries(subscriptionData.packageId.package_info).map(([key, value]) => (
                                    <div key={key} className="col-md-6 col-lg-4 mb-2">
                                      <div className="d-flex align-items-center">
                                        <FaCheckCircle className="text-success me-2" />
                                        <span>{value}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Subscription Dates */}
                        <div className="col-12">
                          <div className="card border-warning">
                            <div className="card-header bg-light">
                              <h5 className="mb-0 text-warning">
                                <FaCalendarAlt className="me-2" />
                                Subscription Period
                              </h5>
                            </div>
                            <div className="card-body">
                              <div className="row">
                                <div className="col-md-6">
                                  <h6 className="text-muted">Start Date</h6>
                                  <p className="mb-0 fw-bold">{formatDate(subscriptionData.startDate)}</p>
                                </div>
                                <div className="col-md-6">
                                  <h6 className="text-muted">End Date</h6>
                                  <p className="mb-0 fw-bold">
                                    {formatDate(subscriptionData.endDate)}
                                    {isSubscriptionExpiringSoon(subscriptionData.endDate) && (
                                      <span className="badge bg-warning text-dark ms-2">
                                        Expires in {getDaysUntilExpiry(subscriptionData.endDate)} days
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="row mb-5">
                <div className="col-12">
                  <div className="card shadow text-center">
                    <div className="card-body p-5">
                      <FaTimesCircle className="text-danger" style={{fontSize: '4rem'}} />
                      <h3 className="mt-3 mb-2">No Active Subscription</h3>
                      <p className="text-muted mb-4">
                        You don't have an active subscription or your subscription has expired. Please subscribe to a plan to access videos.
                      </p>
                      <button
                        onClick={() => navigate('/packages')}
                        className="btn btn-primary"
                      >
                        <FaCreditCard className="me-2" />
                        Get Subscription
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assigned Courses Section */}
            {/* <div className="row">
              <div className="col-12">
                <div className="card shadow">
                  <div className="card-header bg-success text-white">
                    <h4 className="mb-0">
                      <FaBookOpen className="me-2" />
                      My Assigned Courses ({assignedCourses.length})
                    </h4>
                  </div>
                  <div className="card-body p-4">
                    {assignedCourses.length > 0 ? (
                      <div className="row">
                        {assignedCourses.map((course) => (
                          <div key={course._id} className="col-lg-4 col-md-6 mb-4">
                            <div className="card h-100 course-card">
                              <img 
                                src={course.image || '/images/course-1.jpg'} 
                                className="card-img-top" 
                                alt={course.name}
                                style={{height: '200px', objectFit: 'cover'}}
                              />
                              <div className="card-body">
                                <h5 className="card-title">{course.name}</h5>
                                <p className="card-text text-muted">
                                  {course.description?.substring(0, 100)}...
                                </p>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <span className="badge bg-primary">{course.category || 'General'}</span>
                                  <span className="text-muted">
                                    <FaClock className="me-1" />
                                    {course.duration || 'N/A'}
                                  </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className="text-success fw-bold">
                                    {course.price ? formatCurrency(course.price) : 'Free'}
                                  </span>
                                  <button 
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => navigate(`/student/videos?course=${course._id}`)}
                                  >
                                    <FaPlay className="me-1" />
                                    Start Learning
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <FaBookOpen className="text-muted" style={{fontSize: '4rem'}} />
                        <h5 className="mt-3 mb-2">No Courses Assigned</h5>
                        <p className="text-muted">
                          You don't have any courses assigned yet. Please contact your instructor.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div> */}

            {/* Action Buttons */}
            <div className="row mt-5">
              <div className="col-12 text-center">
                <div className="d-flex justify-content-center gap-3">
                  <button
                    onClick={() => navigate('/student/profile')}
                    className="btn btn-primary"
                  >
                    <FaUsers className="me-2" />
                    View Profile
                  </button>
                  <button
                    onClick={() => navigate('/student/videos')}
                    className="btn btn-success"
                  >
                    <FaPlay className="me-2" />
                    Access Videos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Subscription Content End */}
      </>

      <Footer />
    </div>
  );
};

export default StudentSubscription; 