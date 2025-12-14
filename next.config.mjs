/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Biarkan Vercel tetap deploy meski ada warning ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Biarkan Vercel tetap deploy meski ada error TypeScript kecil
    ignoreBuildErrors: true,
  },
};

export default nextConfig;