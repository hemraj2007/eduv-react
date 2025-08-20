import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import Swal from 'sweetalert2';
import sliderService from '../../services/sliderService';
import { FaArrowLeft, FaImage, FaHeading, FaFileAlt, FaSortNumericUp, FaAlignLeft } from 'react-icons/fa';
import { useForm } from 'react-hook-form';

const EditSlider = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [existingSliders, setExistingSliders] = useState([]);
  const [currentSlider, setCurrentSlider] = useState(null);

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
      description: "",
    },
    mode: "onChange",
  });

  const watchPosition = watch("position");

  useEffect(() => {
    fetchSliderData();
    fetchExistingSliders();
  }, [id]);

  const fetchSliderData = async () => {
    try {
      setIsLoading(true);
      const response = await sliderService.getSliderById(id);
      
      if (response?.data) {
        const sliderData = response.data;
        console.log("Slider Data:", sliderData);
        console.log("Image field from API:", sliderData.image);
        
        // Set current slider for position validation
        setCurrentSlider(sliderData);
        
        // Set form values
        setValue("title", sliderData.title || "");
        setValue("subtitle", sliderData.subtitle || "");
        setValue("position", sliderData.position || "");
        setValue("description", sliderData.description || "");
        
        // Set current image with proper URL construction
        if (sliderData.image) {
          const imageUrl = sliderData.image.startsWith('http') 
            ? sliderData.image 
            : `${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/sliders/${sliderData.image}`;
          
          console.log("Constructed image URL:", imageUrl);
          console.log("API Base URL:", process.env.REACT_APP_API_URL);
          
          setCurrentImage(imageUrl);
          setImagePreview(imageUrl);
        } else {
          console.log("No image found in slider data");
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: "Slider not found",
          icon: "error",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/admin/sliders");
        });
      }
    } catch (error) {
      console.error("Error fetching slider data:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to fetch slider data",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/admin/sliders");
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingSliders = async () => {
    try {
      const response = await sliderService.getAllSliders();
      if (response?.sliders) {
        setExistingSliders(response.sliders);
      }
    } catch (error) {
      console.error("Error fetching existing sliders:", error);
    }
  };

  // Check if position already exists (excluding current slider)
  const checkPositionExists = (position) => {
    if (!position) return false;
    return existingSliders.some(slider => 
      slider.position === parseInt(position) && slider._id !== id
    );
  };

  // Validate position
  const validatePosition = (value) => {
    if (!value) return "Position is required";
    
    const position = parseInt(value);
    if (position < 1) return "Position must be at least 1";
    
    if (checkPositionExists(value)) {
      return "This position is already taken by another slider";
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
      // Validate required fields
      if (!data.title || data.title.trim() === '') {
        throw new Error("Title is required");
      }
      if (!data.position || String(data.position).trim() === '') {
        throw new Error("Position is required");
      }

      // Check if position already exists
      if (checkPositionExists(data.position)) {
        Swal.fire({
          title: "Position Already Exists!",
          text: `Position ${data.position} is already taken by another slider. Please choose a different position.`,
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('subtitle', data.subtitle || '');
      formData.append('description', data.description || '');
      formData.append('position', parseInt(data.position));
      formData.append('status', currentSlider?.status || 'Y'); // Keep existing status

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      console.log("Sending slider data:", {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        position: data.position,
        status: currentSlider?.status || 'Y',
        hasNewImage: !!selectedImage,
      });

      await sliderService.updateSlider(id, formData);
      
      // Redirect to slider index first
      navigate("/admin/sliders");
      
      // Then show success alert after a short delay
      setTimeout(() => {
      Swal.fire({
        title: "Success!",
        text: "Slider has been updated successfully",
        icon: "success",
        confirmButtonText: "OK",
      });
      }, 100);
    } catch (error) {
      console.error("Error updating slider:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || error.response?.data?.message || "Failed to update slider",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="card">
            <div className="card-body text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading slider data...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              Edit Slider
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
                      placeholder="Enter slider title"
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

              {/* Second Row: Subtitle and Description */}
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
                      placeholder="Enter slider subtitle (optional)"
                    />
                  </div>
                  {errors.subtitle && (
                    <p className="form-error">{errors.subtitle.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="description">
                    Description
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute top-0 left-0 pl-3 pt-3 pointer-events-none">
                      <FaAlignLeft className="text-muted" />
                    </div>
                    <textarea
                      id="description"
                      {...register("description", {
                        maxLength: {
                          value: 500,
                          message: "Description cannot exceed 500 characters"
                        }
                      })}
                      className={`form-control pl-10 ${errors.description ? "error" : ""}`}
                      placeholder="Enter slider description (optional)"
                      rows="4"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                  {errors.description && (
                    <p className="form-error">{errors.description.message}</p>
                  )}
                </div>
              </div>

              {/* Third Row: Image Upload */}
              <div className="d-flex gap-4">
                {/* Image Upload */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="image">
                    Slider Image
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
                      className="form-control pl-10"
                    />
                  </div>
                  
                  {/* Current Image Display */}
                  {currentImage && (
                    <div className="mt-3">
                      <p className="text-sm text-muted mb-2">Current Image:</p>
                      <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '10px', background: '#f9f9f9' }}>
                      <img
                        src={currentImage}
                        alt="Current"
                        className="img-thumbnail"
                          style={{ 
                            maxWidth: '200px', 
                            maxHeight: '150px',
                            display: 'block',
                            border: '1px solid #ccc'
                          }}
                          onError={(e) => {
                            console.log("Image failed to load:", e.target.src);
                            e.target.style.display = 'none';
                            // Show a placeholder or error message
                            const parent = e.target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div style="
                                  width: 200px; 
                                  height: 150px; 
                                  background: #f8f9fa; 
                                  border: 1px solid #dee2e6; 
                                  border-radius: 4px; 
                                  display: flex; 
                                  align-items: center; 
                                  justify-content: center;
                                  color: #6c757d;
                                  font-size: 12px;
                                ">
                                  <div style="text-align: center;">
                                    <div>❌</div>
                                    <div>Image not found</div>
                                    <div style="font-size: 10px; margin-top: 4px;">${e.target.src}</div>
                                  </div>
                                </div>
                              `;
                            }
                          }}
                          onLoad={(e) => {
                            console.log("Current image loaded successfully:", e.target.src);
                            e.target.style.display = 'block';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* New Image Preview */}
                  {imagePreview && selectedImage && (
                    <div className="mt-3">
                      <p className="text-sm text-muted mb-2">New Image Preview:</p>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ maxWidth: '200px', maxHeight: '150px' }}
                      />
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
                  onClick={() => navigate("/admin/sliders")}
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
                  {isSubmitting ? "Saving..." : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditSlider; 