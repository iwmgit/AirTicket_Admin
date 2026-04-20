import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllBookings,
  deleteBooking,
  updateBookingStatus,
  updateBookingPaymentStatus,
  uploadBookingTicket,
  getSecureTicket,
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

  const handleUploadTicket = async (booking) => {
    const bookingId = booking.booking_id;
    const file = ticketFiles[bookingId];

    if (!file) {
      alert("Please select a ticket file");
      return;
    }

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
    } catch (err) {
      alert("Failed to upload ticket: " + (err.message || "Unknown error"));
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    const ok = window.confirm("Are you sure you want to delete this booking?");
    if (!ok) return;

    try {
      setUpdatingBookingId(bookingId);
      await deleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.booking_id !== bookingId));
    } catch (err) {
      alert("Failed to delete booking: " + (err.message || "Unknown error"));
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleDownloadTicket = async (booking) => {
    try {
      setUpdatingBookingId(booking.booking_id);
      const blob = await getSecureTicket(booking.booking_id);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = booking.original_ticket_name || `ticket-${booking.booking_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to download ticket: " + (err.message || "Unknown error"));
    } finally {
      setUpdatingBookingId(null);
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
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <div className="grid grid-cols-5 gap-4">
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Search bookings..."
          />
          <select className="border rounded px-3 py-2 text-sm">
            <option>All Status</option>
            {BOOKING_STATUS_OPTIONS.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select className="border rounded px-3 py-2 text-sm">
            <option>All Routes</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm">
            <option>All Dates</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm">
            <option>All Classes</option>
          </select>
        </div>
        <button className="mt-4 bg-gray-800 text-white px-5 py-2 rounded">
          Filter
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Booking Code</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Route</th>
              <th className="p-4 text-left">Travel Date</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Booking Status</th>
              <th className="p-4 text-left">Payment Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
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
                <tr key={booking.booking_id} className="hover:bg-gray-50 align-top">
                  <td className="p-4 font-semibold text-blue-600">{booking.booking_code}</td>
                  <td className="p-4 text-gray-700">{booking.user.name}</td>
                  <td className="p-4 text-gray-600">{booking.user.email}</td>
                  <td className="p-4">{extractRoute(booking)}</td>
                  <td className="p-4">{extractTravelDate(booking)}</td>
                  <td className="p-4 font-medium">${booking.final_price_usd?.toFixed(2) || "-"}</td>

                  <td className="p-4">
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

                  <td className="p-4">
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
                            handleTicketInputChange(booking.booking_id, e.target.files?.[0])
                          }
                          className="border rounded px-2 py-1 text-xs flex-1 min-w-0"
                        />
                        <button
                          disabled={isUpdating || !ticketFiles[booking.booking_id]}
                          onClick={() => handleUploadTicket(booking)}
                          className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap"
                        >
                          Upload
                        </button>
                      </div>
                    )}

                    {booking.ticket_file_url && (
                      <div className="mt-2 flex flex-col gap-1">
                        <a
                          href={booking.ticket_file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate"
                          title={booking.original_ticket_name || "Ticket"}
                        >
                          {booking.original_ticket_name || "View Ticket"}
                        </a>
                        <button
                          disabled={isUpdating}
                          onClick={() => handleDownloadTicket(booking)}
                          className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 w-fit"
                        >
                          Download
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/admin/bookings/${booking.booking_id}`)}
                        className="border px-3 py-1.5 text-xs rounded hover:bg-blue-50 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/bookings/${booking.booking_id}/booking-edit`)
                        }
                        className="border px-3 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        disabled={isUpdating}
                        onClick={() => handleDeleteBooking(booking.booking_id)}
                        className="border border-red-300 px-3 py-1.5 text-xs rounded text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
