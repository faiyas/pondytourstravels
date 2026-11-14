import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  fetchDriverProfile,
  updateDriverProfile,
  submitDriverDocuments,
  clearDriverSession,
  isDriverLoggedIn,
} from "../../api";
import {
  Car,
  User,
  Phone,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  MapPin,
  Calendar,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export default function DriverOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(2); // 2: Profile, 3: License & ID, 4: Vehicle & RC, 5: Under Review
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [driver, setDriver] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 2: Profile
    address: "",
    city: "Pondicherry",
    emergencyContact: "",
    experienceYears: "2",
    // Step 3: License & ID
    licenseNumber: "",
    licenseExpiry: "",
    aadhaarNumber: "",
    // Step 4: Vehicle & RC
    vehicleCategory: "sedan",
    vehicleModel: "",
    vehicleNumber: "",
    rcNumber: "",
    insuranceExpiry: "",
    fitnessExpiry: "",
  });

  useEffect(() => {
    if (!isDriverLoggedIn()) {
      navigate("/driver/login");
      return;
    }

    async function load() {
      setLoading(true);
      const res = await fetchDriverProfile();
      if (res.success && res.driver) {
        setDriver(res.driver);
        setFormData((prev) => ({
          ...prev,
          address: res.driver.address || "",
          city: res.driver.city || "Pondicherry",
          emergencyContact: res.driver.emergencyContact || "",
          experienceYears: String(res.driver.experienceYears || 2),
          licenseNumber: res.driver.licenseNumber || "",
          licenseExpiry: res.driver.licenseExpiry || "",
          aadhaarNumber: res.driver.aadhaarNumber || "",
          vehicleCategory: res.driver.vehicleCategory || "sedan",
          vehicleModel: res.driver.vehicleModel || "",
          vehicleNumber: res.driver.vehicleNumber || "",
          rcNumber: res.driver.rcNumber || "",
          insuranceExpiry: res.driver.insuranceExpiry || "",
          fitnessExpiry: res.driver.fitnessExpiry || "",
        }));

        if (res.driver.onboardingStep >= 5) {
          setStep(5);
        } else if (res.driver.onboardingStep >= 2) {
          setStep(res.driver.onboardingStep);
        }
      } else {
        clearDriverSession();
        navigate("/driver/login");
      }
      setLoading(false);
    }
    load();
  }, [navigate]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.address.trim()) {
      toast.error("Please enter your current residential address");
      return;
    }
    setSubmitting(true);
    const res = await updateDriverProfile({
      address: formData.address,
      city: formData.city,
      emergencyContact: formData.emergencyContact,
      experienceYears: parseInt(formData.experienceYears) || 1,
    });
    if (res.success) {
      toast.success("Profile saved! Now provide your licence details.");
      setStep(3);
    } else {
      toast.error(res.error || "Failed to save profile");
    }
    setSubmitting(false);
  };

  const handleSaveDocumentsAndVehicle = async (e) => {
    e.preventDefault();
    if (!formData.licenseNumber.trim()) {
      toast.error("Please enter your Driving Licence number");
      return;
    }
    if (!formData.vehicleNumber.trim()) {
      toast.error("Please enter your Vehicle Registration number");
      return;
    }

    setSubmitting(true);
    const res = await submitDriverDocuments(formData);
    if (res.success) {
      toast.success("Application submitted for admin review!");
      setStep(5);
      const updated = await fetchDriverProfile();
      if (updated.driver) setDriver(updated.driver);
    } else {
      toast.error(res.error || "Submission failed");
    }
    setSubmitting(false);
  };

  const handleLogout = () => {
    clearDriverSession();
    toast.success("Logged out");
    navigate("/driver/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <Car className="w-8 h-8 text-primary animate-bounce mx-auto" />
          <p className="text-xs font-bold text-muted-foreground">Loading onboarding status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase text-foreground flex items-center gap-2">
                <span>Pondy RideCircle</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  Driver KYC
                </span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-semibold">
                Partner Onboarding • {driver?.name} ({driver?.phone})
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-muted-foreground hover:text-destructive rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-6 flex-1 max-w-xl space-y-5">
        {/* Step Progress Tracker */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-black uppercase mb-2">
            <span className={step >= 2 ? "text-primary" : "text-muted-foreground"}>1. Profile</span>
            <span className="text-muted-foreground">➔</span>
            <span className={step >= 3 ? "text-primary" : "text-muted-foreground"}>2. Licence</span>
            <span className="text-muted-foreground">➔</span>
            <span className={step >= 4 ? "text-primary" : "text-muted-foreground"}>3. Vehicle</span>
            <span className="text-muted-foreground">➔</span>
            <span className={step >= 5 ? "text-green-600" : "text-muted-foreground"}>4. Review</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* STEP 2: PROFILE & ADDRESS                                      */}
        {/* ============================================================== */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-lg space-y-4 animate-fade-in">
            <div className="pb-3 border-b border-border">
              <h2 className="text-base font-black text-foreground">Driver Address & Experience</h2>
              <p className="text-xs text-muted-foreground font-medium">
                Please provide your contact address and local driving experience.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                  Current Residential Address *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Street address, locality, area..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-bold text-foreground resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                    City / Base Town
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Pondicherry"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                    Driving Experience
                  </label>
                  <select
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-xs font-bold"
                  >
                    <option value="1">1 Year</option>
                    <option value="2">2 - 3 Years</option>
                    <option value="5">4 - 6 Years</option>
                    <option value="8">7+ Years (Expert)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                  Emergency Contact Mobile
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210 (Family / Alternate)"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-3"
              >
                <span>Save & Continue to Driving Licence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3 & 4: LICENCE, ID & VEHICLE DETAILS                      */}
        {/* ============================================================== */}
        {(step === 3 || step === 4) && (
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-lg space-y-4 animate-fade-in">
            <div className="pb-3 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-foreground">Licence & Vehicle Details</h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Enter your official transport authority documents for verification.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-primary hover:underline"
              >
                Back
              </button>
            </div>

            <form onSubmit={handleSaveDocumentsAndVehicle} className="space-y-4">
              {/* SECTION A: Driving Licence */}
              <div className="space-y-3 pb-3 border-b border-border">
                <span className="text-[11px] font-black uppercase text-primary tracking-wide block">
                  A. Driving Licence & Identity
                </span>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Driving Licence Number (DL) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="PY-01-20180005678"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-bold uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                      Licence Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.licenseExpiry}
                      onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                      Aadhaar / ID Card No
                    </label>
                    <input
                      type="text"
                      placeholder="12-digit Aadhaar No"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: Vehicle Details */}
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase text-primary tracking-wide block">
                  B. Vehicle Registration & Documents
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                      Vehicle Category *
                    </label>
                    <select
                      value={formData.vehicleCategory}
                      onChange={(e) => setFormData({ ...formData, vehicleCategory: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold"
                    >
                      <option value="sedan">Sedan (Dzire / Etios)</option>
                      <option value="muv">MUV (Ertiga)</option>
                      <option value="innova">Innova 6+1</option>
                      <option value="crysta">Innova Crysta Luxury</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                      Car Model & Variant
                    </label>
                    <input
                      type="text"
                      placeholder="Maruti Dzire VXI"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                      Vehicle Number Plate *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="PY-01-AB-1234"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                      RC Book Number
                    </label>
                    <input
                      type="text"
                      placeholder="RC Number"
                      value={formData.rcNumber}
                      onChange={(e) => setFormData({ ...formData, rcNumber: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs font-bold uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                      Insurance Expiry
                    </label>
                    <input
                      type="date"
                      value={formData.insuranceExpiry}
                      onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                      Fitness Certificate (FC)
                    </label>
                    <input
                      type="date"
                      value={formData.fitnessExpiry}
                      onChange={(e) => setFormData({ ...formData, fitnessExpiry: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-4"
              >
                <span>{submitting ? "Submitting Application..." : "Submit Application for Review"}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 5: UNDER ADMIN REVIEW                                     */}
        {/* ============================================================== */}
        {step >= 5 && (
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4 animate-fade-in">
            {driver?.documentsApproved ? (
              <>
                <div className="w-16 h-16 rounded-3xl bg-green-500/10 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground">Driver Approved!</h2>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    Your documents have been verified by the dispatch team. You are now active on Pondy RideCircle.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/driver/dashboard")}
                  className="w-full py-3.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-xs shadow-lg shadow-green-600/20"
                >
                  Open Driver Duty Dashboard
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                  <Clock className="w-9 h-9 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground">Application Under Review</h2>
                  <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
                    Thank you, <strong className="text-foreground">{driver?.name}</strong>! Your driving licence and vehicle details have been submitted to the dispatch desk.
                  </p>
                </div>

                <div className="bg-muted/60 p-4 rounded-2xl border border-border/80 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-semibold">Registered Mobile:</span>
                    <span className="font-bold text-foreground">{driver?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-semibold">Licence No:</span>
                    <span className="font-bold text-foreground">{driver?.licenseNumber || "Submitted"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-semibold">Vehicle Reg:</span>
                    <span className="font-bold uppercase text-foreground">{driver?.vehicleNumber || "Submitted"}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border/60">
                    <span className="text-muted-foreground font-semibold">Approval Status:</span>
                    <span className="font-black text-amber-600">Pending Admin Verification ⏳</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setStep(3)}
                    className="w-1/2 py-2.5 rounded-xl border border-border text-foreground font-bold text-xs hover:bg-muted"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => navigate("/driver/dashboard")}
                    className="w-1/2 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-sm"
                  >
                    Go to Dashboard
                  </button>
                </div>

                <p className="text-[11px] text-muted-foreground pt-1">
                  📞 Urgent questions? Call Dispatch Desk at +91 90252 32453
                </p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
