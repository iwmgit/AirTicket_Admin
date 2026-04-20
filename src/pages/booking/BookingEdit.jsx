import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getBookingById,
  replaceBookingTicketFile,
  deleteBookingTicketFile,
  uploadBookingTicket,
  getTicketStatus,
} from "../../config/api";

export default function BookingEdit() {
  const { bookingId } = useParams();
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
          
          // Fetch ticket status
          try {
            const status = await getTicketStatus(bookingId);
            if (mounted) {
              setTicketStatus(status);
            }
          } catch (err) {
            // Ticket status fetch failed, but don't block booking view
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

      // Refresh booking data and ticket status to get updated info
      const updatedBooking = await getBookingById(bookingId);
      setBooking(updatedBooking);
      
      const status = await getTicketStatus(bookingId);
      setTicketStatus(status);
      
      setTicketFile(null);
      setSuccessMessage("Ticket file replaced successfully");

      // Clear success message after 3 seconds
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

      // Refresh booking data and ticket status to get updated info
      const updatedBooking = await getBookingById(bookingId);
      setBooking(updatedBooking);
      
      const status = await getTicketStatus(bookingId);
      setTicketStatus(status);
      
      setUploadFile(null);
      setSuccessMessage("Ticket file uploaded successfully");

      // Clear success message after 3 seconds
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

      // Refresh booking data and ticket status to reflect deletion
      const updatedBooking = await getBookingById(bookingId);
      setBooking(updatedBooking);
      
      const status = await getTicketStatus(bookingId);
      setTicketStatus(status);
      
      setSuccessMessage("Ticket file deleted successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to delete ticket file: " + (err.message || "Unknown error"));
    } finally {
      setUpdating(false);
    }
  };

  const getStatusStyle = (status) => {
    const base =
      "inline-block px-2.5 py-1 text-xs font-medium rounded-full border bg-white";

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
    const base =
      "inline-block px-2.5 py-1 text-xs font-medium rounded-full border bg-white";

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
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {successMessage}
        </div>
      )}

      {/* Booking Details Section */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Booking Details</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 text-sm">Booking ID</p>
            <p className="font-medium">{booking.booking_code}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Customer</p>
            <p className="font-medium">{booking.user?.name || "-"}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="font-medium">{booking.user?.email || "-"}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Amount</p>
            <p className="font-medium">
              ${booking.final_price_usd?.toFixed(2) || "-"}
            </p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Status</p>
            <p className={getStatusStyle(booking.status)}>
              {booking.status || "PROCESSING"}
            </p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Payment Status</p>
            <p className={getPaymentStatusStyle(booking.payment_status)}>
              {booking.payment_status || "PENDING"}
            </p>
          </div>
        </div>
      </div>

      {/* Ticket File Management Section */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Ticket File Management</h2>

        {/* Current Ticket File Info */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-2">Current Ticket File</p>
          {ticketStatus ? (
            ticketStatus.has_ticket ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded">
                <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                   Uploaded
                </span>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">
                    {new Date(ticketStatus.ticket_uploaded_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                   Not Uploaded
                </span>
              </div>
            )
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm text-gray-600 animate-pulse">Loading...</p>
            </div>
          )}
        </div>

        {/* Upload New Ticket Section */}
        {!hasTicketUrl && (
          <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="font-medium text-sm">Upload Ticket File</h3>
            <p className="text-xs text-gray-600">
              Upload a new ticket file for this booking
            </p>

            <div className="flex gap-2">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.zip"
                onChange={handleUploadFileChange}
                disabled={updating}
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button
                onClick={handleUploadNewTicket}
                disabled={updating || !uploadFile}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {updating ? "Uploading..." : "Upload"}
              </button>
            </div>

            {uploadFile && (
              <p className="text-xs text-gray-600">
                File selected: <span className="font-medium">{uploadFile.name}</span>
              </p>
            )}
          </div>
        )}

        {/* Replace Ticket File Section */}
        <div className="space-y-3 p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="font-medium text-sm">Replace Ticket File</h3>
          <p className="text-xs text-gray-600">
            Select a new file to replace the current ticket
          </p>

          <div className="flex gap-2">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.zip"
              onChange={handleTicketFileChange}
              disabled={updating}
              className="flex-1 border rounded px-3 py-2 text-sm"
            />
            <button
              onClick={handleReplaceTicket}
              disabled={updating || !ticketFile}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {updating ? "Uploading..." : "Replace"}
            </button>
          </div>

          {ticketFile && (
            <p className="text-xs text-gray-600">
              File selected: <span className="font-medium">{ticketFile.name}</span>
            </p>
          )}
        </div>


        {/* Delete Ticket File Section */}

          <div className="mt-4 p-4 bg-gray-50 rounded border border-red-200">
            <h3 className="font-medium text-sm text-gray-900 mb-2">
              Delete Ticket File
            </h3>
            <p className="text-xs text-gray-700 mb-3">
              This action will permanently delete the ticket file. This cannot be undone.
            </p>
            <button
              onClick={handleDeleteTicket}
              disabled={updating}
              className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {updating ? "Deleting..." : "Delete Ticket File"}
            </button>
          </div>
        </div>
    </div>
  );
}