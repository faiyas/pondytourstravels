/**
 * Pondy Tours & Travels - Centralized Backend API Client
 * Connects the React Frontend to the Django REST Backend
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Fallback local pricing matrix in case backend API is unreachable
 */
export const DEFAULT_PRICING_MATRIX = {
  sedan: {
    name: "Sedan (Dzire / Etios)",
    oneway: 14,
    round: 12,
    minOnewayKm: 130,
    minRoundKm: 250,
    driverAllowance: 400,
    over400Allowance: 600,
  },
  muv: {
    name: "MUV / SUV (Ertiga)",
    oneway: 19,
    round: 16,
    minOnewayKm: 130,
    minRoundKm: 250,
    driverAllowance: 400,
    over400Allowance: 600,
  },
  innova: {
    name: "Innova 6+1",
    oneway: 20,
    round: 18,
    minOnewayKm: 130,
    minRoundKm: 250,
    driverAllowance: 500,
    over400Allowance: 600,
  },
  crysta: {
    name: "Innova Crysta Luxury",
    oneway: 23,
    round: 21,
    minOnewayKm: 130,
    minRoundKm: 250,
    driverAllowance: 500,
    over400Allowance: 600,
  },
};

/**
 * Fetch live pricing matrix from Django Backend
 */
export async function getPricingMatrix() {
  try {
    const res = await fetch(`${API_BASE}/api/pricing/`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch live pricing");
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Backend pricing API unreachable, using fallback matrix:", err);
    return DEFAULT_PRICING_MATRIX;
  }
}

/**
 * Save new lead / booking enquiry to Django PostgreSQL database
 */
export async function createLeadEnquiry(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/leads/enquiry/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to save enquiry in database");
    }
    return data;
  } catch (err) {
    console.error("Lead creation error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Track WhatsApp button click event for a specific lead
 */
export async function markWhatsAppClicked(leadId) {
  if (!leadId) return;
  try {
    await fetch(`${API_BASE}/api/leads/${leadId}/whatsapp-click/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.warn("Telemetry error for WhatsApp click:", err);
  }
}

/**
 * Track telemetry events (phone calls, page views, floating buttons)
 */
export async function trackAnalyticsEvent(eventType, pagePath = window.location.pathname, metadata = {}) {
  try {
    await fetch(`${API_BASE}/api/analytics/track/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: eventType,
        page_path: pagePath,
        metadata: metadata,
      }),
    });
  } catch (err) {
    // Fail silently so it never breaks user interaction
  }
}

