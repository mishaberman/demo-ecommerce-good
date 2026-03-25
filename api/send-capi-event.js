import crypto from 'crypto';

// Your Meta Pixel ID and Access Token should be stored as environment variables
const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

// Helper function to hash user data
function hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { eventName, eventId, eventSourceUrl, userData, customData } = req.body;

    const eventData = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: eventSourceUrl,
      event_id: eventId,
      user_data: {
        client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        client_user_agent: req.headers['user-agent'],
        fbp: req.cookies._fbp || userData.fbp,
        fbc: req.cookies._fbc || userData.fbc,
        em: userData.email ? hash(userData.email) : undefined,
        ph: userData.phone ? hash(userData.phone) : undefined,
        fn: userData.firstName ? hash(userData.firstName) : undefined,
        ln: userData.lastName ? hash(userData.lastName) : undefined,
      },
      custom_data: customData,
    };

    // Remove undefined fields from user_data
    Object.keys(eventData.user_data).forEach(key => {
      if (eventData.user_data[key] === undefined) {
        delete eventData.user_data[key];
      }
    });

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [eventData] }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`CAPI request failed: ${JSON.stringify(responseData)}`);
    }

    res.status(200).json({ status: 'success', response: responseData });
  } catch (error) {
    console.error('CAPI Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}
