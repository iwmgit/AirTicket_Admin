import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStaffById, updateStaff, activateStaff, deactivateStaff } from "../../config/api";

export default function StaffEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
      alert("Staff member updated successfully");
      navigate("/admin/staff");
    } catch (err) {
      setError(err.message || "Failed to update staff member");
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
      alert(
        isCurrentlyActive
          ? "Staff member deactivated successfully"
          : "Staff member activated successfully"
      );
    } catch (err) {
      setError(
        "Failed to update status: " + (err.message || "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error && !form) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!form) return <div className="p-6">Staff member not found</div>;

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold">Edit Staff Member</h2>
        <p className="text-sm text-gray-500 mt-1">Update staff information</p>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <h3 className="font-medium">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email Address</label>
            <input
              name="email"
              type="email"
              value={form.email || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Role</label>
            <input
              name="role"
              value={form.role || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Status</label>
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
                className={`px-3 py-1 rounded text-xs font-medium ${
                  form.is_active
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
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
      <div className="flex items-center justify-end px-6 py-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-5 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
