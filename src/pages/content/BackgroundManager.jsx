import { useState, useEffect } from "react";
import { getBackgroundImage, updateBackgroundImage } from "../../config/api";

export default function BackgroundManager() {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchBackgroundImage();
  }, []);

  const fetchBackgroundImage = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBackgroundImage();
      setBackgroundImage(data);
    } catch (err) {
      setError(err.message || "Failed to load background image");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result);
      };
      reader.readAsDataURL(file);

      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.querySelector('input[type="file"]')?.files?.[0];

    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const result = await updateBackgroundImage(file);
      setBackgroundImage(result);
      setPreview(null);
      setSuccess("Background image updated successfully!");
      e.target.reset();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to update background image");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading background image...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Image */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Background</h3>
          {backgroundImage?.image_url ? (
            <div className="space-y-3">
              <img
                src={backgroundImage.image_url}
                alt="Background"
                className="w-full h-48 object-cover rounded-lg border border-gray-300"
              />
              {backgroundImage.updated_at && (
                <p className="text-sm text-gray-600">
                  Last updated: {new Date(backgroundImage.updated_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
              <p className="text-gray-500">No background image set</p>
            </div>
          )}
        </div>

        {/* Upload Form */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Background</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-xs text-gray-500">
                Supported formats: JPG, PNG, GIF, WebP. Max size: 10MB
              </p>
            </div>

            {/* Preview */}
            {preview && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Preview</label>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !preview}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {uploading ? "Uploading..." : "Upload Background Image"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
