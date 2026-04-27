import { useEffect, useState } from "react";
import {
  getCustomerById,
  updateCustomer,
  deactivateCustomer,
  activateCustomer,
} from "../../config/api";
import Notification from "../../components/Notification";

export default function UserEditModal({ id, onClose, onSuccess, onNotify = () => {} }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "success" });

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const data = await getCustomerById(id);
        if (mounted) {
          setUser(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError("User not found: " + err.message);
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updates = {
        full_name: user.full_name,
        phone: user.phone,
      };
      await updateCustomer(id, updates);
      setError(null);
      onSuccess();
    } catch (err) {
      const errorMsg = "Failed to update customer: " + (err.message || "Unknown error");
      setError(errorMsg);
      setNotification({ message: errorMsg, type: "error" });
      onNotify(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    setSaving(true);
    setError(null);

    try {
      const isCurrentlyActive = user.is_active;
      
      if (isCurrentlyActive) {
        await deactivateCustomer(id);
      } else {
        await activateCustomer(id);
      }
      // Refresh user data
      const data = await getCustomerById(id);
      setUser(data);
      setNotification({ message: isCurrentlyActive ? "Customer deactivated successfully" : "Customer activated successfully", type: "success" });
      onNotify(isCurrentlyActive ? "Customer deactivated successfully" : "Customer activated successfully", "success");
    } catch (err) {
      const errorMsg = "Failed to update status: " + (err.message || "Unknown error");
      setError(errorMsg);
      setNotification({ message: errorMsg, type: "error" });
      onNotify(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error && !user)
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  if (!user) return <div className="p-6 text-center">User not found</div>;

  return (
    <>
      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ message: "", type: "success" })}
      />
      {/* Header */}
        <div className="p-5 border-b border-blue-200 bg-blue-50 flex items-center justify-between sticky top-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Edit Customer</h2>
            <p className="text-sm text-gray-500 mt-1">Update customer information</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    name="full_name"
                    value={user.full_name || ""}
                    onChange={(e) =>
                      setUser({ ...user, full_name: e.target.value })
                    }
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full bg-blue-50 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={user.phone || ""}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Status
                  </label>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleStatus}
                      disabled={saving}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                        user.is_active
                          ? "border border-red-200 text-red-700 hover:bg-red-50"
                          : "border border-green-200 text-green-700 hover:bg-green-50"
                      } disabled:opacity-60`}
                    >
                      {saving
                        ? "Updating..."
                        : user.is_active
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Verified
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.is_email_verified
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.is_email_verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-blue-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 font-medium"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
    </>
  );
}
