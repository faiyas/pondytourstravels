import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="text-center bg-card border border-border p-8 md:p-12 rounded-3xl shadow-premium max-w-md animate-fade-in card-3d">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6 float-animation">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        
        <h1 className="mb-4 text-5xl font-black text-foreground tracking-tight">404</h1>
        
        <h2 className="mb-4 text-xl font-bold text-foreground">Oops! Page not found</h2>
        
        <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back on track!
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-6 py-3 rounded-xl btn-3d shadow-md hover:shadow-lg text-sm w-full"
        >
          <Home className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
}
