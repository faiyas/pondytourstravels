import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import WhatsAppFloat from "../components/WhatsAppFloat";
import SEO from "../components/SEO";
import { ShieldAlert, ArrowLeft, Key, Lock, Eye, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const privacySections = [
    {
      icon: Lock,
      title: "1. Information We Collect",
      content: "We collect personal details that you voluntarily submit when reserving a taxi cab. This includes your full name, phone number, email address, pick-up/drop-off destinations, coordinates, travel date, time, and special requirements. We use this information solely to process your bookings and contact you.",
    },
    {
      icon: Key,
      title: "2. How We Use Your Data",
      content: "Your travel data is used to calculate routing metrics, estimate fares, and generate instant WhatsApp booking vouchers. We also store details in our secure database to coordinate with dispatch drivers and send transactional booking emails.",
    },
    {
      icon: Eye,
      title: "3. Data Security & Exclusions",
      content: "We do not sell, rent, or trade your personal data to third parties. We employ industrial-grade Secure Socket Layers (SSL), encrypted cookies, and authenticated Supabase database policies to prevent unauthorized data access.",
    },
    {
      icon: CheckCircle,
      title: "4. Cookies Policy",
      content: "Our website uses local cookies and theme states ('light'/'dark') to optimize browser responsiveness. You can choose to disable cookies in your browser settings, though it may alter visual preferences.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Privacy Policy | Pondy Tours & Travels"
        description="Privacy policy for Pondy Tours & Travels taxi bookings, including how customer booking details, route data and contact information are used."
        path="/privacy-policy"
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
            <ShieldAlert className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground font-semibold mt-1">
              Effective Date: May 18, 2026 • Website:{" "}
              <a href="https://pondytourstravels.com/" className="text-primary hover:underline font-bold">
                https://pondytourstravels.com/
              </a>
            </p>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-6 mb-12">
          {privacySections.map((section, idx) => {
            const IconComponent = section.icon;
            return (
              <section key={idx} className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-card card-3d">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <IconComponent className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-foreground">
                    {section.title}
                  </h2>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </section>
            );
          })}
        </div>

        {/* FAQ Contact footer */}
        <div className="bg-muted p-6 rounded-3xl border border-border">
          <h3 className="font-bold text-foreground text-sm uppercase tracking-wider mb-2">
            Questions & Contact
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">
            If you have any questions regarding this privacy policy or wish to request data deletions, please contact us:
          </p>
          <div className="space-y-2 text-xs md:text-sm font-semibold text-muted-foreground">
            <p>
              Phone:{" "}
              <a href="tel:+916374070342" className="text-primary hover:underline">
                +91 63740 70342
              </a>
            </p>
            <p>
              Email:{" "}
              <a href="mailto:pondytourstravels@gmail.com" className="text-primary hover:underline">
                pondytourstravels@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
      <WhatsAppFloat />
    </div>
  );
}
