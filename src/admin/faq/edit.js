import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import faqService from "../../services/faqService";
import { Save, ArrowLeft, Loader } from "lucide-react";
import LoaderComponent from "../../components/Loader";
import 'animate.css';

const FaqEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    status: 'Y'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [faq, setFaq] = useState(null);

  useEffect(() => {
    fetchFaq();
  }, [id]);

  useEffect(() => {
    if (faq) {
      // Initialize Summernote when FAQ data is loaded
      if (window.jQuery && window.jQuery().summernote) {
        window.jQuery('#answer').summernote({
          height: 300,
          toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'underline', 'italic', 'clear']],
            ['fontname', ['fontname']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']]
          ],
          callbacks: {
            onChange: function(contents, $editable) {
              setFormData(prev => ({
                ...prev,
                answer: contents
              }));
            }
          }
        });

        // Set the initial content
        window.jQuery('#answer').summernote('code', faq.answer || '');
      }
    }
  }, [faq]);

  const fetchFaq = async () => {
    try {
      const response = await faqService.getFaqById(id);
      const faqData = response.data || response;
      
      setFaq(faqData);
      setFormData({
        question: faqData.question || '',
        answer: faqData.answer || '',
        category: faqData.category || '',
        status: faqData.status || 'Y'
      });
    } catch (error) {
      console.error("Error fetching FAQ:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to load FAQ data. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/admin/faq");
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    }

    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await faqService.updateFaq(id, formData);
      Swal.fire({
        title: "Success!",
        text: "FAQ has been updated successfully.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/admin/faq");
      });
    } catch (error) {
      console.error("Error updating FAQ:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update FAQ. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/admin/faq");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <LoaderComponent title="Loading FAQ" subtitle="Please wait..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-pageContent animated animate__animated animate__fadeIn">
        <div className="admin-mb-6">
          <div className="admin-d-flex admin-justify-between admin-align-center admin-mb-4">
            <h2 className="admin-text-2xl admin-font-semibold admin-text-heading-color animated animate__animated animate__slideInLeft">
              Edit FAQ
            </h2>
            <button
              onClick={handleBack}
              className="admin-btn admin-btn-secondary admin-btn-md animated animate__animated animate__slideInRight"
            >
              <ArrowLeft size={18} className="admin-btn-icon" />
              Back to FAQs
            </button>
          </div>
        </div>

        <div className="admin-card animated animate__animated animate__fadeInUp">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Edit FAQ Information</h3>
            <p className="admin-card-subtitle">Update the details below to modify the FAQ</p>
          </div>

          <div className="admin-card-body">
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="question" className="admin-form-label">
                    Question <span className="admin-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    className={`admin-form-input ${errors.question ? 'admin-form-input-error' : ''}`}
                    placeholder="Enter the question..."
                  />
                  {errors.question && (
                    <span className="admin-form-error">{errors.question}</span>
                  )}
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="category" className="admin-form-label">
                    Category <span className="admin-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`admin-form-input ${errors.category ? 'admin-form-input-error' : ''}`}
                    placeholder="Enter the category..."
                  />
                  {errors.category && (
                    <span className="admin-form-error">{errors.category}</span>
                  )}
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="answer" className="admin-form-label">
                    Answer <span className="admin-required">*</span>
                  </label>
                  <textarea
                    id="answer"
                    name="answer"
                    value={formData.answer}
                    onChange={handleInputChange}
                    className={`admin-form-textarea ${errors.answer ? 'admin-form-textarea-error' : ''}`}
                    placeholder="Enter the answer..."
                    rows="10"
                  />
                  {errors.answer && (
                    <span className="admin-form-error">{errors.answer}</span>
                  )}
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="status" className="admin-form-label">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="admin-form-select"
                  >
                    <option value="Y">Active</option>
                    <option value="N">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  onClick={handleBack}
                  className="admin-btn admin-btn-secondary admin-btn-lg"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary admin-btn-lg"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="admin-spinner admin-spinner-sm"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="admin-btn-icon" />
                      Update FAQ
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        /* Form Styles */
        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .admin-form-row {
          display: flex;
          gap: 1rem;
        }

        .admin-form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .admin-form-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .admin-required {
          color: #ef4444;
        }

        .admin-form-input,
        .admin-form-textarea,
        .admin-form-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          background-color: white;
        }

        .admin-form-input:focus,
        .admin-form-textarea:focus,
        .admin-form-select:focus {
          outline: none;
          border-color: #00BCD4;
          box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
        }

        .admin-form-input-error,
        .admin-form-textarea-error {
          border-color: #ef4444;
        }

        .admin-form-error {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .admin-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        /* Card Styles */
        .admin-card {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .admin-card-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .admin-card-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .admin-card-subtitle {
          margin: 0.5rem 0 0 0;
          opacity: 0.9;
          font-size: 0.875rem;
        }

        .admin-card-body {
          padding: 1.5rem;
        }

        /* Button Styles */
        .admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .admin-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .admin-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .admin-btn-primary {
          background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%);
          color: white;
        }

        .admin-btn-primary:hover {
          background: linear-gradient(135deg, #0097A7 0%, #00796B 100%);
        }

        .admin-btn-secondary {
          background: #6b7280;
          color: white;
        }

        .admin-btn-secondary:hover {
          background: #4b5563;
        }

        .admin-btn-lg {
          padding: 1rem 2rem;
          font-size: 1rem;
        }

        .admin-btn-icon {
          width: 1.125rem;
          height: 1.125rem;
        }

        /* Spinner */
        .admin-spinner {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #00BCD4;
          border-radius: 50%;
          width: 1rem;
          height: 1rem;
          animation: spin 1s linear infinite;
        }

        .admin-spinner-sm {
          width: 0.875rem;
          height: 0.875rem;
          border-width: 1px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .admin-form-row {
            flex-direction: column;
          }
          
          .admin-form-actions {
            flex-direction: column;
          }
          
          .admin-btn {
            justify-content: center;
          }
        }

        /* Summernote Customization */
        .note-editor.note-frame {
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
        }

        .note-editor.note-frame:focus-within {
          border-color: #00BCD4;
          box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
        }

        .note-toolbar {
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .note-editing-area {
          background: white;
        }

        .note-status-output {
          height: 20px;
        }
      `}</style>
    </AdminLayout>
  );
};

export default FaqEdit;
