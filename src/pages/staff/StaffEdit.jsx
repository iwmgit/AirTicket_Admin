import { useEffect, useState } from "react";
import { getStaffById, updateStaff, activateStaff, deactivateStaff } from "../../config/api";
import Notification from "../../components/Notification";

export default function StaffEditModal({ id, onClose, onSuccess, onNotify = () => {} }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "success" });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staff = await getStaffById(id);
        setForm(staff);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load staff member");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      setError("Name and email are required");
      return;
    }

    setSaving(true);
    try {
      await updateStaff(id, {
        name: form.name,
        email: form.email,
        role: form.role,
      });
      setError("");
      onSuccess();
    } catch (err) {
      const errorMsg = err.message || "Failed to update staff member";
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
      const isCurrentlyActive = form.is_active;
      
      if (isCurrentlyActive) {
        await deactivateStaff(id);
      } else {
        await activateStaff(id);
      }
      
      // Refresh staff data
      const data = await getStaffById(id);
      setForm(data);
      setNotification({ message: isCurrentlyActive ? "Staff member deactivated successfully" : "Staff member activated successfully", type: "success" });
      onNotify(isCurrentlyActive ? "Staff member deactivated successfully" : "Staff member activated successfully", "success");
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
  if (error && !form) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!form) return <div className="p-6">Staff member not found</div>;

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
          <h2 className="text-lg font-semibold text-gray-800">Edit Staff Member</h2>
          <p className="text-sm text-gray-500 mt-1">Update staff information</p>
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

        <h3 className="font-medium text-gray-800">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-3 py-2 mt-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input
              name="email"
              type="email"
              value={form.email || ""}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-3 py-2 mt-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <input
              name="role"
              value={form.role || ""}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-3 py-2 mt-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  form.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {form.is_active ? "Active" : "Inactive"}
              </span>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={saving}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  form.is_active
                    ? "border border-red-200 text-red-700 hover:bg-red-50"
                    : "border border-green-200 text-green-700 hover:bg-green-50"
                } disabled:opacity-60`}
              >
                {saving
                  ? "Updating..."
                  : form.is_active
                    ? "Deactivate"
                    : "Activate"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-3 items-center justify-end px-6 py-4 border-t border-blue-200">
        <button
          onClick={onClose}
          disabled={saving}
          className="px-5 py-2 border border-gray-300 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition disabled:opacity-50 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50 font-medium"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </>
  );
}
