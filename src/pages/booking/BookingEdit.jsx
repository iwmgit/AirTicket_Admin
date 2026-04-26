import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBookingById,
  replaceBookingTicketFile,
  deleteBookingTicketFile,
  uploadBookingTicket,
  getTicketStatus,
} from "../../config/api";

export default function BookingEdit() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [ticketFile, setTicketFile] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [ticketStatus, setTicketStatus] = useState(null);

  const adminEmail = "admin@example.com";

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

  const handleTicketFileChange = (e) => {
    setTicketFile(e.target.files?.[0] || null);
    setSuccessMessage(null);
  };

  const handleUploadFileChange = (e) => {
    setUploadFile(e.target.files?.[0] || null);
    setSuccessMessage(null);
  };

  const handleReplaceTicket = async () => {
    if (!ticketFile) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      await replaceBookingTicketFile(bookingId, ticketFile, adminEmail);

      const updatedBooking = await getBookingById(bookingId);
      setBooking(updatedBooking);
      
      const status = await getTicketStatus(bookingId);
      setTicketStatus(status);
      
      setTicketFile(null);
      setSuccessMessage("Ticket file replaced successfully");

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to replace ticket file: " + (err.message || "Unknown error"));
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadNewTicket = async () => {
    if (!uploadFile) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      await uploadBookingTicket(bookingId, uploadFile, adminEmail, "CONFIRMED");

      const updatedBooking = await getBookingById(bookingId);
      setBooking(updatedBooking);
      
      const status = await getTicketStatus(bookingId);
      setTicketStatus(status);
      
      setUploadFile(null);
      setSuccessMessage("Ticket file uploaded successfully");

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to upload ticket file: " + (err.message || "Unknown error"));
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
      setError(null);
      await deleteBookingTicketFile(bookingId, adminEmail);

      const updatedBooking = await getBookingById(bookingId);
      setBooking(updatedBooking);
      
      const status = await getTicketStatus(bookingId);
      setTicketStatus(status);
      
      setSuccessMessage("Ticket file deleted successfully");

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to delete ticket file: " + (err.message || "Unknown error"));
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
      <div className="bg-white border border-blue-200 rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Booking</h1>
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
          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              ❌ {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
              ✓ {successMessage}
            </div>
          )}

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
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ticket File Management</h2>

            {/* Current Ticket File Info */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Current Ticket File</p>
              {ticketStatus ? (
                ticketStatus.has_ticket ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">
                      ✓ Uploaded
                    </span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">
                        {new Date(ticketStatus.ticket_uploaded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium border border-yellow-200">
                      ⚠ Not Uploaded
                    </span>
                  </div>
                )
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 animate-pulse">Loading...</p>
                </div>
              )}
            </div>

            {/* Upload New Ticket Section */}
            {!hasTicketUrl && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Upload Ticket File</h3>
                <p className="text-xs text-gray-600 mb-4">
                  Upload a new ticket file for this booking
                </p>

                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.zip"
                    onChange={handleUploadFileChange}
                    disabled={updating}
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={handleUploadNewTicket}
                    disabled={updating || !uploadFile}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {updating ? "Uploading..." : "Upload"}
                  </button>

                  {uploadFile && (
                    <p className="text-xs text-gray-600">
                      File selected: <span className="font-medium">{uploadFile.name}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Replace Ticket File Section */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Replace Ticket File</h3>
              <p className="text-xs text-gray-600 mb-4">
                Select a new file to replace the current ticket
              </p>

              <div className="space-y-3">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.zip"
                  onChange={handleTicketFileChange}
                  disabled={updating}
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={handleReplaceTicket}
                  disabled={updating || !ticketFile}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {updating ? "Uploading..." : "Replace"}
                </button>

                {ticketFile && (
                  <p className="text-xs text-gray-600">
                    File selected: <span className="font-medium">{ticketFile.name}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Delete Ticket File Section */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Delete Ticket File</h3>
              <p className="text-xs text-gray-600 mb-4">
                This action will permanently delete the ticket file. This cannot be undone.
              </p>
              <button
                onClick={handleDeleteTicket}
                disabled={updating}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {updating ? "Deleting..." : "Delete Ticket File"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}