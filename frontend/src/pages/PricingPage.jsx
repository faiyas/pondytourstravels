import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Pricing from "../components/Pricing";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import WhatsAppFloat from "../components/WhatsAppFloat";
import SEO from "../components/SEO";

export default function PricingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Pondicherry Taxi Pricing | Transparent Outstation Cab Rates"
        description="View Pondy Tours & Travels taxi pricing for Sedan, Ertiga, Innova and Innova Crysta with one-way and round-trip outstation cab rates."
        path="/pricing"
      />
      <Navbar />
      <main className="pt-24 md:pt-28">
        <Pricing />
      </main>
      <Footer />
      <ScrollToTop />
      <WhatsAppFloat />
    </div>
  );
}
