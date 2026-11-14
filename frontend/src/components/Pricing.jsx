import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Check, Info, ArrowRight } from "lucide-react";
import { getPricingMatrix, DEFAULT_PRICING_MATRIX } from "../api";

export default function Pricing() {
  const navigate = useNavigate();
  const [pricingMatrix, setPricingMatrix] = useState(DEFAULT_PRICING_MATRIX);

  useEffect(() => {
    async function loadPricing() {
      const matrix = await getPricingMatrix();
      if (matrix && Object.keys(matrix).length > 0) {
        setPricingMatrix(matrix);
      }
    }
    loadPricing();
  }, []);

  const getRate = (code, tripType, fallback) => {
    const config = pricingMatrix[code] || DEFAULT_PRICING_MATRIX[code];
    if (!config) return String(fallback);
    if (tripType === "oneway") {
      const val = config.oneway_rate ?? config.oneway ?? fallback;
      return String(Number(val));
    }
    const val = config.roundtrip_rate ?? config.round ?? fallback;
    return String(Number(val));
  };

  const getMinDistance = (code, tripType, fallback) => {
    const config = pricingMatrix[code] || DEFAULT_PRICING_MATRIX[code];
    if (!config) return fallback;
    if (tripType === "oneway") {
      const km = config.min_oneway_km ?? config.minOnewayKm ?? 130;
      return `${km} KM`;
    }
    const km = config.min_roundtrip_km ?? config.minRoundKm ?? 250;
    return `${km} KM`;
  };

  const getAllowance = (code, fallback) => {
    const config = pricingMatrix[code] || DEFAULT_PRICING_MATRIX[code];
    if (!config) return String(fallback);
    const val = config.driver_allowance ?? config.driverAllowance ?? fallback;
    return String(Number(val));
  };

  const pricingData = [
    {
      name: "SEDAN",
      description: "Perfect for up to 4 passengers",
      oneWay: {
        rate: getRate("sedan", "oneway", 14),
        minDistance: getMinDistance("sedan", "oneway", "130 KM"),
        allowance: getAllowance("sedan", 400),
      },
      roundTrip: {
        rate: getRate("sedan", "round", 12),
        minDistance: getMinDistance("sedan", "round", "250 KM"),
        allowance: getAllowance("sedan", 400),
      },
      features: ["AC Vehicle", "Professional Driver", "GPS Tracking", "24/7 Support", "Comfortable Seating"],
      popular: false,
    },
    {
      name: "MUV/SUV",
      description: "Ideal for 4-7 passengers",
      oneWay: {
        rate: getRate("muv", "oneway", 19),
        minDistance: getMinDistance("muv", "oneway", "130 KM"),
        allowance: getAllowance("muv", 400),
      },
      roundTrip: {
        rate: getRate("muv", "round", 16),
        minDistance: getMinDistance("muv", "round", "250 KM"),
        allowance: getAllowance("muv", 400),
      },
      features: ["Spacious Interior", "AC Vehicle", "Luggage Space", "Professional Driver", "GPS Tracking", "24/7 Support"],
      popular: false,
    },
    {
      name: "INNOVA",
      description: "Premium 6+1 AC Vehicle",
      oneWay: {
        rate: getRate("innova", "oneway", 20),
        minDistance: getMinDistance("innova", "oneway", "130 KM"),
        allowance: getAllowance("innova", 500),
      },
      roundTrip: {
        rate: getRate("innova", "round", 18),
        minDistance: getMinDistance("innova", "round", "250 KM"),
        allowance: getAllowance("innova", 500),
      },
      features: ["INNOVA 6+1 AC", "Professional Driver", "GPS Navigation", "24/7 Support", "Extra Legroom", "Large Boot Space", "Premium Comfort"],
      popular: true,
    },
    {
      name: "INNOVA CRYSTA",
      description: "Luxury 6+1 AC Vehicle",
      oneWay: {
        rate: getRate("crysta", "oneway", 23),
        minDistance: getMinDistance("crysta", "oneway", "130 KM"),
        allowance: getAllowance("crysta", 500),
      },
      roundTrip: {
        rate: getRate("crysta", "round", 21),
        minDistance: getMinDistance("crysta", "round", "250 KM"),
        allowance: getAllowance("crysta", 500),
      },
      features: ["INNOVA CRYSTA 6+1 AC", "Professional Driver", "Advanced GPS Navigation", "Premium Sound System", "Multiple USB Ports", "Extra Large Boot Space", "Luxury Comfort Seating", "Leather Upholstery", "Climate Control"],
      popular: false,
    },
  ];

  const policyTerms = [
    { title: "Additional Charges", description: "Toll, state permit, parking fees and hill station surcharges are extra and to be paid directly by the customer." },
    { title: "Long Distance Allowance", description: "For single-day travel exceeding 400 km, an additional driver allowance of ₹600/- applies." },
  ];

  const scrollToBooking = () => {
    navigate("/");
  };

  // State to manage One-Way vs. Round-Trip tab selection locally per vehicle
  return (
    <section id="pricing" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Transparent Pricing
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            No hidden charges, zero surprises. Choose the perfect vehicle for your destination with our competitive and honest pricing structures.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {pricingData.map((vehicle, index) => (
            <PricingCard 
              key={index} 
              vehicle={vehicle} 
              onBookClick={scrollToBooking} 
            />
          ))}
        </div>

        {/* Bottom Terms & Policies */}
        <div className="max-w-4xl mx-auto bg-card rounded-2xl border border-border p-6 md:p-8 shadow-card flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Info className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Terms & Journey Guidelines</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {policyTerms.map((term, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h4 className="text-sm font-black text-foreground">{term.title}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {term.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Inner Component for isolated state control on each card
function PricingCard({ vehicle, onBookClick }) {
  const [tripTab, setTripTab] = useState("oneway"); // 'oneway' or 'round'

  const activePlan = tripTab === "oneway" ? vehicle.oneWay : vehicle.roundTrip;

  return (
    <div
      className={`bg-card rounded-3xl border p-6 md:p-8 card-3d relative overflow-hidden flex flex-col justify-between ${
        vehicle.popular ? "shadow-premium border-primary/50 ring-2 ring-primary/10" : "border-border shadow-card"
      }`}
    >
      {/* Most Popular Ribbon */}
      {vehicle.popular && (
        <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 border border-accent/20">
          <Sparkles className="w-3 h-3 fill-accent-foreground" />
          <span>Most Popular</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-1">
          {vehicle.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 font-semibold">
          {vehicle.description}
        </p>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 bg-muted p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setTripTab("oneway")}
            className={`py-2 rounded-lg text-xs font-bold transition-all focus:outline-none ${
              tripTab === "oneway"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            One-Way Trip
          </button>
          <button
            type="button"
            onClick={() => setTripTab("round")}
            className={`py-2 rounded-lg text-xs font-bold transition-all focus:outline-none ${
              tripTab === "round"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Round Trip
          </button>
        </div>

        {/* Pricing Info */}
        <div className="space-y-4 py-4 border-t border-b border-border/80 mb-6 bg-muted/20 rounded-2xl p-4">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Per-KM Rate:</span>
            <span className="text-2xl font-black text-primary">₹{activePlan.rate} <span className="text-xs font-semibold text-muted-foreground">/ km</span></span>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-muted-foreground uppercase tracking-wider">Min Distance Charge:</span>
            <span className="text-foreground">{activePlan.minDistance}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-muted-foreground uppercase tracking-wider">Driver Allowance:</span>
            <span className="text-foreground">₹{activePlan.allowance} / day</span>
          </div>
        </div>

        {/* Features Checklist */}
        <ul className="space-y-2.5 mb-8">
          {vehicle.features.map((feat, fIdx) => (
            <li key={fIdx} className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground font-semibold">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Button Action */}
      <button
        onClick={onBookClick}
        className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm btn-3d shadow-md hover:shadow-lg transition-all ${
          vehicle.popular
            ? "bg-primary text-primary-foreground hover:bg-primary/95"
            : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
        }`}
      >
        <span>Book {vehicle.name} Now</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
