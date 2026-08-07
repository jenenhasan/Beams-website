/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      // Only needed in local dev — in production Vercel's own
      // Services routing (vercel.json) handles /api/* already.
      if (process.env.NODE_ENV === 'development') {
        return [
          {
            source: '/api/:path*',
            destination: 'http://localhost:8000/api/:path*',
          },
        ];
      }
      return [];
    },
  };
  
  module.exports = nextConfig;