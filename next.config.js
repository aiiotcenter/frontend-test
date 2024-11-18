// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  distDir: 'build', // Change 'build' to your preferred directory name
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://node-api:9100/api/:path*', // Proxy to backend
      },
    ];
  },
};

module.exports = nextConfig;
