import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getStaffById } from "../../config/api";

export default function StaffView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchStaff = async () => {
      try {
        const data = await getStaffById(id);
        if (mounted) {
          console.log("Fetched Data",data)
          setStaff(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchStaff();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading staff details...
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error || "Staff member not found"}</p>
        <button
          onClick={() => navigate("/admin/staff")}
          className="px-5 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
        >
          Back to Staff List
        </button>
      </div>
    );
  }

  const activity = staff.activity || {};

  return (
    <div className="bg-white border border-blue-200 rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-blue-200 bg-blue-50">
        <h2 className="text-lg font-semibold text-gray-800">Staff Details</h2>
        <p className="text-sm text-gray-500 mt-1">
          View staff information
        </p>
      </div>

      <div className="p-6">
        {/* Profile header */}
        <div className="flex items-start gap-5 pb-6 border-b">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-medium">
            {staff.name.charAt(0)}
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold">{staff.name}</h3>
            <p className="text-gray-600 mt-1">{staff.email}</p>

            <div className="mt-3 flex gap-3">
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {staff.role}
              </span>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  staff.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {staff.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="py-6 border-b border-blue-200">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Employee ID
              </label>
              <p className="mt-1 font-medium">
                {String(staff.id).padStart(3, "0")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email Address
              </label>
              <p className="mt-1 font-medium">{staff.email}</p>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        {Object.keys(activity).length > 0 && (
          <div className="py-6 border-b border-blue-200">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">Activity Summary</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-blue-200 rounded-lg p-4 text-center hover:bg-blue-50 transition">
                <p className="text-sm text-gray-500">Total Logins</p>
                <p className="text-2xl font-semibold">
                  {(activity.totalLogins || 0).toLocaleString()}
                </p>
              </div>

              <div className="border border-blue-200 rounded-lg p-4 text-center hover:bg-blue-50 transition">
                <p className="text-sm text-gray-500">Actions This Month</p>
                <p className="text-2xl font-semibold">
                  {(activity.actionsThisMonth || 0).toLocaleString()}
                </p>
              </div>

              <div className="border border-blue-200 rounded-lg p-4 text-center hover:bg-blue-50 transition">
                <p className="text-sm text-gray-500">Account Age (days)</p>
                <p className="text-2xl font-semibold">
                  {activity.accountAge || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-blue-200">
          <button
            onClick={() => navigate("/admin/staff")}
            className="px-4 py-2 border border-blue-200 rounded-lg text-sm hover:bg-blue-50 transition"
          >
            Back
          </button>
          <button
            onClick={() => navigate(`/admin/staff/${staff.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Edit Staff
          </button>
        </div>
      </div>
    </div>
  );
}
