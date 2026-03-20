/**
 * Meta Pixel & Conversions API Helper
 * 
 * INTENTIONAL GAPS FOR SKILL TESTING:
 * 
 * PIXEL GAPS:
 * 1. No advanced matching data passed to fbq('init') — missing em, ph, fn, ln, etc.
 * 2. No noscript fallback in index.html
 * 3. Using placeholder pixel ID (123456789012345)
 * 4. Some events missing required parameters (e.g., Purchase missing content_ids sometimes)
 * 5. No event_id for deduplication with CAPI
 * 6. ViewContent event missing content_name parameter
 * 7. Search event not implemented
 * 8. No external_id parameter for cross-device tracking
 * 
 * CAPI GAPS:
 * 1. CAPI endpoint is a simulation (no real server-side implementation)
 * 2. No event_id matching between pixel and CAPI events
 * 3. Missing user_data fields (client_ip_address, client_user_agent, fbc, fbp)
 * 4. No hashing of PII data before sending
 * 5. action_source not always set correctly
 * 6. Missing opt_out field
 * 7. No retry logic for failed CAPI calls
 * 8. No batching of CAPI events
 */

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

const PIXEL_ID = '123456789012345';

// ============================================================
// PIXEL EVENTS (Browser-side)
// ============================================================

/**
 * Track a standard pixel event
 * IMPROVEMENT: Should include event_id for deduplication
 */
export function trackPixelEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
    console.log(`[Meta Pixel] Tracked: ${eventName}`, params);
  }
}

/**
 * Track a custom pixel event
 */
export function trackCustomEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
    console.log(`[Meta Pixel] Custom tracked: ${eventName}`, params);
  }
}

/**
 * Track ViewContent event when a user views a product
 * IMPROVEMENT OPPORTUNITIES:
 * - Missing content_name parameter
 * - Missing content_category parameter
 * - No event_id for CAPI deduplication
 */
export function trackViewContent(productId: string, productName: string, value: number, currency: string) {
  trackPixelEvent('ViewContent', {
    content_ids: [productId],
    content_type: 'product',
    value: value,
    currency: currency,
    // MISSING: content_name — should be productName
    // MISSING: content_category
  });

  // CAPI call — but missing event_id for deduplication
  sendCAPIEvent('ViewContent', {
    content_ids: [productId],
    content_type: 'product',
    value: value,
    currency: currency,
  });
}

/**
 * Track AddToCart event
 * IMPROVEMENT OPPORTUNITIES:
 * - No event_id for deduplication
 * - Missing num_items parameter
 */
export function trackAddToCart(productId: string, productName: string, value: number, currency: string, quantity: number) {
  trackPixelEvent('AddToCart', {
    content_ids: [productId],
    content_type: 'product',
    value: value,
    currency: currency,
    // MISSING: content_name
    // MISSING: num_items — should be quantity
  });

  sendCAPIEvent('AddToCart', {
    content_ids: [productId],
    content_type: 'product',
    value: value,
    currency: currency,
  });
}

/**
 * Track InitiateCheckout event
 * IMPROVEMENT OPPORTUNITIES:
 * - Missing content_ids (should list all items in cart)
 * - Missing num_items
 * - No event_id
 */
export function trackInitiateCheckout(value: number, currency: string, numItems: number) {
  trackPixelEvent('InitiateCheckout', {
    value: value,
    currency: currency,
    // MISSING: content_ids — should list all product IDs in cart
    // MISSING: num_items — should be numItems
    // MISSING: content_type
  });

  sendCAPIEvent('InitiateCheckout', {
    value: value,
    currency: currency,
  });
}

/**
 * Track Purchase event
 * IMPROVEMENT OPPORTUNITIES:
 * - Missing content_ids (critical for dynamic ads)
 * - Missing content_type
 * - Missing num_items
 * - No event_id for deduplication
 */
export function trackPurchase(value: number, currency: string, contentIds?: string[]) {
  trackPixelEvent('Purchase', {
    value: value,
    currency: currency,
    // PARTIALLY MISSING: content_ids only sometimes passed
    // MISSING: content_type — should be 'product'
    // MISSING: num_items
    ...(contentIds ? { content_ids: contentIds } : {}),
  });

  sendCAPIEvent('Purchase', {
    value: value,
    currency: currency,
    ...(contentIds ? { content_ids: contentIds } : {}),
  });
}

