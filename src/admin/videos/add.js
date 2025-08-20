import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import Swal from "sweetalert2";
import videoService from "../../services/videoService";
import packageService from "../../services/packageService";
import { useForm, useFieldArray } from "react-hook-form";
import {
  FaIdCard,
  FaVideo,
  FaArrowLeft,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

const AddVideo = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packages, setPackages] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      videos: [
        {
          package_id: "",
          video_url: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "videos",
  });

  // Fetch packages on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

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
      const activePackages = packagesData.filter((pkg) => pkg.status === "active");
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

  const addNewVideo = () => {
    append({
      package_id: "",
      video_url: "",
    });
  };

  const removeVideo = (index) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      Swal.fire({
        title: "Cannot Remove",
        text: "At least one video entry is required",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Filter videos that have both required fields
      const validVideos = data.videos.filter(
        (video) => video.package_id && video.video_url
      );

      if (validVideos.length === 0) {
        throw new Error("At least one complete video entry is required");
      }

      // Show confirmation dialog for multiple videos
      if (validVideos.length > 1) {
        const result = await Swal.fire({
          title: "Confirm Submission",
          html: `You are about to add <strong>${validVideos.length}</strong> videos.`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, Add All Videos",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#00BCD4",
          cancelButtonColor: "#6c757d",
        });

        if (!result.isConfirmed) {
          setIsSubmitting(false);
          return;
        }
      }

      // Create videos one by one
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < validVideos.length; i++) {
        const videoData = validVideos[i];

        try {
          console.log(`Creating video ${i + 1}:`, videoData);
          await videoService.createVideo(videoData);
          successCount++;
          results.push({
            index: i + 1,
            status: "success",
          });
        } catch (error) {
          errorCount++;
          results.push({
            index: i + 1,
            status: "error",
            // The API is returning a generic 500 error, so we'll use a fixed message.
            message: "Server error: Failed to create video.",
          });
          console.error(`Error creating video ${i + 1}:`, error);
        }
      }

      // First redirect to video index
      navigate("/admin/videos");

      // Then show results popup after a small delay
      setTimeout(() => {
        if (errorCount === 0) {
          // All videos created successfully
          Swal.fire({
            title: "Success!",
            html: `All <strong>${successCount}</strong> videos have been added successfully!`,
            icon: "success",
            confirmButtonText: "OK",
          });
        } else if (successCount === 0) {
          // All videos failed
          Swal.fire({
            title: "Error!",
            html: `Failed to add any videos.<br><br>
                       <div style="text-align: left; font-size: 12px; max-height: 200px; overflow-y: auto;">
                         ${results
                           .map(
                             (result) =>
                               `${result.index}. ${result.message}`
                           )
                           .join("<br>")}
                       </div>`,
            icon: "error",
            confirmButtonText: "OK",
          });
        } else {
          // Mixed results
          Swal.fire({
            title: "Partial Success",
            html: `Successfully added <strong>${successCount}</strong> videos.<br>
                       Failed to add <strong>${errorCount}</strong> videos.<br><br>
                       <div style="text-align: left; font-size: 12px; max-height: 200px; overflow-y: auto;">
                         <strong>Failed videos:</strong><br>
                         ${results
                           .filter((r) => r.status === "error")
                           .map(
                             (result) =>
                               `${result.index}. ${result.message}`
                           )
                           .join("<br>")}
                       </div>`,
            icon: "warning",
            confirmButtonText: "OK",
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error adding videos:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to add videos",
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
            <div className="d-flex justify-between align-center">
              <h2 className="card-title">Add Multiple Videos</h2>
            </div>
          </div>

          <form onSubmit={hookFormSubmit(onSubmit)} className="card-body" noValidate>
            <div className="d-flex flex-column gap-4">
              {fields.map((field, index) => (
                <div key={field.id} className="video-entry-container">
                  <div className="video-entry-header">
                    <h4 className="video-entry-title">Video {index + 1}</h4>
                    <div className="video-entry-actions">
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="btn btn-outline-danger btn-sm"
                        title="Remove this video"
                        disabled={isSubmitting}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="video-entry-content">
                    {/* First Row: Package and Video URL */}
                    <div className="d-flex gap-4">
                      {/* Package */}
                      <div className="form-group" style={{ flex: "1" }}>
                        <label className="form-label" htmlFor={`package_id_${index}`}>
                          Package <span className="text-error">*</span>
                        </label>
                        <div className="position-relative">
                          <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                            <FaIdCard className="text-muted" />
                          </div>
                          <select
                            id={`package_id_${index}`}
                            {...register(`videos.${index}.package_id`, {
                              required: "Package is required",
                            })}
                            className={`form-control pl-10 ${
                              errors.videos?.[index]?.package_id ? "error" : ""
                            }`}
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
                        {errors.videos?.[index]?.package_id && (
                          <p className="form-error">
                            {errors.videos[index].package_id.message}
                          </p>
                        )}
                      </div>
                      {/* Video URL */}
                      <div className="form-group" style={{ flex: "1" }}>
                        <label className="form-label" htmlFor={`video_url_${index}`}>
                          Video URL <span className="text-error">*</span>
                        </label>
                        <div className="position-relative">
                          <div className="position-absolute inset-y-0 left-0 pl-3 d-flex align-center pointer-events-none">
                            <FaVideo className="text-muted" />
                          </div>
                          <input
                            type="url"
                            id={`video_url_${index}`}
                            {...register(`videos.${index}.video_url`, {
                              required: "Video URL is required",
                              pattern: {
                                value: /^https?:\/\/.+/,
                                message: "Please enter a valid URL",
                              },
                            })}
                            className={`form-control pl-10 ${
                              errors.videos?.[index]?.video_url ? "error" : ""
                            }`}
                            placeholder="Enter video URL (https://...)"
                          />
                        </div>
                        {errors.videos?.[index]?.video_url && (
                          <p className="form-error">
                            {errors.videos[index].video_url.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-footer">
              <div className="d-flex justify-between align-center gap-4">
                {/* Back Button (Left-Bottom) */}
                <button
                  type="button"
                  onClick={() => navigate("/admin/videos")}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  <FaArrowLeft className="mr-2" /> Back
                </button>

                {/* Action Buttons (Right-Bottom) */}
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={addNewVideo}
                    className="btn btn-success"
                    disabled={isSubmitting}
                  >
                    <FaPlus className="mr-2" /> Add Video
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Saving..."
                      : `Submit ${fields.length} Video${
                          fields.length > 1 ? "s" : ""
                        }`}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .video-entry-container {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          background: #f9fafb;
          position: relative;
        }

        .video-entry-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .video-entry-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .video-entry-title::before {
          content: "🎥";
          font-size: 20px;
        }

        .video-entry-actions {
          display: flex;
          gap: 8px;
        }

        .video-entry-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .video-entry-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .video-entry-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AddVideo;