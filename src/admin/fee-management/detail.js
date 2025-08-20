import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import { feeManagementService } from "../../services";
import { FaFileInvoice, FaUser, FaBook, FaMoneyBillWave, FaEdit } from "react-icons/fa";
import { RotateCcw } from "lucide-react";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Moment from "react-moment";
import 'animate.css';
import '../../style/admin-style.css';


const FeeAssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignmentDetails, setAssignmentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      setIsLoading(true);
      try {
        const data = await feeManagementService.getAssignmentById(id);
        setAssignmentDetails(data);
      } catch (error) {
        console.error("Error fetching assignment details:", error);
        Swal.fire("Error", "Failed to fetch assignment details.", "error");
        navigate("/admin/fee-management");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignmentDetails();
  }, [id, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleShowReceipt = (assignment) => {
    const student = assignment.student_id || {};
    const course = assignment.course_id?.[0] || {};
    
    const receiptHtml = `
      <div class="receipt-popup-container">
        <div class="admin-dashboard-user-popup-header">
          <div class="admin-dashboard-user-popup-header-icon">
            <i class="fas fa-receipt"></i>
          </div>
          <div class="admin-dashboard-user-popup-header-content">
            <h3>COURSE PAYMENT RECEIPT</h3>
            <p>Education Management System</p>
          </div>
        </div>

        <div class="admin-dashboard-user-popup-content">
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-loader-container">
          <Loader title="Loading Fee Details" subtitle="Please wait..." />
        </div>
      </AdminLayout>
    );
  }

  if (!assignmentDetails) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-empty-state">
          <h3 className="admin-dashboard-empty-state-title">Fee record not found</h3>
          <button onClick={() => navigate("/admin/fee-management")} className="admin-dashboard-btn admin-dashboard-btn-secondary">
            <RotateCcw size={16} className="admin-dashboard-btn-icon" />
            Go Back
          </button>
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
              Fee Assignment Details
            </h2>
            <div className="admin-dashboard-d-flex admin-dashboard-gap-2">
              <button onClick={() => navigate("/admin/fee-management")} className="admin-dashboard-btn admin-dashboard-btn-secondary animated animate__animated animate__slideInRight">
                <RotateCcw size={18} className="admin-dashboard-btn-icon" />
                Go Back
              </button>
              <button onClick={() => navigate(`/admin/fee-management/edit/${id}`)} className="admin-dashboard-btn admin-dashboard-btn-warning animated animate__animated animate__slideInRight">
                <FaEdit size={18} className="admin-dashboard-btn-icon" />
                Edit Record
              </button>
            </div>
          </div>
        </div>
        
        <div className="admin-dashboard-card animated animate__animated animate__fadeInUp">
          <div className="admin-dashboard-card-body p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2 mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2"><FaUser /> Student Information</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500 font-medium">Name</p>
                      <p className="text-gray-800 font-semibold">{assignmentDetails.student_id?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Email</p>
                      <p className="text-gray-800 font-semibold">{assignmentDetails.student_id?.email || assignmentDetails.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Status</p>
                      <p className="text-gray-800 font-semibold">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${assignmentDetails.student_id?.status === "Y" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {assignmentDetails.student_id?.status === "Y" ? "Active" : "Inactive"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2"><FaBook /> Course Information</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500 font-medium">Course Name</p>
                      <p className="text-gray-800 font-semibold">{assignmentDetails.course_id?.[0]?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Duration</p>
                      <p className="text-gray-800 font-semibold">{assignmentDetails.course_id?.[0]?.duration || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Start Date</p>
                      <p className="text-gray-800 font-semibold">
                        {assignmentDetails.startDate ? <Moment format="MMMM DD, YYYY">{new Date(assignmentDetails.startDate)}</Moment> : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">End Date</p>
                      <p className="text-gray-800 font-semibold">
                        {assignmentDetails.endDate ? <Moment format="MMMM DD, YYYY">{new Date(assignmentDetails.endDate)}</Moment> : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2"><FaMoneyBillWave /> Fee Information</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500 font-medium">Course Fee</p>
                      <p className="text-gray-800 font-semibold">{formatCurrency(assignmentDetails.course_id?.[0]?.finalFees || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Additional Discount</p>
                      <p className="text-gray-800 font-semibold">{formatCurrency(assignmentDetails.additionalDiscount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Total Fee</p>
                      <p className="text-gray-800 font-semibold">{formatCurrency(assignmentDetails.totalFee || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Paid Amount</p>
                      <p className="text-green-600 font-semibold">{formatCurrency(assignmentDetails.paidAmount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Pending Amount</p>
                      <p className={`font-semibold ${assignmentDetails.pendingAmount > 0 ? "text-red-600" : "text-green-600"}`}>{formatCurrency(assignmentDetails.pendingAmount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Payment Status</p>
                      <p className="text-gray-800 font-semibold">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${assignmentDetails.pendingAmount === 0 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {assignmentDetails.pendingAmount === 0 ? "Paid" : "Pending"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {assignmentDetails.paymentHistory && assignmentDetails.paymentHistory.length > 0 && (
                <div className="col-span-1 md:col-span-2 mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2"><FaMoneyBillWave /> Payment History</h3>
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
                        {assignmentDetails.paymentHistory.map((payment, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">
                              {payment.date ? <Moment format="MMM DD, YYYY">{new Date(payment.date)}</Moment> : "N/A"}
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

              <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
                <button
                  onClick={() => handleShowReceipt(assignmentDetails)}
                  className="admin-dashboard-btn admin-dashboard-btn-primary"
                >
                  <FaFileInvoice /> View Receipt
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FeeAssignmentDetails;
