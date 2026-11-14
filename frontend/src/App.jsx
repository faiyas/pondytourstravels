import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "sonner";

// Page Components
import Home from "./pages/Home";
import ServicesPage from "./pages/ServicesPage";
import FleetPage from "./pages/FleetPage";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import RouteLandingPage from "./pages/RouteLandingPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Pondy RideCircle - Driver Portal (Mobile Auth - No Email)
import DriverLogin from "./pages/driver/DriverLogin";
import DriverRegister from "./pages/driver/DriverRegister";
import DriverOnboarding from "./pages/driver/DriverOnboarding";
import DriverDashboard from "./pages/driver/DriverDashboard";

// Pondy RideCircle - Customer Portal (Mobile Auth - Optional Login - No Email)
import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerRegister from "./pages/customer/CustomerRegister";
import CustomerDashboard from "./pages/customer/CustomerDashboard";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/fleet" element={<FleetPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/routes/:slug" element={<RouteLandingPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          
          {/* Custom In-App React Admin Portal */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Pondy RideCircle - Driver Partner Portal (Mobile Number Only - No Email) */}
          <Route path="/driver/login" element={<DriverLogin />} />
          <Route path="/driver/register" element={<DriverRegister />} />
          <Route path="/driver/onboarding" element={<DriverOnboarding />} />
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/driver" element={<DriverDashboard />} />

          {/* Pondy RideCircle - Customer Portal (Mobile Number Only - Optional Login - No Email) */}
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/register" element={<CustomerRegister />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/my-bookings" element={<CustomerDashboard />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster 
        position="top-center" 
        expand={false} 
        richColors 
        theme="light" // Will automatically adapt to system, or can set light/dark
      />
    </ThemeProvider>
  );
}
