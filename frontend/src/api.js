/**
 * Pondy Tours & Travels - Centralized Backend API Client
 * Connects the React Frontend to the Django REST Backend
 */

const API_BASE = 
  (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim() !== "")
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")
    : "https://8001-agq5qlr2uletnjyzudtddvxrdq.instabox.tech";

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

// ============================================================================
// ADMIN DASHBOARD & AUTHENTICATION API
// ============================================================================

export function getAdminToken() {
  return localStorage.getItem("pondy_admin_token");
}

export function setAdminSession(token, user) {
  localStorage.setItem("pondy_admin_token", token);
  localStorage.setItem("pondy_admin_user", JSON.stringify(user));
}

export function clearAdminSession() {
  localStorage.removeItem("pondy_admin_token");
  localStorage.removeItem("pondy_admin_user");
}

export function getAdminUser() {
  try {
    const raw = localStorage.getItem("pondy_admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAdminLoggedIn() {
  return !!getAdminToken();
}

function getAuthHeaders() {
  const token = getAdminToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

export async function adminLogin(username, password) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Login failed");
    }
    setAdminSession(data.token, data.user);
    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function fetchAdminStats() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/stats/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load dashboard metrics");
    return await res.json();
  } catch (err) {
    console.error("fetchAdminStats error:", err);
    return null;
  }
}

export async function fetchAdminLeads(status = "all", search = "") {
  try {
    const url = new URL(`${API_BASE}/api/admin/leads/`, window.location.origin);
    if (status) url.searchParams.set("status", status);
    if (search) url.searchParams.set("search", search);

    const res = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load customer enquiries");
    const data = await res.json();
    return data.leads || [];
  } catch (err) {
    console.error("fetchAdminLeads error:", err);
    return [];
  }
}

export async function updateLeadStatus(leadId, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/leads/${leadId}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function fetchAdminBookings(status = "all") {
  try {
    const url = new URL(`${API_BASE}/api/admin/bookings/`, window.location.origin);
    if (status) url.searchParams.set("status", status);

    const res = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load booking vouchers");
    const data = await res.json();
    return data.bookings || [];
  } catch (err) {
    console.error("fetchAdminBookings error:", err);
    return [];
  }
}

export async function updateBookingDetails(bookingDbId, payload) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/bookings/${bookingDbId}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function fetchAdminPricing() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/pricing/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch vehicle pricing");
    const data = await res.json();
    return data.pricing || [];
  } catch (err) {
    console.error("fetchAdminPricing error:", err);
    return [];
  }
}

export async function saveAdminPricing(pricingList) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/pricing/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ pricing: pricingList }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch SMTP & Automated Email Configuration
 */
export async function fetchAdminSmtpSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/smtp/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      console.warn(`fetchAdminSmtpSettings: Backend returned ${res.status}`);
      return null;
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("fetchAdminSmtpSettings error:", err);
    return null;
  }
}

/**
 * Save SMTP & Automated Email Configuration
 */
export async function saveAdminSmtpSettings(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/smtp/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return { 
        success: false, 
        error: `Backend returned ${res.status} (Endpoint not active yet). Please run "git pull" and restart "pondy_backend" on the server.` 
      };
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Test SMTP Email Dispatch
 */
export async function testAdminSmtpSettings(testEmail, settings = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/smtp/test/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...settings, testEmail }),
    });
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return { 
        success: false, 
        error: `Backend returned ${res.status} (Endpoint not active yet). Please run "git pull" and restart "pondy_backend" on the server.` 
      };
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}



