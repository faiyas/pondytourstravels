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

export async function convertLeadToBooking(leadId) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/leads/${leadId}/convert/`, {
      method: "POST",
      headers: getAuthHeaders(),
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

// ============================================================================
// DRIVERS API
// ============================================================================

export async function fetchAdminDrivers() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/drivers/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch drivers");
    const data = await res.json();
    return data.drivers || [];
  } catch (err) {
    console.error("fetchAdminDrivers error:", err);
    return [];
  }
}

export async function createAdminDriver(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/drivers/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminDriver(driverId, payload) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/drivers/${driverId}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteAdminDriver(driverId) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/drivers/${driverId}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ============================================================================
// VEHICLES API
// ============================================================================

export async function fetchAdminVehicles() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/vehicles/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch vehicles");
    const data = await res.json();
    return data.vehicles || [];
  } catch (err) {
    console.error("fetchAdminVehicles error:", err);
    return [];
  }
}

export async function createAdminVehicle(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/vehicles/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminVehicle(vehicleId, payload) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/vehicles/${vehicleId}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteAdminVehicle(vehicleId) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/vehicles/${vehicleId}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ============================================================================
// REPORTS & ANALYTICS API
// ============================================================================

export async function fetchAdminReports() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/reports/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch reports");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("fetchAdminReports error:", err);
    return null;
  }
}

// ============================================================================
// PONDY RIDE CIRCLE - DRIVER PORTAL CLIENT (MOBILE + PASSWORD - NO EMAIL)
// ============================================================================

export function getDriverToken() {
  return localStorage.getItem("pondy_driver_token");
}

export function setDriverSession(token, driver) {
  localStorage.setItem("pondy_driver_token", token);
  localStorage.setItem("pondy_driver_user", JSON.stringify(driver));
}

export function clearDriverSession() {
  localStorage.removeItem("pondy_driver_token");
  localStorage.removeItem("pondy_driver_user");
}

export function getDriverUser() {
  try {
    const raw = localStorage.getItem("pondy_driver_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isDriverLoggedIn() {
  return !!getDriverToken();
}

function getDriverAuthHeaders() {
  const token = getDriverToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}`, "Driver-Token": token } : {}),
  };
}

export async function driverRegister(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/driver/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function driverLogin(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/driver/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function driverResetPassword(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/driver/reset-password/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function fetchDriverProfile() {
  try {
    const res = await fetch(`${API_BASE}/api/driver/profile/`, {
      headers: getDriverAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateDriverProfile(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/driver/profile/update/`, {
      method: "POST",
      headers: getDriverAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function submitDriverDocuments(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/driver/documents/submit/`, {
      method: "POST",
      headers: getDriverAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function fetchDriverDuties() {
  try {
    const res = await fetch(`${API_BASE}/api/driver/duties/`, {
      headers: getDriverAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message, duties: [] };
  }
}

export async function updateDriverDutyStatus(dutyId, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/api/driver/duties/${dutyId}/status/`, {
      method: "POST",
      headers: getDriverAuthHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ============================================================================
// CUSTOMER AUTHENTICATION (MOBILE + PASSWORD - NO EMAIL DEPENDENCY)
// ============================================================================

export function getCustomerToken() {
  return localStorage.getItem("pondy_customer_token");
}

export function setCustomerSession(token, customer) {
  localStorage.setItem("pondy_customer_token", token);
  localStorage.setItem("pondy_customer_user", JSON.stringify(customer));
}

export function clearCustomerSession() {
  localStorage.removeItem("pondy_customer_token");
  localStorage.removeItem("pondy_customer_user");
}

export function isCustomerLoggedIn() {
  return !!getCustomerToken();
}

export function getCustomerUser() {
  try {
    return JSON.parse(localStorage.getItem("pondy_customer_user"));
  } catch {
    return null;
  }
}

export async function customerRegister(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/customer/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function customerLogin(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/customer/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function customerResetPassword(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/customer/reset-password/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function getCustomerAuthHeaders() {
  const token = getCustomerToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}`, "Customer-Token": token } : {}),
  };
}

export async function fetchCustomerBookings() {
  try {
    const res = await fetch(`${API_BASE}/api/customer/bookings/`, {
      headers: getCustomerAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, trips: [] };
  }
}

export async function customerCancelBooking(bookingId, reason) {
  try {
    const res = await fetch(`${API_BASE}/api/customer/bookings/${bookingId}/cancel/`, {
      method: "POST",
      headers: getCustomerAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function customerSubmitFeedback(bookingId, rating, feedback) {
  try {
    const res = await fetch(`${API_BASE}/api/customer/bookings/${bookingId}/feedback/`, {
      method: "POST",
      headers: getCustomerAuthHeaders(),
      body: JSON.stringify({ rating, feedback }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}






