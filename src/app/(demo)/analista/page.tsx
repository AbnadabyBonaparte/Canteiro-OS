'use client';

/**
 * TELA 5 — O FUNCIONÁRIO DIGITAL.
 *
 * ⚖️ Lei 7 no desenho: cada aviso é CALCULADO do mundo que está na tela, e
 * carrega a conta que o produziu — o "por que isso?" abre a aritmética inteira.
 * ⛔ Nenhuma frase fixa disfarçada de inteligência: se o número não existe, a
 * linha não aparece. ⛔ Zero IA externa nesta vitrine.
 */

import Link from 'next/link';
import { useState } from 'react';
import { avisos, ritmoDePagamento } from '@/lib/analista';
import { useMundo } from '@/lib/store';
import { Cartao, Etiqueta, Rotulo, TituloSecao, Vazio } from '@/components/ui';
import { Carimbo, Seta } from '@/components/icones';
import { dias } from '@/lib/formato';

function haMinutos(min: number): string {
  if (min < 60) return `notado há ${min} min`;
  const h = Math.round(min / 60);
  return `notado há ${h} h`;
}

export default function Analista() {
  const mundo = useMundo();
  const lista = avisos(mundo);
  const ritmos = ritmoDePagamento(mundo);
  const [aberto, setAberto] = useState<string | null>('medicao-presa');

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section>
        <Cartao className="flex items-start gap-4 p-5">
          <Carimbo className="mt-0.5 h-7 w-7 shrink-0 text-gold" />
          <div>
            <h1 className="placa text-[16px] text-chalk">Funcionário digital</h1>
            <p className="mt-1.5 max-w-xl text-[14px] leading-snug text-concrete">
              Ninguém perguntou nada. Ele olhou as obras, as medições, o diário e os prestadores, e
              trouxe o que mudou.{' '}
              <span className="text-chalk">Cada linha abre a conta que a produziu</span> — não há
              frase bonita sem número por trás.
            </p>
          </div>
        </Cartao>
      </section>

      <section>
        <TituloSecao>O que ele viu hoje</TituloSecao>
        {lista.length === 0 ? (
          <Vazio
            titulo="Nada a apontar neste momento."
            dica="Quando uma medição passar do prazo, um documento se aproximar do vencimento ou um prestador concentrar diárias, o aviso aparece aqui."
          />
        ) : (
          <div className="space-y-2">
            {lista.map((a) => {
              const expandido = aberto === a.id;
              return (
                <Cartao key={a.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Etiqueta tom={a.tom}>
                          {a.tom === 'rust' ? 'exige decisão' : a.tom === 'gold' ? 'atenção' : 'leitura'}
                        </Etiqueta>
                        <span className="text-[12px] text-concrete-dim">{haMinutos(a.notadoHaMin)}</span>
                      </div>
                      <p className="mt-1.5 text-[17px] leading-snug text-chalk">{a.titulo}</p>
                      <p className="text-[13px] text-concrete">{a.detalhe}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAberto(expandido ? null : a.id)}
                      aria-expanded={expandido}
                      className="placa min-h-[36px] shrink-0 border border-line px-3 text-[10px] text-concrete hover:border-line-strong hover:text-chalk"
                    >
                      {expandido ? 'fechar' : 'por que isso?'}
                    </button>
                  </div>

                  {expandido ? (
                    <div className="mt-3 border-l-2 border-gold/50 bg-sunken px-4 py-3">
                      <Rotulo>A conta</Rotulo>
                      <ul className="mt-2 space-y-1.5">
                        {a.porque.map((linha, i) => (
                          <li key={i} className="text-[14px] leading-snug text-concrete">
                            {linha}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={a.href}
                        className="placa mt-3 inline-flex items-center gap-2 text-[11px] text-gold hover:text-gold-bright"
                      >
                        {a.fonte}
                        <Seta className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ) : null}
                </Cartao>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <TituloSecao>Como cada prefeitura paga</TituloSecao>
        {ritmos.length === 0 ? (
          <Vazio
            titulo="Ainda não há medição paga suficiente."
            dica="A média só aparece depois que uma prefeitura pagar pelo menos uma medição — sem amostra, não se afirma média."
          />
        ) : (
          <Cartao className="divide-y divide-line">
            {ritmos.map((r) => (
              <div key={r.prefeituraId} className="flex flex-wrap items-baseline justify-between gap-3 px-4 py-3">
                <span className="text-[15px] text-chalk">{r.nome}</span>
                <span className="flex items-baseline gap-3">
                  <span className="num text-[20px] text-gold-bright">{dias(r.mediaDias)}</span>
                  <span className="text-[12px] text-concrete-dim">
                    média de {r.amostras} {r.amostras === 1 ? 'medição paga' : 'medições pagas'}
                  </span>
                </span>
              </div>
            ))}
          </Cartao>
        )}
        <p className="mt-3 text-[13px] leading-snug text-concrete">
          Cada prefeitura tem o seu ritmo de caixa. Planejar todas do mesmo jeito é o que faz
          faltar dinheiro no mês errado.
        </p>
      </section>
    </div>
  );
}
