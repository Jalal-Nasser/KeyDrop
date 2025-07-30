import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import parse from 'html-react-parser';

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
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { StoreNoticeContainer } from "@/components/store-notice-container";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DropsKey",
  description:
    "DropsKey is your one-stop shop for digital keys and software licenses. We offer a wide range of products at competitive prices, with instant delivery and top-notch customer support.",
  icons: {
    icon: '/panda.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = createSupabaseServerClient()
  const { data: settingsData } = await supabase.from("site_settings").select("key, value")
  
  const settings = (settingsData || []).reduce((acc: Record<string, string | null>, setting: { key: string, value: string | null }) => {
    acc[setting.key] = setting.value
    return acc
  }, {} as Record<string, string | null>)

  const gaMeasurementId = settings.google_analytics_id || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gtmId = settings.gtm_id || process.env.NEXT_PUBLIC_GTM_ID;
  const customHeaderScripts = settings.custom_header_scripts;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Trim scripts to prevent parsing whitespace-only strings, which causes hydration errors */}
        {customHeaderScripts && customHeaderScripts.trim() && parse(customHeaderScripts.trim())}
      </head>
      {/* Google Tag Manager - Part 1 (Body) */}
      {gtmId && (
        <Script id="google-tag-manager-head" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
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
            `}
          </Script>
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PayPalProvider>
            <SessionProvider>
              <CartProvider>
                <WishlistProvider>
                  <Header className="print:hidden" />
                  <StoreNoticeContainer />
                  <main className="flex-grow pb-[60px] pt-10">{children}</main>
                  <Footer />
                  <MobileNavBar className="print:hidden" />
                  <Toaster richColors />
                </WishlistProvider>
              </CartProvider>
            </SessionProvider>
          </PayPalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}