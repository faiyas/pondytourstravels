import React from "react";
import { Phone } from "lucide-react";
import { trackAnalyticsEvent } from "../api";

export default function WhatsAppFloat() {
  const handleCallClick = () => {
    trackAnalyticsEvent("phone_click", window.location.pathname, { source: "floating_call_btn" });
  };

  const handleWhatsAppClick = () => {
    trackAnalyticsEvent("whatsapp_float_click", window.location.pathname, { source: "floating_whatsapp_btn" });
  };

  return (
    <div>
      {/* Floating Call Button (Left Side) - Small (w-11 h-11) for mobile comfort */}
      <a
        href="tel:+916374070342"
        onClick={handleCallClick}
        className="fixed left-4 bottom-6 z-40 w-11 h-11 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-premium flex items-center justify-center transition-all hover:scale-110 focus:outline-none border border-blue-600/30 scale-on-hover float-animation"
        aria-label="Call Pondy Tours & Travels"
      >
        <Phone className="w-5 h-5 text-white" />
      </a>

      {/* Floating WhatsApp Button (Right Side) - Small (w-11 h-11) for mobile comfort */}
      <a
        href="https://wa.me/916374070342"
        onClick={handleWhatsAppClick}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-4 bottom-6 z-40 w-11 h-11 rounded-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-premium flex items-center justify-center transition-all hover:scale-110 focus:outline-none border border-green-600/30 scale-on-hover float-animation"
        aria-label="Chat with us on WhatsApp"
      >
        <WhatsAppIcon className="w-5 h-5 fill-current" />
      </a>
    </div>
  );
}

// Inline SVG helper for WhatsApp icon (standard & high-quality)
function WhatsAppIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437 0 9.862-4.364 9.864-9.73 0-2.599-1.017-5.042-2.863-6.89-1.846-1.848-4.301-2.866-6.9-2.867-5.442 0-9.871 4.366-9.874 9.735-.001 1.558.428 3.082 1.243 4.42l-.988 3.604 3.708-.973zm10.741-6.938c-.29-.145-1.716-.848-1.982-.945-.266-.097-.461-.145-.656.145-.195.29-.757.945-.928 1.139-.172.193-.343.217-.633.072-.29-.145-1.226-.452-2.336-1.444-.863-.77-1.447-1.721-1.616-2.011-.17-.29-.018-.447.127-.59.13-.13.29-.339.435-.508.145-.169.193-.29.29-.483.097-.193.048-.363-.024-.508-.072-.145-.656-1.581-.9-2.164-.236-.57-.478-.49-.656-.499-.17-.008-.363-.01-.556-.01-.193 0-.507.072-.772.363-.266.29-1.014.992-1.014 2.422 0 1.43 1.039 2.81 1.184 3.003.145.193 2.044 3.12 4.953 4.378.692.299 1.233.478 1.655.612.695.221 1.328.19 1.829.115.558-.084 1.716-.701 1.958-1.378.242-.676.242-1.256.17-1.378-.072-.121-.266-.193-.556-.339z" />
    </svg>
  );
}
