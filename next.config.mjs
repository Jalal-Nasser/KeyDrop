/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Removed 'output: 'export'' to allow API routes to function
  images: {
    unoptimized: true, // Disable image optimization for static export
  },
}

export default nextConfig