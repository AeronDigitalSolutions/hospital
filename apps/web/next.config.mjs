/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@chikitsaalye/ui', '@chikitsaalye/types', '@chikitsaalye/config', '@chikitsaalye/validation'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async redirects() {
    return [
      {
        source: '/master-data',
        destination: '/administration/master-data',
        permanent: false,
      },
      {
        source: '/admin',
        destination: '/administration/users',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
