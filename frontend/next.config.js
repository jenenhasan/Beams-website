/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '/**',
      },
   
    ],

    minimumCacheTTL: 60,
   
    disableStaticImages: false,
  },
  async rewrites() {

    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` 
          : 'http://localhost:8000/api/:path*',
        },
      ];
    }
    return [];
  },
  // Production optimizations
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  generateEtags: true,

  output: 'standalone', 
};

module.exports = nextConfig;