import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  fetchDriverProfile,
  fetchDriverDuties,
  updateDriverDutyStatus,
  clearDriverSession,
  isDriverLoggedIn,
} from "../../api";
import {
  Car,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Star,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [duties, setDuties] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    const profileRes = await fetchDriverProfile();
    if (profileRes.success && profileRes.driver) {
      setDriver(profileRes.driver);
      if (profileRes.driver.onboardingStep < 5) {
        navigate("/driver/onboarding");
        return;
      }
    } else {
      clearDriverSession();
      navigate("/driver/login");
      return;
    }

    const dutyRes = await fetchDriverDuties();
    if (dutyRes.success) {
      setIsEligible(dutyRes.isEligible);
      setDuties(dutyRes.duties || []);
    }
    setLoading(false);
    setRefreshing(false);
  }, [navigate]);

  useEffect(() => {
    if (!isDriverLoggedIn()) {
      navigate("/driver/login");
      return;
    }
    loadData();
  }, [navigate, loadData]);

  const handleUpdateStatus = async (dutyId, newStatus) => {
    setUpdatingId(dutyId);
    try {
      const res = await updateDriverDutyStatus(dutyId, newStatus);
      if (res.success) {
        toast.success(`Trip status updated to ${newStatus.replace("_", " ")}`);
        loadData();
      } else {
        toast.error(res.error || "Failed to update trip status");
      }
    } catch {
      toast.error("Network error while updating trip");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    clearDriverSession();
    toast.success("Logged out successfully");
    navigate("/driver/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <Car className="w-8 h-8 text-primary animate-bounce mx-auto" />
          <p className="text-xs font-bold text-muted-foreground">Loading dispatch duties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-4xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                <span>Pondy RideCircle</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  Driver Portal
                </span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-semibold">
                Hi, {driver?.name} • {driver?.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={refreshing}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-destructive rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-5 flex-1 max-w-4xl space-y-4">
        {/* Driver Quick Status Card */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
              {driver?.name ? driver.name.charAt(0) : "D"}
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">{driver?.name}</h2>
              <p className="text-xs text-muted-foreground font-semibold flex items-center gap-2 mt-0.5">
                <span>🚘 {driver?.vehicleModel || "Registered Cab"} ({driver?.vehicleNumber || "Assigned"})</span>
                <span>•</span>
                <span className="text-amber-500 font-bold">⭐ {driver?.rating || "4.9"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider ${
                driver?.documentsApproved
                  ? "bg-green-500/10 text-green-600 border border-green-500/20"
                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
              }`}
            >
              {driver?.documentsApproved ? "Verified Partner ✅" : "Review Pending ⏳"}
            </span>

            <Link
              to="/driver/onboarding"
              className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Edit KYC
            </Link>
          </div>
        </div>

        {/* Verification Status Warning if Not Approved */}
        {!isEligible && (
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 text-xs space-y-1">
            <p className="font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Application Under Admin Review</span>
            </p>
            <p className="text-muted-foreground font-medium leading-relaxed">
              Your licence and vehicle documents are currently being checked by the Pondy Tours dispatch desk. You will receive SMS and WhatsApp dispatch notifications once your profile is approved.
            </p>
          </div>
        )}

        {/* Duties Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h3 className="text-sm font-black uppercase text-foreground tracking-wider">
              Assigned Trip Duties ({duties.length})
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Confirmed passenger bookings dispatched to your vehicle
            </p>
          </div>
        </div>

        {/* Duties Cards */}
        {duties.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center space-y-2">
            <Car className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-black text-foreground">No Active Trips Assigned</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {isEligible
                ? "You currently have no pending duty slips. When dispatch assigns a trip to your mobile number, it will instantly appear here."
                : "Duties will be visible here once your documents are approved by the dispatch desk."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {duties.map((duty) => (
              <div
                key={duty.id}
                className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                      #{duty.bookingId}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        duty.tripType === "round"
                          ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                          : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      }`}
                    >
                      {duty.tripType === "round" ? "Round Trip" : "One-Way Drop"}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-baseline justify-between pb-1 border-b border-border">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Passenger</span>
                      <h4 className="font-black text-base text-foreground">{duty.customerName}</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${duty.customerPhone}`}
                        className="p-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1"
                        title="Call Customer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${duty.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Hello ${duty.customerName}, I am your Pondy Tours driver for trip ${duty.bookingId}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-green-600 text-white"
                        title="WhatsApp Customer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Route & Schedule */}
                  <div className="py-2.5 px-3 bg-muted/60 rounded-xl text-xs space-y-1.5 border border-border/50">
                    <div className="flex items-center gap-1.5 font-black text-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{duty.pickup}</span>
                      <span className="text-primary font-black">➔</span>
                      <span className="truncate">{duty.drop}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary" />
                        <span>{duty.travelDate} at {duty.preferredTime}</span>
                      </span>
                      <span className="uppercase font-bold text-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                        {duty.vehicleType}
                      </span>
                    </div>
                    {duty.adminNotes && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold pt-1 border-t border-border/40">
                        📝 Note: {duty.adminNotes}
                      </p>
                    )}
                  </div>

                  {/* Fare and Cash to Collect */}
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Fare</span>
                      <span className="font-bold text-foreground">₹{duty.actualFare}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Cash/UPI to Collect</span>
                      <span className="text-base font-black text-primary">₹{duty.balanceAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Duty Status Action */}
                <div className="pt-2">
                  {duty.status === "in_progress" ? (
                    <button
                      onClick={() => handleUpdateStatus(duty.id, "completed")}
                      disabled={updatingId === duty.id}
                      className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-green-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{updatingId === duty.id ? "Updating..." : "Complete Trip & Mark Done"}</span>
                    </button>
                  ) : duty.status === "completed" ? (
                    <div className="w-full py-2 rounded-xl bg-green-500/10 text-green-600 font-bold text-xs text-center">
                      ✓ Journey Completed
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(duty.id, "in_progress")}
                      disabled={updatingId === duty.id}
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>{updatingId === duty.id ? "Starting..." : "Start Journey / Mark In-Progress"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
