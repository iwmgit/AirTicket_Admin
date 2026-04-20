import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function FlightView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get flight data from navigation state
    if (location.state?.flightData) {
      setFlight(location.state.flightData);
      setLoading(false);
    } else {
      // Fallback: redirect back if no flight data provided
      setLoading(false);
      navigate("/admin/flights");
    }
  }, [location.state, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  if (loading) {
    return <div className="p-6 text-center">Loading flight details...</div>;
  }

  if (!flight) {
    return <div className="p-6 text-center">Flight not found</div>;
  }

  const snapshot = flight?.flight_snapshot || {};
  const isRoundTrip = flight.type === "ROUND_TRIP";

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold">Flight Details</h2>
        <p className="text-sm text-gray-500 mt-1">View flight information</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Flight Details - Read Only */}
        <div className="border rounded-md p-5 bg-gray-50">
          <h3 className="text-sm font-semibold mb-4">Flight Details</h3>
          
          {isRoundTrip ? (
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
                        ? formatDate(snapshot.outbound.departure_time)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Arrival</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.outbound?.arrival_time
                        ? formatDate(snapshot.outbound.arrival_time)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Duration</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.outbound?.duration_minutes
                        ? formatDuration(snapshot.outbound.duration_minutes)
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
                        ? formatDate(snapshot.inbound.departure_time)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Arrival</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.inbound?.arrival_time
                        ? formatDate(snapshot.inbound.arrival_time)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Duration</label>
                    <p className="text-lg font-medium text-gray-800 mt-1">
                      {snapshot?.inbound?.duration_minutes
                        ? formatDuration(snapshot.inbound.duration_minutes)
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
                <div>
                  <label className="text-xs text-gray-600 font-medium">Number of Adults</label>
                  <p className="text-lg font-medium text-gray-800 mt-1">{flight.adults || "N/A"}</p>
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
                  {snapshot?.airline_code || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Flight Number</label>
                <p className="text-lg font-medium text-gray-800 mt-1">
                  {snapshot?.flight_number || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Route</label>
                <p className="text-lg font-medium text-gray-800 mt-1">
                  {snapshot?.route || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Departure</label>
                <p className="text-lg font-medium text-gray-800 mt-1">
                  {snapshot?.departure_time ? formatDate(snapshot.departure_time) : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Arrival</label>
                <p className="text-lg font-medium text-gray-800 mt-1">
                  {snapshot?.arrival_time ? formatDate(snapshot.arrival_time) : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Duration</label>
                <p className="text-lg font-medium text-gray-800 mt-1">
                  {snapshot?.duration_minutes ? formatDuration(snapshot.duration_minutes) : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Number of Adults</label>
                <p className="text-lg font-medium text-gray-800 mt-1">{flight.adults || "N/A"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Information */}
        <div className="border rounded-md p-5">
          <h3 className="text-sm font-semibold mb-4">Pricing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-600 font-medium">Base Price (USD)</label>
              <p className="text-lg font-medium text-gray-800 mt-1">
                ${snapshot?.base_price_usd?.toFixed(2) || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium">Final Price (USD)</label>
              <p className="text-lg font-medium text-gray-800 mt-1">
                ${flight.final_price_usd?.toFixed(2) || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium">Final Price (MMK)</label>
              <p className="text-lg font-medium text-gray-800 mt-1">
                MMK {flight.final_price_mmk?.toLocaleString() || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
        <button
          onClick={() => navigate("/admin/flights")}
          className="px-4 py-2 border rounded text-sm hover:bg-gray-100"
        >
          Back to Flights
        </button>
      </div>
    </div>
  );
}
