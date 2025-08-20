import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import staticPageService from "../../services/staticPageService";
import "../../style/admin-style.css";
import "animate.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const StaticPageAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    content: "",
    textBlocks: [{ heading: "", content: "" }],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate required fields
  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = "Title is required";
    if (!formData.slug.trim()) errs.slug = "Slug is required";
    if (!formData.content.trim() || formData.content === "<p><br></p>") errs.content = "Content is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMainContentChange = (value) => {
    setFormData(prev => ({
      ...prev,
      content: value,
    }));
  };

  // For UI only - not submitted to backend
  const handleTextBlockChange = (index, field, value) => {
    const updatedBlocks = [...formData.textBlocks];
    updatedBlocks[index] = { ...updatedBlocks[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      textBlocks: updatedBlocks,
    }));
  };

  const addTextBlock = () => {
    setFormData(prev => ({
      ...prev,
      textBlocks: [...prev.textBlocks, { heading: "", content: "" }],
    }));
  };

  const removeTextBlock = (index) => {
    if (formData.textBlocks.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      textBlocks: prev.textBlocks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);

    try {
      // REMOVE FIELDS NOT ALLOWED BY BACKEND
      const { metaTitle, metaDescription, textBlocks, ...restFormData } = formData;
      const apiData = {
        ...restFormData,
        status: "Y",
      };
      await staticPageService.addStaticPage(apiData);

      // Redirect first, then show success
      navigate("/admin/static-page");
      setTimeout(() => {
        Swal.fire("Success", "Static page added successfully!", "success");
      }, 100);
    } catch (error) {
      setIsSubmitting(false);
      Swal.fire("Error", error.response?.data?.message || "Failed to add static page", "error");
    }
  };

  return (
    <AdminLayout>
      <div className="admin-dashboard-pageContent">
        <div className="admin-dashboard-add-user-container visible">
          <div className="admin-dashboard-form-card animated animate__animated animate__fadeIn">
            <div className="admin-dashboard-form-header">
              <h2>Add Static Page</h2>
              <p>Fill in the details to add a new static page.</p>
            </div>
            <form className="admin-dashboard-form admin-dashboard-form-body" onSubmit={handleSubmit}>
              {/* Title + Slug */}
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

              {/* Meta Title + Meta Desc (for UI only, not submitted to API) */}
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

              {/* Main Content (with ReactQuill) */}
              <div className="admin-dashboard-form-group">
                <label className="admin-dashboard-form-label">Content <span className="admin-dashboard-required">*</span></label>
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleMainContentChange}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ["bold", "italic", "underline"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link", "image"],
                      ["clean"],
                    ],
                  }}
                  formats={[
                    "header",
                    "bold", "italic", "underline",
                    "list", "bullet",
                    "link", "image",
                  ]}
                />
                {errors.content && <div className="admin-dashboard-form-error">{errors.content}</div>}
              </div>

              <div className="admin-dashboard-form-actions admin-dashboard-form-actions-spaced">
                <button type="button" className="admin-dashboard-btn admin-dashboard-btn-secondary" onClick={() => navigate("/admin/static-page")}>
                  Back
                </button>
                <button type="submit" className="admin-dashboard-btn admin-dashboard-btn-success" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Add Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StaticPageAdd;
