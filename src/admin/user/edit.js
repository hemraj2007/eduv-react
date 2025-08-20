import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import userService from "../../services/userService";
import { useForm } from "react-hook-form";
import {
  User, Mail, Phone, MapPin, ArrowLeft, Save, CheckCircle, AlertCircle, Key, Calendar, Flag,
  Building, Globe, Link, Briefcase, Book, Paperclip, Mars, Venus, Earth, X
} from "lucide-react";
import Loader from "../../components/Loader";
import ImageCropper from "../../components/ImageCropper"; // Import ImageCropper component
import CropperModal from "../../components/CropperModal";
import '../../style/admin-style.css';


// --- Data for Dropdowns ---
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
  "Reading", "Cooking", "Art & Drawing", "Gardening",
  "Coding", "Music", "Photography", "Hiking",
  "Gaming", "Dancing", "Blogging", "Yoga",
  "Traveling", "Sports", "Fishing", "Writing"
];


const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // For displaying the final cropped image
  const [initialState, setInitialState] = useState(null); // To store state from API initially
  const [initialCity, setInitialCity] = useState(null); // To store city from API initially
  const [uploadedDocuments, setUploadedDocuments] = useState([]); // Stores both existing and new files
  const [documentsToDelete, setDocumentsToDelete] = useState([]); // Stores paths of documents to be deleted
  const [showDocumentPopup, setShowDocumentPopup] = useState(false);
  const [currentDocumentUrl, setCurrentDocumentUrl] = useState('');

  // State for image cropping
  const [rawFile, setRawFile] = useState(null); // Original file
  const [rawPreview, setRawPreview] = useState(null); // URL of original file for cropper
  const [showCropper, setShowCropper] = useState(false); // To show/hide cropper modal
  const fileInputRefProfile = useRef(null); // Ref for the file input


  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      mobile: "",
      gender: "",
      dob: "",
      country: "",
      state: "",
      city: "",
      address: "",
      pincode: "",
      linkedinUrl: "",
      githubUrl: "",
      accountOn: "",
      hobbies: [],
      profile: null,
      documents: [],
    },
  });


  const watchCountry = watch("country");
  const watchState = watch("state");


  useEffect(() => {
    fetchUserData();
    setTimeout(() => setIsVisible(true), 100);
  }, [id, setValue]);

  // New useEffect to set state after country is populated
  useEffect(() => {
    if (watchCountry && initialState) {
      const statesForCountry = locationData[watchCountry] || {};
      if (Object.keys(statesForCountry).includes(initialState)) {
        requestAnimationFrame(() => {
          setValue("state", initialState);
          setInitialState(null); // Clear initialState after setting
        });
      }
    }
  }, [watchCountry, initialState, setValue]);

  // New useEffect to set city after state is populated and initialCity is available
  useEffect(() => {
    if (watchState && initialCity && watchCountry) {
      const citiesForState = locationData[watchCountry]?.[watchState] || [];
      if (citiesForState.includes(initialCity)) {
        // Use requestAnimationFrame to ensure the DOM has updated with city options
        requestAnimationFrame(() => {
          setValue("city", initialCity);
          setInitialCity(null); // Clear initialCity after setting
        });
      }
    }
  }, [watchState, initialCity, setValue, watchCountry]);


  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getUserById(id);
      const userData = response.data;


      if (userData) {
        setValue("fullName", userData.fullName || "");
        setValue("email", userData.email || "");
        setValue("mobile", userData.mobile || "");
        setValue("gender", userData.gender || "");
        setValue("dob", userData.dob ? new Date(userData.dob).toISOString().slice(0, 10) : null);
        setValue("country", userData.country || "");
        setInitialState(userData.state || ""); // Store state temporarily
        setInitialCity(userData.city || ""); // Store city temporarily

        // Add logs to inspect fetched values and locationData structure
        console.log("Fetched Country:", userData.country);
        console.log("Fetched State:", userData.state);
        console.log("LocationData Keys for Country:", Object.keys(locationData));
        if (userData.country) {
            console.log("LocationData Keys for State:", Object.keys(locationData[userData.country]));
        }

        setValue("address", userData.address || "");
        setValue("pincode", userData.pincode || "");
        setValue("linkedinUrl", userData.linkedinUrl || "");
        setValue("githubUrl", userData.githubUrl || "");
        setValue("accountOn", userData.accountOn || "");


        // Debugging: Log the type and value of userData.hobbies and userData.image
        console.log("DEBUG: userData.hobbies:", userData.hobbies, "Type:", typeof userData.hobbies, "Is Array:", Array.isArray(userData.hobbies));
        console.log("DEBUG: userData.image:", userData.image);
        console.log("DEBUG: process.env.PUBLIC_URL:", process.env.PUBLIC_URL);


        let processedHobbies = [];
        if (userData.hobbies) { // Check if it's not null or undefined
          if (typeof userData.hobbies === 'string') {
            processedHobbies = userData.hobbies.split(',').map(h => h.trim()).filter(h => h !== '');
          } else if (Array.isArray(userData.hobbies)) {
            // If it's an array, use flatMap to handle cases like ["hobby1,hobby2"] or ["hobby1", "hobby2"]
            processedHobbies = userData.hobbies.flatMap(item => {
              if (typeof item === 'string') {
                return item.split(',').map(h => h.trim()).filter(h => h !== '');
              }
              return []; // Ignore non-string elements in the array
            });
          }
        }
        setValue("hobbies", processedHobbies);
        // Set profile image, use dummy if not available
        const finalProfileImageUrl = userData.image ? `${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/${userData.image}` : process.env.PUBLIC_URL + "/dummy-user.jpg";
        setProfileImage(finalProfileImageUrl);
        console.log("DEBUG: finalProfileImageUrl:", finalProfileImageUrl); // Log the final URL
        // Ensure existing documents are stored as strings (their paths)
        setUploadedDocuments(userData.documents ? userData.documents.map(doc => doc) : []);
        setDocumentsToDelete([]); // Reset on fetch


      } else {
        Swal.fire({
          title: '<div class="error-popup-header"><AlertCircle class="error-icon" /><span>Error!</span></div>',
          text: "User not found",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#ef4444",
          customClass: {
            popup: 'animated-popup error-popup',
            title: 'error-popup-title',
            confirmButton: 'error-popup-btn'
          },
          showClass: {
            popup: 'animate__animated animate__shakeX animate__faster'
          }
        }).then(() => {
          navigate("/admin/user");
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Swal.fire({
        title: '<div class="error-popup-header"><AlertCircle class="error-icon" /><span>Error!</span></div>',
        text: error.response?.data?.message || "Failed to fetch user data",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: 'animated-popup error-popup',
          title: 'error-popup-title',
          confirmButton: 'error-popup-btn'
        },
        showClass: {
          popup: 'animate__animated animate__shakeX animate__faster'
        }
      }).then(() => {
        navigate("/admin/user");
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setValue("country", selectedCountry);
    setValue("state", "");
    setValue("city", "");
  };


  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setValue("state", selectedState);
    setValue("city", "");
  };


  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setRawFile(null);
      setRawPreview(null);
      // If no file is selected, revert to the existing profile image or dummy
      setProfileImage(prev => prev || (process.env.PUBLIC_URL + "/dummy-user.jpg"));
      setValue("profile", null);
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
      setValue("profile", null);
      setRawFile(null);
      setRawPreview(null);
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
    // Revert profile preview to original if cancelled
    fetchUserData(); // Re-fetch user data to get original image
  };


  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    // Append new documents to existing documents
    setUploadedDocuments(prev => [...prev, ...files]);
    setValue("documents", [...uploadedDocuments, ...files]);
  };


  const handleRemoveDocument = (indexToRemove) => {
    const docToRemove = uploadedDocuments[indexToRemove];
    // If the document is an existing one (string path), add it to documentsToDelete
    if (typeof docToRemove === 'string') {
      setDocumentsToDelete(prev => [...prev, docToRemove]);
    }
    const newDocs = uploadedDocuments.filter((_, i) => i !== indexToRemove);
    setUploadedDocuments(newDocs);
    setValue("documents", newDocs);
  };


  const handleDocumentView = (doc) => {
    const docUrl = typeof doc === 'string'
      ? `${process.env.REACT_APP_API_URL || 'http://localhost:1100'}/documents/${doc}`
      : URL.createObjectURL(doc);
    window.open(docUrl, '_blank'); // Open in a new tab
  };


  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const formData = new FormData();
    // Append all form data fields
    for (const key in data) {
      if (key === "hobbies") {
        if (Array.isArray(data.hobbies) && data.hobbies.length > 0) {
          formData.append(key, data.hobbies.join(','));
        } else {
          formData.append(key, '');
        }
      } else if (key === "profile" && data[key]) {
        formData.append('image', data[key]);
      } else if (key !== "documents" && data[key] !== undefined && data[key] !== null) { // Exclude 'documents' from this loop
        formData.append(key, data[key]);
      }
    }


    // Append all documents from the uploadedDocuments state (both new files and existing paths)
    uploadedDocuments.forEach((doc) => {
      formData.append("documents", doc);
    });


    // The documentsToDelete array is no longer explicitly sent.
    // The backend is assumed to replace the entire document list with what's sent in 'documents'.


    try {
      const emailExists = await checkEmailExists(data.email, id); // Pass current user ID to exclude self
      if (emailExists) {
        Swal.fire({
          title: '<div class="error-popup-header"><AlertCircle class="error-icon" /><span>Error!</span></div>',
          text: "This email is already registered. Please use a different email.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#ef4444",
          customClass: {
            popup: 'animated-popup error-popup',
            title: 'error-popup-title',
            confirmButton: 'error-popup-btn'
          },
          showClass: {
            popup: 'animate__animated animate__shakeX animate__faster'
          }
        });
        setIsSubmitting(false);
        return;
      }


      await userService.updateUser(id, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });


      navigate("/admin/user", { state: { successMessage: "User has been updated successfully" } });
    } catch (error) {
      console.error("Error updating user:", error);
      let errorMessage = "Failed to update user";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }


      Swal.fire({
        title: '<div class="error-popup-header"><AlertCircle class="error-icon" /><span>Error!</span></div>',
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: 'animated-popup error-popup',
          title: 'error-popup-title',
          confirmButton: 'error-popup-btn'
        },
        showClass: {
          popup: 'animate__animated animate__shakeX animate__faster'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const checkEmailExists = async (email, currentUserId) => {
    try {
      // This is a placeholder. You need to implement this in your userService.
      // It should make an API call to check if the email exists,
      // and if it does, ensure it's not the current user's email.
      const response = await userService.checkEmailExists(email); // Assuming this returns { exists: boolean, userId: string }
      return response.exists && response.userId !== currentUserId;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false;
    }
  };


  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };




  return (
    <AdminLayout>
      {isLoading && <Loader title="Loading User Data..." subtitle="Please wait..." />}
      {isSubmitting && <Loader title="Updating User..." subtitle="Please wait..." />}
      <div className={`admin-dashboard-edit-user-container ${isVisible ? 'visible' : ''}`}>
        <div className="admin-dashboard-form-card">
          <div className="admin-dashboard-form-header">
            <h2>Edit User</h2>

          </div>
          <div className="admin-dashboard-form-body">
            <form onSubmit={hookFormSubmit(onSubmit)}>
              {/* Row 1: Full Name and Email */}
              <div className="admin-dashboard-form-row-grid">
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <User size={18} /> Full Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`admin-dashboard-form-input-styled ${errors.fullName ? 'error' : ''}`}
                    placeholder="Enter full name"
                    {...register("fullName", {
                      required: "Full name is required",
                      minLength: { value: 2, message: "Name must be at least 2 characters" }
                    })}
                  />
                  {errors.fullName && (
                    <div className="admin-dashboard-error-message"><AlertCircle size={14} />{errors.fullName.message}</div>
                  )}
                </div>
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Mail size={18} /> Email Address <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="email"
                    className={`admin-dashboard-form-input-styled ${errors.email ? 'error' : ''}`}
                    placeholder="Enter email address"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                  />
                  {errors.email && (
                    <div className="admin-dashboard-error-message"><AlertCircle size={14} />{errors.email.message}</div>
                  )}
                </div>
              </div>


              {/* Row 2: Password and Mobile Number */}
              <div className="admin-dashboard-form-row-grid">
                {/* <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Key size={18} /> Password
                  </label>
                  <input
                    type="password"
                    className={`admin-dashboard-form-input-styled ${errors.password ? 'error' : ''}`}
                    placeholder="Leave blank to keep current password"
                    {...register("password", {
                      minLength: { value: 6, message: "Password must be at least 6 characters" },
                      required: false,
                    })}
                  />
                  {errors.password && (
                    <div className="admin-dashboard-error-message"><AlertCircle size={14} />{errors.password.message}</div>
                  )}
                </div> */}
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Earth size={18} /> Gender <span style={{ color: 'red' }}>*</span>
                  </label>
                  <div className="admin-dashboard-radio-group">
                    <label><input type="radio" {...register("gender", { required: "Gender is required" })} value="Male" /> Male</label>
                    <label><input type="radio" {...register("gender", { required: "Gender is required" })} value="Female" /> Female</label>
                    <label><input type="radio" {...register("gender", { required: "Gender is required" })} value="Other" /> Other</label>
                  </div>
                  {errors.gender && (
                    <div className="admin-dashboard-error-message"><AlertCircle size={14} />{errors.gender.message}</div>
                  )}
                </div>


                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Phone size={18} /> Mobile Number <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`admin-dashboard-form-input-styled ${errors.mobile ? 'error' : ''}`}
                    placeholder="Enter mobile number"
                    {...register("mobile", {
                      required: "Mobile number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Mobile number must be exactly 10 digits"
                      }
                    })}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setValue("mobile", value);
                    }}
                  />
                  {errors.mobile && (
                    <div className="admin-dashboard-error-message"><AlertCircle size={14} />{errors.mobile.message}</div>
                  )}
                </div>
              </div>


              {/* Row 3: Gender and Date of Birth */}
              <div className="admin-dashboard-form-row-grid">

                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Calendar size={18} /> Date of Birth <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className={`admin-dashboard-form-input-styled ${errors.dob ? 'error' : ''}`}
                    {...register("dob", {
                      required: "Date of birth is required",
                      validate: (value) => {
                        const age = calculateAge(value);
                        if (age === null) return "Invalid date";
                        return (age >= 18 && age <= 75) || "Age must be between 18 and 75";
                      }
                    })}
                  />
                  {errors.dob && (
                    <div className="admin-dashboard-error-message"><AlertCircle size={14} />{errors.dob.message}</div>
                  )}
                </div>
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Flag size={18} /> Country <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    className={`admin-dashboard-form-input-styled ${errors.country ? 'error' : ''}`}
                    {...register("country", { required: "Country is required" })}
                    onChange={handleCountryChange}
                  >
                    <option value="">Select Country</option>
                    {Object.keys(locationData).map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {errors.country && (
                    <div className="admin-dashboard-error-message"><AlertCircle size={14} />{errors.country.message}</div>
                  )}
                </div>
              </div>




              {/* Row 4: Country and State */}
              <div className="admin-dashboard-form-row-grid">

                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Building size={18} /> State <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    className={`admin-dashboard-form-input-styled ${errors.state ? 'error' : ''}`}
                    {...register("state", { required: "State is required" })}
                    disabled={!watchCountry}
                    onChange={handleStateChange}
                  >
                    <option value="">Select State</option>
                    {watchCountry && Object.keys(locationData[watchCountry]).map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && (
                    <div className="admin-dashboard-error-message"><AlertCircle size={14} />{errors.state.message}</div>
                  )}
                </div>
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <MapPin size={18} /> City <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    className={`admin-dashboard-form-input-styled ${errors.city ? 'error' : ''}`}
                    {...register("city", { required: "City is required" })}
                    disabled={!watchState}
                  >
                    <option value="">Select City</option>
                    {watchState && locationData[watchCountry][watchState].map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.city && (
                    <div className="admin-dashboard-error-message"><AlertCircle size={14} />{errors.city.message}</div>
                  )}
                </div>
              </div>


              {/* Row 5: City and Address */}
              <div className="admin-dashboard-form-row-grid">

                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <MapPin size={18} /> Address <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`admin-dashboard-form-input-styled ${errors.address ? 'error' : ''}`}
                    placeholder="Enter address"
                    {...register("address", { required: "Address is required" })}
                  />
                  {errors.address && (
                    <div className="admin-dashboard-error-message"><AlertCircle size={14} />{errors.address.message}</div>
                  )}
                </div>
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Mail size={18} /> Pincode <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`admin-dashboard-form-input-styled ${errors.pincode ? 'error' : ''}`}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    {...register("pincode", {
                      required: "Pincode is required",
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: "Pincode must be 6 digits"
                      }
                    })}
                  />
                  {errors.pincode && (
                    <div className="admin-dashboard-error-message"><AlertCircle size={14} />{errors.pincode.message}</div>
                  )}
                </div>
              </div>


              {/* Row 6: Pincode and LinkedIn URL */}
              <div className="admin-dashboard-form-row-grid">

                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Link size={18} /> LinkedIn URL
                  </label>
                  <input
                    type="text"
                    className={`admin-dashboard-form-input-styled ${errors.linkedinUrl ? 'error' : ''}`}
                    placeholder="Enter LinkedIn URL (Optional)"
                    {...register("linkedinUrl", {
                      pattern: {
                        value: /^(ftp|http|https):\/\/[^ "]+$/,
                        message: "Invalid URL",
                      },
                    })}
                  />
                  {errors.linkedinUrl && (
                    <div className="admin-dashboard-error-message"><AlertCircle size={14} />{errors.linkedinUrl.message}</div>
                  )}
                </div>
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Link size={18} /> GitHub URL
                  </label>
                  <input
                    type="text"
                    className={`admin-dashboard-form-input-styled ${errors.githubUrl ? 'error' : ''}`}
                    placeholder="Enter GitHub URL (Optional)"
                    {...register("githubUrl", {
                      pattern: {
                        value: /^(ftp|http|https):\/\/[^ "]+$/,
                        message: "Invalid URL",
                      },
                    })}
                  />
                  {errors.githubUrl && (
                    <div className="admin-dashboard-error-message"><AlertCircle size={14} />{errors.githubUrl.message}</div>
                  )}
                </div>
              </div>




              {/* Row 8: Hobbies */}
              <div className="admin-dashboard-form-group-animated full-width">
                <label className="admin-dashboard-form-label-with-icon">
                  <Book size={18} /> Select Hobbies <span style={{ color: 'red' }}>*</span>
                </label>
                <div className="admin-dashboard-checkbox-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {hobbiesList.map((hobby) => (
                    <label key={hobby} className="admin-dashboard-checkbox-label">
                      <input
                        type="checkbox"
                        value={hobby}
                        {...register("hobbies", {
                          required: "At least one hobby is required"
                        })}
                        defaultChecked={watch('hobbies')?.includes(hobby)}
                      />
                      {hobby}
                    </label>
                  ))}
                </div>
                {errors.hobbies && (
                  <div className="admin-dashboard-error-message"><AlertCircle size={14} />{errors.hobbies.message}</div>
                )}
              </div>


              {/* Row 9: Profile Image and Documents */}
              <div className="admin-dashboard-form-row-grid">
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <User size={18} /> Profile Image (Optional)
                  </label>
                  {/* File Input Trigger */}
                  <input
                    ref={fileInputRefProfile}
                    id="profile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/tiff,image/webp"
                    className="file-input-styled"
                    onChange={handleProfileImageChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload only jpg/jpeg, png.
                  </p>

                  <div className="image-preview-container image-preview-box">
                    <img
                      src={profileImage}
                      alt="Profile Preview"
                      className="image-preview"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = process.env.PUBLIC_URL + "/dummy-user.jpg";
                      }}
                    />
                  </div>

                  {/* ImageCropper Modal */}
                  {showCropper && rawPreview && (
                    <CropperModal
                      imageSrc={rawPreview}
                      onCropped={(croppedFile, previewUrl) => {
                        setValue("profile", croppedFile); // Set the cropped file to react-hook-form
                        setProfileImage(previewUrl); // Set the preview URL for display
                        setShowCropper(false); // Close the cropper
                        setRawFile(null); // Clear raw file
                        setRawPreview(null); // Clear raw preview
                        if (fileInputRefProfile.current) {
                          fileInputRefProfile.current.value = ""; // Clear file input
                        }
                      }}
                      onCancel={handleCropper} // Use handleCropper to cancel
                    />
                  )}
                </div>
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <Paperclip size={18} /> Upload Documents (Optional)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    className="file-input-styled"
                    onChange={handleDocumentUpload}
                  />
                  <div className="uploaded-files-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
                    {uploadedDocuments.map((doc, index) => (
                      <div key={index} className="document-preview-box" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '120px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <Paperclip size={24} style={{ marginBottom: '8px', color: '#666' }} />
                        <span style={{ fontSize: '0.85em', textAlign: 'center', wordBreak: 'break-word', marginBottom: '8px', flexGrow: 1 }}>
                          {doc.name || (typeof doc === 'string' ? doc.split('/').pop() : `Document ${index + 1}`)}
                        </span>
                        <div className="document-actions" style={{ display: 'flex', gap: '5px', width: '100%', justifyContent: 'center' }}>
                          <button type="button" onClick={() => handleDocumentView(doc)} className="view-file-btn" style={{ padding: '5px 10px', border: '1px solid #3498db', borderRadius: '5px', background: '#3498db', color: '#fff', cursor: 'pointer', fontSize: '0.8em' }}>
                            View
                          </button>
                          <button type="button" onClick={() => handleRemoveDocument(index)} className="remove-file-btn" style={{ padding: '5px 10px', border: '1px solid #ef4444', borderRadius: '5px', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: '0.8em' }}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


              {/* Form Actions */}
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
                  style={{ backgroundColor: "#10b981", color: "#fff" }}
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
export default EditUser;
