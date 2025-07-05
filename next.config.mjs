/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: 'export'' to enable Server Actions.
  // Removed basePath to fix 404 in Dyad preview.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Ensures images are not optimized at runtime, suitable for static export
  },
}

export default nextConfig