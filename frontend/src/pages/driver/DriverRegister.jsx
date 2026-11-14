import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { driverRegister, setDriverSession } from "../../api";
import { Car, User, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function DriverRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast.error("Please enter your full legal name");
      return;
    }
    const cleanP = formData.phone.replace(/\D/g, "");
    if (cleanP.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await driverRegister({
        name: formData.name.trim(),
        phone: cleanP,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (res.success && res.token) {
        setDriverSession(res.token, res.driver);
        toast.success("Registration successful! Complete your onboarding profile.");
        navigate("/driver/onboarding");
      } else {
        toast.error(res.error || "Registration failed");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 mb-3">
            <Car className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Join Pondy RideCircle
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Driver Partner Onboarding • Fast Mobile Registration
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="pb-3 border-b border-border mb-4">
            <h2 className="text-base font-black text-foreground">Create Driver Account</h2>
            <p className="text-[11px] text-muted-foreground font-medium">
              No email required. Enter your active 10-digit WhatsApp/mobile number.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                Full Name (as on Driving Licence)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-primary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="E.g. Murugan Kannan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                Mobile Number (Username)
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground text-xs font-bold pointer-events-none">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                  className="w-full pl-16 pr-4 py-3 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                  Password (min 6)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-3 bg-background border border-border rounded-2xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-3 bg-background border border-border rounded-2xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Show passwords</span>
              </label>
              <span className="text-[10px]">Step 1 of 4</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 mt-3"
            >
              <span>{loading ? "Registering..." : "Continue to Driver KYC"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Already have an account */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Already registered?{" "}
              <Link to="/driver/login" className="font-black text-primary hover:underline">
                Log In with Mobile
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits bar */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-muted-foreground">
          <div className="bg-card/70 border border-border rounded-xl p-2.5">
            <p className="text-foreground font-black">Direct Dispatch</p>
            <p>One-way & Round</p>
          </div>
          <div className="bg-card/70 border border-border rounded-xl p-2.5">
            <p className="text-foreground font-black">Entire Cab</p>
            <p>100% vehicle duty</p>
          </div>
          <div className="bg-card/70 border border-border rounded-xl p-2.5">
            <p className="text-foreground font-black">Fast Payouts</p>
            <p>Collect cash/UPI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
