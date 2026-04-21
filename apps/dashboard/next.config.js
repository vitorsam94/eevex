/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@eevex/ui', '@eevex/db'],
  webpack: (config) => {
    config.resolve.symlinks = false
    return config
  },
}

module.exports = nextConfig

