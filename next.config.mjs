/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Evita che la build di produzione fallisca a causa di errori ESLint
    // (continuerai comunque a vedere i problemi in dev/editor)
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
