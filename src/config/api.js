const mockUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@airline.com",
    phone: "+1 (555) 123-4567",
    registration: "Jan 15, 2024",
    lastActive: "2 hours ago",
    status: "Active",
    bookingStats: {
      total: 12,
      totalSpent: 4580,
      cancelled: 2,
      avgBooking: 382,
    },
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@airline.com",
    phone: "+66 81 234 5678",
    registration: "Feb 3, 2024",
    lastActive: "5 minutes ago",
    status: "Active",
    bookingStats: { total: 8, totalSpent: 3120, cancelled: 1, avgBooking: 390 },
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.r@airline.com",
    phone: "+1 (555) 987-6543",
    registration: "Mar 12, 2024",
    lastActive: "1 day ago",
    status: "Active",
    bookingStats: {
      total: 15,
      totalSpent: 7250,
      cancelled: 3,
      avgBooking: 483,
    },
  },
  {
    id: 4,
    name: "David Park",
    email: "david.park@airline.com",
    phone: "+82 10 1234 5678",
    registration: "Apr 8, 2024",
    lastActive: "3 hours ago",
    status: "Active",
    bookingStats: { total: 5, totalSpent: 2100, cancelled: 0, avgBooking: 420 },
  },
  {
    id: 5,
    name: "Jessica Williams",
    email: "jessica.williams@airline.com",
    phone: "+1 (555) 456-7890",
    registration: "May 20, 2024",
    lastActive: "1 hour ago",
    status: "Active",
    bookingStats: { total: 3, totalSpent: 1200, cancelled: 0, avgBooking: 400 },
  },
  {
    id: 6,
    name: "Robert Taylor",
    email: "robert.taylor@airline.com",
    phone: "+1 (555) 789-0123",
    registration: "Jun 5, 2024",
    lastActive: "2 weeks ago",
    status: "Suspended",
    bookingStats: { total: 7, totalSpent: 3200, cancelled: 1, avgBooking: 457 },
  },
  {
    id: 7,
    name: "Amanda Lee",
    email: "amanda.lee@airline.com",
    phone: "+1 (555) 456-7890",
    registration: "Jul 18, 2024",
    lastActive: "30 minutes ago",
    status: "Active",
    bookingStats: { total: 4, totalSpent: 1800, cancelled: 0, avgBooking: 450 },
  },
  {
    id: 8,
    name: "James Brown",
    email: "james.brown@airline.com",
    phone: "+1 (555) 234-5678",
    registration: "Aug 2, 2024",
    lastActive: "6 hours ago",
    status: "Active",
    bookingStats: { total: 6, totalSpent: 2700, cancelled: 0, avgBooking: 450 },
  },
];

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_AUTH_PREFIX =
  import.meta.env.VITE_API_AUTH_PREFIX || `${API_BASE_URL}/auth/admin`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Utility function to transform image URLs from API responses
export const transformImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  try {
    // Extract the file path from the URL (e.g., /files/public/content/filename.jpg)
    const url = new URL(imageUrl);
    const filePath = url.pathname; // Gets the path part
    
    // Get the base domain from API_BASE_URL
    // e.g., https://flyqm.com/api -> https://flyqm.com
    const apiUrl = new URL(API_BASE_URL);
    const baseDomain = `${apiUrl.protocol}//${apiUrl.hostname}`;
    
    // Construct the correct image URL
    const transformedUrl = `${baseDomain}${filePath}`;
    
    return transformedUrl;
  } catch (error) {
    return imageUrl; // Fallback to original URL if transformation fails
  }
};

export const loginUser = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await apiClient.post(`${API_AUTH_PREFIX}/token`, formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return {
    token: response.data.access_token || response.data.token,
    user: response.data.admin || response.data.user,
  };
};

export const getAllBookings = async (params = {}) => {
  const response = await apiClient.get("/admin/bookings", { params });
  return response.data?.data ?? response.data;
};

export const getBookingById = async (bookingId) => {
  const response = await apiClient.get(`/admin/bookings/${bookingId}`);
  return response.data?.data ?? response.data;
};

export const deleteBooking = async (bookingId) => {
  const response = await apiClient.delete(`/admin/bookings/${bookingId}`);
  return response.data?.data ?? response.data;
};

