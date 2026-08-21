'use client';

import Link from 'next/link';
import { useMundo } from '@/lib/store';
import { Cartao, Etiqueta, TituloSecao } from '@/components/ui';
import { Regua } from '@/components/regua';
import { Seta } from '@/components/icones';
import { data, dias, dinheiro } from '@/lib/formato';
import { diasDesde } from '@/data/seed';

/** A porta das medições: escolher a obra. Quem já sabe o nome usa a busca. */
export default function Medicoes() {
  const mundo = useMundo();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <TituloSecao>Medições por obra</TituloSecao>
      {mundo.obras.map((obra) => {
        const ms = mundo.medicoes.filter((m) => m.obraId === obra.id);
        const ultima = ms[0];
        const presa = ms.find((m) => m.aceitoCents > 0 && m.pagoCents === 0);
        const soma = ms.reduce(
          (a, m) => ({
            executadoCents: a.executadoCents + m.executadoCents,
            aceitoCents: a.aceitoCents + m.aceitoCents,
            faturadoCents: a.faturadoCents + m.faturadoCents,
            pagoCents: a.pagoCents + m.pagoCents,
          }),
          { executadoCents: 0, aceitoCents: 0, faturadoCents: 0, pagoCents: 0 },
        );

        return (
          <Cartao key={obra.id} className="p-5">
            <Link
              href={`/medicoes/${obra.id}`}
              className="group flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <h3 className="placa text-[15px] text-chalk group-hover:text-gold-bright">
                  {obra.nome}
                </h3>
                <p className="mt-1 text-[13px] text-concrete">
                  {ms.length} medições · última em {ultima ? data(ultima.periodoFim) : '—'}
                </p>
              </div>
              <Seta className="mt-1 h-5 w-5 shrink-0 text-concrete-dim group-hover:text-gold" />
            </Link>

            <div className="mt-4">
              <Regua valores={soma} base={obra.contratoCents} />
            </div>

            {presa ? (
              <p className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-concrete">
                <Etiqueta tom="rust">
                  {dinheiro(presa.aceitoCents)} parados há {dias(diasDesde(presa.dataAceite!))}
                </Etiqueta>
                na medição {presa.numero}
              </p>
            ) : null}
          </Cartao>
        );
      })}
    </div>
  );
}
