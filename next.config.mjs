import bundleAnalyzer from '@next/bundle-analyzer'
import iconPlugin from 'unplugin-icons/webpack'

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
]

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    config.plugins.push(
      iconPlugin({
        compiler: 'jsx',
        jsx: 'react',
      })
    )

    if (!dev && !isServer) {
      return {
        ...config,
        externals: [...config.externals, { 'react-ssr-prepass': {} }],
      }
    }

    return config
  },
  devIndicators: {
    buildActivity: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  headers() {
    return [
      { source: '/:path*', headers: commonHeaders },
      {
        source: '/manifest.webmanifest',
        headers: [{ key: 'Content-Type', value: 'application/manifest+json; charset=utf-8' }],
      },
    ]
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
