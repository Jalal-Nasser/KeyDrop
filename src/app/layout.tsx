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
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gaMeasurementId = 'G-BNKL9RH1XV'; // Your Google Analytics 4 Measurement ID

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
        <title>Dropskey Digital Keys</title>
        <meta name="description" content="KeyDrop - Buy and sell game keys, gift cards, and more" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
        <meta name="theme-color" content="#000000" />
        <meta name="facebook-domain-verification" content="8j5x9d3y7z2v1c4r6t8b0n9m2l3p5o7i" />
        {/* Facebook Pixel Code */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{display:'none'}} 
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        {/* End Facebook Pixel Code */}
      </head>

      <body className={inter.className}>
        
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