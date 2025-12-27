'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export function FacebookPagePlugin() {
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);

  // Initialize Facebook SDK
  useEffect(() => {
    if (isInitialized.current) return;
    
    window.fbAsyncInit = function() {
      window.FB.init({
        xfbml: true,
        version: 'v18.0'
      });
      
      window.FB.Event.subscribe('xfbml.render', () => {
        setIsLoading(false);
      });
      
      // Force parse any existing elements
      if (window.FB.XFBML) {
        window.FB.XFBML.parse();
      }
      
      isInitialized.current = true;
    };

    // Load the Facebook SDK script
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.nonce = 'YOUR_NONCE';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    document.body.appendChild(script);

    return () => {
      // Clean up
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      // @ts-ignore - Delete window property for cleanup
      delete window.fbAsyncInit;
    };
  }, []);

  return (
    <div className="w-full">
      <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-48 bg-gray-50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm text-gray-500">Loading Facebook feed...</p>
          </div>
        )}
        
        {/* Facebook Page Plugin */}
        <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0 h-0' : 'opacity-100'}`}>
          <a 
            href="https://www.facebook.com/dropskeey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="relative aspect-[2/1] bg-gray-100 rounded-lg overflow-hidden">
              {/* Placeholder for Facebook cover image */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <div className="text-center p-6 text-white">
                  <div className="flex justify-center mb-3">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg">Dropskey</h3>
                  <p className="text-sm opacity-90 mt-1">Follow us on Facebook</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                <div className="flex items-center justify-center space-x-2">
                  <span className="font-medium">Visit Page</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </a>
        </div>
        
        {/* Fallback Link */}
        <div className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-lg shadow-sm">
          <a 
            href="https://www.facebook.com/dropskeey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <span>Follow us</span>
            <svg className="w-3.5 h-3.5 text-blue-600 -mt-px" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
