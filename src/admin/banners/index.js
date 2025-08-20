import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import Moment from "react-moment";
import * as XLSX from "xlsx";
import bannerService from "../../services/bannerService";
import { BiShow, BiTrash } from "react-icons/bi";
import { BsPencil } from "react-icons/bs";
import Loader from "../../components/Loader";

const BannerIndex = () => {
  const [bannerData, setBannerData] = useState([]);
  const [searchTermTitle, setSearchTermTitle] = useState('');
  const [searchTermSection, setSearchTermSection] = useState('');
  const [searchTermPage, setSearchTermPage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to determine if status is active
  const isStatusActive = (status) => {
    return status === 'Y' || status === true || status === 1;
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    setFilteredData(bannerData);
  }, [bannerData]);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await bannerService.getAllBanners();
      const banners = Array.isArray(response?.data) ? response.data : [];
      
      // Debug: Log status values
      banners.forEach((banner, index) => {
        console.log(`Banner ${index + 1} (${banner.title}): status =`, banner.status, "Type:", typeof banner.status);
      });
      
      // Sort banners by createdAt in descending order (newest first)
      const sortedBanners = banners.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setBannerData(sortedBanners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setBannerData([]);
      Swal.fire("Error", "Failed to fetch banners", "error");
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
          await bannerService.deleteBanner(id);
          Swal.fire("Deleted!", "Banner has been deleted.", "success");
          fetchBanners();
        } catch (error) {
          Swal.fire("Error", error.response?.data.message || "Error deleting banner", "error");
        }
      }
    });
  };

  const handleChangeStatus = async (id, status) => {
    console.log("Current status value:", status, "Type:", typeof status);
    
    // Convert string status to boolean for backend
    const newStatus = !isStatusActive(status); // Toggle the status
    
    console.log("New status value:", newStatus, "Type:", typeof newStatus);
    
    Swal.fire({
      title: "Change banner status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log("Updating banner status:", { id, currentStatus: status, newStatus });
          await bannerService.updateBannerStatus(id, newStatus);
          Swal.fire("Updated!", "Banner status updated.", "success");
          fetchBanners();
        } catch (error) {
          console.error("Error updating banner status:", error);
          console.error("Error response:", error.response);
          console.error("Error data:", error.response?.data);
          Swal.fire("Error", error.response?.data?.message || "Failed to update status!", "error");
        }
      }
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const filtered = bannerData.filter(banner => {
      const matchesTitle = banner.title?.toLowerCase().includes(searchTermTitle.toLowerCase());
      const matchesSection = banner.section?.toLowerCase().includes(searchTermSection.toLowerCase());
      const matchesPage = banner.page?.toLowerCase().includes(searchTermPage.toLowerCase());
      
      // Handle both string and boolean status values
      let statusMatches = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'Y') {
          statusMatches = isStatusActive(banner.status);
        } else if (statusFilter === 'N') {
          statusMatches = !isStatusActive(banner.status);
        }
      }

      return matchesTitle && matchesSection && matchesPage && statusMatches;
    });

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchTermTitle('');
    setSearchTermSection('');
    setSearchTermPage('');
    setStatusFilter('all');
    setFilteredData(bannerData);
  };

  const exportToExcel = () => {
    const exportData = filteredData.map(banner => ({
      Title: banner.title || '',
      Subtitle: banner.subtitle || '',
      Position: banner.position || '',
      Section: banner.section || '',
      Page: banner.page || '',
      'Start Date': banner.start_date ? new Date(banner.start_date).toLocaleDateString() : '',
      'End Date': banner.end_date ? new Date(banner.end_date).toLocaleDateString() : '',
      Status: isStatusActive(banner.status) ? 'Active' : 'Inactive',
      'Created Date': banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Banners");
    XLSX.writeFile(wb, "banners.xlsx");
  };

  const handleViewBanner = (banner) => {
    const getStatusIcon = (status) => {
      return status === "Y" ? "✅" : "❌";
    };

    const getStatusColor = (status) => {
      return status === "Y" ? "#10B981" : "#EF4444";
    };

    const createdDate = banner.createdAt
      ? new Date(banner.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'N/A';

    const startDate = banner.start_date
      ? new Date(banner.start_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })
      : 'N/A';

    const endDate = banner.end_date
      ? new Date(banner.end_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })
      : 'N/A';

    const statusColor = getStatusColor(banner.status);
    const statusIcon = getStatusIcon(banner.status);

    Swal.fire({
      title: `<div class="user-popup-header">
        <div class="user-header-icon">🖼️</div>
        <div class="user-header-content">
          <h3>Banner Details</h3>
          <p>Complete information about this banner</p>
        </div>
      </div>`,
      html: `
        <div class="user-popup-body">
          <!-- Status Banner -->
          <div class="user-status-banner" style="background: linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}25 100%); border-left: 4px solid ${statusColor};">
            <div class="status-icon">${statusIcon}</div>
            <div class="status-info">
              <h4>${banner.status === "Y" ? 'Active' : 'Inactive'}</h4>
              <p>Current Status</p>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="user-content-grid">
            <!-- Banner Information Section -->
            <div class="user-section">
              <div class="section-header">
                <div class="section-icon">🖼️</div>
                <h4>Banner Information</h4>
              </div>
              <div class="section-content">
                <div class="info-item">
                  <label>Title</label>
                  <span>${banner.title || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Subtitle</label>
                  <span>${banner.subtitle || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Position</label>
                  <span>${banner.position || 'N/A'}</span>
                </div>
              </div>
            </div>

            <!-- Location Information Section -->
            <div class="user-section">
              <div class="section-header">
                <div class="section-icon">📍</div>
                <h4>Location Information</h4>
              </div>
              <div class="section-content">
                <div class="info-item">
                  <label>Section</label>
                  <span>${banner.section || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Page</label>
                  <span>${banner.page || 'N/A'}</span>
                </div>
              </div>
            </div>

            <!-- Date Information Section -->
            <div class="user-section" style="grid-column: 1 / -1;">
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
                <div class="info-item">
                  <label>Created Date</label>
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
            word-break: break-word;
            text-align: right;
            max-width: 60%;
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
            
            .info-item span {
              max-width: 100%;
              text-align: left;
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

  const handleAddBanner = () => {
    navigate("/admin/banners/add");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Loader />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-pageContent">
        <div className="admin-mb-6">
          <div className="admin-d-flex admin-justify-between admin-align-center admin-mb-4">
            <h2 className="admin-text-2xl admin-font-semibold admin-text-heading-color">Banner Management</h2>
            <button onClick={handleAddBanner} className="admin-btn admin-btn-success admin-btn-md">Add Banner</button>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="d-flex gap-3 align-items-end mb-4 form-no-wrap">
          <div className="form-group form-group-flex">
            <input
              type="text"
              className="form-control"
              placeholder="Search by title..."
              value={searchTermTitle}
              onChange={(e) => setSearchTermTitle(e.target.value)}
            />
          </div>
          <div className="form-group form-group-flex">
            <input
              type="text"
              className="form-control"
              placeholder="Search by section..."
              value={searchTermSection}
              onChange={(e) => setSearchTermSection(e.target.value)}
            />
          </div>
          <div className="form-group form-group-flex">
            <input
              type="text"
              className="form-control"
              placeholder="Search by page..."
              value={searchTermPage}
              onChange={(e) => setSearchTermPage(e.target.value)}
            />
          </div>
          <div className="form-group form-group-flex">
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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

        {filteredData.length === 0 ? (
          <div className="admin-empty-state">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3>No banners found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="admin-overflow-x-auto">
            <table className="admin-table">
              <thead className="admin-table-header">
                <tr>
                  {[
                    "S NO",
                    "Title",
                    "Subtitle",
                    "Position",
                    "Section",
                    "Page",
                    "Start Date",
                    "End Date",
                    "Status",
                    "Created Date",
                    "Actions"
                  ].map((header, index) => (
                    <th key={index}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((banner, index) => (
                  <tr key={banner._id} className="text-center">
                    <td>{index + 1}</td>
                    <td className="font-medium">{banner.title || 'N/A'}</td>
                    <td className="email-cell">{banner.subtitle || 'N/A'}</td>
                    <td>{banner.position || 'N/A'}</td>
                    <td>{banner.section || 'N/A'}</td>
                    <td>{banner.page || 'N/A'}</td>
                    <td>
                      {banner.start_date ? (
                        <Moment format="MMM DD, YYYY">{new Date(banner.start_date)}</Moment>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      {banner.end_date ? (
                        <Moment format="MMM DD, YYYY">{new Date(banner.end_date)}</Moment>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      <div className="admin-d-flex admin-justify-center admin-align-center">
                        <div
                          className={`admin-toggle-switch ${isStatusActive(banner.status) ? 'active' : 'inactive'}`}
                          onClick={() => handleChangeStatus(banner._id, banner.status)}
                        >
                          <div className="admin-toggle-knob">
                            {isStatusActive(banner.status) ? (
                              <span className="admin-toggle-knob-icon active">✓</span>
                            ) : (
                              <span className="admin-toggle-knob-icon inactive">✗</span>
                            )}
                          </div>
                        </div>
                        <span className={`admin-toggle-label ${isStatusActive(banner.status) ? 'active' : 'inactive'}`}>
                          {isStatusActive(banner.status) ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td>
                      {banner.createdAt ? (
                        <Moment format="MMMM Do YYYY">{new Date(banner.createdAt)}</Moment>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      <div className="admin-actions-container">
                        <button
                          onClick={() => handleViewBanner(banner)}
                          title="View Details"
                          className="admin-btn-action-icon admin-btn-view"
                        >
                          <BiShow className="admin-action-icon-svg" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/banners/edit/${banner._id}`)}
                          title="Edit Banner"
                          className="admin-btn-action-icon admin-btn-edit"
                        >
                          <BsPencil className="admin-action-icon-svg" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          title="Delete Banner"
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

export default BannerIndex;
