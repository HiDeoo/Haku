/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  devIndicators: {
    buildActivity: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
}

export default nextConfig
