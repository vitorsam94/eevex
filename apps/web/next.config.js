/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@eevex/ui'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },
}

module.exports = nextConfig
