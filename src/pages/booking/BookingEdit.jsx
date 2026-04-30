import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBookingById,
  replaceBookingTicketFile,
  deleteBookingTicketFile,
  uploadBookingTicket,
  getTicketStatus,
} from "../../config/api";
import Notification from "../../components/Notification";
import { useAuth } from "../../contexts/AuthContext";

export default function BookingEdit() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [ticketFile, setTicketFile] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "success" });
  const [ticketStatus, setTicketStatus] = useState(null);

  const adminEmail = user?.email || user?.name || "unknown";

  useEffect(() => {
    let mounted = true;

    const fetchBooking = async () => {
      try {
        const data = await getBookingById(bookingId);
        if (mounted) {
          setBooking(data);
          setLoading(false);
          
          try {
            const status = await getTicketStatus(bookingId);
            if (mounted) {
              setTicketStatus(status);
            }
          } catch (err) {
            console.log("Could not fetch ticket status:", err.message);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to fetch booking details");
          setLoading(false);
        }
      }
    };

    fetchBooking();

    return () => {
      mounted = false;
    };
  }, [bookingId]);

  const ALLOWED_TICKET_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  const MAX_FILE_SIZE_MB = 10;

  const validateTicketFile = (file) => {
    if (!ALLOWED_TICKET_TYPES.includes(file.type)) {
      setNotification({ message: "Only PDF, JPG, PNG, and WEBP files are allowed.", type: "error" });
      return false;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setNotification({ message: `File size must not exceed ${MAX_FILE_SIZE_MB}MB.`, type: "error" });
      return false;
    }
    return true;
  };

  const handleTicketFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && !validateTicketFile(file)) {
      e.target.value = "";
      setTicketFile(null);
      return;
    }
    setTicketFile(file);
    setNotification({ message: "", type: "success" });
  };

  const handleUploadFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && !validateTicketFile(file)) {
      e.target.value = "";
      setUploadFile(null);
      return;
    }
    setUploadFile(file);
    setNotification({ message: "", type: "success" });
  };

  const handleReplaceTicket = async () => {
    if (!ticketFile) {
      setNotification({ message: "Please select a file to upload", type: "error" });
      return;
    }

    try {
      setUpdating(true);
      await replaceBookingTicketFile(bookingId, ticketFile, adminEmail);

      const updatedBooking = await getBookingById(bookingId);
      setBooking(updatedBooking);
      
      const status = await getTicketStatus(bookingId);
      setTicketStatus(status);
      
      setTicketFile(null);
      setNotification({ message: "Ticket file replaced successfully", type: "success" });
    } catch (err) {
      setNotification({ message: "Failed to replace ticket file: " + (err.message || "Unknown error"), type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadNewTicket = async () => {
    if (!uploadFile) {
      setNotification({ message: "Please select a file to upload", type: "error" });
      return;
    }

    try {
      setUpdating(true);
      await uploadBookingTicket(bookingId, uploadFile, adminEmail, "CONFIRMED");

      const updatedBooking = await getBookingById(bookingId);
      setBooking(updatedBooking);
      
      const status = await getTicketStatus(bookingId);
      setTicketStatus(status);
      
      setUploadFile(null);
      setNotification({ message: "Ticket file uploaded successfully", type: "success" });
    } catch (err) {
      setNotification({ message: "Failed to upload ticket file: " + (err.message || "Unknown error"), type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTicket = async () => {
    const ok = window.confirm(
      "Are you sure you want to delete the ticket file for this booking?"
    );
    if (!ok) return;

    try {
      setUpdating(true);
      await deleteBookingTicketFile(bookingId, adminEmail);

      const updatedBooking = await getBookingById(bookingId);
      setBooking(updatedBooking);
      
      const status = await getTicketStatus(bookingId);
      setTicketStatus(status);
      
      setNotification({ message: "Ticket file deleted successfully", type: "success" });
    } catch (err) {
      setNotification({ message: "Failed to delete ticket file: " + (err.message || "Unknown error"), type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusStyle = (status) => {
    const base = "inline-block px-2.5 py-1 text-xs font-medium rounded-full border";

    switch ((status || "").toUpperCase()) {
      case "PROCESSING":
        return base + " bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CONFIRMED":
        return base + " bg-green-100 text-green-800 border-green-200";
      case "COMPLETED":
        return base + " bg-blue-100 text-blue-800 border-blue-200";
      case "CANCELLED":
        return base + " bg-red-100 text-red-800 border-red-200";
      default:
        return base + " bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusStyle = (status) => {
    const base = "inline-block px-2.5 py-1 text-xs font-medium rounded-full border";

    switch ((status || "").toUpperCase()) {
      case "PAID":
        return base + " bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return base + " bg-yellow-100 text-yellow-800 border-yellow-200";
      case "FAILED":
        return base + " bg-red-100 text-red-800 border-red-200";
      default:
        return base + " bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading booking details...</div>;
  }

  if (error && !booking) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  if (!booking) {
    return <div className="p-6 text-center">Booking not found</div>;
  }

  const hasTicketUrl = ticketStatus?.has_ticket || Boolean(
    booking.ticket_file_url || booking.ticket_url || booking.ticketUrl
  );

  return (
    <div className="p-4">
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ message: "", type: "success" })}
      />
      <div className="bg-white border border-blue-200 rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Ticket</h1>
              <p className="text-sm text-gray-600 mt-1">{booking.booking_code}</p>
            </div>
            <button
              onClick={() => navigate(`/admin/bookings/${bookingId}`)}
              className="px-4 py-2 border border-blue-200 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition"
            >
              View Booking
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">

          {/* Booking Details Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Booking ID</p>
                <p className="text-sm font-medium text-gray-900">{booking.booking_code}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Customer</p>
                <p className="text-sm font-medium text-gray-900">{booking.user?.name || "-"}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900">{booking.user?.email || "-"}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Amount (USD)</p>
                <p className="text-sm font-medium text-gray-900">
                  ${booking.final_price_usd?.toFixed(2) || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Status</p>
                <div className={getStatusStyle(booking.status)}>
                  {booking.status || "PROCESSING"}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Payment Status</p>
                <div className={getPaymentStatusStyle(booking.payment_status)}>
                  {booking.payment_status || "PENDING"}
                </div>
              </div>
            </div>
          </section>

          {/* Ticket File Management Section */}
          <section className="border-t border-blue-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Ticket File Management</h2>

              {/* Current ticket status badge */}
              {ticketStatus ? (
                ticketStatus.has_ticket ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span className="text-xs font-medium text-green-700">Ticket uploaded</span>
                    {ticketStatus.ticket_uploaded_at && (
                      <span className="text-xs text-gray-400">
                        · {new Date(ticketStatus.ticket_uploaded_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <svg className="w-3.5 h-3.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    </svg>
                    <span className="text-xs font-medium text-yellow-700">No ticket uploaded</span>
                  </div>
                )
              ) : (
                <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-xs text-gray-400 animate-pulse">Checking...</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Upload Card */}
              <div className={`flex flex-col rounded-xl border overflow-hidden ${hasTicketUrl ? "border-gray-200 opacity-50 pointer-events-none" : "border-blue-200"}`}>
                <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                  <p className="text-sm font-semibold text-gray-800">Upload Ticket</p>
                  <p className="text-xs text-gray-500 mt-0.5">Add a new ticket file</p>
                </div>
                <div className="flex flex-col flex-1 p-4 gap-3 bg-white">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.zip"
                    onChange={handleUploadFileChange}
                    disabled={updating || hasTicketUrl}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {uploadFile && (
                    <p className="text-xs text-gray-500 truncate">
                      <span className="font-medium">{uploadFile.name}</span>
                    </p>
                  )}
                  <button
                    onClick={handleUploadNewTicket}
                    disabled={updating || !uploadFile || hasTicketUrl}
                    className="mt-auto w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {updating ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>

              {/* Replace Card */}
              <div className="flex flex-col rounded-xl border border-blue-200 overflow-hidden">
                <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                  <p className="text-sm font-semibold text-gray-800">Replace Ticket</p>
                  <p className="text-xs text-gray-500 mt-0.5">Swap the existing file</p>
                </div>
                <div className="flex flex-col flex-1 p-4 gap-3 bg-white">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.zip"
                    onChange={handleTicketFileChange}
                    disabled={updating}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {ticketFile && (
                    <p className="text-xs text-gray-500 truncate">
                      <span className="font-medium">{ticketFile.name}</span>
                    </p>
                  )}
                  <button
                    onClick={handleReplaceTicket}
                    disabled={updating || !ticketFile}
                    className="mt-auto w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {updating ? "Uploading..." : "Replace"}
                  </button>
                </div>
              </div>

              {/* Delete Card */}
              <div className="flex flex-col rounded-xl border border-blue-200 overflow-hidden">
                <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                  <p className="text-sm font-semibold text-gray-800">Delete Ticket</p>
                  <p className="text-xs text-gray-500 mt-0.5">Remove permanently</p>
                </div>
                <div className="flex flex-col flex-1 p-4 bg-white">
                  <p className="text-xs text-gray-500 mb-4 flex-1">
                    This will permanently delete the ticket file for this booking. This action cannot be undone.
                  </p>
                  <button
                    onClick={handleDeleteTicket}
                    disabled={updating}
                    className="mt-auto w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {updating ? "Deleting..." : "Delete Ticket File"}
                  </button>
                </div>
              </div>

            </div>
          </section>
        </div>
      </div>
    </div>
  );
}