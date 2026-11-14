import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, MapPin, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import WhatsAppFloat from "../components/WhatsAppFloat";
import SEO from "../components/SEO";

const ROUTES = {
  "pondicherry-to-chennai-taxi": {
    title: "Pondicherry to Chennai Taxi | One-Way & Round Trip Cab",
    h1: "Pondicherry to Chennai Taxi",
    from: "Pondicherry",
    to: "Chennai",
    distance: "150 km approx.",
    duration: "3 to 4 hours approx.",
    description:
      "Book Pondicherry to Chennai taxi service with verified drivers, clean cars, GPS tracking and transparent outstation cab pricing.",
    routes: ["Pondicherry to Chennai Airport", "Pondicherry to Chennai Central", "Pondicherry to OMR", "Pondicherry to T Nagar"],
  },
  "chennai-to-pondicherry-taxi": {
    title: "Chennai to Pondicherry Taxi | 24/7 Outstation Cab Booking",
    h1: "Chennai to Pondicherry Taxi",
    from: "Chennai",
    to: "Pondicherry",
    distance: "150 km approx.",
    duration: "3 to 4 hours approx.",
    description:
      "Reserve Chennai to Pondicherry taxi service for airport pickup, one-way cab travel, family trips and round-trip outstation rides.",
    routes: ["Chennai Airport to Pondicherry", "Chennai Central to Pondicherry", "OMR to Pondicherry", "ECR to Pondicherry"],
  },
  "pondicherry-to-bangalore-taxi": {
    title: "Pondicherry to Bangalore Taxi | Sedan, Ertiga, Innova & Crysta",
    h1: "Pondicherry to Bangalore Taxi",
    from: "Pondicherry",
    to: "Bangalore",
    distance: "310 km approx.",
    duration: "6 to 7 hours approx.",
    description:
      "Book Pondicherry to Bangalore taxi service with Sedan, Ertiga, Innova and Innova Crysta options for comfortable intercity travel.",
    routes: ["Pondicherry to Electronic City", "Pondicherry to Whitefield", "Pondicherry to Koramangala", "Pondicherry to Bangalore Airport"],
  },
  "pondicherry-to-coimbatore-taxi": {
    title: "Pondicherry to Coimbatore Taxi | Reliable Outstation Cab",
    h1: "Pondicherry to Coimbatore Taxi",
    from: "Pondicherry",
    to: "Coimbatore",
    distance: "380 km approx.",
    duration: "7 to 8 hours approx.",
    description:
      "Book reliable Pondicherry to Coimbatore taxi service for one-way drops, round trips, business travel and family journeys.",
    routes: ["Pondicherry to Coimbatore Airport", "Pondicherry to Gandhipuram", "Pondicherry to Peelamedu", "Pondicherry to RS Puram"],
  },
  "pondicherry-to-madurai-taxi": {
    title: "Pondicherry to Madurai Taxi | One-Way & Round Trip Cab",
    h1: "Pondicherry to Madurai Taxi",
    from: "Pondicherry",
    to: "Madurai",
    distance: "330 km approx.",
    duration: "6 to 7 hours approx.",
    description:
      "Book Pondicherry to Madurai taxi service with 24/7 support, verified drivers, clean vehicles and transparent outstation fare details.",
    routes: ["Pondicherry to Madurai Airport", "Pondicherry to Meenakshi Amman Temple", "Pondicherry to Mattuthavani", "Pondicherry to Madurai Junction"],
  },
};

export const routeSlugs = Object.keys(ROUTES);

export function getRouteData(slug) {
  return ROUTES[slug];
}

export default function RouteLandingPage() {
  const { slug } = useParams();
  const route = ROUTES[slug] || ROUTES["pondicherry-to-chennai-taxi"];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const path = `/routes/${slug}`;
  const bookingPath = `/?pickup=${encodeURIComponent(route.from)}&drop=${encodeURIComponent(route.to)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: route.h1,
    description: route.description,
    provider: {
      "@id": "https://pondytourstravels.com/#taxi-service",
    },
    areaServed: [route.from, route.to, "Puducherry", "Tamil Nadu"],
    serviceType: "Outstation taxi service",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      url: `https://pondytourstravels.com${path}`,
    },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title={route.title} description={route.description} path={path} jsonLd={jsonLd} />
      <Navbar />
      <main className="pt-32 pb-16 md:pt-36 md:pb-24">
        <section className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_0.85fr] gap-8 lg:gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-primary">
                <MapPin className="h-3.5 w-3.5" />
                <span>Route Taxi Booking</span>
              </div>
              <h1 className="mt-4 text-3xl md:text-5xl font-black text-foreground leading-tight">
                {route.h1}
              </h1>
              <p className="mt-4 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
                {route.description} Choose one-way or round-trip cab options and confirm directly through WhatsApp.
              </p>

              <div className="mt-8 grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Distance", value: route.distance, icon: MapPin },
                  { label: "Travel Time", value: route.duration, icon: Clock },
                  { label: "Support", value: "24/7 booking", icon: ShieldCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg border border-border bg-card p-5 shadow-card">
                      <Icon className="h-5 w-5 text-primary mb-3" />
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                      <p className="mt-1 text-sm font-black text-foreground">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-card">
                <h2 className="text-xl font-black text-foreground">Popular pickup and drop points</h2>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  {route.routes.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to={bookingPath}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-sm font-black text-accent-foreground shadow-lg btn-3d"
                >
                  Book this route
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="tel:+916374070342"
                  className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3.5 text-sm font-black text-foreground hover:border-primary"
                >
                  Call +91 63740 70342
                </a>
              </div>
            </div>

            <aside className="rounded-lg border border-border bg-card p-6 shadow-premium">
              <img
                src="/images/vehicle/innova-crysta.png"
                alt={`${route.h1} cab`}
                className="h-56 w-full object-contain"
                onError={(e) => {
                  e.target.src = "/placeholder.svg";
                }}
              />
              <div className="mt-6 space-y-4">
                <h2 className="text-xl font-black text-foreground">Why book with Pondy Tours?</h2>
                {["Verified drivers", "Clean AC vehicles", "Transparent route pricing", "WhatsApp confirmation"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
      <WhatsAppFloat />
    </div>
  );
}
