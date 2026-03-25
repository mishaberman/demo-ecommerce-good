# demo-ecommerce-good

## Overview
This variant demonstrates a **good but imperfect** Meta Pixel and Conversions API (CAPI) implementation. It uses a server-side proxy for CAPI events but has several intentional gaps: no PII hashing, no data processing options, no batch endpoint, and limited user data fields. This is part of a collection of demo e-commerce sites that showcase different levels of Meta Pixel and CAPI implementation quality.

**Live Site:** https://mishaberman.github.io/demo-ecommerce-good/
**Quality Grade:** B+

## Architecture

```
┌──────────────┐     fbq() events      ┌──────────────────┐
│   Browser    │ ──────────────────────>│   Meta Pixel     │
│  (React SPA) │                        │   (Client-Side)  │
│              │     POST /api/capi/*   └──────────────────┘
│              │ ──────────────────────>┌──────────────────┐
└──────────────┘                        │  CAPI Proxy      │
                                        │  (Express.js)    │
                                        │  - IP enrichment │
                                        │  - UA enrichment │
                                        │  - NO PII hashing│
                                        │  - NO LDU        │
                                        └───────┬──────────┘
                                                │ POST graph.facebook.com
                                                ▼
                                        ┌──────────────────┐
                                        │  Meta Conversions│
                                        │  API (Server)    │
                                        └──────────────────┘
```

### Frontend (`src/`)
- Vite + React + TypeScript SPA deployed to GitHub Pages
- Fires `fbq()` pixel events with `eventID` for deduplication
- Sends matching events to the CAPI proxy server with the same `event_id`
- Collects basic user data (email, phone) but not full address fields

### Backend (`server/`)
- Express.js CAPI proxy server
- Endpoints: `POST /api/capi/event`, `GET /api/capi/health`
- Enriches payloads with `client_ip_address` and `client_user_agent`
- **Does NOT hash PII** — sends raw email/phone values to the Graph API
- **No batch endpoint** — only single event submission
- **No data processing options** — LDU/CCPA compliance missing
- Access token stored in environment variables

## Meta Pixel Setup

### Base Pixel Code
- **Pixel ID:** `1684145446350033`
- **Location:** The base pixel code is loaded in the `<head>` tag of `index.html`.
- **Noscript Fallback:** Included for users with JavaScript disabled.

### Advanced Matching
- **User Data:** Basic user data is collected including email (`em`) and phone (`ph`).
- **Missing Fields:** First name (`fn`), last name (`ln`), city (`ct`), state (`st`), zip code (`zp`) are NOT collected.
- **Implementation:** User data is passed via client-side `fbq('init', ...)` and forwarded to the CAPI proxy.

## Conversions API (CAPI) Setup

### Method
**Server-Side Proxy** — Events are sent from the browser to an Express.js backend, which enriches them with IP/UA and forwards to Meta's Conversions API. However, PII is NOT hashed server-side.

### Server Code Location
- **Main proxy:** `server/capi-proxy.js` — Standalone Express server
- **Package:** `server/package.json` — Dependencies and scripts

### Implementation Details
- **Event Transmission:** Browser → `POST /api/capi/event` → Express proxy → `POST graph.facebook.com/v21.0/{pixel_id}/events`
- **Access Token:** Stored in `META_ACCESS_TOKEN` environment variable
- **PII Hashing:** **NOT IMPLEMENTED** — Raw PII values (email, phone) are sent directly to the Graph API. This is a significant security and compliance gap.
- **IP Enrichment:** `client_ip_address` extracted from `X-Forwarded-For` header
- **User Agent:** `client_user_agent` extracted from `User-Agent` header
- **Data Processing Options:** **NOT IMPLEMENTED** — No LDU/CCPA/GDPR compliance
- **Batch Support:** **NOT AVAILABLE** — Only single event endpoint exists

