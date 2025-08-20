import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import Moment from "react-moment";
import * as XLSX from "xlsx";
import { studentService, courseService } from "../../services"; // Removed studentDocumentService
import { Trash2, Edit, Plus, FileSpreadsheet, Search, RotateCcw, Upload, File, X } from "lucide-react";
import { FaBook } from "react-icons/fa";
import Loader from "../../components/Loader";
import 'animate.css';
import '../../style/admin-style.css';
import '../../style/document-upload.css';
import './student-table-custom.css'; // Import custom CSS for table column widths

const StudentIndex = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [studentData, setStudentData] = useState([]);
  const [searchTermName, setSearchTermName] = useState('');
  const [searchTermEmail, setSearchTermEmail] = useState('');
  const [searchTermMobile, setSearchTermMobile] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [searchTrigger, setSearchTrigger] = useState(0); // New state to trigger search

  // Add new filter state
  const [courseAssignFilter, setCourseAssignFilter] = useState('all');
  const [courses, setCourses] = useState([]);

  // Document upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [studentDocuments, setStudentDocuments] = useState([]); // This will hold existing document paths and new File objects
  const fileInputRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [studentsPerPage, setStudentsPerPage] = useState(25);
  const [paginationData, setPaginationData] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    fetchStudents(currentPage, studentsPerPage, searchTermName, searchTermEmail, searchTermMobile, statusFilter, courseAssignFilter);
    fetchCourses();
  }, [currentPage, studentsPerPage, searchTrigger]); // Re-fetch on pagination or search trigger change

  useEffect(() => {
    setFilteredData(studentData);
  }, [studentData]);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getAllCourses();
      if (response && Array.isArray(response.data)) {
        setCourses(response.data.filter(course => course.status === "Y"));
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchStudents = async (page = currentPage, pageSize = studentsPerPage) => {
    setIsLoading(true);
    try {
      const response = await studentService.getAllStudents(page, pageSize);
      const students = Array.isArray(response?.data) ? response.data : [];

      // Sort students by createdAt in descending order (newest first)
      const sortedStudents = students.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order (newest first)
      });

      setStudentData(sortedStudents);

      // Set pagination data
      const totalCount = response?.total || students.length;
      setTotalStudents(totalCount);
      setTotalPages(Math.ceil(totalCount / pageSize));
      setPaginationData({
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize),
        studentsPerPage: pageSize
      });

    } catch (error) {
      console.error("Error fetching students:", error);
      setStudentData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (student) => {
    // Check if student has assigned courses
    const hasAssignedCourses = Array.isArray(student.course_id) && student.course_id.length > 0;

    if (hasAssignedCourses) {
      Swal.fire({
        title: "Cannot Delete Student",
        text: "This student has assigned courses. Please remove all course assignments before deleting the student.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

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
          await studentService.deleteStudent(student._id);
          Swal.fire("Deleted!", "Student has been deleted.", "success");
          fetchStudents();
        } catch (error) {
          Swal.fire("Error", error.response?.data.message || "Error deleting student", "error");
        }
      }
    });
  };

  const handleChangeStatus = async (id, status) => {
    Swal.fire({
      title: "Change student status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await studentService.updateStudentStatus(id, status === 'Y' ? 'N' : 'Y');
          Swal.fire("Updated!", "Student status updated.", "success");
          fetchStudents();
        } catch (error) {
          Swal.fire("Error", "Failed to update status!", "error");
        }
      }
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const filtered = studentData.filter(student => {
      const nameMatch = searchTermName === '' || student.name?.toLowerCase().includes(searchTermName.toLowerCase());
      const emailMatch = searchTermEmail === '' || student.email?.toLowerCase().includes(searchTermEmail.toLowerCase());
      const mobileMatch = searchTermMobile === '' || student.mobile?.toString().includes(searchTermMobile);
      const statusMatch = statusFilter === 'all' || student.status === statusFilter;
      let courseAssignMatch = true;
      if (courseAssignFilter === 'assigned') {
        courseAssignMatch = Array.isArray(student.course_id) && student.course_id.length > 0;
      } else if (courseAssignFilter === 'not_assigned') {
        courseAssignMatch = !Array.isArray(student.course_id) || student.course_id.length === 0;
      }
      return nameMatch && emailMatch && mobileMatch && statusMatch && courseAssignMatch;
    });

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchTermName('');
    setSearchTermEmail('');
    setSearchTermMobile('');
    setStatusFilter('all');
    setCourseAssignFilter('all');
    setFilteredData(studentData);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchStudents(page);
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
    setStudentsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    fetchStudents(1, newPageSize); // Fetch data with new page size
  };

  // Pagination component
  const renderPagination = () => {
    // Show pagination if there are students and more than 1 page, or if we want to show page size selector
    if (totalStudents === 0) return null;

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
    const startNumber = ((currentPage - 1) * studentsPerPage) + 1;
    const endNumber = Math.min(currentPage * studentsPerPage, totalStudents);

    // Handle edge cases
    const displayStart = totalStudents > 0 ? startNumber : 0;
    const displayEnd = totalStudents > 0 ? endNumber : 0;

    // Ensure we don't show invalid ranges
    const finalStart = displayStart > totalStudents ? 0 : displayStart;
    const finalEnd = displayEnd > totalStudents ? totalStudents : displayEnd;

    return (
      <div className={`admin-dashboard-pagination`}>
        <div className="admin-dashboard-pagination-info">
          <span>
            Showing {finalStart} to {finalEnd} of {totalStudents} students
          </span>
        </div>

        <div className="admin-dashboard-pagination-size-selector">
          <label htmlFor="pageSizeSelect" className="admin-dashboard-page-size-label">
            Show:
          </label>
          <select
            id="pageSizeSelect"
            value={studentsPerPage}
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
    const dataToExport = filteredData.map((student, index) => ({
      'S NO': index + 1,
      'Name': student.name || 'N/A',
      'Email': student.email || 'N/A',
      'Mobile': student.mobile || 'N/A',
      'Gender': student.gender || "N/A",
      'Status': student.status === 'Y' ? "Active" : "Inactive",
      'Address': student.address || "N/A",
      'Created Date': student.createdDate ? new Date(student.createdDate).toLocaleDateString() : "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students_data.xlsx");
  };


  const handleAddStudent = () => {
    navigate('/admin/students/add');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Filter for only images and PDFs
    const validFiles = files.filter(file => {
      const fileType = file.type;
      return fileType.includes('image') || fileType === 'application/pdf';
    });

    if (validFiles.length !== files.length) {
      Swal.fire('Invalid Files', 'Only images and PDF files are allowed', 'error');
    }

    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);

    // Create preview URLs for the files
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviewUrls(prevUrls => [...prevUrls, {
          url: reader.result,
          name: file.name,
          type: file.type,
          size: file.size
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setFilePreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const handleDocumentUpload = async (student) => {
    if (!student || !student._id) {
      Swal.fire('Error', 'Invalid student data', 'error');
      return;
    }

    setCurrentStudent(student);
    setSelectedFiles([]); // New files to be uploaded
    setFilePreviewUrls([]); // Previews for new files
    setUploadLoading(false);

    // Initialize studentDocuments with existing documents from the student object
    // Ensure existing documents are stored as strings (their paths)
    setStudentDocuments(student.documents ? student.documents.map(doc => doc) : []);

    Swal.fire({
      title: 'Upload Documents',
      html: `
        <div class="document-upload-container">
          <div class="document-upload-header">
            <h3>Upload Documents for ${student.name}</h3>
            <p>Upload images and PDF files for this student</p>
          </div>
          <div id="file-drop-area" class="document-drop-area">
            <div class="document-drop-message">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p>Drag & drop files here or click to browse</p>
              <span>Supported formats: Images and PDFs</span>
            </div>
            <input id="document-file-input" type="file" multiple accept="image/*,application/pdf" style="display: none;">
          </div>
          <div id="document-preview-container" class="document-preview-container"></div>
          <div id="existing-documents-container" class="existing-documents-container">
            <h4>Existing Documents</h4>
            <div id="existing-documents-list" class="existing-documents-list"></div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Upload',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      showLoaderOnConfirm: true,
      width: '600px',
      didOpen: () => {
        const fileInput = document.getElementById('document-file-input');
        const dropArea = document.getElementById('file-drop-area');
        const previewContainer = document.getElementById('document-preview-container');
        const existingDocumentsList = document.getElementById('existing-documents-list');

        // Function to render existing documents
        const renderExistingDocuments = (docs) => {
          existingDocumentsList.innerHTML = ''; // Clear previous list
          if (docs.length > 0) {
            docs.forEach((docPath, index) => {
              const docElement = document.createElement('div');
              docElement.className = 'existing-document-item';
              const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(docPath);
              const fileName = docPath.split('/').pop();
              const fullPath = `${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/${docPath}`;

              docElement.innerHTML = `
                <div class="document-icon">
                  ${isImage ?
                  `<img src="${fullPath}" alt="Document" class="document-thumbnail">` :
                  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>`
                }
                </div>
                <div class="document-info">
                  <span class="document-name">${fileName}</span>
                  <span class="document-type">${isImage ? 'image' : 'pdf'}</span>
                </div>
                <button class="document-delete-btn" data-index="${index}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              `;
              existingDocumentsList.appendChild(docElement);
            });

            document.querySelectorAll('.document-delete-btn').forEach(btn => {
              btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const indexToDelete = parseInt(btn.getAttribute('data-index'));
                const updatedDocs = studentDocuments.filter((_, i) => i !== indexToDelete);

                // Update the state and re-render existing documents
                setStudentDocuments(updatedDocs);
                renderExistingDocuments(updatedDocs); // Re-render immediately

                // Persist the change to the backend
                try {
                  const formData = new FormData();
                  // Append all remaining documents (paths)
                  updatedDocs.forEach(docPath => {
                    formData.append('documents', docPath);
                  });
                  // If no documents remain, ensure the 'documents' field is still sent to clear it on backend
                  if (updatedDocs.length === 0) {
                    formData.append('documents', '');
                  }

                  await studentService.updateStudent(currentStudent._id, formData);
                  Swal.fire('Success', 'Document deleted successfully', 'success');
                  fetchStudents(); // Refresh main student list to reflect changes
                } catch (error) {
                  console.error("Error deleting document:", error);
                  Swal.fire('Error', 'Failed to delete document', 'error');
                  // Revert UI if deletion fails
                  setStudentDocuments(studentDocuments);
                  renderExistingDocuments(studentDocuments);
                }
              });
            });
          } else {
            existingDocumentsList.innerHTML = '<p class="no-documents-message">No documents uploaded yet</p>';
          }
        };

        // Initial render of existing documents
        renderExistingDocuments(studentDocuments);

        // Handle file input change
        fileInput.addEventListener('change', (e) => {
          handleFilePreview(e.target.files, previewContainer);
        });

        // Handle drop area click
        dropArea.addEventListener('click', () => {
          fileInput.click();
        });

        // Handle drag and drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
          dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
          }, false);
        });

        dropArea.addEventListener('dragenter', () => {
          dropArea.classList.add('highlight');
        }, false);

        dropArea.addEventListener('dragleave', () => {
          dropArea.classList.remove('highlight');
        }, false);

        dropArea.addEventListener('drop', (e) => {
          dropArea.classList.remove('highlight');
          const files = e.dataTransfer.files;
          fileInput.files = files;
          handleFilePreview(files, previewContainer);
        }, false);

        // Function to handle file preview for new files
        function handleFilePreview(files, container) {
          if (files.length === 0) return;

          // Clear previous previews
          container.innerHTML = '';
          const newSelectedFiles = [];
          const newFilePreviewUrls = [];

          Array.from(files).forEach((file, index) => {
            const fileType = file.type;
            const isValid = fileType.includes('image') || fileType === 'application/pdf';

            if (!isValid) {
              return;
            }

            newSelectedFiles.push(file);
            const reader = new FileReader();
            const previewItem = document.createElement('div');
            previewItem.className = 'document-preview-item';

            reader.onload = (e) => {
              const url = e.target.result;
              newFilePreviewUrls.push({ url, name: file.name, type: file.type, size: file.size });

              if (fileType.includes('image')) {
                previewItem.innerHTML = `
                  <div class="preview-image-container">
                    <img src="${url}" alt="Preview" class="preview-image">
                  </div>
                  <div class="preview-info">
                    <span class="preview-name">${file.name}</span>
                    <span class="preview-size">${formatFileSize(file.size)}</span>
                  </div>
                  <button class="preview-remove-btn" data-index="${index}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                `;
              } else if (fileType === 'application/pdf') {
                previewItem.innerHTML = `
                  <div class="preview-pdf-container">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div class="preview-info">
                    <span class="preview-name">${file.name}</span>
                    <span class="preview-size">${formatFileSize(file.size)}</span>
                  </div>
                  <button class="preview-remove-btn" data-index="${index}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                `;
              }

              container.appendChild(previewItem);

              // Add event listener for remove button
              const removeBtn = previewItem.querySelector('.preview-remove-btn');
              removeBtn.addEventListener('click', () => {
                previewItem.remove();
                // Update the actual file input's FileList
                const dt = new DataTransfer();
                const currentFiles = fileInput.files;
                for (let i = 0; i < currentFiles.length; i++) {
                  if (i !== parseInt(removeBtn.getAttribute('data-index'))) {
                    dt.items.add(currentFiles[i]);
                  }
                }
                fileInput.files = dt.files;
              });
            };

            reader.readAsDataURL(file);
          });
          setSelectedFiles(newSelectedFiles);
          setFilePreviewUrls(newFilePreviewUrls);
        }

        // Helper function to format file size
        function formatFileSize(bytes) {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
      },
      preConfirm: async () => {
        const fileInput = document.getElementById('document-file-input');
        const newFiles = Array.from(fileInput.files); // New files from the input

        if (newFiles.length === 0 && studentDocuments.length === 0) {
          Swal.showValidationMessage('Please select at least one file to upload or ensure existing documents are present.');
          return false;
        }

        if (!currentStudent || !currentStudent._id) {
          Swal.showValidationMessage('Invalid student data. Please try again.');
          return false;
        }

        try {
          setUploadLoading(true);
          const formData = new FormData();

          // Append existing document paths
          studentDocuments.forEach(docPath => {
            formData.append('documents', docPath);
          });

          // Append new files
          newFiles.forEach(file => {
            formData.append('documents', file);
          });

          // If no documents (new or existing) are present, send an empty string to clear the array on backend
          if (studentDocuments.length === 0 && newFiles.length === 0) {
            formData.append('documents', '');
          }

          const response = await studentService.updateStudent(currentStudent._id, formData);
          setUploadLoading(false);

          if (response) { // Assuming a successful response means the update was processed
            return true;
          } else {
            console.error("Unexpected response format:", response);
            Swal.showValidationMessage('Failed to upload documents due to unexpected server response.');
            return false;
          }
        } catch (error) {
          console.error("Error uploading documents:", error);
          setUploadLoading(false);
          Swal.showValidationMessage(`Upload failed: ${error.response?.data?.message || error.message || 'Unknown error'}`);
          return false;
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Success', 'Documents updated successfully', 'success');
        fetchStudents(); // Refresh student data to show updated documents
      }
    });
  };

  const handleAssignCourse = (student) => {
    const courseOptions = courses.map(course =>
      `<option value="${course._id}">${course.name} (${course.duration}) - ₹${course.finalFees}</option>`
    ).join('');

    const currentCoursesHtml = Array.isArray(student.course_id) && student.course_id.length > 0 ? `
      <div class="modern-current-courses">
        <div class="modern-current-courses-header">
          <div class="modern-icon-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </div>
          <h4 class="modern-current-courses-title">Currently Assigned Courses</h4>
        </div>
        <div class="modern-current-courses-grid">
          ${student.course_id.map(course => `
            <div class="modern-course-card">
              <div class="modern-course-card-header">
                <div class="modern-course-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <span class="modern-course-name">${course.name}</span>
              </div>
              <div class="modern-course-duration">${course.duration}</div>
            </div>
          `).join('')}
        </div>
      </div>` : '';

    Swal.fire({
      title: `<div class="modern-title-container">
        <div class="modern-title-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        </div>
        <div class="modern-title-text">
          <h3>Assign Course</h3>
          <p>Select a course to assign to this student</p>
        </div>
      </div>`,
      html: `
        <div class="modern-assign-course-container">
          <div class="modern-student-info">
            <div class="modern-student-avatar">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="modern-student-details">
              <h4 class="modern-student-name">${student.name}</h4>
              <p class="modern-student-email">${student.email}</p>
              <div class="modern-student-status ${student.status === 'Y' ? 'active' : 'inactive'}">
                <span class="modern-status-dot"></span>
                ${student.status === 'Y' ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
          
          <div class="modern-course-selection">
            <div class="modern-select-container">
              <label class="modern-select-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                Select Course
                <span class="modern-required">*</span>
              </label>
              <div class="modern-select-wrapper">
                <select id="courseSelect" class="modern-select">
                  <option value="">Choose a course...</option>
                  ${courseOptions}
                </select>
                <div class="modern-select-arrow">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          ${currentCoursesHtml}
        </div>`,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"></path><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path></svg> Assign Course',
      cancelButtonText: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      showLoaderOnConfirm: true,
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title',
        htmlContainer: 'modern-swal-html',
        confirmButton: 'modern-swal-confirm-btn',
        cancelButton: 'modern-swal-cancel-btn'
      },
      preConfirm: () => {
        const selectedCourseId = document.getElementById('courseSelect').value;
        if (!selectedCourseId) {
          Swal.showValidationMessage('Please select a course to assign');
          return false;
        }
        return selectedCourseId;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const selectedCourseId = result.value;
        handleCourseAssignmentWithId(student, selectedCourseId);
      }
    });
  };

  const handleCourseAssignmentWithId = async (student, courseId) => {
    try {
      // Get current course IDs (handle both array of objects and array of strings)
      let currentCourseIds = [];
      if (Array.isArray(student.course_id)) {
        currentCourseIds = student.course_id.map(course =>
          typeof course === 'object' ? course._id : course
        );
      }

      // Check if course is already assigned
      const isAlreadyAssigned = currentCourseIds.includes(courseId);
      if (isAlreadyAssigned) {
        Swal.fire("Error", "This course is already assigned to the student", "error");
        return;
      }

      // Add new course ID to the array
      const updatedCourseIds = [...currentCourseIds, courseId];

      console.log('Sending course_ids:', updatedCourseIds); // Debug log

      // Try both approaches - FormData and regular object
      try {
        // First try with FormData
        const formData = new FormData();
        formData.append('course_id', JSON.stringify(updatedCourseIds));

        await studentService.updateStudent(student._id, formData);
      } catch (formDataError) {
        console.log('FormData failed, trying with regular object:', formDataError);

        // If FormData fails, try with regular object
        const updateData = {
          course_id: updatedCourseIds
        };

        await studentService.updateStudent(student._id, updateData);
      }

      Swal.fire("Success!", "Course assigned successfully", "success");
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error("Error assigning course:", error);
      Swal.fire("Error", "Failed to assign course", "error");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Loader title="Loading Students" subtitle="Please wait..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={`admin-dashboard-page-container ${isVisible ? "visible" : ""}`}>
        <div className="admin-dashboard-mb-6 animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-d-flex admin-dashboard-justify-between admin-dashboard-align-center admin-dashboard-mb-4">
            <h2 className="admin-dashboard-text-2xl admin-dashboard-font-semibold admin-dashboard-text-heading-color animated animate__animated animate__slideInLeft">Student Management</h2>
            <div className="admin-dashboard-d-flex admin-dashboard-gap-2">
              <button onClick={exportToExcel} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <FileSpreadsheet size={18} className="admin-dashboard-btn-icon" />
                Export to Excel
              </button>
              <button onClick={handleAddStudent} className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-md animated animate__animated animate__slideInRight">
                <Plus size={18} className="admin-dashboard-btn-icon" />
                Add Student
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
              <input
                type="text"
                className="admin-dashboard-search-input"
                placeholder="Search by email..."
                value={searchTermEmail}
                onChange={(e) => setSearchTermEmail(e.target.value)}
              />
            </div>
            <div className="admin-dashboard-search-input-group">
              <input
                type="text"
                className="admin-dashboard-search-input"
                placeholder="Search by mobile..."
                value={searchTermMobile}
                onChange={(e) => setSearchTermMobile(e.target.value)}
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
            <div className="admin-dashboard-search-input-group">
              <select
                className="admin-dashboard-search-select"
                value={courseAssignFilter}
                onChange={(e) => setCourseAssignFilter(e.target.value)}
              >
                <option value="all">All Students</option>
                <option value="assigned">Assigned Course</option>
                <option value="not_assigned">Not Assigned Course</option>
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
            <h3>No students found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="admin-dashboard-overflow-x-auto animated animate__animated animate__fadeInUp">
            <table className="admin-dashboard-table">
              <thead className="admin-dashboard-table-header">
                <tr>
                  {[
                    "S NO",
                    "Name",
                    "Mobile",
                    "Gender",
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
                {filteredData.map((student, index) => (
                  <tr key={student._id} className="admin-dashboard-table-row animated animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="admin-dashboard-sno-cell">{((currentPage - 1) * studentsPerPage) + index + 1}</td>
                    <td className="admin-dashboard-name-column">
                      <div className="admin-dashboard-user-info" onClick={() => navigate(`/admin/students/detail/${student._id}`)} style={{ cursor: 'pointer' }}>
                        <div className="admin-dashboard-user-avatar">
                          <img
                            src={student.profilePicture ? `${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/${student.profilePicture}` : '/dummy-user.jpg'}
                            alt={student.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/dummy-user.jpg';
                            }}
                            className="admin-dashboard-user-avatar-img"
                          />
                        </div>
                        <div className="admin-dashboard-user-details">
                          <div className="admin-dashboard-user-name">{student.name || 'N/A'}</div>
                          <div className="admin-dashboard-user-email">{student.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="admin-dashboard-mobile-cell">{student.mobile || 'N/A'}</td>
                    <td className="admin-dashboard-gender-cell">{student.gender || 'N/A'}</td>
                    {/* <td className="admin-dashboard-status-cell">
                      <span className={`admin-dashboard-status-text ${student.status === "Y" ? 'active' : 'inactive'}`}>
                        {student.status === "Y" ? "Active" : "Inactive"}
                      </span>
                    </td> */}


                    <td className="admin-dashboard-date-cell">
                      {student.createdDate ? (
                        <Moment format="DD/MM/YYYY" utc>{student.createdDate}</Moment>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="admin-dashboard-actions-cell">
                      <div className="admin-dashboard-actions-container">
                        <button
                          onClick={() => navigate(`/admin/students/edit/${student._id}`)}
                          title="Edit Student"
                          className="admin-dashboard-btn-action-icon admin-dashboard-btn-edit"
                        >
                          <Edit size={14} className="admin-dashboard-action-icon-svg" />
                        </button>
                        <button
                          onClick={() => handleAssignCourse(student)}
                          title="Assign Course"
                          className="admin-dashboard-btn-action-icon admin-dashboard-btn-success"
                        >
                          <FaBook className="admin-dashboard-action-icon-svg" />
                        </button>
                        <button
                          onClick={() => handleDocumentUpload(student)}
                          title="Upload Documents"
                          className="admin-dashboard-btn-action-icon admin-dashboard-btn-primary"
                        >
                          <Upload size={14} className="admin-dashboard-action-icon-svg" />
                        </button>
                        <div
                          className={`admin-dashboard-toggle-switch ${student.status === "Y" ? 'active' : 'inactive'}`}
                          onClick={() => handleChangeStatus(student._id, student.status)}
                          title={`Toggle ${student.status === "Y" ? "Inactive" : "Active"}`}
                        >
                          <div className="admin-dashboard-toggle-knob">
                            {student.status === "Y" ? (
                              <span className="admin-dashboard-toggle-knob-icon active">✓</span>
                            ) : (
                              <span className="admin-dashboard-toggle-knob-icon inactive">✗</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(student)}
                          title={Array.isArray(student.course_id) && student.course_id.length > 0
                            ? "Cannot delete - Student has assigned courses"
                            : "Delete Student"}
                          className={`admin-dashboard-btn-action-icon ${Array.isArray(student.course_id) && student.course_id.length > 0
                            ? 'admin-dashboard-btn-disabled'
                            : 'admin-dashboard-btn-delete'
                            }`}
                          disabled={Array.isArray(student.course_id) && student.course_id.length > 0}
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

export default StudentIndex;
