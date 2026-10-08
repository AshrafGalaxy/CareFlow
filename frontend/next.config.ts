import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactCompiler: process.env.NODE_ENV === 'production',
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: [
      '@base-ui/react',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      'lucide-react',
      'date-fns',
      'framer-motion',
      'recharts',
      'es-toolkit',
    ],
  },
};

export default withNextIntl(nextConfig);
