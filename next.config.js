/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow any https image host since admins can paste product image URLs
    // from anywhere (brand sites, CDNs, etc). Tighten this list if you want
    // to restrict where images are allowed to come from.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
