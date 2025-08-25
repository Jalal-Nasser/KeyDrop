import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/context/session-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { PayPalProvider } from "@/context/paypal-provider";
import { CartProvider } from "@/context/cart-context";
import { MobileNavBar } from "@/components/mobile-nav-bar";
import { WishlistProvider } from "@/context/wishlist-context";
import { HashAuthRedirect } from "@/components/hash-auth-redirect";

const inter = Inter({ subsets: ["latin"] });

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
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager - Part 1 (Head) */}
        {gtmId && (
          <Script id="google-tag-manager-head" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
      </head>

      <body className={inter.className}>
        {/* Inject runtime public env for client-side fallback */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__PUBLIC_ENV = ${JSON.stringify({
              NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://notncpmpmgostfxesrvk.supabase.co",
              NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s",
              NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || null,
              NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null,
              NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || null,
            })};`,
          }}
        />
        {/* Fallback script if CSP blocks inline script - now with cached Supabase credentials */}
        <Script id="env-loader" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined') {
              // Initialize PUBLIC_ENV
              if (!window.__PUBLIC_ENV) {
                window.__PUBLIC_ENV = {
                  NEXT_PUBLIC_SUPABASE_URL: "https://notncpmpmgostfxesrvk.supabase.co",
                  NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s"
                };
              }
              
              // Store credentials in localStorage for persistence
              try {
                localStorage.setItem('__SUPABASE_CREDS', JSON.stringify({
                  url: window.__PUBLIC_ENV.NEXT_PUBLIC_SUPABASE_URL,
                  key: window.__PUBLIC_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY
                }));
              } catch(e) {}
              
              // Try to fetch real values async with multiple retries
              function fetchEnv(retries = 3) {
                fetch('/api/env/public', { 
                  cache: 'no-store', 
                  headers: { 'x-priority': 'high' } 
                })
                .then(res => res.json())
                .then(data => {
                  if (data && data.NEXT_PUBLIC_SUPABASE_URL) {
                    window.__PUBLIC_ENV = data;
                    
                    // Update stored credentials
                    try {
                      localStorage.setItem('__SUPABASE_CREDS', JSON.stringify({
                        url: data.NEXT_PUBLIC_SUPABASE_URL,
                        key: data.NEXT_PUBLIC_SUPABASE_ANON_KEY
                      }));
                    } catch(e) {}
                  }
                })
                .catch(err => {
                  console.warn("Could not fetch public env, retries left: " + (retries-1));
                  if (retries > 0) {
                    setTimeout(() => fetchEnv(retries-1), 1000); // Try again after 1 second
                  }
                });
              }
              
              fetchEnv();
            }
          `}
        </Script>
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
              {/* If an OAuth provider returns tokens in the URL hash on any route, normalize to /auth/callback */}
              <HashAuthRedirect />
              <CartProvider>
                <WishlistProvider>
                  <Header className="print:hidden" />
                  <main className="flex-grow pb-[60px]">{children}</main>
                  <Footer />
                  <MobileNavBar className="print:hidden" />
                </WishlistProvider>
              </CartProvider>
            </SessionProvider>
          </PayPalProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

// Ensure the entire app renders dynamically at runtime (avoid build-time SSG of pages that need env)
export const dynamic = "force-dynamic";