import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import Moment from "react-moment";
import * as XLSX from "xlsx";
import 'animate.css';

import membershipPlanService from "../../services/membershipPlanService";
import packageService from "../../services/packageService";
import { BiShow, BiTrash } from "react-icons/bi";
import { BsPencil } from "react-icons/bs";
import { FileSpreadsheet, Plus } from 'lucide-react';
import Loader from "../../components/Loader";
import "../../style/admin-style.css";

const MembershipPlanIndex = () => {
  const [membershipPlanData, setMembershipPlanData] = useState([]);
  const [searchTermName, setSearchTermName] = useState('');
  const [searchTermPackageId, setSearchTermPackageId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlans, setTotalPlans] = useState(0);
  const [plansPerPage, setPlansPerPage] = useState(25);
  const [paginationData, setPaginationData] = useState({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchPackages();
    fetchMembershipPlans();
    fetchTotalCount();
  }, []);

  // Handle success alert from navigation state
  useEffect(() => {
    if (location.state?.showSuccessAlert && location.state?.successMessage) {
      Swal.fire({
        title: "Success!",
        text: location.state.successMessage,
        icon: "success",
        confirmButtonText: "OK",
        timer: 3000,
        timerProgressBar: true,
      });
      
      // Clear the state to prevent showing the alert again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

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

  useEffect(() => {
    setFilteredData(membershipPlanData);
  }, [membershipPlanData]);

  const fetchTotalCount = async () => {
    try {
      const response = await membershipPlanService.getAllMembershipPlans();
      const totalCount = response?.membershipPlans?.length || response?.data?.length || (Array.isArray(response) ? response.length : 0);
      setTotalPlans(totalCount);
      setTotalPages(Math.ceil(totalCount / plansPerPage));
    } catch (error) {
      console.error("Error fetching total count:", error);
      setTotalPlans(0);
      setTotalPages(1);
    }
  };

  const fetchMembershipPlans = async (page = 1, pageSize = plansPerPage) => {
    setIsLoading(true);
    try {
      const response = await membershipPlanService.getAllMembershipPlans();
      console.log("Membership Plan API Response:", response); // Debug log
      
      // Handle different response structures
      let membershipPlans = [];
      if (response?.membershipPlans) {
        membershipPlans = response.membershipPlans;
      } else if (response?.data) {
        membershipPlans = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        membershipPlans = response;
      }
      
      console.log("Extracted membership plans:", membershipPlans); // Debug log
      
      // Sort membership plans by createdAt in descending order (newest first)
      const sortedMembershipPlans = membershipPlans.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order (newest first)
      });
      
      // Implement pagination manually since API doesn't support it
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedPlans = sortedMembershipPlans.slice(startIndex, endIndex);
      
      // Create pagination data
      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(sortedMembershipPlans.length / pageSize),
        totalCount: sortedMembershipPlans.length,
        plansPerPage: pageSize
      };
      
      setMembershipPlanData(paginatedPlans);
      setFilteredData(paginatedPlans);
      setPaginationData(pagination);
      setCurrentPage(page);
      setTotalPages(pagination.totalPages);
      setTotalPlans(sortedMembershipPlans.length);
    } catch (error) {
      console.error("Error fetching membership plans:", error);
      console.error("Error details:", error.response?.data); // Debug log
      setMembershipPlanData([]);
      setFilteredData([]);
      setPaginationData({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await membershipPlanService.deleteMembershipPlan(id);
          Swal.fire("Deleted!", "Membership plan has been deleted.", "success");
          fetchMembershipPlans();
        } catch (error) {
          Swal.fire("Error", error.response?.data.message || "Error deleting membership plan", "error");
        }
      }
    });
  };

  const handleChangeStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    Swal.fire({
      title: "Change membership plan status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await membershipPlanService.updateMembershipPlan(id, { status: newStatus });
          Swal.fire("Updated!", "Membership plan status updated.", "success");
          fetchMembershipPlans();
        } catch (error) {
          Swal.fire("Error", "Failed to update status!", "error");
        }
      }
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const filtered = membershipPlanData.filter(plan => {
      const nameMatch = searchTermName === '' || plan.planName?.toLowerCase().includes(searchTermName.toLowerCase());
      const packageIdMatch = searchTermPackageId === '' || plan.package_id?.toLowerCase().includes(searchTermPackageId.toLowerCase());
      const statusMatch = statusFilter === 'all' || plan.status === statusFilter;

      return nameMatch && packageIdMatch && statusMatch;
    });

    setFilteredData(filtered);
  };

  // Helper function to get package name by ID
  const getPackageName = (packageId) => {
    const packageItem = packages.find(pkg => pkg._id === packageId);
    return packageItem ? packageItem.name : packageId;
  };

  const handleReset = () => {
    setSearchTermName('');
    setSearchTermPackageId('');
    setStatusFilter('all');
    setFilteredData(membershipPlanData);
  };
  
  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchMembershipPlans(page);
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
    if (currentPage !== 1) {
      handlePageChange(1);
    }
  };

  const handleLastPage = () => {
    if (currentPage !== totalPages) {
      handlePageChange(totalPages);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPlansPerPage(newPageSize);
    setCurrentPage(1);
    fetchMembershipPlans(1, newPageSize);
  };
  
  // Pagination component
  const renderPagination = () => {
    // Show pagination if there are plans and more than 1 page, or if we want to show page size selector
    if (totalPlans === 0) return null;

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
    const startNumber = ((currentPage - 1) * plansPerPage) + 1;
    const endNumber = Math.min(currentPage * plansPerPage, totalPlans);
    
    // Handle edge cases
    const displayStart = totalPlans > 0 ? startNumber : 0;
    const displayEnd = totalPlans > 0 ? endNumber : 0;
    
    // Ensure we don't show invalid ranges
    const finalStart = displayStart > totalPlans ? 0 : displayStart;
    const finalEnd = displayEnd > totalPlans ? totalPlans : displayEnd;

    return (
      <div className="admin-dashboard-pagination">
        <div className="admin-dashboard-pagination-info">
          <span>
            Showing {finalStart} to {finalEnd} of {totalPlans} plans
          </span>
        </div>
        
        <div className="admin-dashboard-pagination-size-selector">
          <label htmlFor="pageSizeSelect" className="admin-dashboard-page-size-label">
            Show:
          </label>
          <select
            id="pageSizeSelect"
            value={plansPerPage}
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

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(plan => ({
      "Package": getPackageName(plan.package_id),
      "Plan Name": plan.planName,
      "Price": plan.price,
      "Discount (₹)": plan.discount,
      "Final Price": plan.finalPrice,
      "Duration (days)": plan.duration,
      "Status": plan.status === 'active' ? "Active" : "Inactive",
      "Created Date": plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : "N/A",
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Membership Plans");
    XLSX.writeFile(wb, "membership_plans.xlsx");
  };

  // const handleViewMembershipPlan = (plan) => {
  //   const getStatusIcon = (status) => {
  //     return status === "active" ? "✅" : "❌";
  //   };

  //   const getStatusColor = (status) => {
  //     return status === "active" ? "#10B981" : "#EF4444";
  //   };

  //   const packageName = getPackageName(plan.package_id);
  //   const createdDate = plan.createdAt
  //     ? new Date(plan.createdAt).toLocaleDateString('en-US', { 
  //         year: 'numeric', 
  //         month: 'long', 
  //         day: 'numeric',
  //         hour: '2-digit',
  //         minute: '2-digit'
  //       })
  //     : 'N/A';

  //   const statusColor = getStatusColor(plan.status);
  //   const statusIcon = getStatusIcon(plan.status);

  //   Swal.fire({
  //     title: `<div class="user-popup-header">
  //       <div class="user-header-icon">📋</div>
  //       <div class="user-header-content">
  //         <h3>Membership Plan Details</h3>
  //         <p>Complete information about this plan</p>
  //       </div>
  //     </div>`,
  //     html: `
  //       <div class="user-popup-body">
  //         <!-- Status Banner -->
  //         <div class="user-status-banner" style="background: linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}25 100%); border-left: 4px solid ${statusColor};">
  //           <div class="status-icon">${statusIcon}</div>
  //           <div class="status-info">
  //             <h4>${plan.status === "active" ? 'Active' : 'Inactive'}</h4>
  //             <p>Current Status</p>
  //           </div>
  //         </div>

  //         <!-- Main Content Grid -->
  //         <div class="user-content-grid">
  //           <!-- Plan Information Section -->
  //           <div class="user-section">
  //             <div class="section-header">
  //               <div class="section-icon">📦</div>
  //               <h4>Plan Information</h4>
  //             </div>
  //             <div class="section-content">
  //               <div class="info-item">
  //                 <label>Package</label>
  //                 <span>${packageName || 'N/A'}</span>
  //               </div>
  //               <div class="info-item">
  //                 <label>Plan Name</label>
  //                 <span>${plan.planName || 'N/A'}</span>
  //               </div>
  //               <div class="info-item">
  //                 <label>Duration</label>
  //                 <span>${plan.duration || 'N/A'} days</span>
  //               </div>
  //             </div>
  //           </div>

  //           <!-- Pricing Information Section -->
  //           <div class="user-section">
  //             <div class="section-header">
  //               <div class="section-icon">💰</div>
  //               <h4>Pricing Information</h4>
  //             </div>
  //             <div class="section-content">
  //               <div class="info-item">
  //                 <label>Original Price</label>
  //                 <span>₹${plan.price || 'N/A'}</span>
  //               </div>
  //               <div class="info-item">
  //                 <label>Discount</label>
  //                 <span>₹${plan.discount || 0}</span>
  //               </div>
  //               <div class="info-item">
  //                 <label>Final Price</label>
  //                 <span style="color: #10B981; font-weight: 700;">₹${plan.finalPrice || 'N/A'}</span>
  //               </div>
  //             </div>
  //           </div>
  //         </div>

  //         <!-- Additional Information Section -->
  //         <div class="user-section" style="margin-top: 10px;">
  //           <div class="section-header">
  //             <div class="section-icon">📅</div>
  //             <h4>Additional Information</h4>
  //           </div>
  //           <div class="section-content">
  //             <div class="info-item">
  //               <label>Created Date</label>
  //               <span>${createdDate}</span>
  //             </div>
  //           </div>
  //         </div>
  //       </div>`,
  //     width: '750px',
  //     showCloseButton: true,
  //     showConfirmButton: false,
  //     customClass: {
  //       popup: 'user-swal-popup',
  //       title: 'user-swal-title',
  //       htmlContainer: 'user-swal-html'
  //     },
  //     didOpen: () => {
  //       // Add custom styles for the user popup
  //       const style = document.createElement('style');
  //       style.textContent = `
  //         .user-swal-popup {
  //           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  //           border-radius: 16px;
  //           overflow: hidden;
  //         }

  //         .user-swal-title {
  //           padding: 0 !important;
  //           margin: 0 !important;
  //         }

  //         .user-swal-html {
  //           padding: 0 !important;
  //           margin: 0 !important;
  //         }

  //         .user-popup-header {
  //           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  //           color: white;
  //           padding: 16px;
  //           display: flex;
  //           align-items: center;
  //           gap: 12px;
  //           margin: -16px -16px 0 -16px;
  //         }

  //         .user-header-icon {
  //           font-size: 24px;
  //           background: rgba(255, 255, 255, 0.2);
  //           width: 45px;
  //           height: 45px;
  //           border-radius: 50%;
  //           display: flex;
  //           align-items: center;
  //           justify-content: center;
  //         }

  //         .user-header-content h3 {
  //           margin: 0;
  //           font-size: 20px;
  //           font-weight: 600;
  //         }

  //         .user-header-content p {
  //           margin: 2px 0 0 0;
  //           opacity: 0.9;
  //           font-size: 12px;
  //         }

  //         .user-popup-body {
  //           padding: 16px;
  //         }

  //         .user-status-banner {
  //           display: flex;
  //           align-items: center;
  //           gap: 12px;
  //           padding: 10px;
  //           border-radius: 8px;
  //           margin-bottom: 12px;
  //         }

  //         .status-icon {
  //           font-size: 18px;
  //           background: white;
  //           width: 36px;
  //           height: 36px;
  //           border-radius: 50%;
  //           display: flex;
  //           align-items: center;
  //           justify-content: center;
  //           box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  //         }

  //         .status-info h4 {
  //           margin: 0;
  //           font-size: 16px;
  //           font-weight: 600;
  //           color: #1F2937;
  //         }

  //         .status-info p {
  //           margin: 2px 0 0 0;
  //           font-size: 12px;
  //           color: #6B7280;
  //         }

  //         .user-content-grid {
  //           display: grid;
  //           grid-template-columns: 1fr 1fr;
  //           gap: 10px;
  //           margin-bottom: 12px;
  //         }

  //         .user-section {
  //           background: #F9FAFB;
  //           border-radius: 8px;
  //           padding: 10px;
  //           border: 1px solid #E5E7EB;
  //         }

  //         .section-header {
  //           display: flex;
  //           align-items: center;
  //           gap: 8px;
  //           margin-bottom: 12px;
  //           padding-bottom: 8px;
  //           border-bottom: 1px solid #E5E7EB;
  //         }

  //         .section-icon {
  //           font-size: 16px;
  //           background: #667eea;
  //           color: white;
  //           width: 28px;
  //           height: 28px;
  //           border-radius: 50%;
  //           display: flex;
  //           align-items: center;
  //           justify-content: center;
  //         }

  //         .section-header h4 {
  //           margin: 0;
  //           font-size: 14px;
  //           font-weight: 600;
  //           color: #1F2937;
  //         }

  //         .section-content {
  //           display: flex;
  //           flex-direction: column;
  //           gap: 6px;
  //         }

  //         .info-item {
  //           display: flex;
  //           justify-content: space-between;
  //           align-items: center;
  //           padding: 6px 10px;
  //           background: white;
  //           border-radius: 6px;
  //           border: 1px solid #E5E7EB;
  //         }

  //         .info-item label {
  //           font-weight: 500;
  //           color: #6B7280;
  //           font-size: 12px;
  //         }

  //         .info-item span {
  //           font-weight: 600;
  //           color: #1F2937;
  //           font-size: 12px;
  //         }

  //         .user-actions {
  //           display: flex;
  //           gap: 8px;
  //           justify-content: center;
  //           padding-top: 12px;
  //           border-top: 1px solid #E5E7EB;
  //         }

  //         .action-btn {
  //           padding: 8px 16px;
  //           border: none;
  //           border-radius: 6px;
  //           font-weight: 600;
  //           font-size: 12px;
  //           cursor: pointer;
  //           transition: all 0.3s ease;
  //           display: flex;
  //           align-items: center;
  //           gap: 6px;
  //         }

  //         .action-btn.primary {
  //           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  //           color: white;
  //         }

  //         .action-btn.primary:hover {
  //           transform: translateY(-1px);
  //           box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  //         }

  //         .action-btn.secondary {
  //           background: #F3F4F6;
  //           color: #374151;
  //           border: 1px solid #D1D5DB;
  //         }

  //         .action-btn.secondary:hover {
  //           background: #E5E7EB;
  //           transform: translateY(-1px);
  //         }

  //         @media (max-width: 768px) {
  //           .user-content-grid {
  //             grid-template-columns: 1fr;
  //           }
            
  //           .info-item {
  //             flex-direction: column;
  //             align-items: flex-start;
  //             gap: 4px;
  //           }
            
  //           .user-actions {
  //             flex-direction: column;
  //           }
  //         }

  //         @media (max-width: 600px) {
  //           .user-content-grid {
  //             grid-template-columns: 1fr;
  //           }
  //         }
  //       `;
  //       document.head.appendChild(style);
  //     }
  //   });
  // };

  const handleAddMembershipPlan = () => {
    navigate('/admin/membership-plan/add');
  };

  return (
    <AdminLayout>
      <div className="admin-dashboard-pageContent">
        <div className="admin-dashboard-mb-6 animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-d-flex admin-dashboard-justify-between admin-dashboard-align-center admin-dashboard-mb-4">
            <h2 className="admin-dashboard-text-2xl admin-dashboard-font-semibold admin-dashboard-text-heading-color animated animate__animated animate__slideInLeft">Membership Plan Management</h2>
            <div className="admin-dashboard-d-flex admin-dashboard-gap-2">
              <button onClick={exportToExcel} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <FileSpreadsheet size={18} className="admin-dashboard-btn-icon" />
                Export to Excel
              </button>
              <button
                onClick={handleAddMembershipPlan}
                className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight"
              >
                <Plus size={18} className="admin-dashboard-btn-icon" />
                Add Membership Plan
              </button>
            </div>
          </div>
        </div>

        <div className="admin-dashboard-search-form animated animate__animated animate__fadeInUp">
          <form onSubmit={handleSearchSubmit} className="admin-dashboard-search-form-content">
            <div className="admin-dashboard-search-input-group">
              <input
                type="text"
                value={searchTermName}
                onChange={(e) => setSearchTermName(e.target.value)}
                placeholder="Search by Plan Name"
                className="admin-dashboard-search-input"
              />
            </div>

            <div className="admin-dashboard-search-input-group">
              <input
                type="text"
                value={searchTermPackageId}
                onChange={(e) => setSearchTermPackageId(e.target.value)}
                placeholder="Search by Package"
                className="admin-dashboard-search-input"
              />
            </div>

            <div className="admin-dashboard-search-input-group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-dashboard-search-input"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="admin-dashboard-search-button-group">
              <button type="submit" className="admin-dashboard-btn admin-dashboard-btn-primary admin-dashboard-btn-md">
                Search
              </button>
              <button type="button" onClick={handleReset} className="admin-dashboard-btn admin-dashboard-btn-secondary admin-dashboard-btn-md">
                Reset
              </button>
            </div>
          </form>
        </div>

        {isLoading ? (
          <Loader title="Loading Membership Plans" subtitle="Please wait..." />
        ) : filteredData.length === 0 ? (
          <div className="admin-dashboard-empty-state">
            <svg className="admin-dashboard-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="admin-dashboard-empty-title">No membership plans found</h3>
            <p className="admin-dashboard-empty-text">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <>
            <div className="admin-dashboard-overflow-x-auto">
              <table className="admin-dashboard-table">
                <thead className="admin-dashboard-table-header">
                  <tr>
                    <th className="admin-dashboard-sno-column">S.No</th>
                    <th>Package</th>
                    <th>Plan Name</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Final Price</th>
                    <th>Duration</th>
                    <th>Position</th>
                    <th>Created Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((plan, index) => (
                    <tr key={plan._id} className="admin-dashboard-table-row animated animate__animated animate__fadeIn">
                      <td className="admin-dashboard-sno-cell">{index + 1}</td>
                      <td className="admin-dashboard-text-left">{getPackageName(plan.package_id) || 'N/A'}</td>
                      <td className="admin-dashboard-text-left">{plan.planName || 'N/A'}</td>
                      <td className="admin-dashboard-text-left">₹{plan.price || 'N/A'}</td>
                      <td className="admin-dashboard-text-left">₹{plan.discount || 0}</td>
                      <td className="admin-dashboard-text-left admin-dashboard-font-bold admin-dashboard-text-success">₹{plan.finalPrice || 'N/A'}</td>
                      <td className="admin-dashboard-text-left">{plan.duration || 'N/A'} days</td>
                      <td className="admin-dashboard-text-left">{plan.position || 0}</td>
                      <td className="admin-dashboard-text-left">
                        {plan.createdAt ? (
                          <Moment format="MMMM Do YYYY">{new Date(plan.createdAt)}</Moment>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        <span className={`admin-dashboard-status-text ${plan.status === "active" ? 'active' : 'inactive'}`}>
                          {plan.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="admin-dashboard-actions-cell">
                        <div className="admin-dashboard-actions-container">
                          {/* <button
                            onClick={() => handleViewMembershipPlan(plan)}
                            title="View Details"
                            className="admin-dashboard-btn-action-icon admin-dashboard-btn-view"
                          >
                            <BiShow className="admin-dashboard-action-icon-svg" />
                          </button> */}
                          <button
                            onClick={() => navigate(`/admin/membership-plan/edit/${plan._id}`)}
                            title="Edit Membership Plan"
                            className="admin-dashboard-btn-action-icon admin-dashboard-btn-edit"
                          >
                            <BsPencil className="admin-dashboard-action-icon-svg" />
                          </button>
                          <div
                            className={`admin-dashboard-toggle-switch ${plan.status === "active" ? 'active' : 'inactive'}`}
                            onClick={() => handleChangeStatus(plan._id, plan.status)}
                            title={`Toggle ${plan.status === "active" ? "Inactive" : "Active"}`}
                          >
                            <div className="admin-dashboard-toggle-knob">
                              {plan.status === "active" ? (
                                <span className="admin-dashboard-toggle-knob-icon active">✓</span>
                              ) : (
                                <span className="admin-dashboard-toggle-knob-icon inactive">✗</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(plan._id)}
                            title="Delete Membership Plan"
                            className="admin-dashboard-btn-action-icon admin-dashboard-btn-delete"
                          >
                            <BiTrash className="admin-dashboard-action-icon-svg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default MembershipPlanIndex;
