import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase, ChevronRight, Check } from "lucide-react";

export default function Fleet() {
  const navigate = useNavigate();
  const fleetList = [
    {
      name: "Sedan",
      image: "/images/vehicle/sedan.png",
      passengers: "1-4 passengers",
      luggage: "2-3 bags",
      category: "Luxury",
      features: [
        "Air Conditioning",
        "Leather Seats",
        "GPS Navigation",
        "Music System",
        "Phone Charging",
      ],
    },
    {
      name: "MUV/SUV",
      image: "/images/vehicle/ertiga.png",
      passengers: "4-7 passengers",
      luggage: "4-5 bags",
      category: "Premium",
      features: [
        "Extra Legroom",
        "Large Boot Space",
        "Air Conditioning",
        "GPS Navigation",
        "Multiple Charging Ports",
      ],
    },
    {
      name: "INNOVA",
      image: "/images/vehicle/innova.png",
      passengers: "6+1 passengers",
      luggage: "4-5 bags",
      category: "Premium",
      features: [
        "Air Conditioning",
        "Extra Legroom",
        "GPS Navigation",
        "Music System",
        "Phone Charging",
        "Large Boot Space",
        "Premium Comfort",
      ],
    },
    {
      name: "INNOVA CRYSTA",
      image: "/images/vehicle/innova-crysta.png",
      passengers: "6+1 passengers",
      luggage: "4-5 bags",
      category: "Luxury Plus",
      features: [
        "Premium Air Conditioning",
        "Enhanced Legroom",
        "Advanced GPS Navigation",
        "Premium Sound System",
        "Multiple USB Charging Ports",
        "Extra Large Boot Space",
        "Luxury Comfort Seating",
        "Leather Upholstery",
        "Climate Control",
      ],
    },
  ];

  const scrollToBooking = () => {
    navigate("/");
  };

  return (
    <section id="fleet" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Our Premium Fleet
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose from our clean, well-maintained selection of vehicles tailored to match your personal convenience, passenger group size, and destination requirements.
          </p>
        </div>

        {/* Fleet Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleetList.map((cab, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-premium card-3d cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Vehicle Image Block */}
                <div className="relative rounded-xl overflow-hidden bg-muted/40 p-4 mb-4 flex items-center justify-center h-40">
                  <span className="absolute top-2 right-2 px-2.5 py-1 bg-primary/10 text-primary font-bold text-[10px] uppercase rounded-full tracking-wider border border-primary/20">
                    {cab.category}
                  </span>
                  <img
                    src={cab.image}
                    alt={cab.name}
                    className="object-contain max-h-32 hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg"; // Safety fallback
                    }}
                  />
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-foreground mb-1 uppercase tracking-tight">
                  {cab.name}
                </h3>

                {/* Metrics */}
                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span>{cab.passengers}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-accent" />
                    <span>{cab.luggage}</span>
                  </div>
                </div>

                {/* Detailed Features */}
                <ul className="space-y-1.5 pt-3 border-t border-border/80 mb-6">
                  {cab.features.slice(0, 5).map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  {cab.features.length > 5 && (
                    <li className="text-[10px] text-primary/80 font-bold uppercase tracking-wider pl-5">
                      + {cab.features.length - 5} More Luxury Features
                    </li>
                  )}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={scrollToBooking}
                className="w-full py-2.5 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground font-bold transition-all flex items-center justify-center gap-1.5 text-xs group"
              >
                <span>Book This Taxi</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
