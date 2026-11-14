import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import { Phone, Sun, Moon, Menu, X, ArrowRight } from "lucide-react";
import { trackAnalyticsEvent } from "../api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "Our Fleet", path: "/fleet" },
    { label: "Pricing", path: "/pricing" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <>
      {/* Top Banner Ribbon */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground h-10 flex items-center shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center text-xs md:text-sm font-medium">
          <a
            href="tel:+916374070342"
            onClick={() => trackAnalyticsEvent("phone_click", location.pathname, { source: "navbar_hotline" })}
            className="flex min-w-0 items-center gap-2 hover:opacity-90 transition-opacity mx-auto sm:mx-0"
          >
            <Phone className="w-3.5 h-3.5 animate-pulse text-accent" />
            <span className="hidden min-[380px]:inline">Call 24/7 Available:</span>
            <span className="font-bold text-accent hover:underline whitespace-nowrap">+91 63740 70342</span>
          </a>
          <span className="hidden sm:inline text-primary-foreground/80">
            Premium Taxi Service • Pondicherry to Outstation & Beyond
          </span>
        </div>
      </div>

      {/* Main Glassmorphic Header */}
      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "top-10 bg-background/90 backdrop-blur-md shadow-md border-b border-border py-2"
            : "top-10 bg-background/95 backdrop-blur-md border-b border-border/60 py-4"
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Brand Logo & Name */}
          <Link
            to="/"
            className="flex items-center gap-2 md:gap-3 text-left focus:outline-none group"
          >
            <img
              src={theme === "dark" ? "/images/logo/dark.png" : "/images/logo/light.png"}
              alt="Pondy Tours Logo"
              className="w-10 h-10 md:w-12 md:h-12 object-contain group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.src = "/placeholder.svg"; // Safety fallback
              }}
            />
            <div>
              <p className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase whitespace-nowrap">
                Pondy Tours <span className="text-primary">& Travels</span>
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">
                Premium Taxi Service
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`text-sm font-semibold transition-colors focus:outline-none ${
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Action Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-full hover:bg-muted border border-border transition-colors text-foreground focus:outline-none"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Call to Action Booking */}
            <button
              onClick={() => handleNavClick("/")}
              className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/95 hover:to-accent text-accent-foreground font-bold px-5 py-2.5 rounded-lg btn-3d shadow-md hover:shadow-lg flex items-center gap-1.5 text-sm"
            >
              <span>Book Ride</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tablet/Mobile Action Items */}
          <div className="flex lg:hidden items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-muted border border-border transition-colors text-foreground focus:outline-none"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-muted border border-border transition-colors text-foreground focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border shadow-xl animate-fade-in z-50">
            <div className="px-4 py-6 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`text-left text-base font-bold py-2 border-b border-muted transition-colors focus:outline-none ${
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-foreground/80 hover:text-primary"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => handleNavClick("/")}
                className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground font-bold py-3 rounded-lg btn-3d shadow-md flex items-center justify-center gap-2 text-sm"
              >
                <span>Book Your Ride Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
