# Meta Pixel & Conversions API — Integration Notes

This document describes the current state of the Meta Pixel and Conversions API integration in this demo e-commerce site, including all **intentional gaps** left for testing a pixel/CAPI analysis skill.

---

## Current Implementation

### Pixel Base Code
- **Location**: `client/index.html` (in `<head>`)
- **Pixel ID**: `123456789012345` (placeholder — not a real pixel)
- **SDK Version**: `fbevents.js` v2.0
- **Loading**: Synchronous inline script

### Events Implemented

| Event | Page/Action | Parameters Sent | Missing Parameters |
|-------|-------------|-----------------|-------------------|
| PageView | Every page (auto) | None | N/A |
| ViewContent | Product detail page | content_ids, content_type, value, currency | content_name, content_category |
| AddToCart | Add to cart button | content_ids, content_type, value, currency | content_name, num_items |
| InitiateCheckout | Cart drawer → Checkout | value, currency | content_ids, num_items, content_type |
| Purchase | Checkout form submit | value, currency, content_ids (partial) | content_type, num_items |
| Lead | Contact form, Checkout, Registration | content_name (sometimes) | value, currency |
| CompleteRegistration | Register form submit | status | value, currency, content_name |
| Contact | Contact form submit | None | value, currency |

### CAPI Implementation
- **Type**: Client-side simulation (logs to console)
- **Endpoint**: Simulated POST to `graph.facebook.com/v18.0/{PIXEL_ID}/events`
- **Access Token**: Placeholder (`PLACEHOLDER_ACCESS_TOKEN`)

---

## Intentional Gaps for Skill Testing

### Critical Gaps

1. **Placeholder Pixel ID** — Using `123456789012345` instead of a real pixel ID
2. **No noscript fallback** — Missing `<noscript><img>` tag in index.html
3. **No Advanced Matching** — `fbq('init')` called without any user data parameters (em, ph, fn, ln, etc.)
4. **CAPI is client-side** — Should be server-side; currently just logs to console
5. **No event_id for deduplication** — Pixel and CAPI events have no matching event_id

### High Priority Gaps

6. **Missing parameters on key events**:
   - ViewContent: missing `content_name`, `content_category`
   - AddToCart: missing `content_name`, `num_items`
   - InitiateCheckout: missing `content_ids`, `num_items`, `content_type`
   - Purchase: missing `content_type`, `num_items`
   - Lead: missing `value`, `currency`
   - CompleteRegistration: missing `value`, `currency`, `content_name`
   - Contact: missing `value`, `currency`

7. **No Search event** — Not implemented at all

8. **CAPI missing user_data fields**:
   - `client_ip_address` (must be server-side)
   - `client_user_agent` (should be server-side)
   - `fbc` (click ID cookie)
   - `fbp` (browser ID cookie)
   - `em` (hashed email)
   - `ph` (hashed phone)
   - `fn` (hashed first name)
   - `ln` (hashed last name)
   - `external_id` (hashed user ID)

### Medium Priority Gaps

9. **No data_processing_options** — Missing CCPA/GDPR compliance fields
10. **No CAPI retry logic** — Failed events are lost
11. **No CAPI event batching** — Events sent individually
12. **No SHA-256 hashing** — PII data not hashed before CAPI
13. **action_source hardcoded** — Always 'website', should vary
14. **No external_id** — Missing cross-device tracking parameter
15. **No opt_out field** — Missing user consent handling
16. **Event Setup Tool not referenced** — Could use for codeless events
17. **No domain verification** — Not configured
18. **First-party cookies** — Not explicitly managed

### Low Priority Gaps

19. **No connected catalogs** — Product catalog not linked
20. **No mobile app linking** — No app events
21. **No historical conversion uploads** — Not configured
22. **Pixel loaded synchronously** — Could be deferred for performance

---

## File Locations

| File | Purpose |
|------|---------|
| `client/index.html` | Pixel base code, init, PageView |
| `client/src/lib/meta-pixel.ts` | All event tracking functions + CAPI simulation |
| `client/src/pages/ProductDetail.tsx` | ViewContent event |
| `client/src/pages/Checkout.tsx` | Purchase + Lead events |
| `client/src/pages/Contact.tsx` | Contact + Lead events |
| `client/src/pages/Register.tsx` | CompleteRegistration + Lead events |
| `client/src/components/ProductCard.tsx` | AddToCart event |
| `client/src/components/CartDrawer.tsx` | InitiateCheckout event |

---

## How to Test

1. Open browser DevTools → Console
2. Navigate through the site and watch for `[Meta Pixel]` and `[CAPI Simulation]` log messages
3. Each event logs its name and parameters
4. Compare logged parameters against the "Missing Parameters" column above
