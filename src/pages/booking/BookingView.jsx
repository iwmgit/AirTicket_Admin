import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBookingById, deleteBooking, getSecureTicket, getBookingAudit, getTicketStatus } from "../../config/api";

export default function BookingView() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [ticketStatus, setTicketStatus] = useState(null);
  const [ticketStatusLoading, setTicketStatusLoading] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

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
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchBooking();

    return () => {
      mounted = false;
    };
  }, [bookingId]);

  const handleViewAudit = async () => {
    try {
      setAuditLoading(true);
      const data = await getBookingAudit(bookingId);
      setAuditData(data);
      setShowAuditModal(true);
    } catch (err) {
      alert("Failed to load audit history: " + err.message);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await deleteBooking(bookingId);
        navigate("/admin/bookings");
      } catch (err) {
        alert("Failed to delete booking: " + err.message);
      }
    }
  };

  const handleDownloadTicket = async () => {
    try {
      setDownloading(true);
      const blob = await getSecureTicket(bookingId);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = booking.original_ticket_name || booking.original_name || `ticket-${booking.booking_code}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to download ticket: " + (err.message || "Unknown error"));
    } finally {
      setDownloading(false);
    }
  };

  function DetailItem({ label, value }) {
    return (
      <div>
        <div className="text-xs font-medium text-gray-600 mb-1">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value || "—"}</div>
      </div>
    );
  }

  const extractTravelDate = (booking) => {
    try {
      const departureTime =
        booking.flight_snapshot?.outbound?.departure_time ||
        booking.flight_snapshot?.departure_time;
      if (!departureTime) return "-";

      return new Date(departureTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const extractRoute = (booking) => {
    return (
      booking.flight_snapshot?.outbound?.route ||
      booking.flight_snapshot?.route ||
      "-"
    );
  };

  if (loading)
    return <div className="p-6 text-center">Loading booking details...</div>;
  if (error)
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  if (!booking) return <div className="p-6 text-center">Booking not found</div>;

  const fs = booking.flight_snapshot || {};
  const isRoundTrip = booking.type === "ROUND_TRIP";
  console.log("Booking Data:", booking);

  return (
    <div className="p-4">
      <div className="bg-white border border-blue-200 rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking {booking.booking_code}</h1>
              <p className="text-sm text-gray-600 mt-1">Booked on {new Date(booking.created_at).toLocaleDateString()}</p>
            </div>
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
                booking.status === "CONFIRMED"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : booking.status === "PENDING" || booking.status === "PROCESSING"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Booking Summary */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DetailItem label="Booking Code" value={booking.booking_code} />
              <DetailItem label="Booking ID" value={booking.booking_id} />
              <DetailItem label="Trip Type" value={booking.type === "ROUND_TRIP" ? "Round Trip" : "One Way"} />
              <DetailItem label="Number of Adults" value={booking.adults} />
              <DetailItem label="Base Price (USD)" value={`$${fs.base_price_usd?.toFixed(2)}`} />
              <DetailItem label="Final Price (USD)" value={`$${booking.final_price_usd?.toFixed(2)}`} />
              <DetailItem label="Estimate Price (USD)" value={`$${fs.price_estimate_min_usd?.toFixed(2)} - $${fs.price_estimate_max_usd?.toFixed(2)}`} />
              <DetailItem label="Estimate Price (MMK)" value={`MMK ${fs.price_estimate_min_mmk?.toLocaleString()} - MMK ${fs.price_estimate_max_mmk?.toLocaleString()}`} />
              <DetailItem label="Final Price (MMK)" value={`MMK ${booking.final_price_mmk?.toLocaleString()}`} />
            </div>
          </section>

          {/* Outbound Flight */}
          <section className="border-t border-blue-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Outbound Flight</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DetailItem
                label="Airline & Flight"
                value={`${fs.outbound?.airline_code || fs.airline_code} ${fs.outbound?.flight_number || fs.flight_number}`}
              />
              <DetailItem label="Route" value={extractRoute(booking)} />
              <DetailItem
                label="Departure"
                value={extractTravelDate(booking) !== "-" ? new Date(fs.outbound?.departure_time || fs.departure_time).toLocaleString() : "—"}
              />
              <DetailItem
                label="Arrival"
                value={extractTravelDate(booking) !== "-" ? new Date(fs.outbound?.arrival_time || fs.arrival_time).toLocaleString() : "—"}
              />
              <DetailItem label="Duration" value={`${fs.outbound?.duration_minutes || fs.duration_minutes || '-'} minutes`} />
              <DetailItem label="Airline Name" value={fs.outbound?.airline || fs.airline || '-'} />
            </div>
          </section>

          {/* Inbound Flight (if Round Trip) */}
          {isRoundTrip && fs.inbound && (
            <section className="border-t border-blue-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Inbound Flight</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DetailItem
                  label="Airline & Flight"
                  value={`${fs.inbound.airline_code} ${fs.inbound.flight_number}`}
                />
                <DetailItem label="Route" value={fs.inbound.route} />
                <DetailItem
                  label="Departure"
                  value={fs.inbound.departure_time ? new Date(fs.inbound.departure_time).toLocaleString() : "—"}
                />
                <DetailItem
                  label="Arrival"
                  value={fs.inbound.arrival_time ? new Date(fs.inbound.arrival_time).toLocaleString() : "—"}
                />
                <DetailItem label="Duration" value={`${fs.inbound.duration_minutes} minutes`} />
                <DetailItem label="Airline Name" value={fs.inbound.airline} />
              </div>
            </section>
          )}

          {/* Passengers */}
          <section className="border-t border-blue-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Passengers</h2>
            <div className="space-y-4">
              {booking.passengers?.map((passenger, idx) => (
                <div key={passenger.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold mb-4 text-gray-800">Passenger {idx + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DetailItem
                      label="Full Name"
                      value={`${passenger.given_name} ${passenger.last_name}`}
                    />
                    <DetailItem label="Passport Number" value={passenger.passport_number} />
                    <DetailItem label="Gender" value={passenger.gender} />
                    <DetailItem label="Date of Birth" value={new Date(passenger.date_of_birth).toLocaleDateString()} />
                    <DetailItem label="Nationality" value={passenger.nationality} />
                    <DetailItem label="Phone Number" value={passenger.phone_number} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payment & Status */}
          <section className="border-t border-blue-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Payment & Status</h2>
              <button
                onClick={handleViewAudit}
                disabled={auditLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {auditLoading ? "Loading..." : "View Audit"}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DetailItem label="Payment Status" value={booking.payment_status} />
              <DetailItem label="Booking Status" value={booking.status} />
              <DetailItem
                label="Booked Date"
                value={new Date(booking.created_at).toLocaleString()}
              />
            </div>
          </section>

          {/* Uploaded Ticket File */}
          <section className="border-t border-blue-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ticket File</h2>
            {ticketStatus ? (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                {ticketStatus.has_ticket ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">
                        ✓ Uploaded
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Upload Time</p>
                        <p className="text-sm text-gray-900 font-medium">
                          {new Date(ticketStatus.ticket_uploaded_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-blue-200">
                      <p className="text-sm text-gray-700">Download uploaded ticket</p>
                      <button
                        disabled={downloading}
                        onClick={handleDownloadTicket}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-60 transition"
                      >
                        {downloading ? "Downloading..." : "Download"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium border border-yellow-200">
                        ⚠ Pending
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      No ticket file has been uploaded for this booking yet. Go to the Edit page to upload or manage the ticket.
                    </p>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => navigate(`/admin/bookings/${bookingId}/booking-edit`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                      >
                        Manage Ticket
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <p className="text-sm text-gray-600 animate-pulse">Loading ticket status...</p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-blue-200 bg-blue-50 flex justify-end gap-3">
          <button
            onClick={() => navigate("/admin/bookings")}
            className="px-4 py-2 border border-blue-200 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition"
          >
            Back to List
          </button>
          <button
            onClick={handleDeleteBooking}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
          >
            Delete Booking
          </button>
        </div>

        {/* Audit Modal */}
        {showAuditModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAuditModal(false)}
          >
            <div 
              className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 p-5 border-b border-blue-200 bg-blue-50">
                <h2 className="text-xl font-bold text-gray-900">Booking Audit History</h2>
              </div>

              {/* Modal Content */}
              <div className="p-5 space-y-4">
                {auditData ? (
                  <>
                    {/* Payment Section */}
                    {auditData.payment && (
                      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                        <h3 className="font-bold text-gray-800 mb-3"> Payment</h3>
                        <div className="space-y-3 ml-4">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-semibold text-gray-700">Status:</span>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">
                              {auditData.payment.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-700">Marked At:</span>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(auditData.payment.marked_at).toLocaleString()}
                            </p>
                          </div>
                          {auditData.payment.marked_by && (
                            <div>
                              <span className="text-sm font-semibold text-gray-700">Marked By:</span>
                              <div className="mt-1 bg-white rounded p-2 border border-blue-200">
                                <p className="text-sm font-medium text-gray-800">{auditData.payment.marked_by.name}</p>
                                <p className="text-xs text-gray-500">{auditData.payment.marked_by.email}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status Section */}
                    {auditData.status && (
                      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                        <h3 className="font-bold text-gray-800 mb-3"> Booking Status</h3>
                        <div className="space-y-3 ml-4">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-semibold text-gray-700">Current Status:</span>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border text-white ${
                              auditData.status.current_status === "CONFIRMED"
                                ? "bg-green-600 border-green-300"
                                : auditData.status.current_status === "PENDING" || auditData.status.current_status === "PROCESSING"
                                ? "bg-yellow-600 border-yellow-300"
                                : "bg-red-600 border-red-300"
                            }`}>
                              {auditData.status.current_status}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-700">Updated At:</span>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(auditData.status.updated_at).toLocaleString()}
                            </p>
                          </div>
                          {auditData.status.updated_by && (
                            <div>
                              <span className="text-sm font-semibold text-gray-700">Updated By:</span>
                              <div className="mt-1 bg-white rounded p-2 border border-blue-200">
                                <p className="text-sm font-medium text-gray-800">{auditData.status.updated_by.name}</p>
                                <p className="text-xs text-gray-500">{auditData.status.updated_by.email}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ticket Section */}
                    {auditData.ticket && (
                      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                        <h3 className="font-bold text-gray-800 mb-3"> Ticket</h3>
                        <div className="space-y-3 ml-4">
                          <div>
                            <span className="text-sm font-semibold text-gray-700">Uploaded At:</span>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(auditData.ticket.uploaded_at).toLocaleString()}
                            </p>
                          </div>
                          {auditData.ticket.uploaded_by && (
                            <div>
                              <span className="text-sm font-semibold text-gray-700">Uploaded By:</span>
                              <div className="mt-1 bg-white rounded p-2 border border-blue-200">
                                <p className="text-sm font-medium text-gray-800">{auditData.ticket.uploaded_by.name}</p>
                                <p className="text-xs text-gray-500">{auditData.ticket.uploaded_by.email}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!auditData.payment && !auditData.status && !auditData.ticket && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No audit history available</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">Loading audit history...</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 p-5 border-t border-blue-200 bg-blue-50 flex justify-end">
                <button
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}