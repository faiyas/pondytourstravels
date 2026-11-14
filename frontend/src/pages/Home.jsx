import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import BookingForm from "../components/BookingForm";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import WhatsAppFloat from "../components/WhatsAppFloat";
import SEO from "../components/SEO";

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Pondy Tours & Travels | Pondicherry to Chennai Taxi Service"
        description="Book Pondicherry to Chennai, Bangalore, Coimbatore and Madurai taxi service with Pondy Tours & Travels. 24/7 outstation cabs, verified drivers, Sedan, Ertiga, Innova and Crysta."
      />
      <Navbar />
      <main>
        <BookingForm />
        <div className="lg:hidden">
          <Hero />
        </div>
        <OrganicRouteLinks />
      </main>
      <Footer />
      <ScrollToTop />
      <WhatsAppFloat />
    </div>
  );
}

function OrganicRouteLinks() {
  const routes = [
    ["Pondicherry to Chennai Taxi", "Pondicherry", "Chennai"],
    ["Chennai to Pondicherry Taxi", "Chennai", "Pondicherry"],
    ["Pondicherry to Bangalore Taxi", "Pondicherry", "Bangalore"],
    ["Pondicherry to Coimbatore Taxi", "Pondicherry", "Coimbatore"],
    ["Pondicherry to Madurai Taxi", "Pondicherry", "Madurai"],
  ];

  return (
    <section className="bg-muted/30 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-foreground">
            Popular Pondicherry Taxi Routes
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
            Quick access to common one-way and round-trip taxi bookings from Pondicherry.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {routes.map(([label, pickup, drop]) => (
            <Link
              key={`${pickup}-${drop}`}
              to={`/?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}`}
              className="rounded-lg border border-border bg-card p-4 text-sm font-black text-foreground shadow-card transition-all hover:border-primary hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
