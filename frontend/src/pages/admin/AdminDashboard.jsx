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
  trackAnalyticsEvent,
  fetchAdminDrivers,
  createAdminDriver,
  updateAdminDriver,
  deleteAdminDriver,
  fetchAdminVehicles,
  createAdminVehicle,
  updateAdminVehicle,
  deleteAdminVehicle,
  fetchAdminReports,
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
  Plus,
  Trash2,
  FileCheck,
  Award,
  BarChart3,
  Check,
  Star,
  MapPin,
  FileText,
  User,
  Layers,
  ChevronRight,
  TrendingDown,
  Activity,
  CheckCircle,
  Clock3,
} from "lucide-react";

// Helpers for numeric rounding & WhatsApp formatting
const roundVal = (val) => Math.round(Number(val) || 0);

const cleanPhoneForWhatsApp = (phone) => {
  if (!phone) return "";
  let digits = String(phone).replace(/[^0-9]/g, "");
  if (digits.length === 10) digits = "91" + digits;
  else if (digits.length === 11 && digits.startsWith("0")) digits = "91" + digits.slice(1);
  return digits;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  // Navigation Tabs: 'leads' | 'bookings' | 'drivers' | 'vehicles' | 'pricing' | 'reports'
  const [activeTab, setActiveTab] = useState("leads");

  // 1. Metric Stats (4 Core Cards)
  const [stats, setStats] = useState({
    todayLeads: 0,
    totalLeads: 0,
    newEnquiries: 0,
    pendingBookings: 0,
    activeTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    totalBookings: 0,
    whatsappClicks: 0,
    conversionRate: 0,
    cancellationRate: 0,
  });

  // 2. Leads State
  const [leads, setLeads] = useState([]);
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [leadSearch, setLeadSearch] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(false);

  // 3. Bookings State
  const [bookings, setBookings] = useState([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingTripTypeFilter, setBookingTripTypeFilter] = useState("all"); // 'all' | 'oneway' | 'round'
  const [bookingSearch, setBookingSearch] = useState("");
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Edit / Driver Assignment Modal
  const [editingBooking, setEditingBooking] = useState(null);
  const [savingBooking, setSavingBooking] = useState(false);

  // 4. Drivers State
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [driverSearch, setDriverSearch] = useState("");
  const [driverStatusFilter, setDriverStatusFilter] = useState("all");
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [savingDriver, setSavingDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    vehicleModel: "",
    vehicleNumber: "",
    status: "active",
    documentsApproved: true,
  });

  // 5. Vehicles State
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState("all");
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    category: "sedan",
    modelName: "",
    registrationNumber: "",
    assignedDriverId: "",
    insuranceExpiry: "",
    fitnessExpiry: "",
    status: "active",
  });

  // 6. Pricing State
  const [pricingList, setPricingList] = useState([]);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);

  // 7. Reports State
  const [reportsData, setReportsData] = useState(null);
  const [loadingReports, setLoadingReports] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/admin/login");
      return;
    }
    setCurrentUser(getAdminUser());
  }, [navigate]);

  // Load Dashboard Data Handlers
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

  const loadDrivers = useCallback(async () => {
    setLoadingDrivers(true);
    const data = await fetchAdminDrivers();
    setDrivers(data);
    setLoadingDrivers(false);
  }, []);

  const loadVehicles = useCallback(async () => {
    setLoadingVehicles(true);
    const data = await fetchAdminVehicles();
    setVehicles(data);
    setLoadingVehicles(false);
  }, []);

  const loadPricing = useCallback(async () => {
    setLoadingPricing(true);
    const data = await fetchAdminPricing();
    setPricingList(data);
    setLoadingPricing(false);
  }, []);

  const loadReports = useCallback(async () => {
    setLoadingReports(true);
    const data = await fetchAdminReports();
    if (data) setReportsData(data);
    setLoadingReports(false);
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn()) {
      loadStats();
      if (activeTab === "leads") loadLeads();
      if (activeTab === "bookings") {
        loadBookings();
        loadDrivers();
      }
      if (activeTab === "drivers") loadDrivers();
      if (activeTab === "vehicles") {
        loadVehicles();
        loadDrivers();
      }
      if (activeTab === "pricing") loadPricing();
      if (activeTab === "reports") loadReports();
    }
  }, [activeTab, loadStats, loadLeads, loadBookings, loadDrivers, loadVehicles, loadPricing, loadReports]);

  // General Handlers
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

  const handleOpenEditModal = (booking) => {
    const fare = roundVal(booking.actualFare ?? booking.estimatedFare ?? 0);
    const advance = roundVal(booking.advancePaid ?? 0);
    const balance = Math.max(0, fare - advance);
    setEditingBooking({
      ...booking,
      actualFare: fare,
      advancePaid: advance,
      balanceAmount: balance,
    });
  };

  const handleDriverFieldChange = (field, value) => {
    setEditingBooking((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      if (
        (field === "driverName" || field === "driverPhone" || field === "vehicleNumber") &&
        value.trim() !== ""
      ) {
        if (prev.status === "pending" || prev.status === "confirmed") {
          updated.status = "driver_assigned";
        }
      }
      return updated;
    });
  };

  const handleSelectDriverForBooking = (driverId) => {
    const drv = drivers.find((d) => String(d.id) === String(driverId));
    if (drv) {
      setEditingBooking((prev) => ({
        ...prev,
        driverName: drv.name,
        driverPhone: drv.phone,
        vehicleNumber: drv.vehicleNumber || prev.vehicleNumber || "",
        status: (prev.status === "pending" || prev.status === "confirmed") ? "driver_assigned" : prev.status,
      }));
    }
  };

  const handleSendDriverWhatsApp = (b) => {
    if (!b?.driverPhone) {
      toast.error("Please enter a Driver Phone number first");
      return;
    }
    const cleanPhone = cleanPhoneForWhatsApp(b.driverPhone);
    if (cleanPhone.length < 10) {
      toast.error("Invalid driver phone number. Please enter a valid 10-digit mobile number.");
      return;
    }

    const fare = roundVal(b.actualFare ?? b.estimatedFare ?? 0);
    const advance = roundVal(b.advancePaid ?? 0);
    const balance = roundVal(b.balanceAmount ?? Math.max(0, fare - advance));

    const message = 
`🚖 *PONDY TOURS & TRAVELS - DUTY ASSIGNMENT*
━━━━━━━━━━━━━━━━━━━━━━
📋 *Duty / Booking ID:* #${b.bookingId}
👤 *Customer:* ${b.customerName}
📞 *Customer Mobile:* ${b.customerPhone}

📍 *Pickup Location:* ${b.pickup}
🏁 *Drop Location:* ${b.drop}
📅 *Date & Time:* ${b.travelDate} at ${b.preferredTime}
🚗 *Vehicle Type:* ${(b.vehicleType || "CAB").toUpperCase()}
🚘 *Vehicle Reg:* ${b.vehicleNumber || "Assigned"}
${b.tripType === "round" ? "🔄 *Trip Mode:* ROUND TRIP\n" : "➡️ *Trip Mode:* ONE-WAY\n"}
💰 *FARE & COLLECTION DETAILS:*
• Total Trip Fare: ₹${fare}
• Advance Collected: ₹${advance}
• *Cash/UPI to Collect from Customer:* ₹${balance}
${b.adminNotes ? `\n📝 *Special Instructions:* ${b.adminNotes}` : ""}
━━━━━━━━━━━━━━━━━━━━━━
*Pondy Tours & Travels Dispatch Desk*
📞 Helpline: +91 90252 32453
🌐 pondytourstravels.com`;

    trackAnalyticsEvent("admin_driver_whatsapp_dispatch", "/admin", {
      booking_id: b.bookingId,
      driver_name: b.driverName,
      driver_phone: cleanPhone,
      total_fare: fare,
      balance_amount: balance,
    });

    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success(`Opening WhatsApp for driver ${b.driverName || b.driverPhone}`);
  };

  const handleSendCustomerWhatsApp = (b) => {
    if (!b?.customerPhone) {
      toast.error("Customer phone number is missing");
      return;
    }
    const cleanPhone = cleanPhoneForWhatsApp(b.customerPhone);
    const fare = roundVal(b.actualFare ?? b.estimatedFare ?? 0);
    const advance = roundVal(b.advancePaid ?? 0);
    const balance = roundVal(b.balanceAmount ?? Math.max(0, fare - advance));

    const message =
`🚖 *PONDY TOURS & TRAVELS - TRIP CONFIRMATION*
━━━━━━━━━━━━━━━━━━━━━━
Dear *${b.customerName}*, your trip booking is confirmed!

📋 *Booking ID:* ${b.bookingId}
📍 *Pickup Location:* ${b.pickup}
🏁 *Drop Location:* ${b.drop}
📅 *Date & Time:* ${b.travelDate} at ${b.preferredTime}
🚗 *Vehicle Type:* ${(b.vehicleType || "CAB").toUpperCase()}
${b.tripType === "round" ? "🔄 *Trip Mode:* Round Trip\n" : "➡️ *Trip Mode:* One-Way Drop\n"}${b.vehicleNumber ? `🚘 *Vehicle Reg No:* ${b.vehicleNumber}\n` : ""}${b.driverName ? `👨‍✈️ *Driver Assigned:* ${b.driverName} (${b.driverPhone || "Will call you shortly"})\n` : "👨‍✈️ *Driver Details:* Will be dispatched before departure\n"}
💰 *FARE DETAILS:*
• Total Fare: ₹${fare}
• Advance Paid: ₹${advance}
• *Balance Payable to Driver:* ₹${balance}
━━━━━━━━━━━━━━━━━━━━━━
Have a pleasant and safe journey with us!
📞 24/7 Helpline: +91 90252 32453
🌐 pondytourstravels.com`;

    trackAnalyticsEvent("admin_customer_whatsapp_dispatch", "/admin", {
      booking_id: b.bookingId,
      customer_phone: cleanPhone,
      fare: fare,
    });

    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success(`Opening WhatsApp voucher for ${b.customerName}`);
  };

  const handleSaveBookingModal = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;
    setSavingBooking(true);
    const actualFare = roundVal(editingBooking.actualFare);
    const advancePaid = roundVal(editingBooking.advancePaid);
    const balanceAmount = roundVal(editingBooking.balanceAmount ?? Math.max(0, actualFare - advancePaid));

    try {
      const res = await updateBookingDetails(editingBooking.id, {
        status: editingBooking.status,
        driverName: editingBooking.driverName,
        driverPhone: editingBooking.driverPhone,
        vehicleNumber: editingBooking.vehicleNumber,
        actualFare: actualFare,
        advancePaid: advancePaid,
        balanceAmount: balanceAmount,
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

  // Driver Management Handlers
  const handleCreateDriver = async (e) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.phone) {
      toast.error("Driver Name and Phone are required");
      return;
    }
    setSavingDriver(true);
    const res = await createAdminDriver(newDriver);
    if (res.success) {
      toast.success(`Driver ${newDriver.name} registered successfully`);
      setDriverModalOpen(false);
      setNewDriver({
        name: "",
        phone: "",
        licenseNumber: "",
        vehicleModel: "",
        vehicleNumber: "",
        status: "active",
        documentsApproved: true,
      });
      loadDrivers();
    } else {
      toast.error(res.error || "Failed to register driver");
    }
    setSavingDriver(false);
  };

  const handleUpdateDriverStatus = async (driverId, newStatus) => {
    const res = await updateAdminDriver(driverId, { status: newStatus });
    if (res.success) {
      toast.success("Driver status updated");
      setDrivers((prev) => prev.map((d) => d.id === driverId ? { ...d, status: newStatus } : d));
    } else {
      toast.error(res.error || "Failed to update driver status");
    }
  };

  const handleToggleDriverDocApproval = async (driverId, currentVal) => {
    const res = await updateAdminDriver(driverId, { documentsApproved: !currentVal });
    if (res.success) {
      toast.success(!currentVal ? "Driver documents approved!" : "Driver documents set to pending");
      setDrivers((prev) => prev.map((d) => d.id === driverId ? { ...d, documentsApproved: !currentVal } : d));
    } else {
      toast.error(res.error || "Failed to update documents approval");
    }
  };

  // Vehicle Management Handlers
  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    if (!newVehicle.modelName || !newVehicle.registrationNumber) {
      toast.error("Model Name and Registration Number are required");
      return;
    }
    setSavingVehicle(true);
    const res = await createAdminVehicle(newVehicle);
    if (res.success) {
      toast.success(`Vehicle ${newVehicle.registrationNumber} added to fleet`);
      setVehicleModalOpen(false);
      setNewVehicle({
        category: "sedan",
        modelName: "",
        registrationNumber: "",
        assignedDriverId: "",
        insuranceExpiry: "",
        fitnessExpiry: "",
        status: "active",
      });
      loadVehicles();
    } else {
      toast.error(res.error || "Failed to add vehicle");
    }
    setSavingVehicle(false);
  };

  const handleUpdateVehicleStatus = async (vehicleId, newStatus) => {
    const res = await updateAdminVehicle(vehicleId, { status: newStatus });
    if (res.success) {
      toast.success("Vehicle status updated");
      setVehicles((prev) => prev.map((v) => v.id === vehicleId ? { ...v, status: newStatus } : v));
    } else {
      toast.error(res.error || "Failed to update vehicle status");
    }
  };

  // Pricing Matrix Handlers
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

  // Filtered Bookings for the upgraded Bookings tab
  const filteredBookings = bookings.filter((b) => {
    if (bookingStatusFilter !== "all" && b.status !== bookingStatusFilter) return false;
    if (bookingTripTypeFilter !== "all" && b.tripType !== bookingTripTypeFilter) return false;
    if (bookingSearch.trim() !== "") {
      const q = bookingSearch.toLowerCase();
      const matchName = b.customerName?.toLowerCase().includes(q);
      const matchId = b.bookingId?.toLowerCase().includes(q);
      const matchRoute = (b.pickup + " " + b.drop).toLowerCase().includes(q);
      const matchDriver = b.driverName?.toLowerCase().includes(q);
      return matchName || matchId || matchRoute || matchDriver;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground font-sans antialiased">
      {/* Top Navbar - Sticky & Clean */}
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm backdrop-blur-md">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-foreground flex items-center gap-1.5 sm:gap-2">
                <span>Pondy Tours</span>
                <span className="text-primary text-[10px] sm:text-xs px-2 py-0.5 bg-primary/10 rounded-full font-bold">
                  Admin Portal
                </span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-semibold hidden sm:block">
                Taxi Dispatch & Fleet Management Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-border"
            >
              <span>View Customer Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-3">
              <span className="text-xs font-bold text-muted-foreground hidden sm:inline">
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
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1 space-y-5 max-w-7xl">
        
        {/* ============================================================== */}
        {/* 1. FOUR STATISTIC CARDS (Exact Layout from Specification)      */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* CARD 1: Today's Enquiries */}
          <div className="bg-card border border-border rounded-2xl p-3.5 sm:p-5 shadow-card hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-black uppercase text-muted-foreground tracking-wide">
                Today's Enquiries
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-foreground">
              {stats.todayLeads || 0}
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 font-semibold flex items-center gap-1">
              <span>Total: <strong className="text-foreground">{stats.totalLeads || 0}</strong></span>
              <span>•</span>
              <span className="text-primary">New: {stats.newEnquiries || 0}</span>
            </p>
          </div>

          {/* CARD 2: Pending Bookings */}
          <div className="bg-card border border-border rounded-2xl p-3.5 sm:p-5 shadow-card hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-black uppercase text-muted-foreground tracking-wide">
                Pending Bookings
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock3 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-foreground">
              {stats.pendingBookings || 0}
            </p>
            <p className="text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-semibold">
              Awaiting confirmation / driver
            </p>
          </div>

          {/* CARD 3: Active Trips */}
          <div className="bg-card border border-border rounded-2xl p-3.5 sm:p-5 shadow-card hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-black uppercase text-muted-foreground tracking-wide">
                Active Trips
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-foreground">
              {stats.activeTrips || stats.activeBookings || 0}
            </p>
            <p className="text-[10px] sm:text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-semibold">
              Confirmed & In-Progress
            </p>
          </div>

          {/* CARD 4: Completed Trips */}
          <div className="bg-card border border-border rounded-2xl p-3.5 sm:p-5 shadow-card hover:border-green-500/40 transition-colors">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-black uppercase text-muted-foreground tracking-wide">
                Completed Trips
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-foreground">
              {stats.completedTrips || stats.completedBookings || 0}
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 font-semibold flex items-center gap-1">
              <span>Conv: <strong className="text-green-600">{stats.conversionRate || 0}%</strong></span>
              <span>•</span>
              <span>Clicks: {stats.whatsappClicks || 0}</span>
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. NAVIGATION BAR (Clean, Horizontal Scrollable on Mobile)     */}
        {/* ============================================================== */}
        <div className="bg-card border border-border rounded-2xl p-1.5 sm:p-2 shadow-sm overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2 min-w-max">
            {[
              { id: "leads", label: "Enquiries & Leads", icon: Users, count: stats.todayLeads },
              { id: "bookings", label: "Bookings & Dispatch", icon: Car, count: stats.pendingBookings },
              { id: "drivers", label: "Drivers", icon: UserCheck, count: drivers.length },
              { id: "vehicles", label: "Vehicles", icon: Layers, count: vehicles.length },
              { id: "pricing", label: "Vehicle Pricing", icon: DollarSign },
              { id: "reports", label: "Reports", icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl whitespace-nowrap transition-all font-black text-xs min-h-[38px] ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? "bg-white/25 text-white" : "bg-primary/15 text-primary"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: ENQUIRIES & LEADS                                       */}
        {/* ============================================================== */}
        {activeTab === "leads" && (
          <div className="space-y-4 animate-fade-in">
            {/* Filter and Search Bar */}
            <div className="bg-card p-3 sm:p-4 rounded-2xl border border-border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by customer name, phone, pickup, drop..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadLeads()}
                    className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <button
                  onClick={loadLeads}
                  disabled={loadingLeads}
                  className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0 hidden sm:inline" />
                {["all", "enquiry", "whatsapp_clicked", "contacted", "converted", "lost"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setLeadStatusFilter(st)}
                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider whitespace-nowrap transition-colors ${
                      leadStatusFilter === st
                        ? "bg-primary text-primary-foreground font-black"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads Table / Card List */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/70 text-muted-foreground uppercase font-black tracking-wider text-[10px] border-b border-border">
                    <tr>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Route Details</th>
                      <th className="p-3">Trip Date & Time</th>
                      <th className="p-3">Vehicle & Fare</th>
                      <th className="p-3">Enquiry Status</th>
                      <th className="p-3 text-right">Quick WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingLeads ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                          <span>Loading enquiries...</span>
                        </td>
                      </tr>
                    ) : leads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground font-semibold">
                          No customer enquiries found matching the selected filter.
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-muted/40 transition-colors">
                          <td className="p-3">
                            <p className="font-bold text-foreground text-sm">{lead.customerName}</p>
                            <a href={`tel:${lead.customerPhone}`} className="text-muted-foreground hover:text-primary font-semibold flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-primary" />
                              <span>{lead.customerPhone}</span>
                            </a>
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-1.5 font-bold text-foreground">
                              <span className="truncate max-w-[140px]">{lead.pickup}</span>
                              <span className="text-primary font-black">➔</span>
                              <span className="truncate max-w-[140px]">{lead.drop}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                              {lead.tripType === "round" ? "Round Trip" : "One-Way"} • {lead.distanceKm} km
                            </span>
                          </td>

                          <td className="p-3 font-semibold text-muted-foreground">
                            <div className="flex items-center gap-1 text-foreground font-bold">
                              <Calendar className="w-3 h-3 text-primary" />
                              <span>{lead.travelDate}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{lead.preferredTime}</span>
                            </div>
                          </td>

                          <td className="p-3 font-semibold">
                            <p className="uppercase text-[11px] font-black text-foreground">
                              {lead.vehicleType}
                            </p>
                            <p className="text-sm font-black text-primary">₹{lead.estimatedFare}</p>
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
                              href={`https://wa.me/${cleanPhoneForWhatsApp(lead.customerPhone)}?text=${encodeURIComponent(
                                `Hello ${lead.customerName}, regarding your Pondy Tours ride enquiry from ${lead.pickup} to ${lead.drop}:`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-xs transition-colors shadow-sm"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
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

        {/* ============================================================== */}
        {/* TAB 2: BOOKINGS & DISPATCH (Upgraded Card Specification)       */}
        {/* ============================================================== */}
        {activeTab === "bookings" && (
          <div className="space-y-4 animate-fade-in">
            {/* Filters Bar */}
            <div className="bg-card p-3 sm:p-4 rounded-2xl border border-border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by Booking ID, customer, route, or driver..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Status and Trip Mode Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <div className="flex bg-muted p-0.5 rounded-xl">
                  {["all", "oneway", "round"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setBookingTripTypeFilter(m)}
                      className={`text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider transition-colors ${
                        bookingTripTypeFilter === m
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m === "all" ? "All Trips" : m === "round" ? "Round Trip" : "One-Way"}
                    </button>
                  ))}
                </div>

                {["all", "pending", "confirmed", "driver_assigned", "in_progress", "completed", "cancelled"].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setBookingStatusFilter(st)}
                      className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider whitespace-nowrap transition-colors ${
                        bookingStatusFilter === st
                          ? "bg-primary text-primary-foreground font-black"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  )
                )}

                <button
                  onClick={loadBookings}
                  disabled={loadingBookings}
                  className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground ml-1"
                  title="Refresh"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingBookings ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Grid of Upgraded Booking Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingBookings ? (
                <div className="col-span-full p-12 text-center text-muted-foreground">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="font-bold text-sm">Loading dispatch bookings...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="col-span-full p-12 text-center text-muted-foreground font-bold bg-card border border-border rounded-2xl">
                  No booking vouchers found matching your filter criteria.
                </div>
              ) : (
                filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* 1. Header: Booking ID, Trip Type badge, Status badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                            {b.bookingId}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              b.tripType === "round"
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {b.tripType === "round" ? "Round Trip" : "One-Way"}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            b.status === "completed"
                              ? "bg-green-500/10 text-green-600 border border-green-500/20"
                              : b.status === "driver_assigned"
                              ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                              : b.status === "in_progress"
                              ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                              : b.status === "cancelled"
                              ? "bg-destructive/10 text-destructive border border-destructive/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          {b.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* 2. Customer Name & Phone */}
                      <div className="flex items-baseline justify-between mb-2">
                        <h3 className="font-black text-base text-foreground truncate">{b.customerName}</h3>
                        <a
                          href={`tel:${b.customerPhone}`}
                          className="text-xs text-muted-foreground hover:text-primary font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-primary" />
                          <span>{b.customerPhone}</span>
                        </a>
                      </div>

                      {/* 3. Route & Date Box */}
                      <div className="py-2.5 px-3 bg-muted/60 rounded-xl text-xs space-y-1.5 border border-border/50">
                        <div className="flex items-center gap-1.5 font-black text-foreground">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{b.pickup}</span>
                          <span className="text-primary font-black">➔</span>
                          <span className="truncate">{b.drop}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold pt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{b.travelDate} at {b.preferredTime}</span>
                          </span>
                          <span className="uppercase font-bold text-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                            {b.vehicleType}
                          </span>
                        </div>
                        {b.tripType === "round" && (
                          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 pt-0.5 border-t border-border/40">
                            <span>🔄 Return: {b.drop} ➔ {b.pickup}</span>
                          </div>
                        )}
                      </div>

                      {/* 4. Driver Assignment & Fare Summary */}
                      <div className="mt-3 pt-3 border-t border-border space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Driver Assigned:</span>
                          <span className="font-bold text-foreground">
                            {b.driverName ? (
                              <span className="text-foreground font-black">{b.driverName}</span>
                            ) : (
                              <span className="text-amber-500 font-normal">Not assigned</span>
                            )}
                          </span>
                        </div>
                        {b.driverPhone && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Driver Phone:</span>
                            <a href={`tel:${b.driverPhone}`} className="font-bold text-primary hover:underline">
                              {b.driverPhone}
                            </a>
                          </div>
                        )}
                        {b.vehicleNumber && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Vehicle Reg:</span>
                            <span className="font-bold uppercase tracking-wider text-foreground">{b.vehicleNumber}</span>
                          </div>
                        )}

                        {/* Fare Breakdown Row */}
                        <div className="flex justify-between items-center pt-2 border-t border-border/60">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Trip Fare</span>
                            <span className="font-black text-primary text-base">₹{b.actualFare}</span>
                          </div>
                          {b.advancePaid > 0 && (
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Advance</span>
                              <span className="font-bold text-green-600 text-xs">₹{b.advancePaid}</span>
                            </div>
                          )}
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Balance</span>
                            <span className="font-black text-foreground text-sm">₹{b.balanceAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Action Buttons Bar */}
                    <div className="mt-4 pt-3 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(b)}
                        className="flex-1 min-h-[40px] py-2 px-3 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Assign Driver / Edit</span>
                      </button>

                      {b.driverPhone && (
                        <button
                          type="button"
                          onClick={() => handleSendDriverWhatsApp(b)}
                          className="min-h-[40px] px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          title="Send Duty Assignment to Driver on WhatsApp"
                        >
                          <Car className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Driver</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSendCustomerWhatsApp(b)}
                        className="min-h-[40px] px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        title="Send Voucher to Customer on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Customer</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: DRIVER MANAGEMENT                                       */}
        {/* ============================================================== */}
        {activeTab === "drivers" && (
          <div className="space-y-4 animate-fade-in">
            {/* Top Bar: Search, Status Filter & Add Driver */}
            <div className="bg-card p-3 sm:p-4 rounded-2xl border border-border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search driver by name, phone, or license..."
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                {/* Filter */}
                <select
                  value={driverStatusFilter}
                  onChange={(e) => setDriverStatusFilter(e.target.value)}
                  className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active & Available</option>
                  <option value="on_duty">On Duty</option>
                  <option value="pending">Pending Approval</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <button
                onClick={() => setDriverModalOpen(true)}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Register Driver</span>
              </button>
            </div>

            {/* Drivers Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingDrivers ? (
                <div className="col-span-full p-12 text-center text-muted-foreground">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="font-bold text-sm">Loading registered drivers...</p>
                </div>
              ) : drivers.length === 0 ? (
                <div className="col-span-full p-12 text-center text-muted-foreground font-bold bg-card border border-border rounded-2xl">
                  No registered drivers found. Click "Register Driver" to onboard your first driver.
                </div>
              ) : (
                drivers
                  .filter((d) => {
                    if (driverStatusFilter !== "all" && d.status !== driverStatusFilter) return false;
                    if (driverSearch.trim() !== "") {
                      const q = driverSearch.toLowerCase();
                      return (
                        d.name?.toLowerCase().includes(q) ||
                        d.phone?.toLowerCase().includes(q) ||
                        d.licenseNumber?.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  })
                  .map((d) => (
                    <div
                      key={d.id}
                      className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: Driver Name, Rating & Status */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-black text-base text-foreground">{d.name}</h3>
                            <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-primary" />
                              <span>{d.phone}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-lg text-xs font-black">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{d.rating || "4.9"}</span>
                          </div>
                        </div>

                        {/* Driver details */}
                        <div className="my-3 py-2.5 px-3 bg-muted/60 rounded-xl text-xs space-y-1.5 border border-border/50">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">License No:</span>
                            <span className="font-bold text-foreground font-mono">{d.licenseNumber || "Verified"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Assigned Cab:</span>
                            <span className="font-bold text-foreground">
                              {d.vehicleModel || "Standard Sedan"} {d.vehicleNumber ? `(${d.vehicleNumber})` : ""}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Trips Completed:</span>
                            <span className="font-black text-primary">{d.totalTrips || 0} journeys</span>
                          </div>
                        </div>

                        {/* Documents & Verification status */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                          <span className="text-muted-foreground font-semibold">Documents:</span>
                          <button
                            onClick={() => handleToggleDriverDocApproval(d.id, d.documentsApproved)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition-colors ${
                              d.documentsApproved
                                ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                            }`}
                          >
                            <FileCheck className="w-3 h-3" />
                            <span>{d.documentsApproved ? "Approved ✅" : "Review Needed ⏳"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Status Toggle & Quick Actions */}
                      <div className="mt-4 pt-3 flex items-center gap-2 border-t border-border">
                        <select
                          value={d.status}
                          onChange={(e) => handleUpdateDriverStatus(d.id, e.target.value)}
                          className="flex-1 bg-background border border-border rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none"
                        >
                          <option value="active">🟢 Active</option>
                          <option value="on_duty">🔵 On Duty</option>
                          <option value="pending">🟡 Pending</option>
                          <option value="suspended">🔴 Suspended</option>
                        </select>

                        <a
                          href={`tel:${d.phone}`}
                          className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                          title="Call Driver"
                        >
                          <Phone className="w-4 h-4" />
                        </a>

                        <a
                          href={`https://wa.me/${cleanPhoneForWhatsApp(d.phone)}?text=${encodeURIComponent(
                            `Hello ${d.name}, Pondy Tours dispatch coordination update:`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors"
                          title="WhatsApp Driver"
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

        {/* ============================================================== */}
        {/* TAB 4: VEHICLE MANAGEMENT                                      */}
        {/* ============================================================== */}
        {activeTab === "vehicles" && (
          <div className="space-y-4 animate-fade-in">
            {/* Top Bar */}
            <div className="bg-card p-3 sm:p-4 rounded-2xl border border-border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-xs font-black uppercase text-muted-foreground">Category:</span>
                {["all", "sedan", "muv", "innova", "crysta"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setVehicleCategoryFilter(cat)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider whitespace-nowrap transition-colors ${
                      vehicleCategoryFilter === cat
                        ? "bg-primary text-primary-foreground font-black"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat === "all" ? "All Fleet" : cat.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setVehicleModalOpen(true)}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </button>
            </div>

            {/* Vehicles Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingVehicles ? (
                <div className="col-span-full p-12 text-center text-muted-foreground">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="font-bold text-sm">Loading fleet vehicles...</p>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="col-span-full p-12 text-center text-muted-foreground font-bold bg-card border border-border rounded-2xl">
                  No fleet vehicles found. Click "Add Vehicle" to register your cars.
                </div>
              ) : (
                vehicles
                  .filter((v) => {
                    if (vehicleCategoryFilter !== "all" && v.category !== vehicleCategoryFilter) return false;
                    return true;
                  })
                  .map((v) => (
                    <div
                      key={v.id}
                      className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Category & Status */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {v.category?.toUpperCase() || "CAB"}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              v.status === "active"
                                ? "bg-green-500/10 text-green-600"
                                : v.status === "maintenance"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {v.status}
                          </span>
                        </div>

                        {/* Model & Registration */}
                        <h3 className="font-black text-base text-foreground">{v.modelName}</h3>
                        <p className="text-xs font-mono font-bold tracking-wider text-primary mt-0.5">
                          {v.registrationNumber}
                        </p>

                        {/* Vehicle Document Expiry Details */}
                        <div className="my-3 py-2.5 px-3 bg-muted/60 rounded-xl text-xs space-y-1.5 border border-border/50">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Driver:</span>
                            <span className="font-bold text-foreground">
                              {v.assignedDriver || "Unassigned"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Insurance Expiry:</span>
                            <span className="font-bold text-foreground">
                              {v.insuranceExpiry || "2027-12-31"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Fitness Expiry:</span>
                            <span className="font-bold text-foreground">
                              {v.fitnessExpiry || "2028-06-30"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Toggle */}
                      <div className="mt-2 pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">Vehicle Status:</span>
                        <select
                          value={v.status}
                          onChange={(e) => handleUpdateVehicleStatus(v.id, e.target.value)}
                          className="bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
                        >
                          <option value="active">🟢 Active</option>
                          <option value="maintenance">🟡 Maintenance</option>
                          <option value="inactive">🔴 Inactive</option>
                        </select>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: VEHICLE PRICING MATRIX                                  */}
        {/* ============================================================== */}
        {activeTab === "pricing" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card p-4 rounded-2xl border border-border gap-3">
              <div>
                <h2 className="text-base font-black text-foreground">Live Vehicle Pricing Matrix</h2>
                <p className="text-xs text-muted-foreground">
                  Update per-km rates for one-way drops, round trips, and driver allowances in real time.
                </p>
              </div>

              <button
                onClick={handleSavePricing}
                disabled={savingPricing}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-black px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 text-xs transition-all disabled:opacity-50"
              >
                {savingPricing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Live Rates</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pricingList.map((v, idx) => (
                <div key={v.code} className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-3.5">
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
                      Driver Allowance (₹)
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

        {/* ============================================================== */}
        {/* TAB 6: REPORTS & BUSINESS INTELLIGENCE                         */}
        {/* ============================================================== */}
        {activeTab === "reports" && (
          <div className="space-y-5 animate-fade-in">
            {/* Reports Top Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
                <span className="text-xs font-bold text-muted-foreground uppercase">Total Fare Revenue</span>
                <p className="text-2xl font-black text-primary mt-1">₹{reportsData?.totalRevenue || 0}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">from active & completed trips</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
                <span className="text-xs font-bold text-muted-foreground uppercase">Confirmed Conversion</span>
                <p className="text-2xl font-black text-green-600 mt-1">{reportsData?.conversionRate || 0}%</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">confirmed bookings / total enquiries</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
                <span className="text-xs font-bold text-muted-foreground uppercase">Cancellation Rate</span>
                <p className="text-2xl font-black text-destructive mt-1">{reportsData?.cancellationRate || 0}%</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{reportsData?.cancelledTrips || 0} cancelled bookings</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
                <span className="text-xs font-bold text-muted-foreground uppercase">Completed Journeys</span>
                <p className="text-2xl font-black text-foreground mt-1">{reportsData?.completedTrips || 0}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">out of {reportsData?.totalBookings || 0} bookings</p>
              </div>
            </div>

            {/* Popular Routes and Vehicle Demand */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Top Routes */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
                <h3 className="font-black text-sm uppercase text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Top Route Demand</span>
                </h3>
                <div className="space-y-2">
                  {reportsData?.topRoutes && reportsData.topRoutes.length > 0 ? (
                    reportsData.topRoutes.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-muted/60 rounded-xl text-xs font-bold">
                        <span className="text-foreground">{r.route}</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-black">
                          {r.count} enquiries
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2.5 bg-muted/60 rounded-xl text-xs font-bold flex justify-between">
                      <span>Pondicherry ➔ Chennai</span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-black">High Demand</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Demand Distribution */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
                <h3 className="font-black text-sm uppercase text-foreground mb-3 flex items-center gap-2">
                  <Car className="w-4 h-4 text-primary" />
                  <span>Fleet Demand Breakdown</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Sedan (Dzire / Etios)", key: "sedan", color: "bg-blue-600" },
                    { name: "MUV (Ertiga)", key: "muv", color: "bg-amber-500" },
                    { name: "Innova 6+1", key: "innova", color: "bg-purple-600" },
                    { name: "Innova Crysta Luxury", key: "crysta", color: "bg-emerald-600" },
                  ].map((cat) => {
                    const count = reportsData?.vehicleDistribution?.[cat.key] || 0;
                    return (
                      <div key={cat.key} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-muted-foreground">{cat.name}</span>
                          <span className="text-foreground">{count} bookings</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${cat.color} rounded-full`}
                            style={{ width: `${Math.min(100, Math.max(15, count * 20))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Driver Performance Table */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
              <h3 className="font-black text-sm uppercase text-foreground mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span>Driver Performance & Dispatch Records</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-black border-b border-border">
                    <tr>
                      <th className="p-3">Driver Name</th>
                      <th className="p-3">Mobile</th>
                      <th className="p-3">Trips Completed</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Total Revenue</th>
                      <th className="p-3">Current Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(reportsData?.driverStats && reportsData.driverStats.length > 0 ? reportsData.driverStats : drivers).map((d, i) => (
                      <tr key={i} className="hover:bg-muted/40 transition-colors">
                        <td className="p-3 font-bold text-foreground">{d.name}</td>
                        <td className="p-3 text-muted-foreground font-semibold">{d.phone}</td>
                        <td className="p-3 font-black text-primary">{d.trips || d.totalTrips || 0}</td>
                        <td className="p-3 font-bold text-amber-500">⭐ {d.rating || "4.9"}</td>
                        <td className="p-3 font-bold text-foreground">₹{d.revenue || "0"}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600">
                            {d.status || "Active"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL 1: DISPATCH VOUCHER / DRIVER ASSIGNMENT MODAL            */}
      {/* ============================================================== */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl animate-fade-in max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-border mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Dispatch Voucher: {editingBooking.bookingId}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Customer: {editingBooking.customerName} ({editingBooking.customerPhone})
                </p>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBookingModal} className="space-y-3.5">
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
                  <option value="completed">Trip Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Quick Select from Registered Drivers */}
              {drivers.length > 0 && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                    Quick Assign Registered Driver
                  </label>
                  <select
                    onChange={(e) => handleSelectDriverForBooking(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled>-- Select a registered driver --</option>
                    {drivers.map((drv) => (
                      <option key={drv.id} value={drv.id}>
                        {drv.name} ({drv.phone}) - {drv.status === "active" ? "🟢 Available" : "🔵 " + drv.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Murugan"
                    value={editingBooking.driverName || ""}
                    onChange={(e) => handleDriverFieldChange("driverName", e.target.value)}
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
                    onChange={(e) => handleDriverFieldChange("driverPhone", e.target.value)}
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
                  onChange={(e) => handleDriverFieldChange("vehicleNumber", e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                    Total Fare (₹)
                  </label>
                  <input
                    type="number"
                    value={editingBooking.actualFare ?? 0}
                    onChange={(e) => {
                      const fare = roundVal(e.target.value);
                      const adv = roundVal(editingBooking.advancePaid);
                      setEditingBooking({
                        ...editingBooking,
                        actualFare: fare,
                        balanceAmount: Math.max(0, fare - adv),
                      });
                    }}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                    Advance (₹)
                  </label>
                  <input
                    type="number"
                    value={editingBooking.advancePaid ?? 0}
                    onChange={(e) => {
                      const adv = roundVal(e.target.value);
                      const fare = roundVal(editingBooking.actualFare);
                      setEditingBooking({
                        ...editingBooking,
                        advancePaid: adv,
                        balanceAmount: Math.max(0, fare - adv),
                      });
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
                    value={editingBooking.balanceAmount ?? 0}
                    onChange={(e) => {
                      const bal = roundVal(e.target.value);
                      setEditingBooking({
                        ...editingBooking,
                        balanceAmount: bal,
                      });
                    }}
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

              {/* Instant WhatsApp Dispatch Panel */}
              <div className="bg-muted/50 p-3.5 rounded-2xl border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-foreground">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    <span>WhatsApp Dispatch</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    Opens installed WhatsApp
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendDriverWhatsApp(editingBooking)}
                    disabled={!editingBooking.driverPhone}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Car className="w-4 h-4" />
                    <span>Send Duty to Driver</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendCustomerWhatsApp(editingBooking)}
                    className="py-2.5 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Voucher to Customer</span>
                  </button>
                </div>

                {!editingBooking.driverPhone && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                    💡 Assign driver phone above to send the duty assignment slip directly to driver's WhatsApp.
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
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

      {/* ============================================================== */}
      {/* MODAL 2: REGISTER NEW DRIVER MODAL                             */}
      {/* ============================================================== */}
      {driverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl animate-fade-in max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-border mb-4">
              <h3 className="text-base sm:text-lg font-black text-foreground">Register New Driver</h3>
              <button
                onClick={() => setDriverModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Driver Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Murugan K"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98401 23456"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Driving License Number
                </label>
                <input
                  type="text"
                  placeholder="PY-01-20180005678"
                  value={newDriver.licenseNumber}
                  onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    placeholder="Maruti Dzire"
                    value={newDriver.vehicleModel}
                    onChange={(e) => setNewDriver({ ...newDriver, vehicleModel: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Vehicle Reg No
                  </label>
                  <input
                    type="text"
                    placeholder="PY-01-CB-4521"
                    value={newDriver.vehicleNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, vehicleNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Account Status
                </label>
                <select
                  value={newDriver.status}
                  onChange={(e) => setNewDriver({ ...newDriver, status: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold"
                >
                  <option value="active">Active & Ready</option>
                  <option value="pending">Pending Document Approval</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDriverModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-border text-foreground font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDriver}
                  className="w-2/3 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-md"
                >
                  {savingDriver ? "Registering..." : "Register Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: ADD NEW VEHICLE MODAL                                 */}
      {/* ============================================================== */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl animate-fade-in max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-border mb-4">
              <h3 className="text-base sm:text-lg font-black text-foreground">Add Vehicle to Fleet</h3>
              <button
                onClick={() => setVehicleModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Vehicle Category *
                </label>
                <select
                  value={newVehicle.category}
                  onChange={(e) => setNewVehicle({ ...newVehicle, category: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold"
                >
                  <option value="sedan">Sedan (Dzire / Etios)</option>
                  <option value="muv">MUV / SUV (Ertiga)</option>
                  <option value="innova">Innova 6+1</option>
                  <option value="crysta">Innova Crysta Luxury</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Model & Variant *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Toyota Innova Crysta 2.4 ZX"
                  value={newVehicle.modelName}
                  onChange={(e) => setNewVehicle({ ...newVehicle, modelName: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="PY-01-EF-8902"
                  value={newVehicle.registrationNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Insurance Expiry
                  </label>
                  <input
                    type="date"
                    value={newVehicle.insuranceExpiry}
                    onChange={(e) => setNewVehicle({ ...newVehicle, insuranceExpiry: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Fitness Expiry (FC)
                  </label>
                  <input
                    type="date"
                    value={newVehicle.fitnessExpiry}
                    onChange={(e) => setNewVehicle({ ...newVehicle, fitnessExpiry: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setVehicleModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-border text-foreground font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVehicle}
                  className="w-2/3 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-md"
                >
                  {savingVehicle ? "Adding..." : "Add to Fleet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
