'use client';

/**
 * CONTRATOS E ADITIVOS — o contrato com o órgão público, que manda em todos os
 * outros. Objeto, valor, prazo, ordem de serviço, garantia e os aditivos.
 *
 * ⚠️ O percentual de aditivo é ARITMÉTICA sobre o que este sistema registrou —
 * nunca conclusão jurídica sobre o contrato. O teto legal aparece como cartão
 * informativo, e a tela diz de quem é a conclusão.
 */

import Link from 'next/link';
import { useMundo } from '@/lib/store';
import { Cartao, Etiqueta, Linha, Rotulo, Sala, TituloSecao, Vazio } from '@/components/ui';
import { CartaoIntegracao } from '@/components/cartao-integracao';
import { Foto } from '@/components/imagem';
import { CAPA_DA_OBRA } from '@/lib/imagens';
import { TIPOS_DE_ADITIVO, nomeDe } from '@/data/taxonomias';
import { data, dias, dinheiro, dinheiroCurto, pct } from '@/lib/formato';
import { diasDesde } from '@/data/seed';

/** Teto de acréscimo em obra na Lei 14.133/2021, art. 125. Reforma vai a 50%. */
const TETO_ACRESCIMO_PCT = 25;

export default function Contratos() {
  const mundo = useMundo();

  const totalAditivado = mundo.contratos.reduce((s, c) => {
    const soma = mundo.aditivos
      .filter((a) => a.contratoId === c.id)
      .reduce((x, a) => x + a.valorCents, 0);
    return s + c.valorOriginalCents + soma;
  }, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <Sala
        titulo="Contratos e aditivos"
        linha="O que foi assinado com cada órgão: objeto, valor, prazo, ordem de serviço e tudo que mudou depois."
        numero={dinheiroCurto(totalAditivado)}
        rotuloNumero="Carteira contratada"
      />

      <div className="space-y-8">
        {mundo.contratos.map((c) => {
          const obra = mundo.obras.find((o) => o.id === c.obraId)!;
          const pref = mundo.prefeituras.find((p) => p.id === obra.prefeituraId)!;
          const meus = mundo.aditivos.filter((a) => a.contratoId === c.id);
          const acrescimo = meus
            .filter((a) => a.valorCents > 0)
            .reduce((s, a) => s + a.valorCents, 0);
          const supressao = meus
            .filter((a) => a.valorCents < 0)
            .reduce((s, a) => s + Math.abs(a.valorCents), 0);
          const prazoExtra = meus.reduce((s, a) => s + a.prazoDias, 0);
          const pctAcrescimo = (acrescimo / c.valorOriginalCents) * 100;
          const diasCorridos = diasDesde(c.ordemDeServicoEm);
          const prazoTotal = c.prazoDias + prazoExtra;

          return (
            <section key={c.id}>
              <Cartao className="overflow-hidden">
                <Foto nome={CAPA_DA_OBRA[obra.id] ?? ''} altura="faixa">
                  <div>
                    <div className="placa text-[10px] text-gold">Contrato {c.numero}</div>
                    <h2 className="placa text-[18px] leading-tight text-chalk">{obra.nome}</h2>
                    <p className="text-[13px] text-concrete">
                      {pref.nome} · {c.modalidade}
                    </p>
                  </div>
                </Foto>

                <div className="p-5">
                  <p className="text-[15px] leading-snug text-chalk">{c.objeto}</p>

                  <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Dado rotulo="Valor original" valor={dinheiro(c.valorOriginalCents)} />
                    <Dado
                      rotulo="Valor atualizado"
                      valor={dinheiro(c.valorOriginalCents + acrescimo - supressao)}
                      tom="gold"
                    />
                    <Dado rotulo="Ordem de serviço" valor={data(c.ordemDeServicoEm)} />
                    <Dado
                      rotulo="Prazo"
                      valor={`${diasCorridos} de ${prazoTotal} dias`}
                      tom={diasCorridos > prazoTotal ? 'rust' : undefined}
                    />
                  </dl>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Etiqueta tom="neutro">garantia {c.garantiaPct}%</Etiqueta>
                    <Etiqueta tom="neutro">assinado em {data(c.assinadoEm)}</Etiqueta>
                    {prazoExtra > 0 ? (
                      <Etiqueta tom="gold">+{dias(prazoExtra)} de prorrogação</Etiqueta>
                    ) : null}
                    <Etiqueta tom={pctAcrescimo >= TETO_ACRESCIMO_PCT * 0.8 ? 'rust' : 'neutro'}>
                      acréscimos em {pct(pctAcrescimo)}
                    </Etiqueta>
                  </div>

                  {/* A barra do teto — leitura, nunca conclusão. */}
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between">
                      <Rotulo>Acréscimos sobre o valor original</Rotulo>
                      <span className="num text-[13px] text-concrete">
                        {pct(pctAcrescimo)} de {TETO_ACRESCIMO_PCT}%
                      </span>
                    </div>
                    <div className="regua mt-1.5 h-3">
                      <div
                        className={`regua-faixa ${pctAcrescimo >= TETO_ACRESCIMO_PCT ? 'bg-rust' : 'regua-pago'}`}
                        style={{
                          width: `${Math.min(100, (pctAcrescimo / TETO_ACRESCIMO_PCT) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <TituloSecao>Aditivos</TituloSecao>
                    {meus.length === 0 ? (
                      <Vazio
                        titulo="Nenhum aditivo neste contrato."
                        dica="Acréscimo, supressão, prorrogação e reequilíbrio aparecem aqui, com a justificativa."
                      />
                    ) : (
                      <Cartao>
                        {meus.map((a) => (
                          <Linha
                            key={a.id}
                            titulo={`${a.numero} · ${nomeDe(TIPOS_DE_ADITIVO, a.tipoId)}`}
                            subtitulo={`${data(a.assinadoEm)} — ${a.justificativa}`}
                            valor={
                              a.valorCents !== 0
                                ? `${a.valorCents > 0 ? '+' : '−'}${dinheiro(Math.abs(a.valorCents))}`
                                : `+${dias(a.prazoDias)}`
                            }
                            valorTom={
                              a.valorCents > 0 ? 'gold' : a.valorCents < 0 ? 'rust' : undefined
                            }
                          />
                        ))}
                      </Cartao>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/medicoes/${obra.id}`}
                      className="placa inline-flex min-h-[44px] items-center border border-line bg-surface-2 px-4 text-[12px] text-chalk hover:border-line-strong"
                    >
                      Medições deste contrato
                    </Link>
                    <Link
                      href={`/obras/${obra.id}`}
                      className="placa inline-flex min-h-[44px] items-center border border-line bg-surface-2 px-4 text-[12px] text-chalk hover:border-line-strong"
                    >
                      A obra
                    </Link>
                  </div>
                </div>
              </Cartao>
            </section>
          );
        })}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <CartaoIntegracao
          titulo="Teto de acréscimo — art. 125 da Lei 14.133/2021"
          descricao="Obra vai a 25%; reforma de edifício vai a 50%. Acréscimos e supressões contam separado, um não compensa o outro. Esta tela mostra o que o sistema registrou — a conclusão sobre o contrato é do seu jurídico."
        />
        <CartaoIntegracao
          titulo="Publicação no PNCP"
          descricao="Contrato e aditivo são publicados pelo órgão público, não pela empresa. O Canteiro acompanha o que foi assinado; publicar é da prefeitura."
        />
      </div>
    </div>
  );
}

function Dado({ rotulo, valor, tom }: { rotulo: string; valor: string; tom?: 'gold' | 'rust' }) {
  return (
    <div>
      <dt className="placa text-[10px] text-concrete-dim">{rotulo}</dt>
      <dd
        className={`num text-[16px] ${tom === 'gold' ? 'text-gold-bright' : tom === 'rust' ? 'text-rust-bright' : 'text-chalk'}`}
      >
        {valor}
      </dd>
    </div>
  );
}
