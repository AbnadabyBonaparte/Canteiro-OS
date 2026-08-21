'use client';

/**
 * CAIXA — previsto × realizado, mês a mês. SVG escrito à mão, zero biblioteca.
 *
 * Decisões de leitura (método da casa para gráfico):
 * • **Uma escala só.** As duas séries são reais em R$; eixo duplo inventa
 *   correlação que não existe.
 * • **Não são duas categorias — é ÊNFASE.** O realizado é o FATO e leva o ouro
 *   da marca; o previsto é o PLANO e fica recessivo, em cinza com hachura.
 *   Isso mantém o acento único da casa e dá identidade por textura, não só por
 *   cor (segura no daltonismo por construção).
 *   ⚠️ O validador de paleta categórica reprova esse par por "croma baixo" —
 *   e reprova certo: cinza não serve de identidade categórica. Aqui ele não é
 *   identidade, é referência. A separação em visão normal e sob daltonismo
 *   ficou em ΔE 15,0 (protan), acima do piso.
 * • **Legenda sempre** (duas séries) e rótulo direto SÓ no extremo — número em
 *   cima de cada barra é ruído que ninguém lê.
 * • Grade em fio sólido, um tom acima da superfície. ⛔ Nada tracejado.
 * • Barras finas, 2px de vão entre elas, topo arredondado, ancoradas na base.
 * • Passar o dedo/mouse mostra o mês inteiro.
 */

import { useId, useState } from 'react';
import type { MesDeCaixa } from '@/lib/analista';
import { dinheiro, dinheiroCurto } from '@/lib/formato';

const ALTURA = 150;
const BANDA_EIXO = 22;

export function GraficoDeCaixa({ meses }: { meses: readonly MesDeCaixa[] }) {
  const hachura = useId().replace(/:/g, '');
  const [sobre, setSobre] = useState<number | null>(null);

  if (meses.length === 0) {
    return (
      <p className="border border-dashed border-line px-4 py-8 text-center text-[13px] text-concrete">
        Ainda não há medição paga suficiente para desenhar o caixa desta obra.
      </p>
    );
  }

  const teto = Math.max(...meses.flatMap((m) => [m.previstoCents, m.realizadoCents]), 1);
  const larguraGrupo = 100 / meses.length;
  const larguraBarra = larguraGrupo * 0.32;
  const destaque = meses.reduce(
    (pior, m, i) =>
      m.previstoCents - m.realizadoCents > (meses[pior]?.previstoCents ?? 0) - (meses[pior]?.realizadoCents ?? 0)
        ? i
        : pior,
    0,
  );

  return (
    <div>
      {/* Legenda: sempre presente com duas séries; texto em tinta, não na cor da série. */}
      <div className="mb-3 flex flex-wrap items-center gap-4 text-[12px] text-concrete">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 border border-concrete/60 bg-[repeating-linear-gradient(135deg,var(--color-concrete)_0_2px,transparent_2px_4px)]" />
          Previsto pelo contrato
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 bg-gold" />
          Realizado
        </span>
      </div>

      <div className="relative" style={{ height: ALTURA + BANDA_EIXO }}>
        <svg
          viewBox={`0 0 100 ${ALTURA}`}
          preserveAspectRatio="none"
          className="block w-full"
          style={{ height: ALTURA }}
          role="img"
          aria-label="Caixa mês a mês: previsto pelo contrato contra realizado"
        >
          <defs>
            <pattern id={hachura} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
              <rect width="4" height="4" fill="transparent" />
              <line x1="0" y1="0" x2="0" y2="4" stroke="var(--color-concrete)" strokeWidth="1.4" />
            </pattern>
          </defs>

          {/* Grade em fio sólido, recessiva. */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1="0"
              x2="100"
              y1={ALTURA - f * ALTURA}
              y2={ALTURA - f * ALTURA}
              stroke="var(--color-line)"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {meses.map((m, i) => {
            const x0 = i * larguraGrupo;
            const alturaPrev = (m.previstoCents / teto) * (ALTURA - 8);
            const alturaReal = (m.realizadoCents / teto) * (ALTURA - 8);
            const xPrev = x0 + larguraGrupo / 2 - larguraBarra - 0.35;
            const xReal = x0 + larguraGrupo / 2 + 0.35;
            return (
              <g key={m.mes} onMouseEnter={() => setSobre(i)} onMouseLeave={() => setSobre(null)}>
                {/* Alvo de toque maior que a barra. */}
                <rect x={x0} y={0} width={larguraGrupo} height={ALTURA} fill="transparent" />
                {alturaPrev > 0 ? (
                  <rect
                    x={xPrev}
                    y={ALTURA - alturaPrev}
                    width={larguraBarra}
                    height={alturaPrev}
                    fill={`url(#${hachura})`}
                    stroke="var(--color-concrete)"
                    strokeWidth="0.4"
                    vectorEffect="non-scaling-stroke"
                    rx="0.6"
                  />
                ) : null}
                {alturaReal > 0 ? (
                  <rect
                    x={xReal}
                    y={ALTURA - alturaReal}
                    width={larguraBarra}
                    height={alturaReal}
                    fill="var(--color-gold)"
                    opacity={sobre === null || sobre === i ? 1 : 0.55}
                    rx="0.6"
                  />
                ) : null}
              </g>
            );
          })}
        </svg>

        {/* Eixo dos meses, fora do desenho para o rótulo nunca ser cortado. */}
        <div
          className="absolute inset-x-0 bottom-0 grid"
          style={{ gridTemplateColumns: `repeat(${meses.length}, minmax(0, 1fr))`, height: BANDA_EIXO }}
        >
          {meses.map((m, i) => (
            <span
              key={m.mes}
              className={`num self-center text-center text-[10px] ${
                i === destaque ? 'text-chalk' : 'text-concrete-dim'
              }`}
            >
              {m.rotulo}
            </span>
          ))}
        </div>
      </div>

      {/* Rótulo direto SÓ no extremo — o mês em que mais dinheiro faltou. */}
      {meses[destaque] && meses[destaque].previstoCents > meses[destaque].realizadoCents ? (
        <p className="mt-2 text-[13px] leading-snug text-concrete">
          Pior mês: <span className="text-chalk">{meses[destaque].rotulo}</span> — esperado{' '}
          <span className="num text-chalk">{dinheiroCurto(meses[destaque].previstoCents)}</span>,
          entrou <span className="num text-rust-bright">{dinheiroCurto(meses[destaque].realizadoCents)}</span>.
        </p>
      ) : null}

      {sobre !== null && meses[sobre] ? (
        <p className="num mt-1 text-[12px] text-concrete-dim">
          {meses[sobre].rotulo}: previsto {dinheiro(meses[sobre].previstoCents)} · realizado{' '}
          {dinheiro(meses[sobre].realizadoCents)}
        </p>
      ) : (
        <p className="mt-1 text-[12px] text-concrete-dim">
          Previsto = aceito pelo fiscal + 30 dias de prazo contratual. Realizado = a data em que o
          dinheiro entrou.
        </p>
      )}
    </div>
  );
}
