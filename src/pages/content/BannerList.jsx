import { useState, useEffect } from "react";
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deactivateBanner,
} from "../../config/api";
import BannerForm from "./BannerForm";

export default function BannerList() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedBanner(null);
    setShowModal(true);
  };

  const handleEditClick = (banner) => {
    setSelectedBanner(banner);
    setShowModal(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (selectedBanner) {
        // Edit mode
        const updates = {
          title: formData.title,
          destinationCode: formData.destinationCode,
          priority: formData.priority,
          isActive: formData.isActive,
        };

        if (formData.file) {
          updates.file = formData.file;
        }

        await updateBanner(selectedBanner.id, updates);
        setSuccess("Banner updated successfully!");
      } else {
        // Create mode
        if (!formData.file) {
          setError("File is required");
          setIsSubmitting(false);
          return;
        }

        await createBanner(
          formData.file,
          formData.title,
          formData.destinationCode,
          formData.priority
        );
        setSuccess("Banner created successfully!");
      }

      setShowModal(false);
      setSelectedBanner(null);
      await fetchBanners();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to save banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (bannerId) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await deactivateBanner(bannerId);
      setSuccess("Banner deactivated successfully!");
      setDeleteConfirmId(null);
      await fetchBanners();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to deactivate banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading banners...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">All Banners</h3>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          + Create Banner
        </button>
      </div>

      {/* Messages */}
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

      {/* Banners Table */}
      {banners.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Destination
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Priority
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id} className="border-b border-gray-200 hover:bg-gray-50">
                  {/* Image */}
                  <td className="px-4 py-3">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {banner.title}
                  </td>

                  {/* Destination */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {banner.destination_code}
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {banner.priority}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        banner.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {banner.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEditClick(banner)}
                        disabled={isSubmitting}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 disabled:opacity-50 transition"
                      >
                        Edit
                      </button>
                      <div className="relative group">
                        <button
                          onClick={() =>
                            setDeleteConfirmId(
                              deleteConfirmId === banner.id ? null : banner.id
                            )
                          }
                          disabled={isSubmitting}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 disabled:opacity-50 transition"
                        >
                          Delete
                        </button>

                        {/* Confirmation Popup */}
                        {deleteConfirmId === banner.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg p-3 z-10 w-48">
                            <p className="text-sm text-gray-700 mb-2">
                              Are you sure you want to deactivate this banner?
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                disabled={isSubmitting}
                                className="flex-1 px-2 py-1 border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDelete(banner.id)}
                                disabled={isSubmitting}
                                className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:bg-gray-400"
                              >
                                {isSubmitting ? "..." : "Confirm"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No banners found. Create one to get started!</p>
        </div>
      )}

      {/* Banner Form Modal */}
      {showModal && (
        <BannerForm
          banner={selectedBanner}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedBanner(null);
          }}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
