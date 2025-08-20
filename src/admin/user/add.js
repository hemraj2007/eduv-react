import React, { useState, useEffect, useRef } from "react"; // Import useRef
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import userService from "../../services/userService";
import { useForm, Controller } from "react-hook-form";
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Calendar,
  Globe,
  Map,
  Home,
  Linkedin,
  Github,
  Users,
  Paperclip,
  Upload,
  Heart,
  Briefcase,
} from "lucide-react";
import Loader from "../../components/Loader";
import ImageCropper from "../../components/ImageCropper"; // Import ImageCropper component
import "../../style/admin-style.css";

const locationData = {
  India: {
    Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Thane"],
    Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  },
  USA: {
    California: ["Los Angeles", "San Francisco", "San Diego", "Sacramento"],
    Texas: ["Houston", "Austin", "Dallas", "San Antonio"],
    "New York": ["New York City", "Buffalo", "Rochester", "Albany"],
  },
  UK: {
    England: ["London", "Manchester", "Birmingham", "Liverpool"],
    Scotland: ["Glasgow", "Edinburgh", "Aberdeen", "Dundee"],
    Wales: ["Cardiff", "Swansea", "Newport", "Bangor"],
  },
};

const hobbiesList = [
  "Reading",
  "Traveling",
  "Music",
  "Movies",
  "Gaming",
  "Cooking",
  "Sports",
  "Gardening",
  "Photography",
  "Painting",
  "Writing",
  "Hiking",
  "Coding",
  "Dancing",
  "Yoga",
  "Fishing",
];

