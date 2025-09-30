/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        port: '',
        pathname: '/avatar/**',
      },
      {
        protocol: 'https',
        hostname: 'notncpmpmgostfxesrvk.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'notncpmpmgostfxesrvk.supabase.in',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Disable image optimization in development
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Enable server components and API routes
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  // Disable the static export
  output: 'standalone',
  
  // Handle API routes properly
  async rewrites() {
    return [];
  },
}

module.exports = nextConfig