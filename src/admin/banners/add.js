import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import Swal from 'sweetalert2';
import bannerService from '../../services/bannerService';
import { FaArrowLeft, FaImage, FaHeading, FaFileAlt, FaSortNumericUp, FaCalendarAlt, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';
import { useForm } from 'react-hook-form';

const AddBanner = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingBanners, setExistingBanners] = useState([]);

  const {
    register,                                                                                                                                     
    handleSubmit: hookFormSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      title: "",
      subtitle: "",
      position: "",
      section: "",
      page: "",
      start_date: "",
      end_date: "",
    },
  });

  // Watch form values for validation
  const watchStartDate = watch("start_date");
  const watchEndDate = watch("end_date");
  const watchPosition = watch("position");

  useEffect(() => {
    fetchExistingBanners();
  }, []);

  // Fetch existing banners for position validation
  const fetchExistingBanners = async () => {
    try {
      const response = await bannerService.getAllBanners();
      const banners = Array.isArray(response?.data) ? response.data : [];
      setExistingBanners(banners);
    } catch (error) {
      console.error("Error fetching existing banners:", error);
    }
  };

  // Check if position already exists
  const checkPositionExists = (position) => {
    return existingBanners.some(banner => banner.position === parseInt(position));
  };

  // Validate position
  const validatePosition = (value) => {
    if (!value) return "Position is required";
    
    const position = parseInt(value);
    if (position < 1) return "Position must be at least 1";
    
    if (checkPositionExists(value)) {
      return "This position is already taken by another banner";
    }
    
    return true;
  };

  // Validate start date
  const validateStartDate = (value) => {
    if (!value) return "Start date is required";
    
    const startDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (startDate < today) {
      return "Start date must be today or a future date";
    }
    
    return true;
  };

  // Validate end date
  const validateEndDate = (value) => {
    if (!value) return "End date is required";
    
    const endDate = new Date(value);
    const startDate = watchStartDate ? new Date(watchStartDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (endDate <= today) {
      return "End date must be a future date";
    }
    
    if (startDate && endDate <= startDate) {
      return "End date must be after start date";
    }
    
    return true;
  };

  // Validate image
  const validateImage = (value) => {
    if (!selectedImage) {
      return "Banner image is required";
    }
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Validate image
      if (!selectedImage) {
        setError("image", { message: "Banner image is required" });
        return;
      }

      // Check if position already exists
      if (checkPositionExists(data.position)) {
        Swal.fire({
          title: "Position Already Exists!",
          text: `Position ${data.position} is already taken by another banner. Please choose a different position.`,
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('subtitle', data.subtitle || '');
      formData.append('position', parseInt(data.position));
      formData.append('section', data.section);
      formData.append('page', data.page);
      formData.append('start_date', data.start_date);
      formData.append('end_date', data.end_date);
        formData.append('image', selectedImage);

      console.log("Sending banner data:", {
        title: data.title,
        subtitle: data.subtitle,
        position: data.position,
        section: data.section,
        page: data.page,
        start_date: data.start_date,
        end_date: data.end_date,
        hasImage: !!selectedImage,
      });

      // Debug: Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`FormData ${key}:`, value);
      }

      await bannerService.createBanner(formData);
      
      // Redirect to banner index first
        navigate("/admin/banners");

      // Then show success alert after a short delay
        setTimeout(() => {
          Swal.fire({
            title: "Success!",
            text: "Banner has been added successfully",
            icon: "success",
            confirmButtonText: "OK",
          });
        }, 100);
    } catch (error) {
      console.error("Error adding banner:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      Swal.fire({
        title: "Error!",
        text: error.message || error.response?.data?.message || "Failed to add banner",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              Add New Banner
            </h2>
          </div>

          <form onSubmit={hookFormSubmit(onSubmit)} className="card-body" noValidate>
            <div className="d-flex flex-column gap-4">
              
              {/* First Row: Title and Position */}
              <div className="d-flex gap-4">
                {/* Title */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="title">
                    Title <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaHeading className="text-muted" />
                    </div>
                    <input
                      type="text"
                      id="title"
                      {...register("title", { 
                        required: "Title is required",
                        maxLength: {
                          value: 100,
                          message: "Title cannot exceed 100 characters"
                        }
                      })}
                      className={`form-control pl-10 ${errors.title ? "error" : ""}`}
                      placeholder="Enter banner title"
                    />
                  </div>
                  {errors.title && (
                    <p className="form-error">{errors.title.message}</p>
                  )}
                </div>

                {/* Position */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="position">
                    Position <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaSortNumericUp className="text-muted" />
                    </div>
                    <input
                      type="number"
                      id="position"
                      {...register("position", { 
                        required: "Position is required",
                        validate: validatePosition,
                      })}
                      className={`form-control pl-10 ${errors.position ? "error" : ""}`}
                      placeholder="Enter position number"
                    />
                  </div>
                  {errors.position && (
                    <p className="form-error">{errors.position.message}</p>
                  )}
                </div>
              </div>

              {/* Second Row: Subtitle */}
              <div className="d-flex gap-4">
                {/* Subtitle */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="subtitle">
                    Subtitle
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaFileAlt className="text-muted" />
                    </div>
                    <input
                      type="text"
                      id="subtitle"
                      {...register("subtitle", {
                        maxLength: {
                          value: 200,
                          message: "Subtitle cannot exceed 200 characters"
                        }
                      })}
                      className={`form-control pl-10 ${errors.subtitle ? "error" : ""}`}
                      placeholder="Enter banner subtitle (optional)"
                    />
                  </div>
                  {errors.subtitle && (
                    <p className="form-error">{errors.subtitle.message}</p>
                  )}
                </div>

                {/* Empty div to maintain layout */}
                <div className="form-group" style={{ flex: '1' }}></div>
              </div>

              {/* Third Row: Section and Page */}
              <div className="d-flex gap-4">
                {/* Section */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="section">
                    Section <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaMapMarkerAlt className="text-muted" />
                    </div>
                    <select
                      id="section"
                      {...register("section", { 
                        required: "Section is required"
                      })}
                      className={`form-control pl-10 ${errors.section ? "error" : ""}`}
                    >
                      <option value="">Select Section</option>
                      <option value="Hero">Hero</option>
                      <option value="Promotions">Promotions</option>
                      <option value="Top">Top</option>
                    </select>
                  </div>
                  {errors.section && (
                    <p className="form-error">{errors.section.message}</p>
                  )}
                </div>

                {/* Page */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="page">
                    Page <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaGlobe className="text-muted" />
                    </div>
                  <select
                      id="page"
                      {...register("page", { 
                        required: "Page is required"
                      })}
                      className={`form-control pl-10 ${errors.page ? "error" : ""}`}
                    >
                      <option value="">Select Page</option>
                      <option value="Home">Home</option>
                      <option value="Courses">Courses</option>
                      <option value="About">About</option>
                  </select>
                  </div>
                  {errors.page && (
                    <p className="form-error">{errors.page.message}</p>
                  )}
                </div>
              </div>

              {/* Fourth Row: Start Date and End Date */}
              <div className="d-flex gap-4">
                {/* Start Date */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="start_date">
                    Start Date <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaCalendarAlt className="text-muted" />
                    </div>
                    <input
                      type="date"
                      id="start_date"
                      {...register("start_date", { 
                        required: "Start date is required",
                        validate: validateStartDate,
                      })}
                      className={`form-control pl-10 ${errors.start_date ? "error" : ""}`}
                    />
                  </div>
                  {errors.start_date && (
                    <p className="form-error">{errors.start_date.message}</p>
                  )}
                </div>

                {/* End Date */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="end_date">
                    End Date <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaCalendarAlt className="text-muted" />
                    </div>
                    <input
                      type="date"
                      id="end_date"
                      {...register("end_date", { 
                        required: "End date is required",
                        validate: validateEndDate,
                      })}
                      className={`form-control pl-10 ${errors.end_date ? "error" : ""}`}
                    />
                  </div>
                  {errors.end_date && (
                    <p className="form-error">{errors.end_date.message}</p>
                  )}
                </div>
              </div>

              {/* Fifth Row: Image Upload */}
              <div className="d-flex gap-4">
                {/* Image Upload */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="image">
                    Banner Image <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaImage className="text-muted" />
                    </div>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={`form-control pl-10 ${errors.image ? "error" : ""}`}
                    />
                  </div>
                  {errors.image && (
                    <p className="form-error">{errors.image.message}</p>
                  )}
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-3">
                      <p className="text-sm text-muted mb-2">Image Preview:</p>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ maxWidth: '200px', maxHeight: '150px' }}
                      />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview('');
                          }}
                          className="btn btn-sm btn-danger"
                          style={{ 
                            position: 'absolute', 
                            top: '5px', 
                            right: '5px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            padding: '0',
                            fontSize: '12px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Empty div to maintain layout */}
                <div className="form-group" style={{ flex: '1' }}></div>
              </div>
            </div>

            <div className="card-footer">
              <div className="d-flex justify-between align-center gap-4">
                {/* Back Button (Left-Bottom) */}
                <button
                  type="button"
                  onClick={() => navigate("/admin/banners")}
                  className="btn btn-secondary"
                >
                  <FaArrowLeft className="mr-2" /> Back
                </button>

                {/* Submit Button (Right-Bottom) */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                      Adding...
                    </>
                  ) : (
                    "Add Banner"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddBanner;