import paypal from "@paypal/checkout-server-sdk"

// Runtime-only singleton for PayPal client
let _paypalClient: any | null = null

function getPaypalEnvironment() {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || ""
  const desiredEnv = (process.env.PAYPAL_ENV || "").toLowerCase()

  if (!clientId || !clientSecret) {
    console.warn("PayPal credentials are missing: ensure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set.")
  }

  if (desiredEnv === "live") return new paypal.core.LiveEnvironment(clientId, clientSecret)
  if (desiredEnv === "sandbox") return new paypal.core.SandboxEnvironment(clientId, clientSecret)
  return process.env.NODE_ENV === "production"
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

export function getPaypalClient() {
  if (_paypalClient) return _paypalClient
  _paypalClient = new paypal.core.PayPalHttpClient(getPaypalEnvironment())
  return _paypalClient
}