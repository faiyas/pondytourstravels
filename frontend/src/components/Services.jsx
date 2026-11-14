import React from "react";
import { Navigation, Repeat, Plane, CheckCircle2 } from "lucide-react";

export default function Services() {
  const servicesList = [
    {
      icon: Navigation,
      title: "One-Way Trips",
      description: "Comfortable intercity travel from Pondicherry to Tamil Nadu, Kerala, Bangalore, and Andhra Pradesh.",
      features: ["GPS Tracking", "Door-to-door service", "Professional drivers"],
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      icon: Repeat,
      title: "Round Trips",
      description: "Complete round-trip packages with flexible scheduling and competitive pricing.",
      features: ["Wait time included", "Multiple stops", "Return guarantee"],
      iconColor: "text-accent",
      iconBg: "bg-accent/10",
    },
    {
      icon: Plane,
      title: "Airport Transfers",
      description: "Reliable airport pickup and drop services with flight tracking.",
      features: ["Flight monitoring", "Meet & greet", "24/7 availability"],
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
  ];

  return (
    <section id="services" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Our Premium Services
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience comfort, safety, and reliability with our comprehensive taxi services tailored for your every journey need.
          </p>
        </div>

        {/* Grid of Services */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {servicesList.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="bg-card rounded-2xl border border-border p-6 md:p-8 card-3d hover:shadow-premium cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Icon Block */}
                  <div className={`w-14 h-14 ${service.iconBg} rounded-2xl flex items-center justify-center mb-6 scale-on-hover`}>
                    <IconComponent className={`w-7 h-7 ${service.iconColor}`} />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                {/* Features Check List */}
                <ul className="space-y-2.5 pt-4 border-t border-border/60">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
