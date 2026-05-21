import { useState, useEffect } from 'react';
import './ImageUpload.css';

function ImageUpload({ register, error, existingImage = null, name = 'image' }) {
  const [preview, setPreview] = useState(existingImage);
  const [dragActive, setDragActive] = useState(false);

  // Build full URL for existing image
  useEffect(() => {
    if (existingImage && typeof existingImage === 'string') {
      const fullUrl = existingImage.startsWith('http')
        ? existingImage
        : `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${existingImage}`;
      setPreview(fullUrl);
    }
  }, [existingImage]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndPreview(file, e);
    }
  };

  const validateAndPreview = (file, e) => {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      if (e?.target) e.target.value = '';
      return false;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Only JPG and PNG images are allowed');
      if (e?.target) e.target.value = '';
      return false;
    }

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateAndPreview(file, null)) {
        // Update the file input programmatically
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const input = document.getElementById(`${name}-input`);
        if (input) {
          input.files = dataTransfer.files;
          // Trigger change event for react-hook-form
          const event = new Event('change', { bubbles: true });
          input.dispatchEvent(event);
        }
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    const input = document.getElementById(`${name}-input`);
    if (input) {
      input.value = '';
    }
  };

  const { onChange, ...restRegister } = register(name);

  return (
    <div className="image-upload">
      <label className="image-upload-label">Recipe Image *</label>

      <div
        className={`image-upload-area ${dragActive ? 'drag-active' : ''} ${preview ? 'has-preview' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="image-preview">
            <img src={preview} alt="Recipe preview" />
            <button
              type="button"
              className="remove-image-btn"
              onClick={handleRemove}
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="upload-placeholder">
            <span className="upload-icon">📷</span>
            <p>Drag and drop an image here, or click to select</p>
            <p className="upload-hint">Max size: 5MB. Formats: JPG, PNG</p>
          </div>
        )}

        <input
          id={`${name}-input`}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          className="image-input"
          {...restRegister}
          onChange={(e) => {
            onChange(e);
            handleFileChange(e);
          }}
        />
      </div>

      {error && <span className="image-error">{error.message}</span>}
    </div>
  );
}

export default ImageUpload;
