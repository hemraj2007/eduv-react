import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import Moment from "react-moment";
import * as XLSX from "xlsx";

import videoService from "../../services/videoService";
import packageService from "../../services/packageService";
import { Eye, Trash2, Edit, Plus, FileSpreadsheet, Search, RotateCcw } from "lucide-react";
import Loader from "../../components/Loader";
import 'animate.css';
import '../../style/admin-style.css';

const VideoIndex = () => {
  const [videoData, setVideoData] = useState([]);
  const [packages, setPackages] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [searchTermTitle, setSearchTermTitle] = useState('');
  const [searchTermPackage, setSearchTermPackage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const [videosPerPage, setVideosPerPage] = useState(10);
  const [paginatedData, setPaginatedData] = useState([]);

  const navigate = useNavigate();

  // Helper function to determine if status is active
  const isStatusActive = (status) => {
    return status === 'active' || status === true || status === 'Y' || status === 1;
  };

  useEffect(() => {
    fetchVideos();
    fetchPackages();
  }, []);

  // Refetch packages if videos are loaded but packages are not
  useEffect(() => {
    if (videoData.length > 0 && packages.length === 0 && !isLoadingPackages) {
      console.log("Videos loaded but packages not found, refetching packages...");
      fetchPackages();
    }
  }, [videoData, packages.length, isLoadingPackages]);

  const fetchPackages = async () => {
    try {
      setIsLoadingPackages(true);
      const response = await packageService.getAllPackages();

      let packagesData = [];

      // Handle different response structures
      if (response?.packages && Array.isArray(response.packages)) {
        packagesData = response.packages;
      } else if (response?.data?.packages && Array.isArray(response.data.packages)) {
        packagesData = response.data.packages;
      } else if (response?.data && Array.isArray(response.data)) {
        packagesData = response.data;
      } else if (Array.isArray(response)) {
        packagesData = response;
      } else {
        console.log("Unexpected package response structure:", response);
        packagesData = [];
      }

      // Ensure each package has the required fields
      packagesData = packagesData.map(pkg => ({
        _id: pkg._id || pkg.id || '',
        name: pkg.name || pkg.package_name || 'Unnamed Package',
        status: pkg.status || 'active',
        ...pkg // Keep all other fields
      }));

      setPackages(packagesData);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setPackages([]);
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const response = await videoService.getAllVideos();

      let videos = [];
      if (response?.videos && Array.isArray(response.videos)) {
        videos = response.videos;
      } else if (response?.data?.videos && Array.isArray(response.data.videos)) {
        videos = response.data.videos;
      } else if (Array.isArray(response)) {
        videos = response;
      } else if (Array.isArray(response?.data)) {
        videos = response.data;
      } else {
        console.log("No videos found in response structure:", response);
        videos = [];
      }

      // Ensure each video has the required fields and normalize package_id
      videos = videos.map(video => ({
        ...video,
        package_id: video.package_id || video.packageId || video.package || null,
        title: video.title || 'Untitled Video',
        status: video.status || 'active'
      }));

      setVideoData(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideoData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setFilteredData(videoData);
    setTotalVideos(videoData.length);
    setCurrentPage(1);
  }, [videoData]);

  // Update pagination when filtered data or page settings change
  useEffect(() => {
    const totalPages = Math.ceil(filteredData.length / videosPerPage);
    setTotalPages(totalPages || 1);
    setTotalVideos(filteredData.length);

    // Ensure current page is valid
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
      return;
    }

    // Calculate paginated data
    const startIndex = (currentPage - 1) * videosPerPage;
    const endIndex = startIndex + videosPerPage;
    setPaginatedData(filteredData.slice(startIndex, endIndex));
  }, [filteredData, currentPage, videosPerPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const filtered = videoData.filter(video => {
      const titleMatch = searchTermTitle === '' || video.title?.toLowerCase().includes(searchTermTitle.toLowerCase());
      const packageMatch = searchTermPackage === '' || getPackageName(video.package_id)?.toLowerCase().includes(searchTermPackage.toLowerCase());

      // Handle both string and boolean status values
      let statusMatch = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          statusMatch = isStatusActive(video.status);
        } else if (statusFilter === 'inactive') {
          statusMatch = !isStatusActive(video.status);
        }
      }

      return titleMatch && packageMatch && statusMatch;
    });

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getPackageName = (packageId) => {
    // Early return if no package ID
    if (!packageId) {
      return 'N/A';
    }

    // Early return if packages are still loading
    if (isLoadingPackages) {
      return 'Loading...';
    }

    // Early return if no packages loaded
    if (!packages || packages.length === 0) {
      return 'N/A';
    }

    // Handle case where packageId is an object with _id and name properties
    if (typeof packageId === 'object' && packageId !== null) {
      // If the object has a name property, use it directly
      if (packageId.name) {
        return packageId.name;
      }
      // If it has an _id property, use that for lookup
      if (packageId._id) {
        packageId = packageId._id;
      } else {
        return 'N/A';
      }
    }

    // Convert packageId to string for comparison
    const videoPkgIdStr = String(packageId || '');

    // Try to find the package with multiple comparison strategies
    const packageItem = packages.find(pkg => {
      // Convert package ID to string for comparison
      const pkgIdStr = String(pkg._id || pkg.id || '');

      // Try exact string match
      if (pkgIdStr === videoPkgIdStr) {
        return true;
      }

      // Try case-insensitive match
      if (pkgIdStr.toLowerCase() === videoPkgIdStr.toLowerCase()) {
        return true;
      }

      // Try trimming whitespace
      if (pkgIdStr.trim() === videoPkgIdStr.trim()) {
        return true;
      }

      return false;
    });

    if (packageItem && packageItem.name) {
      return packageItem.name;
    }

    // If still not found, try to find by any field that might contain the ID
    const fallbackPackage = packages.find(pkg => {
      const pkgIdStr = String(pkg._id || pkg.id || '');

      // Check if the video package ID is contained in the package ID or vice versa
      return pkgIdStr.includes(videoPkgIdStr) || videoPkgIdStr.includes(pkgIdStr);
    });

    if (fallbackPackage && fallbackPackage.name) {
      return fallbackPackage.name;
    }

    return 'N/A';
  };

  const handleReset = () => {
    setSearchTermTitle('');
    setSearchTermPackage('');
    setStatusFilter('all');
    setFilteredData(videoData);
    setCurrentPage(1);

    // Show success message
    Swal.fire({
      title: "Filters Reset",
      text: "Search filters have been reset successfully.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
      customClass: {
        popup: 'admin-dashboard-animated-popup admin-dashboard-success-popup',
        title: 'admin-dashboard-success-popup-title'
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      }
    });
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
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
    setVideosPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Pagination component
  const renderPagination = () => {
    // Show pagination if there are videos and more than 1 page, or if we want to show page size selector
    if (totalVideos === 0) return null;

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
    const startNumber = ((currentPage - 1) * videosPerPage) + 1;
    const endNumber = Math.min(currentPage * videosPerPage, totalVideos);

    // Handle edge cases
    const displayStart = totalVideos > 0 ? startNumber : 0;
    const displayEnd = totalVideos > 0 ? endNumber : 0;

    // Ensure we don't show invalid ranges
    const finalStart = displayStart > totalVideos ? 0 : displayStart;
    const finalEnd = displayEnd > totalVideos ? totalVideos : displayEnd;

    return (
      <div className={`admin-dashboard-pagination`}>
        <div className="admin-dashboard-pagination-info">
          <span>
            Showing {finalStart} to {finalEnd} of {totalVideos} videos
          </span>
        </div>

        <div className="admin-dashboard-pagination-size-selector">
          <label htmlFor="pageSizeSelect" className="admin-dashboard-page-size-label">
            Show:
          </label>
          <select
            id="pageSizeSelect"
            value={videosPerPage}
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
          await videoService.deleteVideo(id);
          Swal.fire({
            title: "Deleted!",
            text: "Video has been deleted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'admin-dashboard-animated-popup admin-dashboard-success-popup',
              title: 'admin-dashboard-success-popup-title'
            },
            showClass: {
              popup: 'animate__animated animate__fadeInDown animate__faster'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp animate__faster'
            }
          });
          fetchVideos();
        } catch (error) {
          Swal.fire({
            title: "Delete Failed",
            text: error.response?.data.message || "Error deleting video",
            icon: "error",
            customClass: {
              popup: 'admin-dashboard-animated-popup admin-dashboard-error-popup',
              title: 'admin-dashboard-error-popup-title',
              confirmButton: 'admin-dashboard-error-popup-btn'
            }
          });
        }
      }
    });
  };

  const handleChangeStatus = async (id, status) => {
    // Convert status to enum values for backend (not boolean)
    let newStatus;
    if (isStatusActive(status)) {
      newStatus = 'inactive'; // If currently active, make inactive
    } else {
      newStatus = 'active';   // If currently inactive, make active
    }

    Swal.fire({
      title: "Change video status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await videoService.updateVideoStatus(id, newStatus);
          Swal.fire({
            title: "Status Updated!",
            text: "Video status has been updated successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'admin-dashboard-animated-popup admin-dashboard-success-popup',
              title: 'admin-dashboard-success-popup-title'
            },
            showClass: {
              popup: 'animate__animated animate__fadeInDown animate__faster'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp animate__faster'
            }
          });
          fetchVideos();
        } catch (error) {
          Swal.fire({
            title: "Update Failed",
            text: error.response?.data?.message || "Failed to update status!",
            icon: "error",
            customClass: {
              popup: 'admin-dashboard-animated-popup admin-dashboard-error-popup',
              title: 'admin-dashboard-error-popup-title',
              confirmButton: 'admin-dashboard-error-popup-btn'
            }
          });
        }
      }
    });
  };



  const handleAddVideo = () => {
    navigate("/admin/videos/add");
  };



  const handleEditVideo = (id) => {
    navigate(`/admin/videos/edit/${id}`);
  };

  const exportToExcel = () => {
    const dataToExport = filteredData.map((video, index) => ({
      'S NO': index + 1,
      // 'Title': video.title || 'N/A',
      'Package': getPackageName(video.package_id) || 'N/A',
      'Video URL': video.video_url || 'N/A',
      // 'Status': isStatusActive(video.status) ? "Active" : "Inactive",
      'Created': video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Videos");

    // Show success message
    Swal.fire({
      title: "Export Successful",
      text: `${dataToExport.length} videos exported to Excel`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: 'admin-dashboard-animated-popup admin-dashboard-success-popup',
        title: 'admin-dashboard-success-popup-title',
        confirmButton: 'admin-dashboard-success-popup-btn'
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      }
    });

    XLSX.writeFile(wb, "videos_data.xlsx");
  };

  // Render component
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-loading-container animated animate__animated animate__fadeIn">
          <Loader title="Loading Videos" subtitle="Please wait..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard-pageContent">
        <div className="admin-dashboard-mb-6 animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-d-flex admin-dashboard-justify-between admin-dashboard-align-center admin-dashboard-mb-4">
            <h2 className="admin-dashboard-text-2xl admin-dashboard-font-semibold admin-dashboard-text-heading-color animated animate__animated animate__slideInLeft">Video Management</h2>
            <div className="admin-dashboard-d-flex admin-dashboard-gap-2">
              <button onClick={exportToExcel} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <FileSpreadsheet size={18} className="admin-dashboard-btn-icon" />
                Export to Excel
              </button>
              <button onClick={handleAddVideo} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <Plus size={18} className="admin-dashboard-btn-icon" />
                Add Video
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
                placeholder="Search by package..."
                value={searchTermPackage}
                onChange={(e) => setSearchTermPackage(e.target.value)}
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

        {filteredData.length === 0 ? (
          <div className="admin-dashboard-empty-state animated animate__animated animate__fadeIn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3>No videos found</h3>
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

                      "Package",
                      "Video URL",

                      "Created",
                      "Actions"
                    ].map((header, index) => (
                      <th key={index} className={header === "S NO" ? "admin-dashboard-sno-column" : header === "Title" ? "admin-dashboard-name-column" : ""}>
                        {header}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((video, index) => (
                  <tr key={video._id} className="admin-dashboard-table-row animated animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="admin-dashboard-sno-cell">{((currentPage - 1) * videosPerPage) + index + 1}</td>

                    <td>
                      {(() => {
                        const packageName = getPackageName(video.package_id);
                        if (packageName === 'N/A' && video.package_id) {
                          return (
                            <span title={`Package ID: ${video.package_id}`} style={{ color: '#ff6b6b' }}>
                              Package Not Found
                            </span>
                          );
                        }
                        return packageName;
                      })()}
                    </td>
                    <td>
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#00BCD4',
                          textDecoration: 'underline',
                          wordBreak: 'break-all'
                        }}
                        title={video.video_url}
                      >
                        {video.video_url || 'N/A'}
                      </a>
                    </td>
                    <td className="admin-dashboard-date-cell">
                      {video.createdAt ? (
                        <Moment format="DD/MM/YYYY" utc>{video.createdAt}</Moment>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="admin-dashboard-actions-cell">
                      <div className="admin-dashboard-actions-container">

                        <button
                          onClick={() => handleEditVideo(video._id)}
                          title="Edit Video"
                          className="admin-dashboard-btn-action-icon admin-dashboard-btn-edit"
                        >
                          <Edit size={14} className="admin-dashboard-action-icon-svg" />
                        </button>
                        <div
                          className={`admin-dashboard-toggle-switch ${isStatusActive(video.status) ? 'active' : 'inactive'}`}
                          onClick={() => handleChangeStatus(video._id, video.status)}
                          title={`Toggle ${isStatusActive(video.status) ? "Inactive" : "Active"}`}
                        >
                          <div className="admin-dashboard-toggle-knob">
                            {isStatusActive(video.status) ? (
                              <span className="admin-dashboard-toggle-knob-icon active">✓</span>
                            ) : (
                              <span className="admin-dashboard-toggle-knob-icon inactive">✗</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(video._id)}
                          title="Delete Video"
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
        {/* Always show pagination section */}
        {renderPagination()}
      </div>
    </AdminLayout>
  );
};

export default VideoIndex;
