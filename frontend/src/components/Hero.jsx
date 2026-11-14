import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, MapPin, Clock, Users, ArrowRight, Star, Navigation } from "lucide-react";

export default function Hero() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const popularRoutes = ["Chennai", "Bangalore", "Coimbatore", "Madurai"];

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-background py-16 md:py-24"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-opacity duration-300 dark:opacity-55"
        style={{ backgroundImage: `url("/assets/booking-bg.jpg")` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/62 to-background/90 backdrop-blur-sm dark:from-black/95 dark:via-black/90 dark:to-black/86 dark:backdrop-blur-md" />
      <div className="absolute inset-0 hidden bg-black/20 dark:block" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-10 xl:gap-16 items-center">
          {/* Left Column: Brand Copy & Stats */}
          <div className="space-y-6 md:space-y-7 animate-fade-in">
            {/* Top Badge */}
            <div className="inline-flex max-w-full px-3.5 py-2 bg-primary/10 rounded-lg border border-primary/20 dark:bg-white/10 dark:border-white/15">
              <p className="text-white text-xs md:text-sm font-semibold flex items-center gap-2 flex-wrap">
                <ShieldCheck className="w-4 h-4 text-accent animate-pulse" />
                <span>Premium Outstation Taxi Service</span>
                <span className="opacity-40">•</span>
                <span className="text-white/75">100% Safe & Secure</span>
              </p>
            </div>

            {/* Brand Headline */}
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                Pondy Tours <span className="text-accent">& Travels</span>
              </h2>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-xl">
                Premium taxi service connecting Pondicherry to Chennai, Bangalore, Coimbatore, Madurai, and beyond. Your safety, comfort, and punctuality are our top priorities.
              </p>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollToSection("booking")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 py-4 rounded-lg btn-3d shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base"
              >
                <span>Book Your Ride Now</span>
                <ArrowRight className="w-5 h-5 text-accent-foreground" />
              </button>
              <button
                onClick={() => navigate("/fleet")}
                className="border-2 border-white/35 hover:border-accent hover:bg-white/10 text-white font-bold px-8 py-4 rounded-lg btn-3d transition-all flex items-center justify-center gap-2 text-base"
              >
                <span>View Our Fleet</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {popularRoutes.map((route) => (
                <button
                  key={route}
                  type="button"
                  onClick={() => scrollToSection("booking")}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/90 px-3 py-2 text-xs font-bold text-slate-950 shadow-card transition-colors hover:border-accent/70 hover:text-primary dark:bg-black/55 dark:text-white dark:border-white/20 dark:hover:border-accent"
                >
                  <Navigation className="h-3.5 w-3.5 text-primary" />
                  <span>Pondicherry to {route}</span>
                </button>
              ))}
            </div>

            {/* Stats Metrics Counters */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 py-4 border-t border-b border-white/20">
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-accent">13+</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-white/65 font-bold uppercase tracking-wider mt-1">
                  Years Experience
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-accent">1000+</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-white/65 font-bold uppercase tracking-wider mt-1">
                  Happy Rides
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-accent">24/7</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-white/65 font-bold uppercase tracking-wider mt-1">
                  Service Available
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Fleet Visual */}
          <div className="relative">
            <div className="rounded-lg border border-border bg-card/90 p-5 shadow-premium backdrop-blur">
              <div className="relative rounded-lg bg-muted/50 p-6 min-h-[260px] flex items-center justify-center overflow-hidden">
                <img
                  src="/images/vehicle/innova-crysta.png"
                  alt="Innova Crysta taxi for Pondy Tours and Travels"
                  className="relative z-10 w-full max-w-xl object-contain drop-shadow-2xl"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg";
                  }}
                />
                <div className="absolute left-4 top-4 rounded-lg bg-background/90 px-3 py-2 shadow-card border border-border">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="mt-1 text-xs font-black text-foreground">4.9 customer rating</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { icon: MapPin, label: "GPS enabled" },
                  { icon: Clock, label: "On-time pickup" },
                  { icon: Users, label: "Verified drivers" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg border border-border bg-background px-3 py-3 text-center">
                      <Icon className="mx-auto mb-2 h-4 w-4 text-primary" />
                      <p className="text-[11px] font-bold text-muted-foreground">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
