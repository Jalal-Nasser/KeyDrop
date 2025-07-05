/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enables static HTML export
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