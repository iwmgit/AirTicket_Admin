 import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  searchFlights,
  searchRoundTripFlights,
  getExchangeRate,
  updateExchangeRate,
  getPricingConfig,    
  updatePricingConfig 
} from "../../config/api";

export default function FlightManagement() {
  const navigate = useNavigate();
  const { hasRole } = useAuth(); 
  const isAdmin = hasRole("ADMIN") || hasRole("SUPER_ADMIN");  // Check if admin

  // Modal State
  const [openCurrencyModal, setOpenCurrencyModal] = useState(false);
  const [usdToMmkRate, setUsdToMmkRate] = useState("");
  const [currentRate, setCurrentRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [openPricingModal, setOpenPricingModal] = useState(false);
  const [globalMarkup, setGlobalMarkup] = useState("");
  const [currentMarkup, setCurrentMarkup] = useState(null);
  const [pricingUpdatedAt, setPricingUpdatedAt] = useState(null);

  // Search State
  const [tripType, setTripType] = useState("oneWay");
  const [searchParams, setSearchParams] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    returnDate: "",
  });

  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const rateData = await getExchangeRate();
        setCurrentRate(rateData?.usd_to_mmk || 0);
        setLastUpdated(rateData?.created_at);
        setUsdToMmkRate(String(rateData?.usd_to_mmk || ""));
      } catch (err) {
        console.error("Failed to fetch exchange rate:", err);
      }
    };
    fetchRate();

    const fetchPricingConfig = async () => {
      try {
        const pricingData = await getPricingConfig();
        setCurrentMarkup(pricingData?.global_markup_percentage || 0);
        setPricingUpdatedAt(pricingData?.updated_at);
        setGlobalMarkup(String(pricingData?.global_markup_percentage || ""));
      } catch (err) {
        console.error("Failed to fetch pricing config:", err);
      }
    };
    fetchPricingConfig();
  }, []);

  // Helpers
  const transformFlightData = (flights) => {
    console.log("Raw API Response:", flights);

    return flights.map((f) => {
      // Check if it's a round-trip (has both outbound and inbound)
      if (f.outbound && f.inbound) {
        return {
          type: "ROUND_TRIP",
          adults: f.adults,
          bundle_key: f.bundle_key,
          flight_snapshot: {
            bundle_key: f.bundle_key,
            adults: f.adults,

            outbound: {
              airline: f.outbound.airline,
              airline_code: f.outbound.airline_code,
              flight_number: f.outbound.flight_number,
              origin: f.outbound.origin,
              destination: f.outbound.destination,
              route: f.outbound.route,
              departure_time: f.outbound.departure_time,
              arrival_time: f.outbound.arrival_time,
              duration_minutes: f.outbound.duration_minutes,
            },

            inbound: {
              airline: f.inbound.airline,
              airline_code: f.inbound.airline_code,
              flight_number: f.inbound.flight_number,
              origin: f.inbound.origin,
              destination: f.inbound.destination,
              route: f.inbound.route,
              departure_time: f.inbound.departure_time,
              arrival_time: f.inbound.arrival_time,
              duration_minutes: f.inbound.duration_minutes,
            },

            base_price_usd: f.base_price_usd,
            final_price_usd: f.final_price_usd,
            final_price_mmk: f.final_price_mmk,
            price_estimate_min_usd: f.price_estimate_min_usd,
            price_estimate_max_usd: f.price_estimate_max_usd,
            price_estimate_min_mmk: f.price_estimate_min_mmk,
            price_estimate_max_mmk: f.price_estimate_max_mmk,
            requires_admin_confirmation: f.requires_admin_confirmation,
          },
          final_price_usd: f.final_price_usd,
          final_price_mmk: f.final_price_mmk,
        };
      }

      // ONE_WAY flight
      return {
        type: "ONE_WAY",
        adults: f.adults,
        bundle_key: f.external_flight_id || f.bundle_key,
        flight_snapshot: {
          external_flight_id: f.external_flight_id || f.bundle_key,
          airline: f.airline,
          airline_code: f.airline_code,
          flight_number: f.flight_number,
          origin: f.origin,
          destination: f.destination,
          route: f.route,
          departure_time: f.departure_time,
          arrival_time: f.arrival_time,
          duration_minutes: f.duration_minutes,
          baggage_carry_on_kg: f.baggage_carry_on_kg,
          baggage_checked_kg: f.baggage_checked_kg,
          baggage_fee: f.baggage_fee,
          baggage_info_url: f.baggage_info_url,
          base_price_usd: f.base_price_usd,
          final_price_usd: f.final_price_usd,
          final_price_mmk: f.final_price_mmk,
          price_estimate_min_usd: f.price_estimate_min_usd,
          price_estimate_max_usd: f.price_estimate_max_usd,
          price_estimate_min_mmk: f.price_estimate_min_mmk,
          price_estimate_max_mmk: f.price_estimate_max_mmk,
          requires_admin_confirmation: f.requires_admin_confirmation,
        },
        final_price_usd: f.final_price_usd,
        final_price_mmk: f.final_price_mmk,
      };
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Handlers
  const handleSearch = async () => {
    if (
      !searchParams.origin ||
      !searchParams.destination ||
      !searchParams.departureDate
    ) {
      setSearchError("Please fill in origin, destination, and departure date");
      return;
    }

    console.log("Search Params:", searchParams);

    if (tripType === "roundTrip" && !searchParams.returnDate) {
      setSearchError("Please fill in return date for round-trip search");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      let results;

      if (tripType === "oneWay") {
        results = await searchFlights(
          searchParams.origin,
          searchParams.destination,
          searchParams.departureDate
        );
      } else {
        results = await searchRoundTripFlights(
          searchParams.origin,
          searchParams.destination,
          searchParams.departureDate,
          searchParams.returnDate
        );
      }

      // Transform the API response
      const transformedResults = transformFlightData(results);

      setSearchResults(transformedResults);
      console.log("Transformed Search Results:", transformedResults);
      setHasSearched(true);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearAll = () => {
    setSearchParams({
      origin: "",
      destination: "",
      departureDate: "",
      returnDate: "",
    });

    setSearchResults([]);
    setHasSearched(false);
    setSearchError(null);
    setTripType("oneWay");
  };

  const handleInputChange = (field, value) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTripTypeChange = (type) => {
    setTripType(type);

    if (type === "oneWay") {
      handleInputChange("returnDate", "");
    }
  };

  const handleUpdateRate = async () => {
    try {
      await updateExchangeRate(usdToMmkRate);

      // Recalculate prices with new rate
      const updatedResults = searchResults.map(flight => ({
        ...flight,
        final_price_mmk: flight.final_price_usd * parseFloat(usdToMmkRate),
        flight_snapshot: {
          ...flight.flight_snapshot,
          final_price_mmk: flight.final_price_usd * parseFloat(usdToMmkRate),
        },
      }));

      setSearchResults(updatedResults);
      setOpenCurrencyModal(false);
      // Optional: Show success message
    } catch (err) {
      console.error("Failed to update exchange rate:", err);
    }
  };

  const handleUpdatePricingConfig = async () => {
    try {
      await updatePricingConfig(globalMarkup);
      
      // Recalculate prices with new markup
      const updatedResults = searchResults.map(flight => {
        const markupMultiplier = 1 + (parseFloat(globalMarkup) / 100);
        return {
          ...flight,
          final_price_usd: flight.flight_snapshot.base_price_usd * markupMultiplier,
          flight_snapshot: {
            ...flight.flight_snapshot,
            final_price_usd: flight.flight_snapshot.base_price_usd * markupMultiplier,
          },
        };
      });

      setSearchResults(updatedResults);
      setCurrentMarkup(parseFloat(globalMarkup));
      setOpenPricingModal(false);
      // Optional: Show success message
    } catch (err) {
      console.error("Failed to update pricing config:", err);
    }
  }; 

  // Render
  return (
    <div className="space-y-6">
      {/* =========================
          Header
      ========================= */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Search and manage flights</p>
        </div>

        <div className="flex gap-3">
          {isAdmin && (
            <>
              <button
                onClick={() => navigate("/admin/overrides")}
                className="border px-4 py-2 text-sm rounded hover:bg-gray-50 font-medium"
              >
                View Overrides
              </button>

              <button
                onClick={() => setOpenCurrencyModal(true)}
                className="border px-4 py-2 text-sm rounded hover:bg-gray-50"
              >
                Currency Exchange
              </button>
              <button
                onClick={() => setOpenPricingModal(true)}
                className="border px-4 py-2 text-sm rounded hover:bg-gray-50"
              >
                Pricing Configuration
              </button>
            </>
          )}
          </div>
      </div>

      {/* =========================
          Search Form
      ========================= */}
      <div className="bg-white border rounded-lg p-4">
        {/* Trip Type Toggle */}
        <div className="mb-4 flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tripType"
              value="oneWay"
              checked={tripType === "oneWay"}
              onChange={(e) => handleTripTypeChange(e.target.value)}
              className="cursor-pointer"
            />
            <span className="text-sm">One-way</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tripType"
              value="roundTrip"
              checked={tripType === "roundTrip"}
              onChange={(e) => handleTripTypeChange(e.target.value)}
              className="cursor-pointer"
            />
            <span className="text-sm">Round-trip</span>
          </label>
        </div>

        {/* Search Error */}
        {searchError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
            {searchError}
          </div>
        )}

        {/* Search Inputs */}
        <div className="grid grid-cols-5 gap-4 items-end">
          {/* Origin */}
          <div>
            <label className="text-xs text-gray-500">Origin</label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="e.g., RGN, BKK"
              value={searchParams.origin}
              onChange={(e) => handleInputChange("origin", e.target.value)}
            />
          </div>

          {/* Destination */}
          <div>
            <label className="text-xs text-gray-500">Destination</label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="e.g., BKK, SIN"
              value={searchParams.destination}
              onChange={(e) =>
                handleInputChange("destination", e.target.value)
              }
            />
          </div>

          {/* Departure Date */}
          <div>
            <label className="text-sm text-gray-500">Departure Date</label>
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm w-full"
              value={searchParams.departureDate}
              onChange={(e) =>
                handleInputChange("departureDate", e.target.value)
              }
            />
          </div>

          {/* Return Date */}
          {tripType === "roundTrip" && (
            <div>
              <label className="text-sm text-gray-500">Return Date</label>
              <input
                type="date"
                className="border rounded px-3 py-2 text-sm w-full"
                value={searchParams.returnDate}
                onChange={(e) =>
                  handleInputChange("returnDate", e.target.value)
                }
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleClearAll}
              className="border px-4 py-2 rounded text-sm hover:bg-gray-50"
            >
              Clear All
            </button>

            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-gray-800 hover:bg-black text-white text-sm px-4 py-2 rounded disabled:bg-gray-400"
            >
              {isSearching ? "Searching..." : "Search Flights"}
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          Results Table
      ========================= */}
      {hasSearched && (
        <div className="bg-white border rounded-lg overflow-hidden">
          {/* Results Header */}
          <div className="px-4 py-3 border-b">
            <h3 className="font-medium">Search Results</h3>
            <p className="text-xs text-gray-500">
              {searchResults.length > 0
                ? `Showing ${searchResults.length} flight${
                    searchResults.length !== 1 ? "s" : ""
                  }`
                : "No flights found matching your search criteria"}
            </p>
          </div>

          {/* Empty State / Table */}
          {searchResults.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No flights found. Try adjusting your search criteria.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 w-10"></th>
                  <th className="p-4 text-left">Type</th>
                  <th className="p-4 text-left">Flight No.</th>
                  <th className="p-4 text-left">Airline</th>
                  <th className="p-4 text-left">Route</th>
                  <th className="p-4 text-left">Departure</th>
                  <th className="p-4 text-left">Arrival</th>
                  <th className="p-4 text-left">Duration</th>
                  <th className="p-4 text-left">Adults</th>
                  <th className="p-4 text-left">Base Price USD</th>
                  <th className="p-4 text-left">Final Price USD</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {searchResults.map((flight) => (
                  <tr key={flight.bundle_key} className="hover:bg-gray-50">
                    <td className="p-4">
                    </td>

                    <td className="p-4 text-xs">
                      <span className="font-medium">{flight.type}</span>
                    </td>

                    <td className="p-4 font-medium">
                      {flight.type === "ROUND_TRIP"
                        ? `${flight.flight_snapshot.outbound.flight_number} / ${flight.flight_snapshot.inbound.flight_number}`
                        : flight.flight_snapshot.flight_number}
                    </td>

                    <td className="p-4">
                      {flight.type === "ROUND_TRIP"
                        ? flight.flight_snapshot.outbound.airline
                        : flight.flight_snapshot.airline}

                      <div className="text-xs text-gray-500">
                        {flight.type === "ROUND_TRIP"
                          ? flight.flight_snapshot.outbound.airline_code
                          : flight.flight_snapshot.airline_code}
                      </div>
                    </td>

                    <td className="p-4">
                      {flight.type === "ROUND_TRIP"
                        ? `${flight.flight_snapshot.outbound.route} / ${flight.flight_snapshot.inbound.route}`
                        : flight.flight_snapshot.route}
                    </td>

                    <td className="p-4">
                      {flight.type === "ROUND_TRIP"
                        ? flight.flight_snapshot.outbound.departure_time
                        : flight.flight_snapshot.departure_time}
                    </td>

                    <td className="p-4">
                      {flight.type === "ROUND_TRIP"
                        ? flight.flight_snapshot.inbound.arrival_time
                        : flight.flight_snapshot.arrival_time}
                    </td>

                    <td className="p-4">
                      {flight.type === "ROUND_TRIP"
                        ? `${formatDuration(
                            flight.flight_snapshot.outbound.duration_minutes
                          )} / ${formatDuration(
                            flight.flight_snapshot.inbound.duration_minutes
                          )}`
                        : formatDuration(
                            flight.flight_snapshot.duration_minutes
                          )}
                    </td>

                    <td className="p-4">{flight.adults}</td>

                    <td className="p-4 font-medium">
                      ${flight.flight_snapshot.base_price_usd}
                    </td>

                    <td className="p-4 font-medium">${flight.final_price_usd}</td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/flights/${flight.bundle_key}`, {
                              state: {
                                flightData: flight,
                              },
                            })
                          }
                          className="border px-3 py-1 text-xs rounded hover:bg-gray-100"
                        >
                          View
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              navigate(
                                `/admin/flights/${flight.bundle_key}/flight-edit`,
                                {
                                  state: {
                                    flightData: flight,
                                    mode: "create",
                                  },
                                }
                              );
                            }}
                            className="border px-3 py-1 text-xs rounded hover:bg-gray-100"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div className="p-4 flex justify-between text-sm text-gray-500 border-t">
            <span>Showing {searchResults.length} results</span>
          </div>
        </div>
      )}

      {/* =========================
          Currency Modal
      ========================= */}
      {openCurrencyModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setOpenCurrencyModal(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Currency Exchange Rate</h2>
              <button onClick={() => setOpenCurrencyModal(false)} className="text-2xl">×</button>
            </div>

            {/* Rate Table */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border">
                    <th className="border p-3 text-left font-semibold">Currency</th>
                    <th className="border p-3 text-left font-semibold">Current Rate (to MMK)</th>
                    <th className="border p-3 text-left font-semibold">New Rate</th>
                    <th className="border p-3 text-left font-semibold">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border hover:bg-gray-50">
                    <td className="border p-3">USD</td>
                    <td className="border p-3 font-medium">{currentRate || 0}</td>
                    <td className="border p-3">
                      <input
                        type="text"
                        value={usdToMmkRate}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*\.?\d*$/.test(value)) {
                            setUsdToMmkRate(value);
                          }
                        }}
                        className="border rounded px-3 py-2 w-full"
                        placeholder="Enter new rate"
                      />
                    </td>
                    <td className="border p-3 text-sm text-gray-600">
                      {formatDate(lastUpdated)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenCurrencyModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>

              <button 
                onClick={handleUpdateRate}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Update Rate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          Pricing Configuration Modal
      ========================= */}
      {openPricingModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setOpenPricingModal(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Pricing Configuration</h2>
              <button onClick={() => setOpenPricingModal(false)} className="text-2xl">×</button>
            </div>

            {/* Config Table */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border">
                    <th className="border p-3 text-left font-semibold">Configuration</th>
                    <th className="border p-3 text-left font-semibold">Current Value</th>
                    <th className="border p-3 text-left font-semibold">New Value</th>
                    <th className="border p-3 text-left font-semibold">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border hover:bg-gray-50">
                    <td className="border p-3 font-medium">Global Markup Percentage</td>
                    <td className="border p-3 font-medium">{currentMarkup || 0}%</td>
                    <td className="border p-3">
                      <input
                        type="text"
                        value={globalMarkup}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*\.?\d*$/.test(value)) {
                            setGlobalMarkup(value);
                          }
                        }}
                        className="border rounded px-3 py-2 w-full"
                        placeholder="Enter markup percentage"
                      />
                    </td>
                    <td className="border p-3 text-sm text-gray-600">
                      {formatDate(pricingUpdatedAt)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>


            {/* Modal Footer */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenPricingModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>

              <button 
                onClick={handleUpdatePricingConfig}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Update Configuration
              </button>
            </div>
          </div>
        </div>
      )}    
    </div>
  );
}