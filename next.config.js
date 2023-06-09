/** @type {import('next').NextConfig} */
const withInterceptStdout = require('next-intercept-stdout');
const path = require("path")

const nextConfig = {
  webpack: (config, options) => {
    config.resolve.alias['aws-crt'] = path.resolve(__dirname, 'node_modules/aws-crt')
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co'
      }
    ]
  },
}

module.exports = withInterceptStdout(nextConfig, (text) => (text.includes('Critical dependency: the request of a dependency is an expression') ? '' : text))
