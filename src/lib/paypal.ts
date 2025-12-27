import paypal from "@paypal/checkout-server-sdk"

// Runtime-only singleton for PayPal client
let _paypalClient: any | null = null

function getPaypalEnvironment() {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || ""
  const desiredEnv = (process.env.PAYPAL_ENV || "").toLowerCase()

  console.log("PayPal Environment Debug:")
  console.log("  PAYPAL_CLIENT_ID (first 5 chars):", clientId ? clientId.substring(0, 5) + '...' : 'NOT SET')
  console.log("  PAYPAL_CLIENT_SECRET (present):", !!clientSecret)
  console.log("  PAYPAL_ENV:", desiredEnv || 'NOT SET (defaulting based on NODE_ENV)')
  console.log("  NODE_ENV:", process.env.NODE_ENV)

  if (!clientId || !clientSecret) {
    console.error("PayPal credentials are missing: ensure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set in your environment variables.")
    // Throwing an error here will prevent the PayPal client from being created with invalid credentials
    throw new Error("PayPal API credentials are not configured correctly.")
  }

  if (desiredEnv === "live") return new paypal.core.LiveEnvironment(clientId, clientSecret)
  if (desiredEnv === "sandbox") return new paypal.core.SandboxEnvironment(clientId, clientSecret)
  return process.env.NODE_ENV === "production"
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

export function getPaypalClient() {
  if (_paypalClient) return _paypalClient
  try {
    _paypalClient = new paypal.core.PayPalHttpClient(getPaypalEnvironment())
    return _paypalClient
  } catch (error) {
    console.error("Failed to create PayPal client:", error);
    throw error; // Re-throw the error to be caught by the calling API route
  }
}