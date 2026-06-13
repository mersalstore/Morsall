const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@prisma/client"],
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/product-category/:id*',
        destination: '/category/:id*',
        permanent: true,
      },
    ];
  },
  // Serve /uploads from public/uploads statically
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
  experimental: {
    webpackBuildWorker: false,
    parallelServerBuildTraces: false,
    parallelServerCompiles: false,
    workerThreads: false,
    cpus: 1
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'www.svgrepo.com' },
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'https', hostname: 'morsall.com' },
      { protocol: 'https', hostname: '**.morsall.com' },
      { protocol: 'https', hostname: '**.hostinger.com' },
      { protocol: 'http',  hostname: '82.198.228.182' },
      // Allow any hostname for uploads (covers Hostinger server IP)
      { protocol: 'http',  hostname: '**' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  }
};

module.exports = nextConfig;
