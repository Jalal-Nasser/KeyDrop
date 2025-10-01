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

  // Ensure environment variables are always strings for consistent injection
  // Removed hardcoded fallback for supabaseAnonKey
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  // Removed facebookPixelId variable

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
        {/* Removed Facebook Pixel Code */}
      </head>

      <body className={inter.className}>
        
        {/* Inject runtime public env for client-side fallback */}
        <Script id="public-env" strategy="beforeInteractive">
          {`
            window.__PUBLIC_ENV = {
              NEXT_PUBLIC_SUPABASE_URL: "${supabaseUrl}",
              NEXT_PUBLIC_SUPABASE_ANON_KEY: "${supabaseAnonKey}",
              NEXT_PUBLIC_TURNSTILE_SITE_KEY: "${turnstileSiteKey}",
              NEXT_PUBLIC_BASE_URL: "${baseUrl}"
              // Removed NEXT_PUBLIC_FACEBOOK_PIXEL_ID
            };
          `}
        </Script>
        
        {/* Google Tag Manager - Part 2 (NoScript) */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId || ''}`}
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
                  <Header className="print:hidden" key="main-header" /> {/* Added key prop */}
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