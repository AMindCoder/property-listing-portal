import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  redirects: async () => [
    {
      source: '/services/construction',
      destination: '/services',
      permanent: true,
    },
  ],
};

export default nextConfig;
