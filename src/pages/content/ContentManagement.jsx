import { useState } from "react";
import BackgroundManager from "./BackgroundManager";
import BannerList from "./BannerList";

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState("background");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Content Management</h1>
        <p className="text-gray-600 mt-2">Manage homepage background and banner images</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-6">
        <button
          onClick={() => setActiveTab("background")}
          className={`px-6 py-3 font-medium transition ${
            activeTab === "background"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Background Image
        </button>
        <button
          onClick={() => setActiveTab("banners")}
          className={`px-6 py-3 font-medium transition ${
            activeTab === "banners"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Banner Management
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === "background" && <BackgroundManager />}
        {activeTab === "banners" && <BannerList />}
      </div>
    </div>
  );
}
