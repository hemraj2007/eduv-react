import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import packageService from "../../services/packageService";
import { Hash, ArrowLeft, AlertCircle, CheckCircle, Package, Info, Video, Save } from "lucide-react";
import 'animate.css';
import '../../style/admin-style.css';

const EditPackage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit: hookFormSubmit,
    setValue,
    watch,
    formState: { errors },
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
  });

  // Function to handle package info changes
  const handlePackageInfoChange = (field, value) => {
    // You can add any additional logic here if needed
    console.log(`${field} changed to: ${value}`);
  };

  useEffect(() => {
    const fetchPackageData = async () => {
      setIsLoading(true);
      try {
        const response = await packageService.getPackageById(id);
        // The response structure is { data: packageData }
        if (response && response.data) {
          const packageData = response.data;
          setValue("name", packageData.name || "");
          setValue("video_limit", packageData.video_limit || null);
          setValue("position", packageData.position || 0);

          // Set package info fields
          if (packageData.package_info) {
            setValue("package_info.line1", packageData.package_info.line1 || "");
            setValue("package_info.line2", packageData.package_info.line2 || "");
            setValue("package_info.line3", packageData.package_info.line3 || "");
            setValue("package_info.line4", packageData.package_info.line4 || "");
            setValue("package_info.line5", packageData.package_info.line5 || "");
          }
        } else {
          Swal.fire({
            title: "Error",
            text: "Failed to fetch package data",
            icon: "error",
            confirmButtonText: "OK",
          });
          navigate("/admin/package-manager");
        }
      } catch (error) {
        console.error("Error fetching package:", error);
        Swal.fire({
          title: "Error",
          text: "Error fetching package data",
          icon: "error",
          confirmButtonText: "OK",
        });
        navigate("/admin/package-manager");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackageData();
  }, [id, navigate, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await packageService.updatePackage(id, data);
      // Check if response exists and has expected structure
      if (response && (response.success || response.status === 'success')) {
        Swal.fire({
          title: "Success",
          text: "Package updated successfully",
          icon: "success",
          confirmButtonText: "OK",
          willClose: () => {
            navigate("/admin/package-manager");
          },
          customClass: {
            popup: 'animate__animated animate__zoomIn animate__faster'
          }
        });
      } else {
        Swal.fire({
          title: "Error",
          text: (response && response.message) || "Failed to update package",
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            popup: 'animate__animated animate__zoomOut animate__faster'
          }
        });
      }
    } catch (error) {
      console.error("Error updating package:", error);
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: 'animate__animated animate__zoomOut animate__faster'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-loader">
          <div className="admin-dashboard-spinner"></div>
          <p>Loading package data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard-add-user-container visible">
        <div className="admin-dashboard-form-card animated animate__animated animate__fadeIn">
          <div className="admin-dashboard-form-header">
            <h2>Edit Package</h2>
            <p>Update package information</p>
          </div>

          <div className="admin-dashboard-form-body">
            <form onSubmit={hookFormSubmit(onSubmit)} noValidate>
              <div className="d-flex flex-column gap-4">
                {/* First Row: Package Name, Video Limit, and Position - 3 fields in a row */}
                <div className="admin-dashboard-form-row" style={{ display: 'flex', width: '100%', gap: '15px' }}>
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

export default EditPackage;