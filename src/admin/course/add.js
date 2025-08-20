import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import courseService from "../../services/courseService";
import { useForm } from "react-hook-form";
import { Book, Clock, DollarSign, ArrowLeft, Image, AlertCircle, Save } from "lucide-react";
import '../../style/admin-style.css';
import 'animate.css';

const MAX_AMOUNT = 5000000;

const AddCourse = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseImage, setCourseImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      name: "",
      durationValue: "",
      durationUnit: "Years",
      actualFees: "",
      discount: "0",
      finalFees: 0
    },
  });

  const watchActualFees = watch("actualFees");
  const watchDiscount = watch("discount");
  const watchDurationValue = watch("durationValue");
  const watchDurationUnit = watch("durationUnit");

  useEffect(() => {
    const actual = parseInt(watchActualFees || "0", 10);
    const disc = parseInt(watchDiscount || "0", 10);
    const final = Math.max(actual - disc, 0);
    setValue("finalFees", final);
  }, [watchActualFees, watchDiscount, setValue]);

  useEffect(() => {
    if (watchDurationValue && parseInt(watchDurationValue) > 0) {
      const value = parseInt(watchDurationValue);
      const unit = watchDurationUnit.toLowerCase();
      const unitText = value === 1 ? unit.slice(0, -1) : unit;
      setValue("duration", `${value} ${unitText}`);
    } else {
      setValue("duration", "");
    }
  }, [watchDurationValue, watchDurationUnit, setValue]);

  const validateDuration = (value) => {
    if (!value) return "Duration is required";

    const intValue = parseInt(value);
    let maxValue;
    let errorMessage;

    switch (watchDurationUnit) {
      case "Years":
        maxValue = 2;
        errorMessage = "Maximum duration is 2 years.";
        break;
      case "Months":
        maxValue = 12;
        errorMessage = "Maximum duration is 12 months.";
        break;
      case "Days":
        maxValue = 365;
        errorMessage = "Maximum duration is 365 days.";
        break;
      default:
        maxValue = 1;
    }

    if (intValue > maxValue) {
      return errorMessage;
    }

    return true;
  };

  const validateDiscount = (value) => {
    // Discount is not required, default to 0
    if (!value) return true;

    const actual = parseInt(watchActualFees || "0", 10);
    const disc = parseInt(value || "0", 10);

    if (disc > actual) {
      return "Discount cannot exceed actual fees";
    }

    if (disc > MAX_AMOUNT) {
      return "Discount cannot exceed 50 lakhs";
    }

    return true;
  };

  const validateImage = () => {
    if (!courseImage) {
      return "Course image is required";
    }
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire("Error", "Please select a valid image file (JPEG, PNG, GIF)", "error");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        Swal.fire("Error", "Image size should be less than 5MB", "error");
        return;
      }

      setCourseImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCourseImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('courseImage');
    if (fileInput) fileInput.value = '';
  };

  const handleDurationUnitChange = (unit) => {
    setValue("durationUnit", unit);
    clearErrors("durationValue");

    if (watchDurationValue) {
      const result = validateDuration(watchDurationValue);
      if (result !== true) {
        setError("durationValue", { message: result });
      }
    }
  };

  const handleAmountChange = (value, fieldName, maxVal, depMax = null) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    let numVal = numericValue ? parseInt(numericValue, 10) : "";

    if (numVal === 0) numVal = "";

    let effectiveMax = depMax !== null ? Math.min(maxVal, depMax) : maxVal;
    if (numVal !== "" && numVal > effectiveMax) numVal = effectiveMax;

    setValue(fieldName, numVal === "" ? "" : numVal.toString());
  };

  const handleFocus = (val, fieldName) => () => {
    if (!val || val === "0") setValue(fieldName, "");
  };

  const onSubmit = async (data) => {
    const imageValidation = validateImage();
    if (imageValidation !== true) {
      Swal.fire({
        title: "Image Required",
        text: imageValidation,
        icon: "error"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('duration', data.duration);
      formData.append('actualFees', parseInt(data.actualFees) || 0);
      formData.append('discount', parseInt(data.discount) || 0);
      formData.append('finalFees', data.finalFees || 0);
      formData.append('status', 'Y'); // Default status to active (Y)

      if (courseImage) {
        formData.append('courseImage', courseImage);
      }

      await courseService.addCourse(formData);
      navigate("/admin/course");

      setTimeout(() => {
        Swal.fire({
          title: "Success",
          text: "Course has been added successfully!",
          icon: "success"
        });
      }, 300);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to add course",
        icon: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className={`admin-dashboard-add-user-container ${isVisible ? 'visible' : ''}`}>
        <div className="admin-dashboard-form-card">
          <div className="admin-dashboard-form-header">
            <h2>Add Course</h2>
           
          </div>

          <div className="admin-dashboard-form-body">
            <form onSubmit={hookFormSubmit(onSubmit)} noValidate>
              <div className="d-flex flex-column gap-4">

                <div className="admin-dashboard-form-row-grid">
                  <div className="admin-dashboard-form-group-animated">
                    <label className="admin-dashboard-form-label-with-icon">
                      <Book size={18} />
                      Course Name
                    </label>
                    <input
                      type="text"
                      {...register("name", {
                        required: "Course name is required",
                        minLength: {
                          value: 3,
                          message: "Course name must be at least 3 characters"
                        },
                        maxLength: {
                          value: 100,
                          message: "Course name cannot exceed 100 characters"
                        }
                      })}
                      className={`admin-dashboard-form-input-styled ${errors.name ? "error" : ""}`}
                      placeholder="Enter course name"
                    />
                    {errors.name && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.name.message}
                      </div>
                    )}
                  </div>

                  <div className="admin-dashboard-form-group-animated">
                    <label className="admin-dashboard-form-label-with-icon">
                      <Clock size={18} />
                      Duration
                    </label>
                    <div className="admin-dashboard-form-input-group">
                      <input
                        type="text"
                        inputMode="numeric"
                        {...register("durationValue", {
                          required: "Duration is required",
                          validate: validateDuration
                        })}
                        onChange={(e) => handleAmountChange(e.target.value, "durationValue", 999)}
                        onFocus={handleFocus(watchDurationValue, "durationValue")}
                        placeholder="Enter duration"
                        className={`admin-dashboard-form-input-styled ${errors.durationValue ? "error" : ""}`}
                      />
                      <select
                        {...register("durationUnit")}
                        onChange={(e) => handleDurationUnitChange(e.target.value)}
                        className="admin-dashboard-form-select"
                      >
                        <option value="Years">Years</option>
                        <option value="Months">Months</option>
                        <option value="Days">Days</option>
                      </select>
                    </div>
                    {errors.durationValue && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.durationValue.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-dashboard-form-row-grid">
                  <div className="admin-dashboard-form-group-animated">
                    <label className="admin-dashboard-form-label-with-icon">
                      <DollarSign size={18} />
                      Actual Fees
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      {...register("actualFees", {
                        required: "Actual fees is required"
                      })}
                      className={`admin-dashboard-form-input-styled ${errors.actualFees ? "error" : ""}`}
                      placeholder="Enter amount"
                      onChange={(e) => handleAmountChange(e.target.value, "actualFees", MAX_AMOUNT)}
                    />
                    {errors.actualFees && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.actualFees.message}
                      </div>
                    )}
                  </div>

                  <div className="admin-dashboard-form-group-animated">
                    <label className="admin-dashboard-form-label-with-icon">
                      <DollarSign size={18} />
                      Discount
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      {...register("discount", {
                        required: "Discount is required",
                        validate: validateDiscount
                      })}
                      className={`admin-dashboard-form-input-styled ${errors.discount ? "error" : ""}`}
                      placeholder="Enter discount"
                      onChange={(e) => handleAmountChange(e.target.value, "discount", MAX_AMOUNT)}
                    />
                    {errors.discount && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.discount.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-dashboard-form-row-grid">
                  <div className="admin-dashboard-form-group-animated">
                    <label className="admin-dashboard-form-label-with-icon">
                      <DollarSign size={18} />
                      Final Fees
                    </label>
                    <input
                      type="text"
                      {...register("finalFees")}
                      readOnly
                      className="admin-dashboard-form-input-styled bg-light"
                    />
                  </div>

                  <div className="admin-dashboard-form-group-animated">
                    <label className="admin-dashboard-form-label-with-icon">
                      <Image size={18} />
                      Course Image
                    </label>
                    <div className="admin-dashboard-form-file-upload">
                      <input
                        type="file"
                        id="courseImage"
                        accept="image/jpeg, image/png, image/gif"
                        onChange={handleImageChange}
                        className="admin-dashboard-form-file-input"
                      />
                      <label htmlFor="courseImage" className="admin-dashboard-form-file-label">
                        {imagePreview ? "Change Image" : "Choose Image"}
                      </label>
                    </div>

                    {imagePreview && (
                      <div className="admin-dashboard-image-preview-container">
                        <img
                          src={imagePreview}
                          alt="Course preview"
                          className="admin-dashboard-image-preview"
                          style={{ maxWidth: '100px', maxHeight: '100px' }}
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="admin-dashboard-remove-image-btn"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-dashboard-form-actions-styled">

                <button
                  type="button"
                  className="admin-dashboard-btn-styled admin-dashboard-btn-styled-secondary"
                  style={{ backgroundColor: "#3498db", color: "#fff" }}
                  onClick={() => navigate("/admin/course")}
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
                      Submitting Course...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Submit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddCourse;
