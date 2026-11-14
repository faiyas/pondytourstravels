import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { driverLogin, driverResetPassword, setDriverSession } from "../../api";
import { Car, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export default function DriverLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [resetPhone, setResetPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const res = await driverLogin({ phone, password });
      if (res.success && res.token) {
        setDriverSession(res.token, res.driver);
        toast.success(`Welcome back, ${res.driver.name}!`);
        if (res.driver.onboardingStep && res.driver.onboardingStep < 5) {
          navigate("/driver/onboarding");
        } else {
          navigate("/driver/dashboard");
        }
      } else {
        toast.error(res.error || "Invalid mobile number or password");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPhone || resetPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setResetting(true);
    try {
      const res = await driverResetPassword({
        phone: resetPhone,
        newPassword,
        confirmPassword,
      });
      if (res.success) {
        toast.success(res.message || "Password reset successful! Please log in.");
        setShowForgot(false);
        setPhone(resetPhone);
      } else {
        toast.error(res.error || "Failed to reset password");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setResetting(false);
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
            Pondy RideCircle
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Driver Partner Network • Direct Dispatch Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl">
          {!showForgot ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="pb-2 border-b border-border">
                <h2 className="text-base font-black text-foreground">Driver Login</h2>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Log in with your registered 10-digit mobile number
                </p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                  Mobile Number
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-16 pr-4 py-3 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setResetPhone(phone);
                    }}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 mt-2"
              >
                <span>{loading ? "Logging in..." : "Log In to Driver Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="pb-2 border-b border-border">
                <h2 className="text-base font-black text-foreground">Reset Password</h2>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Enter your mobile number and set a new password
                </p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                  Registered Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98765 43210"
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-12 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-xs font-bold"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-border text-foreground font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="w-2/3 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-md"
                >
                  {resetting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}

          {/* Registration link */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              New driver partner?{" "}
              <Link to="/driver/register" className="font-black text-primary hover:underline">
                Register with Pondy RideCircle
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-muted-foreground text-center mt-6">
          🔒 Secure mobile authentication • 24/7 Dispatch Helpline: +91 90252 32453
        </p>
      </div>
    </div>
  );
}
