import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { 
  createLeadEnquiry, 
  markWhatsAppClicked, 
  getPricingMatrix, 
  DEFAULT_PRICING_MATRIX, 
  trackAnalyticsEvent,
  isCustomerLoggedIn,
  getCustomerUser
} from "../api";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  ArrowRight, 
  Calculator, 
  Sparkles,
  Info,
  ShieldCheck,
  Star,
  Navigation,
  Users,
  Luggage
} from "lucide-react";

const GEOAPIFY_API_KEY = "0ee5cc5556904294a1c55cf28dbf98a5";
const POPULAR_ROUTES = ["Chennai", "Bangalore", "Coimbatore", "Madurai"];

export default function BookingForm() {
  const location = useLocation();
  const [pricingMatrix, setPricingMatrix] = useState(DEFAULT_PRICING_MATRIX);
  const [formData, setFormData] = useState({
    tripType: "oneway",
    pickup: "",
    drop: "",
    optionalStops: "",
    travelDate: "",
    preferredTime: "",
    returnDate: "",
    returnTime: "",
    vehicleType: "",
    passengerCount: 1,
    luggageInfo: "",
    fullName: "",
    phone: "",
    email: "",
    requirements: "",
  });

  useEffect(() => {
    if (isCustomerLoggedIn()) {
      const user = getCustomerUser();
      if (user) {
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || user.name || "",
          phone: prev.phone || user.phone?.replace(/[^0-9]/g, "").slice(-10) || "",
        }));
      }
    }
  }, []);

  useEffect(() => {
    async function loadPricing() {
      const matrix = await getPricingMatrix();
      if (matrix && Object.keys(matrix).length > 0) {
        setPricingMatrix(matrix);
      }
    }
    loadPricing();
  }, []);

  const [loading, setLoading] = useState(false);
  const [calculatingFare, setCalculatingFare] = useState(false);
  const [distance, setDistance] = useState("");
  const [estimatedFare, setEstimatedFare] = useState("");

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [showPickupMenu, setShowPickupMenu] = useState(false);
  const [showDropMenu, setShowDropMenu] = useState(false);

  const pickupCoords = useRef(null);
  const dropCoords = useRef(null);
  const appliedRouteRef = useRef("");
  
  const pickupRef = useRef(null);
  const dropRef = useRef(null);
  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickupRef.current && !pickupRef.current.contains(e.target)) {
        setShowPickupMenu(false);
      }
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDropMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Location Suggestions from Geoapify
  const fetchSuggestions = async (text, isPickup) => {
    if (text.length < 3) {
      if (isPickup) setPickupSuggestions([]);
      else setDropSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          text
        )}&apiKey=${GEOAPIFY_API_KEY}&limit=5&filter=countrycode:in`
      );
      const data = await response.json();
      
      if (isPickup) {
        setPickupSuggestions(data.features || []);
      } else {
        setDropSuggestions(data.features || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (
        (field === "travelDate" || field === "preferredTime") &&
        next.travelDate === getTodayDateString() &&
        next.preferredTime &&
        next.preferredTime <= getCurrentTimeString()
      ) {
        next.preferredTime = "";
        if (field === "preferredTime") {
          toast.error("Please select a future time.");
        }
      }
      return next;
    });
    
    // Invalidate previously calculated distance/fare when locations change
    if (field === "pickup") {
      pickupCoords.current = null;
      setDistance("");
      setEstimatedFare("");
      fetchSuggestions(value, true);
      setShowPickupMenu(true);
    }
    if (field === "drop") {
      dropCoords.current = null;
      setDistance("");
      setEstimatedFare("");
      fetchSuggestions(value, false);
      setShowDropMenu(true);
    }
    if (field === "tripType" || field === "vehicleType") {
      setDistance("");
      setEstimatedFare("");
    }
  };

  const handleSuggestionSelect = async (feature, isPickup) => {
    const name = feature.properties.formatted;
    let coords = feature.geometry.coordinates; // [lon, lat]

    // Geoapify Autocomplete sometimes returns the center of a state (e.g. Puducherry UT) instead of the city.
    // To ensure accuracy, we dynamically fetch the precise location via the Search API, which correctly resolves cities.
    if (feature.properties.result_type === "state" || name.toLowerCase().includes("pudu") || name.toLowerCase().includes("pondi")) {
      const accurate = await geocodeAddress(name);
      if (accurate) {
        coords = [accurate.lon, accurate.lat];
      }
    }

    if (isPickup) {
      setFormData((prev) => ({ ...prev, pickup: name }));
      pickupCoords.current = { lat: coords[1], lon: coords[0] };
      setPickupSuggestions([]);
      setShowPickupMenu(false);
    } else {
      setFormData((prev) => ({ ...prev, drop: name }));
      dropCoords.current = { lat: coords[1], lon: coords[0] };
      setDropSuggestions([]);
      setShowDropMenu(false);
    }
    toast.success(`${isPickup ? "Pickup" : "Drop"} location selected!`);
  };

  // Helper to geocode string if coordinates are not set
  const geocodeAddress = async (address) => {
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          address
        )}&apiKey=${GEOAPIFY_API_KEY}&limit=1`
      );
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates;
        return { lat: coords[1], lon: coords[0] };
      }
      return null;
    } catch (e) {
      console.error("Geocoding error:", e);
      return null;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pickup = params.get("pickup")?.trim() || "";
    const drop = params.get("drop")?.trim() || "";
    const routeKey = `${pickup}|${drop}`;

    if (!pickup && !drop) return;
    if (appliedRouteRef.current === routeKey) return;

    appliedRouteRef.current = routeKey;
    pickupCoords.current = null;
    dropCoords.current = null;
    setDistance("");
    setEstimatedFare("");
    setPickupSuggestions([]);
    setDropSuggestions([]);
    setShowPickupMenu(false);
    setShowDropMenu(false);

    setFormData((prev) => ({
      ...prev,
      pickup: pickup || prev.pickup,
      drop: drop || prev.drop,
    }));

    const hydrateRouteCoordinates = async () => {
      const [pickupPoint, dropPoint] = await Promise.all([
        pickup ? geocodeAddress(pickup) : Promise.resolve(null),
        drop ? geocodeAddress(drop) : Promise.resolve(null),
      ]);

      if (pickupPoint) pickupCoords.current = pickupPoint;
      if (dropPoint) dropCoords.current = dropPoint;
    };

    hydrateRouteCoordinates();
  }, [location.search]);

  // Calculate Route Distance & Fare
  const calculateDistanceAndFare = async () => {
    if (!formData.pickup || !formData.drop || !formData.vehicleType) {
      toast.error("Please fill pickup, drop location, and select a vehicle first.");
      return false;
    }

    setCalculatingFare(true);
    try {
      // 1. Geocode if coordinates are missing
      if (!pickupCoords.current) {
        const coords = await geocodeAddress(formData.pickup);
        if (!coords) {
          toast.error("Unable to find coordinates for pickup location.");
          return false;
        }
        pickupCoords.current = coords;
      }
      if (!dropCoords.current) {
        const coords = await geocodeAddress(formData.drop);
        if (!coords) {
          toast.error("Unable to find coordinates for drop location.");
          return false;
        }
        dropCoords.current = coords;
      }

      // 2. Fetch routing path distance from Geoapify
      const lat1 = pickupCoords.current.lat;
      const lon1 = pickupCoords.current.lon;
      const lat2 = dropCoords.current.lat;
      const lon2 = dropCoords.current.lon;

      const response = await fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${lat1},${lon1}|${lat2},${lon2}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const distanceMeters = data.features[0].properties.distance;
        const oneWayDistanceKm = distanceMeters / 1000;

        const tripDistanceKm = formData.tripType === "round" ? oneWayDistanceKm * 2 : oneWayDistanceKm;

        if (formData.tripType === "oneway" && tripDistanceKm < 130) {
          setDistance("");
          setEstimatedFare("");
          toast.error("One-way distance is less than the minimum limit (130 km). Please contact us or change the locations.", { duration: 6000 });
          return false;
        }

        if (formData.tripType === "round" && tripDistanceKm < 250) {
          setDistance("");
          setEstimatedFare("");
          toast.error("Round trip distance is less than the minimum limit (250 km). Please contact us or change the locations.", { duration: 6000 });
          return false;
        }

        if (!Number.isFinite(oneWayDistanceKm) || oneWayDistanceKm <= 0.1) {
          setDistance("");
          setEstimatedFare("");
          toast.error("Route distance is 0 km. Please search again with a more specific pickup and drop location.");
          return false;
        }

        const roundedDistance = Math.round(tripDistanceKm);
        setDistance(String(roundedDistance));

        // 3. Compute Fare based on configured vehicle rates and allowances
        const vehicleConfig = pricingMatrix[formData.vehicleType] || DEFAULT_PRICING_MATRIX[formData.vehicleType] || { oneway: 14, driverAllowance: 400 };
        const ratePerKm = vehicleConfig.oneway_rate || vehicleConfig.oneway || 14;
        let driverAllowance = vehicleConfig.driver_allowance || vehicleConfig.driverAllowance || 400;

        // Apply single-day long-distance allowance surcharge (> 400 km)
        if (oneWayDistanceKm > 400) {
          driverAllowance += (vehicleConfig.over_400km_allowance || vehicleConfig.over400Allowance || 600);
        }

        let baseFare = oneWayDistanceKm * ratePerKm + driverAllowance;

        // Double for round trips
        if (formData.tripType === "round") {
          baseFare = baseFare * 2;
        }

        const computedFare = String(Math.round(baseFare));
        setEstimatedFare(computedFare);

        trackAnalyticsEvent("fare_calculate", location.pathname, {
          vehicle: formData.vehicleType,
          distance: roundedDistance,
          fare: computedFare,
        });

        toast.success(
          `Distance calculated: ${roundedDistance} km | Fare: ₹${Number(computedFare).toLocaleString('en-IN')}`,
          { duration: 5000 }
        );
        return true;
      } else {
        toast.error("Unable to calculate driving route between these locations.");
        return false;
      }
    } catch (error) {
      console.error("Fare calculation error:", error);
      toast.error("Error calculating fare. Please check your locations and try again.");
      return false;
    } finally {
      setCalculatingFare(false);
    }
  };

  const isFormValid = () => {
    const isFutureDateTime = isSelectedDateTimeFuture();

    return (
      formData.pickup.trim() !== "" &&
      formData.drop.trim() !== "" &&
      formData.travelDate.trim() !== "" &&
      formData.preferredTime.trim() !== "" &&
      isFutureDateTime &&
      formData.vehicleType.trim() !== "" &&
      formData.fullName.trim() !== "" &&
      formData.phone.trim() !== "" &&
      hasValidRouteDistance() &&
      estimatedFare !== ""
    );
  };

  const hasValidRouteDistance = () => {
    return Number(distance) > 0;
  };

  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getCurrentTimeString = (addMinutes = 0) => {
    const now = new Date(Date.now() + addMinutes * 60 * 1000);
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const getMinDate = () => {
    return getTodayDateString();
  };

  const getMinTime = () => {
    return formData.travelDate === getTodayDateString() ? getCurrentTimeString(1) : undefined;
  };

  const isSelectedDateTimeFuture = () => {
    if (!formData.travelDate || !formData.preferredTime) return false;
    const selected = new Date(`${formData.travelDate}T${formData.preferredTime}`);
    return selected.getTime() > Date.now();
  };

  const getBookingValidationError = () => {
    if (!formData.pickup.trim()) return "Please enter pickup location.";
    if (!formData.drop.trim()) return "Please enter drop location.";
    if (!formData.travelDate.trim()) return "Please select travel date.";
    if (!formData.preferredTime.trim()) return "Please select preferred time.";
    if (!isSelectedDateTimeFuture()) return "Please select a future travel date and time.";
    if (!formData.vehicleType.trim()) return "Please select a vehicle type.";
    if (!formData.fullName.trim()) return "Please enter your full name.";
    if (!formData.phone.trim()) return "Please enter your phone number.";
    if (!distance || !estimatedFare) return "Please calculate fare first before booking.";
    if (distance && !hasValidRouteDistance()) {
      return "Route distance is 0 km. Please search again with a more specific pickup and drop location.";
    }
    return "";
  };

  const openNativePicker = (inputRef) => {
    const input = inputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        input.focus();
      }
    } else {
      input.focus();
      input.click();
    }
  };

  const buildWhatsAppMessage = (bookingId = "Website Booking") => `*New Booking - ${bookingId}*

*Customer Details:*
Name: ${formData.fullName}
Phone: ${formData.phone}
${formData.email ? `Email: ${formData.email}\n` : ""}
*Trip Details:*
Type: ${formData.tripType === "oneway" ? "One-Way Drop" : "Round Trip"}
Pickup: ${formData.pickup}
Drop: ${formData.drop}
${formData.optionalStops ? `Via / Stops: ${formData.optionalStops}\n` : ""}Date: ${formData.travelDate}
Time: ${formData.preferredTime}
${formData.tripType === "round" && formData.returnDate ? `Return Date: ${formData.returnDate} at ${formData.returnTime || "Flexible"}\n` : ""}Vehicle: ${formData.vehicleType.toUpperCase()}
${formData.passengerCount > 1 ? `Passengers: ${formData.passengerCount}\n` : ""}${formData.luggageInfo ? `Luggage: ${formData.luggageInfo}\n` : ""}Distance: ${distance} km
Estimated Fare: ₹${Math.round(Number(estimatedFare) || 0)}
${formData.requirements ? `Special Requirements: ${formData.requirements}` : ""}`;

  const openWhatsAppBooking = (bookingId) => {
    const whatsappUrl = `https://wa.me/916374070342?text=${encodeURIComponent(
      buildWhatsAppMessage(bookingId)
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const resetBookingForm = () => {
    setFormData({
      tripType: "oneway",
      pickup: "",
      drop: "",
      optionalStops: "",
      travelDate: "",
      preferredTime: "",
      returnDate: "",
      returnTime: "",
      vehicleType: "",
      passengerCount: 1,
      luggageInfo: "",
      fullName: "",
      phone: "",
      email: "",
      requirements: "",
    });
    setDistance("");
    setEstimatedFare("");
    pickupCoords.current = null;
    dropCoords.current = null;
  };

  const completeWhatsAppBooking = () => {
    openWhatsAppBooking();
    toast.success("Opening WhatsApp with your booking details.");
    resetBookingForm();
  };

  // Submit Booking & Redirect to WhatsApp
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    const validationError = getBookingValidationError();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);

    // Re-verify distance and fare if they are somehow empty
    if (!distance || !estimatedFare) {
      setLoading(false);
      toast.error("Please calculate fare first before booking.");
      return;
    }

    try {
      // 1. Save lead / enquiry to PostgreSQL via Django Backend API
      const result = await createLeadEnquiry({
        ...formData,
        distance: distance,
        estimatedFare: estimatedFare,
      });

      const bookingId = result.bookingId || "PTB-" + Math.floor(1000 + Math.random() * 9000);
      const leadId = result.leadId || null;

      // 2. Open WhatsApp voucher with booking ID
      openWhatsAppBooking(bookingId);

      // 3. Track WhatsApp click conversion asynchronously in the background
      if (leadId) {
        markWhatsAppClicked(leadId);
      }
      trackAnalyticsEvent("form_whatsapp_click", location.pathname, {
        bookingId,
        leadId,
        customerName: formData.fullName,
      });

      toast.success(`Booking enquiry registered! ID: ${bookingId}`, {
        duration: 5000,
      });

      resetBookingForm();
    } catch (err) {
      console.error("Booking submission error:", err);
      openWhatsAppBooking("Website Booking");
      toast.info("Opening WhatsApp with your booking details.");
      resetBookingForm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="relative overflow-hidden bg-background pt-32 pb-16 md:pt-36 md:pb-24">
      {/* Background Image with blur cover */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-opacity duration-300 dark:opacity-35" 
        style={{ backgroundImage: `url("/assets/booking-bg.jpg")` }}
      />
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md dark:bg-black/90 dark:backdrop-blur-lg" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none dark:opacity-[0.03]" />

      <div className="container mx-auto px-2 sm:px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6 md:mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 bg-primary/10 rounded-full text-primary font-bold text-[10px] sm:text-xs uppercase tracking-widest border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Easy 2-Step Booking</span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-5xl font-black text-foreground mb-2 sm:mb-4 leading-tight">
              Pondicherry Taxi Booking
            </h1>
            <p className="text-[11px] sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Book Pondicherry to Chennai, Bangalore, Coimbatore, Madurai and outstation taxi rides with instant distance calculation and WhatsApp confirmation.
            </p>
          </div>

          <div className="grid xl:grid-cols-[0.78fr_1.22fr] gap-6 lg:gap-8 items-start">
            <aside className="hidden xl:block sticky top-32">
              <div className="rounded-lg border border-white/10 bg-black/45 p-6 shadow-premium backdrop-blur-md text-white">
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <span>Trusted Pondicherry Outstation Taxi</span>
                </div>
                <h2 className="mt-5 text-4xl font-black leading-tight">
                  Pondy Tours <span className="text-accent">& Travels</span>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/75">
                  Book verified drivers, clean vehicles, transparent fares, and 24/7 dispatch support for Chennai, Bangalore, Coimbatore, Madurai and nearby routes.
                </p>

                <div className="mt-5 flex items-center gap-1">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                  <span className="ml-2 text-xs font-black text-white/80">4.9 customer rating</span>
                </div>

                <div className="mt-6 rounded-lg bg-white/[0.08] p-5 border border-white/10">
                  <img
                    src="/images/vehicle/innova-crysta.png"
                    alt="Innova Crysta taxi for Pondicherry outstation rides"
                    className="mx-auto h-44 w-full object-contain drop-shadow-2xl"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {POPULAR_ROUTES.map((route) => (
                    <button
                      key={route}
                      type="button"
                      onClick={() => handleInputChange("drop", route)}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-xs font-bold text-white transition-colors hover:border-accent"
                    >
                      <Navigation className="h-3.5 w-3.5 text-primary" />
                      <span>Pondicherry to {route}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/15 pt-5">
                  {[
                    ["13+", "Years"],
                    ["1000+", "Happy Rides"],
                    ["24/7", "Service"],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <p className="text-2xl font-black text-accent">{value}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-white/55">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Form Card */}
            <div className="bg-card/90 backdrop-blur-md rounded-lg shadow-premium border border-border overflow-hidden dark:bg-card/95 dark:border-white/10">
            {/* Form Tabs */}
            <div className="grid grid-cols-2 bg-muted p-1.5 gap-1.5 border-b border-border">
              <button
                type="button"
                onClick={() => handleInputChange("tripType", "oneway")}
                className={`py-2.5 sm:py-3.5 rounded-lg text-xs sm:text-sm font-bold transition-all focus:outline-none ${
                  formData.tripType === "oneway"
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                One-Way Trip
              </button>
              <button
                type="button"
                onClick={() => handleInputChange("tripType", "round")}
                className={`py-2.5 sm:py-3.5 rounded-lg text-xs sm:text-sm font-bold transition-all focus:outline-none ${
                  formData.tripType === "round"
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Round Trip
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} noValidate className="p-3 sm:p-6 md:p-10 space-y-4 sm:space-y-6 md:space-y-8">
              {/* Step 1: Trip Parameters */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <span className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center text-xs font-bold text-primary">
                    1
                  </span>
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
                    Journey Details
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Pickup AutoComplete */}
                  <div className="relative" ref={pickupRef}>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Pickup Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        value={formData.pickup}
                        onChange={(e) => handleInputChange("pickup", e.target.value)}
                        placeholder="Enter pickup city or location..."
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3.5 bg-background border border-border rounded-xl text-foreground font-semibold placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        required
                      />
                    </div>

                    {/* Suggestions list */}
                    {showPickupMenu && pickupSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border shadow-2xl rounded-2xl z-50 overflow-hidden max-h-60 overflow-y-auto animate-fade-in">
                        {pickupSuggestions.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSuggestionSelect(item, true)}
                            className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-muted text-foreground border-b border-muted last:border-b-0 flex items-start gap-2.5"
                          >
                            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>{item.properties.formatted}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Drop AutoComplete */}
                  <div className="relative" ref={dropRef}>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Drop Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        value={formData.drop}
                        onChange={(e) => handleInputChange("drop", e.target.value)}
                        placeholder="Enter destination city..."
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3.5 bg-background border border-border rounded-xl text-foreground font-semibold placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        required
                      />
                    </div>

                    {/* Suggestions list */}
                    {showDropMenu && dropSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border shadow-2xl rounded-2xl z-50 overflow-hidden max-h-60 overflow-y-auto animate-fade-in">
                        {dropSuggestions.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSuggestionSelect(item, false)}
                            className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-muted text-foreground border-b border-muted last:border-b-0 flex items-start gap-2.5"
                          >
                            <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <span>{item.properties.formatted}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Intermediate Stops */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Optional Stops / Via Locations (Sightseeing or Break)
                    </label>
                    <span className="text-[10px] text-muted-foreground font-semibold">Optional</span>
                  </div>
                  <input
                    type="text"
                    value={formData.optionalStops}
                    onChange={(e) => handleInputChange("optionalStops", e.target.value)}
                    placeholder="E.g., Mahabalipuram, Tindivanam, Auroville..."
                    className="w-full px-4 py-2 sm:py-2.5 bg-background border border-border rounded-xl text-xs sm:text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                  {/* Travel Date */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Travel Date
                    </label>
                    <div
                      className="relative"
                      onClick={() => openNativePicker(dateInputRef)}
                    >
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        ref={dateInputRef}
                        type="date"
                        value={formData.travelDate}
                        min={getMinDate()}
                        onChange={(e) => handleInputChange("travelDate", e.target.value)}
                        onFocus={() => openNativePicker(dateInputRef)}
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3.5 bg-background border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  {/* Travel Time */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Preferred Time
                    </label>
                    <div
                      className="relative"
                      onClick={() => openNativePicker(timeInputRef)}
                    >
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        ref={timeInputRef}
                        type="time"
                        value={formData.preferredTime}
                        min={getMinTime()}
                        onChange={(e) => handleInputChange("preferredTime", e.target.value)}
                        onFocus={() => openNativePicker(timeInputRef)}
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3.5 bg-background border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  {/* Vehicle Type Selection */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Select Vehicle Type
                    </label>
                    <div className="relative">
                      <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => handleInputChange("vehicleType", e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3.5 bg-background border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="">Choose Vehicle...</option>
                        <option value="sedan">
                          Sedan (₹{pricingMatrix.sedan?.oneway_rate || pricingMatrix.sedan?.oneway || 14}/km)
                        </option>
                        <option value="muv">
                          MUV/SUV Ertiga (₹{pricingMatrix.muv?.oneway_rate || pricingMatrix.muv?.oneway || 19}/km)
                        </option>
                        <option value="innova">
                          Innova (₹{pricingMatrix.innova?.oneway_rate || pricingMatrix.innova?.oneway || 20}/km)
                        </option>
                        <option value="crysta">
                          Innova Crysta (₹{pricingMatrix.crysta?.oneway_rate || pricingMatrix.crysta?.oneway || 23}/km)
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Round Trip Return Date & Time */}
                {formData.tripType === "round" && (
                  <div className="grid md:grid-cols-2 gap-4 sm:gap-6 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 animate-fade-in">
                    <div>
                      <label className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block mb-2">
                        Return Journey Date
                      </label>
                      <input
                        type="date"
                        value={formData.returnDate}
                        min={formData.travelDate || getMinDate()}
                        onChange={(e) => handleInputChange("returnDate", e.target.value)}
                        className="w-full px-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block mb-2">
                        Return Reporting Time
                      </label>
                      <input
                        type="time"
                        value={formData.returnTime}
                        onChange={(e) => handleInputChange("returnTime", e.target.value)}
                        className="w-full px-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}

                {/* Passenger Count & Luggage Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Passenger Count (Vehicle Fit)
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <select
                        value={formData.passengerCount}
                        onChange={(e) => handleInputChange("passengerCount", parseInt(e.target.value) || 1)}
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl text-xs sm:text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                      >
                        <option value={1}>1 Passenger</option>
                        <option value={2}>2 Passengers</option>
                        <option value={3}>3 Passengers</option>
                        <option value={4}>4 Passengers (Standard Sedan max)</option>
                        <option value={5}>5 Passengers (Ertiga / Innova)</option>
                        <option value={6}>6 Passengers (Ertiga / Innova)</option>
                        <option value={7}>7 Passengers (Innova Crysta)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Luggage Details (Optional)
                    </label>
                    <div className="relative">
                      <Luggage className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        placeholder="E.g., 2 large suitcases, 1 backpack..."
                        value={formData.luggageInfo}
                        onChange={(e) => handleInputChange("luggageInfo", e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl text-xs sm:text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation Button / Stats Row */}
                <div className="pt-2 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <button
                    type="button"
                    onClick={calculateDistanceAndFare}
                    disabled={calculatingFare || !formData.pickup || !formData.drop || !formData.vehicleType}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 btn-3d shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm shrink-0"
                  >
                    {calculatingFare ? (
                      <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Calculator className="w-4 h-4" />
                    )}
                    <span>{calculatingFare ? "Calculating Fares..." : "Calculate Fare & Route"}</span>
                  </button>

                  {/* Estimated Display */}
                  {distance && estimatedFare && (
                    <div className="w-full p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-4 animate-fade-in">
                      <Info className="w-5 h-5 text-primary shrink-0" />
                      <div className="text-sm">
                        <p className="text-muted-foreground font-semibold">
                          Driving Distance: <span className="text-foreground font-extrabold">{distance} km</span>
                        </p>
                        <p className="text-primary font-black text-lg">
                          Estimated Fare: ₹{estimatedFare}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Customer details */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <span className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center text-xs font-bold text-primary">
                    2
                  </span>
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
                    Customer Information
                  </h3>
                </div>

                <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        placeholder="Your full name..."
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3.5 bg-background border border-border rounded-xl text-foreground font-semibold placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Mobile with country code..."
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3.5 bg-background border border-border rounded-xl text-foreground font-semibold placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="you@example.com..."
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3.5 bg-background border border-border rounded-xl text-foreground font-semibold placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Special requirements */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    Special Requirements (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3.5 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <textarea
                      value={formData.requirements}
                      onChange={(e) => handleInputChange("requirements", e.target.value)}
                      placeholder="E.g., baby seat, excess luggage details, multiple stops..."
                      rows={2}
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3.5 bg-background border border-border rounded-xl text-foreground font-semibold placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 sm:pt-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-xs text-muted-foreground/90 max-w-md text-center md:text-left leading-relaxed">
                  Upon submission, your booking details will open in WhatsApp so you can instantly finalize the reservation with our dispatch coordinator. Available 24/7.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                    className="w-full md:w-auto bg-gradient-to-r from-accent to-accent/90 hover:from-accent/95 hover:to-accent text-accent-foreground font-black px-6 py-3.5 md:px-10 md:py-4 rounded-lg flex items-center justify-center gap-2.5 text-base btn-3d shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  <span>{loading ? "Confirming Booking..." : "Confirm & Send via WhatsApp"}</span>
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
