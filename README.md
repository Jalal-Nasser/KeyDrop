# eCommerce Store

## Deployment
Local Desktop APP Dyad

## How It Works
The Admin Panel manages everything

---

## Features

### Cloudflare Turnstile for Bot Protection

This project uses Cloudflare Turnstile to protect the contact form from spam and abuse.

**Setup Instructions:**

1.  **Create a Cloudflare Account:** If you don't have one, sign up at [Cloudflare.com](https://www.cloudflare.com).
2.  **Add a Turnstile Site:**
    *   Navigate to the Turnstile section in your Cloudflare dashboard.
    *   Click "Add site".
    *   Enter your site name (e.g., "Dropskey Store").
    *   Enter your website's domain (e.g., `yourdomain.com`). For local development, you can add `localhost`.
    *   Choose the "Managed" widget type.
    *   Click "Create".
3.  **Get Your Keys:** Cloudflare will provide you with a **Site Key** and a **Secret Key**.
4.  **Set Environment Variables:**
    *   Create a `.env.local` file in the root of your project if it doesn't exist.
    *   Add the keys to your `.env.local` file:
        ```
        NEXT_PUBLIC_TURNSTILE_SITE_KEY=YOUR_SITE_KEY_HERE
        TURNSTILE_SECRET_KEY=YOUR_SECRET_KEY_HERE
        ```
    *   **Important:** The `TURNSTILE_SECRET_KEY` is highly sensitive and should never be exposed to the public or committed to version control.

**Note on Supabase Attack Protection:**
Supabase's built-in Attack Protection (which uses Turnstile) only protects the authentication forms provided by Supabase Auth. It does **not** automatically protect custom forms like this contact form. This is why a manual integration is necessary.