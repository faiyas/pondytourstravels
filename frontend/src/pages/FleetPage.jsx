import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Fleet from "../components/Fleet";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import WhatsAppFloat from "../components/WhatsAppFloat";
import SEO from "../components/SEO";

export default function FleetPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Pondicherry Taxi Fleet | Sedan, Ertiga, Innova & Crysta"
        description="Choose from Sedan, MUV/SUV Ertiga, Innova and Innova Crysta vehicles for Pondicherry outstation taxi service with verified drivers."
        path="/fleet"
      />
      <Navbar />
      <main className="pt-24 md:pt-28">
        <Fleet />
      </main>
      <Footer />
      <ScrollToTop />
      <WhatsAppFloat />
    </div>
  );
}
