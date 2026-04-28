import { useState, useEffect } from "react";
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  deactivateBanner,
  transformImageUrl,
} from "../../config/api";
import BannerForm from "./BannerForm";
import Notification from "../../components/Notification";

export default function BannerList() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deactivateConfirmId, setDeactivateConfirmId] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await getAllBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      let backendMessage = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error;
      // Clean up enum class references in error messages
      if (backendMessage) {
        backendMessage = backendMessage.replace(/\b\w+\./g, '');
      }
      const errorMessage = backendMessage || err.message || "Failed to load banners";
      setNotification({ message: errorMessage, type: "error" });
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
        setNotification({ message: "Banner updated successfully!", type: "success" });
      } else {
        // Create mode
        if (!formData.file) {
          setNotification({ message: "File is required", type: "error" });
          setIsSubmitting(false);
          return;
        }

        await createBanner(
          formData.file,
          formData.title,
          formData.destinationCode,
          formData.priority
        );
        setNotification({ message: "Banner created successfully!", type: "success" });
      }

      setShowModal(false);
      setSelectedBanner(null);
      await fetchBanners();
    } catch (err) {
      let backendMessage = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error;
      // Clean up enum class references in error messages
      if (backendMessage) {
        backendMessage = backendMessage.replace(/\b\w+\./g, '');
      }
      const errorMessage = backendMessage || err.message || "Failed to save banner";
      setNotification({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (bannerId) => {
    try {
      setIsSubmitting(true);
      await deleteBanner(bannerId);
      setNotification({ message: "Banner deleted successfully!", type: "success" });
      setDeleteConfirmId(null);
      await fetchBanners();
    } catch (err) {
      let backendMessage = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error;
      // Clean up enum class references in error messages
      if (backendMessage) {
        backendMessage = backendMessage.replace(/\b\w+\./g, '');
      }
      const errorMessage = backendMessage || err.message || "Failed to delete banner";
      setNotification({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (bannerId) => {
    try {
      setIsSubmitting(true);
      await deactivateBanner(bannerId);
      setNotification({ message: "Banner deactivated successfully!", type: "success" });
      setDeactivateConfirmId(null);
      await fetchBanners();
    } catch (err) {
      let backendMessage = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error;
      // Clean up enum class references in error messages
      if (backendMessage) {
        backendMessage = backendMessage.replace(/\b\w+\./g, '');
      }
      const errorMessage = backendMessage || err.message || "Failed to deactivate banner";
      setNotification({ message: errorMessage, type: "error" });
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
    <div>
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ message: "", type: "success" })}
      />
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">All Banners</h3>
          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
          >
            + Create Banner
          </button>
        </div>

        {/* Banners Table */}
        {banners.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-y border-blue-200 text-gray-600 text-xs uppercase tracking-wide">
                <tr>
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Destination</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id} className="border-b border-blue-200 hover:bg-blue-50">
                  <td className="px-4 py-3">
                    <img
                      src={transformImageUrl(banner.image_url)}
                      alt={banner.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{banner.title}</td>
                  <td className="px-4 py-3 text-gray-600">{banner.destination_code}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {banner.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEditClick(banner)}
                        disabled={isSubmitting}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 disabled:opacity-50 transition"
                      >
                        Edit
                      </button>
                      {banner.is_active && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setDeactivateConfirmId(
                                deactivateConfirmId === banner.id ? null : banner.id
                              )
                            }
                            disabled={isSubmitting}
                            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium hover:bg-yellow-200 disabled:opacity-50 transition"
                          >
                            Deactivate
                          </button>

                          {deactivateConfirmId === banner.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-blue-200 rounded-lg shadow-lg p-3 z-10 w-48">
                              <p className="text-sm text-gray-700 mb-3">
                                Are you sure you want to deactivate this banner?
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setDeactivateConfirmId(null)}
                                  disabled={isSubmitting}
                                  className="flex-1 px-2 py-1 border border-blue-200 text-gray-700 rounded text-xs font-medium hover:bg-blue-50 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleDeactivate(banner.id)}
                                  disabled={isSubmitting}
                                  className="flex-1 px-2 py-1 bg-yellow-600 text-white rounded text-xs font-medium hover:bg-yellow-700 disabled:bg-gray-400"
                                >
                                  {isSubmitting ? "..." : "Deactivate"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setDeleteConfirmId(
                              deleteConfirmId === banner.id ? null : banner.id
                            )
                          }
                          disabled={isSubmitting}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 disabled:opacity-50 transition"
                        >
                          Delete
                        </button>

                        {deleteConfirmId === banner.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-blue-200 rounded-lg shadow-lg p-3 z-10 w-48">
                            <p className="text-sm text-gray-700 mb-3">
                              Are you sure you want to permanently delete this banner?
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                disabled={isSubmitting}
                                className="flex-1 px-2 py-1 border border-blue-200 text-gray-700 rounded text-xs font-medium hover:bg-blue-50 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDelete(banner.id)}
                                disabled={isSubmitting}
                                className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:bg-gray-400"
                              >
                                {isSubmitting ? "..." : "Delete"}
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
      </div>

      {/* Banner Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-2xl">
            <BannerForm
              banner={selectedBanner}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowModal(false);
                setSelectedBanner(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
