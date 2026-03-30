/**
 * Meta Pixel & Conversions API Helper — Optimized Implementation
 *
 * Server-side CAPI proxy with full user data collection and deduplication.
 *
 * CAPI METHOD: Server-Side Proxy
 *   Frontend collects user_data (fbp, fbc, PII) and sends it to the backend
 *   CAPI proxy. Backend handles SHA-256 hashing and IP/UA enrichment before
 *   forwarding to Meta's Graph API.
 */

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

const PIXEL_ID = '1684145446350033';

// CAPI Backend Proxy URL — access token is stored server-side only
const CAPI_PROXY_URL = 'https://meta-capi-proxy-tau.vercel.app/api/capi/event';

function generateEventId(): string {
  return 'eid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
}

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
}

/**
 * Extract the Click ID (fbc) from the _fbc cookie. If the cookie is not
 * present, attempt to construct it from the fbclid URL query parameter
 * using the format: fb.1.{timestamp}.{fbclid}
 */
function getFbc(): string | undefined {
  const fromCookie = getCookie('_fbc');
  if (fromCookie) return fromCookie;

  try {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get('fbclid');
    if (fbclid) {
      return `fb.1.${Date.now()}.${fbclid}`;
    }
  } catch { /* ignore */ }
  return undefined;
}

// ============================================================
// PII STORAGE — Collected from forms and reused across events
// ============================================================

interface UserPII {
  em?: string;  // email
  ph?: string;  // phone
  fn?: string;  // first name
  ln?: string;  // last name
}

let storedPII: UserPII = {};

/**
 * Store PII collected from forms (checkout, registration, contact).
 * The server proxy will handle SHA-256 hashing before sending to Meta.
 */
export function setUserPII(pii: UserPII) {
  storedPII = { ...storedPII, ...pii };
}

/** Clear stored PII (e.g., on logout). */
export function clearUserPII() {
  storedPII = {};
}

// ============================================================
// PIXEL EVENTS — All events now include event_id for deduplication
// ============================================================

export function trackPixelEvent(eventName: string, params?: Record<string, unknown>): string {
  const eventId = generateEventId();
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params, { eventID: eventId });
    console.log(`[Meta Pixel] Tracked: ${eventName} (event_id: ${eventId})`, params);
  }
  return eventId;
}

export function trackCustomEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
    console.log(`[Meta Pixel] Custom tracked: ${eventName}`, params);
  }
}

export function trackViewContent(productId: string, productName: string, value: number, currency: string) {
  const params = {
    content_ids: [productId], content_type: 'product', content_name: productName,
    value, currency,
  };
  const eventId = trackPixelEvent('ViewContent', params);
  sendCAPIEvent('ViewContent', params, eventId);
}

export function trackAddToCart(productId: string, productName: string, value: number, currency: string, quantity: number) {
  const params = {
    content_ids: [productId], content_type: 'product', content_name: productName,
    value, currency, num_items: quantity,
  };
  const eventId = trackPixelEvent('AddToCart', params);
  sendCAPIEvent('AddToCart', params, eventId);
}

export function trackInitiateCheckout(value: number, currency: string, numItems: number, contentIds?: string[]) {
  const params: Record<string, unknown> = {
    value, currency, num_items: numItems,
  };
  if (contentIds && contentIds.length > 0) {
    params.content_ids = contentIds;
    params.content_type = 'product';
  }
  const eventId = trackPixelEvent('InitiateCheckout', params);
  sendCAPIEvent('InitiateCheckout', params, eventId);
}

export function trackPurchase(value: number, currency: string, contentIds: string[], numItems?: number) {
  const params: Record<string, unknown> = {
    value, currency, content_ids: contentIds, content_type: 'product',
  };
  if (numItems !== undefined) {
    params.num_items = numItems;
  }
  const eventId = trackPixelEvent('Purchase', params);
  sendCAPIEvent('Purchase', params, eventId);
}

export function trackLead(formType?: string) {
  const params = {
    content_name: formType || 'lead_form',
  };
  const eventId = trackPixelEvent('Lead', params);
  sendCAPIEvent('Lead', params, eventId);
}

export function trackCompleteRegistration(method?: string) {
  const params = {
    status: method || 'complete',
  };
  const eventId = trackPixelEvent('CompleteRegistration', params);
  sendCAPIEvent('CompleteRegistration', params, eventId);
}

export function trackContact() {
  const eventId = trackPixelEvent('Contact', {});
  sendCAPIEvent('Contact', {}, eventId);
}

// ============================================================
// CONVERSIONS API — Server-Side Proxy (Optimized)
// ============================================================

interface CAPIEventData { [key: string]: unknown; }

/**
 * Send event to the backend CAPI proxy server.
 *
 * Collects fbp, fbc (Click ID), and any stored PII, then sends them
 * in user_data. The backend handles SHA-256 hashing of PII and enriches
 * the payload with client_ip_address and client_user_agent.
 */
async function sendCAPIEvent(eventName: string, eventData: CAPIEventData, eventId: string) {
  const userData: Record<string, unknown> = {
    fbp: getCookie('_fbp') || undefined,
    fbc: getFbc() || undefined,
  };

  // Include any PII collected from forms (server will hash these)
  if (storedPII.em) userData.em = storedPII.em;
  if (storedPII.ph) userData.ph = storedPII.ph;
  if (storedPII.fn) userData.fn = storedPII.fn;
  if (storedPII.ln) userData.ln = storedPII.ln;

  // Remove undefined values
  Object.keys(userData).forEach(key => { if (userData[key] === undefined) delete userData[key]; });

  const payload = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website',
    event_source_url: window.location.href,
    user_data: userData,
    custom_data: eventData,
    test_event_code: 'TEST9113', // TODO: REMOVE before production deployment!
  };

  console.log(`[CAPI Server] Sending ${eventName} (event_id: ${eventId}) — payload:`, JSON.parse(JSON.stringify(payload)));
  try {
    const response = await fetch(CAPI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    console.log(`[CAPI Server] ${eventName} — response:`, result);
  } catch (err) {
    console.error(`[CAPI Server] Failed to send ${eventName}:`, err);
  }
}
