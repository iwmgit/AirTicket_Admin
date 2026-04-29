import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Notification from "../../components/Notification";

export default function StaffFormModal({ onClose, onSuccess, onNotify = () => {} }) {
  const { createStaff } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "success" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Full name is required");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email address is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError("Password must contain at least one number");
      return false;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password)) {
      setError("Password must contain at least one special character");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
    });
  };

  const handleCancel = () => {
    resetForm();
    setError("");
    onClose();
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await createStaff(
        formData.name,
        formData.email,
        formData.password
      );

      if (response?.success === true) {
        resetForm();
        onSuccess();
      } else {
        const errorMsg = response?.error || "Failed to create staff account";
        setError(errorMsg);
        setNotification({ message: errorMsg, type: "error" });
        onNotify(errorMsg, "error");
      }
    } catch (err) {
      console.error("Error creating staff:", err);
      const errorMsg = err.message || "Failed to create staff account";
      setError(errorMsg);
      setNotification({ message: errorMsg, type: "error" });
      onNotify(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      {/* Modal Header */}
      <div className="p-5 border-b border-blue-200 bg-blue-50 flex items-center justify-between sticky top-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Create Staff Account
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Add a new staff member to the system
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl font-light"
        >
          ×
        </button>
      </div>

      {/* Failure Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ message: "", type: "success" })}
      />

      {/* Modal Body */}
      <div className="p-5 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm flex items-start gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-medium block mb-1 text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="border border-blue-200 rounded-lg w-full px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1 text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border border-blue-200 rounded-lg w-full px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="staff@airline.com"
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1 text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="border border-blue-200 rounded-lg w-full px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter temporary password"
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1 text-gray-700">
                  Role
                </label>
                <input
                  value="STAFF"
                  readOnly
                  className="border border-blue-200 rounded-lg w-full px-3 py-2 text-sm bg-blue-50 text-gray-600"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-between pt-4 border-t border-blue-100">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50 font-medium"
              >
                {loading ? "Creating..." : "Create Staff"}
              </button>
            </div>
          </form>
      </div>
    </>
  );
}