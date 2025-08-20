import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import Moment from "react-moment";
import * as XLSX from "xlsx";
import { Modal } from "react-bootstrap";
import enquiryService from "../../services/enquiryService";
import courseService from "../../services/courseService";
import { Eye, Trash2, FileSpreadsheet, Search, RotateCcw, ToggleLeft, ToggleRight } from "lucide-react";
import Loader from "../../components/Loader";
import 'animate.css';
import '../../style/admin-style.css';

// Status dropdown component
const StatusDropdown = ({ currentStatus, onStatusChange }) => {
  return (
    <select
      className="form-control"
      onChange={(e) => onStatusChange(e.target.value)}
      value=""
    >
      <option value="" disabled>Change Status</option>
      {currentStatus !== "New" && <option value="New">New</option>}
      {currentStatus !== "In Progress" && <option value="In Progress">In Progress</option>}
      {currentStatus !== "Contacted" && <option value="Contacted">Contacted</option>}
      {currentStatus !== "Converted" && <option value="Converted">Converted</option>}
      {currentStatus !== "Closed" && <option value="Closed">Closed</option>}
    </select>
  );
};

const EnquiryIndex = () => {
  const [enquiryData, setEnquiryData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [searchTermName, setSearchTermName] = useState('');
  const [searchTermEmail, setSearchTermEmail] = useState('');
  const [searchTermMobile, setSearchTermMobile] = useState('');
  const [searchTermCourse, setSearchTermCourse] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0); // New state to trigger search

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEnquiries, setTotalEnquiries] = useState(0);
  const [enquiriesPerPage, setEnquiriesPerPage] = useState(25);
  const [paginationData, setPaginationData] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial fetch without search terms, or when pagination changes
    fetchEnquiries(currentPage, enquiriesPerPage, searchTermName, searchTermEmail, searchTermMobile, searchTermCourse, statusFilter);
    fetchCourses();
  }, [currentPage, enquiriesPerPage, searchTrigger]);

  const fetchEnquiries = async (page = currentPage, pageSize = enquiriesPerPage, name = '', email = '', mobile = '', course = '', status = 'all') => {
    setIsLoading(true);
    try {
      const response = await enquiryService.getAllEnquiries(page, pageSize, name, email, mobile, course, status);
      console.log('Enquiry API response:', response);

      let enquiries = [];
      let pagination = {};
      let totalCount = 0;

      if (response.success) {
        enquiries = Array.isArray(response.data) ? response.data : [];
        pagination = response.pagination || {};
        totalCount = response.totalEnquiries || response.total || response.count || 0;
      } else if (response.data) {
        enquiries = Array.isArray(response.data) ? response.data : [];
        pagination = response.pagination || {};
        totalCount = response.totalEnquiries || response.total || response.count || 0;
      } else {
        enquiries = Array.isArray(response) ? response : [];
        pagination = {};
        totalCount = enquiries.length; // Fallback if no total count from API
      }

      // Apply client-side filtering based on search terms and status filter
      let filteredEnquiries = enquiries;

      if (name) {
        const searchTerm = name.toLowerCase();
        filteredEnquiries = filteredEnquiries.filter(enquiry =>
          enquiry.full_name?.toLowerCase().includes(searchTerm) ||
          enquiry.email?.toLowerCase().includes(searchTerm)
        );
      }
      if (email) {
        const searchTerm = email.toLowerCase();
        filteredEnquiries = filteredEnquiries.filter(enquiry =>
          enquiry.email?.toLowerCase().includes(searchTerm)
        );
      }
      if (mobile) {
        const searchTerm = mobile.toLowerCase();
        filteredEnquiries = filteredEnquiries.filter(enquiry =>
          enquiry.phone_number?.toString().includes(searchTerm)
        );
      }
      if (course) {
        const searchTerm = course.toLowerCase();
        filteredEnquiries = filteredEnquiries.filter(enquiry =>
          enquiry.course_id?.name?.toLowerCase().includes(searchTerm)
        );
      }
      if (status && status !== 'all') {
        filteredEnquiries = filteredEnquiries.filter(enquiry => enquiry.status === status);
      }

      const sortedEnquiries = filteredEnquiries.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setEnquiryData(sortedEnquiries);
      setFilteredData(sortedEnquiries); // Update filteredData directly with filtered and sorted data
      setPaginationData(pagination);

      // Update total count based on filtered data length if API doesn't provide it
      if (totalCount === 0) {
        totalCount = sortedEnquiries.length;
      }
      setCurrentPage(pagination.currentPage || page);
      setTotalPages(pagination.totalPages || Math.ceil(totalCount / pageSize) || 1);
      setTotalEnquiries(totalCount);
      setEnquiriesPerPage(pagination.enquiriesPerPage || pageSize);

    } catch (error) {
      console.error("Error fetching enquiries:", error);
      setEnquiryData([]);
      setFilteredData([]);
      setPaginationData({});
      setTotalEnquiries(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseService.getAllCourses();
      const courses = response?.data || [];
      setCourseData(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourseData([]);
    }
  };

  // Function to get course name by ID
  const getCourseNameById = (courseId) => {
    const course = courseData.find(course => course._id === courseId);
    return course ? course.name : 'N/A';
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
          await enquiryService.deleteEnquiry(id);
          Swal.fire("Deleted!", "Enquiry has been deleted.", "success");
          fetchEnquiries();
        } catch (error) {
          Swal.fire("Error", error.response?.data.message || "Error deleting enquiry", "error");
        }
      }
    });
  };

  const handleStatusUpdateClick = (enquiry) => {
    const getStatusIcon = (status) => {
      switch (status) {
        case "New": return "🆕";
        case "In Progress": return "⏳";
        case "Contacted": return "📞";
        case "Converted": return "✅";
        case "Closed": return "❌";
        default: return "❓";
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case "New": return "#3B82F6";
        case "In Progress": return "#F59E0B";
        case "Contacted": return "#8B5CF6";
        case "Converted": return "#10B981";
        case "Closed": return "#EF4444";
        default: return "#6B7280";
      }
    };

    const currentStatusColor = getStatusColor(enquiry.status);
    const currentStatusIcon = getStatusIcon(enquiry.status);

    Swal.fire({
      title: `<div class="status-popup-header">
        <div class="status-header-icon">🔄</div>
        <div class="status-header-content">
          <h3>Update Enquiry Status</h3>
          <p>Change the current status of this enquiry</p>
        </div>
      </div>`,
      html: `
        <div class="status-popup-body">
          <!-- Current Status Banner -->
          <div class="status-current-banner" style="background: linear-gradient(135deg, ${currentStatusColor}15 0%, ${currentStatusColor}25 100%); border-left: 4px solid ${currentStatusColor};">
            <div class="status-icon">${currentStatusIcon}</div>
            <div class="status-info">
              <h4>Current Status: ${enquiry.status || 'N/A'}</h4>
              <p>Enquiry: ${enquiry.full_name || 'N/A'}</p>
            </div>
          </div>

          <!-- Status Update Form -->
          <form id="statusForm" class="status-update-form">
            <div class="form-group">
              <label class="form-label">Select New Status:</label>
              <select id="newStatus" class="status-select" name="newStatus">
                <option value="">Choose a new status...</option>
                ${enquiry.status !== "New" ? '<option value="New">🆕 New</option>' : ''}
                ${enquiry.status !== "In Progress" ? '<option value="In Progress">⏳ In Progress</option>' : ''}
                ${enquiry.status !== "Contacted" ? '<option value="Contacted">📞 Contacted</option>' : ''}
                ${enquiry.status !== "Converted" ? '<option value="Converted">✅ Converted</option>' : ''}
                ${enquiry.status !== "Closed" ? '<option value="Closed">❌ Closed</option>' : ''}
              </select>
              <div id="newStatusError" class="error-message" style="display: none; color: #EF4444; font-size: 12px; margin-top: 4px;"></div>
            </div>

            <div class="form-group">
              <label class="form-label">Reason for Status Change:</label>
              <textarea id="statusDescription" class="status-textarea" name="statusDescription" rows="3" placeholder="Please provide a reason for changing the status..."></textarea>
              <div id="statusDescriptionError" class="error-message" style="display: none; color: #EF4444; font-size: 12px; margin-top: 4px;"></div>
            </div>
          </form>
        </div>`,
      width: '600px',
      showCloseButton: true,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Update Status',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'status-swal-popup',
        title: 'status-swal-title',
        htmlContainer: 'status-swal-html',
        confirmButton: 'status-confirm-btn',
        cancelButton: 'status-cancel-btn'
      },
      didOpen: () => {
        // Add custom styles for the status popup
        const style = document.createElement('style');
        style.textContent = `
          .status-swal-popup {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            border-radius: 16px;
            overflow: hidden;
          }

          .status-swal-title {
            padding: 0 !important;
            margin: 0 !important;
          }

          .status-swal-html {
            padding: 0 !important;
            margin: 0 !important;
          }

          .status-popup-header {
            background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            margin: -16px -16px 0 -16px;
          }

          .status-header-icon {
            font-size: 24px;
            background: rgba(255, 255, 255, 0.2);
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .status-header-content h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
          }

          .status-header-content p {
            margin: 2px 0 0 0;
            opacity: 0.9;
            font-size: 12px;
          }

          .status-popup-body {
            padding: 16px;
          }

          .status-current-banner {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
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

          .status-update-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-label {
            font-weight: 600;
            color: #374151;
            font-size: 14px;
          }

          .status-select {
            padding: 10px 12px;
            border: 2px solid #E5E7EB;
            border-radius: 8px;
            font-size: 14px;
            background: white;
            transition: all 0.3s ease;
          }

          .status-select:focus {
            outline: none;
            border-color: #F59E0B;
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
          }

          .status-select.error {
            border-color: #EF4444;
          }

          .status-textarea {
            padding: 10px 12px;
            border: 2px solid #E5E7EB;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            resize: vertical;
            min-height: 80px;
            transition: all 0.3s ease;
          }

          .status-textarea:focus {
            outline: none;
            border-color: #F59E0B;
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
          }

          .status-textarea.error {
            border-color: #EF4444;
          }

          .error-message {
            color: #EF4444;
            font-size: 12px;
            margin-top: 4px;
          }

          .status-confirm-btn {
            background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 10px 20px !important;
            font-weight: 600 !important;
            font-size: 14px !important;
            transition: all 0.3s ease !important;
          }

          .status-confirm-btn:hover {
            background: linear-gradient(135deg, #D97706 0%, #B45309 100%) !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3) !important;
          }

          .status-cancel-btn {
            background: #F3F4F6 !important;
            color: #374151 !important;
            border: 1px solid #D1D5DB !important;
            border-radius: 8px !important;
            padding: 10px 20px !important;
            font-weight: 600 !important;
            font-size: 14px !important;
            transition: all 0.3s ease !important;
          }

          .status-cancel-btn:hover {
            background: #E5E7EB !important;
            transform: translateY(-1px) !important;
          }
        `;
        document.head.appendChild(style);

        // Add event listeners for validation
        const newStatusField = document.getElementById('newStatus');
        const statusDescriptionField = document.getElementById('statusDescription');
        const newStatusError = document.getElementById('newStatusError');
        const statusDescriptionError = document.getElementById('statusDescriptionError');

        // Add event listeners for validation
        newStatusField.addEventListener('change', (e) => {
          if (e.target.value) {
            newStatusField.classList.remove('error');
            newStatusError.style.display = 'none';
          } else {
            newStatusField.classList.add('error');
            newStatusError.textContent = 'Please select a new status';
            newStatusError.style.display = 'block';
          }
        });

        statusDescriptionField.addEventListener('input', (e) => {
          if (e.target.value.trim()) {
            statusDescriptionField.classList.remove('error');
            statusDescriptionError.style.display = 'none';
          } else {
            statusDescriptionField.classList.add('error');
            statusDescriptionError.textContent = 'Please provide a reason for the status change';
            statusDescriptionError.style.display = 'block';
          }
        });
      },
      preConfirm: () => {
        const newStatus = document.getElementById('newStatus').value;
        const statusDescription = document.getElementById('statusDescription').value;
        let isValid = true;

        // Clear previous errors
        document.getElementById('newStatusError').style.display = 'none';
        document.getElementById('statusDescriptionError').style.display = 'none';
        document.getElementById('newStatus').classList.remove('error');
        document.getElementById('statusDescription').classList.remove('error');

        // Validate new status
        if (!newStatus) {
          document.getElementById('newStatus').classList.add('error');
          document.getElementById('newStatusError').textContent = 'Please select a new status';
          document.getElementById('newStatusError').style.display = 'block';
          isValid = false;
        }

        // Validate status description
        if (!statusDescription.trim()) {
          document.getElementById('statusDescription').classList.add('error');
          document.getElementById('statusDescriptionError').textContent = 'Please provide a reason for the status change';
          document.getElementById('statusDescriptionError').style.display = 'block';
          isValid = false;
        }

        if (!isValid) {
          return false;
        }

        return { newStatus, statusDescription };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        handleStatusUpdate(enquiry._id, result.value.newStatus, result.value.statusDescription);
      }
    });
  };

  const handleStatusUpdate = async (enquiryId, newStatus, statusDescription) => {
    try {
      await enquiryService.changeEnquiryStatus(enquiryId, newStatus, statusDescription);

      Swal.fire({
        icon: "success",
        title: "Status Updated Successfully!",
        text: `Enquiry status has been changed to ${newStatus}`,
        confirmButtonText: "OK",
        confirmButtonColor: "#10B981",
        customClass: {
          confirmButton: 'success-ok-btn'
        }
      });

      fetchEnquiries();
    } catch (error) {
      console.error('Status update error:', error);
      Swal.fire({
        icon: "error",
        title: "Update Failed!",
        text: "Failed to update status. Please try again.",
        confirmButtonText: "OK",
        confirmButtonColor: "#EF4444"
      });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchEnquiries(1, enquiriesPerPage, searchTermName, searchTermEmail, searchTermMobile, searchTermCourse, statusFilter);
  };

  const handleReset = () => {
    setSearchTermName('');
    setSearchTermEmail('');
    setSearchTermMobile('');
    setSearchTermCourse('');
    setStatusFilter('all');
    setCurrentPage(1); // Reset to first page
    fetchEnquiries(1, enquiriesPerPage, '', '', '', '', 'all'); // Fetch all enquiries with default sort
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchEnquiries(page, enquiriesPerPage);
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
    setEnquiriesPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    fetchEnquiries(1, newPageSize); // Fetch data with new page size
  };

  // Render pagination
  const renderPagination = () => {
    // Show pagination if there are enquiries and more than 1 page, or if we want to show page size selector
    if (totalEnquiries === 0) return null;

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
    const startNumber = ((currentPage - 1) * enquiriesPerPage) + 1;
    const endNumber = Math.min(currentPage * enquiriesPerPage, totalEnquiries);

    // Handle edge cases
    const displayStart = totalEnquiries > 0 ? startNumber : 0;
    const displayEnd = totalEnquiries > 0 ? endNumber : 0;

    // Ensure we don't show invalid ranges
    const finalStart = displayStart > totalEnquiries ? 0 : displayStart;
    const finalEnd = displayEnd > totalEnquiries ? totalEnquiries : displayEnd;

    return (
      <div className={`admin-dashboard-pagination`}>
        <div className="admin-dashboard-pagination-info">
          <span>
            Showing {finalStart} to {finalEnd} of {totalEnquiries} enquiries
          </span>
        </div>

        <div className="admin-dashboard-pagination-size-selector">
          <label htmlFor="pageSizeSelect" className="admin-dashboard-page-size-label">
            Show:
          </label>
          <select
            id="pageSizeSelect"
            value={enquiriesPerPage}
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

  // Additional functions for pagination

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(enquiry => ({
      "Name": enquiry.full_name || 'N/A',
      "Email": enquiry.email || 'N/A',
      "Mobile": enquiry.phone_number || 'N/A',
      "Course": enquiry.course_id?.name || 'N/A',
      "Status": enquiry.status || 'N/A',
      "Message": enquiry.additional_message || "N/A",
      "Created Date": enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : "N/A",
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Enquiries");
    XLSX.writeFile(wb, "enquiries.xlsx");
  };

  const handleViewEnquiry = (enquiry) => {
    const getStatusIcon = (status) => {
      switch (status) {
        case "New": return "🆕";
        case "In Progress": return "⏳";
        case "Contacted": return "📞";
        case "Converted": return "✅";
        case "Closed": return "❌";
        default: return "❓";
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case "New": return "#3B82F6";
        case "In Progress": return "#F59E0B";
        case "Contacted": return "#8B5CF6";
        case "Converted": return "#10B981";
        case "Closed": return "#EF4444";
        default: return "#6B7280";
      }
    };

    const createdDate = enquiry.createdAt
      ? new Date(enquiry.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      : 'N/A';

    const statusColor = getStatusColor(enquiry.status);
    const statusIcon = getStatusIcon(enquiry.status);

    Swal.fire({
      title: `<div class="enquiry-popup-header">
        <div class="enquiry-header-icon">📋</div>
        <div class="enquiry-header-content">
          <h3>Enquiry Details</h3>
          <p>Complete information about this enquiry</p>
        </div>
      </div>`,
      html: `
        <div class="enquiry-popup-body">
          <!-- Status Banner -->
          <div class="enquiry-status-banner" style="background: linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}25 100%); border-left: 4px solid ${statusColor};">
            <div class="status-icon">${statusIcon}</div>
            <div class="status-info">
              <h4>${enquiry.status || 'N/A'}</h4>
              <p>Current Status</p>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="enquiry-content-grid">
            <!-- Personal Information Section -->
            <div class="enquiry-section">
              <div class="section-header">
                <div class="section-icon">👤</div>
                <h4>Personal Information</h4>
              </div>
              <div class="section-content">
                <div class="info-item">
                  <label>Full Name</label>
                  <span>${enquiry.full_name || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Email Address</label>
                  <span>${enquiry.email || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Phone Number</label>
                  <span>${enquiry.phone_number || 'N/A'}</span>
                </div>
              </div>
            </div>

            <!-- Course Information Section -->
            <div class="enquiry-section">
              <div class="section-header">
                <div class="section-icon">📚</div>
                <h4>Course Information</h4>
              </div>
              <div class="section-content">
                <div class="info-item">
                  <label>Selected Course</label>
                  <span class="course-name">${enquiry.course_id?.name || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Enquiry Date</label>
                  <span>${createdDate}</span>
                </div>
              </div>
            </div>

                         <!-- Message Section -->
             <div class="enquiry-section">
               <div class="section-header">
                 <div class="section-icon">💬</div>
                 <h4>Additional Message</h4>
               </div>
               <div class="section-content">
                 <div class="message-content">
                   ${enquiry.additional_message ?
          `<p>${enquiry.additional_message}</p>` :
          `<p class="no-message">No additional message provided</p>`
        }
                 </div>
               </div>
             </div>
          </div>

          <!-- Action Buttons -->
          <div class="enquiry-actions">
            <button class="action-btn primary" onclick="window.open('mailto:${enquiry.email}', '_blank')">
              📧 Reply via Email
            </button>
            <button class="action-btn secondary" onclick="navigator.clipboard.writeText('${enquiry.phone_number}')">
              📱 Copy Phone
            </button>
          </div>
        </div>`,
      width: '750px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'enquiry-swal-popup',
        title: 'enquiry-swal-title',
        htmlContainer: 'enquiry-swal-html'
      },
      didOpen: () => {
        // Add custom styles for the enquiry popup
        const style = document.createElement('style');
        style.textContent = `
          .enquiry-swal-popup {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            border-radius: 16px;
            overflow: hidden;
          }

          .enquiry-swal-title {
            padding: 0 !important;
            margin: 0 !important;
          }

          .enquiry-swal-html {
            padding: 0 !important;
            margin: 0 !important;
          }

                     .enquiry-popup-header {
             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
             color: white;
             padding: 16px;
             display: flex;
             align-items: center;
             gap: 12px;
             margin: -16px -16px 0 -16px;
           }

           .enquiry-header-icon {
             font-size: 24px;
             background: rgba(255, 255, 255, 0.2);
             width: 45px;
             height: 45px;
             border-radius: 50%;
             display: flex;
             align-items: center;
             justify-content: center;
           }

           .enquiry-header-content h3 {
             margin: 0;
             font-size: 20px;
             font-weight: 600;
           }

           .enquiry-header-content p {
             margin: 2px 0 0 0;
             opacity: 0.9;
             font-size: 12px;
           }

           .enquiry-popup-body {
             padding: 16px;
           }

           .enquiry-status-banner {
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

           .enquiry-content-grid {
             display: grid;
             grid-template-columns: 1fr 1fr;
             gap: 10px;
             margin-bottom: 12px;
           }

           .enquiry-section {
             background: #F9FAFB;
             border-radius: 8px;
             padding: 10px;
             border: 1px solid #E5E7EB;
           }

           .enquiry-section.full-width {
             grid-column: 1 / -1;
           }

           .enquiry-section.message-section {
             grid-column: 1 / -1;
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

           .course-name {
             color: #667eea !important;
             font-weight: 700 !important;
           }

           .message-content {
             background: white;
             border-radius: 6px;
             padding: 12px;
             border: 1px solid #E5E7EB;
             min-height: 40px;
             max-height: 80px;
             overflow-y: auto;
           }

           .message-content p {
             margin: 0;
             line-height: 1.5;
             color: #1F2937;
             font-size: 12px;
           }

           .no-message {
             color: #9CA3AF !important;
             font-style: italic;
           }

           .enquiry-actions {
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
             .enquiry-content-grid {
               grid-template-columns: 1fr;
             }
             
             .info-item {
               flex-direction: column;
               align-items: flex-start;
               gap: 4px;
             }
             
             .enquiry-actions {
               flex-direction: column;
             }
           }

           @media (max-width: 600px) {
             .enquiry-content-grid {
               grid-template-columns: 1fr;
             }
           }
        `;
        document.head.appendChild(style);
      }
    });
  };

  return (
    <AdminLayout>
      <div className="admin-dashboard-pageContent">
        <div className="admin-dashboard-mb-6 animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-d-flex admin-dashboard-justify-between admin-dashboard-align-center admin-dashboard-mb-4">
            <h2 className="admin-dashboard-text-2xl admin-dashboard-font-semibold admin-dashboard-text-heading-color animated animate__animated animate__slideInLeft">Enquiry Management</h2>
            <div className="admin-dashboard-d-flex admin-dashboard-gap-2">
              <button onClick={exportToExcel} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <FileSpreadsheet size={18} className="admin-dashboard-btn-icon" />
                Export to Excel
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
                placeholder="Search by name..."
                value={searchTermName}
                onChange={(e) => setSearchTermName(e.target.value)}
              />
            </div>
            <div className="admin-dashboard-search-input-group">
              <input
                type="email"
                className="admin-dashboard-search-input"
                placeholder="Search by email..."
                value={searchTermEmail}
                onChange={(e) => setSearchTermEmail(e.target.value)}
              />
            </div>
            <div className="admin-dashboard-search-input-group">
              <input
                type="text"
                className="admin-dashboard-search-input"
                placeholder="Search by mobile..."
                value={searchTermMobile}
                onChange={(e) => setSearchTermMobile(e.target.value)}
              />
            </div>
            <div className="admin-dashboard-search-input-group">
              <input
                type="text"
                className="admin-dashboard-search-input"
                placeholder="Search by course..."
                value={searchTermCourse}
                onChange={(e) => setSearchTermCourse(e.target.value)}
              />
            </div>
            <div className="admin-dashboard-search-input-group">
              <select
                className="admin-dashboard-search-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Contacted">Contacted</option>
                <option value="Converted">Converted</option>
                <option value="Closed">Closed</option>
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
            <Loader title="Loading Enquiries" subtitle="Please wait..." />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="admin-dashboard-empty-state animated animate__animated animate__fadeIn">
            <div className="admin-dashboard-empty-state-content">
              <svg className="admin-dashboard-empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="admin-dashboard-empty-state-title">No enquiries found</h3>
              <p className="admin-dashboard-empty-state-description">Try adjusting your search criteria or filters.</p>
            </div>
          </div>
        ) : (
          <div className="admin-dashboard-table-container animated animate__animated animate__fadeIn">
            <table className="admin-dashboard-table">
              <thead className="admin-dashboard-table-header">
                <tr>
                  <th className="admin-dashboard-table-th admin-dashboard-sno-column">S.No</th>
                  <th className="admin-dashboard-table-th admin-dashboard-name-column">Name</th>
                  <th className="admin-dashboard-table-th admin-dashboard-mobile-column">Mobile</th>
                  <th className="admin-dashboard-table-th">Course</th>
                  <th className="admin-dashboard-table-th admin-dashboard-status-column">Status</th>
                  <th className="admin-dashboard-table-th admin-dashboard-date-column">Created</th>
                  <th className="admin-dashboard-table-th admin-dashboard-actions-column">Actions</th>
                </tr>
              </thead>
              <tbody className="admin-dashboard-table-body">
                {filteredData.map((enquiry, index) => (
                  <tr key={enquiry._id} className="admin-dashboard-table-row">
                    <td className="admin-dashboard-table-td admin-dashboard-sno-cell">{(currentPage - 1) * enquiriesPerPage + index + 1}</td>
                    <td className="admin-dashboard-name-cell">
                      <div className="admin-dashboard-user-info" onClick={() => handleViewEnquiry(enquiry)} style={{ cursor: 'pointer' }}>
                        <div className="admin-dashboard-user-details">
                          <div className="admin-dashboard-user-name">{enquiry.full_name || 'N/A'}</div>
                          <div className="admin-dashboard-user-email">{enquiry.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="admin-dashboard-table-td admin-dashboard-mobile-cell">{enquiry.phone_number || 'N/A'}</td>
                    <td className="admin-dashboard-table-td">{enquiry.course_id?.name || 'N/A'}</td>
                    <td className="admin-dashboard-table-td admin-dashboard-status-cell">
                      <span
                        style={{
                          backgroundColor: enquiry.status === "New" ? "rgba(59, 130, 246, 0.1)" :
                            enquiry.status === "In Progress" ? "rgba(245, 158, 11, 0.1)" :
                              enquiry.status === "Contacted" ? "rgba(139, 92, 246, 0.1)" :
                                enquiry.status === "Converted" ? "rgba(16, 185, 129, 0.1)" :
                                  "rgba(239, 68, 68, 0.1)",
                          color: enquiry.status === "New" ? "#3B82F6" :
                            enquiry.status === "In Progress" ? "#F59E0B" :
                              enquiry.status === "Contacted" ? "#8B5CF6" :
                                enquiry.status === "Converted" ? "#10B981" :
                                  "#EF4444",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontWeight: "500",
                          fontSize: "12px",
                          display: "inline-block"
                        }}
                      >
                        {enquiry.status || "N/A"}
                      </span>
                    </td>


                    <td className="admin-dashboard-date-cell">
                      {enquiry.createdAt ? (
                        <Moment format="DD/MM/YYYY" utc>{enquiry.createdAt}</Moment>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="admin-dashboard-actions-cell">
                      <div className="admin-dashboard-actions-container">
                        <button
                          onClick={() => handleViewEnquiry(enquiry)}
                          title="View Details"
                          className="admin-dashboard-btn-action-icon admin-dashboard-btn-view"
                        >
                          <Eye size={14} className="admin-dashboard-action-icon-svg" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdateClick(enquiry)}
                          title={enquiry.status === "Closed" ? "Reopen Enquiry" : "Close Enquiry"}
                          className="admin-dashboard-btn-action-icon admin-dashboard-btn-edit"
                        >
                          {enquiry.status === "Closed" ? (
                            <ToggleLeft size={14} className="admin-dashboard-action-icon-svg" />
                          ) : (
                            <ToggleRight size={14} className="admin-dashboard-action-icon-svg" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(enquiry._id)}
                          title="Delete Enquiry"
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
            {renderPagination()}
          </div>
        )}
      </div>


    </AdminLayout>
  );
};

export default EnquiryIndex;
