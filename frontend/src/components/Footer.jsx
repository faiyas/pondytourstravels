import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const quickLinks = [
    { label: "Booking Center", path: "/" },
    { label: "About Pondy Tours", path: "/about" },
    { label: "Our Services", path: "/services" },
    { label: "Premium Fleet", path: "/fleet" },
    { label: "Pricing Matrix", path: "/pricing" },
    { label: "Contact Support", path: "/contact" },
  ];

  const popularRoutes = [
    { label: "Pondicherry to Chennai", pickup: "Pondicherry", drop: "Chennai" },
    { label: "Chennai to Pondicherry", pickup: "Chennai", drop: "Pondicherry" },
    { label: "Pondicherry to Bangalore", pickup: "Pondicherry", drop: "Bangalore" },
    { label: "Pondicherry to Coimbatore", pickup: "Pondicherry", drop: "Coimbatore" },
    { label: "Pondicherry to Madurai", pickup: "Pondicherry", drop: "Madurai" },
  ];

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src="/images/logo/light.png"
                alt="Pondy Tours Logo"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.src = "/placeholder.svg";
                }}
              />
              <div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight whitespace-nowrap">
                  Pondy Tours <span className="text-primary">& Travels</span>
                </h3>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                  Premium Taxi Service
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted premium travel partner for comfortable, safe, and reliable transportation from Pondicherry to destinations across Tamil Nadu, Karnataka, and beyond. Over 13 years of expertise.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">
              Quick Navigation
            </h3>
            <ul className="space-y-2 text-sm font-semibold text-muted-foreground">
              {quickLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="hover:text-primary transition-colors focus:outline-none flex items-center gap-1.5"
                  >
                    <ChevronRightMini />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">
              Popular Routes
            </h3>
            <ul className="space-y-2 text-sm font-semibold text-muted-foreground">
              {popularRoutes.map((route) => (
                <li key={`${route.pickup}-${route.drop}`}>
                  <Link
                    to={`/?pickup=${encodeURIComponent(route.pickup)}&drop=${encodeURIComponent(route.drop)}`}
                    className="hover:text-primary transition-colors focus:outline-none flex items-center gap-1.5 text-left"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{route.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">
              Contact Info
            </h3>
            <ul className="space-y-3.5 text-sm font-semibold text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  123 Beach Road, White Town, Pondicherry, 605001, India.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+916374070342" className="hover:text-primary transition-colors hover:underline">
                  +91 63740 70342
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a
                  href="mailto:pondytourstravels@gmail.com"
                  className="hover:text-primary transition-colors hover:underline truncate"
                >
                  pondytourstravels@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Pondy Tours & Travels. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors hover:underline">
              Privacy Policy
            </Link>
            <Link to="/terms-conditions" className="hover:text-primary transition-colors hover:underline">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ChevronRightMini() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-3.5 h-3.5 text-primary shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.66 10 7.21 6.56a.75.75 0 1 1 1.06-1.06l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 0 1-1.06 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
