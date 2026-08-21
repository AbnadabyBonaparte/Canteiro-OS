/**
 * O NOME DO CLIENTE — e por que ele não mora aqui.
 *
 * ⚠️ LEI DE DADOS: o nome real da empresa que assiste à demonstração entra
 * SÓ por variável de ambiente, configurada na Vercel. O repositório carrega
 * um nome de fantasia como padrão e nunca vê o verdadeiro.
 */

export const TENANT = {
  nome: process.env.NEXT_PUBLIC_TENANT_NAME || 'Construtora Araguaia Obras',
  cidade: process.env.NEXT_PUBLIC_TENANT_CITY || 'Vale do Araguaia',
} as const;

export const PRODUTO = {
  nome: 'Canteiro OS',
  selo: 'Ambiente de demonstração · dados fictícios',
} as const;
