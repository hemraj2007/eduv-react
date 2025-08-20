import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import Swal from 'sweetalert2';
import { studentService, courseService } from '../../services';
import { useForm } from 'react-hook-form';
import '../../style/admin-style.css';
import 'animate.css';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Book,
  Key,
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Image
} from 'lucide-react';

const AddStudent = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      gender: "Male",
      dob: "",
      address: "",
      course_id: "",
      profilePicture: null,
    },
  });

  useEffect(() => {
    fetchCourses();
    // Trigger entrance animation
    setIsVisible(true);
  }, []);

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
      Swal.fire({
        html: `
          <div class="modern-title-container">
            <div class="modern-title-icon" style="background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-alert-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <div class="modern-title-text">
              <h3>Error!</h3>
              <p>Failed to fetch courses</p>
            </div>
          </div>
        `,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: 'modern-swal-popup admin-dashboard-animated-popup admin-dashboard-error-popup',
          title: 'modern-swal-title admin-dashboard-error-popup-title',
          confirmButton: 'admin-dashboard-error-popup-btn',
          htmlContainer: 'modern-swal-html'
        },
        showClass: {
          popup: 'animate__animated animate__shakeX animate__faster'
        }
      });
    }
  };

  // Validate date of birth
  const validateDateOfBirth = (value) => {
    if (!value) return "Date of birth is required";

    const dob = new Date(value);
    const today = new Date();

    // Check if date is in the future
    if (dob > today) {
      return "Date of birth cannot be in the future";
    }

    // Calculate age
    const ageDiff = today.getTime() - dob.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    // Check if student is at least 2 years old
    if (age < 2) {
      return "Student must be at least 2 years old";
    }

    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("profilePicture", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
      setValue("profilePicture", null);
    }
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setValue("mobile", value);
    }
  };

  // Email check removed due to backend endpoint not being available
  const checkEmailExists = async (email) => {
    // Temporarily disabled - backend endpoint /student/check-email returns 404
    return false;
  };

  // Function to generate random password
  const generateRandomPassword = () => {
    const length = 12;
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";

    // Ensure at least one character from each category
    let password = "";
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Fill the rest with random characters from all categories
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password to make it more random
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const onSubmit = async (data) => {
    console.log("Form data received:", data); // Debug log
    setIsSubmitting(true);

    try {
      const emailExists = await checkEmailExists(data.email);
      if (emailExists) {
        setError("email", {
          type: "manual",
          message: "This email is already registered",
        });
        Swal.fire({
          html: `
          <div class="modern-title-container">
            <div class="modern-title-icon" style="background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-alert-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <div class="modern-title-text">
              <h3>Validation Error</h3>
              <p>This email is already registered</p>
            </div>
          </div>
        `,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#ef4444",
          customClass: {
            popup: 'modern-swal-popup admin-dashboard-animated-popup admin-dashboard-error-popup',
            title: 'modern-swal-title admin-dashboard-error-popup-title',
            confirmButton: 'admin-dashboard-error-popup-btn',
            htmlContainer: 'modern-swal-html'
          },
          showClass: {
            popup: 'animate__animated animate__shakeX animate__faster'
          }
        });
        setIsSubmitting(false);
        return;
      }

      // Generate random password
      const randomPassword = generateRandomPassword();

      // Remove 'course_id' key if not filled (empty string)
      if (!data.course_id) {
        delete data.course_id;
      }

      const sendData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "profilePicture" && value instanceof File) {
          sendData.append("profilePicture", value);
        } else {
          sendData.append(key, value);
        }
      });

      // Add the generated password to the form data
      sendData.append("password", randomPassword);

      const response = await studentService.addStudent(sendData);

      // First navigate to the index page
      navigate("/admin/students");

      // Then show success popup with animation after a short delay
      setTimeout(() => {
        Swal.fire({
          html: `
            <div class="modern-title-container">
  <div class="modern-title-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
         stroke-linecap="round" stroke-linejoin="round" 
         class="feather feather-check-circle">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  </div>
  <div class="modern-title-text">
    <h3>Success!</h3>
    <p>Registration complete. Password sent to your email. You can now log in.</p>
  </div>
</div>

          `,
          text: "A random password has been generated and assigned to the student.",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#10b981",
          customClass: {
            popup: 'modern-swal-popup admin-dashboard-animated-popup admin-dashboard-success-popup',
            title: 'modern-swal-title admin-dashboard-success-popup-title',
            confirmButton: 'admin-dashboard-success-popup-btn',
            htmlContainer: 'modern-swal-html'
          },
          showClass: {
            popup: 'animate__animated animate__zoomIn animate__faster'
          },
          hideClass: {
            popup: 'animate__animated animate__zoomOut animate__faster'
          }
        });
      }, 300); // Short delay to ensure navigation completes first

    } catch (error) {
      console.error("Error adding student:", error);
      const message =
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        "Failed to add student";
      Swal.fire({
        html: `
          <div class="modern-title-container">
            <div class="modern-title-icon" style="background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-alert-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <div class="modern-title-text">
              <h3>Error!</h3>
              <p>${message}</p>
            </div>
          </div>
        `,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: 'modern-swal-popup admin-dashboard-animated-popup admin-dashboard-error-popup',
          title: 'modern-swal-title admin-dashboard-error-popup-title',
          confirmButton: 'admin-dashboard-error-popup-btn',
          htmlContainer: 'modern-swal-html'
        },
        showClass: {
          popup: 'animate__animated animate__shakeX animate__faster'
        }
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
            <h2>Add Student</h2>
            
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
                      <User size={18} />
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
                      <Book size={18} />
                      Course
                    </label>
                    <select
                      className={`admin-dashboard-form-input-styled ${errors.course_id ? 'error' : ''}`}
                      {...register("course_id")}
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                    {errors.course_id && (
                      <div className="admin-dashboard-error-message">
                        <AlertCircle size={14} />
                        {errors.course_id.message}
                      </div>
                    )}
                  </div>
                </div>



                {/* Password Information */}
                <div className="d-flex gap-4">
                  <div className="form-group" style={{ flex: '1' }}>

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

export default AddStudent;
