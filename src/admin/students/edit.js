import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import Swal from 'sweetalert2';
import studentService from '../../services/studentService';
import courseService from '../../services/courseService';
import { useForm } from 'react-hook-form';
import '../../style/admin-style.css';
import 'animate.css';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ArrowLeft,
  Save,
  AlertCircle,
  Users,
  Eye,
  EyeOff,
  Image,
  BookOpen
} from 'lucide-react';

const EditStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [previewImage, setPreviewImage] = useState(null);
  const [currentProfilePicture, setCurrentProfilePicture] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [courses, setCourses] = useState([]);

  // Function to validate date of birth
  const validateDateOfBirth = (value) => {
    if (!value) return "Date of birth is required";

    const dob = new Date(value);
    const today = new Date();

    // Check if date is in the future
    if (dob > today) {
      return "Date of birth cannot be in the future";
    }

    // Check if student is at least 2 years old
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(today.getFullYear() - 2);

    if (dob > twoYearsAgo) {
      return "Student must be at least 2 years old";
    }

    return true;
  };

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    setError,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      gender: "Male",
      dob: "",
      address: "",
      profilePicture: null,
      courseId: ""
    }
  });

  useEffect(() => {
    fetchStudentData();
    fetchCourses();
    // eslint-disable-next-line
  }, [id]);

  // Effect for entrance animation
  useEffect(() => {
    // Set a small delay to ensure the component is mounted before animation starts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      const response = await studentService.getStudentById(id);
      const student = response.student || response;
      if (student) {
        const formattedDob = student.dob ? new Date(student.dob).toISOString().split('T')[0] : "";
        setOriginalEmail(student.email || "");
        reset({
          name: student.name || "",
          email: student.email || "",
          mobile: student.mobile || "",
          gender: student.gender || "Male",
          dob: formattedDob,
          address: student.address || "",
          profilePicture: null,
          courseId: student.course_id || ""
        });
        if (student.profilePicture) {
          setCurrentProfilePicture(student.profilePicture);
          setPreviewImage(`${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/${student.profilePicture}`);
        }
      }
    } catch (error) {
      Swal.fire("Error", "Failed to fetch student data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseService.getAllCourses();
      console.log('Course API Response:', response);

      // Handle different response structures
      let coursesData = [];

      if (response && Array.isArray(response.courses)) {
        coursesData = response.courses;
      } else if (response && Array.isArray(response.data)) {
        coursesData = response.data;
      } else if (response && Array.isArray(response)) {
        coursesData = response;
      }

      // Filter courses with status 'Y' (active)
      const activeCourses = coursesData.filter((course) => course.status === "Y");
      console.log('Active courses:', activeCourses);
      setCourses(activeCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      Swal.fire("Error", "Failed to fetch courses", "error");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("profilePicture", file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(currentProfilePicture ? `${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/${currentProfilePicture}` : null);
      setValue("profilePicture", null);
    }
  };

  const handleMobileChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    setValue("mobile", value);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Check if email has changed and if it already exists
      if (data.email !== originalEmail) {
        try {
          const response = await studentService.checkEmailExists(data.email);
          if (response.exists) {
            setError("email", {
              type: "manual",
              message: "This email is already registered",
            });

            Swal.fire({
              title: '<div class="admin-dashboard-error-popup-header"><AlertCircle class="admin-dashboard-error-icon" /><span>Validation Error</span></div>',
              text: "This email is already registered",
              icon: "error",
              confirmButtonText: "OK",
              confirmButtonColor: "#ef4444",
              customClass: {
                popup: 'admin-dashboard-animated-popup admin-dashboard-error-popup',
                title: 'admin-dashboard-error-popup-title',
                confirmButton: 'admin-dashboard-error-popup-btn'
              },
              showClass: {
                popup: 'animate__animated animate__shakeX animate__faster'
              }
            });

            setIsSubmitting(false);
            return;
          }
        } catch (error) {
          console.error("Error checking email:", error);
        }
      }

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "profilePicture" && value instanceof File) {
          formData.append("profilePicture", value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Ensure status is set to 'Y' (active) for the student
      formData.append("status", "Y");

      // Handle course_id field name to match backend expectations
      if (data.courseId) {
        formData.append("course_id", data.courseId);
      }

      await studentService.updateStudent(id, formData);

      // First redirect to students index
      navigate("/admin/students");

      // Then show success popup after a small delay
      setTimeout(() => {
        Swal.fire({
          html: `
            <div class="admin-dashboard-success-popup-header">
              <div class="admin-dashboard-success-popup-header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div class="admin-dashboard-success-popup-header-content">
                <h3>Success!</h3>
                <p>Student has been updated successfully</p>
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#10b981",
          customClass: {
            popup: 'admin-dashboard-animated-popup admin-dashboard-success-popup',
            title: 'admin-dashboard-success-popup-title',
            confirmButton: 'admin-dashboard-success-popup-btn'
          },
          showClass: {
            popup: 'animate__animated animate__zoomIn animate__faster'
          },
          hideClass: {
            popup: 'animate__animated animate__zoomOut animate__faster'
          }
        });
      }, 100);
    } catch (error) {
      console.error("Error updating student:", error);
      Swal.fire({
        title: '<div class="admin-dashboard-error-popup-header"><AlertCircle class="admin-dashboard-error-icon" /><span>Error!</span></div>',
        text: error.response?.data?.message || "Failed to update student",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: 'admin-dashboard-animated-popup admin-dashboard-error-popup',
          title: 'admin-dashboard-error-popup-title',
          confirmButton: 'admin-dashboard-error-popup-btn'
        },
        showClass: {
          popup: 'animate__animated animate__shakeX animate__faster'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-loading-container">
          <div className="admin-dashboard-loading-spinner"></div>
          <p>Loading student data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={`admin-dashboard-add-user-container ${isVisible ? 'visible' : ''}`}>
        <div className="admin-dashboard-form-card">
          <div className="admin-dashboard-form-header">
            <h2>Edit Student</h2>
            
          </div>

          <div className="admin-dashboard-form-body">
            <form onSubmit={hookFormSubmit(onSubmit)} noValidate>
              <div className="d-flex flex-column gap-4">

                <div className="admin-dashboard-form-row-grid">
                  <div className="admin-dashboard-form-group-animated">
                    <label className="admin-dashboard-form-label-with-icon">
                      <User size={18} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      className={`admin-dashboard-form-input-styled ${errors.name ? 'error' : ''}`}
                      placeholder="Enter full name"
                      {...register("name", {
                        required: "Full name is required",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters"
                        }
                      })}
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
                      <Mail size={18} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      className={`admin-dashboard-form-input-styled ${errors.email ? 'error' : ''}`}
                      placeholder="Enter email address"
                      {...register("email", {
                        required: "Email address is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                    />
                    {errors.email && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.email.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-dashboard-form-row-grid">
                  <div className="admin-dashboard-form-group-animated">
                    <label className="admin-dashboard-form-label-with-icon">
                      <Phone size={18} />
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      className={`admin-dashboard-form-input-styled ${errors.mobile ? 'error' : ''}`}
                      placeholder="Enter mobile number"
                      {...register("mobile", {
                        required: "Mobile number is required",
                        pattern: {
                          value: /^\d{10}$/,
                          message: "Mobile number must be 10 digits"
                        }
                      })}
                      onChange={handleMobileChange}
                      maxLength={10}
                    />
                    {errors.mobile && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.mobile.message}
                      </div>
                    )}
                  </div>

                  <div className="admin-dashboard-form-group-animated">
                    <label className="admin-dashboard-form-label-with-icon">
                      <Users size={18} />
                      Gender
                    </label>
                    <select
                      className={`admin-dashboard-form-input-styled ${errors.gender ? 'error' : ''}`}
                      {...register("gender")}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.gender.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-dashboard-form-row-grid">

                  <div className="admin-dashboard-form-group-animated">
                    <label className="admin-dashboard-form-label-with-icon">
                      <Calendar size={18} />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className={`admin-dashboard-form-input-styled ${errors.dob ? 'error' : ''}`}
                      {...register("dob", {
                        required: "Date of birth is required",
                        validate: validateDateOfBirth
                      })}
                    />
                    {errors.dob && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.dob.message}
                      </div>
                    )}
                  </div>



                  <div className="admin-dashboard-form-group-animated">
                    <label className="admin-dashboard-form-label-with-icon">
                      <BookOpen size={18} />
                      Course
                    </label>
                    <select
                      className={`admin-dashboard-form-input-styled ${errors.courseId ? 'error' : ''}`}
                      {...register("courseId", { required: "Course is required" })}
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                    {errors.courseId && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.courseId.message}
                      </div>
                    )}

                  </div>


                </div>



                <div className="admin-dashboard-form-row-grid">
                  <div className="admin-dashboard-form-group-animated">
                    <label className="admin-dashboard-form-label-with-icon">
                      <Image size={18} />
                      Profile Picture
                    </label>
                    <div className="admin-dashboard-profile-upload-container">
                      <input
                        type="file"
                        id="profilePicture"
                        name="profilePicture"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="admin-dashboard-form-input-styled"
                      />
                      {previewImage && (
                        <div className="admin-dashboard-profile-preview">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="admin-dashboard-profile-preview-img"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-dashboard-form-group-animated">
                    <label className="admin-dashboard-form-label-with-icon">
                      <MapPin size={18} />
                      Address
                    </label>
                    <textarea
                      className={`admin-dashboard-form-input-styled ${errors.address ? 'error' : ''}`}
                      placeholder="Enter address"
                      rows="3"
                      {...register("address", { required: "Address is required" })}
                    ></textarea>
                    {errors.address && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.address.message}
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
                  onClick={() => navigate("/admin/students")}
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
                      Submitting Student...
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

export default EditStudent;
