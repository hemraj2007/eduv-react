import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import Moment from "react-moment";
import * as XLSX from "xlsx";
import sliderService from "../../services/sliderService";
import { BiShow, BiTrash } from "react-icons/bi";
import { BsPencil } from "react-icons/bs";
import Loader from "../../components/Loader";

const SliderIndex = () => {
  const [sliderData, setSliderData] = useState([]);
  const [searchTermTitle, setSearchTermTitle] = useState('');
  const [searchTermPosition, setSearchTermPosition] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSliders, setTotalSliders] = useState(0);
  const [slidersPerPage, setSlidersPerPage] = useState(25);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSliders(1);
  }, []);

  useEffect(() => {
    // Calculate total pages whenever slider data or slidersPerPage changes
    if (sliderData.length > 0) {
      setTotalSliders(sliderData.length);
      setTotalPages(Math.ceil(sliderData.length / slidersPerPage));
      
      // Apply pagination to filtered data
      const startIndex = (currentPage - 1) * slidersPerPage;
      const endIndex = startIndex + slidersPerPage;
      const paginatedData = sliderData.slice(startIndex, endIndex);
      setFilteredData(paginatedData);
    } else {
      setFilteredData([]);
      setTotalPages(1);
      setTotalSliders(0);
    }
  }, [sliderData, currentPage, slidersPerPage]);

  const fetchSliders = async (page = 1, pageSize = slidersPerPage) => {
    try {
      setIsLoading(true);
      setCurrentPage(page);
      const response = await sliderService.getAllSliders();
      
      // Handle different response structures
      let sliders = [];
      if (response?.data) {
        sliders = Array.isArray(response.data) ? response.data : [];
      } else if (response?.sliders) {
        sliders = Array.isArray(response.sliders) ? response.sliders : [];
      } else if (Array.isArray(response)) {
        sliders = response;
      } else {
        sliders = [];
      }
      
      const sortedSliders = sliders.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setSliderData(sortedSliders);
      setTotalSliders(sortedSliders.length);
      setTotalPages(Math.ceil(sortedSliders.length / pageSize));
    } catch (error) {
      console.error("Error fetching sliders:", error);
      setSliderData([]);
      setTotalSliders(0);
      setTotalPages(1);
      Swal.fire("Error", "Failed to fetch sliders", "error");
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
          await sliderService.deleteSlider(id);
          Swal.fire("Deleted!", "Slider has been deleted.", "success");
          fetchSliders();
        } catch (error) {
          Swal.fire("Error", error.response?.data.message || "Error deleting slider", "error");
        }
      }
    });
  };

  const handleChangeStatus = async (id, status) => {
    const newStatus = status === 'Y' ? 'N' : 'Y';
    Swal.fire({
      title: "Change slider status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await sliderService.updateSliderStatus(id, newStatus);
          Swal.fire("Updated!", "Slider status updated.", "success");
          fetchSliders();
        } catch (error) {
          console.error("Status update error:", error);
          Swal.fire("Error", error.response?.data.message || "Failed to update status!", "error");
        }
      }
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const filtered = sliderData.filter(slider => {
      const titleMatch = searchTermTitle === '' || slider.title?.toLowerCase().includes(searchTermTitle.toLowerCase());
      const positionMatch = searchTermPosition === '' || slider.position?.toString().includes(searchTermPosition);
      const statusMatch = statusFilter === 'all' || slider.status === statusFilter;

      return titleMatch && positionMatch && statusMatch;
    });

    setTotalSliders(filtered.length);
    setTotalPages(Math.ceil(filtered.length / slidersPerPage));
    setCurrentPage(1); // Reset to first page when filtering
    
    // Apply pagination to filtered data
    const startIndex = 0; // First page
    const endIndex = slidersPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);
    setFilteredData(paginatedData);
  };

  const handleReset = () => {
    setSearchTermTitle('');
    setSearchTermPosition('');
    setStatusFilter('all');
    setCurrentPage(1);
    fetchSliders(1);
  };

  // Pagination functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchSliders(page);
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
    setSlidersPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    fetchSliders(1, newPageSize); // Fetch data with new page size
  };

  // Pagination component
  const renderPagination = () => {
    // Show pagination if there are sliders and more than 1 page, or if we want to show page size selector
    if (totalSliders === 0) return null;

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
    const startNumber = ((currentPage - 1) * slidersPerPage) + 1;
    const endNumber = Math.min(currentPage * slidersPerPage, totalSliders);
    
    // Handle edge cases
    const displayStart = totalSliders > 0 ? startNumber : 0;
    const displayEnd = totalSliders > 0 ? endNumber : 0;
    
    // Ensure we don't show invalid ranges
    const finalStart = displayStart > totalSliders ? 0 : displayStart;
    const finalEnd = displayEnd > totalSliders ? totalSliders : displayEnd;

    return (
      <div className={`admin-dashboard-pagination`}>
        <div className="admin-dashboard-pagination-info">
          <span>
            Showing {finalStart} to {finalEnd} of {totalSliders} sliders
          </span>
        </div>
        
        <div className="admin-dashboard-pagination-size-selector">
          <label htmlFor="pageSizeSelect" className="admin-dashboard-page-size-label">
            Show:
          </label>
          <select
            id="pageSizeSelect"
            value={slidersPerPage}
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
    const dataToExport = sliderData.map((slider, index) => ({
      'S NO': index + 1,
      'Title': slider.title || 'N/A',
      'Subtitle': slider.subtitle || 'N/A',
      'Position': slider.position || 'N/A',
      'Status': slider.status === "Y" ? "Active" : "Inactive",
      'Created Date': slider.createdAt ? new Date(slider.createdAt).toLocaleDateString() : 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sliders");
    XLSX.writeFile(wb, "sliders_data.xlsx");
  };

  const handleViewSlider = (slider) => {
    const getStatusIcon = (status) => {
      return status === "Y" ? "✅" : "❌";
    };

    const getStatusColor = (status) => {
      return status === "Y" ? "#10B981" : "#EF4444";
    };

    const createdDate = slider.createdAt
      ? new Date(slider.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'N/A';

    const statusColor = getStatusColor(slider.status);
    const statusIcon = getStatusIcon(slider.status);

    Swal.fire({
      title: `<div class="admin-dashboard-user-popup-header">
        <div class="admin-dashboard-user-popup-header-icon">🎠</div>
        <div class="admin-dashboard-user-popup-header-content">
          <h3>Slider Details</h3>
          <p>Complete information about this slider</p>
        </div>
      </div>`,
      html: `
        <div class="admin-dashboard-user-popup-body">
          <!-- Status Banner -->
          <div class="admin-dashboard-user-popup-status-banner" style="background: linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}25 100%); border-left: 4px solid ${statusColor};">
            <div class="admin-dashboard-user-popup-status-icon">${statusIcon}</div>
            <div class="admin-dashboard-user-popup-status-info">
              <h4>${slider.status === "Y" ? 'Active' : 'Inactive'}</h4>
              <p>Current Status</p>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="admin-dashboard-user-popup-content-grid">
            <!-- Slider Information Section -->
            <div class="admin-dashboard-user-popup-section">
              <div class="admin-dashboard-user-popup-section-header">
                <div class="admin-dashboard-user-popup-section-icon">🎠</div>
                <h4>Slider Information</h4>
              </div>
              <div class="admin-dashboard-user-popup-section-content">
                <div class="admin-dashboard-user-popup-info-item">
                  <label>Title</label>
                  <span>${slider.title || 'N/A'}</span>
                </div>
                <div class="admin-dashboard-user-popup-info-item">
                  <label>Subtitle</label>
                  <span>${slider.subtitle || 'N/A'}</span>
                </div>
                <div class="admin-dashboard-user-popup-info-item">
                  <label>Position</label>
                  <span>${slider.position || 'N/A'}</span>
                </div>
              </div>
            </div>

            <!-- Dates Section -->
            <div class="admin-dashboard-user-popup-section">
              <div class="admin-dashboard-user-popup-section-header">
                <div class="admin-dashboard-user-popup-section-icon">📅</div>
                <h4>Date Information</h4>
              </div>
              <div class="admin-dashboard-user-popup-section-content">
                <div class="admin-dashboard-user-popup-info-item">
                  <label>Created Date:</label>
                  <span>${createdDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>`,
      width: '750px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'admin-dashboard-user-popup',
        title: 'admin-dashboard-user-popup-title',
        htmlContainer: 'admin-dashboard-user-popup-html'
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
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .user-header-content h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
          }

          .user-header-content p {
            margin: 4px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
          }

          .user-popup-body {
            padding: 16px;
          }

          .user-status-banner {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
          }

          .status-icon {
            font-size: 20px;
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .status-info h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
          }

          .status-info p {
            margin: 2px 0 0 0;
            font-size: 12px;
            opacity: 0.8;
          }

          .user-content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }

          .user-section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 16px;
          }

          .section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
          }

          .section-icon {
            font-size: 16px;
            width: 32px;
            height: 32px;
            background: #e9ecef;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .section-header h4 {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #495057;
          }

          .section-content {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }

          .info-item:last-child {
            border-bottom: none;
          }

          .info-item label {
            font-size: 12px;
            font-weight: 500;
            color: #6c757d;
            min-width: 80px;
          }

          .info-item span {
            font-size: 13px;
            font-weight: 500;
            color: #212529;
            text-align: right;
            max-width: 200px;
            word-break: break-word;
          }

          .user-actions {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e9ecef;
          }

          .action-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .action-btn.primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .action-btn.primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .action-btn.secondary {
            background: #f8f9fa;
            color: #6c757d;
            border: 1px solid #dee2e6;
          }

          .action-btn.secondary:hover {
            background: #e9ecef;
            color: #495057;
          }
        `;
        document.head.appendChild(style);
      }
    });
  };

  const handleAddSlider = () => {
    navigate('/admin/sliders/add');
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="d-flex justify-between align-center mb-4">
          <h2 className="text-2xl font-semibold text-heading-color">Slider Management</h2>
          <button
            onClick={handleAddSlider}
            className="btn btn-success btn-action-md"
          >
            Add Slider
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="d-flex gap-3 align-items-end mb-4 form-no-wrap">
          <div className="form-group form-group-flex">
            <input
              type="text"
              value={searchTermTitle}
              onChange={(e) => setSearchTermTitle(e.target.value)}
              placeholder="Search by Title"
              className="form-control"
            />
          </div>

          <div className="form-group form-group-flex">
            <input
              type="text"
              value={searchTermPosition}
              onChange={(e) => setSearchTermPosition(e.target.value)}
              placeholder="Search by Position"
              className="form-control"
            />
          </div>

          <div className="form-group form-group-flex">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
            >
              <option value="all">All Status</option>
              <option value="Y">Active</option>
              <option value="N">Inactive</option>
            </select>
          </div>

          <div className="d-flex gap-2 flex-shrink-0">
            <button type="submit" className="btn btn-primary btn-action-md">
              Search
            </button>
            <button type="button" onClick={handleReset} className="btn btn-secondary btn-action-md">
              Reset
            </button>
            <button type="button" onClick={exportToExcel} className="btn btn-success btn-action-md">
              Export to Excel
            </button>
          </div>
        </form>

        {isLoading ? (
          <Loader title="Loading Sliders" subtitle="Please wait..." />
        ) : filteredData.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-muted">
              <svg className="mx-auto h-12 w-12 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-heading-color">No sliders found</h3>
              <p className="mt-1 text-sm text-muted">Try adjusting your search criteria or filters.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  {["S NO", "Title", "Position", "Status", "Created Date", "Actions"].map((header, index) => (
                    <th key={index} className="table-custom-header">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((slider, index) => (
                  <tr key={slider._id} className="text-center">
                    <td>{index + 1}</td>
                    <td className="font-medium">{slider.title || 'N/A'}</td>
                    <td>{slider.position || 'N/A'}</td>
                    <td>
                      <div className="d-flex justify-content-center align-items-center">
                        <div
                          className={`custom-toggle-switch ${slider.status === "Y" ? 'active' : 'inactive'}`}
                          onClick={() => handleChangeStatus(slider._id, slider.status)}
                        >
                          <div className="toggle-knob">
                            {slider.status === "Y" ? (
                              <span className="toggle-knob-icon active">✓</span>
                            ) : (
                              <span className="toggle-knob-icon inactive">✗</span>
                            )}
                          </div>
                        </div>
                        <span className={`ms-2 toggle-label ${slider.status === "Y" ? 'active' : 'inactive'}`}>
                          {slider.status === "Y" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td>
                      {slider.createdAt ? (
                        <Moment format="MMMM Do YYYY">{new Date(slider.createdAt)}</Moment>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="text-center align-middle">
                      <div className="admin-actions-container">
                        <button
                          onClick={() => handleViewSlider(slider)}
                          title="View Details"
                          className="admin-btn-action-icon admin-btn-view"
                        >
                          <BiShow className="admin-action-icon-svg" />
                        </button>
                        <button
                          onClick={() => {
                            console.log("Edit button clicked for slider:", slider._id);
                            console.log("Full slider object:", slider);
                            navigate(`/admin/sliders/edit/${slider._id}`);
                          }}
                          title="Edit Slider"
                          className="admin-btn-action-icon admin-btn-edit"
                        >
                          <BsPencil className="admin-action-icon-svg" />
                        </button>
                        <button
                          onClick={() => handleDelete(slider._id)}
                          title="Delete Slider"
                          className="admin-btn-action-icon admin-btn-delete"
                        >
                          <BiTrash className="admin-action-icon-svg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SliderIndex;
