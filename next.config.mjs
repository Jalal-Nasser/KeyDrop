/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: 'export'' to enable Server Actions.
  basePath: '/KeyDrop', // Set to your GitHub repository name
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