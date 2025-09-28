'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import type { FacebookPixelEvent } from '@/types/facebook-pixel';

declare global {
  interface Window {
    fbq: FacebookPixelEvent;
    _fbq?: any;
  }
}

export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '';

  // Track page views on route changes
  useEffect(() => {
    if (!window.fbq) return;
    
    // Only track if in production
    if (process.env.NODE_ENV === 'production') {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  // Don't load in development
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !(function(f, b, e, v, n, t, s) {
              if (f.fbq) return;
              n = f.fbq = function() {
                n.callMethod
                  ? n.callMethod.apply(n, arguments)
                  : n.queue.push(arguments);
              };
              if (!f._fbq) f._fbq = n;
              n.push = n;
              n.loaded = !0;
              n.version = '2.0';
              n.queue = [];
              t = b.createElement(e);
              t.async = !0;
              t.src = v;
              s = b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t, s);
            })(
              window,
              document,
              'script',
              'https://connect.facebook.net/en_US/fbevents.js'
            );
            
            // Initialize the pixel with your ID
            fbq('init', '${pixelId}');
            
            // Track initial page view
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
