import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Services from "../components/Services";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import WhatsAppFloat from "../components/WhatsAppFloat";
import SEO from "../components/SEO";

export default function ServicesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Taxi Services in Pondicherry | One-Way, Round Trip & Airport Transfers"
        description="Explore Pondy Tours & Travels taxi services including Pondicherry one-way cabs, round trips, airport transfers and 24/7 outstation taxi booking."
        path="/services"
      />
      <Navbar />
      <main className="pt-24 md:pt-28">
        <Services />
      </main>
      <Footer />
      <ScrollToTop />
      <WhatsAppFloat />
    </div>
  );
}
