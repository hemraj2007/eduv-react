import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { feeManagementService, studentService, courseService } from "../../services";
import { FaFileInvoice, FaUser, FaBook, FaMoneyBillWave, FaCalendarAlt, FaReceipt, FaEdit } from "react-icons/fa";
import { FileSpreadsheet, Plus, Search, RotateCcw, Eye, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Loader from "../../components/Loader";
import { Modal } from "react-bootstrap";
import Moment from "react-moment";
import 'animate.css';
import '../../style/admin-style.css';


const FeeManagementIndex = () => {
  const [assignmentData, setAssignmentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTermStudent, setSearchTermStudent] = useState("");
  const [searchTermCourse, setSearchTermCourse] = useState("");
  const [searchTermReceipt, setSearchTermReceipt] = useState("");
  const [searchTermPaymentStatus, setSearchTermPaymentStatus] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [assignmentsPerPage, setAssignmentsPerPage] = useState(25);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments(currentPage, assignmentsPerPage);
  }, [currentPage, assignmentsPerPage]);

  useEffect(() => {
    setFilteredData(assignmentData);
  }, [assignmentData]);

  const fetchAssignments = async (page = 1, pageSize = 25) => {
    setIsLoading(true);
    try {
      // Fetch assignments with pagination
      const response = await feeManagementService.getAllAssignments(page, pageSize);
      // Assuming response is an array directly from your API
      let assignments = Array.isArray(response) ? response : [];

      // If mobile numbers are not included, fetch them separately
      if (assignments.length > 0 && !assignments[0].student_id?.mobile) {
        try {
          // Fetch all students to get mobile numbers
          const studentsResponse = await studentService.getAllStudents();
          const students = studentsResponse?.students || [];

          // Create a map of student ID to student data
          const studentMap = {};
          students.forEach(student => {
            studentMap[student._id] = student;
          });

          // Merge student data with assignments
          assignments = assignments.map(assignment => ({
            ...assignment,
            student_id: {
              ...assignment.student_id,
              mobile: studentMap[assignment.student_id?._id]?.mobile || "N/A"
            }
          }));
        } catch (studentError) {
          console.error("Error fetching student details:", studentError);
        }
      }

      // Sort assignments by createdAt in descending order (newest first)
      const sortedAssignments = assignments.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order (newest first)
      });

      // Set total assignments count
      setTotalAssignments(sortedAssignments.length);

      // Calculate total pages
      const calculatedTotalPages = Math.ceil(sortedAssignments.length / pageSize);
      setTotalPages(calculatedTotalPages);

      // Paginate the data
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedAssignments = sortedAssignments.slice(startIndex, endIndex);

      setAssignmentData(sortedAssignments); // Keep the full data for filtering
      setFilteredData(paginatedAssignments); // Set the paginated data for display
    } catch (error) {
      console.error("Error fetching assignments:", error);
      Swal.fire("Error", "Failed to fetch assignments", "error");
      setAssignmentData([]);
      setFilteredData([]);
      setTotalAssignments(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const filtered = assignmentData.filter((assignment) => {
      const studentMatch =
        searchTermStudent === "" ||
        assignment.student_id?.name?.toLowerCase().includes(searchTermStudent.toLowerCase());

      const courseMatch =
        searchTermCourse === "" ||
        assignment.course_id?.[0]?.name?.toLowerCase().includes(searchTermCourse.toLowerCase());

      const receiptMatch =
        searchTermReceipt === "" ||
        assignment.paymentReference?.toLowerCase().includes(searchTermReceipt.toLowerCase());

      const paymentStatusMatch =
        searchTermPaymentStatus === "" ||
        (searchTermPaymentStatus === "paid" && Number(assignment.pendingAmount) === 0) ||
        (searchTermPaymentStatus === "pending" && Number(assignment.pendingAmount) > 0);

      return studentMatch && courseMatch && receiptMatch && paymentStatusMatch;
    });

    // Update total count for pagination
    setTotalAssignments(filtered.length);
    setTotalPages(Math.ceil(filtered.length / assignmentsPerPage));

    // Reset to first page when applying new filters
    setCurrentPage(1);

    // Apply pagination to filtered data
    const startIndex = 0; // Start from first page
    const endIndex = assignmentsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    setFilteredData(paginatedData);
  };

  const handleReset = () => {
    setSearchTermStudent("");
    setSearchTermCourse("");
    setSearchTermReceipt("");
    setSearchTermPaymentStatus("");
    setCurrentPage(1);
    setTotalAssignments(assignmentData.length);
    setTotalPages(Math.ceil(assignmentData.length / assignmentsPerPage));

    // Apply pagination to reset data
    const startIndex = 0; // Start from first page
    const endIndex = assignmentsPerPage;
    const paginatedData = assignmentData.slice(startIndex, endIndex);

    setFilteredData(paginatedData);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredData.map((assignment) => ({
        "Student Name": assignment.student_id?.name || "N/A",
        "Email": assignment.student_id?.email || "N/A",
        "Course": assignment.course_id?.[0]?.name || "N/A",
        "Total Fee": assignment.totalFee || 0,
        "Additional Discount": assignment.additionalDiscount || 0,
        "Paid Amount": assignment.paidAmount || 0,
        "Pending Amount": assignment.pendingAmount || 0,
        "Create Date": assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString('en-GB') : "N/A",
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fee Assignments");
    XLSX.writeFile(wb, "fee-assignments.xlsx");
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setShowViewModal(true);
  };

  const handleShowReceipt = (assignment) => {
    const student = assignment.student_id || {};
    const course = assignment.course_id?.[0] || {};

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const receiptHtml = `
      <div class="receipt-popup-container">
        <!-- Receipt Header -->
        <div class="admin-dashboard-user-popup-header">
          <div class="admin-dashboard-user-popup-header-icon">
            <i class="fas fa-receipt"></i>
          </div>
          <div class="admin-dashboard-user-popup-header-content">
            <h3>COURSE PAYMENT RECEIPT</h3>
            <p>Education Management System</p>
          </div>
        </div>

        <!-- Receipt Content -->
        <div class="admin-dashboard-user-popup-content">
          <!-- Receipt Number and Date -->
          <div class="admin-dashboard-user-popup-content-grid">
            <div class="admin-dashboard-user-popup-section">
              <div class="admin-dashboard-user-popup-section-header">
                <div class="admin-dashboard-user-popup-section-icon">
                  <i class="fas fa-receipt"></i>
                </div>
                <h4>Receipt Information</h4>
              </div>
              <div class="admin-dashboard-user-popup-section-content">
                <div class="admin-dashboard-user-popup-info-item">
                  <label>Receipt No:</label>
                  <span>${assignment.paymentReference || `REC-${Math.floor(Math.random() * 10000)}`}</span>
                </div>
                <div class="admin-dashboard-user-popup-info-item">
                  <label>Date:</label>
                  <span>${assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <!-- Student Details -->
            <div class="admin-dashboard-user-popup-section">
              <div class="admin-dashboard-user-popup-section-header">
                <div class="admin-dashboard-user-popup-section-icon">
                  <i class="fas fa-user"></i>
                </div>
                <h4>Student Information</h4>
              </div>
              <div class="admin-dashboard-user-popup-section-content">
                <div class="admin-dashboard-user-popup-info-item">
                  <label>Name:</label>
                  <span>${student.name || 'N/A'}</span>
                </div>
                <div class="admin-dashboard-user-popup-info-item">
                  <label>Email:</label>
                  <span>${student.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Course Details -->
          <div class="admin-dashboard-user-popup-section mt-3">
            <div class="admin-dashboard-user-popup-section-header">
              <div class="admin-dashboard-user-popup-section-icon">
                <i class="fas fa-book"></i>
              </div>
              <h4>Course Information</h4>
            </div>
            <div class="admin-dashboard-user-popup-section-content">
              <div class="admin-dashboard-user-popup-info-item">
                <label>Course:</label>
                <span>${course.name || 'N/A'}</span>
              </div>
              <div class="admin-dashboard-user-popup-info-item">
                <label>Duration:</label>
                <span>${course.duration || 'N/A'}</span>
              </div>
            </div>
          </div>

          <!-- Payment Details -->
          <div class="admin-dashboard-user-popup-section mt-3">
            <div class="admin-dashboard-user-popup-section-header">
              <div class="admin-dashboard-user-popup-section-icon">
                <i class="fas fa-money-bill-wave"></i>
              </div>
              <h4>Payment Details</h4>
            </div>
            <div class="admin-dashboard-user-popup-section-content">
              <div class="admin-dashboard-user-popup-info-item">
                <label>Paid Amount:</label>
                <span class="text-green">${formatCurrency(assignment.paidAmount || 0)}</span>
              </div>
              <div class="admin-dashboard-user-popup-info-item">
                <label>Pending Amount:</label>
                <span class="text-red">${formatCurrency(assignment.pendingAmount || 0)}</span>
              </div>
              <div class="admin-dashboard-user-popup-info-item">
                <label>Payment Method:</label>
                <span class="text-capitalize">${assignment.paymentMethod || 'Cash'}</span>
              </div>
              <div class="admin-dashboard-user-popup-info-item">
                <label>Payment Date:</label>
                <span>${assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <!-- Footer with Signatures -->
          <div class="admin-dashboard-user-popup-actions mt-3">
            <div class="signatures-container">
              <div class="signature-box">
                <p>Student Signature</p>
                <div class="signature-line"></div>
              </div>
              <div class="signature-box">
                <p>Authorized Signature</p>
                <img src="/sing.png" alt="Authorized Signature" class="admin-signature" />
                <div class="signature-line"></div>
              </div>
            </div>
            <div class="footer-text mt-3">
              <p>This is a computer-generated receipt and does not require a physical signature.</p>
              <p class="thank-you">Thank you for your payment!</p>
            </div>
          </div>
        </div>
      </div>
    `;

    Swal.fire({
      title: 'Payment Receipt',
      html: receiptHtml,
      width: '700px',
      showCloseButton: true,
      showConfirmButton: true,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Print Receipt',
      denyButtonText: 'Download PDF',
      cancelButtonText: 'Close',
      customClass: {
        popup: 'swal2-custom-popup receipt-swal-popup',
        title: 'swal2-custom-title',
        htmlContainer: 'swal2-custom-html receipt-swal-html',
        confirmButton: 'swal2-confirm-button receipt-print-btn',
        denyButton: 'swal2-deny-button receipt-pdf-btn',
        cancelButton: 'swal2-cancel-button'
      },
      didOpen: () => {
        // Add print functionality
        const printBtn = document.querySelector('.receipt-print-btn');
        if (printBtn) {
          printBtn.addEventListener('click', () => {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
              <html>
                <head>
                  <title>Payment Receipt</title>
                  <style>
                    @page { size: A4; margin: 10mm; }
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 15px; line-height: 1.3; font-size: 12px; }
                    
                    /* Header Styles */
                    .admin-dashboard-user-popup-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; margin-bottom: 15px; }
                    .admin-dashboard-user-popup-header-content h3 { font-size: 16px; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase; }
                    .admin-dashboard-user-popup-header-content p { font-size: 12px; margin: 0; opacity: 0.9; }
                    
                    /* Content Styles */
                    .admin-dashboard-user-popup-content { padding: 0 15px; }
                    .admin-dashboard-user-popup-content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
                    
                    /* Section Styles */
                    .admin-dashboard-user-popup-section { background: #f9fafb; border-radius: 8px; padding: 12px; border: 1px solid #e5e7eb; margin-bottom: 15px; }
                    .admin-dashboard-user-popup-section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
                    .admin-dashboard-user-popup-section-icon { display: inline-block; background: #667eea; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; }
                    .admin-dashboard-user-popup-section-header h4 { margin: 0; font-size: 14px; font-weight: 600; color: #1f2937; }
                    
                    /* Info Item Styles */
                    .admin-dashboard-user-popup-section-content { display: flex; flex-direction: column; gap: 6px; }
                    .admin-dashboard-user-popup-info-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; }
                    .admin-dashboard-user-popup-info-item label { font-weight: 500; color: #6b7280; font-size: 12px; }
                    .admin-dashboard-user-popup-info-item span { font-weight: 600; color: #1f2937; font-size: 12px; text-align: right; }
                    
                    /* Utility Classes */
                    .mt-3 { margin-top: 15px; }
                    .text-green { color: #10b981; }
                    .text-red { color: #ef4444; }
                    .text-capitalize { text-transform: capitalize; }
                    
                    /* Footer Styles */
                    .admin-dashboard-user-popup-actions { margin-top: 20px; }
                    .signatures-container { display: flex; justify-content: space-between; margin-bottom: 15px; }
                    .signature-box { flex: 1; text-align: center; padding: 8px; margin: 0 8px; }
                    .signature-box p { font-size: 12px; font-weight: bold; margin-bottom: 8px; }
                    .signature-line { margin-top: 25px; border-top: 1px solid #000; width: 100%; }
                    .admin-signature { max-width: 80px; max-height: 40px; margin-top: 8px; display: block; margin-left: auto; margin-right: auto; }
                    .footer-text { text-align: center; margin-top: 15px; padding: 10px; background-color: #f9fafb; border-radius: 6px; }
                    .footer-text p { margin: 4px 0; font-size: 10px; color: #6b7280; }
                    .thank-you { color: #10b981; font-weight: bold; }
                    
                    /* Responsive Adjustments */
                    @media print {
                      .admin-dashboard-user-popup-content-grid { grid-template-columns: 1fr 1fr; }
                    }
                  </style>
                </head>
                <body>
                  <div class="receipt-popup-container">
                    ${document.querySelector('.receipt-popup-container').innerHTML}
                  </div>
                </body>
              </html>
            `);
            printWindow.document.close();
            setTimeout(() => {
              printWindow.print();
              printWindow.close();
            }, 500);
          });
        }

        // Add PDF download functionality
        const pdfBtn = document.querySelector('.receipt-pdf-btn');
        if (pdfBtn) {
          pdfBtn.addEventListener('click', async () => {
            try {
              const { jsPDF } = await import('jspdf');
              const html2canvas = await import('html2canvas');

              // Create a temporary container with the same HTML structure as print
              const tempContainer = document.createElement('div');
              tempContainer.innerHTML = `
                <div class="receipt-popup-container" style="
                  background: white;
                  padding: 15px;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.3;
                  font-size: 12px;
                  color: #333;
                  max-width: 100%;
                  margin: 0 auto;
                ">
                  ${document.querySelector('.receipt-popup-container').innerHTML}
                </div>
              `;

              // Apply print styles to the temporary container
              const style = document.createElement('style');
              style.textContent = `
                /* Header Styles */
                .admin-dashboard-user-popup-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; margin-bottom: 15px; }
                .admin-dashboard-user-popup-header-content h3 { font-size: 16px; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase; }
                .admin-dashboard-user-popup-header-content p { font-size: 12px; margin: 0; opacity: 0.9; }
                
                /* Content Styles */
                .admin-dashboard-user-popup-content { padding: 0 15px; }
                .admin-dashboard-user-popup-content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
                
                /* Section Styles */
                .admin-dashboard-user-popup-section { background: #f9fafb; border-radius: 8px; padding: 12px; border: 1px solid #e5e7eb; margin-bottom: 15px; }
                .admin-dashboard-user-popup-section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
                .admin-dashboard-user-popup-section-icon { display: inline-block; background: #667eea; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; }
                .admin-dashboard-user-popup-section-header h4 { margin: 0; font-size: 14px; font-weight: 600; color: #1f2937; }
                
                /* Info Item Styles */
                .admin-dashboard-user-popup-section-content { display: flex; flex-direction: column; gap: 6px; }
                .admin-dashboard-user-popup-info-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; }
                .admin-dashboard-user-popup-info-item label { font-weight: 500; color: #6b7280; font-size: 12px; }
                .admin-dashboard-user-popup-info-item span { font-weight: 600; color: #1f2937; font-size: 12px; text-align: right; }
                
                /* Utility Classes */
                .mt-3 { margin-top: 15px; }
                .text-green { color: #10b981; }
                .text-red { color: #ef4444; }
                .text-capitalize { text-transform: capitalize; }
                
                /* Footer Styles */
                .admin-dashboard-user-popup-actions { margin-top: 20px; }
                .signatures-container { display: flex; justify-content: space-between; margin-bottom: 15px; }
                .signature-box { flex: 1; text-align: center; padding: 8px; margin: 0 8px; }
                .signature-box p { font-size: 12px; font-weight: bold; margin-bottom: 8px; }
                .signature-line { margin-top: 25px; border-top: 1px solid #000; width: 100%; }
                .admin-signature { max-width: 80px; max-height: 40px; margin-top: 8px; display: block; margin-left: auto; margin-right: auto; }
                .footer-text { text-align: center; margin-top: 15px; padding: 10px; background-color: #f9fafb; border-radius: 6px; }
                .footer-text p { margin: 4px 0; font-size: 10px; color: #6b7280; }
                .thank-you { color: #10b981; font-weight: bold; }
              `;
              tempContainer.appendChild(style);
              document.body.appendChild(tempContainer);

              // Wait for images to load
              const images = tempContainer.querySelectorAll('img');
              await Promise.all(Array.from(images).map(img => {
                return new Promise((resolve) => {
                  if (img.complete) {
                    resolve();
                  } else {
                    img.onload = resolve;
                    img.onerror = resolve;
                  }
                });
              }));

              const canvas = await html2canvas.default(tempContainer.firstElementChild, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
              });

              const imgData = canvas.toDataURL("image/png");
              const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

              // Ensure it fits on one page
              const pageHeight = pdf.internal.pageSize.getHeight();
              const scale = pageHeight / pdfHeight;

              if (scale < 1) {
                // If content is too tall, scale it down
                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth * scale, pdfHeight * scale);
              } else {
                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
              }

              pdf.save(`Payment_Receipt_${student.name || "Student"}_${new Date().toLocaleDateString()}.pdf`);

              // Clean up
              document.body.removeChild(tempContainer);
            } catch (error) {
              console.error('Error generating PDF:', error);
              Swal.fire('Error', 'Failed to generate PDF', 'error');
            }
          });
        }
      }
    });
  };

  const handleAddAssignment = () => {
    navigate("/admin/fee-management/add");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAssignments(page, assignmentsPerPage);
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
    setAssignmentsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    fetchAssignments(1, newPageSize); // Fetch data with new page size
  };

  // Pagination component
  const renderPagination = () => {
    // Show pagination if there are assignments and more than 1 page, or if we want to show page size selector
    if (totalAssignments === 0) return null;

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
    const startNumber = ((currentPage - 1) * assignmentsPerPage) + 1;
    const endNumber = Math.min(currentPage * assignmentsPerPage, totalAssignments);

    // Handle edge cases
    const displayStart = totalAssignments > 0 ? startNumber : 0;
    const displayEnd = totalAssignments > 0 ? endNumber : 0;

    // Ensure we don't show invalid ranges
    const finalStart = displayStart > totalAssignments ? 0 : displayStart;
    const finalEnd = displayEnd > totalAssignments ? totalAssignments : displayEnd;

    return (
      <div className="admin-dashboard-pagination">
        <div className="admin-dashboard-pagination-info">
          <span>
            Showing {finalStart} to {finalEnd} of {totalAssignments} fee records
          </span>
        </div>

        <div className="admin-dashboard-pagination-size-selector">
          <label htmlFor="pageSizeSelect" className="admin-dashboard-page-size-label">
            Show:
          </label>
          <select
            id="pageSizeSelect"
            value={assignmentsPerPage}
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="admin-dashboard-pageContent">
        <div className="admin-dashboard-mb-6 animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-d-flex admin-dashboard-justify-between admin-dashboard-align-center admin-dashboard-mb-4">
            <h2 className="admin-dashboard-text-2xl admin-dashboard-font-semibold admin-dashboard-text-heading-color animated animate__animated animate__slideInLeft">Fee Management</h2>
            <div className="admin-dashboard-d-flex admin-dashboard-gap-2">
              <button onClick={exportToExcel} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <FileSpreadsheet size={18} className="admin-dashboard-btn-icon" />
                Export to Excel
              </button>
              <button onClick={handleAddAssignment} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <Plus size={18} className="admin-dashboard-btn-icon" />
                Add Fee
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
                placeholder="Search by course name..."
                value={searchTermCourse}
                onChange={(e) => setSearchTermCourse(e.target.value)}
              />
            </div>
            <div className="admin-dashboard-search-input-group">
              <input
                type="text"
                className="admin-dashboard-search-input"
                placeholder="Search by receipt number..."
                value={searchTermReceipt}
                onChange={(e) => setSearchTermReceipt(e.target.value)}
              />
            </div>
            <div className="admin-dashboard-search-input-group">
              <select
                className="admin-dashboard-search-select"
                value={searchTermPaymentStatus}
                onChange={(e) => setSearchTermPaymentStatus(e.target.value)}
              >
                <option value="">All Payment Status</option>
                <option value="paid">Fully Paid Courses</option>
                <option value="pending">Fee Pending Courses</option>
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
          <div className="admin-dashboard-loader-container animated animate__animated animate__fadeIn">
            <Loader title="Loading Assignments" subtitle="Please wait..." />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="admin-dashboard-empty-state animated animate__animated animate__fadeIn">
            <div className="admin-dashboard-empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="admin-dashboard-empty-state-title">No assignments found</h3>
            <p className="admin-dashboard-empty-state-description">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="admin-dashboard-table-container animated animate__animated animate__fadeIn">
            <table className="admin-dashboard-table">
              <thead className="admin-dashboard-table-header">
                <tr>
                  <th className="admin-dashboard-sno-column" style={{ width: '50px', minWidth: '50px', whiteSpace: 'nowrap' }}>S.No</th>
                  <th className="admin-dashboard-name-column" style={{ width: '200px', minWidth: '200px', whiteSpace: 'nowrap' }}>Student</th>
                  <th className="admin-dashboard-course-column" style={{ width: '200px', minWidth: '200px', whiteSpace: 'nowrap' }}>Course Name</th>
                  <th className="admin-dashboard-paid-column" style={{ width: '100px', minWidth: '100px', whiteSpace: 'nowrap' }}>Paid Amount</th>
                  <th className="admin-dashboard-pending-column" style={{ width: '120px', minWidth: '120px', whiteSpace: 'nowrap' }}>Pending Amount</th>
                  <th className="admin-dashboard-date-column" style={{ width: '120px', minWidth: '120px', whiteSpace: 'nowrap' }}>Created</th>
                  <th className="admin-dashboard-actions-column" style={{ width: '80px', minWidth: '80px', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((assignment, index) => (
                  <tr key={assignment._id} className="admin-dashboard-table-row animated animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="admin-dashboard-sno-cell">{((currentPage - 1) * assignmentsPerPage) + index + 1}</td>
                    {/* <td className="admin-dashboard-name-cell">
                      <div className="admin-dashboard-user-info">
                        <div className="admin-dashboard-user-name">{assignment.student_id?.name || "N/A"}</div>
                        <div className="admin-dashboard-user-email">{assignment.student_id?.email || assignment.email || "N/A"}</div>
                      </div>
                    </td> */}



                    <td className="admin-dashboard-name-column">
                      <div className="admin-dashboard-user-info" onClick={() => handleShowReceipt(assignment)} style={{ cursor: 'pointer' }}>
                        <div className="admin-dashboard-user-avatar">
                          <img
                            src={
                              assignment.student_id?.profilePicture
                                ? `${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/${assignment.student_id?.profilePicture.replace(/^\/+/, '')}`
                                : '/dummy-user.jpg'
                            }
                            alt={assignment.student_id?.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/dummy-user.jpg';
                            }}
                            className="admin-dashboard-user-avatar-img"
                          />

                        </div>
                        <div className="admin-dashboard-user-details">
                          <div className="admin-dashboard-user-name">{assignment.student_id?.name || 'N/A'}</div>
                          <div className="admin-dashboard-user-email">{assignment.student_id?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>










                    <td className="admin-dashboard-course-cell">{assignment.course_id?.[0]?.name || "N/A"}</td>
                    <td className="admin-dashboard-paid-cell">
                      {formatCurrency(assignment.paidAmount || 0)}
                    </td>
                    <td className="admin-dashboard-pending-cell">
                      <span className={`admin-dashboard-status-text ${assignment.pendingAmount > 0 ? 'inactive' : 'active'}`}>
                        {formatCurrency(assignment.pendingAmount || 0)}
                      </span>
                    </td>
                    {/* <td className="admin-dashboard-date-cell">
                      {assignment.createdAt ? (
                        <span>{new Date(assignment.createdAt).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</span>
                      ) : (
                        "N/A"
                      )}
                    </td> */}


                    <td className="admin-dashboard-date-cell">
                      {assignment.createdAt ? (
                        <Moment format="DD/MM/YYYY" utc>{assignment.createdAt}</Moment>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="admin-dashboard-actions-cell">
                      <div className="admin-dashboard-actions-container">
                        <button
                          onClick={() => handleShowReceipt(assignment)}
                          title="View Receipt"
                          className="admin-dashboard-btn-action-icon admin-dashboard-btn-view"
                        >
                          <Eye size={14} className="admin-dashboard-action-icon-svg" />
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

      {/* View Assignment Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Assignment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAssignment && (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Student Information
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-500 font-medium">Name</p>
                        <p className="text-gray-800 font-semibold">
                          {selectedAssignment.student_id?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Email</p>
                        <p className="text-gray-800 font-semibold">
                          {selectedAssignment.student_id?.email || selectedAssignment.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Status</p>
                        <p className="text-gray-800 font-semibold">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedAssignment.student_id?.status === "Y"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}
                          >
                            {selectedAssignment.student_id?.status === "Y" ? "Active" : "Inactive"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Course Information</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-500 font-medium">Course Name</p>
                        <p className="text-gray-800 font-semibold">
                          {selectedAssignment.course_id?.[0]?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Duration</p>
                        <p className="text-gray-800 font-semibold">
                          {selectedAssignment.course_id?.[0]?.duration || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Start Date</p>
                        <p className="text-gray-800 font-semibold">
                          {selectedAssignment.startDate ? (
                            <Moment format="MMMM DD, YYYY">
                              {new Date(selectedAssignment.startDate)}
                            </Moment>
                          ) : (
                            "N/A"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">End Date</p>
                        <p className="text-gray-800 font-semibold">
                          {selectedAssignment.endDate ? (
                            <Moment format="MMMM DD, YYYY">
                              {new Date(selectedAssignment.endDate)}
                            </Moment>
                          ) : (
                            "N/A"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Fee Information</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-500 font-medium">Course Fee</p>
                        <p className="text-gray-800 font-semibold">
                          {formatCurrency(selectedAssignment.course_id?.[0]?.finalFees || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Additional Discount</p>
                        <p className="text-gray-800 font-semibold">
                          {formatCurrency(selectedAssignment.additionalDiscount || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Total Fee</p>
                        <p className="text-gray-800 font-semibold">
                          {formatCurrency(selectedAssignment.totalFee || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Paid Amount</p>
                        <p className="text-green-600 font-semibold">
                          {formatCurrency(selectedAssignment.paidAmount || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Pending Amount</p>
                        <p
                          className={`font-semibold ${selectedAssignment.pendingAmount > 0
                            ? "text-red-600"
                            : "text-green-600"
                            }`}
                        >
                          {formatCurrency(selectedAssignment.pendingAmount || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Payment Status</p>
                        <p className="text-gray-800 font-semibold">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedAssignment.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                              }`}
                          >
                            {selectedAssignment.status === "paid" ? "Paid" : "Pending"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedAssignment.paymentHistory && selectedAssignment.paymentHistory.length > 0 && (
                  <div className="col-span-2 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Payment History</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Date</th>
                            <th className="text-left py-2">Amount</th>
                            <th className="text-left py-2">Payment Method</th>
                            <th className="text-left py-2">Reference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAssignment.paymentHistory.map((payment, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">
                                {payment.date ? (
                                  <Moment format="MMM DD, YYYY">
                                    {new Date(payment.date)}
                                  </Moment>
                                ) : (
                                  "N/A"
                                )}
                              </td>
                              <td className="py-2 text-green-600 font-semibold">
                                {formatCurrency(payment.amount || 0)}
                              </td>
                              <td className="py-2">{payment.method || "N/A"}</td>
                              <td className="py-2">{payment.reference || "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors"
            onClick={() => setShowViewModal(false)}
          >
            Close
          </button>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition-colors flex items-center gap-2"
            onClick={() => {
              setShowViewModal(false);
              navigate(`/admin/fee-management/edit/${selectedAssignment._id}`);
            }}
          >
            <FaEdit /> Edit Payment
          </button>
          <button
            className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition-colors flex items-center gap-2"
            onClick={() => {
              setShowViewModal(false);
              handleShowReceipt(selectedAssignment);
            }}
          >
            <FaFileInvoice /> View Receipt
          </button>
        </Modal.Footer>
      </Modal>


    </AdminLayout>
  );
};

export default FeeManagementIndex;
