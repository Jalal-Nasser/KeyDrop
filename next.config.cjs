/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // NOTE: The images block is removed to prevent the optimizer from trying to run globally.
  // The 'env' block remains removed.

  experimental: {
    serverComponentsExternalPackages: [
      '@paypal/checkout-server-sdk',
      '@vonage/server-sdk',
    ],
  },
}

module.exports = nextConfig