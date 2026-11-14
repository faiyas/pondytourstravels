import React, { useEffect } from "react";
import { Award, Clock, ShieldCheck, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import WhatsAppFloat from "../components/WhatsAppFloat";
import SEO from "../components/SEO";

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const points = [
    { icon: Award, title: "13+ Years Experience", text: "Long-running local taxi support for Pondicherry outstation travel." },
    { icon: ShieldCheck, title: "Verified Drivers", text: "Professional drivers for one-way drops, round trips and airport transfers." },
    { icon: Clock, title: "24/7 Booking", text: "Call or WhatsApp anytime for route availability and booking confirmation." },
    { icon: Users, title: "Family Friendly", text: "Sedan, Ertiga, Innova and Crysta options for different travel needs." },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="About Pondy Tours & Travels | Pondicherry Taxi Service"
        description="Learn about Pondy Tours & Travels, a Pondicherry taxi service for Chennai, Bangalore, Coimbatore, Madurai, airport transfers and outstation cab booking."
        path="/about"
      />
      <Navbar />
      <main className="pt-32 pb-16 md:pt-36 md:pb-24">
        <section className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>About Us</span>
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-black text-foreground">
              Pondy Tours & Travels
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              We provide dependable Pondicherry taxi booking for outstation routes, airport transfers, one-way drops and round trips across Tamil Nadu, Karnataka, Kerala and Andhra Pradesh.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {points.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.title} className="rounded-lg border border-border bg-card p-6 shadow-card">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-black text-foreground">{point.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{point.text}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
      <WhatsAppFloat />
    </div>
  );
}
