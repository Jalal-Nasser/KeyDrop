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
    const error = await response.json()
    console.error("PayPal Auth Error:", error)
    throw new Error("Failed to authenticate with PayPal.")
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
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    console.error(`PayPal API Error (${endpoint}):`, error);
    throw new Error(error.message || `PayPal API responded with status ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json()
}