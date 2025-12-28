// Helper to get PayPal access token
export async function getPaypalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || ""
  const isLive = process.env.PAYPAL_ENV === "live" || (process.env.NODE_ENV === "production" && process.env.PAYPAL_ENV !== "sandbox")
  const baseUrl = isLive ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"

  if (!clientId || !clientSecret) {
    throw new Error("PayPal API credentials are not configured correctly.")
  }

  const auth = btoa(`${clientId}:${clientSecret}`)
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PayPal Auth Error Status:", response.status);
    console.error("PayPal Auth Error Body:", errorText);
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(`PayPal Auth Failed: ${errorJson.error_description || errorJson.error || 'Unknown error'}`);
    } catch (e) {
      throw new Error(`PayPal Auth Failed with status ${response.status}`);
    }
  }

  const data = await response.json()
  return { token: data.access_token, baseUrl }
}

// Helper for PayPal API requests
export async function callPaypalApi(endpoint: string, options: RequestInit = {}) {
  const { token, baseUrl } = await getPaypalAccessToken()

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`PayPal API Error (${endpoint}) Status:`, response.status);
    console.error(`PayPal API Error (${endpoint}) Body:`, errorText);

    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || errorJson.name || `PayPal API responded with status ${response.status}`);
    } catch (e) {
      throw new Error(`PayPal API responded with status ${response.status} (HTML/Non-JSON response)`);
    }
  }

  if (response.status === 204) return null;
  return response.json()
}