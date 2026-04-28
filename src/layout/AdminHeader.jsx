// layout/AdminHeader.jsx
import { useLocation, useNavigate } from "react-router";

const HEADER_CONFIG = {
  "/admin/bookings": {
    title: "Booking Management",
    subtitle: "Manage all flight bookings and reservations",
  },
  "/admin/flights": {
    title: "Flight Management",
    subtitle: "Manage flight routes and schedules",
  },
  "/admin/users": {
    title: "User Management",
    subtitle: "Manage system users",
  },
  "/admin/staff/staff-form": {
    title: "Add Staff Member",
    subtitle: "Create a new staff account",
  },
    "/admin/staff": {
      title: "Staff Management",
      subtitle: "Manage staff members",
    },
  "/admin/content": {
    title: "Content Management",
    subtitle: "Manage homepage background and banner images",
  },
};

export default function AdminHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const header =
    Object.entries(HEADER_CONFIG).find(([path]) =>
      pathname.startsWith(path)
    )?.[1];

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-7 flex items-center justify-between shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          {header?.title || "Admin"}
        </h1>

        {header?.subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">
            {header.subtitle}
          </p>
        )}
      </div>

      {header?.actionPath && pathname !== header.actionPath && (
        <button
          onClick={() => navigate(header.actionPath)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-blue-600 transition"
        >
          {header.actionLabel}
        </button>
      )}
    </header>
  );
}