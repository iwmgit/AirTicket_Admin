import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {  getAllStaff, activateStaff, deactivateStaff } from "../../config/api";

export default function StaffManagement() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchStaff = async () => {
      try {
        const data = await getAllStaff();
        if (mounted) {
          console.log("Fetched data",data)
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

  const handleToggleStatus = async (memberId, isActive) => {
    try {
      if (isActive) {
        await deactivateStaff(memberId);
      } else {
        await activateStaff(memberId);
      }
      // Refresh the list
      const data = await getAllStaff();
      setStaff(data);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading staff members...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Manage staff members, roles, and permissions
          </p>
        </div>
      </div>

      {/* Roles & Permissions */}
      <div className="border rounded bg-white p-4 mb-6">
        <h3 className="font-medium mb-3 text-sm">Roles & Permissions</h3>

        <div className="space-y-3">
          {Array.from(
            new Set(staff.map((s) => s.role))
          ).map((role) => {
            const count = staff.filter((s) => s.role === role).length;
            return (
              <div
                key={role}
                className="flex items-center justify-between border rounded p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border rounded"></div>
                  <div>
                    <p className="text-sm font-medium">{role}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">{count}</p>
                  <p className="text-xs text-gray-500">members</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">All Staff Members</h3>
              <p className="text-sm text-gray-500">
                Total: {staff.length} members
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-max">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left w-10">
                </th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="p-4">
                  </td>
                  <td className="p-4 font-medium">{member.name}</td>
                  <td className="p-4 text-gray-600">{member.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100">
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`border rounded px-2 py-0.5 text-xs font-medium ${
                        member.is_active
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {member.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/staff/${member.id}`)}
                      className="border px-2 py-1 rounded text-xs hover:bg-gray-100"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/admin/staff/${member.id}/edit`)}
                      className="border px-2 py-1 rounded text-xs hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(member.id, member.is_active)}
                      className={`border px-2 py-1 rounded text-xs ${
                        member.is_active
                          ? "text-red-500 hover:bg-red-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title={member.is_active ? "Deactivate" : "Activate"}
                    >
                      {member.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
