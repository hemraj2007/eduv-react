import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import staticPageService from "../../services/staticPageService";
import { FileSpreadsheet, Search, RotateCcw, Eye, Edit, Trash2 } from "lucide-react";
import Loader from "../../components/Loader";
import "../../style/admin-style.css";
import "animate.css";

const StaticPageIndex = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pagesPerPage, setPagesPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch pages whenever currentPage or pagesPerPage changes
  useEffect(() => {
    fetchPages(currentPage, pagesPerPage);
    fetchTotalCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pagesPerPage]);

  // Filter data when pages or searchTerm changes
  useEffect(() => {
    filterData();
  }, [pages, searchTerm]);

  const fetchPages = async (page = 1, limit = 10, retryCount = 0) => {
    setIsLoading(true);
    try {
      const res = await staticPageService.getAllStaticPages(page, limit);
      // Check for response data structure and fallbacks
      const pageData = res?.data || [];
      setPages(pageData);
      console.debug("Fetched pages:", pageData);
    } catch (error) {
      if (error.response && error.response.status === 500 && retryCount < 3) {
        console.log(`Retrying fetchPages (attempt ${retryCount + 1})...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchPages(page, limit, retryCount + 1);
      }
      console.error("Error fetching static pages:", error.message);
      setPages([]);
      if (retryCount >= 3) {
        Swal.fire("Error", "Failed to fetch static pages. Please try again later.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTotalCount = async (retryCount = 0) => {
    try {
      const res = await staticPageService.getTotalPageCount();
      // Support multiple response key possibilities for count
      const count =
        res?.count ?? res?.total ?? res?.totalPages ?? 0;
      setTotalCount(count);
      setTotalPages(Math.max(1, Math.ceil(count / pagesPerPage)));
      console.debug("Total count:", count);
    } catch (error) {
      if (error.response && error.response.status === 500 && retryCount < 3) {
        console.log(`Retrying fetchTotalCount (attempt ${retryCount + 1})...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchTotalCount(retryCount + 1);
      }
      console.error("Error fetching total count:", error.message);
      setTotalCount(0);
      setTotalPages(1);
    }
  };

  const filterData = () => {
    let filtered = [...pages];
    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (page) =>
          (page.title?.toLowerCase().includes(lowerTerm)) ||
          (page.slug?.toLowerCase().includes(lowerTerm))
      );
    }
    setFilteredData(filtered);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the static page.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await staticPageService.deleteStaticPage(id);
          Swal.fire("Deleted!", "Static page deleted.", "success");
          fetchPages(currentPage, pagesPerPage);
          fetchTotalCount();
        } catch (error) {
          Swal.fire("Error", "Failed to delete static page", "error");
        }
      }
    });
  };

  const handleChangeStatus = async (id, status) => {
    try {
      await staticPageService.updateStaticPage(id, { status: status === "Y" ? "N" : "Y" });
      Swal.fire("Updated!", "Status updated.", "success");
      fetchPages(currentPage, pagesPerPage);
    } catch (error) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const handleView = (page) => {
    Swal.fire({
      title: `<div class="admin-dashboard-user-popup-header">
        <div class="admin-dashboard-user-popup-header-icon">📄</div>
        <div class="admin-dashboard-user-popup-header-content">
          <h3 class="admin-dashboard-user-popup-title">${page.title}</h3>
          <p class="admin-dashboard-user-popup-subtitle">${page.slug}</p>
        </div>
      </div>`,
      html: `
        <div class="admin-dashboard-user-popup-body">
          <div class="admin-dashboard-user-popup-status-banner" style="background: linear-gradient(135deg, #00BCD415 0%, #00BCD425 100%); border-left: 4px solid #00BCD4;">
            <div class="admin-dashboard-user-popup-status-icon">${page.status === "Y" ? "✅" : "❌"}</div>
            <div class="admin-dashboard-user-popup-status-info">
              <h4>${page.status === "Y" ? "Active" : "Inactive"}</h4>
              <p>Status</p>
            </div>
          </div>
          <div class="admin-dashboard-user-popup-content-grid">
            <div class="admin-dashboard-user-popup-section" style="grid-column: 1 / -1;">
              <div class="admin-dashboard-user-popup-section-header">
                <div class="admin-dashboard-user-popup-section-icon">📝</div>
                <h4>Content</h4>
              </div>
              <div class="admin-dashboard-user-popup-section-content">
                <div class="admin-dashboard-user-popup-info-item">
                  <span style="white-space:pre-line; text-align:left; width:100%;">${page.content}</span>
                </div>
              </div>
            </div>
          </div>
        </div>`,
      width: "750px",
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: "admin-dashboard-user-popup",
        title: "admin-dashboard-user-popup-title",
        htmlContainer: "admin-dashboard-user-popup-html",
      },
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    filterData();
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilteredData(pages);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPagesPerPage(size);
    setCurrentPage(1); // Reset to first page
  };

  const renderPagination = () => {
    const total = totalCount;
    const startNumber = ((currentPage - 1) * pagesPerPage) + 1;
    const endNumber = Math.min(currentPage * pagesPerPage, total);
    const displayStart = total > 0 ? startNumber : 0;
    const displayEnd = total > 0 ? endNumber : 0;
    const finalStart = displayStart > total ? 0 : displayStart;
    const finalEnd = displayEnd > total ? total : displayEnd;
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

    return (
      <div className="admin-dashboard-pagination">
        <div className="admin-dashboard-pagination-info">
          <span>
            Showing {finalStart} to {finalEnd} of {total} pages
          </span>
        </div>
        <div className="admin-dashboard-pagination-size-selector">
          <label htmlFor="pageSizeSelect" className="admin-dashboard-page-size-label">Show:</label>
          <select
            id="pageSizeSelect"
            value={pagesPerPage}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="admin-dashboard-page-size-select"
          >
            {[10, 25, 50, 75, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="admin-dashboard-page-size-text">per page</span>
        </div>
        <div className="admin-dashboard-pagination-controls">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="admin-dashboard-pagination-btn"
            title="First Page"
          >
            ««
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="admin-dashboard-pagination-btn"
            title="Previous Page"
          >
            «
          </button>
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`admin-dashboard-pagination-btn ${currentPage === pageNum ? "active" : ""}`}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="admin-dashboard-pagination-btn"
            title="Next Page"
          >
            »
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-loading-container">
          <Loader />
          <p>Loading static pages...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard-pageContent">
        <div className="admin-dashboard-mb-6 animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-d-flex admin-dashboard-justify-between admin-dashboard-align-center admin-dashboard-mb-4">
            <h2 className="admin-dashboard-text-2xl admin-dashboard-font-semibold admin-dashboard-text-heading-color animated animate__animated animate__slideInLeft">
              Static Page Management
            </h2>
            <div className="admin-dashboard-d-flex admin-dashboard-gap-2">
              <button
                onClick={() => navigate("/admin/static-page/add")}
                className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight"
              >
                <Edit size={18} className="admin-dashboard-btn-icon" />
                Add Page
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
                placeholder="Search by title or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="48" height="48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3>No static pages found</h3>
            <p>Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="admin-dashboard-overflow-x-auto animated animate__animated animate__fadeInUp">
            <table className="admin-dashboard-table">
              <thead className="admin-dashboard-table-header">
                <tr>
                  <th className="admin-dashboard-sno-column">S NO</th>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((page, index) => (
                  <tr
                    key={page._id}
                    className="admin-dashboard-table-row animated animate__animated animate__fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="admin-dashboard-sno-cell">{(currentPage - 1) * pagesPerPage + index + 1}</td>
                    <td>{page.title}</td>
                    <td>{page.slug}</td>
                    <td>
                      <span className={`admin-dashboard-status-text ${page.status === "Y" ? "active" : "inactive"}`}>
                        {page.status === "Y" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {page.createdAt
                        ? new Date(page.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="admin-dashboard-actions-cell">
                      <div className="admin-dashboard-actions-container">
                        <button
                          onClick={() => handleView(page)}
                          title="View"
                          className="admin-dashboard-btn-action-icon admin-dashboard-btn-view"
                          type="button"
                        >
                          <Eye size={14} className="admin-dashboard-action-icon-svg" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/static-page/edit/${page._id}`)}
                          title="Edit"
                          className="admin-dashboard-btn-action-icon admin-dashboard-btn-edit"
                          type="button"
                        >
                          <Edit size={14} className="admin-dashboard-action-icon-svg" />
                        </button>
                        <div
                          className={`admin-dashboard-toggle-switch ${page.status === "Y" ? "active" : "inactive"}`}
                          onClick={() => handleChangeStatus(page._id, page.status)}
                          title={`Toggle ${page.status === "Y" ? "Inactive" : "Active"}`}
                          role="button"
                          tabIndex={0}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") handleChangeStatus(page._id, page.status);
                          }}
                        >
                          <div className="admin-dashboard-toggle-knob">
                            {page.status === "Y" ? (
                              <span className="admin-dashboard-toggle-knob-icon active">✓</span>
                            ) : (
                              <span className="admin-dashboard-toggle-knob-icon inactive">✗</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(page._id)}
                          title="Delete"
                          className="admin-dashboard-btn-action-icon admin-dashboard-btn-delete"
                          type="button"
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

export default StaticPageIndex;
