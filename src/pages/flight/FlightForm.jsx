import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { createFlightOverride, getPricingConfig } from "../../config/api";
import Notification from "../../components/Notification";

// Convert minutes to hours (supports decimal values)
const convertMinutesToHours = (minutes) => {
  const numMinutes = parseFloat(minutes);
  if (isNaN(numMinutes) || numMinutes <= 0) return 1; // Default to 1 hour
  return numMinutes / 60;
};

export default function FlightForm() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const mode = location.state?.mode; // "create" or "update"
  const flightData = location.state?.flightData;
  const overrideData = location.state?.overrideData;
  const overrideId = location.state?.overrideId;
  
  // Extract flight_snapshot for display
  const snapshot = flightData?.flight_snapshot || {};
  
  const [formData, setFormData] = useState({
    ...flightData,
    overridePrice: overrideData?.base_price_usd || flightData?.flight_snapshot?.base_price_usd || "",
    durationHours: 1,
    currency: "USD",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMarkup, setCurrentMarkup] = useState(null);
  const [markupLoading, setMarkupLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "success" });

  // Fetch pricing config on mount
  useEffect(() => {
    const fetchPricingConfig = async () => {
      try {
        const pricingData = await getPricingConfig();
        setCurrentMarkup(pricingData?.global_markup_percentage || 0);
      } catch (err) {
        console.error("Failed to fetch pricing config:", err);
      } finally {
        setMarkupLoading(false);
      }
    };
    fetchPricingConfig();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle text input that only accepts numbers and decimals
  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    // Allow only numbers and one decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...flightData,
        base_price_usd: parseFloat(formData.overridePrice),
        currency: formData.currency,
      };

      if (mode === "update") {
        setError("Flight overrides can no longer be updated. Please delete and create a new one.");
        setNotification({ message: "Flight overrides can no longer be updated. Please delete and create a new one.", type: "error" });
        setTimeout(() => navigate("/admin/flights"), 2000);
      } else {
        const durationHours = convertMinutesToHours(formData.durationHours);
        await createFlightOverride(submitData, durationHours);
        setNotification({ message: "Flight override created successfully!", type: "success" });
        setTimeout(() => navigate("/admin/flights"), 2000);
      }
    } catch (err) {
      setError(err.message);
      setNotification({ message: err.message || "Failed to create flight override", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = mode === "update" ? "Update Override" : "Create Override";

  return (
    <div className="p-4">
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ message: "", type: "success" })}
      />

      <div className="bg-white border border-blue-200 rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === "update" ? "Edit Override Flight" : "Create Flight Override"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {mode === "update" ? "Modify the override price" : "Review flight details and set override price"}
          </p>
        </div>

        <div className="p-5 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
               {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Flight Details - Read Only */}
            <div className="border border-blue-200 rounded-lg p-5 bg-blue-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-4"> Flight Details</h3>
              
              {flightData?.type === "ROUND_TRIP" ? (
                // ROUND TRIP DISPLAY
                <div className="space-y-6">
                  {/* Outbound Leg */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Outbound Flight</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Airline</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {snapshot?.outbound?.airline || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Airline Code</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {snapshot?.outbound?.airline_code || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Flight Number</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {snapshot?.outbound?.flight_number || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Route</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {snapshot?.outbound?.route || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Departure</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {snapshot?.outbound?.departure_time
                            ? new Date(snapshot.outbound.departure_time).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Arrival</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {snapshot?.outbound?.arrival_time
                            ? new Date(snapshot.outbound.arrival_time).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Duration</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {snapshot?.outbound?.duration_minutes
                            ? `${Math.floor(snapshot.outbound.duration_minutes / 60)}h ${snapshot.outbound.duration_minutes % 60}m`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Inbound Leg */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Return Flight</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Airline</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {snapshot?.inbound?.airline || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Airline Code</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {snapshot?.inbound?.airline_code || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Flight Number</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {snapshot?.inbound?.flight_number || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Route</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {snapshot?.inbound?.route || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Departure</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {snapshot?.inbound?.departure_time
                            ? new Date(snapshot.inbound.departure_time).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Arrival</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {snapshot?.inbound?.arrival_time
                            ? new Date(snapshot.inbound.arrival_time).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Duration</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {snapshot?.inbound?.duration_minutes
                            ? `${Math.floor(snapshot.inbound.duration_minutes / 60)}h ${snapshot.inbound.duration_minutes % 60}m`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shared Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-200">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Type</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">ROUND TRIP</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Passengers (Adults)</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {flightData?.adults || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Base Price</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        ${snapshot?.base_price_usd || "0"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // ONE-WAY DISPLAY
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Type</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {flightData?.type || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Passengers (Adults)</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {flightData?.adults || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Airline</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {snapshot?.airline || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Airline Code</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {snapshot?.airline_code || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Flight Number</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {snapshot?.flight_number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Route</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {snapshot?.route || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Departure</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {snapshot?.departure_time
                        ? new Date(snapshot.departure_time).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Arrival</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {snapshot?.arrival_time
                        ? new Date(snapshot.arrival_time).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Duration</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {snapshot?.duration_minutes
                        ? `${Math.floor(snapshot.duration_minutes / 60)}h ${snapshot.duration_minutes % 60}m`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Base Price</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      ${snapshot?.base_price_usd || "0"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Final Price</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      ${snapshot?.final_price_usd || "0"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Estimated Price(MMK)</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {snapshot?.price_estimate_min_mmk || "0"} MMK - {snapshot?.price_estimate_max_mmk || "0"} MMK
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Estimated Price Max (USD)</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      ${snapshot?.price_estimate_max_usd || "0"} - ${snapshot?.price_estimate_max_usd || "0"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Price Management - Editable */}
            <div className="border border-blue-200 rounded-lg p-5 bg-white">
              <h3 className="text-sm font-semibold text-gray-800 mb-4"> Price Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Original Base Price - Read Only */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Original Base Price
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      $
                    </span>
                    <input
                      type="text"
                      value={snapshot?.base_price_usd || "0"}
                      disabled
                      className="w-full px-4 py-2 pl-7 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 text-sm"
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">From search result</p>
                </div>

                {/* Override Price - Editable */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Override Price <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="overridePrice"
                      value={formData.overridePrice}
                      onChange={handleNumericInput}
                      required
                      className="w-full px-4 py-2 pl-7 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                      placeholder="Enter new price"
                    />
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Numbers only</p>
                </div>

                {/* Final Price - Read Only (Backend Calculated) */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Final Price
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      $
                    </span>
                    <input
                      type="text"
                      value={formData.finalPrice || formData.overridePrice || "0"}
                      disabled
                      className="w-full px-4 py-2 pl-7 border border-green-300 rounded-lg bg-green-50 text-green-700 font-semibold text-sm"
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Backend calculated</p>
                </div>

                {/* Current Markup % */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Global Markup %
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      %
                    </span>
                    <input
                      type="text"
                      value={markupLoading ? "Loading..." : currentMarkup || "0"}
                      disabled
                      className="w-full px-4 py-2 pr-7 border border-gray-300 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm"
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">System config</p>
                </div>
              </div>

              {/* Duration Hours - Editable (only for create mode) */}
              {mode === "create" && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Override Duration (Minutes) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    name="durationHours"
                    value={formData.durationHours}
                    onChange={handleNumericInput}
                    required
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    placeholder="e.g., 30, 60, 90.5"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {formData.durationHours 
                      ? `${convertMinutesToHours(formData.durationHours).toFixed(2)} hours` 
                      : "Enter minutes"}
                  </p>
                </div>
              )}

              {/* Price & Duration Info */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 space-y-2">
                {snapshot?.base_price_usd && formData.overridePrice ? (
                  <>
                    {parseFloat(formData.overridePrice) > snapshot.base_price_usd ? (
                      <p> Price will increase by ${(parseFloat(formData.overridePrice) - snapshot.base_price_usd).toFixed(2)}</p>
                    ) : parseFloat(formData.overridePrice) < snapshot.base_price_usd ? (
                      <p> Price will decrease by ${(snapshot.base_price_usd - parseFloat(formData.overridePrice)).toFixed(2)}</p>
                    ) : (
                      <p> Price unchanged</p>
                    )}
                  </>
                ) : null}
                {mode === "create" && formData.durationHours && (
                  <p> Override will be active for <span className="font-semibold">{formData.durationHours} minutes ({convertMinutesToHours(formData.durationHours).toFixed(2)} hours)</span>. After this period, the price will revert to the normal search price.</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/flights")}
                className="border border-blue-200 px-6 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? `${buttonLabel}...` : buttonLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}