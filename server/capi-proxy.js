/**
 * CAPI Proxy Server — Good Implementation
 *
 * Server-side proxy that forwards events to Meta's Conversions API.
 * Keeps the access token on the server and performs basic server-side
 * enrichment. Has some intentional gaps compared to the "excellent" variant:
 *
 * INTENTIONAL GAPS:
 *   - Does NOT hash PII server-side (sends raw email/phone to Graph API)
 *   - Does NOT include data_processing_options (no LDU/CCPA compliance)
 *   - Does NOT normalize phone numbers before sending
 *   - Missing some user_data fields (no fn, ln, ct, st, zp)
 *
 * Endpoints:
 *   POST /api/capi/event   — Send a single event
 *   GET  /api/capi/health  — Health check
 *
 * Environment variables:
 *   META_PIXEL_ID      — Your Meta Pixel ID
 *   META_ACCESS_TOKEN   — Conversions API system user token
 *   PORT               — Server port (default: 3001)
 */

const express = require("express");

const app = express();

// ─── Config ──────────────────────────────────────────────────────────────────
const PIXEL_ID = process.env.META_PIXEL_ID || "1684145446350033";
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "";
const GRAPH_API_VERSION = "v21.0";
const GRAPH_API_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events`;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract client IP from headers.
 */
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress || "";
}

/**
 * Build event payload.
 * NOTE: This implementation does NOT hash PII — it sends raw values.
 * This is an intentional gap for educational purposes.
 */
function buildEventPayload(event, req) {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    event_name: event.event_name,
    event_time: event.event_time || now,
    action_source: event.action_source || "website",
    event_source_url: event.event_source_url || req.headers.referer || "",
  };

  // event_id for deduplication
  if (event.event_id) {
    payload.event_id = event.event_id;
  }

  // Build user_data — server enriches IP and UA but does NOT hash PII
  const userData = event.user_data || {};
  userData.client_ip_address = getClientIp(req);
  userData.client_user_agent = req.headers["user-agent"] || "";

  // GAP: No SHA-256 hashing of PII fields (em, ph, fn, ln, etc.)
  // The raw values are sent directly to the Conversions API.
  // In production, ALL PII must be hashed before sending.
  payload.user_data = userData;

  // Pass through custom_data
  if (event.custom_data) {
    payload.custom_data = event.custom_data;
  }

  // GAP: No data_processing_options (LDU/CCPA compliance missing)

  return payload;
}

/**
 * Send events to Meta's Conversions API.
 */
async function sendToConversionsApi(events) {
  if (!ACCESS_TOKEN) {
    return { success: false, error: "META_ACCESS_TOKEN not configured" };
  }

  try {
    const response = await fetch(GRAPH_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: events,
        access_token: ACCESS_TOKEN,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[CAPI] Error:", result.error?.message);
      return { success: false, error: result.error?.message || "API error" };
    }

    console.log(`[CAPI] Sent ${events.length} event(s)`);
    return { success: true, events_received: result.events_received || events.length };
  } catch (err) {
    console.error("[CAPI] Network error:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send events with a pre-built request body (supports test_event_code at top level).
 * Per Meta docs, test_event_code goes at the top level of the POST body, not inside each event.
 * See: https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/main-body
 */
async function sendToConversionsApiWithBody(requestBody) {
  if (!ACCESS_TOKEN) {
    return { success: false, error: "META_ACCESS_TOKEN not configured" };
  }
  try {
    const response = await fetch(GRAPH_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("[CAPI] Error:", result.error?.message);
      return { success: false, error: result.error?.message || "API error" };
    }
    console.log(`[CAPI] Sent ${requestBody.data?.length || 0} event(s)`);
    return { success: true, events_received: result.events_received || requestBody.data?.length };
  } catch (err) {
    console.error("[CAPI] Network error:", err.message);
    return { success: false, error: err.message };
  }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/** POST /api/capi/event — Send a single event */
app.post("/api/capi/event", async (req, res) => {
  try {
    const event = req.body;
    if (!event.event_name) {
      return res.status(400).json({ success: false, error: "event_name is required" });
    }
    const payload = buildEventPayload(event, req);
    // Pass through test_event_code if present in the request
    // Per Meta docs, test_event_code goes at the top level of the POST body
    const requestBody = {
      data: [payload],
      access_token: ACCESS_TOKEN,
    };
    if (event.test_event_code) {
      requestBody.test_event_code = event.test_event_code;
    }
    const result = await sendToConversionsApiWithBody(requestBody);
    return res.json(result);
  } catch (err) {
    console.error("[CAPI] Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GAP: No /api/capi/batch endpoint (only single events supported)

/** GET /api/capi/health — Health check */
app.get("/api/capi/health", (_req, res) => {
  return res.json({
    status: "ok",
    pixel_id: PIXEL_ID,
    has_access_token: !!ACCESS_TOKEN,
    graph_api_version: GRAPH_API_VERSION,
    timestamp: new Date().toISOString(),
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[CAPI Proxy] Running on http://localhost:${PORT}`);
});

module.exports = app;
