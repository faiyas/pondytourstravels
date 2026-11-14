import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import WhatsAppFloat from "../components/WhatsAppFloat";
import SEO from "../components/SEO";
import { FileText, ArrowLeft, ShieldAlert, Award, Compass, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsConditions() {
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const termsList = [
    {
      icon: Compass,
      title: "Minimum Distance Policy",
      items: [
        "Minimum one-way drop distance: 130 km for all vehicles.",
        "Minimum round-trip distance: 250 km per day threshold.",
      ],
    },
    {
      icon: DollarSign,
      title: "Driver Allowance",
      items: [
        "Sedan / Hatchback vehicles: ₹400/- daily driver allowance.",
        "SUV / Ertiga / Innova: ₹400/- driver allowance.",
        "Premium Innova Crysta: ₹500/- driver allowance.",
        "For travel single-day limits exceeding 400 km: ₹600/- driver allowance.",
      ],
    },
    {
      icon: Award,
      title: "Hill Station Charges",
      items: [
        "Mini & Sedan segment: ₹400/- additional permit.",
        "MUV & SUV (Ertiga / Innova) segment: ₹600/- permit.",
        "Note: Hill station charges are not applicable for round-trip packages.",
      ],
    },
    {
      icon: ShieldAlert,
      title: "Additional Excluded Charges",
      items: [
        "National highway toll charges will be extra (paid by customer).",
        "Interstate border tax will be extra (paid by customer).",
        "State travel permit charges will be extra (paid by customer).",
        "Monuments and airport parking charges will be extra (paid by customer).",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Taxi Booking Terms & Conditions | Pondy Tours & Travels"
        description="Read Pondy Tours & Travels taxi booking terms, driver allowance, minimum distance policy, tolls, permits and outstation cab charges."
        path="/terms-conditions"
      />
      <Navbar />
      <main className="container mx-auto px-4 py-28 md:py-36 max-w-4xl shrink-0">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-primary hover:underline group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to Homepage</span>
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-sm text-muted-foreground font-semibold mt-1">
              Last Updated: May 18, 2026 • Pondy Tours & Travels Agency Policies
            </p>
          </div>
        </div>

        {/* Policies grid cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {termsList.map((category, idx) => {
            const IconComponent = category.icon;
            return (
              <div key={idx} className="bg-card border border-border rounded-3xl p-6 shadow-card card-3d">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <IconComponent className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">
                    {category.title}
                  </h2>
                </div>
                <ul className="space-y-2.5">
                  {category.items.map((bullet, bIdx) => (
                    <li key={bIdx} className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-2" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom Booking reminder */}
        <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20 text-center space-y-4">
          <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
            Ready to Travel?
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            By booking a ride through our form, you acknowledge and agree to these standard dispatch and toll allowance terms. We ensure transparent pricing with no hidden charges.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-accent text-accent-foreground font-bold px-6 py-3 rounded-xl btn-3d shadow-md hover:shadow-lg text-sm"
          >
            <span>Go to Booking Form</span>
          </Link>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
      <WhatsAppFloat />
    </div>
  );
}
