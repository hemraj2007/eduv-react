import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import Moment from "react-moment";
import * as XLSX from "xlsx";

import newsletterService from "../../services/newsletterService";
import { Eye, Trash2, Edit, Plus, FileSpreadsheet, Search, RotateCcw } from "lucide-react";
import Loader from "../../components/Loader";
import '../../style/admin-style.css';
import 'animate.css';

const NewsletterIndex = () => {
  const navigate = useNavigate();
  const [newsletterData, setNewsletterData] = useState([]);
  const [searchTermEmail, setSearchTermEmail] = useState("");
  // Remove statusFilter state
  // const [statusFilter, setStatusFilter] = useState("all");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNewsletters, setTotalNewsletters] = useState(0);
  const [newslettersPerPage, setNewslettersPerPage] = useState(10);
  const [paginationData, setPaginationData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNewsletters();
    fetchTotalCount();
  }, [currentPage, newslettersPerPage]);

  useEffect(() => {
    filterData();
  }, [newsletterData, searchTermEmail]); // Remove statusFilter from dependencies

  const fetchTotalCount = async () => {
    try {
      const response = await newsletterService.getTotalNewsletterCount();
      setTotalNewsletters(response.total || 0);
      const totalPages = Math.ceil((response.total || 0) / newslettersPerPage);
      setTotalPages(totalPages);
      generatePaginationData(totalPages);
    } catch (error) {
      console.error("Error fetching total count:", error);
    }
  };

  const fetchNewsletters = async (page = currentPage, pageSize = newslettersPerPage) => {
    try {
      setIsLoading(true);
      const response = await newsletterService.getAllNewsletters(page, pageSize);
      setNewsletterData(response.data || []);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      Swal.fire({
        title: '<div class="admin-dashboard-error-popup-header"><AlertCircle class="admin-dashboard-error-icon" /><span>Error!</span></div>',
        text: "Failed to fetch newsletters",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: 'admin-dashboard-animated-popup admin-dashboard-error-popup',
          title: 'admin-dashboard-error-popup-title',
          confirmButton: 'admin-dashboard-error-popup-btn'
        },
        showClass: {
          popup: 'animate__animated animate__shakeX animate__faster'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...newsletterData];

    // Filter by email
    if (searchTermEmail) {
      filtered = filtered.filter(newsletter =>
        newsletter.email.toLowerCase().includes(searchTermEmail.toLowerCase())
      );
    }

    // Filter by status
    // if (statusFilter !== "all") {
    //   filtered = filtered.filter(newsletter => newsletter.status === statusFilter);
    // }

    setFilteredData(filtered);
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
          await newsletterService.deleteNewsletter(id);
          Swal.fire("Deleted!", "Newsletter has been deleted.", "success");
          fetchNewsletters();
          fetchTotalCount();
        } catch (error) {
          Swal.fire("Error", error.response?.data.message || "Error deleting newsletter", "error");
        }
      }
    });
  };

  // const handleChangeStatus = async (id, status) => {
  //   try {
  //     const newStatus = status === "Y" ? "N" : "Y";
  //     await newsletterService.changeNewsletterStatus(id, newStatus);
      
  //     Swal.fire({
  //       title: '<div class="admin-dashboard-success-popup-header"><CheckCircle class="admin-dashboard-success-icon" /><span>Updated!</span></div>',
  //       text: `Newsletter status has been ${newStatus === "Y" ? "activated" : "deactivated"} successfully`,
  //       icon: "success",
  //       confirmButtonText: "OK",
  //       confirmButtonColor: "#10b981",
  //       customClass: {
  //         popup: 'admin-dashboard-animated-popup admin-dashboard-success-popup',
  //         title: 'admin-dashboard-success-popup-title',
  //         confirmButton: 'admin-dashboard-success-popup-btn'
  //       },
  //       showClass: {
  //         popup: 'animate__animated animate__zoomIn animate__faster'
  //       }
  //     });
      
  //     fetchNewsletters();
  //   } catch (error) {
  //     console.error("Error changing status:", error);
  //     Swal.fire({
  //       title: '<div class="admin-dashboard-error-popup-header"><AlertCircle class="admin-dashboard-error-icon" /><span>Error!</span></div>',
  //       text: error.response?.data?.message || "Failed to update status",
  //       icon: "error",
  //       confirmButtonText: "OK",
  //       confirmButtonColor: "#ef4444",
  //       customClass: {
  //         popup: 'admin-dashboard-animated-popup admin-dashboard-error-popup',
  //         title: 'admin-dashboard-error-popup-title',
  //         confirmButton: 'admin-dashboard-error-popup-btn'
  //       },
  //       showClass: {
  //         popup: 'animate__animated animate__shakeX animate__faster'
  //       }
  //     });
  //   }
  // };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    filterData();
  };

  const handleReset = () => {
    setSearchTermEmail("");
    setFilteredData(newsletterData);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNewsletters(page);
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
    setNewslettersPerPage(newPageSize);
    setCurrentPage(1);
    fetchNewsletters(1, newPageSize);
  };

  const generatePaginationData = (totalPages) => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    setPaginationData(pages);
  };

  const exportToExcel = () => {
    const exportData = filteredData.map((newsletter, index) => ({
      "S.No": ((currentPage - 1) * newslettersPerPage) + index + 1,
      "Email": newsletter.email,
      "Created Date": newsletter.createdAt ? new Date(newsletter.createdAt).toLocaleDateString() : "N/A"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Newsletters");
    XLSX.writeFile(wb, `newsletters_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // const handleViewNewsletter = (newsletter) => {
  //   Swal.fire({
  //     title: "Newsletter Details",
  //     html: `
  //       <div style="text-align: left;">
  //         <p><strong>Email:</strong> ${newsletter.email}</p>
  //         <p><strong>Status:</strong> ${newsletter.status === "Y" ? "Active" : "Inactive"}</p>
  //         <p><strong>Created:</strong> ${newsletter.createdAt ? new Date(newsletter.createdAt).toLocaleDateString() : "N/A"}</p>
  //         <p><strong>Updated:</strong> ${newsletter.updatedAt ? new Date(newsletter.updatedAt).toLocaleDateString() : "N/A"}</p>
  //       </div>
  //     `,
  //     icon: "info",
  //     confirmButtonText: "Close",
  //     confirmButtonColor: "#00BCD4",
  //     customClass: {
  //       popup: 'admin-dashboard-animated-popup',
  //       confirmButton: 'admin-dashboard-btn-styled admin-dashboard-btn-styled-primary'
  //     }
  //   });
  // };

  const renderPagination = () => {
    if (totalNewsletters === 0) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
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
    const startNumber = ((currentPage - 1) * newslettersPerPage) + 1;
    const endNumber = Math.min(currentPage * newslettersPerPage, totalNewsletters);
    const displayStart = totalNewsletters > 0 ? startNumber : 0;
    const displayEnd = totalNewsletters > 0 ? endNumber : 0;
    const finalStart = displayStart > totalNewsletters ? 0 : displayStart;
    const finalEnd = displayEnd > totalNewsletters ? totalNewsletters : displayEnd;

    return (
      <div className={`admin-dashboard-pagination ${totalPages <= 1 ? 'admin-dashboard-pagination-single-page' : ''}`}>
        <div className="admin-dashboard-pagination-info">
          <span>
            Showing {finalStart} to {finalEnd} of {totalNewsletters} newsletters
          </span>
        </div>
        
        <div className="admin-dashboard-pagination-size-selector">
          <label htmlFor="pageSizeSelect" className="admin-dashboard-page-size-label">
            Show:
          </label>
          <select
            id="pageSizeSelect"
            value={newslettersPerPage}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="admin-dashboard-page-size-select"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={75}>75</option>
            <option value={100}>100</option>
          </select>
          <span className="admin-dashboard-page-size-text">per page</span>
        </div>
        
        {totalPages > 1 && (
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
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-loading-container">
          <Loader />
          <p>Loading newsletters...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard-pageContent">
        <div className="admin-dashboard-mb-6 animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-d-flex admin-dashboard-justify-between admin-dashboard-align-center admin-dashboard-mb-4">
            <h2 className="admin-dashboard-text-2xl admin-dashboard-font-semibold admin-dashboard-text-heading-color animated animate__animated animate__slideInLeft">Newsletter Management</h2>
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
                placeholder="Search by email..."
                value={searchTermEmail}
                onChange={(e) => setSearchTermEmail(e.target.value)}
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
            <h3>No newsletters found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="admin-dashboard-overflow-x-auto animated animate__animated animate__fadeInUp">
            <table className="admin-dashboard-table">
              <thead className="admin-dashboard-table-header">
                <tr>
                  {[
                    "S NO",
                    "Email",
                    "Created Date",
                    "Actions"
                  ].map((header, index) => (
                    <th key={index} className={header === "S NO" ? "admin-dashboard-sno-column" : ""}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((newsletter, index) => (
                  <tr key={newsletter._id} className="admin-dashboard-table-row animated animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="admin-dashboard-sno-cell">{((currentPage - 1) * newslettersPerPage) + index + 1}</td>
                    <td className="admin-dashboard-name-cell">
                      <div className="admin-dashboard-user-info">
                        <div className="admin-dashboard-user-name">{newsletter.email}</div>
                      </div>
                    </td>
                    <td className="admin-dashboard-date-cell">
                      {newsletter.createdAt ? (
                        <Moment format="MMMM Do YYYY">{new Date(newsletter.createdAt)}</Moment>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="admin-dashboard-actions-cell">
                      <div className="admin-dashboard-actions-container">
                        {/* <button
                          onClick={() => handleViewNewsletter(newsletter)}
                          title="View Details"
                          className="admin-dashboard-btn-action-icon admin-dashboard-btn-view"
                        >
                          <Eye size={14} className="admin-dashboard-action-icon-svg" />
                        </button> */}
                       
                        {/* <div
                          className={`admin-dashboard-toggle-switch ${newsletter.status === "Y" ? 'active' : 'inactive'}`}
                          onClick={() => handleChangeStatus(newsletter._id, newsletter.status)}
                          title={`Toggle ${newsletter.status === "Y" ? "Inactive" : "Active"}`}
                        >
                          <div className="admin-dashboard-toggle-knob">
                            {newsletter.status === "Y" ? (
                              <span className="admin-dashboard-toggle-knob-icon active">✓</span>
                            ) : (
                              <span className="admin-dashboard-toggle-knob-icon inactive">✗</span>
                            )}
                          </div>
                        </div> */}
                        <button
                          onClick={() => handleDelete(newsletter._id)}
                          title="Delete Newsletter"
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
        
        {renderPagination()}
      </div>
    </AdminLayout>
  );
};

export default NewsletterIndex; 