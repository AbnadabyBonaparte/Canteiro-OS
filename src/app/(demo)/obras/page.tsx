'use client';

/**
 * OBRAS — a carteira inteira, com capa, avanço e a régua de quatro marcas.
 *
 * ⭐ A imagem serve a dado: a capa de cada obra carrega o físico, o financeiro
 * e o que está parado. Sem o número por cima, seria foto de agência.
 */

import Link from 'next/link';
import { useMundo } from '@/lib/store';
import { medicoesPresas } from '@/lib/analista';
import { Foto } from '@/components/imagem';
import { Regua } from '@/components/regua';
import { Cartao, Etiqueta, Sala } from '@/components/ui';
import { Seta } from '@/components/icones';
import { CAPA_DA_OBRA } from '@/lib/imagens';
import { TIPOS_DE_OBRA, nomeDe } from '@/data/taxonomias';
import { data, dias, dinheiro, dinheiroCurto, pct } from '@/lib/formato';

export default function Obras() {
  const mundo = useMundo();
  const presas = medicoesPresas(mundo);
  const carteira = mundo.obras.reduce((s, o) => s + o.contratoCents, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <Sala
        titulo="Obras"
        linha="A carteira em curso: quanto foi contratado, quanto já foi executado e quanto disso virou dinheiro na conta."
        numero={dinheiroCurto(carteira)}
        rotuloNumero="Contratado"
      />

      <div className="space-y-6">
        {mundo.obras.map((obra) => {
          const pref = mundo.prefeituras.find((p) => p.id === obra.prefeituraId)!;
          const contrato = mundo.contratos.find((c) => c.obraId === obra.id);
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
          const minhasPresas = presas.filter((p) => p.medicao.obraId === obra.id);
          const preso = minhasPresas.reduce((s, p) => s + p.medicao.aceitoCents, 0);
          const financeiro = (soma.pagoCents / obra.contratoCents) * 100;

          return (
            <Cartao key={obra.id} className="overflow-hidden">
              <Link href={`/obras/${obra.id}`} className="group block">
                <Foto nome={CAPA_DA_OBRA[obra.id] ?? ''} altura="capa">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <div className="placa text-[10px] text-gold">
                        {nomeDe(TIPOS_DE_OBRA, obra.tipoId)}
                        {contrato ? ` · contrato ${contrato.numero}` : ''}
                      </div>
                      <h2 className="placa text-[19px] leading-tight text-chalk group-hover:text-gold-bright sm:text-[22px]">
                        {obra.nome}
                      </h2>
                      <p className="text-[13px] text-concrete">{pref.nome}</p>
                    </div>
                    <div className="flex items-baseline gap-5">
                      <span>
                        <span className="placa block text-[10px] text-concrete">Físico</span>
                        <span className="num text-[24px] leading-none text-chalk">
                          {pct(obra.pctFisico)}
                        </span>
                      </span>
                      <span>
                        <span className="placa block text-[10px] text-concrete">Financeiro</span>
                        <span className="num text-[24px] leading-none text-chalk">
                          {pct(financeiro)}
                        </span>
                      </span>
                      <Seta className="h-5 w-5 text-concrete-dim group-hover:text-gold" />
                    </div>
                  </div>
                </Foto>
              </Link>

              <div className="p-5">
                <Regua valores={soma} base={obra.contratoCents} />

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <Etiqueta tom="neutro">contrato {dinheiro(obra.contratoCents)}</Etiqueta>
                  <Etiqueta tom="neutro">encarregado {obra.encarregado}</Etiqueta>
                  <Etiqueta tom="neutro">início {data(obra.inicio)}</Etiqueta>
                  {preso > 0 ? (
                    <Etiqueta tom="rust">
                      {dinheiroCurto(preso)} parados há {dias(minhasPresas[0].idade)}
                    </Etiqueta>
                  ) : (
                    <Etiqueta tom="olive">nada parado</Etiqueta>
                  )}
                  {obra.aditivoPct >= 17.5 ? (
                    <Etiqueta tom="rust">aditivos em {obra.aditivoPct}%</Etiqueta>
                  ) : null}
                </div>
              </div>
            </Cartao>
          );
        })}
      </div>
    </div>
  );
}
