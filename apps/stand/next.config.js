/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ['@eevex/ui', '@eevex/db'],
  webpack: (config) => {
    config.resolve.symlinks = false
    return config
  },
}
