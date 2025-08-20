import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { studentService, studentDocumentService } from '../../services';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, FileText, X, BookOpen } from 'lucide-react';
import Moment from 'react-moment';
import Loader from '../../components/Loader';
import Swal from 'sweetalert2';
import '../../style/admin-style.css';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [studentDocuments, setStudentDocuments] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const response = await studentService.getStudentById(id);
        
        // Check if student data exists and access the nested 'student' object
        if (response && response.student) {
          setStudentData(response.student);
        } else {
          setStudentData(null); // Explicitly set to null if no student is found
        }

        // Fetch student documents
        const docResponse = await studentDocumentService.getDocumentsByStudentId(id);
        if (docResponse && docResponse.data) {
          setStudentDocuments(docResponse.data);
        } else {
          setStudentDocuments([]);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  const handleBack = () => {
    navigate('/admin/students');
  };

  const handleDeleteDocument = async (docId) => {
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
          await studentDocumentService.deleteDocument(docId);
          setStudentDocuments(prevDocs => prevDocs.filter(doc => doc._id !== docId));
          Swal.fire("Deleted!", "Document has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting document:", error);
          Swal.fire("Error", error.response?.data.message || "Error deleting document", "error");
        }
      }
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Loader title="Loading Student Details" subtitle="Please wait..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-error-container">
          <div className="admin-dashboard-error-message">{error}</div>
          <button onClick={handleBack} className="admin-dashboard-btn admin-dashboard-btn-primary">
            <ArrowLeft size={18} />
            Back to Students
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard-detail-container animated animate__animated animate__fadeIn">
        <div className="admin-dashboard-detail-header">
          <h1 className="admin-dashboard-detail-title">Student Details</h1>
        </div>

        {studentData && (
          <div className="admin-dashboard-detail-content">
            <div className="admin-dashboard-detail-card admin-dashboard-user-profile-card">
              <div className="admin-dashboard-user-profile-header">
                <div className="admin-dashboard-user-profile-image">
                  {studentData.profilePicture ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/${studentData.profilePicture}`}
                      alt={studentData.name}
                      className="admin-dashboard-user-avatar-large round-image"
                      onClick={() => setShowImagePopup(true)}
                      style={{ cursor: 'pointer', borderRadius: '50%', width: '120px', height: '120px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/dummy-user.jpg';
                      }}
                    />
                  ) : (
                    <div
                      className="admin-dashboard-user-avatar-placeholder"
                      style={{ borderRadius: '50%', width: '120px', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                      <User size={40} />
                    </div>
                  )}
                </div>
                <div className="admin-dashboard-user-profile-info">
                  <h2 className="admin-dashboard-user-profile-name">{studentData.name}</h2>
                  <div className="admin-dashboard-user-profile-email">
                    <Mail size={16} />
                    {studentData.email}
                  </div>
                  <div className="admin-dashboard-user-profile-status">
                    <span className={`admin-dashboard-status-badge ${studentData.status === 'Y' ? 'active' : 'inactive'}`}>
                      {studentData.status === 'Y' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="admin-dashboard-user-profile-actions">
                  <button
                    onClick={() => navigate(`/admin/students/edit/${studentData._id}`)}
                    className="admin-dashboard-btn admin-dashboard-btn-primary"
                  >
                    Edit Student
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-dashboard-detail-grid">
              <div className="admin-dashboard-detail-card">
                <div className="admin-dashboard-detail-card-header">
                  <User size={18} />
                  <h3>Personal Information</h3>
                </div>
                <div className="admin-dashboard-detail-card-content">
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <User size={16} /> Full Name
                    </div>
                    <div className="admin-dashboard-detail-item-value">{studentData.name || 'N/A'}</div>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <Mail size={16} /> Email
                    </div>
                    <div className="admin-dashboard-detail-item-value">{studentData.email || 'N/A'}</div>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <Phone size={16} /> Mobile
                    </div>
                    <div className="admin-dashboard-detail-item-value">{studentData.mobile || 'N/A'}</div>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <User size={16} /> Gender
                    </div>
                    <div className="admin-dashboard-detail-item-value">{studentData.gender || 'N/A'}</div>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <Calendar size={16} /> Date of Birth
                    </div>
                    <div className="admin-dashboard-detail-item-value">
                      {studentData.dob ? (
                        <Moment format="MMMM Do, YYYY">{studentData.dob}</Moment>
                      ) : 'N/A'}
                    </div>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <Calendar size={16} /> Created Date
                    </div>
                    <div className="admin-dashboard-detail-item-value">
                      {studentData.createdDate ? (
                        <Moment format="MMMM Do, YYYY">{studentData.createdDate}</Moment>
                      ) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-dashboard-detail-card">
                <div className="admin-dashboard-detail-card-header">
                  <MapPin size={18} />
                  <h3>Address Information</h3>
                </div>
                <div className="admin-dashboard-detail-card-content">
                  <div className="admin-dashboard-detail-item">
                    <div className="admin-dashboard-detail-item-label">
                      <MapPin size={16} /> Address
                    </div>
                    <div className="admin-dashboard-detail-item-value">{studentData.address || 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              {studentData.course_id && studentData.course_id.length > 0 && (
                <div className="admin-dashboard-detail-card">
                  <div className="admin-dashboard-detail-card-header">
                    <BookOpen size={18} />
                    <h3>Assigned Courses</h3>
                  </div>
                  <div className="admin-dashboard-detail-card-content">
                    {studentData.course_id.map((course, index) => (
                      <div key={index} className="admin-dashboard-detail-item">
                        <div className="admin-dashboard-detail-item-label">
                          <BookOpen size={16} /> {course.name}
                        </div>
                        <div className="admin-dashboard-detail-item-value">
                          {course.duration} - ₹{course.finalFees}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {studentDocuments && studentDocuments.length > 0 && (
                <div className="admin-dashboard-detail-card admin-dashboard-documents-card">
                  <div className="admin-dashboard-detail-card-header">
                    <FileText size={18} />
                    <h3>Documents</h3>
                  </div>
                  <div className="admin-dashboard-detail-card-content">
                    <div className="admin-dashboard-documents-grid">
                      {studentDocuments.map((doc) => (
                        <div key={doc._id} className="admin-dashboard-document-item">
                          <div className="admin-dashboard-document-icon">
                            {doc.document_type === 'image' ? (
                              <img src={doc.file_path} alt="Document" className="admin-dashboard-document-thumbnail" />
                            ) : (
                              <FileText size={24} />
                            )}
                          </div>
                          <div className="admin-dashboard-document-info">
                            <div className="admin-dashboard-document-name">{doc.file_path.split('/').pop()}</div>
                            <a
                              href={doc.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-dashboard-document-link"
                            >
                              View Document
                            </a>
                            <button
                              onClick={() => handleDeleteDocument(doc._id)}
                              className="admin-dashboard-document-delete-btn"
                              title="Delete Document"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 10 }}>
        <button
          onClick={handleBack}
          className="admin-dashboard-btn admin-dashboard-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <ArrowLeft size={18} />
          Back to Students
        </button>
      </div>

      {showImagePopup && studentData && studentData.profilePicture && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <button
              onClick={() => setShowImagePopup(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>
            <img
              src={`${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/${studentData.profilePicture}`}
              alt={studentData.name}
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/dummy-user.jpg';
              }}
            />
          </div>
        </div>
      )}
      <div className="admin-dashboard-detail-header">
        <button
          type="button"
          className="admin-dashboard-btn-styled admin-dashboard-btn-styled-secondary"
          style={{ backgroundColor: "#3498db", color: "#fff" }}
          onClick={() => navigate("/admin/students")}
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>
    </AdminLayout>
  );
};

export default StudentDetail;