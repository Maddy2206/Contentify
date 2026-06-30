/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn-icons-png.flaticon.com'],
  },
  // Prevent webpack from bundling packages that ship native ESM with
  // Object.defineProperty calls that break in the RSC bundler.
  serverExternalPackages: ['unpdf', 'youtube-transcript'],

  webpack(config, { isServer }) {
    if (isServer) {
      // Treat these as Node.js externals — resolved at runtime, not bundled.
      // This is the reliable low-level fix for "Object.defineProperty called
      // on non-object" from pdfjs-dist and similar ESM-only packages.
      const existing = Array.isArray(config.externals) ? config.externals : [config.externals]
      config.externals = [...existing, 'unpdf', 'youtube-transcript']
    }
    return config
  },
};

export default nextConfig;
