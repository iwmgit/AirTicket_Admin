import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function FlightView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.flightData) {
      setFlight(location.state.flightData);
      setLoading(false);
    } else {
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
    <div className="p-4 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">    
        {/* ================= Header ================= */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Flight Details 
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Complete flight information and schedule
          </p>
        </div>

        {/* ================= Body ================= */}
        <div className="p-6">
          {/* Airline + Status */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {snapshot?.airline || "N/A"}
              </h1>
              <p className="text-gray-500 mt-2">
                Flight {snapshot?.flight_number || "N/A"} •{" "}
                {snapshot?.route || "N/A"}
              </p>
            </div>
          </div>

          {/* ================= Route Section ================= */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Route & Schedule
            </h3>

            <div className="border rounded-2xl shadow-sm p-8">
              <div className="flex items-center justify-between">
                
                {/* ===== Departure ===== */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Departure</p>
                  <h2 className="text-4xl font-bold text-blue-500">
                    {snapshot?.origin || "N/A"}
                  </h2>
                  <p className="text-gray-700 mt-2">
                    {snapshot?.departure_time
                      ? formatDate(snapshot.departure_time)
                      : "N/A"}
                  </p>
                </div>

                {/* ===== Middle Line ===== */}
                <div className="flex-1 px-10 text-center">
                  <div className="flex items-center justify-center gap-3 text-gray-400">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>

                    <div className="h-[2px] bg-gray-300 flex-1 relative">
                      <span className="absolute left-1/2 -translate-x-1/2 -top-3 text-xl">
                        ✈
                      </span>
                    </div>

                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  </div>

                  <p className="text-sm text-gray-500 mt-3">
                    {snapshot?.duration_minutes
                      ? formatDuration(snapshot.duration_minutes)
                      : "N/A"}
                  </p>
                </div>

                {/* ===== Arrival ===== */}
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-2">Arrival</p>
                  <h2 className="text-4xl font-bold text-blue-500">
                    {snapshot?.destination || "N/A"}
                  </h2>
                  <p className="text-gray-700 mt-2">
                    {snapshot?.arrival_time
                      ? formatDate(snapshot.arrival_time)
                      : "N/A"}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* ================= Pricing ================= */}
          <div className="mt-6 border rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Pricing Information
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500">
                  Base Price (USD)
                </label>
                <p className="text-sm font-medium mt-1">
                  ${snapshot?.base_price_usd?.toFixed(2) || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-500">
                  Final Price (USD)
                </label>
                <p className="text-sm font-medium mt-1">
                  ${flight.final_price_usd?.toFixed(2) || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-500">
                  Final Price (MMK)
                </label>
                <p className="text-sm font-medium mt-1">
                  MMK {flight.final_price_mmk?.toLocaleString() || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Footer ================= */}
        <div className="p-5 border-t bg-gray-50 flex justify-end">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}