export const updateBookingStatus = async (bookingId, newStatus, updatedBy) => {
  const response = await apiClient.put(`/admin/bookings/${bookingId}`, {
    booking_id: bookingId,
    status: newStatus, 
    updated_by: updatedBy,
  });
  return response.data?.data ?? response.data;
};

export const updateBookingPaymentStatus = async (
  bookingId,
  paymentStatus,
  updatedBy
) => {
  const response = await apiClient.put(
    `/admin/bookings/${bookingId}/payment-status`,
    {
      booking_id: bookingId,
      payment_status: paymentStatus,
      updated_by: updatedBy,
    }
  );
  return response.data?.data ?? response.data;
};

export const uploadBookingTicket = async (
  bookingId,
  file,
  uploadedBy,
  status = "CONFIRMED"
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("booking_id", bookingId);
  formData.append("status", status);
  formData.append("uploaded_by", uploadedBy);

  const response = await apiClient.put(
    `/admin/bookings/${bookingId}/upload-ticket`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data?.data ?? response.data;
};


// Replace booking ticket file using booking_id
export const replaceBookingTicketFile = async (bookingId, file, updatedBy) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("updated_by", updatedBy);

  const response = await apiClient.put(
    `/files/replace/${bookingId}`,  // Remove /api prefix
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data?.data ?? response.data;
};

// Delete booking ticket file using booking_id
export const deleteBookingTicketFile = async (bookingId, deletedBy) => {
  const response = await apiClient.delete(`/files/${bookingId}`, {  // Remove /api prefix
    data: { deleted_by: deletedBy },
  });
  return response.data?.data ?? response.data;
};

// Get a secure ticket download
export const getSecureTicket = async (bookingId) => {
  const response = await apiClient.get(`/secure/tickets/${bookingId}`, {
    responseType: "blob",
  });
  return response.data;
};

// Check ticket status
export const getTicketStatus = async (bookingId) => {
  const response = await apiClient.get(`/files/status/${bookingId}`);
  return response.data?.data ?? response.data;
};

// Get booking audit history
export const getBookingAudit = async (bookingId) => {
  const response = await apiClient.get(`/admin/bookings/${bookingId}/audit`);
  return response.data?.data ?? response.data;
};


// User CRUD (promise-based, fake delay)
export const getAllCustomers = async (params = {}) => {
  const response = await apiClient.get("/admin/customers", { params });
  return response.data?.data ?? response.data;
};

export const getCustomerById = async (customerId) => {
  const response = await apiClient.get(`/admin/customers/${customerId}`);
  return response.data?.data ?? response.data;
};

export const updateCustomer = async (customerId, updates) => {
  const response = await apiClient.patch(`/admin/customers/${customerId}`, updates);
  return response.data?.data ?? response.data;
};

export const deactivateCustomer = async (customerId) => {
  const response = await apiClient.patch(`/admin/customers/${customerId}/deactivate`);
  return response.data?.data ?? response.data;
};

export const activateCustomer = async (customerId) => {
  const response = await apiClient.patch(`/admin/customers/${customerId}/activate`);
  return response.data?.data ?? response.data;
};

// Staff CRUD Operations

export const createStaffUser = async (name, email, password) => {
  const response = await apiClient.post(`${API_AUTH_PREFIX}/signup`, {
    name,
    email,
    password,
    role: "STAFF",
  });

  return {
    token: response.data.access_token || response.data.token,
    user: response.data.admin || response.data.user,
  };
};
export default API_BASE_URL;

export const getAllStaff = async (params = {}) => {
  const response = await apiClient.get("/admin/staff", { params });
  return response.data?.data ?? response.data;
};

export const getStaffById = async (staffId) => {
  const response = await apiClient.get("/admin/staff/" + staffId);
  return response.data?.data ?? response.data;
};

export const updateStaff = async (staffId, staffData) => {
  const response = await apiClient.patch("/admin/staff/" + staffId, staffData);
  return response.data?.data ?? response.data;
};

export const deleteStaffById = async (staffId) => {
  const response = await apiClient.delete("/admin/staff/" + staffId);
  return response.data?.data ?? response.data;
};

export const deactivateStaff = async (staffId) => {
  const response = await apiClient.patch("/admin/staff/" + staffId + "/deactivate");
  return response.data?.data ?? response.data;
};

export const activateStaff = async (staffId) => {
  const response = await apiClient.patch("/admin/staff/" + staffId + "/activate");
  return response.data?.data ?? response.data;
};


// Flight CRUD Operations

// Create a new flight price override
export const createFlightOverride = async (flightData, durationHours = 1) => {
  const snapshot = flightData.flight_snapshot || {};
  const isRoundTrip = flightData.type === "ROUND_TRIP";  
  // Extract from the correct location based on flight type
  const leg = isRoundTrip ? snapshot.outbound : snapshot;
  
  const departureDate = leg?.departure_time?.split('T')[0] || '';
  
  const payload = {
    airline_code: leg?.airline_code,
    flight_number: leg?.flight_number,
    departure_date: departureDate,
    override_price_usd: flightData.base_price_usd,
    duration_hours: durationHours,
  };
   
  const response = await apiClient.post("/admin/price-overrides", payload);
  return response.data?.data ?? response.data;
};

// List all flight price overrides
export const getAllFlightOverrides = async () => {
  const response = await apiClient.get("/admin/price-overrides");
  return response.data?.data ?? response.data;
};

// Disable (deactivate) a flight price override
export const disableFlightOverride = async (overrideId) => {
  const response = await apiClient.delete(`/admin/price-overrides/${overrideId}`);
  return response.data?.data ?? response.data;
};

// Flight Search Operations
export const searchFlights = async (origin, destination, departureDate) => {
  try {
    const response = await apiClient.get("/flights/search", {
      params: {
        origin,
        destination,
        departure_date: departureDate,
      },
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to search flights"
    );
  }
};

export const searchRoundTripFlights = async (
  origin,
  destination,
  departureDate,
  returnDate
) => {
  try {
    const response = await apiClient.get("/flights/search-round-trip", {
      params: {
        origin,
        destination,
        departure_date: departureDate,
        return_date: returnDate,
      },
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to search round-trip flights"
    );
  }
};

// Get current exchange rate
export const getExchangeRate = async () => {
  const response = await apiClient.get("/admin/exchange-rate");
  const data = response.data?.data ?? response.data;
  return data;
};

// Update exchange rate
export const updateExchangeRate = async (usdToMmkRate) => {
  const response = await apiClient.put("/admin/exchange-rate", {
    usd_to_mmk: String(usdToMmkRate)
  });
  return response.data?.data ?? response.data;
};

export const getPricingConfig = async () => {
  const response = await apiClient.get("/admin/pricing-config");
  return response.data?.data ?? response.data;
};

export const updatePricingConfig = async (percentage) => {
  const response = await apiClient.put("/admin/pricing-config", {
    global_markup_percentage: percentage
  });
  return response.data?.data ?? response.data;
};

// Content Management - Background Image
export const getBackgroundImage = async () => {
  const response = await apiClient.get("/content/background");
  return response.data?.data ?? response.data;
};

export const updateBackgroundImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.put(
    "/content/background",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data?.data ?? response.data;
};

// Content Management - Banners
export const getAllBanners = async () => {
  const response = await apiClient.get("/content/banners");
  return response.data?.data ?? response.data;
};

export const createBanner = async (file, title, destinationCode, priority) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("destination_code", destinationCode);
  formData.append("priority", priority);

  const response = await apiClient.post(
    "/content/banners",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data?.data ?? response.data;
};

export const updateBanner = async (bannerId, updates) => {
  const formData = new FormData();
  
  if (updates.file) formData.append("file", updates.file);
  if (updates.title) formData.append("title", updates.title);
  if (updates.destinationCode) formData.append("destination_code", updates.destinationCode);
  if (updates.priority) formData.append("priority", updates.priority);
  if (updates.isActive !== undefined) formData.append("is_active", updates.isActive);

  const response = await apiClient.put(
    `/content/banners/${bannerId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data?.data ?? response.data;
};

export const deactivateBanner = async (bannerId) => {
  const response = await apiClient.delete(`/content/banners/${bannerId}`);
  return response.data?.data ?? response.data;
};


// Export Mock Data
// =====================

export { mockUsers };
