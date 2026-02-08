
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure that static HTML files in the root don't interfere with routes
  cleanDistDir: true,
}

module.exports = nextConfig
