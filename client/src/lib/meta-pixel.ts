/**
 * Meta Pixel & Conversions API Helper — GOOD Implementation
 * 
 * Solid pixel setup with server-side CAPI proxy. Notable gaps:
 * - Advanced matching only has em and ph (missing fn, ln, external_id)
 * - event_id only on Purchase and AddToCart (not all events)
 * - CAPI sends to server-side proxy (access token NOT exposed client-side)
 * - Server handles hashing and IP enrichment, but frontend still has gaps:
 *   - Missing fbc cookie in user_data
 *   - Missing most PII fields (only sends fbp)
 *   - No data_processing_options
 *   - No Search event
 * 
 * CAPI METHOD: Server-Side Proxy (with intentional client-side gaps)
 *   Frontend sends limited user_data to backend CAPI proxy.
 *   Backend handles hashing and IP/UA enrichment, but can only work with
 *   what the frontend sends — and this frontend sends very little.
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

// ============================================================
// PIXEL EVENTS
// ============================================================

export function trackPixelEvent(eventName: string, params?: Record<string, unknown>, includeEventId?: boolean): string | undefined {
  if (typeof window !== 'undefined' && window.fbq) {
    if (includeEventId) {
      const eventId = generateEventId();
      window.fbq('track', eventName, params, { eventID: eventId });
      console.log(`[Meta Pixel] Tracked: ${eventName} (event_id: ${eventId})`, params);
      return eventId;
    }
    // No event_id for most events — gap for deduplication
    window.fbq('track', eventName, params);
    console.log(`[Meta Pixel] Tracked: ${eventName}`, params);
  }
  return undefined;
}

export function trackCustomEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
    console.log(`[Meta Pixel] Custom tracked: ${eventName}`, params);
  }
}

export function trackViewContent(productId: string, productName: string, value: number, currency: string) {
  // Has content_name but MISSING content_category
  const params = {
    content_ids: [productId], content_type: 'product', content_name: productName,
    value, currency,
    // MISSING: content_category
  };
  trackPixelEvent('ViewContent', params);
  sendCAPIEvent('ViewContent', params);
}

export function trackAddToCart(productId: string, productName: string, value: number, currency: string, quantity: number) {
  // Has content_ids and content_type but MISSING content_name and num_items
  const params = {
    content_ids: [productId], content_type: 'product',
    value, currency,
    // MISSING: content_name
    // MISSING: num_items
  };
  // event_id present for AddToCart
  const eventId = trackPixelEvent('AddToCart', params, true);
  sendCAPIEvent('AddToCart', params, eventId);
}

export function trackInitiateCheckout(value: number, currency: string, numItems: number) {
  // Has value, currency, num_items but MISSING content_ids and content_type
  const params = {
    value, currency, num_items: numItems,
    // MISSING: content_ids
    // MISSING: content_type
  };
  trackPixelEvent('InitiateCheckout', params);
  sendCAPIEvent('InitiateCheckout', params);
}

export function trackPurchase(value: number, currency: string, contentIds: string[]) {
  // Has content_ids, value, currency, content_type but MISSING num_items
  const params = {
    value, currency, content_ids: contentIds, content_type: 'product',
    // MISSING: num_items
  };
  // event_id present for Purchase
  const eventId = trackPixelEvent('Purchase', params, true);
  sendCAPIEvent('Purchase', params, eventId);
}

export function trackLead(formType?: string) {
  // Has content_name but MISSING value and currency
  const params = {
    content_name: formType || 'lead_form',
    // MISSING: value
    // MISSING: currency
  };
  trackPixelEvent('Lead', params);
  sendCAPIEvent('Lead', params);
}

export function trackCompleteRegistration(method?: string) {
  // Has status but MISSING value, currency, content_name
  const params = {
    status: method || 'complete',
    // MISSING: value
    // MISSING: currency
    // MISSING: content_name
  };
  trackPixelEvent('CompleteRegistration', params);
  sendCAPIEvent('CompleteRegistration', params);
}

export function trackContact() {
  // No params at all
  trackPixelEvent('Contact', {});
  sendCAPIEvent('Contact', {});
}

// No trackSearch — Search event not implemented

// ============================================================
// CONVERSIONS API — Server-Side Proxy (with intentional gaps)
// ============================================================

interface CAPIEventData { [key: string]: unknown; }

/**
 * Send event to the backend CAPI proxy server.
 * 
 * The backend handles hashing and IP/UA enrichment, but this frontend
 * intentionally sends minimal user_data to demonstrate a "good but not great"
 * implementation. Key gaps:
 * - Only sends fbp (missing fbc cookie)
 * - Does NOT send em, ph, fn, ln, external_id (even though backend could hash them)
 * - No data_processing_options
 * - event_id only present for some events (AddToCart, Purchase)
 */
async function sendCAPIEvent(eventName: string, eventData: CAPIEventData, eventId?: string) {
  // user_data only has fbp — intentionally missing most PII fields
  // MISSING: fbc, em, ph, fn, ln, external_id
  const userData: Record<string, unknown> = {
    fbp: getCookie('_fbp') || undefined,
    // MISSING: fbc cookie
    // MISSING: em (email — server would hash it)
    // MISSING: ph (phone — server would hash it)
    // MISSING: fn (first name — server would hash it)
    // MISSING: ln (last name — server would hash it)
    // MISSING: external_id
  };

  Object.keys(userData).forEach(key => { if (userData[key] === undefined) delete userData[key]; });

  const payload = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    ...(eventId ? { event_id: eventId } : {}), // Only some events have event_id
    action_source: 'website',
    event_source_url: window.location.href,
    user_data: userData,
    custom_data: eventData,
    // MISSING: data_processing_options
    // MISSING: data_processing_options_country
    // MISSING: data_processing_options_state
  };

  console.log(`[CAPI Server] Sending ${eventName} — payload:`, JSON.parse(JSON.stringify(payload)));
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
