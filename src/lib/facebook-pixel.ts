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
    !(function (f: any, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
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
      s.parentNode?.insertBefore(t, s);
    }) (
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js'
    );

    (window as any).fbq('init', FB_PIXEL_ID);
    (window as any).fbq('track', 'PageView');
  }
};
