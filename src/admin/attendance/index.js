// index.jsx (Attendance Listing Page)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import Moment from "react-moment";
import * as XLSX from "xlsx";
import { Eye, Trash2, Edit, Plus, FileSpreadsheet, Search, RotateCcw, CheckCircle } from "lucide-react";
import { attendanceService, studentService, courseService } from "../../services"; // Import studentService and courseService
import Loader from "../../components/Loader";
import 'animate.css';

const AttendanceIndex = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchTermStudent, setSearchTermStudent] = useState('');
  const [searchTermCourse, setSearchTermCourse] = useState('');
  const [searchTermDate, setSearchTermDate] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [sortField, setSortField] = useState('');
  const [studentIdsForSearch, setStudentIdsForSearch] = useState([]); // New state for student IDs
  const [courseIdsForSearch, setCourseIdsForSearch] = useState([]);   // New state for course IDs
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttendances, setTotalAttendances] = useState(0);
  const [attendancesPerPage, setAttendancesPerPage] = useState(25);
  const [paginationData, setPaginationData] = useState({});

  // Selected students for bulk actions
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial fetch and pagination-driven fetches
    fetchAttendances(currentPage, attendancesPerPage, searchTermStudent, searchTermCourse, searchTermDate, dateFilter, statusFilter);

    // Check for success message from add page
    const successMessage = sessionStorage.getItem('attendanceSuccess');
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
      sessionStorage.removeItem('attendanceSuccess');
    }
  }, [currentPage, attendancesPerPage]); // Only re-run on page or page size change

  const fetchAttendances = async (
    page = currentPage,
    pageSize = attendancesPerPage,
    studentIds = studentIdsForSearch, // Use student IDs
    courseIds = courseIdsForSearch,   // Use course IDs
    date = searchTermDate,
    dateFilterType = dateFilter,
    status = statusFilter
  ) => {
    setIsLoading(true);
    try {
      // Apply date filter if date is not explicitly searched and a date filter type is selected
      const finalDate = date || (dateFilterType !== 'all' ? getDateForFilter(dateFilterType) : '');

      console.log('Fetching Attendances with params:', {
        page,
        pageSize,
        studentIds, // Log IDs
        courseIds,  // Log IDs
        finalDate,
        dateFilterType,
        status
      });

      const response = await attendanceService.getAllAttendances(
        page,
        pageSize,
        studentIds, // Pass IDs
        courseIds,  // Pass IDs
        finalDate,
        dateFilterType,
        status
      );

      console.log('API Response:', response);

      let fetchedAttendances = [];
      let fetchedPagination = {};
      let fetchedTotalCount = 0;

      if (Array.isArray(response)) {
        // Case 1: API returns an array directly
        fetchedAttendances = response;
        fetchedTotalCount = response.length; // Total count is the array length
        fetchedPagination = {
          currentPage: page,
          totalPages: Math.ceil(response.length / pageSize) || 1,
          limit: pageSize,
          totalItems: response.length
        };
      } else if (typeof response === 'object' && response !== null) {
        // Case 2: API returns an object with data and possibly pagination/total count
        fetchedAttendances = Array.isArray(response.data) ? response.data : [];
        fetchedPagination = response.pagination || {};
        fetchedTotalCount = response.totalAttendances || response.total || response.count || fetchedAttendances.length || 0;
      }

      // Sort attendances by createdAt in descending order (newest first)
      const sortedAttendances = fetchedAttendances.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setAttendanceData(sortedAttendances);
      setFilteredData(sortedAttendances); // Update filteredData directly from API response
      setPaginationData(fetchedPagination);

      setCurrentPage(fetchedPagination.currentPage || page);
      setTotalPages(fetchedPagination.totalPages || Math.ceil(fetchedTotalCount / pageSize) || 1);
      setTotalAttendances(fetchedTotalCount); // Set total count from API response
      setAttendancesPerPage(fetchedPagination.limit || pageSize);

    } catch (error) {
      console.error("Error fetching attendances:", error);
      setAttendanceData([]);
      setFilteredData([]);
      setPaginationData({});
      setTotalAttendances(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get date for filtering
  const getDateForFilter = (filterType) => {
    const today = new Date();
    const targetDate = new Date(today);

    switch (filterType) {
      case 'yesterday':
        targetDate.setDate(today.getDate() - 1);
        break;
      case 'dayBeforeYesterday':
        targetDate.setDate(today.getDate() - 2);
        break;
      case 'threeDaysAgo':
        targetDate.setDate(today.getDate() - 3);
        break;
      case 'fourDaysAgo':
        targetDate.setDate(today.getDate() - 4);
        break;
      default:
        return null;
    }

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
          await attendanceService.deleteAttendance(id);
          Swal.fire("Deleted!", "Attendance record has been deleted.", "success");
          fetchAttendances();
        } catch (error) {
          Swal.fire("Error", error.response?.data.message || "Error deleting attendance", "error");
        }
      }
    });
  };

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);

    const sortedData = [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (field) {
        case 'student':
          aValue = a.studentId?.name || '';
          bValue = b.studentId?.name || '';
          break;
        case 'course':
          aValue = a.courseId?.name || '';
          bValue = b.courseId?.name || '';
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredData(sortedData);
  };

  const handleSearchSubmit = async (e) => { // Made async
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search

    let studentIds = [];
    let courseIds = [];

    setIsLoading(true); // Show loader during search processing

    try {
      if (searchTermStudent) {
        const studentResponse = await studentService.getAllStudents(1, 100, searchTermStudent); // Fetch up to 100 matching students
        studentIds = studentResponse.students ? studentResponse.students.map(s => s._id) : [];
        setStudentIdsForSearch(studentIds);
      } else {
        setStudentIdsForSearch([]);
      }

      if (searchTermCourse) {
        const courseResponse = await courseService.getAllCourses(1, 100, searchTermCourse); // Fetch up to 100 matching courses
        courseIds = courseResponse.courses ? courseResponse.courses.map(c => c._id) : [];
        setCourseIdsForSearch(courseIds);
      } else {
        setCourseIdsForSearch([]);
      }

      // Now fetch attendances with the resolved IDs
      fetchAttendances(1, attendancesPerPage, studentIds, courseIds, searchTermDate, dateFilter, statusFilter);
    } catch (error) {
      console.error("Error during search term resolution:", error);
      Swal.fire("Error", "Failed to search students or courses. Please try again.", "error");
      setIsLoading(false); // Hide loader on error
    }
  };

  const handleReset = () => {
    setSearchTermStudent('');
    setSearchTermCourse('');
    setSearchTermDate('');
    setDateFilter('all');
    setStatusFilter('all');
    setStudentIdsForSearch([]); // Clear student IDs
    setCourseIdsForSearch([]);   // Clear course IDs
    setCurrentPage(1); // Reset to first page on reset
    fetchAttendances(1, attendancesPerPage, [], [], '', 'all', 'all'); // Fetch all data with empty IDs
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAttendances(page, attendancesPerPage, studentIdsForSearch, courseIdsForSearch, searchTermDate, dateFilter, statusFilter);
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
    setAttendancesPerPage(newPageSize);
    setCurrentPage(1);
    fetchAttendances(1, newPageSize, studentIdsForSearch, courseIdsForSearch, searchTermDate, dateFilter, statusFilter);
  };

  // Pagination component
  const renderPagination = () => {
    // Show pagination if there are attendances and more than 1 page, or if we want to show page size selector
    if (totalAttendances === 0) return null;

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
    const startNumber = ((currentPage - 1) * attendancesPerPage) + 1;
    const endNumber = Math.min(currentPage * attendancesPerPage, totalAttendances);

    // Handle edge cases
    const displayStart = totalAttendances > 0 ? startNumber : 0;
    const displayEnd = totalAttendances > 0 ? endNumber : 0;

    // Ensure we don't show invalid ranges
    const finalStart = displayStart > totalAttendances ? 0 : displayStart;
    const finalEnd = displayEnd > totalAttendances ? totalAttendances : displayEnd;

    return (
      <div className={`admin-dashboard-pagination`}>
        <div className="admin-dashboard-pagination-info animated animate__animated animate__fadeIn">
          <span>
            Showing {finalStart} to {finalEnd} of {totalAttendances} attendance records
          </span>
        </div>

        <div className="admin-dashboard-pagination-size-selector animated animate__animated animate__fadeIn">
          <label htmlFor="pageSizeSelect" className="admin-dashboard-page-size-label">
            Show:
          </label>
          <select
            id="pageSizeSelect"
            value={attendancesPerPage}
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
        <div className="admin-dashboard-pagination-controls animated animate__animated animate__fadeIn">
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
    const dataToExport = filteredData.map((attendance, index) => ({
      'S NO': index + 1,
      'Student Name': attendance.studentId?.name || "N/A",
      'Course': attendance.courseId?.name || "N/A",
      'Date': attendance.date ? new Date(attendance.date).toLocaleDateString() : "N/A",
      'Status': attendance.status === 'Present' ? "Present" : "Absent",
      'Notes': attendance.notes || "N/A",
      'Created Date': attendance.createdDate ? new Date(attendance.createdDate).toLocaleDateString() : "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendances");
    XLSX.writeFile(wb, "attendances.xlsx");
  };

  const handleViewAttendance = (attendance) => {
    const getStatusIcon = (status) => {
      return status === "Present" ? "✅" : "❌";
    };

    const getStatusColor = (status) => {
      return status === "Present" ? "#10b981" : "#ef4444";
    };

    const attendanceDate = attendance.date
      ? (() => {
        let displayDate;
        if (typeof attendance.date === 'string') {
          if (attendance.date.includes('T')) {
            displayDate = attendance.date.split('T')[0];
          } else {
            displayDate = attendance.date;
          }
        } else if (attendance.date instanceof Date) {
          const year = attendance.date.getFullYear();
          const month = String(attendance.date.getMonth() + 1).padStart(2, '0');
          const day = String(attendance.date.getDate()).padStart(2, '0');
          displayDate = `${year}-${month}-${day}`;
        } else {
          displayDate = attendance.date;
        }

        const dateObj = new Date(displayDate + 'T00:00:00');
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      })()
      : 'N/A';

    const createdDate = attendance.createdDate
      ? new Date(attendance.createdDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      : 'N/A';

    const statusColor = getStatusColor(attendance.status);
    const statusIcon = getStatusIcon(attendance.status);

    Swal.fire({
      title: `<div class="attendance-popup-header">
        <div class="attendance-header-icon">📊</div>
        <div class="attendance-header-content">
          <h3>Attendance Details</h3>
          <p>Complete information about this attendance record</p>
        </div>
      </div>`,
      html: `
        <div class="attendance-popup-body">
          <!-- Status Banner -->
          <div class="attendance-status-banner" style="background: linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}25 100%); border-left: 4px solid ${statusColor};">
            <div class="status-icon">${statusIcon}</div>
            <div class="status-info">
              <h4>${attendance.status || 'N/A'}</h4>
              <p>Attendance Status</p>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="attendance-content-grid">
            <!-- Student Information Section -->
            <div class="attendance-section">
              <div class="section-header">
                <div class="section-icon">👤</div>
                <h4>Student Information</h4>
              </div>
              <div class="section-content">
                <div class="info-item">
                  <label>Student Name</label>
                  <span>${attendance.studentId?.name || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Course</label>
                  <span>${attendance.courseId?.name || 'N/A'}</span>
                </div>
              </div>
            </div>

            <!-- Attendance Information Section -->
            <div class="attendance-section">
              <div class="section-header">
                <div class="section-icon">📅</div>
                <h4>Attendance Information</h4>
              </div>
              <div class="section-content">
                <div class="info-item">
                  <label>Attendance Date</label>
                  <span>${attendanceDate}</span>
                </div>
                <div class="info-item">
                  <label>Created Date</label>
                  <span>${createdDate}</span>
                </div>
              </div>
            </div>

            <!-- Notes Section -->
            <div class="attendance-section" style="grid-column: 1 / -1;">
              <div class="section-header">
                <div class="section-icon">📝</div>
                <h4>Additional Information</h4>
              </div>
              <div class="section-content">
                <div class="info-item">
                  <label>Notes</label>
                  <span>${attendance.notes || 'No notes available'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>`,
      width: '750px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'attendance-swal-popup',
        title: 'attendance-swal-title',
        htmlContainer: 'attendance-swal-html'
      },
      didOpen: () => {
        const style = document.createElement('style');
        style.textContent = `
          .attendance-swal-popup {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            border-radius: 16px;
            overflow: hidden;
          }

          .attendance-swal-title {
            padding: 0 !important;
            margin: 0 !important;
          }

          .attendance-swal-html {
            padding: 0 !important;
            margin: 0 !important;
          }

          .attendance-popup-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            margin: -16px -16px 0 -16px;
          }

          .attendance-header-icon {
            font-size: 24px;
            background: rgba(255, 255, 255, 0.2);
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .attendance-header-content h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
          }

          .attendance-header-content p {
            margin: 2px 0 0 0;
            opacity: 0.9;
            font-size: 12px;
          }

          .attendance-popup-body {
            padding: 16px;
          }

          .attendance-status-banner {
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

          .attendance-content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 12px;
          }

          .attendance-section {
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
            word-break: break-word;
            text-align: right;
            max-width: 60%;
          }

          @media (max-width: 768px) {
            .attendance-content-grid {
              grid-template-columns: 1fr;
            }
            
            .info-item {
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
            }
            
            .info-item span {
              max-width: 100%;
              text-align: left;
            }
          }

          @media (max-width: 600px) {
            .attendance-content-grid {
              grid-template-columns: 1fr;
            }
          }
        `;
        document.head.appendChild(style);
      }
    });
  };

  const handleAddAttendance = () => {
    navigate('/admin/attendance/add');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Loader title="Loading Attendance Records" subtitle="Please wait..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style>{`
        /* Table Layout Styles */
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        
        .admin-table-header th {
          background-color: #00BCD4;
          padding: 12px 8px;
          border-bottom: 3px solid #0097A7;
          font-weight: 600;
          color: white;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.875rem;
        }
        
        .admin-sno-column {
          width: 60px !important;
          min-width: 60px;
        }
        
        .admin-name-column {
          width: 250px !important;
          min-width: 250px;
        }
        
        .admin-table-row {
          border-bottom: 1px solid #dee2e6;
        }
        
        .admin-table-row:hover {
          background-color: #f8f9fa;
        }
        
        .admin-table-row td {
          padding: 12px 8px;
          text-align: left;
          vertical-align: top;
        }
        
        .admin-sno-cell {
          width: 60px;
          text-align: center;
          font-weight: 500;
        }
        
        .admin-name-cell {
          width: 250px;
        }
        
        .admin-student-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .admin-student-name {
          font-weight: 600;
          color: #212529;
        }
        
        .admin-student-course {
          font-size: 12px;
          color: #6c757d;
          word-break: break-all;
        }
        
        .admin-dashboard-user-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .admin-dashboard-user-name {
          font-weight: 600;
          color: #212529;
        }
        
        .admin-dashboard-user-email {
          font-size: 12px;
          color: #6c757d;
          font-style: italic;
        }
        
        .admin-student-email {
          font-size: 0.8rem;
          color: #666;
          font-style: italic;
        }
        
        .admin-date-cell {
          width: 120px;
        }
        
        .admin-status-cell {
          width: 100px;
        }
        
        .admin-status-text {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }
        
        .admin-status-text.present {
          background-color: #d4edda;
          color: #155724;
        }
        
        .admin-status-text.absent {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .admin-actions-cell {
          width: 100px;
        }
        
        .admin-actions-container {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: nowrap;
          justify-content: flex-start;
        }
        
        .admin-btn-action-icon {
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          margin: 0 3px;
        }
        
        .admin-btn-action-icon:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .admin-btn-action-icon:active {
          transform: translateY(0);
        }
        
        .admin-action-icon-svg {
          width: 14px;
          height: 14px;
        }
        
        .admin-btn-icon {
          margin-right: 6px;
        }
        
        .admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }
        
        .admin-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .admin-btn:active {
          transform: translateY(0);
        }
        
        /* Search Form Styles */
        .admin-search-form {
          margin-bottom: 1.5rem;
        }
        
        .admin-search-form-content {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .admin-search-input-group {
          flex: 1;
          min-width: 200px;
        }
        
        .admin-search-input,
        .admin-search-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.3s ease;
          background-color: white;
        }
        
        .admin-search-input:focus,
        .admin-search-select:focus {
          outline: none;
          border-color: #00BCD4;
          box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
        }
        
        .admin-search-button-group {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        
        .admin-search-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .admin-search-btn-primary {
          background-color: #00BCD4;
          color: white;
        }
        
        .admin-search-btn-primary:hover {
          background-color: #0097A7;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
        }
        
        .admin-search-btn-secondary {
          background-color: #6b7280;
          color: white;
        }
        
        .admin-search-btn-secondary:hover {
          background-color: #4b5563;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .admin-search-form-content {
            flex-direction: column;
            align-items: stretch;
          }
          
          .admin-search-input-group {
            min-width: auto;
          }
          
          .admin-search-button-group {
            justify-content: center;
          }
          
          .admin-name-column {
            width: 200px !important;
          }
          
          .admin-name-cell {
            width: 200px;
          }
          
          .admin-actions-container {
            gap: 4px;
          }
          
          .admin-btn-action-icon {
            width: 28px;
            height: 28px;
          }
        }
        
        /* Pagination Styles */
        .admin-dashboard-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .admin-dashboard-pagination-single-page {
          justify-content: center;
        }
        
        .admin-dashboard-pagination-info {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .admin-dashboard-pagination-size-selector {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .admin-dashboard-page-size-label {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
          margin: 0;
        }
        
        .admin-dashboard-page-size-select {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background-color: white;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .admin-dashboard-page-size-select:focus {
          outline: none;
          border-color: #00BCD4;
          box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
        }
        
        .admin-dashboard-page-size-select:hover {
          border-color: #9ca3af;
        }
        
        .admin-dashboard-page-size-text {
          font-size: 14px;
          color: #6b7280;
        }
        
        .admin-dashboard-pagination-controls {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .admin-dashboard-pagination-btn {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          background-color: white;
          color: #374151;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          min-width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .admin-dashboard-pagination-btn:hover:not(:disabled) {
          background-color: #f3f4f6;
          border-color: #9ca3af;
          color: #1f2937;
        }
        
        .admin-dashboard-pagination-btn.active {
          background-color: #00BCD4;
          border-color: #00BCD4;
          color: white;
        }
        
        .admin-dashboard-pagination-btn:disabled {
          background-color: #f9fafb;
          border-color: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
        }
        
        /* Responsive pagination */
        @media (max-width: 768px) {
          .admin-dashboard-pagination {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          
          .admin-dashboard-pagination-size-selector {
            justify-content: center;
          }
          
          .admin-dashboard-pagination-controls {
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .admin-dashboard-pagination-btn {
            min-width: 36px;
            padding: 6px 10px;
            font-size: 13px;
          }
        }
      `}</style>
      <div className="admin-dashboard-pageContent">
        <div className="admin-dashboard-mb-6 animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-d-flex admin-dashboard-justify-between admin-dashboard-align-center admin-dashboard-mb-4">
            <h2 className="admin-dashboard-text-2xl admin-dashboard-font-semibold admin-dashboard-text-heading-color animated animate__animated animate__slideInLeft">Attendance Management</h2>
            <div className="admin-dashboard-d-flex admin-dashboard-gap-2">
              <button onClick={exportToExcel} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <FileSpreadsheet size={18} className="admin-dashboard-btn-icon" />
                Export to Excel
              </button>
              <button onClick={handleAddAttendance} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <Plus size={18} className="admin-dashboard-btn-icon" />
                Add Attendance
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
                placeholder="Search by student name..."
                value={searchTermStudent}
                onChange={(e) => setSearchTermStudent(e.target.value)}
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
              <input
                type="date"
                className="admin-dashboard-search-input"
                placeholder="Search by date..."
                value={searchTermDate}
                onChange={(e) => setSearchTermDate(e.target.value)}
              />
            </div>
            {/* <div className="admin-dashboard-search-input-group">
              <select
                className="admin-dashboard-search-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="yesterday">Yesterday</option>
                <option value="dayBeforeYesterday">The day before yesterday</option>
                <option value="threeDaysAgo">3 days ago</option>
                <option value="fourDaysAgo">4 days ago</option>
              </select>
            </div> */}
            <div className="admin-dashboard-search-input-group">
              <select
                className="admin-dashboard-search-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
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

        {filteredData.length === 0 ? (
          <div className="admin-dashboard-empty-state animated animate__animated animate__fadeIn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3>No attendance records found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="admin-dashboard-overflow-x-auto animated animate__animated animate__fadeInUp">
            <table className="admin-dashboard-table">
              <thead className="admin-dashboard-table-header">
                <tr>
                  {[
                    "S NO",
                    "Student",
                    "Course",
                    "Date",
                    "Status",
                    "Actions"
                  ].map((header, index) => {
                    let className = "";

                    if (header === "S NO") {
                      className = "admin-dashboard-sno-column";
                    } else if (header === "Student") {
                      className = "admin-dashboard-name-column";
                    }

                    return (
                      <th key={index} className={className}>
                        {header}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((attendance, index) => (
                  <tr key={attendance._id} className="admin-dashboard-table-row animated animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="admin-dashboard-sno-cell">{((currentPage - 1) * attendancesPerPage) + index + 1}</td>
                    <td className="admin-dashboard-name-cell">
                      <div className="admin-dashboard-user-info" onClick={() => handleViewAttendance(attendance)}>
                        <div className="admin-dashboard-user-details">
                          <div className="admin-dashboard-user-name">{attendance.studentId?.name || 'N/A'}</div>
                          <div className="admin-dashboard-user-email">{attendance.studentId?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="admin-dashboard-name-cell">{attendance.courseId?.name || 'N/A'}</td>

                    <td className="admin-dashboard-date-cell">
                      {attendance.date ? (
                        <Moment format="DD/MM/YYYY" utc>{attendance.date}</Moment>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="admin-dashboard-status-cell">
                      <span className={`admin-dashboard-status-text ${attendance.status === "Present" ? 'active' : 'inactive'}`}>
                        {attendance.status || 'N/A'}
                      </span>
                    </td>
                    <td className="admin-dashboard-actions-cell">
                      <div className="admin-dashboard-actions-container">
                        <button
                          onClick={() => handleViewAttendance(attendance)}
                          title="View Details"
                          className="admin-dashboard-btn-action-icon admin-dashboard-btn-view"
                        >
                          <Eye size={14} className="admin-dashboard-action-icon-svg" />
                        </button>
                        <button
                          onClick={() => handleDelete(attendance._id)}
                          title="Delete Attendance"
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
        )}

        {/* Pagination */}
        {renderPagination()}
      </div>
    </AdminLayout>
  );
};

export default AttendanceIndex;
