import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  isAdminLoggedIn,
  getAdminUser,
  clearAdminSession,
  fetchAdminStats,
  fetchAdminLeads,
  updateLeadStatus,
  fetchAdminBookings,
  updateBookingDetails,
  fetchAdminPricing,
  saveAdminPricing,
} from "../../api";
import { toast } from "sonner";
import {
  ShieldCheck,
  Users,
  MessageCircle,
  TrendingUp,
  Car,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Calendar,
  Clock,
  ArrowRight,
  LogOut,
  ExternalLink,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  DollarSign,
  UserCheck,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("leads"); // 'leads' | 'bookings' | 'pricing'

  // Metric Stats
  const [stats, setStats] = useState({
    totalLeads: 0,
    todayLeads: 0,
    whatsappClicks: 0,
    conversionRate: 0,
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
  });

  // Leads State
  const [leads, setLeads] = useState([]);
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [leadSearch, setLeadSearch] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Bookings State
  const [bookings, setBookings] = useState([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Edit / Driver Assignment Modal
  const [editingBooking, setEditingBooking] = useState(null);
  const [savingBooking, setSavingBooking] = useState(false);

  // Pricing State
  const [pricingList, setPricingList] = useState([]);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/admin/login");
      return;
    }
    setCurrentUser(getAdminUser());
  }, [navigate]);

  // Load Dashboard Data
  const loadStats = useCallback(async () => {
    const data = await fetchAdminStats();
    if (data) setStats(data);
  }, []);

  const loadLeads = useCallback(async () => {
    setLoadingLeads(true);
    const data = await fetchAdminLeads(leadStatusFilter, leadSearch);
    setLeads(data);
    setLoadingLeads(false);
  }, [leadStatusFilter, leadSearch]);

  const loadBookings = useCallback(async () => {
    setLoadingBookings(true);
    const data = await fetchAdminBookings(bookingStatusFilter);
    setBookings(data);
    setLoadingBookings(false);
  }, [bookingStatusFilter]);

  const loadPricing = useCallback(async () => {
    setLoadingPricing(true);
    const data = await fetchAdminPricing();
    setPricingList(data);
    setLoadingPricing(false);
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn()) {
      loadStats();
      if (activeTab === "leads") loadLeads();
      if (activeTab === "bookings") loadBookings();
      if (activeTab === "pricing") loadPricing();
    }
  }, [activeTab, loadStats, loadLeads, loadBookings, loadPricing]);

  // Handlers
  const handleLogout = () => {
    clearAdminSession();
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const handleLeadStatusChange = async (leadId, newStatus) => {
    const res = await updateLeadStatus(leadId, newStatus);
    if (res.success) {
      toast.success("Lead status updated");
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      loadStats();
    } else {
      toast.error(res.error || "Failed to update lead");
    }
  };

  const handleSaveBookingModal = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;
    setSavingBooking(true);
    try {
      const res = await updateBookingDetails(editingBooking.id, {
        status: editingBooking.status,
        driverName: editingBooking.driverName,
        driverPhone: editingBooking.driverPhone,
        vehicleNumber: editingBooking.vehicleNumber,
        actualFare: editingBooking.actualFare,
        advancePaid: editingBooking.advancePaid,
        balanceAmount: editingBooking.balanceAmount,
        adminNotes: editingBooking.adminNotes,
      });
      if (res.success) {
        toast.success(`Booking ${editingBooking.bookingId} updated successfully`);
        setEditingBooking(null);
        loadBookings();
        loadStats();
      } else {
        toast.error(res.error || "Failed to update booking");
      }
    } catch {
      toast.error("Network error while updating booking");
    } finally {
      setSavingBooking(false);
    }
  };

  const handleSavePricing = async () => {
    setSavingPricing(true);
    const res = await saveAdminPricing(pricingList);
    if (res.success) {
      toast.success("Vehicle pricing matrix updated live in PostgreSQL!");
    } else {
      toast.error(res.error || "Failed to save pricing");
    }
    setSavingPricing(false);
  };

  const handlePricingFieldChange = (index, field, value) => {
    setPricingList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      {/* Top Navbar */}
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                <span>Pondy Tours</span>
                <span className="text-primary text-xs px-2 py-0.5 bg-primary/10 rounded-full font-bold">
                  Dispatch Portal
                </span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-semibold">
                Lead Management & Fare Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-border"
            >
              <span>View Customer Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center gap-2 border-l border-border pl-3">
              <span className="text-xs font-bold text-muted-foreground hidden md:inline">
                Hi, <span className="text-foreground">{currentUser?.username || "Admin"}</span>
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-6 flex-1 space-y-6 max-w-7xl">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">Today's Enquiries</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-black text-foreground">{stats.todayLeads}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Total Enquiries: <span className="font-bold text-foreground">{stats.totalLeads}</span>
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">WhatsApp Clicks</span>
              <MessageCircle className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-black text-accent">{stats.whatsappClicks}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Confirmed intent clicks</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">Conversion Rate</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-black text-primary">{stats.conversionRate}%</p>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full"
                style={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">Active Bookings</span>
              <Car className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-black text-foreground">{stats.activeBookings}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Completed: <span className="font-bold text-accent">{stats.completedBookings}</span>
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "leads"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Enquiries & Leads ({stats.totalLeads})</span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "bookings"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Confirmed Dispatch ({stats.totalBookings})</span>
          </button>

          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "pricing"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Live Vehicle Pricing</span>
          </button>
        </div>

        {/* TAB 1: LEADS & ENQUIRIES */}
        {activeTab === "leads" && (
          <div className="space-y-4 animate-fade-in">
            {/* Filters and search */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-2xl border border-border">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search name, phone, city..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {["all", "enquiry", "whatsapp_clicked", "contacted", "converted", "lost"].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setLeadStatusFilter(st)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider whitespace-nowrap transition-colors ${
                        leadStatusFilter === st
                          ? "bg-primary/20 text-primary border border-primary/40"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  )
                )}
                <button
                  onClick={loadLeads}
                  disabled={loadingLeads}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                  title="Refresh"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted text-muted-foreground uppercase font-black text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Trip & Route</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Vehicle & Fare</th>
                      <th className="p-3">WhatsApp Click</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          {loadingLeads ? "Loading enquiries from PostgreSQL..." : "No customer enquiries found."}
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-semibold">
                            <p className="font-bold text-foreground text-sm">{lead.customerName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <a
                                href={`tel:${lead.customerPhone}`}
                                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-bold"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{lead.customerPhone}</span>
                              </a>
                            </div>
                          </td>

                          <td className="p-3 font-semibold">
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                              {lead.tripType === "oneway" ? "One-Way" : "Round Trip"}
                            </span>
                            <p className="text-foreground font-bold mt-1">
                              {lead.pickup} <span className="text-primary font-black">➔</span> {lead.drop}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{lead.distanceKm} km</p>
                          </td>

                          <td className="p-3 font-semibold text-muted-foreground whitespace-nowrap">
                            <p className="flex items-center gap-1 text-foreground font-bold">
                              <Calendar className="w-3 h-3 text-primary" />
                              <span>{lead.travelDate}</span>
                            </p>
                            <p className="flex items-center gap-1 text-[11px] mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{lead.preferredTime}</span>
                            </p>
                          </td>

                          <td className="p-3 font-semibold">
                            <p className="uppercase text-[11px] font-black text-foreground">
                              {lead.vehicleType}
                            </p>
                            <p className="text-sm font-black text-primary">₹{lead.estimatedFare}</p>
                          </td>

                          <td className="p-3 font-semibold whitespace-nowrap">
                            {lead.whatsappClicked ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/20 text-accent font-bold text-[10px]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Clicked</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground font-bold text-[10px]">
                                <span>Not Clicked</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            <select
                              value={lead.status}
                              onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                              className="bg-background border border-border rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                            >
                              <option value="enquiry">New Enquiry</option>
                              <option value="whatsapp_clicked">WhatsApp Clicked</option>
                              <option value="contacted">Contacted</option>
                              <option value="converted">Converted</option>
                              <option value="lost">Lost</option>
                            </select>
                          </td>

                          <td className="p-3 text-right">
                            <a
                              href={`https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Hello ${lead.customerName}, regarding your Pondy Tours ride enquiry from ${lead.pickup} to ${lead.drop}:`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[11px] transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Chat</span>
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONFIRMED DISPATCH */}
        {activeTab === "bookings" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-black uppercase text-muted-foreground">Filter:</span>
                {["all", "pending", "confirmed", "driver_assigned", "in_progress", "completed", "cancelled"].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setBookingStatusFilter(st)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider whitespace-nowrap transition-colors ${
                        bookingStatusFilter === st
                          ? "bg-primary/20 text-primary border border-primary/40"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={loadBookings}
                disabled={loadingBookings}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingBookings ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.length === 0 ? (
                <div className="col-span-full p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
                  {loadingBookings ? "Loading dispatch vouchers..." : "No bookings found."}
                </div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-card border border-border rounded-2xl p-5 shadow-card hover:border-primary/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-black text-xs border border-primary/20">
                          {b.bookingId}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                            b.status === "completed"
                              ? "bg-green-500/10 text-green-600"
                              : b.status === "driver_assigned"
                              ? "bg-blue-500/10 text-blue-600"
                              : b.status === "cancelled"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {b.status.replace("_", " ")}
                        </span>
                      </div>

                      <h3 className="font-black text-base text-foreground">{b.customerName}</h3>
                      <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-primary" />
                        <span>{b.customerPhone}</span>
                      </p>

                      <div className="mt-3 py-2 px-3 bg-muted rounded-xl text-xs font-semibold">
                        <p className="text-foreground font-bold">
                          {b.pickup} <span className="text-primary font-black">➔</span> {b.drop}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {b.travelDate} at {b.preferredTime} •{" "}
                          <span className="uppercase font-bold text-foreground">{b.vehicleType}</span>
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Driver:</span>
                          <span className="font-bold text-foreground">
                            {b.driverName || <span className="text-amber-500 font-normal">Not assigned</span>}
                          </span>
                        </div>
                        {b.driverPhone && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Driver Phone:</span>
                            <span className="font-bold text-foreground">{b.driverPhone}</span>
                          </div>
                        )}
                        {b.vehicleNumber && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vehicle Reg:</span>
                            <span className="font-bold text-foreground uppercase">{b.vehicleNumber}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-1 border-t border-border/60">
                          <span className="text-muted-foreground">Fare:</span>
                          <span className="font-black text-primary text-sm">₹{b.actualFare}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 flex gap-2">
                      <button
                        onClick={() => setEditingBooking({ ...b })}
                        className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Assign Driver / Edit</span>
                      </button>

                      <a
                        href={`https://wa.me/${b.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `*Pondy Tours & Travels - Trip Confirmation*\nBooking ID: ${b.bookingId}\nRoute: ${b.pickup} to ${b.drop}\nDate: ${b.travelDate} ${b.preferredTime}\nVehicle: ${b.vehicleType.toUpperCase()}\nEstimated Fare: ₹${b.actualFare}\n${
                            b.driverName ? `Driver: ${b.driverName} (${b.driverPhone})\nVehicle No: ${b.vehicleNumber}` : "Driver details will be dispatched shortly."
                          }`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center"
                        title="Send WhatsApp Voucher"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: VEHICLE PRICING MATRIX */}
        {activeTab === "pricing" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border">
              <div>
                <h2 className="text-base font-black text-foreground">Live Pricing Rules Engine</h2>
                <p className="text-xs text-muted-foreground">
                  Update per-km rates and driver allowances. Changes take effect on the customer booking form in real time.
                </p>
              </div>

              <button
                onClick={handleSavePricing}
                disabled={savingPricing}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-black px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-xs transition-all disabled:opacity-50"
              >
                {savingPricing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Live Rates to Database</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pricingList.map((v, idx) => (
                <div key={v.code} className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h3 className="font-black text-foreground text-sm uppercase">{v.name}</h3>
                    <label className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={v.isActive}
                        onChange={(e) => handlePricingFieldChange(idx, "isActive", e.target.checked)}
                        className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                      One-Way Rate (₹ / km)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={v.onewayRate}
                      onChange={(e) => handlePricingFieldChange(idx, "onewayRate", parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                      Round-Trip Rate (₹ / km)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={v.roundtripRate}
                      onChange={(e) => handlePricingFieldChange(idx, "roundtripRate", parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                        Min One-Way
                      </label>
                      <input
                        type="number"
                        value={v.minOnewayKm}
                        onChange={(e) => handlePricingFieldChange(idx, "minOnewayKm", parseInt(e.target.value) || 130)}
                        className="w-full px-2.5 py-1.5 bg-background border border-border rounded-xl text-foreground font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                        Min Round
                      </label>
                      <input
                        type="number"
                        value={v.minRoundtripKm}
                        onChange={(e) => handlePricingFieldChange(idx, "minRoundtripKm", parseInt(e.target.value) || 250)}
                        className="w-full px-2.5 py-1.5 bg-background border border-border rounded-xl text-foreground font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                      Daily Driver Allowance (₹)
                    </label>
                    <input
                      type="number"
                      value={v.driverAllowance}
                      onChange={(e) => handlePricingFieldChange(idx, "driverAllowance", parseFloat(e.target.value) || 400)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* DRIVER ASSIGNMENT / EDIT MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
              <div>
                <h3 className="text-lg font-black text-foreground">
                  Dispatch Voucher: {editingBooking.bookingId}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Customer: {editingBooking.customerName} ({editingBooking.customerPhone})
                </p>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBookingModal} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                  Trip Status
                </label>
                <select
                  value={editingBooking.status}
                  onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pending">Pending Confirmation</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="driver_assigned">Driver Assigned</option>
                  <option value="in_progress">Trip In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Murugan"
                    value={editingBooking.driverName || ""}
                    onChange={(e) => setEditingBooking({ ...editingBooking, driverName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                    Driver Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={editingBooking.driverPhone || ""}
                    onChange={(e) => setEditingBooking({ ...editingBooking, driverPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  placeholder="PY-01-AB-1234"
                  value={editingBooking.vehicleNumber || ""}
                  onChange={(e) => setEditingBooking({ ...editingBooking, vehicleNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                    Total Fare (₹)
                  </label>
                  <input
                    type="number"
                    value={editingBooking.actualFare || 0}
                    onChange={(e) => setEditingBooking({ ...editingBooking, actualFare: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                    Advance (₹)
                  </label>
                  <input
                    type="number"
                    value={editingBooking.advancePaid || 0}
                    onChange={(e) => {
                      const adv = parseFloat(e.target.value) || 0;
                      const bal = (editingBooking.actualFare || 0) - adv;
                      setEditingBooking({ ...editingBooking, advancePaid: adv, balanceAmount: bal });
                    }}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                    Balance (₹)
                  </label>
                  <input
                    type="number"
                    value={editingBooking.balanceAmount || 0}
                    onChange={(e) => setEditingBooking({ ...editingBooking, balanceAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                  Admin Internal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Customer requested child seat, pickup from hotel lobby..."
                  value={editingBooking.adminNotes || ""}
                  onChange={(e) => setEditingBooking({ ...editingBooking, adminNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-medium resize-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="w-1/3 py-2.5 rounded-xl border border-border text-foreground font-bold text-xs hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBooking}
                  className="w-2/3 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  {savingBooking ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Save Dispatch Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

