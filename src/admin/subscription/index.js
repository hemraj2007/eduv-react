import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import subscriptionService from "../../services/subscriptionService";
import studentService from "../../services/studentService";
import membershipPlanService from "../../services/membershipPlanService";
import packageService from "../../services/packageService";
import { Eye, Plus, FileSpreadsheet, Search, RotateCcw } from "lucide-react";
import * as XLSX from "xlsx";
import Moment from "react-moment";
import Loader from "../../components/Loader";
import 'animate.css';
import '../../style/admin-style.css';


const SubscriptionIndex = () => {
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [searchTermStudent, setSearchTermStudent] = useState('');
  const [searchTermMembership, setSearchTermMembership] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [students, setStudents] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [packages, setPackages] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [subscriptionsPerPage, setSubscriptionsPerPage] = useState(25);
  // Pagination state is managed through separate variables
  // const [paginationData, setPaginationData] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchMembershipPlans();
    fetchPackages();
    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // This is intentionally left with an empty dependency array
  // to only run once on component mount
  
  useEffect(() => {
    // Set total subscriptions count
    setTotalSubscriptions(subscriptionData.length);
    // Calculate total pages
    setTotalPages(Math.ceil(subscriptionData.length / subscriptionsPerPage));
    // Initialize filtered data with first page
    if (subscriptionData.length > 0) {
      setFilteredData(subscriptionData.slice(0, subscriptionsPerPage));
    }
  }, [subscriptionData, subscriptionsPerPage]);

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAllStudents();
      console.log("Students API Response:", response);
      
      let studentsData = [];
      if (response?.students) {
        studentsData = response.students;
      } else if (response?.data) {
        studentsData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        studentsData = response;
      }
      
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchMembershipPlans = async () => {
    try {
      const response = await membershipPlanService.getAllMembershipPlans();
      console.log("Membership Plans API Response:", response);
      
      let membershipPlansData = [];
      if (response?.membershipPlans) {
        membershipPlansData = response.membershipPlans;
      } else if (response?.data) {
        membershipPlansData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        membershipPlansData = response;
      }
      
      setMembershipPlans(membershipPlansData);
    } catch (error) {
      console.error("Error fetching membership plans:", error);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await packageService.getAllPackages();
      console.log("Packages API Response:", response);
      
      let packagesData = [];
      if (response?.packages) {
        packagesData = response.packages;
      } else if (response?.data) {
        packagesData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        packagesData = response;
      }
      
      setPackages(packagesData);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const fetchSubscriptions = async (page = currentPage, pageSize = subscriptionsPerPage) => {
    setIsLoading(true);
    try {
      const response = await subscriptionService.getAllSubscriptions();
      console.log("Subscription API Response:", response);
      console.log("Response type:", typeof response);
      console.log("Response keys:", response ? Object.keys(response) : 'null or undefined');
      
      let subscriptions = [];
      if (Array.isArray(response)) {
        console.log("Response is an array");
        subscriptions = response;
      } else if (response?.data && Array.isArray(response.data)) {
        console.log("Response.data is an array");
        subscriptions = response.data;
      } else if (response?.subscriptions && Array.isArray(response.subscriptions)) {
        console.log("Response.subscriptions is an array");
        subscriptions = response.subscriptions;
      } else if (response?.data?.subscriptions && Array.isArray(response.data.subscriptions)) {
        console.log("Response.data.subscriptions is an array");
        subscriptions = response.data.subscriptions;
      } else {
        console.log("No subscriptions found in response structure:", response);
        // Try to extract any array from the response as a last resort
        const possibleArrays = Object.values(response || {}).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          console.log("Found possible array in response:", possibleArrays[0]);
          subscriptions = possibleArrays[0];
        } else {
          subscriptions = [];
        }
      }
      
      console.log("Extracted subscriptions:", subscriptions);
      console.log("Number of subscriptions:", subscriptions.length);
      
      // Sort subscriptions by createdAt in descending order (newest first)
      const sortedSubscriptions = subscriptions.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order (newest first)
      });
      
      setSubscriptionData(sortedSubscriptions);
      
      // Set pagination data
      const totalCount = sortedSubscriptions.length;
      setTotalSubscriptions(totalCount);
      setTotalPages(Math.ceil(totalCount / pageSize));
      
      // Calculate start and end indices for the current page
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalCount);
      
      // Set filtered data to show only the current page
      setFilteredData(sortedSubscriptions.slice(startIndex, endIndex));
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      console.error("Error details:", error.response?.data);
      setSubscriptionData([]);
      setFilteredData([]);
      setTotalSubscriptions(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setFilteredData(subscriptionData);
  }, [subscriptionData]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const filtered = subscriptionData.filter(subscription => {
      const studentMatch = searchTermStudent === '' || 
        getStudentName(subscription.student_id)?.toLowerCase().includes(searchTermStudent.toLowerCase());
      const membershipMatch = searchTermMembership === '' || 
        getMembershipPlanName(subscription.membership_id)?.toLowerCase().includes(searchTermMembership.toLowerCase());

      return studentMatch && membershipMatch;
    });

    setFilteredData(filtered);
  };

  // Helper function to get student name by ID or object
  const getStudentName = (studentId) => {
    console.log("getStudentName called with:", studentId);
    
    // Handle both string ID and object with nested student data
    if (typeof studentId === 'object' && studentId !== null) {
      const name = studentId.name || `${studentId.firstName || ''} ${studentId.lastName || ''}`.trim() || 'Unknown Student';
      console.log("Extracted student name:", name);
      return name;
    }
    
    // Handle string ID (fallback)
    const student = students.find(std => std._id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : studentId;
  };

  // Helper function to get student email by ID or object
  const getStudentEmail = (studentId) => {
    console.log("getStudentEmail called with:", studentId);
    
    // Handle both string ID and object with nested student data
    if (typeof studentId === 'object' && studentId !== null) {
      const email = studentId.email || 'No email';
      console.log("Extracted student email:", email);
      return email;
    }
    
    // Handle string ID (fallback)
    const student = students.find(std => std._id === studentId);
    return student ? student.email : '';
  };

  // Helper function to get membership plan name by ID or object
  const getMembershipPlanName = (membershipId) => {
    console.log("getMembershipPlanName called with:", membershipId);
    
    // Handle both string ID and object with nested membership data
    if (typeof membershipId === 'object' && membershipId !== null) {
      const planName = membershipId.planName || 'Unknown Plan';
      console.log("Extracted plan name:", planName);
      return planName;
    }
    
    // Handle string ID (fallback)
    const membershipPlan = membershipPlans.find(plan => plan._id === membershipId);
    return membershipPlan ? membershipPlan.planName : membershipId;
  };

  // Helper function to get package name by ID or object
  const getPackageName = (packageId) => {
    console.log("getPackageName called with:", packageId);
    
    // Handle both string ID and object with nested package data
    if (typeof packageId === 'object' && packageId !== null) {
      const packageName = packageId.name || 'Unknown Package';
      console.log("Extracted package name:", packageName);
      return packageName;
    }
    
    // Handle string ID (fallback)
    const pkg = packages.find(p => p._id === packageId);
    return pkg ? pkg.name : packageId;
  };

  const handleReset = () => {
    setSearchTermStudent('');
    setSearchTermMembership('');
    setFilteredData(subscriptionData);
  };
  
  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // In a real implementation, you would fetch data for the specific page
    // For now, we'll simulate pagination with the existing data
    const startIndex = (page - 1) * subscriptionsPerPage;
    const endIndex = startIndex + subscriptionsPerPage;
    setFilteredData(subscriptionData.slice(startIndex, endIndex));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleFirstPage = () => {
    handlePageChange(1);
  };

  const handleLastPage = () => {
    handlePageChange(totalPages);
  };

  const handlePageSizeChange = (newPageSize) => {
    setSubscriptionsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    // Recalculate total pages
    setTotalPages(Math.ceil(subscriptionData.length / newPageSize));
    // Update filtered data
    setFilteredData(subscriptionData.slice(0, newPageSize));
  };

  // Pagination component
  const renderPagination = () => {
    // Show pagination if there are subscriptions and more than 1 page, or if we want to show page size selector
    if (totalSubscriptions === 0) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        // Show all pages if total pages is less than max visible
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show pages around current page
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    };

    const pageNumbers = getPageNumbers();

    // Calculate the correct start and end numbers for current page
    const startNumber = ((currentPage - 1) * subscriptionsPerPage) + 1;
    const endNumber = Math.min(currentPage * subscriptionsPerPage, totalSubscriptions);
    
    // Handle edge cases
    const displayStart = totalSubscriptions > 0 ? startNumber : 0;
    const displayEnd = totalSubscriptions > 0 ? endNumber : 0;
    
    // Ensure we don't show invalid ranges
    const finalStart = displayStart > totalSubscriptions ? 0 : displayStart;
    const finalEnd = displayEnd > totalSubscriptions ? totalSubscriptions : displayEnd;

    return (
      <div className={`admin-dashboard-pagination`}>
        <div className="admin-dashboard-pagination-info">
          <span>
            Showing {finalStart} to {finalEnd} of {totalSubscriptions} subscriptions
          </span>
        </div>
        
        <div className="admin-dashboard-pagination-size-selector">
          <label htmlFor="pageSizeSelect" className="admin-dashboard-page-size-label">
            Show:
          </label>
          <select
            id="pageSizeSelect"
            value={subscriptionsPerPage}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="admin-dashboard-page-size-select"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={75}>75</option>
            <option value={100}>100</option>
          </select>
          <span className="admin-dashboard-page-size-text">per page</span>
        </div>
        
        {/* Always show pagination controls */}
        <div className="admin-dashboard-pagination-controls">
            <button
              onClick={handleFirstPage}
              disabled={currentPage === 1}
              className="admin-dashboard-pagination-btn"
              title="First Page"
            >
              ««
            </button>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="admin-dashboard-pagination-btn"
              title="Previous Page"
            >
              «
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`admin-dashboard-pagination-btn ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="admin-dashboard-pagination-btn"
              title="Next Page"
            >
              »
            </button>
            <button
              onClick={handleLastPage}
              disabled={currentPage === totalPages}
              className="admin-dashboard-pagination-btn"
              title="Last Page"
            >
              »»
            </button>
          </div>
      </div>
    );
  };



  const handleViewSubscription = (subscription) => {
    const getStatusIcon = (status) => {
      return "✅"; // Subscriptions are typically active
    };

    const getStatusColor = (status) => {
      return "#10B981"; // Green for active subscriptions
    };

    const startDate = subscription.startDate
      ? new Date(subscription.startDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })
      : 'N/A';

    const endDate = subscription.endDate
      ? new Date(subscription.endDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })
      : 'N/A';

    const statusColor = getStatusColor();
    const statusIcon = getStatusIcon();

    Swal.fire({
      title: `<div class="subscription-popup-header">
        <div class="subscription-header-icon">📋</div>
        <div class="subscription-header-content">
          <h3>Subscription Details</h3>
          <p>Complete information about this subscription</p>
        </div>
      </div>`,
      html: `
        <div class="subscription-popup-body">
          <!-- Status Banner -->
          <div class="subscription-status-banner" style="background: linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}25 100%); border-left: 4px solid ${statusColor};">
            <div class="status-icon">${statusIcon}</div>
            <div class="status-info">
              <h4>Active</h4>
              <p>Current Status</p>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="subscription-content-grid">
            <!-- Student Information Section -->
            <div class="subscription-section">
              <div class="section-header">
                <div class="section-icon">👤</div>
                <h4>Student Information</h4>
              </div>
              <div class="section-content">
                <div class="info-item">
                  <label>Student Name</label>
                  <span>${getStudentName(subscription.student_id) || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Email Address</label>
                  <span>${getStudentEmail(subscription.student_id) || 'N/A'}</span>
                </div>
              </div>
            </div>

            <!-- Package Information Section -->
            <div class="subscription-section">
              <div class="section-header">
                <div class="section-icon">📦</div>
                <h4>Package Information</h4>
              </div>
              <div class="section-content">
                <div class="info-item">
                  <label>Package Name</label>
                  <span class="package-name">${getPackageName(subscription.packageId) || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Membership Plan</label>
                  <span>${getMembershipPlanName(subscription.membership_id) || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Video Limit</label>
                  <span>${subscription.video_limit || 'Unlimited'}</span>
                </div>
              </div>
            </div>

            <!-- Date Information Section -->
            <div class="subscription-section">
              <div class="section-header">
                <div class="section-icon">📅</div>
                <h4>Date Information</h4>
              </div>
              <div class="section-content">
                <div class="info-item">
                  <label>Start Date</label>
                  <span>${startDate}</span>
                </div>
                <div class="info-item">
                  <label>End Date</label>
                  <span>${endDate}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="subscription-actions">
            <button class="action-btn primary" onclick="window.open('mailto:${getStudentEmail(subscription.student_id)}', '_blank')">
              📧 Send Email
            </button>
            <button class="action-btn secondary" onclick="navigator.clipboard.writeText('${getStudentEmail(subscription.student_id)}')">
              📋 Copy Email
            </button>
          </div>
        </div>`,
      width: '750px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'subscription-swal-popup',
        title: 'subscription-swal-title',
        htmlContainer: 'subscription-swal-html'
      },
      didOpen: () => {
        // Add custom styles for the subscription popup
        const style = document.createElement('style');
        style.textContent = `
          .subscription-swal-popup {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            border-radius: 16px;
            overflow: hidden;
          }

          .subscription-swal-title {
            padding: 0 !important;
            margin: 0 !important;
          }

          .subscription-swal-html {
            padding: 0 !important;
            margin: 0 !important;
          }

          .subscription-popup-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            margin: -16px -16px 0 -16px;
          }

          .subscription-header-icon {
            font-size: 24px;
            background: rgba(255, 255, 255, 0.2);
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .subscription-header-content h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
          }

          .subscription-header-content p {
            margin: 2px 0 0 0;
            opacity: 0.9;
            font-size: 12px;
          }

          .subscription-popup-body {
            padding: 16px;
          }

          .subscription-status-banner {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 12px;
          }

          .status-icon {
            font-size: 18px;
            background: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .status-info h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #1F2937;
          }

          .status-info p {
            margin: 2px 0 0 0;
            font-size: 12px;
            color: #6B7280;
          }

          .subscription-content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 12px;
          }

          .subscription-section {
            background: #F9FAFB;
            border-radius: 8px;
            padding: 10px;
            border: 1px solid #E5E7EB;
          }

          .section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #E5E7EB;
          }

          .section-icon {
            font-size: 16px;
            background: #667eea;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .section-header h4 {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #1F2937;
          }

          .section-content {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 10px;
            background: white;
            border-radius: 6px;
            border: 1px solid #E5E7EB;
          }

          .info-item label {
            font-weight: 500;
            color: #6B7280;
            font-size: 12px;
          }

          .info-item span {
            font-weight: 600;
            color: #1F2937;
            font-size: 12px;
          }

          .package-name {
            color: #667eea !important;
            font-weight: 700 !important;
          }

          .subscription-actions {
            display: flex;
            gap: 8px;
            justify-content: center;
            padding-top: 12px;
            border-top: 1px solid #E5E7EB;
          }

          .action-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .action-btn.primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .action-btn.primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }

          .action-btn.secondary {
            background: #F3F4F6;
            color: #374151;
            border: 1px solid #D1D5DB;
          }

          .action-btn.secondary:hover {
            background: #E5E7EB;
            transform: translateY(-1px);
          }

          @media (max-width: 768px) {
            .subscription-content-grid {
              grid-template-columns: 1fr;
            }
            
            .info-item {
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
            }
            
            .subscription-actions {
              flex-direction: column;
            }
          }

          @media (max-width: 600px) {
            .subscription-content-grid {
              grid-template-columns: 1fr;
            }
          }
        `;
        document.head.appendChild(style);
      }
    });
  };

  const handleAddSubscription = () => {
    navigate("/admin/subscription/add");
  };

  // const handleStatusChange = async (id, currentStatus) => {
  //   // Toggle the status between 'active' and 'inactive'
  //   const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
  //   setIsStatusUpdating(true);
    
  //   try {
  //     // Show confirmation dialog
  //     const result = await Swal.fire({
  //       title: 'Change subscription status?',
  //       text: `Are you sure you want to change this subscription to ${newStatus}?`,
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonColor: '#3085d6',
  //       cancelButtonColor: '#d33',
  //       confirmButtonText: 'Yes, change it!'
  //     });
      
  //     if (result.isConfirmed) {
  //       // Call API to update status
  //       await subscriptionService.updateSubscription(id, { status: newStatus });
        
  //       // Show success message
  //       Swal.fire({
  //         title: 'Updated!',
  //         text: 'Subscription status has been updated.',
  //         icon: 'success',
  //         timer: 1500,
  //         showConfirmButton: false
  //       });
        
  //       // Refresh subscription data
  //       fetchSubscriptions();
  //     }
  //   } catch (error) {
  //     console.error('Error updating subscription status:', error);
      
  //     // Show error message
  //     Swal.fire({
  //       title: 'Error',
  //       text: error.response?.data?.message || 'Failed to update subscription status!',
  //       icon: 'error'
  //     });
  //   } finally {
  //     setIsStatusUpdating(false);
  //   }
  // };

  const exportToExcel = () => {
    const dataToExport = filteredData.map((subscription, index) => ({
      'S NO': index + 1,
      'Student': getStudentName(subscription.student_id) || 'N/A',
      'Student Email': getStudentEmail(subscription.student_id) || 'N/A',
      'Package': getPackageName(subscription.packageId) || 'N/A',
      'Membership Plan': getMembershipPlanName(subscription.membership_id) || 'N/A',
      'Video Limit': subscription.video_limit || 'Unlimited',
      'Start Date': subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : "N/A",
      'End Date': subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : "N/A",
      'Created Date': subscription.createdAt ? new Date(subscription.createdAt).toLocaleDateString() : 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subscriptions");
    XLSX.writeFile(wb, "subscriptions_data.xlsx");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Loader title="Loading Subscriptions" subtitle="Please wait..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard-pageContent">
        <div className="admin-dashboard-mb-6 animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-d-flex admin-dashboard-justify-between admin-dashboard-align-center admin-dashboard-mb-4">
            <h2 className="admin-dashboard-text-2xl admin-dashboard-font-semibold admin-dashboard-text-heading-color animated animate__animated animate__slideInLeft">Subscription Management</h2>
            <div className="admin-dashboard-d-flex admin-dashboard-gap-2">
              <button onClick={exportToExcel} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <FileSpreadsheet size={18} className="admin-dashboard-btn-icon" />
                Export to Excel
              </button>
              <button onClick={handleAddSubscription} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <Plus size={18} className="admin-dashboard-btn-icon" />
                Add Subscription
              </button>
            </div>
          </div>
        </div>

        <div className="admin-dashboard-search-form animated animate__animated animate__fadeInUp">
          <form onSubmit={handleSearchSubmit} className="admin-dashboard-search-form-content">
            <div className="admin-dashboard-search-input-group">
              <input
                type="text"
                className="admin-dashboard-search-input"
                placeholder="Search by student..."
                value={searchTermStudent}
                onChange={(e) => setSearchTermStudent(e.target.value)}
              />
            </div>
            <div className="admin-dashboard-search-input-group">
              <input
                type="text"
                className="admin-dashboard-search-input"
                placeholder="Search by membership plan..."
                value={searchTermMembership}
                onChange={(e) => setSearchTermMembership(e.target.value)}
              />
            </div>

            <div className="admin-dashboard-search-button-group">
              <button type="submit" className="admin-dashboard-search-btn admin-dashboard-search-btn-primary">
                <Search size={16} className="admin-dashboard-btn-icon" />
                Search
              </button>
              <button type="button" onClick={handleReset} className="admin-dashboard-search-btn admin-dashboard-search-btn-secondary">
                <RotateCcw size={16} className="admin-dashboard-btn-icon" />
                Reset
              </button>
            </div>
          </form>
        </div>

        {filteredData.length === 0 ? (
          <div className="admin-dashboard-empty-state animated animate__animated animate__fadeIn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3>No subscriptions found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="admin-dashboard-table-container animated animate__animated animate__fadeIn">
            <table className="admin-dashboard-table">
              <thead className="admin-dashboard-table-header">
                <tr>
                  <th className="admin-dashboard-sno-column">S NO</th>
                  <th className="admin-dashboard-name-column">Student</th>
                  <th className="admin-dashboard-package-column">Package</th>
                  <th className="admin-dashboard-membership-column">Membership Plan</th>
                  <th className="admin-dashboard-date-column">Created Date</th>
                  <th className="admin-dashboard-actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((subscription, index) => {

                  return (
                    <tr key={subscription._id} className="admin-dashboard-table-row animated animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                      <td className="admin-dashboard-sno-cell">{(currentPage - 1) * subscriptionsPerPage + index + 1}</td>
                      <td className="admin-dashboard-name-cell">
                        <div className="admin-dashboard-user-info">
                          <div className="admin-dashboard-user-name">{getStudentName(subscription.student_id) || 'N/A'}</div>
                          <div className="admin-dashboard-user-email">{getStudentEmail(subscription.student_id) || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="admin-dashboard-package-cell">{getPackageName(subscription.packageId) || 'N/A'}</td>
                      <td className="admin-dashboard-membership-cell">{getMembershipPlanName(subscription.membership_id) || 'N/A'}</td>
                      <td className="admin-dashboard-date-cell">
                        {subscription.createdAt ? (
                          <Moment format="MMMM Do YYYY">{new Date(subscription.createdAt)}</Moment>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="admin-dashboard-actions-cell">
                        <div className="admin-dashboard-actions-container">
                          <button
                            onClick={() => handleViewSubscription(subscription)}
                            title="View Details"
                            className="admin-dashboard-btn-action-icon admin-dashboard-btn-view"
                          >
                            <Eye size={14} className="admin-dashboard-action-icon-svg" />
                          </button>
                          {/* <div
                            className={`admin-dashboard-toggle-switch ${subscription.status === "active" ? 'active' : 'inactive'} ${isStatusUpdating ? 'disabled' : ''}`}
                            onClick={() => !isStatusUpdating && handleStatusChange(subscription._id, subscription.status)}
                            title={`Toggle ${subscription.status === "active" ? "Inactive" : "Active"}`}
                            style={{ cursor: isStatusUpdating ? 'not-allowed' : 'pointer' }}
                          >
                            <div className="admin-dashboard-toggle-knob">
                              {subscription.status === "active" ? (
                                <span className="admin-dashboard-toggle-knob-icon active">✓</span>
                              ) : (
                                <span className="admin-dashboard-toggle-knob-icon inactive">✗</span>
                              )}
                            </div>
                          </div> */}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        {renderPagination()}
      </div>
    </AdminLayout>
  );
};

export default SubscriptionIndex;