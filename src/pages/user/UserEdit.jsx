// pages/user/UserEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getCustomerById,
  updateCustomer,
  deactivateCustomer,
  activateCustomer,
} from "../../config/api";

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
      alert("Customer updated successfully");
      navigate("/admin/users");
    } catch (err) {
      setError("Failed to update customer: " + (err.message || "Unknown error"));
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
      alert(
        isCurrentlyActive
          ? "Customer deactivated successfully"
          : "Customer activated successfully"
      );
    } catch (err) {
      setError(
        "Failed to update status: " + (err.message || "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error && !user)
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  if (!user) return <div className="p-6 text-center">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
      <h1 className="text-2xl font-bold mb-8">Edit Customer — {user.full_name}</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                name="full_name"
                value={user.full_name || ""}
                onChange={(e) =>
                  setUser({ ...user, full_name: e.target.value })
                }
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={user.email}
                disabled
                className="border rounded px-3 py-2 w-full bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                name="phone"
                value={user.phone || ""}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
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
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    user.is_active
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
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
              <label className="block text-sm font-medium mb-1">
                Email Verified
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded text-xs font-medium ${
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
        <div className="flex justify-end gap-4 mt-12 pt-8 border-t">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="px-6 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
