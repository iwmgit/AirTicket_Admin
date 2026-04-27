import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Notification from "../../components/Notification";


export default function FlightEdit() {
  const { overrideId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [override, setOverride] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "success" });

  useEffect(() => {
    let mounted = true;

    const initializeOverride = () => {
      try {
        if (location.state?.overrideData) {
          setOverride(location.state.overrideData);
          setLoading(false);
          return;
        }

        if (overrideId) {
          fetchOverride();
          return;
        }

        throw new Error("No override data found");
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    const fetchOverride = async () => {
      try {
        const data = await getFlightOverrideById(overrideId);
        if (mounted) {
          setOverride(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeOverride();

    return () => {
      mounted = false;
    };
  }, [overrideId, location]);

  const handleInputChange = (field, value) => {
    setOverride((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Pass the override object directly - it already has all needed fields
      await updateFlightOverride(overrideId, override);
      setNotification({ message: "Flight override updated successfully!", type: "success" });
      setTimeout(() => navigate("/admin/overrides"), 2000);
    } catch (err) {
      const errorMsg = "Failed to update flight override: " + err.message;
      setError(errorMsg);
      setNotification({ message: errorMsg, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  if (!override) return <div className="p-6 text-center">Override not found</div>;

  const snapshot = override?.flight_snapshot || {};
  console.log("Editing Override:", override); // Debug log
  console.log("Flight Snapshot:", snapshot); // Debug log

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg p-8 border">
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ message: "", type: "success" })}
      />

      <h2 className="text-2xl font-bold text-gray-800 mb-2">Edit Flight Override</h2>
      <p className="text-gray-600 mb-8">Override ID: {overrideId}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Flight Details - Read Only */}
        <div className="border rounded-md p-5 bg-gray-50">
          <h3 className="text-sm font-semibold mb-4">Flight Details</h3>
          
          {override?.type === "ROUND_TRIP" ? (
            // ROUND TRIP DISPLAY
            <div className="space-y-6">
              {/* Outbound Leg */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Outbound Flight</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Airline</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.outbound?.airline || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Airline Code</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.outbound?.airline_code || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Flight Number</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.outbound?.flight_number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Route</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.outbound?.route || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Departure</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.outbound?.departure_time
                        ? new Date(snapshot.outbound.departure_time).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Arrival</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.outbound?.arrival_time
                        ? new Date(snapshot.outbound.arrival_time).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Duration</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.outbound?.duration_minutes
                        ? `${Math.floor(snapshot.outbound.duration_minutes / 60)}h ${snapshot.outbound.duration_minutes % 60}m`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Inbound Leg */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Return Flight</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Airline</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.inbound?.airline || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Airline Code</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.inbound?.airline_code || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Flight Number</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.inbound?.flight_number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Route</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.inbound?.route || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Departure</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.inbound?.departure_time
                        ? new Date(snapshot.inbound.departure_time).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Arrival</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.inbound?.arrival_time
                        ? new Date(snapshot.inbound.arrival_time).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Duration</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.inbound?.duration_minutes
                        ? `${Math.floor(snapshot.inbound.duration_minutes / 60)}h ${snapshot.inbound.duration_minutes % 60}m`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shared Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-xs text-gray-600 font-medium">Type</label>
                  <p className="text-lg font-medium text-gray-800 mt-1">ROUND TRIP</p>
                </div>
              </div>
            </div>
          ) : (
            // ONE-WAY DISPLAY
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-600 font-medium">Type</label>
                <p className="text-lg font-medium text-gray-800 mt-1">ONE-WAY</p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Airline</label>
                <p className="text-lg font-medium text-gray-800 mt-1">
                  {snapshot?.airline || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Airline Code</label>
                <p className="text-lg font-medium text-gray-800 mt-1">
                  {override?.airline_code || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Flight Number</label>
                <p className="text-lg font-medium text-gray-800 mt-1">
                  {override?.flight_number || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Route</label>
                <p className="text-lg font-medium text-gray-800 mt-1">
                  {override?.route || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Departure</label>
                <p className="text-lg font-medium text-gray-800 mt-1">
                  {override?.departure_time
                    ? new Date(override.departure_time).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Arrival</label>
                <p className="text-lg font-medium text-gray-800 mt-1">
                  {override?.arrival_time
                    ? new Date(override.arrival_time).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Duration</label>
                <p className="text-lg font-medium text-gray-800 mt-1">
                  {override?.duration_minutes
                    ? `${Math.floor(override.duration_minutes / 60)}h ${override.duration_minutes % 60}m`
                    : "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Price Management - Editable */}
        <div className="border rounded-md p-5">
          <h3 className="text-sm font-semibold mb-4">Price Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Current Override Price - Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Override Price
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  value={parseFloat(override.override_price_usd).toFixed(2)}
                  disabled
                  className="w-full px-4 py-2 pl-7 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Current price</p>
            </div>

            {/* New Override Price - Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Override Price <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={override.override_price_usd}
                  onChange={(e) => handleInputChange("override_price_usd", e.target.value)}
                  required
                  className="w-full px-4 py-2 pl-7 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new override price"
                />
              </div>
              <p className="text-xs text-blue-600 mt-1">Updated price</p>
            </div>
          </div>

          {/* Price Comparison Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-black-200 rounded text-sm text-blue-700">
            <p>Update the override price above and save changes</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/overrides")}
            className="border px-6 py-2 rounded-md text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-6 py-2 rounded-md text-sm disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Override"}
          </button>
        </div>
      </form>
    </div>
  );
}