const AddUser = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null); // For displaying the final cropped image
  const [documentFiles, setDocumentFiles] = useState([]);

  // State for image cropping
  const [rawFile, setRawFile] = useState(null); // Original file
  const [rawPreview, setRawPreview] = useState(null); // URL of original file for cropper
  const [showCropper, setShowCropper] = useState(false); // To show/hide cropper modal
  const fileInputRefProfile = useRef(null); // Ref for the file input

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
    control,
    reset,
  } = useForm();

  const selectedCountry = watch("country");
  const selectedState = watch("state");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    setValue("state", "");
    setValue("city", "");
  }, [selectedCountry, setValue]);

  useEffect(() => {
    setValue("city", "");
  }, [selectedState, setValue]);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setRawFile(null);
      setRawPreview(null);
      setProfilePreview(null);
      setValue("profileImage", null);
      if (fileInputRefProfile.current) {
        fileInputRefProfile.current.value = "";
      }
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/tiff",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      Swal.fire({
        title: '<div class="error-popup-header"><AlertCircle class="error-icon" /><span>Failed!</span></div>',
        text: "Only JPG/JPEG, PNG, GIF, TIFF, and WEBP images are allowed.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "animated-popup error-popup",
          title: "error-popup-title",
          confirmButton: "error-popup-btn",
        },
        showClass: { popup: "animate__animated animate__shakeX animate__faster" },
      });
      setValue("profileImage", null);
      setRawFile(null);
      setRawPreview(null);
      setProfilePreview(null);
      if (fileInputRefProfile.current) {
        fileInputRefProfile.current.value = "";
      }
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setRawFile(file);
    setRawPreview(previewUrl);
    setShowCropper(true);
  };

  const handleCropper = () => {
    setShowCropper(false);
    setRawFile(null);
    setRawPreview(null);
    if (fileInputRefProfile.current) {
      fileInputRefProfile.current.value = "";
    }
  };

  const handleDocumentsChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Remove file size validation
      setDocumentFiles(files);
      setValue("documents", files);
    }
  };

  const checkEmailExists = async (email) => {
    try {
      return false;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const emailExists = await checkEmailExists(data.email);
      if (emailExists) {
        setError("email", { type: "manual", message: "Email already exists" });
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        if (key === "profileImage" && data.profileImage) {
          formData.append("image", data.profileImage);
        } else if (key === "documents" && data.documents) {
          data.documents.forEach((file) => {
            formData.append("documents", file);
          });
        } else if (key === "hobbies") {
          if (Array.isArray(data.hobbies) && data.hobbies.length > 0) {
            formData.append("hobbies", data.hobbies.join(","));
          }
        } else if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

      const requiredFields = [
        "fullName",
        "email",
        "password",
        "mobile",
        "gender",
        "dob",
        "country",
        "state",
        "city",
        "address",
        "pincode",
      ];
      const missingFields = [];

      requiredFields.forEach((field) => {
        if (!formData.has(field)) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        Swal.fire({
          title:
            '<div class="error-popup-header"><AlertCircle class="error-icon" /><span>Error!</span></div>',
          text: `Missing required fields: ${missingFields.join(", ")}`,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#ef4444",
        });
        return;
      }

      const optionalFields = ["linkedinUrl", "githubUrl", "accountOn"];
      optionalFields.forEach((field) => {
        if (!formData.has(field)) {
          formData.append(field, "");
        }
      });

      if (!formData.has("hobbies")) {
        formData.append("hobbies", "");
      }

      await userService.addUser(formData);

      navigate("/admin/user");

      setTimeout(() => {
        Swal.fire({
          title:
            '<div class="success-popup-header"><CheckCircle class="success-icon" /><span>Success!</span></div>',
          text: "User has been added successfully",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#10b981",
          customClass: {
            popup: "animated-popup success-popup",
            title: "success-popup-title",
            confirmButton: "success-popup-btn",
          },
          showClass: { popup: "animate__animated animate__zoomIn animate__faster" },
          hideClass: { popup: "animate__animated animate__zoomOut animate__faster" },
        });
      }, 100);
    } catch (error) {
      console.error("Error adding user:", error);

      let errorMessage = "Failed to add user.";

      if (error.message.includes("Network Error")) {
        errorMessage =
          "Unable to connect to the server. Please check if the backend server is running at the correct address and port.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "The server took too long to respond. Please try again later.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        title:
          '<div class="error-popup-header"><AlertCircle class="error-icon" /><span>Error!</span></div>',
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "animated-popup error-popup",
          title: "error-popup-title",
          confirmButton: "error-popup-btn",
        },
        showClass: { popup: "animate__animated animate__shakeX animate__faster" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate today's date
  const today = new Date();

  // Calculate the date 18 years ago from today, and format it for the input's max attribute
  const maxBirthDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  // Calculate the date 75 years ago from today to set a reasonable minimum age
  const minBirthDate = new Date(
    today.getFullYear() - 75,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  return (
    <AdminLayout>
      {isSubmitting && <Loader title="Adding User..." subtitle="Please wait..." />}
      <div className={`admin-dashboard-add-user-container ${isVisible ? "visible" : ""}`}>
        <div className="admin-dashboard-form-card">
          <div className="admin-dashboard-form-header">
            <h2>Add User</h2>
          </div>

          <div className="admin-dashboard-form-body">
            <form onSubmit={hookFormSubmit(onSubmit)} noValidate>
              {/* --- Row 1: Name, Email --- */}
              <div className="admin-dashboard-form-row-grid">
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <User size={18} /> Full Name{" "}
                    <span className="required-field" style={{ color: "red" }}>
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    className={`admin-dashboard-form-input-styled ${errors.fullName ? "error" : ""
                      }`}
                    placeholder="Enter full name"
                    {...register("fullName", { required: "Full name is required" })}
                  />
                  {errors.fullName && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} /> {errors.fullName.message}
                    </div>
                  )}
                </div>
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Mail size={18} /> Email Address{" "}
                    <span className="required-field" style={{ color: "red" }}>
                      *
                    </span>
                  </label>
                  <input
                    type="email"
                    className={`admin-dashboard-form-input-styled ${errors.email ? "error" : ""
                      }`}
                    placeholder="Enter email address"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} /> {errors.email.message}
                    </div>
                  )}
                </div>
              </div>

              {/* --- Row 2: Password, Mobile --- */}
              <div className="admin-dashboard-form-row-grid">
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Lock size={18} /> Password{" "}
                    <span className="required-field" style={{ color: "red" }}>
                      *
                    </span>
                  </label>
                  <div className="admin-dashboard-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`admin-dashboard-form-input-styled ${errors.password ? "error" : ""
                        }`}
                      placeholder="Enter password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                    <button
                      type="button"
                      className="admin-dashboard-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} /> {errors.password.message}
                    </div>
                  )}
                </div>
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Phone size={18} /> Mobile Number{" "}
                    <span className="required-field" style={{ color: "red" }}>
                      *
                    </span>
                  </label>
                  <input
                    type="tel"
                    className={`admin-dashboard-form-input-styled ${errors.mobile ? "error" : ""
                      }`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    {...register("mobile", {
                      required: "Mobile number is required",
                      pattern: { value: /^[0-9]{10}$/, message: "Mobile number must be 10 digits" },
                    })}
                  />
                  {errors.mobile && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} /> {errors.mobile.message}
                    </div>
                  )}
                </div>
              </div>

              {/* --- Row 3: Gender, DOB --- */}
              <div className="admin-dashboard-form-row-grid">
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Users size={18} /> Gender{" "}
                    <span className="required-field" style={{ color: "red" }}>
                      *
                    </span>
                  </label>
                  <div className="admin-dashboard-radio-group">
                    <label>
                      <input
                        type="radio"
                        {...register("gender", { required: "Gender is required" })}
                        value="Male"
                      />{" "}
                      Male
                    </label>
                    <label>
                      <input
                        type="radio"
                        {...register("gender", { required: "Gender is required" })}
                        value="Female"
                      />{" "}
                      Female
                    </label>
                    <label>
                      <input
                        type="radio"
                        {...register("gender", { required: "Gender is required" })}
                        value="Other"
                      />{" "}
                      Other
                    </label>
                  </div>
                  {errors.gender && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} /> {errors.gender.message}
                    </div>
                  )}
                </div>
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Calendar size={18} /> Date of Birth{" "}
                    <span className="required-field" style={{ color: "red" }}>
                      *
                    </span>
                  </label>
                  <input
                    type="date"
                    className={`admin-dashboard-form-input-styled ${errors.dob ? "error" : ""
                      }`}
                    max={maxBirthDate}
                    min={minBirthDate}
                    {...register("dob", {
                      required: "Date of birth is required",
                      validate: (value) => {
                        const birthDate = new Date(value);
                        const today = new Date();
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const monthDifference = today.getMonth() - birthDate.getMonth();
                        if (
                          monthDifference < 0 ||
                          (monthDifference === 0 && today.getDate() < birthDate.getDate())
                        ) {
                          age--;
                        }
                        return (age >= 18) || "You must be at least 18 years old.";
                      },
                    })}
                  // This sets the initial calendar view to 18 years ago
                  />
                  {errors.dob && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} /> {errors.dob.message}
                    </div>
                  )}
                </div>
              </div>

              {/* --- Row 4: Country, State --- */}
              <div className="admin-dashboard-form-row-grid">
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Globe size={18} /> Country{" "}
                    <span className="required-field" style={{ color: "red" }}>
                      *
                    </span>
                  </label>
                  <select
                    className={`admin-dashboard-form-input-styled ${errors.country ? "error" : ""
                      }`}
                    {...register("country", { required: "Country is required" })}
                  >
                    <option value="">Select Country</option>
                    {Object.keys(locationData).map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} /> {errors.country.message}
                    </div>
                  )}
                </div>
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Map size={18} /> State{" "}
                    <span className="required-field" style={{ color: "red" }}>
                      *
                    </span>
                  </label>
                  <select
                    className={`admin-dashboard-form-input-styled ${errors.state ? "error" : ""
                      }`}
                    {...register("state", { required: "State is required" })}
                    disabled={!selectedCountry}
                  >
                    <option value="">Select State</option>
                    {selectedCountry &&
                      Object.keys(locationData[selectedCountry]).map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                  </select>
                  {errors.state && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} /> {errors.state.message}
                    </div>
                  )}
                </div>
              </div>

              {/* --- Row 5: City, Address --- */}
              <div className="admin-dashboard-form-row-grid">
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Home size={18} /> City{" "}
                    <span className="required-field" style={{ color: "red" }}>
                      *
                    </span>
                  </label>
                  <select
                    className={`admin-dashboard-form-input-styled ${errors.city ? "error" : ""
                      }`}
                    {...register("city", { required: "City is required" })}
                    disabled={!selectedState}
                  >
                    <option value="">Select City</option>
                    {selectedState &&
                      locationData[selectedCountry]?.[selectedState]?.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                  </select>
                  {errors.city && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} /> {errors.city.message}
                    </div>
                  )}
                </div>
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <MapPin size={18} /> Address{" "}
                    <span className="required-field" style={{ color: "red" }}>
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    className={`admin-dashboard-form-input-styled ${errors.address ? "error" : ""
                      }`}
                    placeholder="Enter full address"
                    {...register("address", { required: "Address is required" })}
                  />
                  {errors.address && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} /> {errors.address.message}
                    </div>
                  )}
                </div>
              </div>

              {/* --- Row 6: Pincode, LinkedIn --- */}
              <div className="admin-dashboard-form-row-grid">
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <MapPin size={18} /> Pincode{" "}
                    <span className="required-field" style={{ color: "red" }}>
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    className={`admin-dashboard-form-input-styled ${errors.pincode ? "error" : ""
                      }`}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    {...register("pincode", {
                      required: "Pincode is required",
                      pattern: { value: /^[0-9]{6}$/, message: "Pincode must be 6 digits" },
                    })}
                  />
                  {errors.pincode && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} /> {errors.pincode.message}
                    </div>
                  )}
                </div>
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Linkedin size={18} /> LinkedIn URL (Optional)
                  </label>
                  <input
                    type="url"
                    className={`admin-dashboard-form-input-styled ${errors.linkedinUrl ? "error" : ""
                      }`}
                    placeholder="https://linkedin.com/in/..."
                    {...register("linkedinUrl", {
                      pattern: {
                        value: /^(ftp|http|https):\/\/[^ "]+$/,
                        message: "Invalid URL",
                      },
                    })}
                  />
                  {errors.linkedinUrl && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} /> {errors.linkedinUrl.message}
                    </div>
                  )}
                </div>
              </div>

              {/* --- Row 7: GitHub, Account On --- */}
              <div className="admin-dashboard-form-row-grid">
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Github size={18} /> GitHub URL (Optional)
                  </label>
                  <input
                    type="url"
                    className={`admin-dashboard-form-input-styled ${errors.githubUrl ? "error" : ""
                      }`}
                    placeholder="https://github.com/..."
                    {...register("githubUrl", {
                      pattern: {
                        value: /^(ftp|http|https):\/\/[^ "]+$/,
                        message: "Invalid URL",
                      },
                    })}
                  />
                  {errors.githubUrl && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} /> {errors.githubUrl.message}
                    </div>
                  )}
                </div>
                {/* <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon"><Briefcase size={18} /> Account On (Optional)</label>
                  <input type="text" className="admin-dashboard-form-input-styled" placeholder="e.g. facebook, github"
                    {...register("accountOn")}
                  />
                </div> */}
              </div>

              {/* --- Row 8: Hobbies --- */}
              <div className="admin-dashboard-form-group-animated">
                <label className="admin-dashboard-form-label-with-icon">
                  Select Hobbies <span className="required-field" style={{ color: "red" }}>
                    *
                  </span>
                </label>
                <div
                  className="admin-dashboard-checkbox-grid"
                  style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}
                >
                  {hobbiesList.map((hobby) => (
                    <label key={hobby} className="admin-dashboard-checkbox-label">
                      <input type="checkbox" {...register("hobbies", { required: "At least one hobby is required" })} value={hobby} />
                      {hobby}
                    </label>
                  ))}
                </div>
                {errors.hobbies && (
                  <div className="admin-dashboard-error-message">
                    <AlertCircle size={14} /> {errors.hobbies.message}
                  </div>
                )}
              </div>

              {/* --- Row 9: Profile Image, Documents --- */}
              <div className="admin-dashboard-form-row-grid">
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Upload size={18} /> Profile Image
                  </label>
                  {/* File Input Trigger */}
                  <input
                    ref={fileInputRefProfile}
                    id="profileImage"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/tiff,image/webp"
                    className={`admin-dashboard-form-input-file ${errors.profileImage ? "error" : ""}`}
                    onChange={handleProfileImageChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload only jpg/jpeg, png, gif, tiff, and webp.
                  </p>

                  {profilePreview && (
                    <img src={profilePreview} alt="Profile Preview" className="admin-dashboard-image-preview" />
                  )}

                  {/* ImageCropper Modal */}
                  {showCropper && rawPreview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="admin-cropper-modal-content">
                        <div className="admin-cropper-header">
                          <h2 className="admin-cropper-title">
                            Crop Your Profile Photo
                          </h2>
                          <button
                            type="button"
                            onClick={handleCropper}
                            className="admin-cropper-close-btn"
                          >
                            &times;
                          </button>
                        </div>
                        <ImageCropper
                          imageSrc={rawPreview}
                          onCropped={(croppedFile, previewUrl) => {
                            setValue("profileImage", croppedFile); // Set the cropped file to react-hook-form
                            setProfilePreview(previewUrl); // Set the preview URL for display
                            setShowCropper(false); // Close the cropper
                            setRawFile(null); // Clear raw file
                            setRawPreview(null); // Clear raw preview
                            if (fileInputRefProfile.current) {
                              fileInputRefProfile.current.value = ""; // Clear file input
                            }
                          }}
                          onCancel={handleCropper} // Use handleCropper to cancel
                        />
                      </div>
                    </div>
                  )}

                  {errors.profileImage && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} /> {errors.profileImage.message}
                    </div>
                  )}
                </div>
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Paperclip size={18} /> Upload Documents (PDF only, Optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    className="admin-dashboard-form-input-file"
                    onChange={handleDocumentsChange}
                  />
                  {documentFiles.length > 0 && (
                    <ul className="admin-dashboard-file-list">
                      {documentFiles.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* --- Form Actions --- */}
              <div className="admin-dashboard-form-actions-styled">
                <button
                  type="button"
                  className="admin-dashboard-btn-styled admin-dashboard-btn-styled-secondary"
                  style={{ backgroundColor: "#3498db", color: "#fff" }}
                  onClick={() => navigate("/admin/user")}
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
                      Submitting User...
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

export default AddUser;
