import { useState, useEffect } from "react";
import { transformImageUrl } from "../../config/api";

const PRIORITY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
const DESTINATION_CODES = ["RGN", "MDL", "NYT", "BKK", "CNX", "DAD"]; // Add more as needed

export default function BannerForm({ banner, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    title: "",
    destinationCode: "",
    priority: 1,
    isActive: true,
    file: null,
  });

  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        destinationCode: banner.destination_code || "",
        priority: banner.priority || 1,
        isActive: banner.is_active !== false,
        file: null,
      });
      setPreview(transformImageUrl(banner.image_url) || null);
    }
  }, [banner]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, file: "Please select a valid image file" });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result);
      };
      reader.readAsDataURL(file);

      setFormData({ ...formData, file });
      setErrors({ ...errors, file: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.destinationCode) {
      newErrors.destinationCode = "Destination code is required";
    }

    if (!banner && !formData.file) {
      newErrors.file = "Image file is required for new banners";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-blue-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">
            {banner ? "Edit Banner" : "Create New Banner"}
          </h2>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.title
                  ? "border-red-500 focus:ring-red-500"
                  : "border-blue-200 focus:ring-blue-400"
              }`}
              placeholder="Enter banner title"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Destination Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Code <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.destinationCode}
              onChange={(e) =>
                setFormData({ ...formData, destinationCode: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.destinationCode
                  ? "border-red-500 focus:ring-red-500"
                  : "border-blue-200 focus:ring-blue-400"
              }`}
              disabled={isLoading}
            >
              <option value="">Select a destination</option>
              {DESTINATION_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            {errors.destinationCode && (
              <p className="text-red-500 text-xs mt-1">
                {errors.destinationCode}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority (1-8) <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status (only for edit) */}
          {banner && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                disabled={isLoading}
                className={`w-full px-4 py-2 rounded-lg font-medium transition text-sm ${
                  formData.isActive
                    ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                } disabled:opacity-50`}
              >
                {formData.isActive ? "✓ Active" : "✗ Inactive"}
              </button>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image {!banner && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 border border-blue-200 rounded-lg px-3 py-2 ${
                errors.file ? "border-red-500" : ""
              }`}
              disabled={isLoading}
            />
            {errors.file && (
              <p className="text-red-500 text-xs mt-1">{errors.file}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPG, PNG, GIF, WebP
            </p>
          </div>

          {/* Preview */}
          {preview && (
            <div className="space-y-2 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <label className="block text-sm font-medium text-gray-700">
                Preview
              </label>
              <img
                src={preview}
                alt="Banner preview"
                className="w-full h-32 object-cover rounded-lg border border-blue-200"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-blue-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-blue-200 text-gray-700 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm"
            >
              {isLoading ? "..." : banner ? "Update Banner" : "Create Banner"}
            </button>
          </div>
        </form>
    </div>
  );
}
