import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script" // Import Script from next/script

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "@/context/session-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"
import { PayPalProvider } from "@/context/paypal-provider"
import { CartProvider } from "@/context/cart-context"
import { MobileNavBar } from "@/components/mobile-nav-bar"
import { WishlistProvider } from "@/context/wishlist-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DropsKey",
  description:
    "DropsKey is your one-stop shop for digital keys and software licenses. We offer a wide range of products at competitive prices, with instant delivery and top-notch customer support.",
  icons: {
    icon: '/panda.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      {/* Google Tag Manager - Part 1 (Head) */}
      {gtmId && (
        <Script id="google-tag-manager-head" strategy="afterInteractive">
<<<<<<< HEAD
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
=======
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
>>>>>>> main
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
      <body className={inter.className}>
        {/* Google Tag Manager - Part 2 (NoScript) */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            ></iframe>
          </noscript>
        )}
        {/* Google Analytics */}
        {gaMeasurementId && (
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
        )}
        {gaMeasurementId && (
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}');
<<<<<<< HEAD
            `}
=======
            `}
>>>>>>> main
          </Script>
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
<<<<<<< HEAD
        >
=======
        >
>>>>>>> main
          <PayPalProvider>
            <SessionProvider>
              <CartProvider>
                <WishlistProvider>
<<<<<<< HEAD
                  <Header />
                  <main className="flex-grow pb-[60px]">{children}</main>
                  <Footer />
                  <MobileNavBar />
=======
                  <Header className="print:hidden" />
                  <main className="flex-grow pb-[60px]">{children}</main>
                  <Footer />
                  <MobileNavBar className="print:hidden" />
>>>>>>> main
                </WishlistProvider>
              </CartProvider>
            </SessionProvider>
          </PayPalProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}