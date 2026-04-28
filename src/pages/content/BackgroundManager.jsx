import { useState, useEffect } from "react";
import { getBackgroundImage, updateBackgroundImage, transformImageUrl } from "../../config/api";
import Notification from "../../components/Notification";

export default function BackgroundManager() {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchBackgroundImage();
  }, []);

  const fetchBackgroundImage = async () => {
    try {
      setLoading(true);
      const data = await getBackgroundImage();
      setBackgroundImage(data);
    } catch (err) {
      setNotification({ message: err.message || "Failed to load background image", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setNotification({ message: "Please select a valid image file", type: "error" });
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.querySelector('input[type="file"]')?.files?.[0];

    if (!file) {
      setNotification({ message: "Please select a file", type: "error" });
      return;
    }

    try {
      setUploading(true);
      const result = await updateBackgroundImage(file);
      setBackgroundImage(result);
      setPreview(null);
      setNotification({ message: "Background image updated successfully!", type: "success" });
      e.target.reset();
    } catch (err) {
      setNotification({ message: err.message || "Failed to update background image", type: "error" });
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
    <div>
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ message: "", type: "success" })}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Image */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Background</h3>
            {backgroundImage?.image_url ? (
              <div className="space-y-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <img
                  src={transformImageUrl(backgroundImage.image_url)}
                  alt="Background"
                  className="w-full h-48 object-cover rounded-lg border border-blue-200"
                />
                {backgroundImage.updated_at && (
                  <p className="text-sm text-gray-600">
                    Last updated: {new Date(backgroundImage.updated_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="w-full h-48 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
                <p className="text-gray-500">No background image set</p>
              </div>
            )}
          </div>

          {/* Upload Form */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Background</h3>

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
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 border border-blue-200 rounded-lg px-3 py-2"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF, WebP. Max size: 10MB
                </p>
              </div>

              {/* Preview */}
              {preview && (
                <div className="space-y-2 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <label className="block text-sm font-medium text-gray-700">Preview</label>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-blue-200"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading || !preview}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm"
              >
                {uploading ? "Uploading..." : "Upload Background Image"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
