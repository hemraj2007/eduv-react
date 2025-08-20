import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import staticPageService from "../../services/staticPageService";
import "../../style/admin-style.css";
import "animate.css";

const StaticPageEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    content: "",
    status: "Y",
    textBlocks: [{ heading: "", content: "" }]
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line
  }, [id]);

  const fetchPage = async () => {
    setLoading(true);
    try {
      const res = await staticPageService.getStaticPageById(id);
      setFormData({
        title: res.title || "",
        slug: res.slug || "",
        metaTitle: res.metaTitle || "",
        metaDescription: res.metaDescription || "",
        content: res.content || "",
        status: res.status || "Y",
        textBlocks: res.textBlocks && res.textBlocks.length > 0 
          ? res.textBlocks 
          : [{ heading: "", content: "" }]
      });
    } catch (error) {
      Swal.fire("Error", "Failed to fetch static page", "error");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title) errs.title = "Title is required";
    if (!formData.slug) errs.slug = "Slug is required";
    if (!formData.content) errs.content = "Content is required";
    return errs;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleTextBlockChange = (index, field, value) => {
    const updatedBlocks = [...formData.textBlocks];
    updatedBlocks[index] = { ...updatedBlocks[index], [field]: value };
    setFormData({ ...formData, textBlocks: updatedBlocks });
  };

  const addTextBlock = () => {
    setFormData({
      ...formData,
      textBlocks: [...formData.textBlocks, { heading: "", content: "" }]
    });
  };

  const removeTextBlock = (index) => {
    if (formData.textBlocks.length <= 1) return;
    const updatedBlocks = formData.textBlocks.filter((_, i) => i !== index);
    setFormData({ ...formData, textBlocks: updatedBlocks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      // Ensure status is set to "Y" by default
      const dataToSubmit = {
        ...formData,
        status: "Y"
      };
      
      await staticPageService.updateStaticPage(id, dataToSubmit);
      
      // First navigate, then show alert
      navigate("/admin/static-page");
      
      // Show success message after a short delay
      setTimeout(() => {
        Swal.fire("Success", "Static page updated!", "success");
      }, 100);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to update static page", "error");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-loading-container">
          <p>Loading page...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard-pageContent">
        <div className="admin-dashboard-edit-user-container visible">
          <div className="admin-dashboard-form-card animated animate__animated animate__fadeIn">
            <div className="admin-dashboard-form-header">
              <h2>Edit Static Page</h2>
              <p>Update the details of the static page.</p>
            </div>
            <form className="admin-dashboard-form admin-dashboard-form-body" onSubmit={handleSubmit}>
              {/* First row - Title and Slug */}
              <div className="admin-dashboard-form-row">
                <div className="admin-dashboard-form-group admin-dashboard-form-group-half">
                  <label className="admin-dashboard-form-label">Title <span className="admin-dashboard-required">*</span></label>
                  <input 
                    type="text" 
                    name="title" 
                    className="admin-dashboard-form-input" 
                    value={formData.title} 
                    onChange={handleChange} 
                  />
                  {errors.title && <div className="admin-dashboard-form-error">{errors.title}</div>}
                </div>
                <div className="admin-dashboard-form-group admin-dashboard-form-group-half">
                  <label className="admin-dashboard-form-label">Slug <span className="admin-dashboard-required">*</span></label>
                  <input 
                    type="text" 
                    name="slug" 
                    className="admin-dashboard-form-input" 
                    value={formData.slug} 
                    onChange={handleChange} 
                  />
                  {errors.slug && <div className="admin-dashboard-form-error">{errors.slug}</div>}
                </div>
              </div>
              
              {/* Second row - Meta Title and Meta Description */}
              <div className="admin-dashboard-form-row">
                <div className="admin-dashboard-form-group admin-dashboard-form-group-half">
                  <label className="admin-dashboard-form-label">Meta Title</label>
                  <input 
                    type="text" 
                    name="metaTitle" 
                    className="admin-dashboard-form-input" 
                    value={formData.metaTitle} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="admin-dashboard-form-group admin-dashboard-form-group-half">
                  <label className="admin-dashboard-form-label">Meta Description</label>
                  <input 
                    type="text" 
                    name="metaDescription" 
                    className="admin-dashboard-form-input" 
                    value={formData.metaDescription} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              
              {/* Content with CKEditor */}
              <div className="admin-dashboard-form-group">
                <label className="admin-dashboard-form-label">Content <span className="admin-dashboard-required">*</span></label>
                <textarea
                  name="content"
                  className="admin-dashboard-form-textarea"
                  rows={10}
                  value={formData.content}
                  onChange={handleChange}
                />
                {errors.content && <div className="admin-dashboard-form-error">{errors.content}</div>}
              </div>
              
              {/* Text Blocks Section */}
              <div className="admin-dashboard-form-section">
                <div className="admin-dashboard-form-section-header">
                  <h3>Text Blocks</h3>
                  <button 
                    type="button" 
                    className="admin-dashboard-btn admin-dashboard-btn-primary admin-dashboard-btn-sm"
                    onClick={addTextBlock}
                  >
                    Add Block
                  </button>
                </div>
                
                {formData.textBlocks.map((block, index) => (
                  <div key={index} className="admin-dashboard-form-text-block">
                    <div className="admin-dashboard-form-text-block-header">
                      <h4>Block {index + 1}</h4>
                      <button 
                        type="button" 
                        className="admin-dashboard-btn admin-dashboard-btn-danger admin-dashboard-btn-sm"
                        onClick={() => removeTextBlock(index)}
                        disabled={formData.textBlocks.length <= 1}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="admin-dashboard-form-group">
                      <label className="admin-dashboard-form-label">Heading</label>
                      <input 
                        type="text" 
                        className="admin-dashboard-form-input" 
                        value={block.heading} 
                        onChange={(e) => handleTextBlockChange(index, 'heading', e.target.value)} 
                      />
                    </div>
                    
                    <div className="admin-dashboard-form-group">
                      <label className="admin-dashboard-form-label">Content</label>
                      <textarea 
                        className="admin-dashboard-form-textarea" 
                        rows={4} 
                        value={block.content} 
                        onChange={(e) => handleTextBlockChange(index, 'content', e.target.value)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Repositioned buttons */}
              <div className="admin-dashboard-form-actions admin-dashboard-form-actions-spaced">
                <button type="button" className="admin-dashboard-btn admin-dashboard-btn-secondary" onClick={() => navigate("/admin/static-page")}>
                  Back
                </button>
                <button type="submit" className="admin-dashboard-btn admin-dashboard-btn-success" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Update Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StaticPageEdit;