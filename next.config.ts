import type { NextConfig } from 'next';

/**
 * Canteiro OS — vitrine de demonstração.
 * Sem banco, sem auth, sem imagem remota. Nada aqui precisa de configuração
 * especial: se um dia precisar, é sinal de que a vitrine virou produto — e o
 * produto mora no Business OS, não aqui (ver README, primeira linha).
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // As peças de `public/img/` já nascem WebP no tamanho certo. Um ano de
    // cache evita que o CDN volte a pedir o que nunca muda.
    minimumCacheTTL: 31_536_000,
  },
};

export default nextConfig;
