import type { NextConfig } from 'next';

/**
 * Canteiro OS — vitrine de demonstração.
 * Sem banco, sem auth, sem imagem remota. Nada aqui precisa de configuração
 * especial: se um dia precisar, é sinal de que a vitrine virou produto — e o
 * produto mora no Business OS, não aqui (ver README, primeira linha).
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
