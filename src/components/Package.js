import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import packageService from '../services/packageService';
import membershipPlanService from '../services/membershipPlanService';
import subscriptionService from '../services/subscriptionService';
import { getStudentData, isStudentAuthenticated } from '../utils/auth';
import Header from './layout/header';
import Footer from './layout/footer';
import '../styles/package-styles.css';
import {
  FaBox,
  FaPlay,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaArrowRight,
  FaStar,
  FaUsers,
  FaVideo,
  FaTag,
  FaCalendarAlt,
  FaCreditCard,
  FaRocket,
  FaShieldAlt,
  FaHeadset,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const Package = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packageService.getAllPackages();
      // Filter only active packages and sort by position
      const activePackages = (response.packages || [])
        .filter(pkg => pkg.status === 'active')
        .sort((a, b) => {
          // Sort by position (ascending order)
          const posA = a.position || 0;
          const posB = b.position || 0;
          return posA - posB;
        });
      setPackages(activePackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load packages. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipPlans = async (packageId) => {
    try {
      setPlansLoading(true);
      const response = await membershipPlanService.getMembershipPlansByPackageId(packageId);
      // Filter only active membership plans and sort by position
      const activePlans = (response.membershipPlans || [])
        .filter(plan => plan.status === 'active')
        .sort((a, b) => {
          // Sort by position (ascending order)
          const posA = a.position || 0;
          const posB = b.position || 0;
          return posA - posB;
        });
      setMembershipPlans(activePlans);
    } catch (error) {
      console.error('Error fetching membership plans:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load membership plans. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchCurrentSubscription = async (studentId) => {
    try {
      const response = await subscriptionService.getSubscriptionsByStudentId(studentId);
      if (response.subscriptions && response.subscriptions.length > 0) {
        // Get the most recent active subscription
        const activeSubscriptions = response.subscriptions.filter(sub => {
          const endDate = new Date(sub.endDate);
          const now = new Date();
          return endDate > now; // Subscription is still active
        });
        
        if (activeSubscriptions.length > 0) {
          // Sort by end date to get the latest one
          activeSubscriptions.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
          setCurrentSubscription(activeSubscriptions[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching current subscription:', error);
    }
  };

  const handlePackageClick = async (packageData) => {
    setSelectedPackage(packageData);
    await fetchMembershipPlans(packageData._id);
    
    // Fetch current subscription if student is logged in
    if (isStudentAuthenticated()) {
      const studentData = getStudentData();
      if (studentData) {
        await fetchCurrentSubscription(studentData._id);
      }
    }
  };

  const handleBackToPackages = () => {
    setSelectedPackage(null);
    setMembershipPlans([]);
    setCurrentSubscription(null);
  };

  const isPlanUpgrade = (currentPlan, newPlan) => {
    if (!currentPlan || !newPlan) return false;
    
    // Define plan hierarchy (higher number = higher tier)
    const planHierarchy = {
      30: 1,    // Monthly
      90: 2,    // 3 Months
      180: 3,   // 6 Months
      365: 4    // Yearly
    };
    
    const currentTier = planHierarchy[currentPlan.duration] || 0;
    const newTier = planHierarchy[newPlan.duration] || 0;
    
    return newTier > currentTier;
  };

  const isPlanDowngrade = (currentPlan, newPlan) => {
    if (!currentPlan || !newPlan) return false;
    
    // Define plan hierarchy (higher number = higher tier)
    const planHierarchy = {
      30: 1,    // Monthly
      90: 2,    // 3 Months
      180: 3,   // 6 Months
      365: 4    // Yearly
    };
    
    const currentTier = planHierarchy[currentPlan.duration] || 0;
    const newTier = planHierarchy[newPlan.duration] || 0;
    
    return newTier < currentTier;
  };

  const isCurrentPlan = (plan) => {
    if (!currentSubscription) return false;
    return currentSubscription.membership_id?._id === plan._id;
  };

  const handleSubscribe = async (plan) => {
    // Check if student is authenticated
    if (!isStudentAuthenticated()) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to subscribe to a plan.',
        icon: 'warning',
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/student/login');
        }
      });
      return;
    }

    // Get current student data
    const studentData = getStudentData();
    if (!studentData) {
      Swal.fire({
        title: 'Error',
        text: 'Student data not found. Please login again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      navigate('/student/login');
      return;
    }

    // Check if this is the current active plan
    if (isCurrentPlan(plan)) {
      Swal.fire({
        title: 'Current Plan',
        text: 'You are already subscribed to this plan.',
        icon: 'info',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Check for downgrade scenario - RESTRICT DOWNGRADE
    if (currentSubscription && isPlanDowngrade(currentSubscription.membership_id, plan)) {
      Swal.fire({
        title: 'Plan Downgrade Restricted',
        html: `
          <div class="text-left">
            <p><strong>Current Plan:</strong> ${currentSubscription.membership_id.planName} (${formatDuration(currentSubscription.membership_id.duration)})</p>
            <p><strong>Selected Plan:</strong> ${plan.planName} (${formatDuration(plan.duration)})</p>
            <p class="text-danger"><strong>Restriction:</strong> You cannot downgrade to a shorter duration plan.</p>
            <p>Please select a plan with equal or longer duration than your current plan.</p>
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Prepare confirmation dialog content
    let dialogTitle = 'Confirm Subscription';
    let dialogContent = `
      <div class="text-left">
        <p><strong>Package:</strong> ${selectedPackage.name}</p>
        <p><strong>Plan:</strong> ${plan.planName}</p>
        <p><strong>Duration:</strong> ${formatDuration(plan.duration)}</p>
        <p><strong>Price:</strong> ${formatPrice(plan.finalPrice)}</p>
        <p><strong>Start Date:</strong> ${new Date().toLocaleDateString()}</p>
    `;

    // Add upgrade information if applicable
    if (currentSubscription && isPlanUpgrade(currentSubscription.membership_id, plan)) {
      dialogTitle = 'Plan Upgrade';
      dialogContent += `
        <hr style="margin: 1rem 0; border-color: #e9ecef;">
        <p><strong>Current Plan:</strong> ${currentSubscription.membership_id.planName} (${formatDuration(currentSubscription.membership_id.duration)})</p>
        <p class="text-success"><strong>Upgrade:</strong> Your current plan will be expired and the new plan will be activated.</p>
      `;
    }

    dialogContent += '</div>';

    // Show single confirmation dialog
    const result = await Swal.fire({
      title: dialogTitle,
      html: dialogContent,
      icon: currentSubscription && isPlanUpgrade(currentSubscription.membership_id, plan) ? 'question' : 'question',
      confirmButtonText: currentSubscription ? 'Update Plan' : 'Subscribe Now',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    setSubscribing(true);

    try {
      // Calculate end date based on duration
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + plan.duration);

      // Prepare subscription data
      const subscriptionData = {
        student_id: studentData._id,
        membership_id: plan._id,
        packageId: selectedPackage._id,
        price: plan.price,
        discount: plan.discount,
        finalPrice: plan.finalPrice,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        video_limit: selectedPackage.video_limit || null
      };

      console.log('Creating subscription with data:', subscriptionData);

      if (currentSubscription) {
        // Update existing subscription (expire current and create new)
        await subscriptionService.updateSubscription(currentSubscription._id, {
          ...currentSubscription,
          endDate: new Date().toISOString(), // Expire current plan immediately
          status: 'expired'
        });
      }

      // Create new subscription
      await subscriptionService.createSubscription(subscriptionData);

      // Show success message
      await Swal.fire({
        title: 'Success!',
        text: currentSubscription ? 'Your subscription has been updated successfully!' : 'Your subscription has been created successfully!',
        icon: 'success',
        confirmButtonText: 'View Subscription'
      });

      // Redirect to student subscription page
      navigate('/student/subscription');

    } catch (error) {
      console.error('Error creating subscription:', error);
      
      let errorMessage = 'Failed to create subscription. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setSubscribing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDuration = (days) => {
    if (days === 30) return '1 Month';
    if (days === 365) return '1 Year';
    if (days === 90) return '3 Months';
    if (days === 180) return '6 Months';
    return `${days} Days`;
  };

  const getPackageIcon = (packageName) => {
    const name = packageName.toLowerCase();
    if (name.includes('trial')) return <FaRocket />;
    if (name.includes('silver')) return <FaShieldAlt />;
    if (name.includes('gold')) return <FaStar />;
    if (name.includes('platinum')) return <FaUsers />;
    return <FaBox />;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="package-loading-container">
          <div className="package-loading-content">
            <div className="package-loading-spinner"></div>
            <p className="package-loading-text">Loading packages...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="package-container">
        {/* Header Start */}
        <div className="container-fluid bg-primary py-5 mb-5 page-header">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <h1 className="display-3 text-white animated slideInDown">Packages</h1>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb justify-content-center">
                    <li className="breadcrumb-item">
                      <a className="text-white" href="#">
                        Home
                      </a>
                    </li>
                    <li className="breadcrumb-item">
                      <a className="text-white" href="#">
                        Pages
                      </a>
                    </li>
                    <li
                      className="breadcrumb-item text-white active"
                      aria-current="page"
                    >
                      Packages
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
        {/* Header End */}

        <div className="package-main">
          <div className="container">
            {!selectedPackage ? (
              // Packages Grid
              <div className="packages-section">
                <div className="packages-grid">
                  {packages.map((packageData) => (
                    <div 
                      key={packageData._id} 
                      className="package-card"
                      onClick={() => handlePackageClick(packageData)}
                    >
                      <div className="package-card-header">
                        <div className="package-icon">
                          {getPackageIcon(packageData.name)}
                        </div>
                        <div className="package-badge">
                          <FaCheckCircle />
                          Active
                        </div>
                      </div>

                      <div className="package-content">
                        <h3 className="package-name">{packageData.name}</h3>
                        
                        <div className="package-features">
                          {packageData.package_info && (
                            <ul>
                              {Object.values(packageData.package_info).map((line, index) => (
                                <li key={index}>
                                  <FaCheckCircle className="feature-icon" />
                                  {line}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="package-highlights">
                          <div className="highlight-item">
                            <FaVideo className="highlight-icon" />
                            <span>{packageData.video_limit || 'Unlimited'} Videos</span>
                          </div>
                          <div className="highlight-item">
                            <FaHeadset className="highlight-icon" />
                            <span>24/7 Support</span>
                          </div>
                        </div>
                      </div>

                      <div className="package-card-footer">
                        <button className="package-btn">
                          View Plans
                          <FaArrowRight />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Membership Plans
              <div className="membership-plans-section">
                <div className="plans-header">
                  <button 
                    className="back-btn"
                    onClick={handleBackToPackages}
                  >
                    <FaArrowLeft />
                    Back to Packages
                  </button>
                  <div className="selected-package-info">
                    <h2>{selectedPackage.name} Package</h2>
                    <p>Choose the perfect plan for your learning journey</p>
                  </div>
                </div>

                {plansLoading ? (
                  <div className="plans-loading">
                    <div className="plans-loading-spinner"></div>
                    <p>Loading plans...</p>
                  </div>
                ) : membershipPlans.length > 0 ? (
                  <div className="plans-grid">
                    {membershipPlans.map((plan) => {
                      const isCurrent = isCurrentPlan(plan);
                      const isUpgrade = currentSubscription && isPlanUpgrade(currentSubscription.membership_id, plan);
                      const isDowngrade = currentSubscription && isPlanDowngrade(currentSubscription.membership_id, plan);
                      const isRestricted = isDowngrade;
                      
                      return (
                        <div key={plan._id} className={`plan-card ${isCurrent ? 'current-plan' : ''} ${isRestricted ? 'restricted-plan' : ''}`}>
                          <div className="plan-header">
                            <h3 className="plan-name">{plan.planName}</h3>
                            <div className="plan-badge">
                              {isCurrent ? (
                                <>
                                  <FaCheckCircle />
                                  Active Plan
                                </>
                              ) : isRestricted ? (
                                <>
                                  <FaTimesCircle />
                                  Restricted
                                </>
                              ) : (
                                <>
                                  <FaCheckCircle />
                                  Active
                                </>
                              )}
                            </div>
                          </div>

                          <div className="plan-pricing">
                            <div className="price-section">
                              <div className="original-price">
                                {formatPrice(plan.price)}
                              </div>
                              {plan.discount > 0 && (
                                <div className="discount-badge">
                                  Save {formatPrice(plan.discount)}
                                </div>
                              )}
                            </div>
                            <div className="final-price">
                              {formatPrice(plan.finalPrice)}
                            </div>
                            <div className="price-period">
                              per {formatDuration(plan.duration).toLowerCase()}
                            </div>
                          </div>

                          {isCurrent && (
                            <div className="current-plan-info">
                              <p className="text-success">
                                <FaCheckCircle /> You are currently subscribed to this plan
                              </p>
                            </div>
                          )}

                          {isRestricted && (
                            <div className="plan-change-info">
                              <p className="text-danger">
                                <FaTimesCircle /> Cannot downgrade from current plan
                              </p>
                            </div>
                          )}

                          {isUpgrade && (
                            <div className="plan-change-info">
                              <p className="text-info">
                                <FaArrowUp /> Upgrade from current plan
                              </p>
                            </div>
                          )}

                          <div className="plan-actions">
                            <button 
                              className={`plan-btn ${isCurrent ? 'current' : isRestricted ? 'restricted' : 'primary'}`}
                              onClick={() => handleSubscribe(plan)}
                              disabled={subscribing || isCurrent || isRestricted}
                            >
                              <FaCreditCard />
                              {isCurrent ? 'Active Plan' : isRestricted ? 'Restricted' : (subscribing ? 'Processing...' : 'Subscribe Now')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-plans">
                    <FaBox className="no-plans-icon" />
                    <h3>No Active Plans Available</h3>
                    <p>No active membership plans are currently available for this package. Please check back later.</p>
                    <button 
                      className="back-btn"
                      onClick={handleBackToPackages}
                    >
                      Back to Packages
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Package;
