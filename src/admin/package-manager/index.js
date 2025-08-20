import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import Moment from "react-moment";
import * as XLSX from "xlsx";

import packageService from "../../services/packageService";
import { Eye, Trash2, Edit, Plus, FileSpreadsheet, Search, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import Loader from "../../components/Loader";
import 'animate.css';
import '../../style/admin-style.css';

const PackageManagerIndex = () => {
  const [packageData, setPackageData] = useState([]);
  const [searchTermName, setSearchTermName] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPackages, setTotalPackages] = useState(0);
  const [packagesPerPage, setPackagesPerPage] = useState(25);
  const [paginationData, setPaginationData] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchPackages();
    fetchTotalCount();
  }, []);

  const fetchTotalCount = async () => {
    try {
      const response = await packageService.getAllPackages();
      console.log('Total Count API Response:', response);
      
      let totalCount = 0;
      
      if (response.packages && Array.isArray(response.packages)) {
        totalCount = response.packages.length;
      } else if (response.data && Array.isArray(response.data)) {
        totalCount = response.data.length;
      } else if (Array.isArray(response)) {
        totalCount = response.length;
      }
      
      setTotalPackages(totalCount);
      setTotalPages(Math.ceil(totalCount / packagesPerPage));
      
      console.log('Total packages count:', totalCount);
    } catch (error) {
      console.error("Error fetching total package count:", error);
      setTotalPackages(0);
      setTotalPages(1);
    }
  };

  // Handle success alert from navigation state or sessionStorage
  useEffect(() => {
    // Check for success message in sessionStorage first
    const successMessage = sessionStorage.getItem('packageSuccess');
    if (successMessage) {
      Swal.fire({
        title: '<div class="success-popup-header"><CheckCircle class="success-icon" /><span>Success!</span></div>',
        text: successMessage,
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#10b981",
        customClass: {
          popup: 'animated-popup success-popup',
          title: 'success-popup-title',
          confirmButton: 'success-popup-btn'
        },
        showClass: {
          popup: 'animate__animated animate__zoomIn animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__zoomOut animate__faster'
        }
      });
      // Remove the message after showing it
      sessionStorage.removeItem('packageSuccess');
    }
    // Fallback to location state if no sessionStorage message
    else if (location.state?.showSuccessAlert && location.state?.successMessage) {
      Swal.fire({
        title: '<div class="success-popup-header"><CheckCircle class="success-icon" /><span>Success!</span></div>',
        text: location.state.successMessage,
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#10b981",
        customClass: {
          popup: 'animated-popup success-popup',
          title: 'success-popup-title',
          confirmButton: 'success-popup-btn'
        },
        showClass: {
          popup: 'animate__animated animate__zoomIn animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__zoomOut animate__faster'
        }
      });
      
      // Clear the state to prevent showing the alert again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    setFilteredData(packageData);
  }, [packageData]);

  const fetchPackages = async (page = currentPage, pageSize = packagesPerPage) => {
    setIsLoading(true);
    try {
      const response = await packageService.getAllPackages();
      console.log("Package API Response:", response); // Debug log

      let packages = [];
      if (Array.isArray(response)) {
        packages = response;
      } else if (Array.isArray(response?.data)) {
        packages = response.data;
      } else if (Array.isArray(response?.packages)) {
        packages = response.packages;
      } else if (response?.data && Array.isArray(response.data.packages)) {
        packages = response.data.packages;
      } else {
        console.log("No packages found in response structure:", response);
        packages = [];
      }

      console.log("Extracted packages:", packages); // Debug log

      const sortedPackages = packages.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      // Implement client-side pagination since the API doesn't support it
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedPackages = sortedPackages.slice(startIndex, endIndex);
      
      setPackageData(sortedPackages); // Keep the full data for filtering
      setFilteredData(paginatedPackages); // Set the paginated data for display
      
      // Update pagination state
      setCurrentPage(page);
      setTotalPages(Math.ceil(sortedPackages.length / pageSize));
      setTotalPackages(sortedPackages.length);
      
      // Create pagination data object similar to user/index.js
      setPaginationData({
        currentPage: page,
        totalPages: Math.ceil(sortedPackages.length / pageSize),
        packagesPerPage: pageSize
      });
      
    } catch (error) {
      console.error("Error fetching packages:", error);
      console.error("Error details:", error.response?.data); // Debug log
      setPackageData([]);
      setFilteredData([]);
      setPaginationData({});
      setTotalPackages(0);
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
          await packageService.deletePackage(id);
          Swal.fire("Deleted!", "Package has been deleted.", "success");
          fetchPackages();
        } catch (error) {
          Swal.fire("Error", error.response?.data.message || "Error deleting package", "error");
        }
      }
    });
  };

  const handleChangeStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    Swal.fire({
      title: "Change package status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await packageService.updatePackage(id, { status: newStatus });
          Swal.fire("Updated!", "Package status updated.", "success");
          fetchPackages();
        } catch (error) {
          Swal.fire("Error", "Failed to update status!", "error");
        }
      }
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const filtered = packageData.filter(pkg => {
      const nameMatch = searchTermName === '' || pkg.name?.toLowerCase().includes(searchTermName.toLowerCase());
      const statusMatch = statusFilter === 'all' || pkg.status === statusFilter;
      return nameMatch && statusMatch;
    });

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchTermName('');
    setStatusFilter('all');
    setFilteredData(packageData);
  };
  
  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * packagesPerPage;
    const endIndex = startIndex + packagesPerPage;
    setFilteredData(packageData.slice(startIndex, endIndex));
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
    setPackagesPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    const newTotalPages = Math.ceil(packageData.length / newPageSize);
    setTotalPages(newTotalPages);
    setFilteredData(packageData.slice(0, newPageSize));
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(pkg => ({
      "Name": pkg.name,
      "Status": pkg.status === 'active' ? "Active" : "Inactive",
      "Created Date": pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString() : "N/A",
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Packages");
    XLSX.writeFile(wb, "packages.xlsx");
  };

  const handleViewPackage = (pkg) => {
    const getStatusIcon = (status) => {
      return status === "active" ? "✅" : "❌";
    };

    const getStatusColor = (status) => {
      return status === "active" ? "#10B981" : "#EF4444";
    };

    const createdDate = pkg.createdAt
      ? new Date(pkg.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'N/A';

    const statusColor = getStatusColor(pkg.status);
    const statusIcon = getStatusIcon(pkg.status);

    Swal.fire({
      title: `<div class="user-popup-header">
        <div class="user-header-icon">📦</div>
        <div class="user-header-content">
          <h3>Package Details</h3>
          <p>Complete information about this package</p>
        </div>
      </div>`,
      html: `
        <div class="user-popup-body">
          <!-- Status Banner -->
          <div class="user-status-banner" style="background: linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}25 100%); border-left: 4px solid ${statusColor};">
            <div class="status-icon">${statusIcon}</div>
            <div class="status-info">
              <h4>${pkg.status === "active" ? 'Active' : 'Inactive'}</h4>
              <p>Current Status</p>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="user-content-grid">
            <!-- Package Information Section -->
            <div class="user-section">
              <div class="section-header">
                <div class="section-icon">📦</div>
                <h4>Package Information</h4>
              </div>
              <div class="section-content">
                <div class="info-item">
                  <label>Package Name</label>
                  <span>${pkg.name || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Video Limit</label>
                  <span>${pkg.video_limit ? `${pkg.video_limit} videos` : 'Not Set'}</span>
                </div>
              </div>
            </div>

            <!-- Additional Information Section -->
            <div class="user-section">
              <div class="section-header">
                <div class="section-icon">📅</div>
                <h4>Additional Information</h4>
              </div>
              <div class="section-content">
                <div class="info-item">
                  <label>Created Date</label>
                  <span>${createdDate}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Package Info Section -->
          ${pkg.package_info ? `
          <div class="user-section" style="margin-top: 10px;">
            <div class="section-header">
              <div class="section-icon">📋</div>
              <h4>Package Details</h4>
            </div>
            <div class="section-content">
              ${pkg.package_info.line1 ? `
              <div class="info-item">
                <label>Line 1</label>
                <span>${pkg.package_info.line1}</span>
              </div>` : ''}
              ${pkg.package_info.line2 ? `
              <div class="info-item">
                <label>Line 2</label>
                <span>${pkg.package_info.line2}</span>
              </div>` : ''}
              ${pkg.package_info.line3 ? `
              <div class="info-item">
                <label>Line 3</label>
                <span>${pkg.package_info.line3}</span>
              </div>` : ''}
              ${pkg.package_info.line4 ? `
              <div class="info-item">
                <label>Line 4</label>
                <span>${pkg.package_info.line4}</span>
              </div>` : ''}
              ${pkg.package_info.line5 ? `
              <div class="info-item">
                <label>Line 5</label>
                <span>${pkg.package_info.line5}</span>
              </div>` : ''}
            </div>
          </div>` : ''}

          <!-- Action Buttons -->
          <div class="user-actions">
            <button class="action-btn primary" onclick="window.open('/admin/package-manager/edit/${pkg._id}', '_blank')">
              ✏️ Edit Package
            </button>
            <button class="action-btn secondary" onclick="navigator.clipboard.writeText('${pkg.name}')">
              📋 Copy Package Name
            </button>
          </div>
        </div>`,
      width: '750px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'user-swal-popup',
        title: 'user-swal-title',
        htmlContainer: 'user-swal-html'
      },
      didOpen: () => {
        // Add custom styles for the user popup
        const style = document.createElement('style');
        style.textContent = `
          .user-swal-popup {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            border-radius: 16px;
            overflow: hidden;
          }

          .user-swal-title {
            padding: 0 !important;
            margin: 0 !important;
          }

          .user-swal-html {
            padding: 0 !important;
            margin: 0 !important;
          }

          .user-popup-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            margin: -16px -16px 0 -16px;
          }

          .user-header-icon {
            font-size: 24px;
            background: rgba(255, 255, 255, 0.2);
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .user-header-content h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
          }

          .user-header-content p {
            margin: 2px 0 0 0;
            opacity: 0.9;
            font-size: 12px;
          }

          .user-popup-body {
            padding: 16px;
          }

          .user-status-banner {
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

          .user-content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 12px;
          }

          .user-section {
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

          .user-actions {
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
            .user-content-grid {
              grid-template-columns: 1fr;
            }
            
            .info-item {
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
            }
            
            .user-actions {
              flex-direction: column;
            }
          }

          @media (max-width: 600px) {
            .user-content-grid {
              grid-template-columns: 1fr;
            }
          }
        `;
        document.head.appendChild(style);
      }
    });
  };

  const handleAddPackage = () => {
    navigate('/admin/package-manager/add');
  };
  
  // Pagination component
  const renderPagination = () => {
    // Show pagination if there are packages and more than 1 page, or if we want to show page size selector
    if (totalPackages === 0) return null;

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
    const startNumber = ((currentPage - 1) * packagesPerPage) + 1;
    const endNumber = Math.min(currentPage * packagesPerPage, totalPackages);
    
    // Handle edge cases
    const displayStart = totalPackages > 0 ? startNumber : 0;
    const displayEnd = totalPackages > 0 ? endNumber : 0;
    
    // Ensure we don't show invalid ranges
    const finalStart = displayStart > totalPackages ? 0 : displayStart;
    const finalEnd = displayEnd > totalPackages ? totalPackages : displayEnd;

    return (
      <div className={`admin-dashboard-pagination animated animate__animated animate__fadeIn`}>
        <div className="admin-dashboard-pagination-info">
           <span>
             Showing {finalStart} to {finalEnd} of {totalPackages} packages
           </span>
         </div>
        
        <div className="admin-dashboard-pagination-size-selector">
          <label htmlFor="pageSizeSelect" className="admin-dashboard-page-size-label">
            Show:
          </label>
          <select
            id="pageSizeSelect"
            value={packagesPerPage}
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

  return (
    <AdminLayout>
      <div className="admin-dashboard-pageContent">
        <div className="admin-dashboard-mb-6 animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-d-flex admin-dashboard-justify-between admin-dashboard-align-center admin-dashboard-mb-4">
            <h2 className="admin-dashboard-text-2xl admin-dashboard-font-semibold admin-dashboard-text-heading-color animated animate__animated animate__slideInLeft">Package Manager</h2>
            <div className="admin-dashboard-d-flex admin-dashboard-gap-2">
              <button onClick={exportToExcel} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <FileSpreadsheet size={18} className="admin-dashboard-btn-icon" />
                Export to Excel
              </button>
              <button onClick={handleAddPackage} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <Plus size={18} className="admin-dashboard-btn-icon" />
                Add Package
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
                placeholder="Search by package name..."
                value={searchTermName}
                onChange={(e) => setSearchTermName(e.target.value)}
              />
            </div>
            <div className="admin-dashboard-search-input-group">
              <select
                className="admin-dashboard-search-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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

        {isLoading ? (
          <div className="admin-dashboard-loading-container animated animate__animated animate__fadeIn">
            <div className="admin-dashboard-spinner"></div>
            <p className="admin-dashboard-loading-text">Loading packages...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="admin-dashboard-empty-state animated animate__animated animate__fadeIn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3>No packages found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <>
            <div className="admin-dashboard-overflow-x-auto animated animate__animated animate__fadeInUp">
              <table className="admin-dashboard-table">
                <thead className="admin-dashboard-table-header">
                  <tr>
                    <th className="admin-dashboard-sno-column">S NO</th>
                    <th className="admin-dashboard-name-column">Package Name</th>
                    <th>Video Limit</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((pkg, index) => (
                    <tr
                      key={pkg._id}
                      className="admin-dashboard-table-row animated animate__animated animate__fadeInUp"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="admin-dashboard-sno-cell">{((currentPage - 1) * packagesPerPage) + index + 1}</td>
                      <td className="admin-dashboard-name-cell">
                        <div className="admin-dashboard-user-info">
                          <div className="admin-dashboard-user-name">{pkg.name || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="admin-dashboard-mobile-cell">
                        {pkg.video_limit === 0 || pkg.video_limit === null ? 'Unlimited Videos' : pkg.video_limit ? `${pkg.video_limit} videos` : 'Not Set'}
                      </td>
                      <td className="admin-dashboard-address-cell">
                        {pkg.position ? pkg.position : 'N/A'}
                      </td>
                      <td className="admin-dashboard-status-cell">
                        <span className={`admin-dashboard-status-text ${pkg.status === "active" ? 'active' : 'inactive'}`}>
                          {pkg.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="admin-dashboard-date-cell">
                        {pkg.createdAt
                          ? <Moment format="MMMM Do YYYY">{new Date(pkg.createdAt)}</Moment>
                          : "N/A"}
                      </td>
                      <td className="admin-dashboard-actions-cell">
                        <div className="admin-dashboard-actions-container">
                          <button
                            onClick={() => handleViewPackage(pkg)}
                            title="View Details"
                            className="admin-dashboard-btn-action-icon admin-dashboard-btn-view"
                          >
                            <Eye size={14} className="admin-dashboard-action-icon-svg" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/package-manager/edit/${pkg._id}`)}
                            title="Edit Package"
                            className="admin-dashboard-btn-action-icon admin-dashboard-btn-edit"
                          >
                            <Edit size={14} className="admin-dashboard-action-icon-svg" />
                          </button>
                          <div
                            className={`admin-dashboard-toggle-switch ${pkg.status === "active" ? 'active' : 'inactive'}`}
                            onClick={() => handleChangeStatus(pkg._id, pkg.status)}
                            title={`Toggle ${pkg.status === "active" ? "Inactive" : "Active"}`}
                          >
                            <div className="admin-dashboard-toggle-knob">
                              {pkg.status === "active" ? (
                                <span className="admin-dashboard-toggle-knob-icon active">✓</span>
                              ) : (
                                <span className="admin-dashboard-toggle-knob-icon inactive">✗</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(pkg._id)}
                            title="Delete Package"
                            className="admin-dashboard-btn-action-icon admin-dashboard-btn-delete"
                          >
                            <Trash2 size={14} className="admin-dashboard-action-icon-svg" />
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

export default PackageManagerIndex;