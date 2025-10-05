import { SpeedInsights } from "@vercel/speed-insights/next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"

// Import providers
import { SessionProvider } from "@/context/session-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { CartProvider } from "@/context/cart-context"
import { PayPalProvider } from "@/context/paypal-provider"

// Import client components
import ClientLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  const gaMeasurementId = 'G-BNKL9RH1XV' // Your Google Analytics 4 Measurement ID

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <Script async src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        
        <SessionProvider>
          <WishlistProvider>
            <CartProvider>
              <PayPalProvider>
                <ClientLayout>
                  {children}
                </ClientLayout>
              </PayPalProvider>
            </CartProvider>
          </WishlistProvider>
        </SessionProvider>
        
        <SpeedInsights />
      </body>
    </html>
  );
}