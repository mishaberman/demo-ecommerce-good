/**
 * Meta Pixel & Conversions API Helper — GOOD Implementation
 * 
 * Solid pixel setup with basic CAPI. Notable gaps:
 * - Advanced matching only has em and ph (missing fn, ln, external_id)
 * - event_id only on Purchase and AddToCart (not all events)
 * - CAPI missing most user_data fields (no fbc, em, ph, fn, ln, external_id)
 * - No PII hashing
 * - No data_processing_options
 * - No Search event
 */

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

const PIXEL_ID = '1684145446350033';
const CAPI_ACCESS_TOKEN = 'EAAEDq1LHx1gBRPAEq5cUOKS5JrrvMif65SN8ysCUrX5t0SUZB3ETInM6Pt71VHea0bowwEehinD0oZAeSmIPWivziiVu0FuEIcsmgvT3fiqZADKQDiFgKdsugONbJXELgvLuQxHT0krELKt3DPhm0EyUa44iXu8uaZBZBddgVmEnFdNMBmsWmYJdOT17DTitYKwZDZD';

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
// CONVERSIONS API — Basic implementation with gaps
// ============================================================

interface CAPIEventData { [key: string]: unknown; }

async function sendCAPIEvent(eventName: string, eventData: CAPIEventData, eventId?: string) {
  // user_data only has client_user_agent and fbp
  // MISSING: fbc, em, ph, fn, ln, external_id
  const userData: Record<string, unknown> = {
    client_user_agent: navigator.userAgent,
    fbp: getCookie('_fbp') || undefined,
    // MISSING: fbc cookie
    // MISSING: em (hashed email)
    // MISSING: ph (hashed phone)
    // MISSING: fn (hashed first name)
    // MISSING: ln (hashed last name)
    // MISSING: external_id
  };

  Object.keys(userData).forEach(key => { if (userData[key] === undefined) delete userData[key]; });

  const payload = {
    data: [{
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
    }],
    access_token: CAPI_ACCESS_TOKEN,
  };

  const capiEndpoint = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`;

  try {
    const response = await fetch(capiEndpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    console.log(`[CAPI] Sent ${eventName}:`, result);
  } catch (err) {
    console.error(`[CAPI] Failed to send ${eventName}:`, err);
  }
}
