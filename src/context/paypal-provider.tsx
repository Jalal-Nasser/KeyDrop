"use client"

import { PayPalScriptProvider } from "@paypal/react-paypal-js"

const PAYPAL_CLIENT_ID = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string) || (typeof window !== 'undefined' && (window as any).__PUBLIC_ENV?.NEXT_PUBLIC_PAYPAL_CLIENT_ID) || "test"

export function PayPalProvider({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
        components: "buttons",
      }}
    >
      {children}
    </PayPalScriptProvider>
  )
}