### Intentional Gaps
1. **No PII Hashing:** Raw email and phone are sent to the Conversions API without SHA-256 hashing
2. **No Data Processing Options:** `data_processing_options` field is completely absent
3. **No Phone Normalization:** Phone numbers are not stripped of non-digit characters
4. **Limited User Data:** Only `em` and `ph` are collected; `fn`, `ln`, `ct`, `st`, `zp` are missing
5. **No Batch Endpoint:** Only single-event submission is supported

## Events Tracked

| Event Name           | Pixel | CAPI | Parameters Sent                                              | event_id |
|----------------------|-------|------|--------------------------------------------------------------|----------|
| PageView             | Yes   | Yes  | (none)                                                       | Yes      |
| ViewContent          | Yes   | Yes  | `content_ids`, `content_type`, `content_name`, `value`, `currency` | Yes      |
| AddToCart            | Yes   | Yes  | `content_ids`, `content_type`, `content_name`, `value`, `currency` | Yes      |
| InitiateCheckout     | Yes   | Yes  | `content_ids`, `content_type`, `content_name`, `value`, `currency` | Yes      |
| Purchase             | Yes   | Yes  | `content_ids`, `content_type`, `content_name`, `value`, `currency` | Yes      |
| Lead                 | Yes   | Yes  | `content_name`, `value`, `currency`                            | Yes      |
| CompleteRegistration | Yes   | Yes  | `content_name`, `value`, `currency`                            | Yes      |
| Contact              | Yes   | Yes  | `content_name`, `value`, `currency`                            | Yes      |
| Search               | Yes   | No   | `search_string`                                              | No       |

## Event Deduplication
- **`event_id`:** Events are assigned a unique `event_id` that is sent with both the browser pixel and the CAPI payload.
- **Deduplication Status:** Deduplication is implemented for most events. The `Search` event is pixel-only and does not have CAPI deduplication.

## User Data Parameters (EMQ)

| Parameter            | Collected | Hashed | Notes                           |
|----------------------|-----------|--------|---------------------------------|
| `em` (email)         | Yes       | **No** | Sent as raw text (gap)          |
| `ph` (phone)         | Yes       | **No** | Sent as raw text, not normalized|
| `fn` (first name)    | No        | —      | Not collected                   |
| `ln` (last name)     | No        | —      | Not collected                   |
| `ct` (city)          | No        | —      | Not collected                   |
| `st` (state)         | No        | —      | Not collected                   |
| `zp` (zip code)      | No        | —      | Not collected                   |
| `external_id`        | No        | —      | Not collected                   |
| `fbp`                | Yes       | No     | From `_fbp` cookie              |
| `fbc`                | Yes       | No     | From `_fbc` cookie              |
| `client_ip_address`  | Yes       | No     | Server-side (X-Forwarded-For)   |
| `client_user_agent`  | Yes       | No     | Server-side (User-Agent header) |

## Deployment

### Frontend (GitHub Pages)
The frontend is automatically deployed to GitHub Pages via the `gh-pages` branch.

### Backend (Self-Hosted)
```bash
cd server
npm install
META_PIXEL_ID=your_pixel_id META_ACCESS_TOKEN=your_token node capi-proxy.js
```

## Security Considerations
- **Access Token:** Stored in environment variables, not in client-side code
- **PII Hashing:** **MISSING** — This is the most critical security gap. All PII should be SHA-256 hashed before sending to Meta.
- **CORS:** Configured to allow cross-origin requests
- **No Hardcoded Secrets:** No tokens committed to the repository

## Known Issues
1. **No PII Hashing** — Raw email/phone sent to Graph API (security risk)
2. **No LDU/CCPA Compliance** — Missing `data_processing_options`
3. **Limited User Data** — Only email and phone collected, missing address fields
4. **No Batch Support** — Single event endpoint only
5. **Search Event Gap** — Search is pixel-only, not sent via CAPI

---
*This variant is part of the [Meta Pixel Quality Variants](https://github.com/mishaberman) collection for testing and educational purposes.*
