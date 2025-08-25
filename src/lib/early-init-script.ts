// This creates a direct script tag for injecting into the head section
// It will initialize Supabase environment variables as early as possible
// and set up fallbacks before any other JavaScript runs

export function generateEarlyInitScript() {
  return `
    <script>
      // Immediate fallback for Supabase env vars before anything else loads
      window.__SUPABASE_DIRECT_OVERRIDES = {
        supabaseUrl: "https://notncpmpmgostfxesrvk.supabase.co",
        supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s"
      };
      
      // Initialize PUBLIC_ENV
      window.__PUBLIC_ENV = {
        NEXT_PUBLIC_SUPABASE_URL: "https://notncpmpmgostfxesrvk.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s"
      };
      
      // Try to load from localStorage first
      try {
        var stored = localStorage.getItem('__SUPABASE_CREDS');
        if (stored) {
          var parsed = JSON.parse(stored);
          if (parsed && parsed.url && parsed.key) {
            window.__SUPABASE_DIRECT_OVERRIDES.supabaseUrl = parsed.url;
            window.__SUPABASE_DIRECT_OVERRIDES.supabaseKey = parsed.key;
            window.__PUBLIC_ENV.NEXT_PUBLIC_SUPABASE_URL = parsed.url;
            window.__PUBLIC_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY = parsed.key;
          }
        }
      } catch(e) {}
    </script>
  `;
}