/**
 * Track Lead event (contact form, newsletter, etc.)
 * IMPROVEMENT OPPORTUNITIES:
 * - Missing value and currency (recommended for optimization)
 * - No user data passed for matching
 */
export function trackLead(formType?: string) {
  trackPixelEvent('Lead', {
    // MISSING: value — recommended for lead value optimization
    // MISSING: currency
    ...(formType ? { content_name: formType } : {}),
  });

  sendCAPIEvent('Lead', {
    ...(formType ? { content_name: formType } : {}),
  });
}

/**
 * Track CompleteRegistration event
 * IMPROVEMENT OPPORTUNITIES:
 * - Missing value parameter
 * - Missing currency parameter
 * - No user data for advanced matching
 */
export function trackCompleteRegistration(method?: string) {
  trackPixelEvent('CompleteRegistration', {
    // MISSING: value
    // MISSING: currency
    // MISSING: content_name — should describe registration type
    ...(method ? { status: method } : {}),
  });

  sendCAPIEvent('CompleteRegistration', {
    ...(method ? { status: method } : {}),
  });
}

/**
 * Track Contact event
 * IMPROVEMENT: Should include value for lead scoring
 */
export function trackContact() {
  trackPixelEvent('Contact', {
    // MISSING: value
    // MISSING: currency
  });

  sendCAPIEvent('Contact', {});
}

// ============================================================
// CONVERSIONS API (Simulated Server-Side)
// ============================================================

/**
 * Simulated CAPI event sender
 * 
 * INTENTIONAL GAPS:
 * 1. This runs client-side — real CAPI should be server-side
 * 2. No event_id for deduplication with pixel events
 * 3. Missing user_data: client_ip_address, client_user_agent, fbc, fbp cookies
 * 4. PII data (email, phone) not hashed with SHA-256
 * 5. No retry logic on failure
 * 6. No batching — sends events one at a time
 * 7. action_source hardcoded — should vary by context
 * 8. Missing data_processing_options for CCPA/GDPR compliance
 */
interface CAPIEventData {
  [key: string]: unknown;
}

function sendCAPIEvent(eventName: string, eventData: CAPIEventData) {
  const payload = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      // IMPROVEMENT: Should include event_id matching the pixel event_id
      // event_id: generateEventId(),
      action_source: 'website', // IMPROVEMENT: Should vary (website, app, email, etc.)
      event_source_url: window.location.href,
      user_data: {
        // IMPROVEMENT: Should include these fields:
        // client_ip_address: '', // Must be set server-side
        // client_user_agent: navigator.userAgent, // Should be set server-side
        // fbc: getCookie('_fbc'), // Click ID cookie
        // fbp: getCookie('_fbp'), // Browser ID cookie
        // em: '', // Hashed email
        // ph: '', // Hashed phone
        // fn: '', // Hashed first name
        // ln: '', // Hashed last name
        // external_id: '', // Your user ID, hashed
      },
      custom_data: eventData,
      // MISSING: data_processing_options for CCPA compliance
      // MISSING: data_processing_options_country
      // MISSING: data_processing_options_state
      // MISSING: opt_out field
    }],
    // IMPROVEMENT: Should use real access token
    access_token: 'PLACEHOLDER_ACCESS_TOKEN',
  };

  // Simulated CAPI call — in production this should be a server-side POST to:
  // https://graph.facebook.com/v18.0/{PIXEL_ID}/events
  const capiEndpoint = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`;
  
  // Log the simulated CAPI call (not actually sending to avoid errors with placeholder token)
  console.log(`[CAPI Simulation] Would POST to: ${capiEndpoint}`);
  console.log(`[CAPI Simulation] Payload:`, JSON.stringify(payload, null, 2));
  
  // IMPROVEMENT: Real implementation would be:
  // fetch(capiEndpoint, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // }).catch(err => console.error('[CAPI] Failed:', err));
  // 
  // But this should actually be done SERVER-SIDE, not client-side
}

// IMPROVEMENT: Should implement these helper functions:
// function generateEventId(): string { ... }
// function getCookie(name: string): string { ... }
// function hashSHA256(value: string): string { ... }
