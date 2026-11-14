import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  isCustomerLoggedIn, 
  getCustomerUser, 
  clearCustomerSession, 
  fetchCustomerBookings, 
  customerCancelBooking, 
  customerSubmitFeedback 
} from "../../api";
import { toast } from "sonner";
import { 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle, 
  LogOut, 
  RefreshCw, 
  Star, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Plus, 
  ChevronRight, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Luggage,
  Users
} from "lucide-react";

const roundVal = (val) => Math.round(Number(val) || 0);
const formatInr = (val) => `₹${roundVal(val).toLocaleString("en-IN")}`;

const cleanPhoneForWhatsApp = (phone) => {
  if (!phone) return "";
  let digits = String(phone).replace(/[^0-9]/g, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = "91" + digits;
  return digits;
};

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'upcoming' | 'pending' | 'completed' | 'cancelled'

  // Cancellation Modal State
  const [cancellingTrip, setCancellingTrip] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // Feedback Modal State
  const [feedbackTrip, setFeedbackTrip] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!isCustomerLoggedIn()) {
      navigate("/customer/login");
      return;
    }
    setCurrentUser(getCustomerUser());
    loadBookings();
  }, [navigate]);

  const loadBookings = async () => {
    setLoading(true);
    const res = await fetchCustomerBookings();
    if (res.success && res.trips) {
      setTrips(res.trips);
    } else {
      setTrips([]);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
    toast.success("Bookings refreshed");
  };

  const handleLogout = () => {
    clearCustomerSession();
    toast.success("Logged out successfully");
    navigate("/customer/login");
  };

  // Cancellation Handler
  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancellingTrip) return;
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    setSubmittingCancel(true);
    const res = await customerCancelBooking(cancellingTrip.id, cancelReason.trim());
    if (res.success) {
      toast.success(res.message || "Cancellation request submitted");
      setCancellingTrip(null);
      setCancelReason("");
      loadBookings();
    } else {
      toast.error(res.error || "Failed to submit cancellation");
    }
    setSubmittingCancel(false);
  };

  // Feedback Handler
  const handleConfirmFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackTrip) return;

    setSubmittingFeedback(true);
    const res = await customerSubmitFeedback(feedbackTrip.id, rating, feedbackText.trim());
    if (res.success) {
      toast.success(res.message || "Thank you for rating your trip!");
      setFeedbackTrip(null);
      setFeedbackText("");
      loadBookings();
    } else {
      toast.error(res.error || "Failed to submit feedback");
    }
    setSubmittingFeedback(false);
  };

  // Filter Bookings
  const filteredTrips = trips.filter((t) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") {
      return ["confirmed", "driver_assigned", "in_progress"].includes(t.status);
    }
    if (activeTab === "pending") {
      return ["pending", "quotation_sent", "enquiry"].includes(t.status);
    }
    if (activeTab === "completed") {
      return t.status === "completed";
    }
    if (activeTab === "cancelled") {
      return t.status === "cancelled";
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground antialiased font-sans">
      {/* Top Navbar */}
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                <span>Pondy Tours</span>
                <span className="text-primary text-[10px] px-2 py-0.5 bg-primary/10 rounded-full font-bold">
                  My Bookings
                </span>
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Cab</span>
            </Link>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh Bookings"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-3 sm:px-4 py-5 max-w-4xl space-y-5">
        {/* Profile Welcome Banner */}
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase text-primary tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full">
                Verified Customer
              </span>
              <span className="text-xs text-muted-foreground">Mobile: {currentUser?.phone}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-foreground">
              Hello, {currentUser?.name || "Traveler"}!
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review your upcoming journeys, track dispatched vehicles, and download travel vouchers.
            </p>
          </div>

          <Link
            to="/"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Book Another Journey</span>
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-border/80 text-xs font-bold">
          {[
            { id: "all", label: "All Bookings", count: trips.length },
            {
              id: "upcoming",
              label: "Upcoming & Active",
              count: trips.filter((t) => ["confirmed", "driver_assigned", "in_progress"].includes(t.status)).length,
            },
            {
              id: "pending",
              label: "Pending Confirmation",
              count: trips.filter((t) => ["pending", "quotation_sent", "enquiry"].includes(t.status)).length,
            },
            {
              id: "completed",
              label: "Completed",
              count: trips.filter((t) => t.status === "completed").length,
            },
            {
              id: "cancelled",
              label: "Cancelled",
              count: trips.filter((t) => t.status === "cancelled").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3 sm:px-3.5 rounded-xl shrink-0 transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground font-black shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Booking Cards List */}
        {loading ? (
          <div className="py-12 text-center text-muted-foreground text-xs font-bold flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
            <span>Loading your booking vouchers...</span>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 text-center shadow-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center text-primary">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-foreground">No bookings found in this category</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Any bookings made with your registered mobile number ({currentUser?.phone}) will automatically appear here.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow hover:bg-primary/95"
              >
                <span>Book a Ride Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map((trip) => {
              const isAssigned = Boolean(trip.driverName && trip.driverPhone);
              const isPending = ["pending", "quotation_sent", "enquiry"].includes(trip.status);
              const isCompleted = trip.status === "completed";
              const isCancelled = trip.status === "cancelled";

              return (
                <div
                  key={trip.id}
                  className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-card hover:shadow-md transition-shadow space-y-3.5"
                >
                  {/* Header: Booking ID, Trip Type, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                        {trip.bookingId}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          trip.tripType === "round"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                        }`}
                      >
                        {trip.tripType === "round" ? "Round Trip" : "One-Way Drop"}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        trip.status === "completed"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : trip.status === "driver_assigned"
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          : trip.status === "in_progress"
                          ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                          : trip.status === "cancelled"
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}
                    >
                      {trip.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Route & Journey Box */}
                  <div className="p-3.5 bg-muted/60 rounded-2xl border border-border/60 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-black text-foreground">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{trip.pickup}</span>
                      <span className="text-primary font-black">➔</span>
                      <span className="truncate">{trip.drop}</span>
                    </div>

                    {trip.optionalStops && (
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pl-6 font-medium">
                        <span className="font-bold text-foreground">Via:</span>
                        <span>{trip.optionalStops}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold text-foreground">{trip.travelDate}</span>
                        <span>at {trip.preferredTime}</span>
                      </div>

                      {trip.returnDate && (
                        <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
                          <span>🔄 Return:</span>
                          <span>{trip.returnDate} at {trip.returnTime || "Flexible"}</span>
                        </div>
                      )}
                    </div>

                    {/* Vehicle suitability info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-border/40 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="uppercase font-black text-foreground bg-background px-2 py-0.5 rounded-md border border-border">
                          {trip.vehicleType}
                        </span>
                        {trip.passengerCount > 1 && (
                          <span className="flex items-center gap-1 text-muted-foreground font-semibold">
                            <Users className="w-3 h-3" />
                            <span>{trip.passengerCount} Passengers</span>
                          </span>
                        )}
                        {trip.luggageInfo && (
                          <span className="flex items-center gap-1 text-muted-foreground font-semibold">
                            <Luggage className="w-3 h-3" />
                            <span>{trip.luggageInfo}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Assigned Driver Box (Only shown when driver assigned) */}
                  {isAssigned && (
                    <div className="p-3.5 bg-primary/5 rounded-2xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                          Assigned Driver & Cab
                        </span>
                        <p className="font-black text-foreground text-sm flex items-center gap-1.5 mt-0.5">
                          <span>👨‍✈️ {trip.driverName}</span>
                          {trip.vehicleNumber && (
                            <span className="text-xs px-2 py-0.5 bg-background border border-border rounded font-bold uppercase tracking-wider">
                              {trip.vehicleNumber}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <a
                          href={`tel:${trip.driverPhone}`}
                          className="flex-1 sm:flex-initial py-2 px-3 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Driver</span>
                        </a>

                        <a
                          href={`https://api.whatsapp.com/send?phone=${cleanPhoneForWhatsApp(trip.driverPhone)}&text=${encodeURIComponent(
                            `Hello ${trip.driverName}, this is ${currentUser?.name || "passenger"} regarding booking #${trip.bookingId} (${trip.pickup} to ${trip.drop}).`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 sm:flex-initial py-2 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Fare & Payments */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Total Fare
                      </span>
                      <span className="font-black text-primary text-base sm:text-lg">
                        {formatInr(trip.fare)}
                      </span>
                    </div>

                    {roundVal(trip.advancePaid) > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                          Advance Paid
                        </span>
                        <span className="font-bold text-green-600 text-xs">
                          {formatInr(trip.advancePaid)}
                        </span>
                      </div>
                    )}

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Payable to Driver
                      </span>
                      <span className="font-black text-foreground text-sm sm:text-base">
                        {formatInr(trip.balanceAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Cancellation Request Banner */}
                  {trip.cancellationRequested && !isCancelled && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>
                        Cancellation requested: "{trip.cancellationRequestReason || "Under review by dispatch desk"}".
                      </span>
                    </div>
                  )}

                  {/* Bottom Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                    {/* Cancellation Trigger */}
                    {!isCancelled && !isCompleted && !trip.cancellationRequested && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancellingTrip(trip);
                          setCancelReason("");
                        }}
                        className="text-xs text-destructive hover:underline font-bold"
                      >
                        Request Cancellation
                      </button>
                    )}

                    {/* Feedback Button for Completed Trips */}
                    {isCompleted && (
                      <div>
                        {trip.customerRating ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <span>Your Rating:</span>
                            <span className="text-amber-500 flex items-center">
                              {"★".repeat(trip.customerRating)}
                            </span>
                            {trip.customerFeedback && (
                              <span className="text-muted-foreground font-medium italic truncate max-w-[200px]">
                                "{trip.customerFeedback}"
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setFeedbackTrip(trip);
                              setRating(5);
                              setFeedbackText("");
                            }}
                            className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            <span>Rate Your Journey</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* 24/7 Helpline link */}
                    <a
                      href="tel:+919025232453"
                      className="ml-auto text-xs text-muted-foreground hover:text-primary font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-primary" />
                      <span>24/7 Support: 90252 32453</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL 1: CANCELLATION REQUEST MODAL */}
      {cancellingTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Cancel Booking: {cancellingTrip.bookingId}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {cancellingTrip.pickup} ➔ {cancellingTrip.drop}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCancellingTrip(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                  Reason for Cancellation *
                </label>
                <textarea
                  rows={3}
                  placeholder="E.g. Travel plans changed, postponed journey, booked flight..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-destructive resize-none"
                  required
                />
              </div>

              <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20 text-[11px] text-destructive font-semibold">
                ⚠️ If you have already paid an advance or need immediate cab rescheduling, you can also call our 24/7 dispatch desk at +91 90252 32453.
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCancellingTrip(null)}
                  className="w-1/3 py-2.5 rounded-xl border border-border text-foreground font-bold text-xs hover:bg-muted"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={submittingCancel}
                  className="w-2/3 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  {submittingCancel ? "Submitting..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TRIP FEEDBACK & RATING MODAL */}
      {feedbackTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Rate Your Journey: {feedbackTrip.bookingId}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {feedbackTrip.pickup} ➔ {feedbackTrip.drop}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackTrip(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmFeedback} className="space-y-4">
              <div className="text-center py-2">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-2">
                  How was your trip experience?
                </span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-transform hover:scale-110 ${
                        star <= rating ? "text-amber-500" : "text-muted-foreground/40"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-500 mt-1 block">
                  {rating === 5 ? "⭐⭐⭐⭐⭐ Outstanding" : rating === 4 ? "⭐⭐⭐⭐ Very Good" : rating === 3 ? "⭐⭐⭐ Good" : "Needs Improvement"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                  Feedback or Review (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Driver driving, cab cleanliness, punctuality..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackTrip(null)}
                  className="w-1/3 py-2.5 rounded-xl border border-border text-foreground font-bold text-xs hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="w-2/3 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  {submittingFeedback ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}