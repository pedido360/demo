import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./public/fonts/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mpoxputbknmslvgpqult.supabase.co",
        pathname: "/storage/v1/object/public/restaurant-images/**",
      },
    ],
  },
};

export default nextConfig;