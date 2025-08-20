import React, { useRef } from "react";
import Cropper from "react-cropper";
import 'react-cropper/node_modules/cropperjs/src/css/cropper.css';

const ImageCropper = ({
  imageSrc,
  onCropped,
  onCancel,
  aspectRatio = 1,
}) => {
  const cropperRef = useRef(null);

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas();
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], "cropped-image.png", { type: "image/png" });
      const previewUrl = URL.createObjectURL(file);
      onCropped(file, previewUrl);
    }, "image/png");
  };

  return (
    <div className="admin-cropper-container">
      <Cropper
        src={imageSrc}
        className="admin-cropper-instance" /* Add a class for styling */
        initialAspectRatio={aspectRatio}
        guides={true}
        viewMode={1}
        background={false}
        responsive={true}
        autoCropArea={1}
        checkOrientation={false}
        ref={cropperRef}
      />
      <div className="admin-cropper-buttons">
        <button
          type="button"
          onClick={onCancel}
          className="admin-cropper-cancel-btn"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCrop}
          className="admin-cropper-crop-btn"
        >
          Crop
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
