import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllBookings,
  deleteBooking,
  updateBookingStatus,
  updateBookingPaymentStatus,
  uploadBookingTicket,
  getTicketStatus,
} from "../../config/api";

const BOOKING_STATUS_OPTIONS = [
  "PROCESSING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

const PAYMENT_STATUS_OPTIONS = ["PENDING", "PAID", "FAILED"];

export default function BookingManagement() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [ticketFiles, setTicketFiles] = useState({});
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadConfirmation, setUploadConfirmation] = useState(null);
  const [ticketStatusModal, setTicketStatusModal] = useState({
    isOpen: false,
    data: null,
    loading: false,
  });
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);

  const adminEmail = "admin@example.com";

  useEffect(() => {
    let mounted = true;

    const fetchBookings = async () => {
      try {
        const data = await getAllBookings();
        if (mounted) {
          setBookings(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to fetch bookings");
          setLoading(false);
        }
      }
    };

    fetchBookings();

    return () => {
      mounted = false;
    };
  }, []);

  const handleBookingStatusChange = async (bookingId, newStatus) => {
    try {
      setUpdatingBookingId(bookingId);
      await updateBookingStatus(bookingId, newStatus, adminEmail);

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId ? { ...b, status: newStatus } : b
        )
      );
    } catch (err) {
      alert("Failed to update booking status: " + (err.message || "Unknown error"));
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handlePaymentStatusChange = async (bookingId, newPaymentStatus) => {
    try {
      setUpdatingBookingId(bookingId);
      await updateBookingPaymentStatus(bookingId, newPaymentStatus, adminEmail);

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId
            ? { ...b, payment_status: newPaymentStatus }
            : b
        )
      );
    } catch (err) {
      alert("Failed to update payment status: " + (err.message || "Unknown error"));
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleTicketInputChange = (bookingId, file) => {
    setTicketFiles((prev) => ({ ...prev, [bookingId]: file }));
  };

  const handleUploadConfirmation = (booking) => {
    const bookingId = booking.booking_id;
    const file = ticketFiles[bookingId];

    if (!file) {
      alert("Please select a ticket file");
      return;
    }

    // Show confirmation dialog
    setUploadConfirmation({
      bookingId,
      fileName: file.name,
      booking,
    });
  };

  const cancelUpload = () => {
    setUploadConfirmation(null);
  };

  const confirmUpload = async () => {
    if (!uploadConfirmation) return;

    const { bookingId, booking } = uploadConfirmation;
    const file = ticketFiles[bookingId];

    try {
      setUpdatingBookingId(bookingId);
      const response = await uploadBookingTicket(
        bookingId,
        file,
        adminEmail,
        "CONFIRMED"
      );

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId
            ? {
                ...b,
                ticket_file_url: response.file_url || response.ticket_file_url,
                original_ticket_name: response.original_name,
                status: "CONFIRMED",
              }
            : b
        )
      );

      setTicketFiles((prev) => ({ ...prev, [bookingId]: null }));
      setUploadConfirmation(null);

      // Fetch and display ticket status
      await fetchAndShowTicketStatus(bookingId);
    } catch (err) {
      alert("Failed to upload ticket: " + (err.message || "Unknown error"));
      setUploadConfirmation(null);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const fetchAndShowTicketStatus = async (bookingId) => {
    try {
      setTicketStatusModal((prev) => ({
        ...prev,
        isOpen: true,
        loading: true,
      }));

      const ticketStatusData = await getTicketStatus(bookingId);
      console.log("Ticket Status Data:", ticketStatusData);

      setTicketStatusModal((prev) => ({
        ...prev,
        data: ticketStatusData,
        loading: false,
      }));
    } catch (err) {
      alert("Failed to fetch ticket status: " + (err.message || "Unknown error"));
      setTicketStatusModal((prev) => ({
        ...prev,
        isOpen: false,
        loading: false,
      }));
    }
  };

  const closeTicketStatusModal = () => {
    setTicketStatusModal({
      isOpen: false,
      data: null,
      loading: false,
    });
  };

  const handleDeleteConfirmation = (bookingId) => {
    setDeleteConfirmationId(bookingId);
  };

  const confirmDelete = async (bookingId) => {
    try {
      setUpdatingBookingId(bookingId);
      await deleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.booking_id !== bookingId));
      setDeleteConfirmationId(null);
    } catch (err) {
      alert("Failed to delete booking: " + (err.message || "Unknown error"));
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationId(null);
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

  const extractTravelDate = (booking) => {
    try {
      // Check for round trip (outbound/inbound)
      const outboundTime = booking.flight_snapshot?.outbound?.departure_time;
      const inboundTime = booking.flight_snapshot?.inbound?.departure_time;

      if (outboundTime) {
        const outboundDate = new Date(outboundTime).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        if (inboundTime) {
          const inboundDate = new Date(inboundTime).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return `${outboundDate} - ${inboundDate}`;
        }

        return outboundDate;
      }

      // Fallback for one-way flights
      const departureTime = booking.flight_snapshot?.departure_time;
      if (departureTime) {
        return new Date(departureTime).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }

      return "-";
    } catch {
      return "-";
    }
  };

  const extractRoute = (booking) => {
    const outboundRoute = booking.flight_snapshot?.outbound?.route;
    const inboundRoute = booking.flight_snapshot?.inbound?.route;
    const onewayRoute = booking.flight_snapshot?.route;

    if (inboundRoute) {
      return `${outboundRoute} / ${inboundRoute}`;
    }

    return onewayRoute || "-";
  };

  if (loading) {
    return <div className="p-6 text-center">Loading bookings...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

return (
  <div className="p-4">
    <div className="bg-white border border-blue-200 rounded-2xl shadow-md overflow-hidden">
      {/* Filters */}
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Search Bookings
            </label>
            <input
              className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Booking ID, Customer name, Email..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none">
              <option>Select Status</option>
              {BOOKING_STATUS_OPTIONS.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Route
            </label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none">
              <option>Select Route</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none">
              <option>Select date range</option>
            </select>
          </div>

          <button className="bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium shadow hover:bg-blue-600 transition">
            Apply Filters
          </button>
        </div>

        <div className="mt-5">
          <h2 className="text-lg font-semibold text-gray-800">All Bookings</h2>
          <p className="text-sm text-gray-500">Showing all bookings</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-50 border-y border-blue-200 text-gray-600 text-xs uppercase tracking-wide flex-shrink-0 items-center">
            <tr>
              <th className="px-4 py-3 text-left">Booking ID ↓</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Route</th>
              <th className="px-4 py-3 text-left">Travel Date</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Booking Status</th>
              <th className="px-4 py-3 text-left">Payment Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {bookings.map((booking) => {
              const isUpdating = updatingBookingId === booking.booking_id;
              const paymentStatus = (booking.payment_status || "").toUpperCase();
              const bookingStatus = (booking.status || "").toUpperCase();
              const hasTicketUrl = Boolean(
                booking.ticket_file_url || booking.ticket_url || booking.ticketUrl
              );

              const showTicketUpload =
                paymentStatus === "PAID" &&
                bookingStatus === "PROCESSING" &&
                !hasTicketUrl;

              return (
                <tr key={booking.booking_id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {booking.booking_code}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {booking.user.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-[12px]">
                    {booking.user.email}
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-[12px]">
                    {extractRoute(booking)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-[14px]">
                    {extractTravelDate(booking)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    ${booking.final_price_usd?.toFixed(2) || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <select
                      disabled={isUpdating}
                      value={booking.status || "PROCESSING"}
                      onChange={(e) =>
                        handleBookingStatusChange(booking.booking_id, e.target.value)
                      }
                      className={getStatusStyle(booking.status)}
                    >
                      {BOOKING_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <select
                      disabled={isUpdating}
                      value={booking.payment_status || "PENDING"}
                      onChange={(e) =>
                        handlePaymentStatusChange(booking.booking_id, e.target.value)
                      }
                      className={getPaymentStatusStyle(booking.payment_status)}
                    >
                      {PAYMENT_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    {showTicketUpload && (
                      <div className="mt-2 flex gap-1">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.zip"
                          onChange={(e) =>
                            handleTicketInputChange(
                              booking.booking_id,
                              e.target.files?.[0]
                            )
                          }
                          className="border rounded px-2 py-1 text-xs flex-1 min-w-0"
                        />
                        <button
                          disabled={isUpdating || !ticketFiles[booking.booking_id]}
                          onClick={() => handleUploadConfirmation(booking)}
                          className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap"
                        >
                          Upload
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">

                      {/* View */}
                      <button
                        onClick={() => navigate(`/admin/bookings/${booking.booking_id}`)}
                        className="w-8 h-8 flex items-center justify-center border border-blue-200 rounded-lg text-gray-600 hover:bg-blue-50 transition"
                        title="View"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() =>
                          navigate(`/admin/bookings/${booking.booking_id}/booking-edit`)
                        }
                        className="w-8 h-8 flex items-center justify-center border border-blue-200 rounded-lg text-gray-600 hover:bg-blue-50 transition"
                        title="Edit"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 5h2M12 20h9"
                          />
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 5.487l1.65 1.65a2.121 2.121 0 010 3l-9.193 9.193-3.536.707.707-3.536 9.193-9.193a2.121 2.121 0 013 0z"
                          />
                        </svg>
                      </button>
                      <div className="flex gap-1 items-center">
                        {deleteConfirmationId !== booking.booking_id ? (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleDeleteConfirmation(booking.booking_id)}
                          className="w-8 h-8 flex items-center justify-center border border-blue-200 rounded-lg text-red-500 hover:bg-red-50 transition disabled:opacity-60"
                          title="Delete"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 7h12M9 7v12m6-12v12M10 4h4a1 1 0 011 1v2H9V5a1 1 0 011-1zM5 7h14l-1 14H6L5 7z"
                            />
                          </svg>
                        </button>
                        ) : (
                          <>
                            <button
                              disabled={isUpdating}
                              onClick={() => cancelDelete()}
                              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-60 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => confirmDelete(booking.booking_id)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60 transition-colors"
                            >
                              {isUpdating ? "Deleting..." : "Delete"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Upload Confirmation Dialog */}
      {uploadConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Confirm Upload</h2>
            <p className="text-gray-700 mb-2">File: <span className="font-medium">{uploadConfirmation.fileName}</span></p>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to upload this ticket file? This will update the booking status to CONFIRMED.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelUpload}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpload}
                disabled={updatingBookingId !== null}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 font-medium"
              >
                {updatingBookingId ? "Uploading..." : "Confirm Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Status Modal */}
      {ticketStatusModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            {ticketStatusModal.loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Verifying ticket upload...</p>
              </div>
            ) : (
              <div className="text-center">
                {/* Success Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="bg-green-100 rounded-full p-3">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Ticket Uploaded Successfully
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Your ticket file has been uploaded and verified.
                </p>

                {/* Ticket Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      Upload Time
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date().toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      Status
                    </p>
                    <p className="text-sm font-medium text-green-600">Confirmed</p>
                  </div>
                </div>

                <button
                  onClick={closeTicketStatusModal}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
