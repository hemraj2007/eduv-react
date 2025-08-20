import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import subscriptionService from "../../services/subscriptionService";
import studentService from "../../services/studentService";
import membershipPlanService from "../../services/membershipPlanService";
import packageService from "../../services/packageService";
import { useForm } from "react-hook-form";
import {
  FaUser,
  FaIdCard,
  FaRupeeSign,
  FaCalendarAlt,
  FaArrowLeft,
} from "react-icons/fa";

const AddSubscription = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [packages, setPackages] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [isLoadingMembershipPlans, setIsLoadingMembershipPlans] = useState(true);
  const [selectedMembershipPlan, setSelectedMembershipPlan] = useState(null);
  const [selectedPackageVideoLimit, setSelectedPackageVideoLimit] = useState(null);

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      student_id: "",
      package_id: "",
      membership_id: "",
      price: "",
      discount: 0,
      finalPrice: "",
      startDate: new Date().toISOString().split('T')[0], // Current date
      endDate: "",
    },
  });

  // Fetch students and packages on component mount
  useEffect(() => {
    fetchStudents();
    fetchPackages();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true);
      const response = await studentService.getAllStudents();
      console.log("Students API Response:", response);
      
      let studentsData = [];
      if (response?.students) {
        studentsData = response.students;
      } else if (response?.data) {
        studentsData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        studentsData = response;
      }
      
      // Filter only active students (status = "Y")
      const activeStudents = studentsData.filter(student => student.status === 'Y');
      setStudents(activeStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to load students",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoadingStudents(false);
    }
  };

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

  const fetchMembershipPlansByPackage = async (packageId) => {
    try {
      setIsLoadingMembershipPlans(true);
      const response = await membershipPlanService.getMembershipPlansByPackageId(packageId);
      console.log("Membership Plans by Package API Response:", response);
      
      let membershipPlansData = [];
      if (response?.membershipPlans) {
        membershipPlansData = response.membershipPlans;
      } else if (response?.data) {
        membershipPlansData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        membershipPlansData = response;
      }
      
      // Filter only active membership plans
      const activeMembershipPlans = membershipPlansData.filter(plan => plan.status === 'active');
      setMembershipPlans(activeMembershipPlans);
    } catch (error) {
      console.error("Error fetching membership plans by package:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to load membership plans for selected package",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoadingMembershipPlans(false);
    }
  };



  // Watch package_id, membership_id to get membership plan details
  const packageId = watch("package_id");
  const membershipId = watch("membership_id");
  const startDate = watch("startDate");

  // Update membership plans when package_id changes
  useEffect(() => {
    console.log("Package ID changed to:", packageId); // Debug log
    if (packageId) {
      // Find the selected package to get its video_limit
      const selectedPackage = packages.find(pkg => pkg._id === packageId);
      if (selectedPackage) {
        setSelectedPackageVideoLimit(selectedPackage.video_limit || null);
        console.log("Selected package video_limit:", selectedPackage.video_limit); // Debug log
      }
      
      fetchMembershipPlansByPackage(packageId);
      // Clear membership plan selection when package changes
      setValue("membership_id", "");
      setSelectedMembershipPlan(null);
      setValue("price", "");
      setValue("discount", 0);
      setValue("finalPrice", "");
      setValue("endDate", "");
    } else {
      setSelectedPackageVideoLimit(null);
      setMembershipPlans([]);
      setSelectedMembershipPlan(null);
      setValue("membership_id", "");
      setValue("price", "");
      setValue("discount", 0);
      setValue("finalPrice", "");
      setValue("endDate", "");
    }
  }, [packageId, setValue, packages]);

  // Update membership plan details when membership_id changes
  useEffect(() => {
    if (membershipId) {
      const membershipPlan = membershipPlans.find(plan => plan._id === membershipId);
      if (membershipPlan) {
        setSelectedMembershipPlan(membershipPlan);
        setValue("price", membershipPlan.price);
        setValue("discount", membershipPlan.discount);
        setValue("finalPrice", membershipPlan.finalPrice);
        
        // Calculate end date based on start date and duration
        if (startDate && membershipPlan.duration) {
          const start = new Date(startDate);
          const end = new Date(start);
          end.setDate(start.getDate() + membershipPlan.duration);
          setValue("endDate", end.toISOString().split('T')[0]);
        }
      }
    } else {
      setSelectedMembershipPlan(null);
      setValue("price", "");
      setValue("discount", 0);
      setValue("finalPrice", "");
      setValue("endDate", "");
    }
  }, [membershipId, membershipPlans, setValue, startDate]);

  // Update end date when start date changes
  useEffect(() => {
    if (startDate && selectedMembershipPlan && selectedMembershipPlan.duration) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + selectedMembershipPlan.duration);
      setValue("endDate", end.toISOString().split('T')[0]);
    }
  }, [startDate, selectedMembershipPlan, setValue]);

  const onSubmit = async (data) => {
    console.log("Form data received:", data); // Debug log for form data
    console.log("Selected package video_limit:", selectedPackageVideoLimit); // Debug log for video_limit
    setIsSubmitting(true);

    try {
      // Convert string values to numbers and ensure proper data structure
      const formData = {
        student_id: data.student_id,
        membership_id: data.membership_id,
        packageId: data.package_id, // Backend expects 'packageId' not 'package_id'
        price: parseFloat(data.price),
        discount: parseFloat(data.discount),
        finalPrice: parseFloat(data.finalPrice),
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        video_limit: selectedPackageVideoLimit, // Add video_limit from selected package
      };

      console.log("Sending subscription data:", formData); // Debug log
      console.log("Package ID being sent:", formData.packageId); // Debug log for packageId
      console.log("Video limit being sent:", formData.video_limit); // Debug log for video_limit
      console.log("Fixed: Backend expects 'packageId' field"); // Debug log

      // Validate required fields
      if (!formData.student_id) {
        throw new Error("Student is required");
      }
      if (!formData.packageId) {
        throw new Error("Package is required");
      }
      if (!formData.membership_id) {
        throw new Error("Membership plan is required");
      }
      if (!formData.price || formData.price <= 0) {
        throw new Error("Valid price is required");
      }
      if (formData.discount < 0) {
        throw new Error("Discount cannot be negative");
      }
      if (!formData.startDate) {
        throw new Error("Start date is required");
      }
      if (!formData.endDate) {
        throw new Error("End date is required");
      }

      await subscriptionService.createSubscription(formData);
      
      // First redirect to subscription index
      navigate("/admin/subscription");

      // Then show success popup after a small delay
      setTimeout(() => {
        Swal.fire({
          title: "Success!",
          text: "Subscription has been added successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
      }, 100);
    } catch (error) {
      console.error("Error adding subscription:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error response headers:", error.response?.headers);
      
      // Show more detailed error information
      let errorMessage = "Failed to add subscription";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        title: "Error!",
        text: errorMessage,
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
              Add New Subscription
            </h2>
          </div>

          <form onSubmit={hookFormSubmit(onSubmit)} className="card-body" noValidate>
            <div className="d-flex flex-column gap-4">
              
              {/* First Row: Student and Package */}
              <div className="d-flex gap-4">
                {/* Student */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="student_id">
                    Student <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaUser className="text-muted" />
                    </div>
                    <select
                      id="student_id"
                      {...register("student_id", { required: "Student is required" })}
                      className={`form-control pl-10 ${errors.student_id ? "error" : ""}`}
                      disabled={isLoadingStudents}
                    >
                      <option value="">Select a student</option>
                      {students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.firstName} {student.lastName} - {student.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.student_id && (
                    <p className="form-error">{errors.student_id.message}</p>
                  )}
                  {isLoadingStudents && (
                    <p className="text-muted text-sm mt-1">Loading students...</p>
                  )}
                </div>

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
                      onChange={(e) => {
                        setValue("package_id", e.target.value);
                        if (e.target.value) {
                          fetchMembershipPlansByPackage(e.target.value);
                        } else {
                          setMembershipPlans([]);
                        }
                      }}
                    >
                      <option value="">Select a package</option>
                      {packages.map((pkg) => (
                        <option key={pkg._id} value={pkg._id}>
                          {pkg.name} - ₹{pkg.finalFees}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.package_id && (
                    <p className="form-error">{errors.package_id.message}</p>
                  )}
                  {isLoadingPackages && (
                    <p className="text-muted text-sm mt-1">Loading packages...</p>
                  )}
                </div>

              </div>

              {/* Second Row: Membership Plan and Price */}
              <div className="d-flex gap-4">
                {/* Membership Plan */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="membership_id">
                    Membership Plan <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaIdCard className="text-muted" />
                    </div>
                    <select
                      id="membership_id"
                      {...register("membership_id", { required: "Membership plan is required" })}
                      className={`form-control pl-10 ${errors.membership_id ? "error" : ""}`}
                      disabled={isLoadingMembershipPlans || !watch("package_id")}
                    >
                      <option value="">
                        {!watch("package_id") ? "Please select a package first" : "Select a membership plan"}
                      </option>
                      {membershipPlans.map((plan) => (
                        <option key={plan._id} value={plan._id}>
                          {plan.planName} - ₹{plan.finalPrice} ({plan.duration} days)
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.membership_id && (
                    <p className="form-error">{errors.membership_id.message}</p>
                  )}
                  {isLoadingMembershipPlans && (
                    <p className="text-muted text-sm mt-1">Loading membership plans...</p>
                  )}
                </div>

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
                      placeholder="Auto-filled from membership plan"
                      readOnly
                    ></input>
                  </div>
                  {errors.price && (
                    <p className="form-error">{errors.price.message}</p>
                  )}
                </div>

              </div>

              {/* Third Row: Discount and Final Price */}
              <div className="d-flex gap-4">
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
                        min: { value: 0, message: "Discount must be 0 or greater" }
                      })}
                      className={`form-control pl-10 ${errors.discount ? "error" : ""}`}
                      placeholder="Auto-filled from membership plan"
                      readOnly
                    ></input>
                  </div>
                  {errors.discount && (
                    <p className="form-error">{errors.discount.message}</p>
                  )}
                </div>

                {/* Final Price */}
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
                      className={`form-control pl-10 ${errors.finalPrice ? "error" : ""}`}
                      placeholder="Auto-calculated"
                      readOnly
                    ></input>
                  </div>
                  {errors.finalPrice && (
                    <p className="form-error">{errors.finalPrice.message}</p>
                  )}
                </div>

              </div>

              {/* Fourth Row: Start Date and End Date */}
              <div className="d-flex gap-4">
                {/* Start Date */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="startDate">
                    Start Date <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaCalendarAlt className="text-muted" />
                    </div>
                    <input
                      type="date"
                      id="startDate"
                      {...register("startDate", { required: "Start date is required" })}
                      className={`form-control pl-10 ${errors.startDate ? "error" : ""}`}
                    ></input>
                  </div>
                  {errors.startDate && (
                    <p className="form-error">{errors.startDate.message}</p>
                  )}
                </div>

                {/* End Date */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="endDate">
                    End Date <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaCalendarAlt className="text-muted" />
                    </div>
                    <input
                      type="date"
                      id="endDate"
                      {...register("endDate", { required: "End date is required" })}
                      className={`form-control pl-10 ${errors.endDate ? "error" : ""}`}
                      placeholder="Auto-calculated"
                      readOnly
                    ></input>
                  </div>
                  {errors.endDate && (
                    <p className="form-error">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

            </div>

            <div className="card-footer">
              <div className="d-flex justify-between align-center gap-4">
                {/* Back Button (Left-Bottom) */}
                <button
                  type="button"
                  onClick={() => navigate("/admin/subscription")}
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

export default AddSubscription; 