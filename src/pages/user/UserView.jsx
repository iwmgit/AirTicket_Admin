// pages/user/UserView.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCustomerById } from "../../config/api";

export default function UserView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading)
    return <div className="p-6 text-center">Loading user details...</div>;
  if (error)
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  if (!user) return <div className="p-6 text-center">User not found</div>;

  return (
    <div className="p-4">
      <div className="bg-white border border-blue-200 rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-blue-200 bg-blue-50">
          <h2 className="text-lg font-semibold text-gray-800">Customer Details</h2>
          <p className="text-sm text-gray-500 mt-1">
            View customer information and booking history
          </p>
        </div>

        <div className="p-6">
          {/* Profile */}
          <div className="flex items-start gap-5 pb-6 border-b border-blue-200">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-medium">
              {user.full_name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{user.full_name}</h3>
              <p className="text-gray-600 mt-1">{user.email}</p>

              <div className="mt-3 flex gap-3">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    user.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </span>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user.is_email_verified ? "Email Verified" : "Unverified"}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="py-6 border-b border-blue-200">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Customer ID</label>
                <p className="mt-1 font-medium">{user.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <p className="mt-1 font-medium">{user.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email Address</label>
                <p className="mt-1 font-medium">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                <p className="mt-1 font-medium">{user.phone || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email Verified</label>
                <p className="mt-1 font-medium">
                  {user.is_email_verified ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Registration Date</label>
                <p className="mt-1 font-medium">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-blue-200">
            <button
              onClick={() => navigate("/admin/users")}
              className="px-4 py-2 border border-blue-200 rounded-lg text-sm hover:bg-blue-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
