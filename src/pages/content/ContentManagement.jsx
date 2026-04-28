import { useState } from "react";
import BackgroundManager from "./BackgroundManager";
import BannerList from "./BannerList";

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState("background");

  return (
    <div>

      {/* Tabs */}
      <div className="bg-white border border-blue-200 rounded-2xl shadow-md overflow-hidden">
        <div className="flex border-b border-blue-200">
          <button
            onClick={() => setActiveTab("background")}
            className={`flex-1 px-6 py-4 font-medium transition text-sm ${
              activeTab === "background"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            Background Image
          </button>
          <button
            onClick={() => setActiveTab("banners")}
            className={`flex-1 px-6 py-4 font-medium transition text-sm ${
              activeTab === "banners"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            Banner Management
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "background" && <BackgroundManager />}
          {activeTab === "banners" && <BannerList />}
        </div>
      </div>
    </div>
  );
}
