import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['pino', 'pino-pretty'],
  webpack(cfg) {
    cfg.resolve.alias = {
      ...cfg.resolve.alias,
      // here we can stub out packages that are not needed in the server environment
      // @elastic/ecs-pino-format has an optional dep on elastic-apm-node which we don't use
      // IF we every do want to use it, we can remove this alias but then will need to install elastic-apm-node
      'elastic-apm-node': false, // stub-out
    };
    return cfg;
  },
};

export default nextConfig;
