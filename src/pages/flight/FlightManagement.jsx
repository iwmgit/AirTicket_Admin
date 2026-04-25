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

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

  const CalendarIcon = (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
  );

  // Render
  return (
    <div className="p-4">
      <div className="bg-white border border-blue-200 rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Flight Management</h2>
              <p className="text-sm text-gray-500">Search and manage flights</p>
            </div>

            <div className="flex gap-3">
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate("/admin/overrides")}
                    className="border border-blue-200 px-4 py-2 text-sm rounded-lg bg-[#bedbff] hover:bg-blue-50 font-medium transition"
                  >
                    View Overrides
                  </button>

                  <button
                    onClick={() => setOpenCurrencyModal(true)}
                    className="border border-blue-200 px-4 py-2 text-sm rounded-lg bg-[#bedbff] hover:bg-blue-50 font-medium transition"
                  >
                    Currency Exchange
                  </button>
                  <button
                    onClick={() => setOpenPricingModal(true)}
                    className="border border-blue-200 px-4 py-2 text-sm rounded-lg bg-[#bedbff] hover:bg-blue-50 font-medium transition"
                  >
                    Pricing Configuration
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="p-5 border-b border-blue-200">
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
              <span className="text-sm font-medium">One-way</span>
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
              <span className="text-sm font-medium">Round-trip</span>
            </label>
          </div>

          {/* Search Error */}
          {searchError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {searchError}
            </div>
          )}

          {/* Search Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            {/* Origin */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Origin</label>
              <input
                type="text"
                className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g., RGN, BKK"
                value={searchParams.origin}
                onChange={(e) => handleInputChange("origin", e.target.value)}
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Destination</label>
              <input
                type="text"
                className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g., BKK, SIN"
                value={searchParams.destination}
                onChange={(e) => handleInputChange("destination", e.target.value)}
              />
            </div>

            {/* Departure Date */}
            <div >
              <label className="block text-sm font-medium text-slate-500 mb-3">
                Departure date
              </label>
              <div className="relative">
                <div className="h-10 rounded-2xl border border-gray-200 bg-white flex items-center px-4">
                  <span className="mr-3 text-gray-400">{CalendarIcon}</span>
                  <input
                    type="text"
                    readOnly
                    value={formatDisplayDate(searchParams.departureDate)}
                    placeholder="Select date"
                    onClick={() => {
                      const el = document.getElementById("departure-date");
                      if (el?.showPicker) {
                        el.showPicker();
                      } else if (el) {
                        el.click();
                      }
                    }}
                    className="w-full bg-transparent outline-none text-base text-slate-700 placeholder:text-gray-400 cursor-pointer"
                  />
                </div>

                <input
                  id="departure-date"
                  type="date"
                  value={searchParams.departureDate}
                  onChange={(e) =>
                    handleInputChange("departureDate", e.target.value)
                  }
                  className="absolute inset-0 opacity-0 pointer-events-none"
                  tabIndex={-1}
                />
              </div>
            </div>

            {/* Return Date */}
            {tripType === "roundTrip" && (
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-3">
                  Return date
                </label>
                <div className="relative">
                  <div className="h-10 rounded-2xl border border-gray-200 bg-white flex items-center px-4">
                    <span className="mr-3 text-gray-400">{CalendarIcon}</span>
                    <input
                      type="text"
                      readOnly
                      value={formatDisplayDate(searchParams.returnDate)}
                      placeholder="Select date "
                      onClick={() => {
                        const el = document.getElementById("return-date");
                        if (el?.showPicker) {
                          el.showPicker();
                        } else if (el) {
                          el.click();
                        }
                      }}
                      className="w-full bg-transparent outline-none text-base text-slate-700 placeholder:text-gray-400 cursor-pointer"
                    />
                  </div>

                  <input
                    id="return-date"
                    type="date"
                    value={searchParams.returnDate}
                    onChange={(e) =>
                      handleInputChange("returnDate", e.target.value)
                    }
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    tabIndex={-1}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleClearAll}
                className="border border-blue-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
              >
                Clear All
              </button>

              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-[#bedbff] hover:bg-blue-700 text-black text-sm px-4 py-2 rounded-lg font-medium disabled:bg-gray-400 transition"
              >
                {isSearching ? "Searching..." : "Search Flights"}
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {hasSearched && (
          <>
            {/* Results Header */}
            <div className="px-5 py-3 border-b border-blue-200">
              <h3 className="font-semibold text-gray-800">Search Results</h3>
              <p className="text-xs text-gray-500 mt-1">
                {searchResults.length > 0
                  ? `Showing ${searchResults.length} flight${searchResults.length !== 1 ? "s" : ""}`
                  : "No flights found matching your search criteria"}
              </p>
            </div>

            {/* Empty State / Table */}
            {searchResults.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No flights found. Try adjusting your search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50 border-y border-blue-200 text-gray-600 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Flight No.</th>
                      <th className="px-4 py-3 text-left">Airline</th>
                      <th className="px-4 py-3 text-left">Route</th>
                      <th className="px-4 py-3 text-left">Departure</th>
                      <th className="px-4 py-3 text-left">Arrival</th>
                      <th className="px-4 py-3 text-left">Duration</th>
                      <th className="px-4 py-3 text-left">Adults</th>
                      <th className="px-4 py-3 text-left">Base Price USD</th>
                      <th className="px-4 py-3 text-left">Final Price USD</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {searchResults.map((flight) => (
                      <tr key={flight.bundle_key} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-xs">
                          <span className="font-medium">{flight.type}</span>
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {flight.type === "ROUND_TRIP"
                            ? `${flight.flight_snapshot.outbound.flight_number} / ${flight.flight_snapshot.inbound.flight_number}`
                            : flight.flight_snapshot.flight_number}
                        </td>

                        <td className="px-4 py-3">
                          {flight.type === "ROUND_TRIP"
                            ? flight.flight_snapshot.outbound.airline
                            : flight.flight_snapshot.airline}

                          <div className="text-xs text-gray-500">
                            {flight.type === "ROUND_TRIP"
                              ? flight.flight_snapshot.outbound.airline_code
                              : flight.flight_snapshot.airline_code}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {flight.type === "ROUND_TRIP"
                            ? `${flight.flight_snapshot.outbound.route} / ${flight.flight_snapshot.inbound.route}`
                            : flight.flight_snapshot.route}
                        </td>

                        <td className="px-4 py-3 text-sm">
                          {flight.type === "ROUND_TRIP"
                            ? flight.flight_snapshot.outbound.departure_time
                            : flight.flight_snapshot.departure_time}
                        </td>

                        <td className="px-4 py-3 text-sm">
                          {flight.type === "ROUND_TRIP"
                            ? flight.flight_snapshot.inbound.arrival_time
                            : flight.flight_snapshot.arrival_time}
                        </td>

                        <td className="px-4 py-3">
                          {flight.type === "ROUND_TRIP"
                            ? `${formatDuration(
                                flight.flight_snapshot.outbound.duration_minutes
                              )} / ${formatDuration(
                                flight.flight_snapshot.inbound.duration_minutes
                              )}`
                            : formatDuration(flight.flight_snapshot.duration_minutes)}
                        </td>

                        <td className="px-4 py-3">{flight.adults}</td>

                        <td className="px-4 py-3 font-medium">
                          ${flight.flight_snapshot.base_price_usd}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          ${flight.final_price_usd}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                navigate(`/admin/flights/${flight.bundle_key}`, {
                                  state: { flightData: flight },
                                })
                              }
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
                                className="w-8 h-8 flex items-center justify-center border border-blue-200 rounded-lg text-gray-600 hover:bg-blue-50 transition"
                                title="Edit">
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
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================= Currency Modal ========================= */}
      {openCurrencyModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setOpenCurrencyModal(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6"
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
                  <tr className="bg-blue-50 border border-blue-200">
                    <th className="border border-blue-200 p-3 text-left font-semibold">Currency</th>
                    <th className="border border-blue-200 p-3 text-left font-semibold">Current Rate (to MMK)</th>
                    <th className="border border-blue-200 p-3 text-left font-semibold">New Rate</th>
                    <th className="border border-blue-200 p-3 text-left font-semibold">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border border-blue-200 hover:bg-blue-50">
                    <td className="border border-blue-200 p-3">USD</td>
                    <td className="border border-blue-200 p-3 font-medium">{currentRate || 0}</td>
                    <td className="border border-blue-200 p-3">
                      <input
                        type="text"
                        value={usdToMmkRate}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*\.?\d*$/.test(value)) {
                            setUsdToMmkRate(value);
                          }
                        }}
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter new rate"
                      />
                    </td>
                    <td className="border border-blue-200 p-3 text-sm text-gray-600">
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
                className="px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 font-medium transition"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateRate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Update Rate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================= Pricing Configuration Modal ========================= */}
      {openPricingModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setOpenPricingModal(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6"
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
                  <tr className="bg-blue-50 border border-blue-200">
                    <th className="border border-blue-200 p-3 text-left font-semibold">Configuration</th>
                    <th className="border border-blue-200 p-3 text-left font-semibold">Current Value</th>
                    <th className="border border-blue-200 p-3 text-left font-semibold">New Value</th>
                    <th className="border border-blue-200 p-3 text-left font-semibold">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border border-blue-200 hover:bg-blue-50">
                    <td className="border border-blue-200 p-3 font-medium">Global Markup Percentage</td>
                    <td className="border border-blue-200 p-3 font-medium">{currentMarkup || 0}%</td>
                    <td className="border border-blue-200 p-3">
                      <input
                        type="text"
                        value={globalMarkup}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*\.?\d*$/.test(value)) {
                            setGlobalMarkup(value);
                          }
                        }}
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter markup percentage"
                      />
                    </td>
                    <td className="border border-blue-200 p-3 text-sm text-gray-600">
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
                className="px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 font-medium transition"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdatePricingConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
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