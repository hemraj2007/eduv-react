import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getStudentData, isStudentAuthenticated } from '../utils/auth';
import subscriptionService from '../services/subscriptionService';
import videoService from '../services/videoService';
import Header from "./layout/header";
import Footer from "./layout/footer";
import {
  FaVideo,
  FaPlay,
  FaClock,
  FaCheckCircle,
  FaArrowLeft,
  FaGraduationCap,
  FaCreditCard,
  FaExclamationTriangle
} from 'react-icons/fa';

const StudentVideos = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
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

        const subscriptionResponse = await subscriptionService.getSubscriptionsByStudentId(data._id);

        if (subscriptionResponse.subscriptions?.length > 0) {
          const currentDate = new Date();
          const activeSubscriptions = subscriptionResponse.subscriptions.filter(subscription => {
            const endDate = new Date(subscription.endDate);
            return endDate > currentDate;
          });

          if (activeSubscriptions.length > 0) {
            activeSubscriptions.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
            const subscription = activeSubscriptions[0];
            setSubscriptionData(subscription);

            const videosResponse = await videoService.getVideosByPackageId(subscription.packageId._id);
            if (videosResponse.videos) {
              const activeVideos = videosResponse.videos
                .filter(video => video.status === 'active')
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

              const videoLimit = subscription.video_limit;
              const limitedVideos = videoLimit > 0 ? activeVideos.slice(0, videoLimit) : activeVideos;
              setVideos(limitedVideos);
            }
          } else {
            setSubscriptionData(null);
            Swal.fire({
              icon: 'warning',
              title: 'Subscription Expired',
              text: 'Your subscription has expired. Please renew to access videos.',
            });
          }
        } else {
          setSubscriptionData(null);
          Swal.fire({
            icon: 'info',
            title: 'No Active Subscription',
            text: 'You need an active subscription to access videos.',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load videos. Please try again.',
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

  const isSubscriptionExpiringSoon = (endDate) => {
    const currentDate = new Date();
    const expiryDate = new Date(endDate);
    const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const getDaysUntilExpiry = (endDate) => {
    const currentDate = new Date();
    const expiryDate = new Date(endDate);
    return Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
  };

  const getYouTubeEmbedUrl = (youtubeUrl) => {
    // This regex is robust for various YouTube URL formats
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : null;
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  if (loading) {
    return (
      <div className="student-loading-container">
        <div className="student-loading-content">
          <div className="student-loading-spinner"></div>
          <p className="student-loading-text">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />

      <div className="container-xxl py-5">
        <div className="container">
          {/* Student Info */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card bg-light">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <h5 className="mb-1">{studentData?.name}</h5>
                      <p className="text-muted mb-0">{studentData?.email}</p>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <p className="text-muted mb-1">Available Videos</p>
                      <h5 className="mb-0">{videos.length}</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          {subscriptionData ? (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-success">
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">
                      <FaCheckCircle className="me-2" />
                      Active Subscription - {subscriptionData.packageId?.name}
                    </h5>
                  </div>
                  <div className="card-body">
                    {isSubscriptionExpiringSoon(subscriptionData.endDate) && (
                      <div className="alert alert-warning mb-3">
                        <FaClock className="me-2" />
                        <strong>Warning:</strong> Your subscription will expire in {getDaysUntilExpiry(subscriptionData.endDate)} days.
                        Please renew to continue accessing videos.
                      </div>
                    )}
                    <div className="row">
                      <div className="col-md-3">
                        <h6 className="text-muted">Plan Type</h6>
                        <p className="mb-0 fw-bold">{subscriptionData.membership_id?.planName}</p>
                      </div>
                      <div className="col-md-3">
                        <h6 className="text-muted">Video Limit</h6>
                        <p className="mb-0 fw-bold">
                          {subscriptionData.video_limit === 0 ? 'Unlimited' : subscriptionData.video_limit}
                        </p>
                      </div>
                      <div className="col-md-3">
                        <h6 className="text-muted">Valid Until</h6>
                        <p className="mb-0 fw-bold">
                          {formatDate(subscriptionData.endDate)}
                          {isSubscriptionExpiringSoon(subscriptionData.endDate) && (
                            <span className="badge bg-warning text-dark ms-1">
                              {getDaysUntilExpiry(subscriptionData.endDate)} days left
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="col-md-3">
                        <h6 className="text-muted">Status</h6>
                        <span className="badge bg-success">
                          <FaCheckCircle className="me-1" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-warning">
                  <div className="card-header bg-warning text-dark">
                    <h5 className="mb-0">
                      <FaExclamationTriangle className="me-2" />
                      No Active Subscription
                    </h5>
                  </div>
                  <div className="card-body text-center">
                    <p className="mb-3">You need an active subscription to access videos.</p>
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

          {/* Videos Grid */}
          {subscriptionData && videos.length > 0 ? (
            <div>
              <div className="text-center mb-5">
                <h2>Available Videos ({videos.length})</h2>
                <p className="text-muted">
                  {subscriptionData.video_limit > 0
                    ? `Showing ${videos.length} of ${subscriptionData.video_limit} videos`
                    : 'All available videos for your package'
                  }
                </p>
              </div>
              <div className="row g-4">
                {videos.map((video, index) => (
                  <div key={video._id} className="col-lg-4 col-md-6">
                    <div
                      className="card h-100 shadow video-card cursor-pointer"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleVideoClick(video)}
                    >
                      <iframe
                        width="100%"
                        height="100%"
                        src={getYouTubeEmbedUrl(video.video_url)} // Use the new embed URL here
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>


                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : subscriptionData ? (
            <div className="text-center py-5">
              <FaVideo className="text-muted" style={{ fontSize: '4rem' }} />
              <h3 className="mt-3 mb-2">No Videos Available</h3>
              <p className="text-muted mb-4">
                No videos are currently available for your package. Please check back later.
              </p>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="text-center mt-5">
            <button
              onClick={() => navigate('/student/profile')}
              className="btn btn-primary me-3"
            >
              <FaGraduationCap className="me-2" />
              View Profile
            </button>
            <button
              onClick={() => navigate('/packages')}
              className="btn btn-success"
            >
              <FaCreditCard className="me-2" />
              Get Subscription
            </button>
          </div>
        </div>
      </div>



      <Footer />
    </div>
  );
};

export default StudentVideos;