import paypal from "@paypal/checkout-server-sdk"

const environment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || ""
  const desiredEnv = (process.env.PAYPAL_ENV || "").toLowerCase()

  if (!clientId || !clientSecret) {
    console.warn("PayPal credentials are missing: ensure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set.")
  }

  if (desiredEnv === "live") {
    return new paypal.core.LiveEnvironment(clientId, clientSecret)
  }
  if (desiredEnv === "sandbox") {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret)
  }
  // Fallback: use NODE_ENV heuristic if PAYPAL_ENV not provided
  if (process.env.NODE_ENV === "production") {
    return new paypal.core.LiveEnvironment(clientId, clientSecret)
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

export const paypalClient = new paypal.core.PayPalHttpClient(environment())