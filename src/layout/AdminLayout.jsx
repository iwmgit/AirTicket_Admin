
import { Outlet } from "react-router";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen ">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
