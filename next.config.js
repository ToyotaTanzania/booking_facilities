/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    minimumCacheTTL:0,
    
    domains: ['ik.imagekit.io', 'edhtqyeynuorhcpllepd.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'https://edhtqyeynuorhcpllepd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
        
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default config;
