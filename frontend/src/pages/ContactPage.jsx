import React, { useEffect } from "react";
import { CalendarDays, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import WhatsAppFloat from "../components/WhatsAppFloat";
import SEO from "../components/SEO";

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contactCards = [
    {
      icon: Phone,
      title: "Call 24/7",
      detail: "+91 63740 70342",
      href: "tel:+916374070342",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Booking",
      detail: "Chat with dispatch",
      href: "https://wa.me/916374070342",
    },
    {
      icon: Mail,
      title: "Email",
      detail: "pondytourstravels@gmail.com",
      href: "mailto:pondytourstravels@gmail.com",
    },
  ];

  const routes = [
    "Pondicherry to Chennai",
    "Pondicherry to Bangalore",
    "Pondicherry to Coimbatore",
    "Pondicherry to Madurai",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Contact Pondy Tours & Travels | Pondicherry Taxi Booking"
        description="Contact Pondy Tours & Travels for 24/7 Pondicherry taxi booking, WhatsApp cab reservations, airport transfers and outstation taxi support."
        path="/contact"
      />
      <Navbar />
      <main className="pt-32 pb-16 md:pt-36 md:pb-24 bg-background">
        <section className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
              <Phone className="w-3.5 h-3.5" />
              <span>Contact & Booking Support</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight">
              Contact Pondy Tours & Travels
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              Reach us anytime for Pondicherry taxi booking, fare help, airport pickup, outstation trips, and route availability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-10">
            {contactCards.map((card) => {
              const Icon = card.icon;
              return (
                <a
                  key={card.title}
                  href={card.href}
                  target={card.href.startsWith("https") ? "_blank" : undefined}
                  rel={card.href.startsWith("https") ? "noopener noreferrer" : undefined}
                  className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-premium transition-all card-3d"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-black text-foreground mb-1">{card.title}</h2>
                  <p className="text-sm font-semibold text-muted-foreground break-words">{card.detail}</p>
                </a>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-[1fr_0.9fr] gap-6 max-w-5xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-card">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground">Office Location</h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mt-1">
                    123 Beach Road, White Town, Pondicherry, 605001, India.
                  </p>
                </div>
              </div>
              <div className="aspect-[16/9] rounded-lg border border-border bg-muted/60 flex items-center justify-center text-center px-6">
                <div>
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-sm font-bold text-foreground">Pondicherry taxi service area</p>
                  <p className="text-xs text-muted-foreground mt-1">Serving Chennai, Bangalore, Coimbatore, Madurai and nearby outstation routes.</p>
                </div>
              </div>
            </div>

            <div className="bg-primary text-primary-foreground rounded-lg p-6 md:p-8 shadow-premium">
              <CalendarDays className="w-9 h-9 text-accent mb-4" />
              <h2 className="text-2xl font-black mb-3">Ready to book?</h2>
              <p className="text-sm leading-relaxed opacity-90 mb-6">
                Use the booking form for instant distance and estimated fare, then confirm directly through WhatsApp.
              </p>
              <Link
                to="/"
                className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-black text-accent-foreground shadow-lg btn-3d"
              >
                Go to Booking Form
              </Link>
              <div className="mt-6 pt-6 border-t border-primary-foreground/20">
                <p className="text-xs font-black uppercase tracking-widest opacity-75 mb-3">Popular contact routes</p>
                <ul className="space-y-2 text-sm font-semibold opacity-90">
                  {routes.map((route) => (
                    <li key={route}>{route}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
      <WhatsAppFloat />
    </div>
  );
}
