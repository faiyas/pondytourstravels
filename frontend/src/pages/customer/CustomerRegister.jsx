import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { customerRegister, setCustomerSession } from "../../api";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  Phone, 
  Lock, 
  User, 
  UserPlus, 
  KeyRound, 
  CheckCircle2, 
  Car,
  ArrowRight
} from "lucide-react";

export default function CustomerRegister() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryPin, setRecoveryPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }
    const cleanDigits = phone.replace(/[^0-9]/g, "");
    if (cleanDigits.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (recoveryPin && recoveryPin.length !== 4) {
      toast.error("Security PIN must be exactly 4 digits");
      return;
    }

    setLoading(true);
    const res = await customerRegister({
      name: name.trim(),
      phone: cleanDigits,
      password,
      confirmPassword,
      recoveryPin,
    });

    if (res.success && res.token) {
      setCustomerSession(res.token, res.customer);
      toast.success("Account created successfully!");
      navigate("/customer/dashboard");
    } else {
      toast.error(res.error || "Registration failed. Please check your details.");
    }
    setLoading(false);
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
          Create an account to track your journeys and assigned drivers
        </p>
      </div>

      {/* Registration Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-card animate-fade-in">
        <div className="mb-5 pb-4 border-b border-border/80">
          <h2 className="text-xl font-black text-foreground">Create Customer Account</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quick registration using your mobile number (no email needed)
          </p>
          <div className="mt-2.5 p-2 bg-primary/5 rounded-xl border border-primary/15 text-[11px] text-primary font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Registration is optional. You can always book cabs on our homepage!</span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Mohamed Faiyas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <User className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
              10-Digit Mobile Number *
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
                className="w-full pl-12 pr-10 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <Phone className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                4-Digit Security PIN (Optional)
              </label>
              <span className="text-[10px] text-muted-foreground font-semibold">For secure recovery</span>
            </div>
            <div className="relative">
              <input
                type="password"
                maxLength={4}
                placeholder="4-digit PIN (e.g. 1234)"
                value={recoveryPin}
                onChange={(e) => setRecoveryPin(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary tracking-widest"
              />
              <KeyRound className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Used to safely reset your password without email or SMS OTP.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Customer Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-border text-center space-y-2">
          <p className="text-xs text-muted-foreground font-medium">
            Already have an account?{" "}
            <Link to="/customer/login" className="text-primary font-bold hover:underline">
              Log In
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
    </div>
  );
}