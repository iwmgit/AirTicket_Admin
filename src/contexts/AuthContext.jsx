import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, createStaffUser } from "../config/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to restore auth:", err);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError("");

      const data = await loginUser(email, password);
      const authToken = data.token || data.access_token;
      if (!authToken) throw new Error("Token not found in response");

      setToken(authToken);
      setUser(data.user || { email });

      localStorage.setItem("authToken", authToken);
      localStorage.setItem("user", JSON.stringify(data.user || { email }));

      return { success: true };
    } catch (err) {
      const errorMsg = err.message || "Authentication failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async (name, email, password) => {
    try {
      setLoading(true);
      setError("");

      const data = await createStaffUser(name, email, password);
      
      // Staff creation doesn't require a token, just check if we got a response
      if (data && (data.id || data.user || data.success !== false)) {
        return { success: true, user: data };
      } else {
        throw new Error(data?.error || "Failed to create staff account");
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to create staff account";
      console.error("Create staff error:", errorMsg);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  const hasRole = (role) => {
    if (!user) return false;
    const userRole = user.role || user.roles;
    if (Array.isArray(userRole)) {
      return userRole.includes(role);
    }
    return userRole === role;
  };

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    createStaff,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
