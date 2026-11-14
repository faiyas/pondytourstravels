import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { customerLogin, customerResetPassword, setCustomerSession } from "../../api";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  Phone, 
  Lock, 
  LogIn, 
  ArrowRight, 
  KeyRound, 
  HelpCircle, 
  MessageCircle, 
  X,
  Car
} from "lucide-react";

export default function CustomerLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Secure Password Reset Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetPhone, setResetPhone] = useState("");
  const [resetMethod, setResetMethod] = useState("pin"); // 'pin' | 'current'
  const [recoveryPin, setRecoveryPin] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || phone.replace(/[^0-9]/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    const res = await customerLogin({ phone, password });
    if (res.success && res.token) {
      setCustomerSession(res.token, res.customer);
      toast.success(`Welcome back, ${res.customer.name}!`);
      navigate("/customer/dashboard");
    } else {
      toast.error(res.error || "Invalid mobile number or password");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPhone || resetPhone.replace(/[^0-9]/g, "").length < 10) {
      toast.error("Please enter your registered 10-digit mobile number");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setResetting(true);
    const payload = {
      phone: resetPhone,
      newPassword,
      confirmPassword,
      currentPassword: resetMethod === "current" ? currentPassword : "",
      recoveryPin: resetMethod === "pin" ? recoveryPin : "",
    };

    const res = await customerResetPassword(payload);
    if (res.success) {
      toast.success(res.message || "Password reset successfully! Please log in.");
      setResetModalOpen(false);
      setPassword("");
    } else {
      toast.error(res.error || "Verification failed");
    }
    setResetting(false);
  };

  const openWhatsAppAssistance = () => {
    const text = encodeURIComponent(
      `Hello Pondy Tours Dispatch Desk, I need assistance recovering my customer account password for mobile number: ${resetPhone || phone || ""}`
    );
    window.open(`https://api.whatsapp.com/send?phone=919025232453&text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 antialiased text-foreground">
      {/* Brand Header */}
      <div className="mb-6 text-center max-w-sm w-full">
        <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground uppercase">
            Pondy Tours <span className="text-primary font-bold text-xs px-2 py-0.5 bg-primary/10 rounded-full">Customer</span>
          </span>
        </Link>
        <p className="text-xs text-muted-foreground font-medium">
          Access your bookings, track driver assignments, and download vouchers
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-card animate-fade-in">
        <div className="mb-5 pb-4 border-b border-border/80">
          <h2 className="text-xl font-black text-foreground">Customer Login</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Log in using your 10-digit mobile number and password
          </p>
          <div className="mt-2.5 p-2 bg-primary/5 rounded-xl border border-primary/15 text-[11px] text-primary font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Login is optional. Public booking is always open on our homepage!</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                +91
              </span>
              <input
                type="tel"
                placeholder="90252 32453"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={12}
                className="w-full pl-12 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <Phone className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetPhone(phone);
                  setResetModalOpen(true);
                }}
                className="text-[11px] text-primary hover:underline font-bold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <Lock className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In to My Bookings</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-border text-center space-y-2">
          <p className="text-xs text-muted-foreground font-medium">
            New customer?{" "}
            <Link to="/customer/register" className="text-primary font-bold hover:underline">
              Create an Account
            </Link>
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            Just want to book a taxi?{" "}
            <Link to="/" className="text-foreground font-bold hover:underline">
              Go to Homepage Form ➔
            </Link>
          </p>
        </div>
      </div>

      {/* Secure Password Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Reset Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              To protect your account against unauthorized takeover, please verify your identity using your 4-digit Security PIN or current password.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                  Registered Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="90252 32453"
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                  Verification Method
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setResetMethod("pin")}
                    className={`py-2 px-3 rounded-xl border transition-colors ${
                      resetMethod === "pin"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    }`}
                  >
                    4-Digit Security PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetMethod("current")}
                    className={`py-2 px-3 rounded-xl border transition-colors ${
                      resetMethod === "current"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    }`}
                  >
                    Current Password
                  </button>
                </div>
              </div>

              {resetMethod === "pin" ? (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                    4-Digit Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={recoveryPin}
                    onChange={(e) => setRecoveryPin(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-bold text-foreground tracking-widest text-center focus:outline-none"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-border text-foreground font-bold text-xs hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="w-2/3 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  {resetting ? "Resetting..." : "Update Password"}
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-border/70 text-center">
              <p className="text-[11px] text-muted-foreground mb-1.5">
                Don't remember your PIN or password?
              </p>
              <button
                type="button"
                onClick={openWhatsAppAssistance}
                className="w-full py-2 px-3 rounded-xl bg-green-600/10 hover:bg-green-600/20 text-green-700 dark:text-green-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-green-600/20"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Contact Dispatch Desk on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}