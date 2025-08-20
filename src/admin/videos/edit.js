import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import videoService from "../../services/videoService";
import packageService from "../../services/packageService";
import { useForm } from "react-hook-form";
import {
  FaIdCard,
  FaVideo,
  FaHeading,
  FaFileAlt,
  FaArrowLeft,
} from "react-icons/fa";

const EditVideo = () => {
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
      video_url: ""
     
    },
  });

  useEffect(() => {
    fetchPackages();
    fetchVideoData();
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

  const fetchVideoData = async () => {
    try {
      setIsLoading(true);
      const response = await videoService.getVideoById(id);
      console.log("Edit Video API Response:", response); // Debug log
      
      const videoData = response.data;
      console.log("Video Data:", videoData); // Debug log
      
      if (videoData) {
        // Set form values
        setValue("package_id", videoData.package_id?._id || videoData.package_id || "");
        setValue("video_url", videoData.video_url || "");
      
      } else {
        Swal.fire({
          title: "Error!",
          text: "Video not found",
          icon: "error",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/admin/videos");
        });
      }
    } catch (error) {
      console.error("Error fetching video data:", error);
      console.error("Error details:", error.response?.data); // Debug log
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to fetch video data",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/admin/videos");
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Create JSON data since we no longer have file uploads
      const videoData = {
        package_id: data.package_id,
        video_url: data.video_url,
       
      };

      console.log("Sending video data:", videoData);

      // Validate required fields
      if (!data.package_id) {
        throw new Error("Package is required");
      }
      if (!data.video_url) {
        throw new Error("Video URL is required");
      }
      
      

      await videoService.updateVideo(id, videoData);
      
      // First redirect to video index
      navigate("/admin/videos");

      // Then show success popup after a small delay
      setTimeout(() => {
        Swal.fire({
          title: "Success!",
          text: "Video has been updated successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
      }, 100);
    } catch (error) {
      console.error("Error updating video:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update video",
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
          <p className="mt-2">Loading video data...</p>
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
              Edit Video
            </h2>
          </div>

          <form onSubmit={hookFormSubmit(onSubmit)} className="card-body" noValidate>
            <div className="d-flex flex-column gap-4">
              
              {/* First Row: Package and Title */}
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

                 {/* Video URL */}
                <div className="form-group" style={{ flex: '1' }}>
                  <label className="form-label" htmlFor="video_url">
                    Video URL <span className="text-error">*</span>
                  </label>
                  <div className="position-relative">
                    <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                      <FaVideo className="text-muted" />
                    </div>
                    <input
                      type="url"
                      id="video_url"
                      {...register("video_url", { 
                        required: "Video URL is required",
                        pattern: {
                          value: /^https?:\/\/.+/,
                          message: "Please enter a valid URL"
                        }
                      })}
                      className={`form-control pl-10 ${errors.video_url ? "error" : ""}`}
                      placeholder="Enter video URL (https://...)"
                    />
                  </div>
                  {errors.video_url && (
                    <p className="form-error">{errors.video_url.message}</p>
                  )}
                </div>

                
              </div>

             
            </div>

            <div className="card-footer">
              <div className="d-flex justify-between align-center gap-4">
                {/* Back Button (Left-Bottom) */}
                <button
                  type="button"
                  onClick={() => navigate("/admin/videos")}
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

export default EditVideo;
