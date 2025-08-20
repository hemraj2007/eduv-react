import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import membershipPlanService from "../../services/membershipPlanService";
import packageService from "../../services/packageService";
import { useForm } from "react-hook-form";
import {
  FaIdCard,
  FaTag,
  FaRupeeSign,
  FaCalendarAlt,
  FaArrowLeft,
  FaClock,
} from "react-icons/fa";

const EditMembershipPlan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packages, setPackages] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      package_id: "",
      planName: "",
      price: "",
      discount: 0,
      finalPrice: "",
      duration: "",
      position: "",
    },
  });

  // Watch price and discount to calculate final price
  const price = watch("price");
  const discount = watch("discount");

  // Calculate final price when price or discount changes
  React.useEffect(() => {
    if (price && discount !== undefined) {
      const calculatedFinalPrice = price - parseFloat(discount);
      setValue("finalPrice", calculatedFinalPrice.toFixed(2));
    }
  }, [price, discount, setValue]);

  // Watch plan name to auto-set duration
  const watchPlanName = watch("planName");

  // Function to handle plan name change and auto-set duration
  const handlePlanNameChange = (planName) => {
    let duration = "";
    switch (planName) {
      case "monthly":
        duration = "30";
        break;
      case "half-yearly":
        duration = "180";
        break;
      case "yearly":
        duration = "365";
        break;
      default:
        duration = "";
    }
    setValue("duration", duration);
  };

  useEffect(() => {
    fetchPackages();
    fetchMembershipPlanData();
  }, [id]);

  const fetchPackages = async () => {
    try {
      setIsLoadingPackages(true);
      const response = await packageService.getAllPackages();
      console.log("Packages API Response:", response);
      
      let packagesData = [];
      if (response?.packages) {
        packagesData = response.packages;
      } else if (response?.data) {
        packagesData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        packagesData = response;
      }
      
      // Filter only active packages
      const activePackages = packagesData.filter(pkg => pkg.status === 'active');
      setPackages(activePackages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to load packages",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const fetchMembershipPlanData = async () => {
    try {
      setIsLoading(true);
      const response = await membershipPlanService.getMembershipPlanById(id);
      console.log("Edit Membership Plan API Response:", response); // Debug log
      
      const membershipPlanData = response.data;
      console.log("Membership Plan Data:", membershipPlanData); // Debug log
      
      if (membershipPlanData) {
        setValue("package_id", membershipPlanData.package_id || "");
        setValue("planName", membershipPlanData.planName || "");
        setValue("price", membershipPlanData.price || "");
        setValue("discount", membershipPlanData.discount || 0);
        setValue("finalPrice", membershipPlanData.finalPrice || "");
        setValue("duration", membershipPlanData.duration || "");
        setValue("position", membershipPlanData.position || 0);
        
        // Auto-set duration based on plan name if it exists
        if (membershipPlanData.planName) {
          handlePlanNameChange(membershipPlanData.planName);
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: "Membership plan not found",
          icon: "error",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/admin/membership-plan");
        });
      }
    } catch (error) {
      console.error("Error fetching membership plan data:", error);
      console.error("Error details:", error.response?.data); // Debug log
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to fetch membership plan data",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/admin/membership-plan");
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Convert string values to numbers and ensure proper data structure
      const formData = {
        package_id: data.package_id,
        planName: data.planName,
        price: parseFloat(data.price),
        discount: parseFloat(data.discount),
        finalPrice: parseFloat(data.finalPrice),
        duration: parseInt(data.duration),
        position: parseInt(data.position) || 0,
      };

      console.log("Sending membership plan data:", formData); // Debug log

      // Validate required fields
      if (!formData.package_id) {
        throw new Error("Package is required");
      }
      if (!formData.planName) {
        throw new Error("Plan name is required");
      }
      if (!formData.price || formData.price <= 0) {
        throw new Error("Valid price is required");
      }
      if (formData.discount < 0) {
        throw new Error("Discount cannot be negative");
      }
      if (!formData.duration || formData.duration <= 0) {
        throw new Error("Valid duration is required");
      }
      if (formData.position < 0) {
        throw new Error("Position must be 0 or greater");
      }

      await membershipPlanService.updateMembershipPlan(id, formData);
      
      // Redirect to membership plan index with success state
      navigate("/admin/membership-plan", { 
        state: { 
          showSuccessAlert: true, 
          successMessage: "Membership plan has been updated successfully" 
        } 
      });
    } catch (error) {
      console.error("Error updating membership plan:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update membership plan",
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
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading membership plan data...</p>
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
              Edit Membership Plan
            </h2>
          </div>

          <form onSubmit={hookFormSubmit(onSubmit)} className="card-body" noValidate>
            <div className="d-flex flex-column gap-4">
              
              {/* First Row: Package, Plan Name, and Duration */}
              <div className="d-flex gap-4">
                {/* Package */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="package_id">
                    Package <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaIdCard className="text-muted" />
                    </div>
                    <select
                      id="package_id"
                      {...register("package_id", { required: "Package is required" })}
                      className={`form-control pl-10 ${errors.package_id ? "error" : ""}`}
                      disabled={isLoadingPackages}
                    >
                      <option value="">Select a package</option>
                      {packages.map((pkg) => (
                        <option key={pkg._id} value={pkg._id}>
                          {pkg.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.package_id && (
                    <p className="form-error">{errors.package_id.message}</p>
                  )}
                  {isLoadingPackages && (
                    <p className="text-primary text-sm mt-1">Loading packages...</p>
                  )}
                </div>

                {/* Plan Name */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="planName">
                    Plan Name <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaTag className="text-muted" />
                    </div>
                    <select
                      id="planName"
                      {...register("planName", { required: "Plan name is required" })}
                      className={`form-control pl-10 ${errors.planName ? "error" : ""}`}
                      onChange={(e) => handlePlanNameChange(e.target.value)}
                    >
                      <option value="">Select Plan</option>
                      <option value="monthly">Monthly</option>
                      <option value="half-yearly">Half Yearly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  {errors.planName && (
                    <p className="form-error">{errors.planName.message}</p>
                  )}
                </div>

                {/* Duration */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="duration">
                    Duration (days) <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaClock className="text-muted" />
                    </div>
                    <input
                      type="number"
                      id="duration"
                      min="1"
                      {...register("duration", { 
                        required: "Duration is required",
                        min: { value: 1, message: "Duration must be at least 1 day" }
                      })}
                      className={`form-control pl-10 ${errors.duration ? "error" : ""}`}
                      placeholder="Duration will be set automatically"
                      readOnly
                    />
                  </div>
                  {errors.duration && (
                    <p className="form-error">{errors.duration.message}</p>
                  )}
                </div>
              </div>

              {/* Second Row: Position */}
              <div className="d-flex gap-4">
                {/* Position */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="position">
                    Position
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaCalendarAlt className="text-muted" />
                    </div>
                    <input
                      type="number"
                      id="position"
                      min="0"
                      {...register("position", { 
                        min: { value: 0, message: "Position must be 0 or greater" }
                      })}
                      className={`form-control pl-10 ${errors.position ? "error" : ""}`}
                      placeholder="Enter position (optional)"
                    />
                  </div>
                  {errors.position && (
                    <p className="form-error">{errors.position.message}</p>
                  )}
                  <small className="text-muted">Position determines the order of display (0 = first)</small>
                </div>

                {/* Empty div to maintain layout */}
                <div className="form-group" style={{ flex: '1' }}></div>
                <div className="form-group" style={{ flex: '1' }}></div>
              </div>

              {/* Second Row: Price and Discount */}
              <div className="d-flex gap-4">
                {/* Price */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="price">
                    Price (₹) <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaRupeeSign className="text-muted" />
                    </div>
                    <input
                      type="number"
                      id="price"
                      step="0.01"
                      min="0"
                      {...register("price", { 
                        required: "Price is required",
                        min: { value: 0, message: "Price must be positive" }
                      })}
                      className={`form-control pl-10 ${errors.price ? "error" : ""}`}
                      placeholder="Enter price"
                    />
                  </div>
                  {errors.price && (
                    <p className="form-error">{errors.price.message}</p>
                  )}
                </div>

                {/* Discount */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="discount">
                    Discount (₹) <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaRupeeSign className="text-muted" />
                    </div>
                    <input
                      type="number"
                      id="discount"
                      step="0.01"
                      min="0"
                      {...register("discount", { 
                        required: "Discount is required",
                        min: { value: 0, message: "Discount must be 0 or greater" },
                        validate: (value) => {
                          const price = watch("price");
                          if (price && parseFloat(value) > parseFloat(price)) {
                            return "Discount cannot exceed the price";
                          }
                          return true;
                        }
                      })}
                      className={`form-control pl-10 ${errors.discount ? "error" : ""}`}
                      placeholder="Enter discount amount in rupees"
                    />
                  </div>
                  {errors.discount && (
                    <p className="form-error">{errors.discount.message}</p>
                  )}
                </div>
              </div>

              {/* Third Row: Final Price */}
              <div className="d-flex gap-4">
                {/* Final Price (Auto-calculated) */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="finalPrice">
                    Final Price (₹) <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaRupeeSign className="text-muted" />
                    </div>
                    <input
                      type="number"
                      id="finalPrice"
                      step="0.01"
                      min="0"
                      {...register("finalPrice", { 
                        required: "Final price is required",
                        min: { value: 0, message: "Final price must be positive" }
                      })}
                      className={`form-control pl-10 bg-gray-100 ${errors.finalPrice ? "error" : ""}`}
                      placeholder="Auto-calculated"
                      readOnly
                    />
                  </div>
                  {errors.finalPrice && (
                    <p className="form-error">{errors.finalPrice.message}</p>
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
                  onClick={() => navigate("/admin/membership-plan")}
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

export default EditMembershipPlan;
