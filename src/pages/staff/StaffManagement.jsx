import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStaff, activateStaff, deactivateStaff } from "../../config/api";
import StaffFormModal from "./StaffForm";
import StaffEditModal from "./StaffEdit";
import Notification from "../../components/Notification";

export default function StaffManagement() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "success" });

  useEffect(() => {
    let mounted = true;
    const fetchStaff = async () => {
      try {
        const data = await getAllStaff();
        if (mounted) {
          console.log("Fetched data", data);
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
  }, []);



  const handleStaffCreated = async () => {
    setShowModal(false);
    setNotification({ message: "Staff account created successfully!", type: "success" });
    // Refresh staff list
    try {
      const data = await getAllStaff();
      setStaff(data);
    } catch (err) {
      console.error("Failed to refresh staff list:", err);
    }
  };

  const handleEditStaff = (staffId) => {
    setEditingStaffId(staffId);
    setShowEditModal(true);
  };

  const handleStaffUpdated = async () => {
    setShowEditModal(false);
    setEditingStaffId(null);
    setNotification({ message: "Staff member updated successfully!", type: "success" });
    // Refresh staff list
    try {
      const data = await getAllStaff();
      setStaff(data);
    } catch (err) {
      console.error("Failed to refresh staff list:", err);
    }
  };

  const handleToggleStatus = async (memberId, isActive) => {
    try {
      if (isActive) {
        await deactivateStaff(memberId);
        setNotification({ message: "Staff member deactivated successfully!", type: "success" });
      } else {
        await activateStaff(memberId);
        setNotification({ message: "Staff member activated successfully!", type: "success" });
      }
      const data = await getAllStaff();
      setStaff(data);
    } catch (err) {
      setNotification({ message: err.message || "Failed to update status", type: "error" });
    }
  };

  if (loading) return <div className="p-6 text-center">Loading staff members...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div>
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ message: "", type: "success" })}
      />

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-md">
            <StaffFormModal onClose={() => setShowModal(false)} onSuccess={handleStaffCreated} onNotify={(msg, type) => setNotification({ message: msg, type })} />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingStaffId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-md">
            <StaffEditModal id={editingStaffId} onClose={() => { setShowEditModal(false); setEditingStaffId(null); }} onSuccess={handleStaffUpdated} onNotify={(msg, type) => setNotification({ message: msg, type })} />
          </div>
        </div>
      )}

      <div className="bg-white border border-blue-200 rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-blue-200 flex items-center justify-end sticky top-0 bg-blue-50">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
             Create Staff
          </button>
        </div>

        {/* Roles & Permissions */}
        <div className="p-5 border-b border-blue-200">
          <h3 className="font-medium mb-4 text-sm text-gray-700">Roles & Permissions</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Array.from(new Set(staff.map((s) => s.role))).map((role) => {
              const count = staff.filter((s) => s.role === role).length;
              return (
                <div
                  key={role}
                  className="flex items-center justify-between border border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{role}</p>
                      <p className="text-xs text-gray-500">{count} member{count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 border-y border-blue-200 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{member.name}</td>
                  <td className="px-4 py-3 text-gray-600">{member.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${
                        member.is_active
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {member.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/staff/${member.id}`)}
                        className="w-8 h-8 flex items-center justify-center border border-blue-200 rounded-lg text-gray-600 hover:bg-blue-50 transition"
                        title="View"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleEditStaff(member.id)}
                        className="w-8 h-8 flex items-center justify-center border border-blue-200 rounded-lg text-gray-600 hover:bg-blue-50 transition"
                        title="Edit"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 5h2M12 20h9"
                          />
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 5.487l1.65 1.65a2.121 2.121 0 010 3l-9.193 9.193-3.536.707.707-3.536 9.193-9.193a2.121 2.121 0 013 0z"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(member.id, member.is_active)}
                        className={`w-8 h-8 flex items-center justify-center border rounded-lg transition ${
                          member.is_active
                            ? "border-red-200 text-red-500 hover:bg-red-50"
                            : "border-green-200 text-green-600 hover:bg-green-50"
                        }`}
                        title={member.is_active ? "Deactivate" : "Activate"}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {member.is_active ? (
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          ) : (
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          )}
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-blue-200 bg-gray-50">
          <p className="text-xs text-gray-500">
            Total: {staff.length} staff member{staff.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}