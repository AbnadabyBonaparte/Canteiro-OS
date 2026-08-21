'use client';

/**
 * TELA 1 — PAINEL DE OBRAS · o dinheiro preso.
 *
 * A hierarquia é por DINHEIRO, não por simetria (docs/DESIGN.md §6, defeito 1):
 * o bloco do que está parado ocupa a largura inteira e vem ANTES das obras.
 * O gancho não é o valor — é o valor COM IDADE.
 */

import Link from 'next/link';
import { useMundo } from '@/lib/store';
import { documentosNoPrazo, medicoesPresas, totalPresoCents } from '@/lib/analista';
import { Regua } from '@/components/regua';
import { Cartao, Etiqueta, TituloSecao, Vazio } from '@/components/ui';
import { Prumo, Seta } from '@/components/icones';
import { Foto } from '@/components/imagem';
import { CAPA_DA_OBRA } from '@/lib/imagens';
import { data, dias, dinheiro, dinheiroCurto, pct, vencimento } from '@/lib/formato';
import { TIPOS_DE_DOCUMENTO, nomeDe } from '@/data/taxonomias';
import { diasAte } from '@/data/seed';

export default function Painel() {
  const mundo = useMundo();
  const presas = medicoesPresas(mundo);
  const total = totalPresoCents(mundo);
  const vencendo = documentosNoPrazo(mundo, 7);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ── O bloco que abre a conversa ─────────────────────────────────── */}
      <section>
        <Cartao destaque className="p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="placa text-[11px] text-concrete">Dinheiro preso</div>
              <div className="num mt-1 text-[38px] leading-none text-gold-bright sm:text-[54px]">
                {dinheiroCurto(total)}
              </div>
              <p className="mt-2 max-w-md text-[14px] leading-snug text-concrete">
                Aceito pelo fiscal e ainda não pago. Não é previsão — é o que já foi conferido e
                liberado por quem fiscaliza a obra.
              </p>
            </div>
            {presas.length > 0 ? (
              <div className="text-right">
                <div className="placa text-[11px] text-concrete">Medição mais antiga</div>
                <div className="num text-[28px] leading-none text-rust-bright">
                  {dias(presas[0].idade)}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-5 space-y-2">
            {presas.length === 0 ? (
              <Vazio
                titulo="Nada parado neste momento."
                dica="Toda medição aceita pelo fiscal já foi paga. Quando uma passar do prazo, ela aparece aqui com o cronômetro."
              />
            ) : (
              presas.map(({ medicao, idade }) => {
                const obra = mundo.obras.find((o) => o.id === medicao.obraId)!;
                return (
                  <Link
                    key={medicao.id}
                    href={`/medicoes/${obra.id}`}
                    className="block border border-line bg-sunken px-4 py-3 hover:border-line-strong sm:flex sm:items-center sm:justify-between sm:gap-4"
                  >
                    <span className="block min-w-0">
                      <span className="block text-[15px] leading-snug text-chalk">
                        Medição {medicao.numero} · {obra.nome}
                      </span>
                      <span className="block text-[12px] text-concrete-dim">
                        aceita em {data(medicao.dataAceite!)}
                      </span>
                    </span>
                    <span className="mt-2 flex shrink-0 items-center gap-4 sm:mt-0">
                      <span className="num flex-1 text-[16px] text-chalk sm:flex-none">
                        {dinheiro(medicao.aceitoCents)}
                      </span>
                      <span className="num w-20 text-right text-[15px] text-rust-bright">
                        {dias(idade)}
                      </span>
                      <Seta className="h-4 w-4 text-concrete-dim" />
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </Cartao>
      </section>

      {/* ── As obras ────────────────────────────────────────────────────── */}
      <section>
        <TituloSecao>As obras</TituloSecao>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mundo.obras.map((obra) => {
            const pref = mundo.prefeituras.find((p) => p.id === obra.prefeituraId)!;
            const ms = mundo.medicoes.filter((m) => m.obraId === obra.id);
            const soma = ms.reduce(
              (a, m) => ({
                executadoCents: a.executadoCents + m.executadoCents,
                aceitoCents: a.aceitoCents + m.aceitoCents,
                faturadoCents: a.faturadoCents + m.faturadoCents,
                pagoCents: a.pagoCents + m.pagoCents,
              }),
              { executadoCents: 0, aceitoCents: 0, faturadoCents: 0, pagoCents: 0 },
            );
            const emCurso = ms.find((m) => m.estado === 'em-curso');
            const financeiro = (soma.pagoCents / obra.contratoCents) * 100;

            return (
              <Cartao key={obra.id} className="flex flex-col overflow-hidden">
                <Link href={`/obras/${obra.id}`} className="group block">
                  <Foto nome={CAPA_DA_OBRA[obra.id] ?? ''} altura="cena">
                    <div>
                      <h3 className="placa text-[15px] leading-tight text-chalk group-hover:text-gold-bright">
                        {obra.nome}
                      </h3>
                      <p className="text-[12px] text-concrete">{pref.nome}</p>
                    </div>
                  </Foto>
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-baseline gap-5">
                    <span>
                      <span className="placa block text-[10px] text-concrete-dim">Físico</span>
                      <span className="num text-[20px] text-chalk">{pct(obra.pctFisico)}</span>
                    </span>
                    <span>
                      <span className="placa block text-[10px] text-concrete-dim">Financeiro</span>
                      <span className="num text-[20px] text-chalk">{pct(financeiro)}</span>
                    </span>
                  </div>

                  <div className="mt-4">
                    <Regua valores={soma} base={obra.contratoCents} denso />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                    {emCurso ? (
                      <Etiqueta tom="gold">Medição {emCurso.numero} em curso</Etiqueta>
                    ) : (
                      <Etiqueta tom="olive">Medições em dia</Etiqueta>
                    )}
                    {obra.aditivoPct >= 17.5 ? (
                      <Etiqueta tom="rust">Aditivos em {obra.aditivoPct}%</Etiqueta>
                    ) : null}
                  </div>
                </div>
              </Cartao>
            );
          })}
        </div>
      </section>

      {/* ── O que vence ─────────────────────────────────────────────────── */}
      <section>
        <TituloSecao>Vence esta semana</TituloSecao>
        <Cartao className="divide-y divide-line">
          {vencendo.length === 0 ? (
            <div className="p-5">
              <Vazio
                titulo="Nenhum documento vencendo nos próximos dias."
                dica="Certidão, ASO e treinamento aparecem aqui quando entram na reta final."
              />
            </div>
          ) : (
            vencendo.map(({ documento, restam }) => (
              <div key={documento.id} className="flex items-center gap-3 px-4 py-3">
                <Prumo
                  className={`h-4 w-4 shrink-0 ${restam < 0 ? 'text-rust-bright' : 'text-gold'}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] text-chalk">
                    {nomeDe(TIPOS_DE_DOCUMENTO, documento.tipoId)}
                  </span>
                  <span className="block truncate text-[12px] text-concrete-dim">
                    {documento.titularNome}
                  </span>
                </span>
                <Etiqueta tom={restam < 0 ? 'rust' : restam <= 7 ? 'gold' : 'neutro'}>
                  {vencimento(diasAte(documento.vence))}
                </Etiqueta>
              </div>
            ))
          )}
        </Cartao>
      </section>
    </div>
  );
}
