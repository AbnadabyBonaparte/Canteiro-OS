/**
 * A IMAGEM COMO CHÃO, NUNCA COMO ASSINATURA (docs/DESIGN.md §10).
 *
 * Toda foto do Canteiro passa por aqui e recebe o mesmo tratamento: véu de
 * obsidian em gradiente vertical e saturação reduzida. ⛔ Nunca uma foto crua e
 * colorida brigando com o número — a assinatura continua sendo a régua de
 * quatro marcas, e o ouro fica só nos dados.
 *
 * Se a peça não existir no manifesto, entra o gradiente de reserva. A tela
 * funciona igual e ninguém vê imagem quebrada.
 */

import Image from 'next/image';
import { caminho, peca } from '@/lib/imagens';

type Altura = 'faixa' | 'capa' | 'cena' | 'cheia';

/**
 * ⭐ Alturas são PISO, não teto (`min-h`). Se o dado que vai por cima da foto
 * crescer — mais um número, uma linha a mais no telefone — a moldura cresce
 * junto em vez de cortar a palavra pela metade. Foto que corta título é foto
 * mandando no dado, e aqui é o contrário.
 *
 * ⭐ E a peça do topo mede em `vw`, não em `vh`: altura em `vh` muda quando a
 * barra do navegador do telefone recolhe, e a página inteira abaixo dela
 * escorrega junto. Medida na largura, ela fica parada.
 */
const ALTURAS: Record<Altura, string> = {
  faixa: 'min-h-40 sm:min-h-52',
  capa: 'min-h-44 sm:min-h-56',
  cena: 'min-h-32 sm:min-h-40',
  cheia: 'min-h-[clamp(320px,46vw,560px)]',
};

export function Foto({
  nome,
  altura = 'capa',
  prioridade = false,
  legenda,
  children,
  className = '',
}: {
  nome: string;
  altura?: Altura;
  prioridade?: boolean;
  /** "imagem ilustrativa" e afins — honestidade sobre o que a foto é. */
  legenda?: string;
  /** O dado que a imagem carrega por cima. É para isso que ela existe. */
  children?: React.ReactNode;
  className?: string;
}) {
  const p = peca(nome);

  return (
    <div
      className={`relative isolate flex flex-col justify-end overflow-hidden border border-line ${ALTURAS[altura]} ${className}`}
    >
      {p ? (
        <Image
          src={caminho(nome)}
          alt={p.alt}
          fill
          priority={prioridade}
          /* ⭐ A dica de prioridade precisa ir explícita: a peça do topo é o
             elemento de maior pintura, e sem ela o navegador a busca junto com
             o resto. Só a do banner recebe — dizer "urgente" para todas é o
             mesmo que não dizer para nenhuma. */
          fetchPriority={prioridade ? 'high' : 'auto'}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 60vw, 1200px"
          /* ⭐ `unoptimized`: as peças JÁ saem do gerador em WebP no tamanho
             certo (scripts/gerar-imagens.ts). Deixar o otimizador do framework
             refazê-las em tempo de requisição custa o LCP inteiro e não devolve
             um byte — a maior tem 160 kB. */
          unoptimized
          className="object-cover"
          style={{ filter: 'saturate(0.72) contrast(1.04)' }}
        />
      ) : (
        // O gradiente de reserva: concreto ao obsidian. Não parece defeito.
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(160deg,var(--color-surface-2),var(--color-obsidian))]"
        />
      )}

      {/* O véu — é ele que faz o número em cima ser legível em qualquer foto. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-obsidian)_4%,color-mix(in_srgb,var(--color-obsidian)_78%,transparent)_38%,color-mix(in_srgb,var(--color-obsidian)_34%,transparent)_100%)]"
      />

      {children ? <div className="relative z-10 p-4 sm:p-6">{children}</div> : null}

      {legenda ? (
        <span className="absolute right-2 top-2 z-10 border border-line bg-obsidian/80 px-2 py-[3px] text-[10px] text-concrete-dim">
          {legenda}
        </span>
      ) : null}
    </div>
  );
}

/** A tira de cenas — entra no rodapé de uma obra e no diário. */
export function TiraDeCenas({ nomes }: { nomes: readonly string[] }) {
  return (
    <div className="rolagem flex gap-2 pb-1">
      {nomes.map((n) => (
        <div key={n} className="w-48 shrink-0 sm:w-60">
          <Foto nome={n} altura="cena" />
        </div>
      ))}
    </div>
  );
}
