import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllFlightOverrides,
  disableFlightOverride,
} from "../../config/api";

export default function FlightOverride() {
  const navigate = useNavigate();
  const [overrideFlights, setOverrideFlights] = useState([]);
  const [loadingOverrides, setLoadingOverrides] = useState(false);

  const fetchOverrides = async () => {
    setLoadingOverrides(true);
    try {
      const overrides = await getAllFlightOverrides();
      setOverrideFlights(overrides);
    } catch (err) {
      console.error("Failed to fetch overrides:", err);
    } finally {
      setLoadingOverrides(false);
    }
  };

  useEffect(() => {
    fetchOverrides();
  }, []);

  const handleDisableOverride = async (overrideId) => {
    if (window.confirm("Are you sure you want to disable this override?")) {
      try {
        await disableFlightOverride(overrideId);
        setOverrideFlights(prev =>
          prev.map(o => (o.id === overrideId ? { ...o, is_active: false } : o))
        );
        alert("✓ Override disabled successfully");
      } catch (err) {
        alert("❌ Failed to disable override: " + err.message);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="bg-white border border-blue-200 rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Flight Overrides</h2>
              <p className="text-sm text-gray-600 mt-1">Manage price overrides for flights</p>
            </div>
            <button
              onClick={() => navigate("/admin/flights")}
              className="border border-blue-200 px-4 py-2 text-sm rounded-lg font-medium text-gray-700 hover:bg-blue-50 transition"
            >
              Back to Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div>
          <div className="px-5 py-3 border-b border-blue-200">
            <h3 className="font-semibold text-gray-800">All Overrides</h3>
            <p className="text-xs text-gray-500 mt-1">
              {overrideFlights.length > 0
                ? `Showing ${overrideFlights.length} override${overrideFlights.length !== 1 ? "s" : ""}`
                : "No overrides created yet"}
            </p>
          </div>

          {loadingOverrides ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : overrideFlights.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No override flights yet.</p>
              <button
                onClick={() => navigate("/admin/flights")}
                className="mt-3 text-blue-600 hover:underline text-sm font-medium"
              >
                Create one from search results
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 border-y border-blue-200 text-gray-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Airline Code</th>
                    <th className="px-4 py-3 text-left">Flight No.</th>
                    <th className="px-4 py-3 text-left">Departure Date</th>
                    <th className="px-4 py-3 text-left">Override Price (USD)</th>
                    <th className="px-4 py-3 text-left">Expires At</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {overrideFlights.map((override) => (
                    <tr key={override.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{override.airline_code}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{override.flight_number}</td>
                      <td className="px-4 py-3 text-gray-600">{override.departure_date}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">${override.override_price_usd}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(override.expires_at).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${
                          override.is_active
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}>
                          {override.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDisableOverride(override.id)}
                            className="border border-red-200 px-3 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition"
                          >
                            Disable
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}