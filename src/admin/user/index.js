import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import Moment from "react-moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import userService from "../../services/userService";
import { Eye, Trash2, Edit, Plus, FileSpreadsheet, FileText, Search, RotateCcw } from "lucide-react";
import Loader from "../../components/Loader";
import 'animate.css';
import '../../style/admin-style.css';

const UserIndex = () => {
  const [userdata, setUserdata] = useState([]);
  const [searchTermName, setSearchTermName] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTrigger, setSearchTrigger] = useState(0); // New state to trigger search
  const [showResults, setShowResults] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
const [usersPerPage, setUsersPerPage] = useState(25);
const [paginationData, setPaginationData] = useState({}); // Keep this for consistency if API provides it

const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');

const [isLoading, setIsLoading] = useState(true); // For initial load and search load
const [isActionLoading, setIsActionLoading] = useState(false); // For delete and status change actions
const navigate = useNavigate();
const location = useLocation();

  useEffect(() => {
    // Fetch data on initial mount or when searchTrigger/pagination changes
    fetchUser(currentPage, usersPerPage);
  }, [currentPage, usersPerPage]);

  useEffect(() => {
    if (location.state && location.state.successMessage) {
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
      // Clear the state so the alert doesn't show again if the user navigates back or refreshes
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  const fetchUser = async (page, pageSize, name, fromDate, toDate, status) => {
    setIsLoading(true);
    try {
      const apiResponse = await userService.getAllUsers(page, pageSize, name, fromDate, toDate, status);

      let usersData = apiResponse.data || []; // Get the array of users
      const paginationInfo = apiResponse.pagination || {}; // Get pagination info
      let totalCount = apiResponse.totalUsers || apiResponse.total || apiResponse.count || usersData.length; // Get total count

      // Client-side filtering
      if (name) {
        const searchTerm = name.toLowerCase();
        usersData = usersData.filter(user =>
          user.fullName?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm)
        );
        totalCount = usersData.length; // Update total count after filtering
      }

      // Client-side date filtering
      if (fromDate && toDate) {
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);

        // Filter users within the date range
        usersData = usersData.filter(user => {
          const createdAt = new Date(user.createdAt);
          const toDateObjEnd = new Date(toDateObj);
          toDateObjEnd.setDate(toDateObjEnd.getDate() + 1);
          return createdAt >= fromDateObj && createdAt < toDateObjEnd;
        });

        totalCount = usersData.length; // Update total count after filtering
      } else if (fromDate) {
        const fromDateObj = new Date(fromDate);
        usersData = usersData.filter(user => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= fromDateObj;
        });
        totalCount = usersData.length; // Update total count after filtering
      } else if (toDate) {
        const toDateObj = new Date(toDate);
        usersData = usersData.filter(user => {
          const createdAt = new Date(user.createdAt);
          return createdAt <= toDateObj;
        });
        totalCount = usersData.length; // Update total count after filtering
      }

      // Client-side status filtering
      if (status && status !== 'all') {
        usersData = usersData.filter(user => user.status === status);
        totalCount = usersData.length; // Update total count after filtering
      }

      const sortedUsers = Array.isArray(usersData) ? usersData.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      }) : [];

      setUserdata(sortedUsers);
      setPaginationData(paginationInfo);

      setCurrentPage(paginationInfo.currentPage || page);
      setTotalPages(Math.ceil(totalCount / pageSize));
      setTotalUsers(totalCount);
      setUsersPerPage(paginationInfo.usersPerPage || pageSize);

    } catch (error) {
      console.error("Error fetching users:", error);
      setUserdata([]);
      setPaginationData({});
      setTotalUsers(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "you want to Delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsActionLoading(true); // Show loader
        try {
          await userService.deleteUser(id);
          Swal.fire("Deleted!", "User has been deleted.", "success");
          // Re-fetch data after deletion to update the list
          fetchUser(currentPage, usersPerPage, searchTermName, startDate, endDate, statusFilter);
        } catch (error) {
          Swal.fire("Error", error.response?.data.message || "Error deleting user", "error");
        } finally {
          setIsActionLoading(false); // Hide loader
        }
      }
    });
  };

  const handleChangeStatus = async (id, status) => {
    Swal.fire({
      title: "Are you sure?",
      text: "you want to change the user status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsActionLoading(true); // Show loader
        try {
          await userService.changeUserStatus(id, status);
          Swal.fire("Updated!", "User status updated.", "success");
          // Re-fetch data after status change to update the list
          fetchUser(currentPage, usersPerPage, searchTermName, startDate, endDate, statusFilter);
        } catch (error) {
          Swal.fire("Error", "Failed to update status!", "error");
        } finally {
          setIsActionLoading(false); // Hide loader
        }
      }
    });
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading true when search starts
    setShowResults(true);

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (start > today) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Date',
          text: 'From Date cannot be a future date.',
        });
        setIsLoading(false); // Reset loading if validation fails
        return;
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      if (end > today) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Date',
          text: 'To Date cannot be a future date.',
        });
        setIsLoading(false); // Reset loading if validation fails
        return;
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Date Range',
          text: 'From Date cannot be after To Date.',
        });
        setIsLoading(false); // Reset loading if validation fails
        return;
      }
    }

    // Trigger API call with search parameters
    setCurrentPage(1); // Reset to first page for new search
    fetchUser(currentPage, usersPerPage, searchTermName, startDate, endDate, statusFilter);
  };

  const handleReset = () => {
    setSearchTermName('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    setCurrentPage(1); // Reset to first page
    setShowResults(true);
    fetchUser(1, usersPerPage);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSearchTrigger(prev => prev + 1); // Trigger fetch with new page
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
    setUsersPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    setSearchTrigger(prev => prev + 1); // Trigger fetch with new page size
  };

  // Pagination component
  const renderPagination = () => {
    // Show pagination if there are users and more than 1 page, or if we want to show page size selector
    if (totalUsers === 0) return null;

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
    const startNumber = ((currentPage - 1) * usersPerPage) + 1;
    const endNumber = Math.min(currentPage * usersPerPage, totalUsers);

    // Handle edge cases
    const displayStart = totalUsers > 0 ? startNumber : 0;
    const displayEnd = totalUsers > 0 ? endNumber : 0;

    // Ensure we don't show invalid ranges
    const finalStart = displayStart > totalUsers ? 0 : displayStart;
    const finalEnd = displayEnd > totalUsers ? totalUsers : displayEnd;

    return (
      <div className={`admin-dashboard-pagination`}>
        <div className="admin-dashboard-pagination-info">
          <span>
            Showing {finalStart} to {finalEnd} of {totalUsers} users
          </span>
        </div>

        <div className="admin-dashboard-pagination-size-selector">
          <label htmlFor="pageSizeSelect" className="admin-dashboard-page-size-label">
            Show:
          </label>
          <select
            id="pageSizeSelect"
            value={usersPerPage}
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
    const dataToExport = userdata.map((user, index) => ({
      'S NO': index + 1,
      'Name': user.fullName || 'N/A',
      'Email': user.email || 'N/A',
      'Mobile': user.mobile || 'N/A',
      'Country': user.country || 'N/A',
      'State': user.state || 'N/A',
      'Status': user.status === "Y" ? "Active" : "Inactive",
      'Created Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "users_data.xlsx");
  };

  const exportToPDF = async () => {
    Swal.fire({
      title: 'Generating PDF...',
      text: 'Please wait while the PDF is being created.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const input = document.createElement('div');
    input.style.padding = '20px';
    input.style.backgroundColor = '#fff';
    input.style.fontFamily = 'Arial, sans-serif';

    // Create a table for PDF export
    let tableHtml = `
      <h2 style="text-align: center; margin-bottom: 20px; color: #333;">User Data</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #00BCD4; color: white;">
            <th style="padding: 8px; border: 1px solid #ddd;">S NO</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Name</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Email</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Mobile</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Country</th>
            <th style="padding: 8px; border: 1px solid #ddd;">State</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Status</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Created Date</th>
          </tr>
        </thead>
        <tbody>
    `;

    userdata.forEach((user, index) => {
      tableHtml += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${user.fullName || 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${user.email || 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${user.mobile || 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${user.country || 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${user.state || 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${user.status === "Y" ? "Active" : "Inactive"}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : 'N/A'}</td>
        </tr>
      `;
    });

    tableHtml += `
        </tbody>
      </table>
    `;
    input.innerHTML = tableHtml;
    document.body.appendChild(input); // Append to body to render for html2canvas

    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save("users_data.pdf");
      Swal.close();
      Swal.fire("Success!", "PDF has been generated.", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      Swal.close();
      Swal.fire("Error", "Failed to generate PDF.", "error");
    } finally {
      document.body.removeChild(input); // Clean up the temporary element
    }
  };

  const handleViewUser = (user) => {
    const getStatusIcon = (status) => {
      return status === "Y" ? "✅" : "❌";
    };

    const getStatusColor = (status) => {
      return status === "Y" ? "#10b981" : "#ef4444";
    };

    const createdDate = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      : 'N/A';

    const updatedDate = user.updatedAt
      ? new Date(user.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      : 'N/A';

    const statusColor = getStatusColor(user.status);
    const statusIcon = getStatusIcon(user.status);

    Swal.fire({
      title: `<div class="admin-dashboard-user-popup-header">
        <div class="admin-dashboard-user-popup-header-icon">👤</div>
        <div class="admin-dashboard-user-popup-header-content">
          <h3 class="admin-dashboard-user-popup-title">User Details</h3>
          <p class="admin-dashboard-user-popup-subtitle">Complete information about this user</p>
        </div>
      </div>`,
      html: `
        <div class="admin-dashboard-user-popup-body">
          <div class="admin-dashboard-user-popup-status-banner" style="background: linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}25 100%); border-left: 4px solid ${statusColor};">
            <div class="admin-dashboard-user-popup-status-icon">${statusIcon}</div>
            <div class="admin-dashboard-user-popup-status-info">
              <h4>${user.status === "Y" ? 'Active' : 'Inactive'}</h4>
              <p>Current Status</p>
            </div>
          </div>
          <div class="admin-dashboard-user-popup-content-grid">
            <div class="admin-dashboard-user-popup-section">
              <div class="admin-dashboard-user-popup-section-header">
                <div class="admin-dashboard-user-popup-section-icon">👤</div>
                <h4>Personal Information</h4>
              </div>
              <div class="admin-dashboard-user-popup-section-content">
                <div class="admin-dashboard-user-popup-info-item">
                  <label>Full Name</label>
                  <span>${user.fullName || 'N/A'}</span>
                </div>
                <div class="admin-dashboard-user-popup-info-item">
                  <label>Email Address</label>
                  <span>${user.email || 'N/A'}</span>
                </div>
                <div class="admin-dashboard-user-popup-info-item">
                  <label>Phone Number</label>
                  <span>${user.mobile || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div class="admin-dashboard-user-popup-section">
              <div class="admin-dashboard-user-popup-section-header">
                <div class="admin-dashboard-user-popup-section-icon">📅</div>
                <h4>Additional Information</h4>
              </div>
              <div class="admin-dashboard-user-popup-section-content">
                <div class="admin-dashboard-user-popup-info-item">
                  <label>Created Date</label>
                  <span>${createdDate}</span>
                </div>
                <div class="admin-dashboard-user-popup-info-item">
                  <label>Last Updated</label>
                  <span>${updatedDate}</span>
                </div>
              </div>
            </div>
            <div class="admin-dashboard-user-popup-section" style="grid-column: 1 / -1;">
              <div class="admin-dashboard-user-popup-section-header">
                <div class="admin-dashboard-user-popup-section-icon">📍</div>
                <h4>Address Information</h4>
              </div>
              <div class="admin-dashboard-user-popup-section-content">
                <div class="admin-dashboard-user-popup-info-item">
                  <label>Address</label>
                  <span>${user.address || 'Not Provided'}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="admin-dashboard-user-popup-actions">
            <button class="admin-dashboard-user-popup-action-btn primary" onclick="window.open('mailto:${user.email}', '_blank')">
              📧 Send Email
            </button>
            <button class="admin-dashboard-user-popup-action-btn secondary" onclick="navigator.clipboard.writeText('${user.mobile}')">
              📱 Copy Phone
            </button>
          </div>
        </div>`,
      width: '750px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'admin-dashboard-user-popup',
        title: 'admin-dashboard-user-popup-title',
        htmlContainer: 'admin-dashboard-user-popup-html'
      }
    });
  };

  const handleAddUser = () => {
    navigate("/admin/user/add");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Loader title="Loading Users" subtitle="Please wait..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {isActionLoading && <Loader title="Processing..." subtitle="Please wait..." />}
      <div className="admin-dashboard-pageContent">
        <div className="admin-dashboard-mb-6 animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-d-flex admin-dashboard-justify-between admin-dashboard-align-center admin-dashboard-mb-4">
            <h2 className="admin-dashboard-text-2xl admin-dashboard-font-semibold admin-dashboard-text-heading-color animated animate__animated animate__slideInLeft">User Management</h2>
            <div className="admin-dashboard-d-flex admin-dashboard-gap-2">
              <button onClick={exportToExcel} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <FileSpreadsheet size={18} className="admin-dashboard-btn-icon" />
                Export to Excel
              </button>
              <button onClick={exportToPDF} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <FileText size={18} className="admin-dashboard-btn-icon" />
                Export to PDF
              </button>
              <button onClick={handleAddUser} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <Plus size={18} className="admin-dashboard-btn-icon" />
                Add User
              </button>
            </div>
          </div>

          <div className="admin-dashboard-search-form animated animate__animated animate__fadeInUp">
            <form onSubmit={handleSearchSubmit} className="admin-dashboard-search-form-content">
              <div className="admin-dashboard-search-input-group">
                <input
                  type="text"
                  className="admin-dashboard-search-input"
                  placeholder="Search by name or email..."
                  value={searchTermName}
                  onChange={(e) => setSearchTermName(e.target.value)}
                />
              </div>
              <div className="admin-dashboard-search-input-group">
                <input
                  type="date"
                  className="admin-dashboard-search-input"
                  placeholder="From Date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    // If a future date is selected, clear it
                    if (e.target.value && new Date(e.target.value) > new Date()) {
                      setStartDate('');
                      Swal.fire({
                        icon: 'warning',
                        title: 'Future Date Not Allowed',
                        text: 'From Date cannot be a future date.',
                      });
                    }
                  }}
                  max={endDate || new Date().toISOString().split('T')[0]} // Disable dates after endDate and future dates
                />
              </div>
              <div className="admin-dashboard-search-input-group">
                <input
                  type="date"
                  className="admin-dashboard-search-input"
                  placeholder="To Date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    // If a future date is selected, clear it
                    if (e.target.value && new Date(e.target.value) > new Date()) {
                      setEndDate('');
                      Swal.fire({
                        icon: 'warning',
                        title: 'Future Date Not Allowed',
                        text: 'To Date cannot be a future date.',
                      });
                    }
                  }}
                  min={startDate || undefined} // Disable dates before startDate
                  max={new Date().toISOString().split('T')[0]} // Disable future dates
                />
              </div>
              <div className="admin-dashboard-search-input-group">
                <select
                  className="admin-dashboard-search-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="Y">Active</option>
                  <option value="N">Inactive</option>
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

          <div className="admin-dashboard-overflow-x-auto animated animate__animated animate__fadeInUp">
            {showResults && (
              <>
                {userdata.length === 0 ? (
                  <div className="admin-dashboard-empty-state animated animate__animated animate__fadeIn">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3>No users found</h3>
                    <p>Try adjusting your search criteria or filters.</p>
                  </div>
                ) : (
                  <table className="admin-dashboard-table">
                    <thead className="admin-dashboard-table-header">
                      <tr>
                        {[
                        "S NO",
                        "Name",
                        "Mobile",
                        "Country",
                        "State",
                        "Created",
                        "Actions"
                      ].map((header, index) => (
                        <th key={index} className={header === "S NO" ? "admin-dashboard-sno-column" : header === "Name" ? "admin-dashboard-name-column" : ""}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {userdata.map((user, index) => (
                      <tr key={user._id} className="admin-dashboard-table-row animated animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                        <td className="admin-dashboard-sno-cell">{((currentPage - 1) * usersPerPage) + index + 1}</td>
                        <td className="admin-dashboard-name-cell">
                          <div className="admin-dashboard-user-info" onClick={() => navigate(`/admin/user/detail/${user._id}`)} style={{ cursor: 'pointer' }}>
                            <div className="admin-dashboard-user-avatar">
                              <img
                                src={user.image ? `${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/${user.image}` : '/dummy-user.jpg'}
                                alt={user.fullName}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/dummy-user.jpg';
                                }}
                                className="admin-dashboard-user-avatar-img"
                              />
                            </div>
                            <div className="admin-dashboard-user-details">
                              <div className="admin-dashboard-user-name">{user.fullName || 'N/A'}</div>
                              <div className="admin-dashboard-user-email">{user.email || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="admin-dashboard-mobile-cell">{user.mobile || 'N/A'}</td>
                        <td className="admin-dashboard-country-cell">{user.country || 'N/A'}</td>
                        <td className="admin-dashboard-state-cell">{user.state || 'N/A'}</td>
                        <td className="admin-dashboard-date-cell">
                          {user.createdAt ? (
                            <Moment format="DD/MM/YYYY" utc>{user.createdAt}</Moment>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="admin-dashboard-actions-cell">
                          <div className="admin-dashboard-actions-container">

                            <button
                              onClick={() => navigate(`/admin/user/edit/${user._id}`)}
                              title="Edit User"
                              className="admin-dashboard-btn-action-icon admin-dashboard-btn-edit"
                            >
                              <Edit size={14} className="admin-dashboard-action-icon-svg" />
                            </button>
                            <div
                              className={`admin-dashboard-toggle-switch ${user.status === "Y" ? 'active' : 'inactive'}`}
                              onClick={() => handleChangeStatus(user._id, user.status)}
                              title={`Toggle ${user.status === "Y" ? "Inactive" : "Active"}`}
                            >
                              <div className="admin-dashboard-toggle-knob">
                                {user.status === "Y" ? (
                                  <span className="admin-dashboard-toggle-knob-icon active">✓</span>
                                ) : (
                                  <span className="admin-dashboard-toggle-knob-icon inactive">✗</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(user._id)}
                              title="Delete User"
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
                )}
              </>
            )}

            {/* Always show pagination section */}
            {renderPagination()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserIndex;
