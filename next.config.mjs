/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enables static HTML export
  basePath: '/your-repository-name', // IMPORTANT: Replace with your GitHub repository name (e.g., '/dropskey-ecommerce')
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