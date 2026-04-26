import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCustomers, deactivateCustomer, activateCustomer } from "../../config/api";

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchUsers = async () => {
      try {
        const data = await getAllCustomers();
        if (mounted) {
          setUsers(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchUsers();
    return () => (mounted = false);
  }, []);

  const handleToggleStatus = async (userId, isActive) => {
    try {
      if (isActive) {
        await deactivateCustomer(userId);
      } else {
        await activateCustomer(userId);
      }
      const data = await getAllCustomers();
      setUsers(data);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading users...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="bg-white border border-blue-200 rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-blue-200">
          <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage user accounts and permissions</p>
        </div>

        {/* Filters */}
        <div className="p-5 border-b border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <input
                placeholder="Name, email..."
                className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option>Select Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Last Active
              </label>
              <select className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option>Select time range</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Registration Date
              </label>
              <select className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option>Select date range</option>
              </select>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 border-y border-blue-200 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Registration Date</th>
                <th className="px-4 py-3 text-left">Last Updated</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const isActive = user.is_active === true;
                const registrationDate = new Date(user.created_at).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "short", day: "numeric" }
                );
                const lastUpdateDate = new Date(user.updated_at).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "short", day: "numeric" }
                );

                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{user.full_name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-gray-600">{registrationDate}</td>
                    <td className="px-4 py-3 text-gray-600">{lastUpdateDate}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${
                          isActive
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/users/${user.id}`)}
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
                          onClick={() => navigate(`/admin/users/${user.id}/edit`)}
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
                          onClick={() => handleToggleStatus(user.id, isActive)}
                          className={`w-8 h-8 flex items-center justify-center border rounded-lg transition ${
                            isActive
                              ? "border-red-200 text-red-500 hover:bg-red-50"
                              : "border-green-200 text-green-600 hover:bg-green-50"
                          }`}
                          title={isActive ? "Deactivate" : "Activate"}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {isActive ? (
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
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-blue-200 bg-gray-50">
          <p className="text-xs text-gray-500">
            Showing {users.length} of {users.length} users
          </p>
        </div>
      </div>
    </div>
  );
}