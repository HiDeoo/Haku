import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

const commonHeaders = [
  { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Referrer-Policy', value: 'same-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow, nosnippet, noarchive, noimageindex' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
]

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
  headers() {
    return [{ source: '/:path*', headers: commonHeaders }]
  },
  reactStrictMode: true,
  rewrites() {
    return [
      {
        source: '/offline',
        destination: '/offline.html',
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)
