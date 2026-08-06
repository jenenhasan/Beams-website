/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      fontLoadTimeout: 10000, // Increase timeout to 10 seconds
    },
    // Disable font optimization to use standard loading
    optimizeFonts: false,
  }
  
  module.exports = nextConfig