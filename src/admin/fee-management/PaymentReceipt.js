import React, { useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import Moment from "react-moment";
import { FaPrint, FaFilePdf, FaUser, FaBook, FaMoneyBillWave, FaCalendarAlt, FaReceipt } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


const PaymentReceipt = ({ show, onHide, payment, student, course, assignment }) => {
  const receiptRef = useRef();

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 0;
              line-height: 1.2;
              font-size: 10px;
            }
            .receipt-container {
              max-width: 100%;
              margin: 0 auto;
              page-break-inside: avoid;
            }
            .receipt-header { 
              text-align: center; 
              margin-bottom: 10px; 
              padding-bottom: 5px;
              border-bottom: 1px solid #ddd;
            }
            .receipt-header h2 { 
              font-size: 14px; 
              font-weight: bold; 
              margin: 0 0 3px 0;
              text-transform: uppercase;
            }
            .receipt-header p {
              font-size: 10px;
              margin: 0;
            }
            .receipt-info { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 10px; 
              padding: 5px;
              background-color: #f9f9f9;
              border-radius: 3px;
              font-size: 9px;
            }
            .receipt-section { 
              margin-bottom: 8px; 
              padding: 6px; 
              background-color: #f9f9f9; 
              border-radius: 3px;
              border: 1px solid #ddd;
            }
            .receipt-section h3 { 
              font-size: 11px; 
              font-weight: bold; 
              margin: 0 0 4px 0;
              padding-bottom: 3px;
              border-bottom: 1px solid #667eea;
            }
            .receipt-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 4px;
              font-size: 9px;
            }
            .receipt-grid p {
              margin: 1px 0;
              padding: 2px;
              background: white;
              border-radius: 2px;
            }
            .receipt-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 8px;
              font-size: 9px;
            }
            .receipt-table th, .receipt-table td { 
              border: 1px solid #ddd; 
              padding: 4px; 
              text-align: left;
            }
            .receipt-table th { 
              background-color: #667eea; 
              color: white;
              font-weight: bold;
              font-size: 9px;
            }
            .text-right { 
              text-align: right;
            }
            .text-green { 
              color: #28a745; 
              font-weight: bold;
            }
            .text-red { 
              color: #dc3545; 
              font-weight: bold;
            }
            .currency.inr::before {
              content: '₹';
              margin-right: 1px;
            }
            .receipt-footer { 
              margin-top: 10px; 
              padding-top: 8px; 
              border-top: 1px solid #ddd;
            }
            .signatures-container { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 8px;
              gap: 10px;
            }
            .signature-box { 
              flex: 1;
              text-align: center;
              padding: 3px;
              background: white;
              border: 1px solid #ddd;
              border-radius: 3px;
            }
            .signature-box p {
              font-size: 9px;
              font-weight: bold;
              margin: 0 0 3px 0;
              text-transform: uppercase;
            }
            .signature-line { 
              margin-top: 10px; 
              border-top: 1px solid #000; 
              width: 100%;
              position: relative;
            }
            .signature-line::after {
              content: '';
              position: absolute;
              top: -2px;
              left: 0;
              right: 0;
              height: 6px;
              background: repeating-linear-gradient(
                90deg,
                transparent,
                transparent 1px,
                #000 1px,
                #000 2px
              );
            }
            .footer-text { 
              text-align: center; 
              margin-top: 8px; 
              padding: 5px;
              background-color: #f9f9f9;
              border-radius: 3px;
            }
            .footer-text p {
              margin: 1px 0;
              font-size: 8px;
              color: #666;
            }
            .thank-you {
              color: #28a745;
              font-weight: bold;
              font-size: 9px;
            }
            .label {
              font-weight: bold;
              color: #495057;
            }
            .value {
              color: #2c3e50;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 0;
              }
              .no-print { 
                display: none; 
              }
              .receipt-container {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleDownloadPDF = async () => {
    const input = receiptRef.current;
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Payment_Receipt_${student?.name || "Student"}_${new Date().toLocaleDateString()}.pdf`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!payment || !student || !course || !assignment) {
    return null;
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="sm"
      aria-labelledby="payment-receipt-modal"
      centered
      className="receipt-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title id="payment-receipt-modal">
          <FaReceipt className="me-2" />
          Payment Receipt
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div ref={receiptRef} className="receipt-container receipt-fade-in">
          {/* Receipt Header */}
          <div className="receipt-header">
            <h2>COURSE PAYMENT RECEIPT</h2>
            <p>Education Management System</p>
          </div>

          {/* Receipt Number and Date */}
          <div className="receipt-info">
            <div>
              <p className="receipt-number">
                <FaReceipt className="me-2" />
                Receipt No: {assignment.paymentReference || payment.id || `REC-${Math.floor(Math.random() * 10000)}`}
              </p>
            </div>
            <div>
              <p className="receipt-date">
                <FaCalendarAlt className="me-2" />
                Date: {payment.date ? (
                  <Moment format="MMM DD, YYYY">{new Date(payment.date)}</Moment>
                ) : (
                  new Date().toLocaleDateString()
                )}
              </p>
            </div>
          </div>

          {/* Student Details */}
          <div className="receipt-section receipt-slide-up">
            <h3>
              <FaUser className="me-2" />
              Student Information
            </h3>
            <div className="receipt-grid">
              <div>
                <p><span className="label">Name:</span> <span className="value">{student.name}</span></p>
                <p><span className="label">Email:</span> <span className="value">{student.email}</span></p>
              </div>
             
            </div>
          </div>

          {/* Course Details */}
          <div className="receipt-section receipt-slide-up">
            <h3>
              <FaBook className="me-2" />
              Course Information
            </h3>
            <div className="receipt-grid">
              <div>
                <p><span className="label">Course:</span> <span className="value">{course.name}</span></p>
                <p><span className="label">Duration:</span> <span className="value">{course.duration}</span></p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="receipt-section receipt-slide-up">
            <h3>
              <FaMoneyBillWave className="me-2" />
              Payment Details
            </h3>
            <table className="receipt-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Paid Amount</strong></td>
                  <td className="text-right text-green currency inr">
                    <strong>{formatCurrency(assignment.paidAmount || 0)}</strong>
                  </td>
                </tr>
                <tr>
                  <td><strong>Pending Amount</strong></td>
                  <td className="text-right text-red currency inr">
                    <strong>{formatCurrency(assignment.pendingAmount || 0)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Method */}
          <div className="receipt-section receipt-slide-up">
            <h3>
              <FaMoneyBillWave className="me-2" />
              Payment Information
            </h3>
            <div className="receipt-grid">
              <div>
                <p><span className="label">Payment Method:</span> 
                  <span className="value text-capitalize">{assignment.paymentMethod || 'Cash'}</span>
                </p>
                <p><span className="label">Payment Date:</span> 
                  <span className="value">
                    <Moment format="DD/MM/YYYY">{new Date(assignment.createdAt || new Date())}</Moment>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer with Signatures */}
          <div className="receipt-footer">
            <div className="signatures-container">
              <div className="signature-box">
                <p>Student Signature</p>
                <div className="signature-line"></div>
              </div>
              <div className="signature-box">
                <p>Authorized Signature</p>
                <div className="signature-line"></div>
              </div>
            </div>
            <div className="footer-text">
              <p>This is a computer-generated receipt and does not require a physical signature.</p>
              <p className="thank-you">Thank you for your payment!</p>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} className="receipt-btn secondary">
          Close
        </Button>
        <Button variant="primary" onClick={handlePrint} className="receipt-btn primary">
          <FaPrint /> Print Receipt
        </Button>
        <Button variant="danger" onClick={handleDownloadPDF} className="receipt-btn danger">
          <FaFilePdf /> Download PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentReceipt;