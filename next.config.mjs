import withPWAInit from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
  },
  async rewrites() {
    return [
      {
        source: '/api/focus/:path*',
        destination: 'http://therelationshipslab.com/api/:path*', // only works locally
      },
    ];
  },
};

// ✅ Proper ESM syntax for next-pwa
const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
});


// ✅ Export with ESM export
export default withPWA(nextConfig);

