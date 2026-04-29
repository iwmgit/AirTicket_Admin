import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RequireAuth from "./RequireAuth";

export default function RequireRole({ children, role }) {
  const { hasRole } = useAuth();

  return (
    <RequireAuth>
      {hasRole(role) ? (
        children
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You do not have permission to access this page.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Contact your administrator if you believe this is an error.
            </p>
          </div>
        </div>
      )}
    </RequireAuth>
  );
}
