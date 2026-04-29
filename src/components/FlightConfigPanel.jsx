import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getExchangeRate,
  updateExchangeRate,
  getPricingConfig,
  updatePricingConfig,
} from "../config/api";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString();
  } catch (e) {
    return "N/A";
  }
};

export default function FlightConfigPanel({ onNotify }) {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [openCurrencyModal, setOpenCurrencyModal] = useState(false);
  const [usdToMmkRate, setUsdToMmkRate] = useState("");
  const [currentRate, setCurrentRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [openPricingModal, setOpenPricingModal] = useState(false);
  const [globalMarkup, setGlobalMarkup] = useState("");
  const [currentMarkup, setCurrentMarkup] = useState(null);
  const [pricingUpdatedAt, setPricingUpdatedAt] = useState(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const rateData = await getExchangeRate();
        setCurrentRate(rateData?.usd_to_mmk || 0);
        setLastUpdated(rateData?.created_at);
        setUsdToMmkRate(String(rateData?.usd_to_mmk || ""));
      } catch {
        // non-critical, silently skip
      }
    };

    const fetchPricingConfig = async () => {
      try {
        const pricingData = await getPricingConfig();
        setCurrentMarkup(pricingData?.global_markup_percentage || 0);
        setPricingUpdatedAt(pricingData?.updated_at);
        setGlobalMarkup(String(pricingData?.global_markup_percentage || ""));
      } catch {
        // non-critical, silently skip
      }
    };

    fetchRate();
    fetchPricingConfig();
  }, []);

  const handleUpdateRate = async () => {
    try {
      await updateExchangeRate(usdToMmkRate);
      const rateData = await getExchangeRate();
      setCurrentRate(rateData?.usd_to_mmk || 0);
      setLastUpdated(rateData?.created_at);
      setUsdToMmkRate(String(rateData?.usd_to_mmk || ""));
      onNotify?.({ message: "Exchange rate updated successfully!", type: "success" });
      setOpenCurrencyModal(false);
    } catch (err) {
      onNotify?.({ message: "Failed to update exchange rate: " + err.message, type: "error" });
    }
  };

  const handleUpdatePricingConfig = async () => {
    try {
      await updatePricingConfig(globalMarkup);
      const pricingData = await getPricingConfig();
      setCurrentMarkup(pricingData?.global_markup_percentage || 0);
      setPricingUpdatedAt(pricingData?.updated_at);
      setGlobalMarkup(String(pricingData?.global_markup_percentage || ""));
      onNotify?.({ message: "Pricing configuration updated successfully!", type: "success" });
      setOpenPricingModal(false);
    } catch (err) {
      onNotify?.({ message: "Failed to update pricing config: " + err.message, type: "error" });
    }
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-3">
        {hasRole("SUPER_ADMIN") && (
          <button
            onClick={() => navigate("/admin/overrides")}
            className="border border-blue-200 px-4 py-2 text-sm rounded-lg bg-[#bedbff] hover:bg-blue-50 font-medium transition"
          >
            View Overrides
          </button>
        )}
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Currency Exchange Rate</h2>
              <button onClick={() => setOpenCurrencyModal(false)} className="text-2xl">×</button>
            </div>

            <div className="mb-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-50 border border-blue-200">
                    <th className="border border-blue-200 p-3 text-left font-semibold">Currency</th>
                    <th className="border border-blue-200 p-3 text-left font-semibold">Current Rate (to MMK)</th>
                    {hasRole("SUPER_ADMIN") && (
                      <th className="border border-blue-200 p-3 text-left font-semibold">New Rate</th>
                    )}
                    <th className="border border-blue-200 p-3 text-left font-semibold">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border border-blue-200 hover:bg-blue-50">
                    <td className="border border-blue-200 p-3">USD</td>
                    <td className="border border-blue-200 p-3 font-medium">{currentRate || 0}</td>
                    {hasRole("SUPER_ADMIN") && (
                      <td className="border border-blue-200 p-3">
                        <input
                          type="text"
                          value={usdToMmkRate}
                          onChange={(e) => {
                            if (/^\d*\.?\d*$/.test(e.target.value)) {
                              setUsdToMmkRate(e.target.value);
                            }
                          }}
                          className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Enter new rate"
                        />
                      </td>
                    )}
                    <td className="border border-blue-200 p-3 text-sm text-gray-600">
                      {formatDate(lastUpdated)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenCurrencyModal(false)}
                className="px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 font-medium transition"
              >
                Cancel
              </button>
              {hasRole("SUPER_ADMIN") && (
                <button
                  onClick={handleUpdateRate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  Update Rate
                </button>
              )}
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Pricing Configuration</h2>
              <button onClick={() => setOpenPricingModal(false)} className="text-2xl">×</button>
            </div>

            <div className="mb-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-50 border border-blue-200">
                    <th className="border border-blue-200 p-3 text-left font-semibold">Configuration</th>
                    <th className="border border-blue-200 p-3 text-left font-semibold">Current Value</th>
                    {hasRole("SUPER_ADMIN") && (
                      <th className="border border-blue-200 p-3 text-left font-semibold">New Value</th>
                    )}
                    <th className="border border-blue-200 p-3 text-left font-semibold">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border border-blue-200 hover:bg-blue-50">
                    <td className="border border-blue-200 p-3 font-medium">Global Markup Percentage</td>
                    <td className="border border-blue-200 p-3 font-medium">{currentMarkup || 0}%</td>
                    {hasRole("SUPER_ADMIN") && (
                      <td className="border border-blue-200 p-3">
                        <input
                          type="text"
                          value={globalMarkup}
                          onChange={(e) => {
                            if (/^\d*\.?\d*$/.test(e.target.value)) {
                              setGlobalMarkup(e.target.value);
                            }
                          }}
                          className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Enter markup percentage"
                        />
                      </td>
                    )}
                    <td className="border border-blue-200 p-3 text-sm text-gray-600">
                      {formatDate(pricingUpdatedAt)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenPricingModal(false)}
                className="px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 font-medium transition"
              >
                Cancel
              </button>
              {hasRole("SUPER_ADMIN") && (
                <button
                  onClick={handleUpdatePricingConfig}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  Update Configuration
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
