import { NavLink } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import Logo from "../assets/Logo_1.jpg";

const navItemClass = ({ isActive }) =>
  `block px-4 py-3 rounded text-sm font-medium ${
    isActive ? "bg-[#bedbff] text-black" : "text-gray-700 hover:bg-[#f5f8ff] hover:text-black transition"
  }`;

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { hasRole } = useAuth(); 

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <aside className="w-64 bg-[#f5f8ff] border-r border-gray-300 p-4">
      {/* Logo */}
      <div className="flex items-center gap-4 mb-8">
        <img src={Logo} alt="Logo" className="w-14 h-14 object-contain" />
        <div className="text-xl font-bold text-center">Admin Panel</div>
      </div>
            

      {/* Navigation */}
      <nav className="space-y-2">
        <NavLink to="/admin/bookings" end className={navItemClass}>
          Booking Management
        </NavLink>

        <NavLink to="/admin/flights" className={navItemClass}>
          Flight Management
        </NavLink>

        {hasRole("SUPER_ADMIN") && (
          <NavLink to="/admin/users" className={navItemClass}>
            User Management
          </NavLink>
        )}

        {hasRole("SUPER_ADMIN") && (
          <NavLink to="/admin/staff" className={navItemClass}>
            Staff Management
          </NavLink>
        )}

        {hasRole("SUPER_ADMIN") && (
          <NavLink to="/admin/content" className={navItemClass}>
            Content Management
          </NavLink>
        )}

      </nav>

      <button
        onClick={handleLogout}
        className="w-full mt-8 px-4 py-3 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition"
      >
        Logout
      </button>
    </aside>
  );
}
