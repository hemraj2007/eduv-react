import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import Moment from "react-moment";
import * as XLSX from "xlsx";
import faqService from "../../services/faqService";
import { Eye, Trash2, Edit, Plus, FileSpreadsheet, Search, RotateCcw } from "lucide-react";
import Loader from "../../components/Loader";
import 'animate.css';
import '../../style/admin-style.css';

const FaqIndex = () => {
  const [faqData, setFaqData] = useState([]);
  const [searchTermQuestion, setSearchTermQuestion] = useState('');
  const [searchTermCategory, setSearchTermCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFaqs, setTotalFaqs] = useState(0);
  const [faqsPerPage, setFaqsPerPage] = useState(25);
  const [paginationData, setPaginationData] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFaqs();
    fetchTotalCount();
  }, []);

  const fetchTotalCount = async () => {
    try {
      const response = await faqService.getTotalFaqCount();
      console.log('Total Count API Response:', response);
      
      if (response.success && response.count) {
        setTotalFaqs(response.count);
      } else if (response.count) {
        setTotalFaqs(response.count);
      } else if (response.total) {
        setTotalFaqs(response.total);
      } else if (response.totalFaqs) {
        setTotalFaqs(response.totalFaqs);
      } else {
        console.log('Using fallback count of 15');
        setTotalFaqs(15);
      }
    } catch (error) {
      console.error("Error fetching total FAQ count:", error);
      console.log('Using fallback count of 15 due to API error');
      setTotalFaqs(15);
    }
  };

  useEffect(() => {
    setFilteredData(faqData);
  }, [faqData]);

  const fetchFaqs = async (page = currentPage, pageSize = faqsPerPage) => {
    setIsLoading(true);
    try {
      const response = await faqService.getAllFaqs(page, pageSize);
      
      console.log('API Response:', response);
      
      let faqs = [];
      let pagination = {};
      let totalCount = 0;
      
      if (response.success) {
        faqs = Array.isArray(response.data) ? response.data : [];
        pagination = response.pagination || {};
        totalCount = response.totalFaqs || response.total || response.count || 0;
      } else if (response.data) {
        faqs = Array.isArray(response.data) ? response.data : [];
        pagination = response.pagination || {};
        totalCount = response.totalFaqs || response.total || response.count || 0;
      } else {
        faqs = Array.isArray(response) ? response : [];
        pagination = {};
        totalCount = 0;
      }
      
      // Sort FAQs by createdAt in descending order (newest first)
      const sortedFaqs = faqs.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      setFaqData(sortedFaqs);
      setPaginationData(pagination);
      
      setCurrentPage(pagination.currentPage || page);
      setTotalPages(pagination.totalPages || Math.ceil(totalCount / pageSize) || 1);
      
      if (totalCount > 0) {
        setTotalFaqs(totalCount);
      }
      
      setFaqsPerPage(pagination.faqsPerPage || pageSize);
      
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setFaqData([]);
      setPaginationData({});
      setTotalFaqs(0);
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
          await faqService.deleteFaq(id);
          Swal.fire("Deleted!", "FAQ has been deleted.", "success");
          fetchFaqs();
        } catch (error) {
          Swal.fire("Error", error.response?.data.message || "Error deleting FAQ", "error");
        }
      }
    });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Y" ? "N" : "Y";
    const statusText = newStatus === "Y" ? "activate" : "deactivate";
    
    Swal.fire({
      title: `Are you sure?`,
      text: `You are about to ${statusText} this FAQ!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${statusText} it!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await faqService.changeFaqStatus(id, newStatus);
          Swal.fire(
            "Updated!", 
            `FAQ has been ${newStatus === "Y" ? "activated" : "deactivated"} successfully.`, 
            "success"
          );
          fetchFaqs();
        } catch (error) {
          Swal.fire(
            "Error!",
            error.response?.data?.message || "Failed to update FAQ status",
            "error"
          );
        }
      }
    });
  };

  const handleChangeStatus = async (id, status) => {
    Swal.fire({
      title: "Change FAQ status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await faqService.changeFaqStatus(id, status);
          Swal.fire("Updated!", "FAQ status updated.", "success");
          fetchFaqs();
        } catch (error) {
          Swal.fire("Error", "Failed to update status!", "error");
        }
      }
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const filtered = faqData.filter(faq => {
      const questionMatch = searchTermQuestion === '' || faq.question?.toLowerCase().includes(searchTermQuestion.toLowerCase());
      const categoryMatch = searchTermCategory === '' || faq.category?.toLowerCase().includes(searchTermCategory.toLowerCase());
      const statusMatch = statusFilter === 'all' || faq.status === statusFilter;

      return questionMatch && categoryMatch && statusMatch;
    });

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchTermQuestion('');
    setSearchTermCategory('');
    setStatusFilter('all');
    setFilteredData(faqData);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchFaqs(page);
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
    setFaqsPerPage(newPageSize);
    setCurrentPage(1);
    fetchFaqs(1, newPageSize);
  };

  // Pagination component
  const renderPagination = () => {
    // Show pagination if there are FAQs and more than 1 page, or if we want to show page size selector
    if (totalFaqs === 0) return null;

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
    const startNumber = ((currentPage - 1) * faqsPerPage) + 1;
    const endNumber = Math.min(currentPage * faqsPerPage, totalFaqs);
    
    // Handle edge cases
    const displayStart = totalFaqs > 0 ? startNumber : 0;
    const displayEnd = totalFaqs > 0 ? endNumber : 0;
    
    // Ensure we don't show invalid ranges
    const finalStart = displayStart > totalFaqs ? 0 : displayStart;
    const finalEnd = displayEnd > totalFaqs ? totalFaqs : displayEnd;

    return (
      <div className={`admin-dashboard-pagination`}>
        <div className="admin-dashboard-pagination-info">
          <span>
            Showing {finalStart} to {finalEnd} of {totalFaqs} FAQs
          </span>
        </div>
        
        <div className="admin-dashboard-pagination-size-selector">
          <label htmlFor="pageSizeSelect" className="admin-dashboard-page-size-label">
            Show:
          </label>
          <select
            id="pageSizeSelect"
            value={faqsPerPage}
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

  const handleViewFaq = (faq) => {
    const getStatusIcon = (status) => {
      return status === "Y" ? "✅" : "❌";
    };

    const getStatusColor = (status) => {
      return status === "Y" ? "#10b981" : "#ef4444";
    };

    const createdDate = faq.createdAt
      ? new Date(faq.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'N/A';

    const updatedDate = faq.updatedAt
      ? new Date(faq.updatedAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'N/A';

    const statusColor = getStatusColor(faq.status);
    const statusIcon = getStatusIcon(faq.status);

    Swal.fire({
      title: `<div class="admin-dashboard-user-popup-header">
        <div class="admin-dashboard-user-popup-header-icon">❓</div>
        <div class="admin-dashboard-user-popup-header-content">
          <h3 class="admin-dashboard-user-popup-title">FAQ Details</h3>
          <p class="admin-dashboard-user-popup-subtitle">Complete information about this FAQ</p>
        </div>
      </div>`,
      html: `
        <div class="admin-dashboard-user-popup-body">
          <div class="admin-dashboard-user-popup-status-banner" style="background: linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}25 100%); border-left: 4px solid ${statusColor};">
            <div class="admin-dashboard-user-popup-status-icon">${statusIcon}</div>
            <div class="admin-dashboard-user-popup-status-info">
              <h4>${faq.status === "Y" ? 'Active' : 'Inactive'}</h4>
              <p>Current Status</p>
            </div>
          </div>
          <div class="admin-dashboard-user-popup-content-grid">
            <div class="admin-dashboard-user-popup-section">
              <div class="admin-dashboard-user-popup-section-header">
                <div class="admin-dashboard-user-popup-section-icon">❓</div>
                <h4>Question</h4>
              </div>
              <div class="admin-dashboard-user-popup-section-content">
                <div class="admin-dashboard-user-popup-info-item">
                  <span>${faq.question || 'N/A'}</span>
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
                  <label>Category</label>
                  <span>${faq.category || 'N/A'}</span>
                </div>
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
                <div class="admin-dashboard-user-popup-section-icon">💬</div>
                <h4>Answer</h4>
              </div>
              <div class="admin-dashboard-user-popup-section-content">
                <div class="admin-dashboard-user-popup-info-item">
                  <span>${faq.answer || 'Not Provided'}</span>
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
      }
    });
  };

  const exportToExcel = () => {
    const dataToExport = filteredData.map((faq, index) => ({
      'S NO': index + 1,
      'Question': faq.question || 'N/A',
      'Answer': faq.answer || 'N/A',
      'Category': faq.category || 'N/A',
      'Status': faq.status === "Y" ? "Active" : "Inactive",
      'Created Date': faq.createdAt ? new Date(faq.createdAt).toLocaleDateString() : 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FAQs");
    XLSX.writeFile(wb, "faqs_data.xlsx");
  };

  const handleAddFaq = () => {
    navigate("/admin/faq/add");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-loader-container">
          <div className="admin-dashboard-loader"></div>
          <h3>Loading FAQs</h3>
          <p>Please wait...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard-pageContent">
        <div className="admin-dashboard-mb-6 animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-d-flex admin-dashboard-justify-between admin-dashboard-align-center admin-dashboard-mb-4">
            <h2 className="admin-dashboard-text-2xl admin-dashboard-font-semibold admin-dashboard-text-heading-color animated animate__animated animate__slideInLeft">FAQ Management</h2>
            <div className="admin-dashboard-d-flex admin-dashboard-gap-2">
              <button onClick={exportToExcel} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <FileSpreadsheet size={18} className="admin-dashboard-btn-icon" />
                Export to Excel
              </button>
              <button onClick={handleAddFaq} className="admin-dashboard-btn admin-dashboard-btn-primary admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <Plus size={18} className="admin-dashboard-btn-icon" />
                Add FAQ
              </button>
            </div>
          </div>
        </div>

        <div className="admin-dashboard-search-form animated animate__animated animate__fadeInUp">
          <form onSubmit={handleSearchSubmit} className="admin-dashboard-search-form-content">
            <div className="admin-dashboard-search-input-group">
              <label className="admin-dashboard-search-form-label">Question</label>
              <input
                type="text"
                className="admin-dashboard-search-input"
                placeholder="Search by question..."
                value={searchTermQuestion}
                onChange={(e) => setSearchTermQuestion(e.target.value)}
              />
            </div>
            <div className="admin-dashboard-search-input-group">
              <label className="admin-dashboard-search-form-label">Category</label>
              <input
                type="text"
                className="admin-dashboard-search-input"
                placeholder="Search by category..."
                value={searchTermCategory}
                onChange={(e) => setSearchTermCategory(e.target.value)}
              />
            </div>
            <div className="admin-dashboard-search-input-group">
              <label className="admin-dashboard-search-form-label">Status</label>
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
            <h3>No FAQs found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="admin-dashboard-overflow-x-auto animated animate__animated animate__fadeInUp">
            <table className="admin-dashboard-table">
              <thead className="admin-dashboard-table-header">
                <tr>
                  {[
                    "S NO",
                    "Question",
                    "Category",
                    "Status",
                    "Created Date",
                    "Actions"
                  ].map((header, index) => (
                    <th key={index} className={header === "S NO" ? "admin-dashboard-sno-column" : header === "Question" ? "admin-dashboard-name-column" : ""}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((faq, index) => (
                  <tr key={faq._id} className="admin-dashboard-table-row animated animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="admin-dashboard-sno-cell">{((currentPage - 1) * faqsPerPage) + index + 1}</td>
                    <td className="admin-dashboard-name-cell">
                      <div className="admin-dashboard-user-info">
                        <div className="admin-dashboard-user-name">{faq.question || 'N/A'}</div>
                        <div className="admin-dashboard-user-email">{faq.answer ? (faq.answer.length > 50 ? faq.answer.substring(0, 50) + '...' : faq.answer) : 'N/A'}</div>
                      </div>
                    </td>
                    <td>{faq.category || 'N/A'}</td>
                    <td className="admin-dashboard-status-cell">
                      <span className={`admin-dashboard-status-text ${faq.status === "Y" ? 'active' : 'inactive'}`}>
                        {faq.status === "Y" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="admin-dashboard-date-cell">
                      {faq.createdAt ? (
                        <Moment format="MMMM Do YYYY">{new Date(faq.createdAt)}</Moment>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="admin-dashboard-actions-cell">
                      <div className="admin-dashboard-actions-container">
                        <button
                          onClick={() => navigate(`/admin/faq/edit/${faq._id}`)}
                          title="Edit FAQ"
                          className="admin-dashboard-btn-action-icon admin-dashboard-btn-edit"
                        >
                          <Edit size={14} className="admin-dashboard-action-icon-svg" />
                        </button>
                        <div
                          className={`admin-dashboard-toggle-switch ${faq.status === "Y" ? 'active' : 'inactive'}`}
                          onClick={() => handleChangeStatus(faq._id, faq.status)}
                          title={`Toggle ${faq.status === "Y" ? "Inactive" : "Active"}`}
                        >
                          <div className="admin-dashboard-toggle-knob">
                            {faq.status === "Y" ? (
                              <span className="admin-dashboard-toggle-knob-icon active">✓</span>
                            ) : (
                              <span className="admin-dashboard-toggle-knob-icon inactive">✗</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(faq._id)}
                          title="Delete FAQ"
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

export default FaqIndex;
