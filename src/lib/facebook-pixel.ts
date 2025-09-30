// Facebook Pixel Helper
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

export const pageview = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
};

export const event = (name: string, options = {}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', name, options);
  }
};

export const fbqInit = () => {
  if (typeof window !== 'undefined' && !(window as any).fbq) {
    // Ensure fbq is defined before use
    (window as any).fbq = function(...args: any[]) {
      ((window as any).fbq.callMethod
        ? (window as any).fbq.callMethod.apply((window as any).fbq, args)
        : (window as any).fbq.queue.push(args));
    };
    if (!(window as any)._fbq) (window as any)._fbq = (window as any).fbq;
    (window as any).fbq.push = (window as any).fbq;
    (window as any).fbq.loaded = !0;
    (window as any).fbq.version = '2.0';
    (window as any).fbq.queue = [];
    const t = document.createElement('script');
    t.async = !0;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const s = document.getElementsByTagName('script')[0];
    s.parentNode?.insertBefore(t, s);

    (window as any).fbq('init', FB_PIXEL_ID);
    (window as any).fbq('track', 'PageView');
  }
};