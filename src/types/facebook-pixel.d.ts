// Type definitions for Facebook Pixel
interface Window {
  fbq: FacebookPixel.Event;
}

declare namespace FacebookPixel {
  interface Event {
    (event: 'track', eventName: string, parameters?: Record<string, any>): void;
    (event: 'trackCustom', eventName: string, parameters?: Record<string, any>): void;
    (event: 'init', pixelId: string): void;
    (event: 'trackSingle', pixelId: string, eventName: string, parameters?: Record<string, any>): void;
    (event: 'trackSingleCustom', pixelId: string, eventName: string, parameters?: Record<string, any>): void;
    push: (args: any[]) => void;
    queue: any[];
    loaded: boolean;
    version: string;
  }
}
