import { useState } from "react";

const asiaDestinations = [
  { city: "Bangkok", code: "BKK" },
  { city: "Yangon", code: "RGN" },
  { city: "Mandalay", code: "MDL" },
  { city: "Singapore", code: "SIN" },
  { city: "Tokyo", code: "NRT" },
  { city: "Seoul", code: "ICN" },
  { city: "Kuala Lumpur", code: "KUL" },
  { city: "Phuket", code: "HKT" },
  { city: "Chiang Mai", code: "CNX" },
  { city: "Hong Kong", code: "HKG" },
  { city: "Taipei", code: "TPE" },
  { city: "Osaka", code: "KIX" },
  { city: "Hanoi", code: "HAN" },
  { city: "Ho Chi Minh City", code: "SGN" },
  { city: "Phnom Penh", code: "PNH" },
  { city: "Vientiane", code: "VTE" },
  { city: "Guangzhou", code: "CAN" },
  { city: "Kunming", code: "KMG" },
  { city: "Beijing", code: "PEK" },
  { city: "Shanghai", code: "PVG" },
  { city: "Shenzhen", code: "SZX" },
  { city: "Delhi", code: "DEL" },
  { city: "Mumbai", code: "BOM" },
  { city: "Dhaka", code: "DAC" },
  { city: "Colombo", code: "CMB" },
  { city: "Dubai", code: "DXB" },
  { city: "Doha", code: "DOH" },
  { city: "Jakarta", code: "CGK" },
];

const airportMap = {
  bangkok: "BKK",
  bkk: "BKK",
  yangon: "RGN",
  rgn: "RGN",
  mandalay: "MDL",
  mdl: "MDL",
  singapore: "SIN",
  sin: "SIN",
  tokyo: "NRT",
  nrt: "NRT",
  seoul: "ICN",
  icn: "ICN",
  "kuala lumpur": "KUL",
  kul: "KUL",
  phuket: "HKT",
  hkt: "HKT",
  "chiang mai": "CNX",
  cnx: "CNX",
  "hong kong": "HKG",
  hkg: "HKG",
  taipei: "TPE",
  tpe: "TPE",
  osaka: "KIX",
  kix: "KIX",
  hanoi: "HAN",
  han: "HAN",
  "ho chi minh": "SGN",
  "ho chi minh city": "SGN",
  saigon: "SGN",
  sgn: "SGN",
  "phnom penh": "PNH",
  pnh: "PNH",
  vientiane: "VTE",
  vte: "VTE",
  guangzhou: "CAN",
  can: "CAN",
  kunming: "KMG",
  kmg: "KMG",
  beijing: "PEK",
  pek: "PEK",
  shanghai: "PVG",
  pvg: "PVG",
  shenzhen: "SZX",
  szx: "SZX",
  delhi: "DEL",
  "new delhi": "DEL",
  del: "DEL",
  mumbai: "BOM",
  bombay: "BOM",
  bom: "BOM",
  dhaka: "DAC",
  dac: "DAC",
  colombo: "CMB",
  cmb: "CMB",
  dubai: "DXB",
  dxb: "DXB",
  doha: "DOH",
  doh: "DOH",
  jakarta: "CGK",
  cgk: "CGK",
};

const getAirportCode = (input) => {
  if (!input) return "";

  const value = input.trim().toLowerCase();

  if (airportMap[value]) return airportMap[value];

  const matchedCity = Object.keys(airportMap).find((city) =>
    value.includes(city)
  );

  if (matchedCity) return airportMap[matchedCity];

  return input.trim().toUpperCase();
};

const formatDisplayDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const LocationIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 21s-6-5.33-6-10a6 6 0 1112 0c0 4.67-6 10-6 10z" />
    <circle cx="12" cy="11" r="2" />
  </svg>
);

const CalendarIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const SearchIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

const AdminFlightSearchForm = ({ searchParams, onSearch, onInputChange, isSearching }) => {
  const [activeField, setActiveField] = useState(null);

  const handleDestinationSelect = (item) => {
    onInputChange(activeField, item.code);
    setActiveField(null);
  };

  // Filter destinations based on current input
  const getFilteredDestinations = () => {
    const fieldValue = activeField === "origin" ? searchParams.origin : searchParams.destination;
    
    if (!fieldValue.trim()) return asiaDestinations;

    const searchTerm = fieldValue.toLowerCase();
    
    return asiaDestinations.filter((item) => 
      item.city.toLowerCase().includes(searchTerm) || 
      item.code.toLowerCase().includes(searchTerm)
    );
  };

  const filteredDestinations = getFilteredDestinations();

  return (
    <div className="relative z-40">
      <form onSubmit={(e) => { e.preventDefault(); onSearch(); }} className="space-y-4">
        {/* Search Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">
              Origin
            </label>
            <div className="relative" id="origin-container">
              <div className="h-10 rounded-lg border border-gray-200 bg-white flex items-center px-3">
                <span className="mr-2 text-gray-400">{LocationIcon}</span>
                <input
                  type="text"
                  placeholder="e.g., RGN, BKK"
                  value={searchParams.origin}
                  onFocus={() => setActiveField("origin")}
                  onChange={(e) => onInputChange("origin", e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">
              Destination
            </label>
            <div className="relative" id="destination-container">
              <div className="h-10 rounded-lg border border-gray-200 bg-white flex items-center px-3">
                <span className="mr-2 text-gray-400">{LocationIcon}</span>
                <input
                  type="text"
                  placeholder="e.g., BKK, SIN"
                  value={searchParams.destination}
                  onFocus={() => setActiveField("destination")}
                  onChange={(e) => onInputChange("destination", e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Departure Date */}
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">
              Departure date
            </label>
            <div className="relative">
              <div className="h-10 rounded-lg border border-gray-200 bg-white flex items-center px-3">
                <span className="mr-2 text-gray-400">{CalendarIcon}</span>
                <input
                  type="text"
                  readOnly
                  value={formatDisplayDate(searchParams.departureDate)}
                  placeholder="Select date"
                  onClick={() => {
                    const el = document.getElementById("admin-departure-date");
                    if (el?.showPicker) {
                      el.showPicker();
                    } else if (el) {
                      el.click();
                    }
                  }}
                  className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-gray-400 cursor-pointer"
                />
              </div>

              <input
                id="admin-departure-date"
                type="date"
                value={searchParams.departureDate}
                onChange={(e) => onInputChange("departureDate", e.target.value)}
                className="absolute inset-0 opacity-0 pointer-events-none"
                tabIndex={-1}
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={isSearching}
            className="h-10 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
          >
            {SearchIcon}
            Search
          </button>
        </div>
      </form>

      {/* Location Dropdown - Full Width Overlay */}
      {activeField && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setActiveField(null)} />
          <div className="fixed left-0 right-0 top-1/4 mx-auto bg-white rounded-lg shadow-2xl border border-gray-200 z-50 p-4 w-11/12 md:w-3/4 lg:w-2/3 max-w-4xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-700">
                {activeField === "origin" ? "Origin" : "Destination"} - Popular Destinations
              </h3>

              <button
                type="button"
                onClick={() => setActiveField(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-gray-500">Asia</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            {filteredDestinations.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-96 overflow-y-scroll pr-2">
                {filteredDestinations.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleDestinationSelect(item)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition text-left"
                  >
                    <div className="font-semibold">{item.city}</div>
                    <div className="text-gray-400">{item.code}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                No destinations found matching "{activeField === "origin" ? searchParams.origin : searchParams.destination}"
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminFlightSearchForm;
