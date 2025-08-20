import React from "react";
import ImageCropper from "./ImageCropper";

const CropperModal = ({
  imageSrc,
  onCropped,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="admin-cropper-modal-content">
        <div className="admin-cropper-header">
          <h2 className="admin-cropper-title">
            Crop Your Profile Photo
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="admin-cropper-close-btn"
          >
            &times;
          </button>
        </div>
        <div className="admin-cropper-body"> {/* New div for body content */}
          <ImageCropper
            imageSrc={imageSrc}
            onCropped={onCropped}
            onCancel={onCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default CropperModal;
