/**
 * AS IMAGENS — e o que acontece quando elas não existem.
 *
 * As peças são geradas UMA VEZ por `scripts/gerar-imagens.ts` e commitadas em
 * `public/img/`. ⛔ O site em produção não chama API de imagem nenhuma: é
 * estático, é rápido, e não queima crédito na frente do cliente.
 *
 * ⚖️ Lei 7 aplicada ao desenho: se a peça não estiver no manifesto, a tela
 * mostra um gradiente de reserva e segue funcionando. **Nunca uma imagem
 * quebrada, nunca um espaço vazio que pareça defeito.**
 */

import manifesto from '../../public/img/MANIFESTO.json';

export interface PecaDeImagem {
  readonly arquivo: string;
  readonly alt: string;
  readonly ferramenta: string;
  readonly modelo: string;
  readonly prompt: string;
  readonly largura: number;
  readonly altura: number;
  readonly bytes: number;
  readonly geradoEm: string;
}

const PECAS = manifesto as PecaDeImagem[];

const PORNOME = new Map(PECAS.map((p) => [p.arquivo.replace(/\.webp$/, ''), p]));

/** A peça, se ela existir. `null` quando falta — e aí entra o gradiente. */
export function peca(nome: string): PecaDeImagem | null {
  return PORNOME.get(nome) ?? null;
}

export function caminho(nome: string): string {
  return `/img/${nome}.webp`;
}

/** O manifesto inteiro — a tela de Configurações mostra a procedência. */
export function todasAsPecas(): readonly PecaDeImagem[] {
  return PECAS;
}

/** A capa de cada obra do seed. Sem peça, a obra ganha o gradiente. */
export const CAPA_DA_OBRA: Record<string, string> = {
  creche: 'obra-creche',
  pavimentacao: 'obra-pavimentacao',
  ubs: 'obra-ubs',
};

/** As cenas de canteiro, na ordem em que entram nas telas. */
export const CENAS = [
  'cena-projeto',
  'cena-trena',
  'cena-concretagem',
  'cena-armacao',
  'cena-fiscal',
  'cena-fim-de-tarde',
] as const;

export const REGIAO = ['regiao-serra', 'regiao-rio', 'regiao-cidade'] as const;
