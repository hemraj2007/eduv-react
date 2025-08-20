import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import packageService from "../../services/packageService";
import { useForm } from "react-hook-form";
import {
  Package,
  Info,
  ArrowLeft,
  Video,
  Save,
  CheckCircle,
  AlertCircle,
  Hash
} from "lucide-react";
import '../../style/admin-style.css';
import 'animate.css';

const AddPackage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);
  }, []);

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      video_limit: null,
      position: "",
      package_info: {
        line1: "",
        line2: "",
        line3: "",
        line4: "",
        line5: "",
      },
    },
    mode: "onChange",
  });

  // Watch all package info fields for real-time validation
  const watchPackageInfo = watch("package_info");

  // Function to check character limit and show alert
  const handlePackageInfoChange = (fieldName, value) => {
    if (value && value.length > 50) {
      Swal.fire({
        title: "Character Limit Exceeded!",
        text: `${fieldName} cannot exceed 50 characters. Current length: ${value.length}`,
        icon: "warning",
        confirmButtonText: "OK",
      });
      return false;
    }
    return true;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Validate package info fields
      const packageInfo = data.package_info;
      const requiredFields = ['line1', 'line2', 'line3', 'line4', 'line5'];

      for (const field of requiredFields) {
        if (!packageInfo[field] || packageInfo[field].trim() === '') {
          throw new Error(`${field.replace('line', 'Line ')} is required`);
        }
        if (packageInfo[field].length > 50) {
          throw new Error(`${field.replace('line', 'Line ')} cannot exceed 50 characters`);
        }
      }

      // Handle video limit - if empty string, set to null
      if (data.video_limit === '') {
        data.video_limit = null;
      }

      // Handle position - if empty string, set to 0
      if (data.position === '') {
        data.position = 0;
      } else {
        data.position = parseInt(data.position) || 0;
      }

      await packageService.createPackage(data);

      // Show success popup with animation
      Swal.fire({
        title: '<div class="success-popup-header"><CheckCircle class="success-icon" /><span>Success!</span></div>',
        text: "Package has been added successfully",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#10b981",
        customClass: {
          popup: 'animated-popup success-popup',
          title: 'success-popup-title',
          confirmButton: 'success-popup-btn'
        },
        showClass: {
          popup: 'animate__animated animate__zoomIn animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__zoomOut animate__faster'
        }
      });

      // Store success message in sessionStorage and redirect
      sessionStorage.setItem('packageSuccess', 'Package has been added successfully');
      navigate("/admin/package-manager");
    } catch (error) {
      console.error("Error adding package:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || error.response?.data?.message || "Failed to add package",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: 'animated shake faster'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className={`admin-dashboard-add-user-container ${isVisible ? 'visible' : ''}`}>
        <div className="admin-dashboard-form-card animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-form-header">
            <h2>Add Package</h2>

          </div>

          <div className="admin-dashboard-form-body">
            <form onSubmit={hookFormSubmit(onSubmit)} noValidate>
              <div className="d-flex flex-column gap-4">
                {/* First Row: Package Name, Video Limit, and Position - 3 fields in a row */}
                <div className="admin-dashboard-form-row-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {/* Package Name */}
                  <div className="admin-dashboard-form-group-animated" style={{ flex: 1 }}>
                    <label className="admin-dashboard-form-label-with-icon">
                      <Package size={18} />
                      Package Name
                    </label>
                    <input
                      type="text"
                      {...register("name", { required: "Package name is required" })}
                      className={`admin-dashboard-form-input-styled ${errors.name ? "error" : ""}`}
                      placeholder="Enter package name"
                    />
                    {errors.name && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.name.message}
                      </div>
                    )}
                  </div>

                  {/* Video Limit */}
                  <div className="admin-dashboard-form-group-animated" style={{ flex: 1 }}>
                    <label className="admin-dashboard-form-label-with-icon">
                      <Video size={18} />
                      Video Limit
                    </label>
                    <input
                      type="number"
                      {...register("video_limit", {
                        min: { value: 1, message: "Video limit must be at least 1" },
                        setValueAs: (value) => value === "" ? null : parseInt(value)
                      })}
                      className={`admin-dashboard-form-input-styled ${errors.video_limit ? "error" : ""}`}
                      placeholder="Enter video limit (optional)"
                      min="1"
                    />
                    {errors.video_limit && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.video_limit.message}
                      </div>
                    )}
                    <small className="text-muted">Leave empty for unlimited videos</small>
                  </div>

                  {/* Position */}
                  <div className="admin-dashboard-form-group-animated" style={{ flex: 1 }}>
                    <label className="admin-dashboard-form-label-with-icon">
                      <Hash size={18} />
                      Position
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register("position", {
                        min: { value: 0, message: "Position must be 0 or greater" }
                      })}
                      className={`admin-dashboard-form-input-styled ${errors.position ? "error" : ""}`}
                      placeholder="Enter position (optional)"
                    />
                    {errors.position && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.position.message}
                      </div>
                    )}
                    <small className="text-muted">Position determines the order of display (0 = first)</small>
                  </div>
                </div>

                {/* Package Information Section */}
                <div className="admin-dashboard-form-section-title" style={{ marginTop: '20px', marginBottom: '15px' }}>
                  <Info size={18} />
                  <span>Package Information</span>
                </div>

                {/* First Row of Package Info: Line 1, Line 2, Line 3 - 3 fields in a row */}
                <div className="admin-dashboard-form-row" style={{ display: 'flex', width: '100%', gap: '15px' }}>
                  {/* Line 1 */}
                  <div className="admin-dashboard-form-group-animated" style={{ flex: 1 }}>
                    <label className="admin-dashboard-form-label-with-icon">
                      <Info size={18} />
                      Line 1
                    </label>
                    <input
                      type="text"
                      className={`admin-dashboard-form-input-styled ${errors.package_info?.line1 ? 'error' : ''}`}
                      placeholder="Enter package information line 1"
                      maxLength={50}
                      {...register("package_info.line1", {
                        required: "Line 1 is required",
                        maxLength: { value: 50, message: "Line 1 cannot exceed 50 characters" }
                      })}
                      onChange={(e) => handlePackageInfoChange("Line 1", e.target.value)}
                    />
                    {errors.package_info?.line1 && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.package_info.line1.message}
                      </div>
                    )}
                  </div>

                  {/* Line 2 */}
                  <div className="admin-dashboard-form-group-animated" style={{ flex: 1 }}>
                    <label className="admin-dashboard-form-label-with-icon">
                      <Info size={18} />
                      Line 2
                    </label>
                    <input
                      type="text"
                      className={`admin-dashboard-form-input-styled ${errors.package_info?.line2 ? 'error' : ''}`}
                      placeholder="Enter package information line 2"
                      maxLength={50}
                      {...register("package_info.line2", {
                        required: "Line 2 is required",
                        maxLength: { value: 50, message: "Line 2 cannot exceed 50 characters" }
                      })}
                      onChange={(e) => handlePackageInfoChange("Line 2", e.target.value)}
                    />
                    {errors.package_info?.line2 && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.package_info.line2.message}
                      </div>
                    )}
                  </div>

                  {/* Line 3 */}
                  <div className="admin-dashboard-form-group-animated" style={{ flex: 1 }}>
                    <label className="admin-dashboard-form-label-with-icon">
                      <Info size={18} />
                      Line 3
                    </label>
                    <input
                      type="text"
                      className={`admin-dashboard-form-input-styled ${errors.package_info?.line3 ? 'error' : ''}`}
                      placeholder="Enter package information line 3"
                      maxLength={50}
                      {...register("package_info.line3", {
                        required: "Line 3 is required",
                        maxLength: { value: 50, message: "Line 3 cannot exceed 50 characters" }
                      })}
                      onChange={(e) => handlePackageInfoChange("Line 3", e.target.value)}
                    />
                    {errors.package_info?.line3 && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.package_info.line3.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Second Row of Package Info: Line 4, Line 5, Empty - 3 fields in a row */}
                <div className="admin-dashboard-form-row" style={{ display: 'flex', width: '100%', gap: '15px' }}>
                  {/* Line 4 */}
                  <div className="admin-dashboard-form-group-animated" style={{ flex: 1 }}>
                    <label className="admin-dashboard-form-label-with-icon">
                      <Info size={18} />
                      Line 4
                    </label>
                    <input
                      type="text"
                      className={`admin-dashboard-form-input-styled ${errors.package_info?.line4 ? 'error' : ''}`}
                      placeholder="Enter package information line 4"
                      maxLength={50}
                      {...register("package_info.line4", {
                        required: "Line 4 is required",
                        maxLength: { value: 50, message: "Line 4 cannot exceed 50 characters" }
                      })}
                      onChange={(e) => handlePackageInfoChange("Line 4", e.target.value)}
                    />
                    {errors.package_info?.line4 && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.package_info.line4.message}
                      </div>
                    )}
                  </div>

                  {/* Line 5 */}
                  <div className="admin-dashboard-form-group-animated" style={{ flex: 1 }}>
                    <label className="admin-dashboard-form-label-with-icon">
                      <Info size={18} />
                      Line 5
                    </label>
                    <input
                      type="text"
                      className={`admin-dashboard-form-input-styled ${errors.package_info?.line5 ? 'error' : ''}`}
                      placeholder="Enter package information line 5"
                      maxLength={50}
                      {...register("package_info.line5", {
                        required: "Line 5 is required",
                        maxLength: { value: 50, message: "Line 5 cannot exceed 50 characters" }
                      })}
                      onChange={(e) => handlePackageInfoChange("Line 5", e.target.value)}
                    />
                    {errors.package_info?.line5 && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.package_info.line5.message}
                      </div>
                    )}
                  </div>

                  {/* Empty div to maintain 3 columns layout */}
                  <div className="admin-dashboard-form-group-animated" style={{ flex: 1 }}>
                    {/* Intentionally left empty to maintain 3-column layout */}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="admin-dashboard-form-actions-styled" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>

                  <button
                    type="button"
                    className="admin-dashboard-btn-styled admin-dashboard-btn-styled-secondary"
                    style={{ backgroundColor: "#3498db", color: "#fff" }}
                    onClick={() => navigate("/admin/package-manager")}
                  >
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    type="submit"
                    className="admin-dashboard-btn-styled admin-dashboard-btn-styled-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="admin-dashboard-spinner admin-dashboard-spinner-sm" role="status"></div>{" "}
                        Submitting Package...
                      </>
                    ) : (
                      <>
                        <Save size={18} /> Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddPackage;