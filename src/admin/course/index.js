// index.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import Moment from "react-moment";
import * as XLSX from "xlsx";

import courseService from "../../services/courseService";
import { Eye, Trash2, Edit, Plus, FileSpreadsheet, Search, RotateCcw } from "lucide-react";
import Loader from "../../components/Loader";
import 'animate.css';
import '../../style/admin-style.css';

const CourseIndex = () => {
  const [courseData, setCourseData] = useState([]);
  const [searchTermName, setSearchTermName] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [coursesPerPage, setCoursesPerPage] = useState(25);
  const [paginationData, setPaginationData] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses(currentPage, coursesPerPage, '', 'all'); // Initial fetch without search terms
    fetchTotalCount();
  }, [currentPage, coursesPerPage]);

  const fetchTotalCount = async () => {
    try {
      const response = await courseService.getTotalCourseCount();
      console.log('Total Count API Response:', response);

      if (response.success && response.count) {
        setTotalCourses(response.count);
      } else if (response.count) {
        // Direct count response
        setTotalCourses(response.count);
      } else if (response.total) {
        // Alternative count field
        setTotalCourses(response.total);
      } else if (response.totalCourses) {
        // Another alternative count field
        setTotalCourses(response.totalCourses);
      } else if (courseData && courseData.length) {
        // Use the actual data length if available
        setTotalCourses(courseData.length);
      } else {
        // Fallback to 0 if no data
        setTotalCourses(0);
      }
    } catch (error) {
      console.error("Error fetching total course count:", error);
      // Use the actual data length if available
      if (courseData && courseData.length) {
        setTotalCourses(courseData.length);
      } else {
        setTotalCourses(0);
      }
    }
  };

  // Remove this useEffect as filtering is now done within fetchCourses
  // useEffect(() => {
  //   setFilteredData(courseData);
  //   // Update total count based on actual data length when data changes
  //   if (courseData && courseData.length) {
  //     setTotalCourses(courseData.length);
  //   }
  // }, [courseData]);

  const fetchCourses = async (page = currentPage, pageSize = coursesPerPage, search = searchTermName, status = statusFilter) => {
    setIsLoading(true);
    try {
      const response = await courseService.getAllCourses(page, pageSize, search, 'createdDate', 'desc');

      // Debug: Log the response structure
      console.log('API Response:', response);

      // Handle the response structure based on your backend
      let courses = [];
      let pagination = {};
      let totalCount = 0;

      if (response.success) {
        // If the API returns data in the expected format
        courses = Array.isArray(response.data) ? response.data : [];
        pagination = response.pagination || {};
        totalCount = response.totalCourses || response.total || response.count || 0;
      } else if (response.data) {
        // Alternative response structure
        courses = Array.isArray(response.data) ? response.data : [];
        pagination = response.pagination || {};
        totalCount = response.totalCourses || response.total || response.count || 0;
      } else {
        // Fallback for different response structure
        courses = Array.isArray(response) ? response : [];
        pagination = {};
        totalCount = courses.length; // Use courses length as fallback
      }

      // Apply client-side filtering based on search term and status filter
      const filteredCourses = courses.filter(course => {
        const nameMatch = search === '' || course.name?.toLowerCase().includes(search.toLowerCase());
        const statusMatch = status === 'all' || course.status === status;
        return nameMatch && statusMatch;
      });

      setCourseData(filteredCourses); // Set the filtered data
      setFilteredData(filteredCourses); // Also update filteredData directly
      setPaginationData(pagination);

      // Set pagination state with proper total count
      setCurrentPage(pagination.currentPage || page);
      setTotalPages(pagination.totalPages || Math.ceil(totalCount / pageSize) || 1);

      // Only update totalCourses if we have a valid count from the API
      if (totalCount > 0) {
        setTotalCourses(totalCount);
      } else if (filteredCourses.length > 0) {
        // Fallback to the actual data length
        setTotalCourses(filteredCourses.length);
      }

      setCoursesPerPage(pagination.coursesPerPage || pageSize);

    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourseData([]);
      setFilteredData([]); // Clear filtered data on error
      setPaginationData({});
      setTotalCourses(0);
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
          await courseService.deleteCourse(id);
          Swal.fire("Deleted!", "Course has been deleted.", "success");
          fetchCourses(currentPage, coursesPerPage, searchTermName, statusFilter); // Re-fetch data after deletion
        } catch (error) {
          Swal.fire("Error", error.response?.data.message || "Error deleting course", "error");
        }
      }
    });
  };

  const handleChangeStatus = async (id, status) => {
    const newStatus = status === 'Y' ? 'N' : 'Y';
    Swal.fire({
      title: "Change course status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log(`Updating status for course ${id} to ${newStatus}`); // Debug log
          await courseService.updateCourseStatus(id, newStatus);
          Swal.fire("Updated!", "Course status updated.", "success");
          fetchCourses(currentPage, coursesPerPage, searchTermName, statusFilter); // Re-fetch data after status update
        } catch (error) {
          console.error("Status update error:", error); // Debug log
          Swal.fire("Error", error.response?.data.message || "Failed to update status!", "error");
        }
      }
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchCourses(1, coursesPerPage, searchTermName, statusFilter);
  };

  const handleReset = () => {
    setSearchTermName('');
    setStatusFilter('all');
    setCurrentPage(1); // Reset to first page
    fetchCourses(1, coursesPerPage, '', 'all'); // Fetch all courses with default sort
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCourses(page);
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
    setCoursesPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    fetchCourses(1, newPageSize); // Fetch data with new page size
  };

  // Pagination component
  const renderPagination = () => {
    // Show pagination if there are courses and more than 1 page, or if we want to show page size selector
    if (totalCourses === 0) return null;

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
    const startNumber = ((currentPage - 1) * coursesPerPage) + 1;
    const endNumber = Math.min(currentPage * coursesPerPage, totalCourses);

    // Handle edge cases
    const displayStart = totalCourses > 0 ? startNumber : 0;
    const displayEnd = totalCourses > 0 ? endNumber : 0;

    // Ensure we don't show invalid ranges
    const finalStart = displayStart > totalCourses ? 0 : displayStart;
    const finalEnd = displayEnd > totalCourses ? totalCourses : displayEnd;

    return (
      <div className={`admin-dashboard-pagination`}>
        <div className="admin-dashboard-pagination-info">
          <span>
            Showing {finalStart} to {finalEnd} of {totalCourses} courses
          </span>
        </div>

        <div className="admin-dashboard-pagination-size-selector">
          <label htmlFor="pageSizeSelect" className="admin-dashboard-page-size-label">
            Show:
          </label>
          <select
            id="pageSizeSelect"
            value={coursesPerPage}
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
    // Show loading indicator
    Swal.fire({
      title: 'Exporting Data',
      text: 'Please wait while we prepare your Excel file...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Process data for export
    const dataToExport = filteredData.map((course, index) => ({
      'S NO': index + 1,
      'Name': course.name || 'N/A',
      'Duration': course.duration || 'N/A',
      'Actual Fees': `₹${course.actualFees || 'N/A'}`,
      'Discount': course.discount || 'N/A',
      'Final Fees': `₹${course.finalFees || 'N/A'}`,
      'Status': course.status === "Y" ? "Active" : "Inactive",
      'Created Date': course.createdDate ? new Date(course.createdDate).toLocaleDateString() : 'N/A'
    }));

    try {
      // Create worksheet and workbook
      const ws = XLSX.utils.json_to_sheet(dataToExport);

      // Set column widths for better readability
      const colWidths = [
        { wch: 5 },  // S NO
        { wch: 25 }, // Name
        { wch: 12 }, // Duration
        { wch: 12 }, // Actual Fees
        { wch: 8 },  // Discount
        { wch: 12 }, // Final Fees
        { wch: 8 },  // Status
        { wch: 15 }  // Created Date
      ];
      ws['!cols'] = colWidths;

      // Create workbook and append worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Courses");

      // Write file and show success message
      XLSX.writeFile(wb, "courses_data.xlsx");

      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: `${dataToExport.length} courses exported to Excel successfully!`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Excel export error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'There was an error exporting the data to Excel.'
      });
    }
  };

  const handleViewCourse = (course) => {
    navigate(`/admin/course/detail/${course._id}`);
  };

  const handleAddCourse = () => {
    navigate("/admin/course/add");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Loader title="Loading Courses" subtitle="Please wait while we fetch the course data..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard-pageContent">
        <div className="admin-dashboard-mb-6 animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-d-flex admin-dashboard-justify-between admin-dashboard-align-center admin-dashboard-mb-4">
            <h2 className="admin-dashboard-text-2xl admin-dashboard-font-semibold admin-dashboard-text-heading-color animated animate__animated animate__slideInLeft">Course Management</h2>
            <div className="admin-dashboard-d-flex admin-dashboard-gap-2">
              <button onClick={exportToExcel} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <FileSpreadsheet size={18} className="admin-dashboard-btn-icon" />
                Export to Excel
              </button>
              <button onClick={handleAddCourse} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <Plus size={18} className="admin-dashboard-btn-icon" />
                Add Course
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

        {filteredData.length === 0 ? (
          <div className="admin-dashboard-empty-state animated animate__animated animate__fadeIn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3>No courses found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="admin-dashboard-overflow-x-auto animated animate__animated animate__fadeInUp">
            <table className="admin-dashboard-table">
              <thead className="admin-dashboard-table-header">
                <tr>
                  {
                    [
                      "S NO",
                      "Name",
                      // "Duration",
                      "Actual Fees",
                      "Discount",
                      "Final Fees",
                      // "Status",
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
                {filteredData.map((course, index) => (
                  <tr key={course._id} className="admin-dashboard-table-row animated animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="admin-dashboard-sno-cell">{((currentPage - 1) * coursesPerPage) + index + 1}</td>
                
                    <td className="admin-dashboard-name-cell">
                      <div className="admin-dashboard-user-info" onClick={() => handleViewCourse(course)} style={{ cursor: 'pointer' }}>
                        <div className="admin-dashboard-user-avatar">
                          <img
                            src={course.courseImage ? `${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/${course.courseImage}` : '/dummy-user.jpg'}
                            alt={course.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              // e.target.src = '/dummy-user.jpg';
                            }}
                            className="admin-dashboard-user-avatar-img"
                          />
                        </div>
                        <div className="admin-dashboard-user-details">
                          <div className="admin-dashboard-user-name">{course.name || 'N/A'}</div>
                          <div className="admin-dashboard-user-email">{course.duration || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>₹{course.actualFees || 'N/A'}</td>
                    <td>{course.discount || 'N/A'}</td>
                    <td>₹{course.finalFees || 'N/A'}</td>

                    <td className="admin-dashboard-date-cell">
                      {course.createdDate ? (
                        <Moment format="DD/MM/YYYY" utc>{course.createdDate}</Moment>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="admin-dashboard-actions-cell">
                      <div className="admin-dashboard-actions-container">

                        <button
                          onClick={() => navigate(`/admin/course/edit/${course._id}`)}
                          title="Edit Course"
                          className="admin-dashboard-btn-action-icon admin-dashboard-btn-edit"
                        >
                          <Edit size={14} className="admin-dashboard-action-icon-svg" />
                        </button>
                        <div
                          className={`admin-dashboard-toggle-switch ${course.status === "Y" ? 'active' : 'inactive'}`}
                          onClick={() => handleChangeStatus(course._id, course.status)}
                          title={`Toggle ${course.status === "Y" ? "Inactive" : "Active"}`}
                        >
                          <div className="admin-dashboard-toggle-knob">
                            {course.status === "Y" ? (
                              <span className="admin-dashboard-toggle-knob-icon active">✓</span>
                            ) : (
                              <span className="admin-dashboard-toggle-knob-icon inactive">✗</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(course._id)}
                          title="Delete Course"
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
        {filteredData.length > 0 && renderPagination()}
      </div>
    </AdminLayout>
  );
};

export default CourseIndex;
