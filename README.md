# Demo E-Commerce: Good Variant <img src="https://img.shields.io/badge/Grade-B-yellow" alt="Grade B" />

This 'Good' variant demonstrates a solid but incomplete implementation of the Meta Pixel and Conversions API. It correctly uses a server-side proxy for secure handling of the access token, includes event deduplication to prevent double counting, and implements basic server-side hashing of user data. However, it lacks more advanced features like phone number normalization before hashing, batching support for events, and robust error handling with a retry mechanism. This variant represents a realistic 'good enough' implementation that many advertisers might have in production.

### Quick Facts

| Feature | Details |
|---|---|
| Pixel ID | `1684145446350033` |
| CAPI Method | Server-side proxy via Vercel (`meta-capi-proxy-tau.vercel.app`) |
| Grade | B (60/100) |
| Live Site | [https://mishaberman.github.io/demo-ecommerce-good/](https://mishaberman.github.io/demo-ecommerce-good/) |
| GitHub Repo | [https://github.com/mishaberman/demo-ecommerce-good](https://github.com/mishaberman/demo-ecommerce-good) |

### What's Implemented

- [x] **Meta Pixel Base Code:** The base pixel is firing on all pages.
- [x] **Standard Events:** Key e-commerce events are tracked (ViewContent, AddToCart, InitiateCheckout, Purchase, Lead, Search, CompleteRegistration).
- [x] **Conversions API (Server-Side Proxy):** CAPI is implemented via a Vercel serverless function, ensuring the access token is not exposed client-side.
- [x] **Event Deduplication:** `event_id` is used to deduplicate events between the browser (Pixel) and the server (CAPI).
- [x] **Basic User Data Hashing:** User data parameters are hashed (SHA-256) on the server before being sent to Meta.
- [x] **FBP/FBC Parameters:** `fbp` (browser ID) and `fbc` (click ID) cookies are correctly included in CAPI payloads.
- [x] **Data Processing Options (DPO):** The implementation includes support for `data_processing_options` for CCPA and other privacy regulations.

### What's Missing or Broken

- [ ] **No Phone Number Normalization:** Phone numbers are not normalized to the E.164 format before hashing, which can lower Event Match Quality.
- [ ] **No Batching:** The original server code does not use the CAPI batch endpoint. Events are sent one by one, which is less efficient. (Note: A PR was added to demonstrate batching).
- [ ] **Basic Error Handling:** The server-side proxy has minimal error handling and no retry logic for failed API calls.
- [ ] **No Client-Side Advanced Matching:** The implementation does not attempt to capture user data from forms on the client-side for Advanced Matching.
- [ ] **Simpler Parameter Structure:** This variant sends a more basic set of parameters compared to the 'Excellent' variant, which may limit reporting and optimization capabilities.

### Event Coverage

This table shows which events are firing from the browser (Pixel) and the server (CAPI).

| Event | Pixel (Browser) | CAPI (Server) |
|---|:---:|:---:|
| PageView | ✅ | ❌ |
| ViewContent | ✅ | ✅ |
| AddToCart | ✅ | ✅ |
| InitiateCheckout | ✅ | ✅ |
| Purchase | ✅ | ✅ |
| Lead | ✅ | ✅ |
| Search | ✅ | ✅ |
| CompleteRegistration | ✅ | ✅ |

### Parameter Completeness

This table shows which parameters are sent with each event. This implementation uses the same parameter set for all events.

| Event | `content_type` | `content_ids` | `value` | `currency` | `content_name` | `num_items` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| ViewContent | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AddToCart | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| InitiateCheckout | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Purchase | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lead | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CompleteRegistration | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Architecture

The tracking for this variant is implemented using a server-side proxy deployed as a Vercel serverless function. 

1.  **Client-Side (Pixel):** The Meta Pixel base code and standard event tracking are implemented in the website's JavaScript. When a trackable action occurs (e.g., a user adds an item to the cart), the browser fires a Pixel event and also sends a request to a custom server-side endpoint.
2.  **Server-Side (Proxy):** A Vercel serverless function receives the request from the client. This function is located in the `/api/capi/` directory. It takes the event data, securely adds the Meta CAPI access token (stored as an environment variable), hashes the user data, and then forwards the complete payload to the Meta Conversions API endpoint.
3.  **Deduplication:** The client generates a unique `event_id` for each event. This ID is sent with both the Pixel event and the CAPI event, allowing Meta to deduplicate them and keep only the most reliable data.

This proxy architecture (`api/capi/event.js`, `api/capi/batch.js`, `api/capi/health.js`) ensures that the CAPI access token is never exposed in the browser, which is a critical security best practice.

### How to Use This Variant

1.  **Browse the Site:** Navigate through the [live demo site](https://mishaberman.github.io/demo-ecommerce-good/) and perform actions like viewing products, adding to cart, and completing a purchase.
2.  **Use Meta Pixel Helper:** Install the [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) Chrome extension to see the Pixel events firing in your browser.
3.  **Check Events Manager:** Go to your Meta Events Manager for Pixel ID `1684145446350033` to see the incoming Pixel and CAPI events. You can verify that events are being deduplicated correctly.
4.  **Audit the Code:** Review the source code in the [GitHub repository](https://github.com/mishaberman/demo-ecommerce-good) to understand the implementation details of both the client-side tracking and the server-side proxy.
