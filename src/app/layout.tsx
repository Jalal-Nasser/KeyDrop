'use client';

import { Inter } from "next/font/google";
import Script from "next/script";
import dynamicImport from 'next/dynamic';
import React from 'react';
import "./globals.css";

// Import components
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/context/session-context";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { PayPalProvider } from "@/context/paypal-provider";
import { CartProvider } from "@/context/cart-context";
import { MobileNavBar } from "@/components/mobile-nav-bar";
import { WishlistProvider } from "@/context/wishlist-context";
import { HashAuthRedirect } from "@/components/hash-auth-redirect";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Facebook Pixel - Loaded after interactive */}
        {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!n.loaded){n.defer=[];n.loaded=!0;
                n.load=function(){var a='script',
                  r=a.createElement('script');
                r.async=!0;
                r.defer=!0;
                r.src='https://connect.facebook.net/en_US/fbevents.js';
                var u=a.getElementsByTagName('script')[0];
                u.parentNode.insertBefore(r,u)
              }
              }(window,document,'script',
              'facebook-jssdk'));
            `}
          </Script>
        )}
      </head>

      <body className={inter.className}>
        {/* Google Tag Manager */}
        {gtmId && (
          <>
            <Script id="gtm-script" strategy="afterInteractive">
              {`
                (function(w,d,s,l,i){
                  w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});
                  var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                  j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                  f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
          </>
        )}
        
        {/* Inject runtime public env for client-side fallback */}
        <Script id="public-env" strategy="beforeInteractive">
          {`
            window.__PUBLIC_ENV = {
              NEXT_PUBLIC_SUPABASE_URL: "${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://notncpmpmgostfxesrvk.supabase.co'}",
              NEXT_PUBLIC_SUPABASE_ANON_KEY: "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s'}",
              NEXT_PUBLIC_TURNSTILE_SITE_KEY: ${process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? `"${process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}"` : 'null'},
              NEXT_PUBLIC_BASE_URL: ${process.env.NEXT_PUBLIC_BASE_URL ? `"${process.env.NEXT_PUBLIC_BASE_URL}"` : 'null'}
            };
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
            />
          </noscript>
        )}
        
        {/* Google Analytics */}
        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}');
              `}
            </Script>
          </>
        )}
        
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PayPalProvider>
            <SessionProvider>
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

export const dynamic = "force-dynamic";