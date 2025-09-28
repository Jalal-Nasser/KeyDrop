// Type definitions for Facebook Pixel
type FacebookPixelEvent = {
  (event: 'track', eventName: string, parameters?: Record<string, any>): void;
  (event: 'trackCustom', eventName: string, parameters?: Record<string, any>): void;
  (event: 'init', pixelId: string): void;
  (event: 'trackSingle', pixelId: string, eventName: string, parameters?: Record<string, any>): void;
  (event: 'trackSingleCustom', pixelId: string, eventName: string, parameters?: Record<string, any>): void;
  push: (args: any[]) => void;
  queue: any[];
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq: FacebookPixelEvent;
    _fbq?: any;
  }
}

export type { FacebookPixelEvent };
