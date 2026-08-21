'use client';

/**
 * A OBRA — a tela de aprofundamento do painel. Etapas, efetivo, custo e o
 * caminho para a medição e para o diário daquela obra.
 */

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMundo } from '@/lib/store';
import { caixaPorMes, desviosDeInsumo, falhasDeDiario } from '@/lib/analista';
import { GraficoDeCaixa } from '@/components/grafico';
import { Regua } from '@/components/regua';
import { Cartao, Etiqueta, Rotulo, TituloSecao, Vazio } from '@/components/ui';
import { Seta } from '@/components/icones';
import { FRENTES, TIPOS_DE_OBRA, nomeDe } from '@/data/taxonomias';
import { data, dias, dinheiro, numero, pct } from '@/lib/formato';

export default function Obra() {
  const { id } = useParams<{ id: string }>();
  const mundo = useMundo();
  const obra = mundo.obras.find((o) => o.id === id);

  if (!obra) {
    return <Vazio titulo="Obra não encontrada." dica="Volte ao painel e escolha uma das obras da carteira." />;
  }

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
  const desvios = desviosDeInsumo(mundo).filter((d) => d.obraId === obra.id);
  const falha = falhasDeDiario(mundo).find((f) => f.obraId === obra.id)!;
  const doDiario = mundo.diario.filter((e) => e.obraId === obra.id && e.cancelada === null).slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Cartao className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="placa text-[20px] leading-tight text-chalk">{obra.nome}</h1>
            <p className="mt-1 text-[13px] text-concrete">
              {pref.nome} · {nomeDe(TIPOS_DE_OBRA, obra.tipoId)} · encarregado {obra.encarregado}
            </p>
            <p className="text-[13px] text-concrete-dim">
              início em {data(obra.inicio)} · prazo de {obra.prazoMeses} meses
            </p>
          </div>
          <div className="text-right">
            <Rotulo>Contrato</Rotulo>
            <p className="num text-[22px] text-chalk">{dinheiro(obra.contratoCents)}</p>
          </div>
        </div>

        <div className="mt-5">
          <Regua valores={soma} base={obra.contratoCents} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/medicoes/${obra.id}`}
            className="placa inline-flex min-h-[44px] items-center gap-2 border border-line bg-surface-2 px-4 text-[12px] text-chalk hover:border-line-strong"
          >
            Ver medições <Seta className="h-4 w-4" />
          </Link>
          <Link
            href="/diario"
            className="placa inline-flex min-h-[44px] items-center gap-2 border border-line bg-surface-2 px-4 text-[12px] text-chalk hover:border-line-strong"
          >
            Diário de obra <Seta className="h-4 w-4" />
          </Link>
        </div>
      </Cartao>

      <section className="grid gap-6 lg:grid-cols-2">
        <Cartao className="p-5">
          <Rotulo>Frentes de serviço</Rotulo>
          <div className="mt-3 flex flex-wrap gap-2">
            {obra.frentes.map((f) => (
              <Etiqueta key={f} tom="neutro">
                {nomeDe(FRENTES, f)}
              </Etiqueta>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <Rotulo>Avanço físico</Rotulo>
              <p className="num text-[24px] text-chalk">{pct(obra.pctFisico)}</p>
            </div>
            <div>
              <Rotulo>Efetivo previsto</Rotulo>
              <p className="num text-[24px] text-chalk">{obra.efetivoPrevisto}</p>
            </div>
          </div>
          <p className="mt-4 border-t border-line pt-3 text-[13px] leading-snug text-concrete">
            {falha.diasSemDiario >= 3 ? (
              <>
                Sem diário há{' '}
                <span className="text-rust-bright">{dias(falha.diasSemDiario)}</span> — sem ele, a
                medição do mês fica sem prova de execução.
              </>
            ) : (
              <>
                Último registro no diário {dias(falha.diasSemDiario)} atrás.
                {falha.diasSeguidosComEfetivoBaixo >= 2
                  ? ` Efetivo abaixo do previsto nos ${falha.diasSeguidosComEfetivoBaixo} registros mais recentes.`
                  : ''}
              </>
            )}
          </p>
        </Cartao>

        <Cartao className="p-5">
          <Rotulo>Insumo consumido × previsto pelo avanço</Rotulo>
          {desvios.length === 0 ? (
            <p className="mt-3 text-[13px] text-concrete">
              Nenhum insumo acompanhado nesta obra ainda.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {desvios.map((d) => (
                <div key={d.descricao} className="border border-line bg-sunken px-3 py-2.5">
                  <p className="text-[14px] leading-snug text-chalk">{d.descricao}</p>
                  <p className="num mt-1 text-[13px] text-concrete">
                    previsto {numero(d.previsto)} {d.unidade} · consumido {numero(d.consumido)}{' '}
                    {d.unidade}
                  </p>
                  <p
                    className={`num mt-1 text-[15px] ${
                      d.desvioPct >= 15 ? 'text-rust-bright' : d.desvioPct <= -10 ? 'text-olive-bright' : 'text-concrete'
                    }`}
                  >
                    {d.desvioPct > 0 ? '+' : ''}
                    {d.desvioPct}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </Cartao>
      </section>

      <section>
        <TituloSecao>Caixa desta obra</TituloSecao>
        <Cartao className="p-5">
          <GraficoDeCaixa meses={caixaPorMes(mundo, obra.id)} />
        </Cartao>
      </section>

      <section>
        <TituloSecao acao={<Link href="/diario" className="placa text-[11px] text-gold hover:text-gold-bright">ver o diário</Link>}>
          Últimos registros do diário
        </TituloSecao>
        {doDiario.length === 0 ? (
          <Vazio titulo="Nenhum registro nesta obra." dica="O encarregado registra pelo celular, em vinte segundos." />
        ) : (
          <Cartao className="divide-y divide-line">
            {doDiario.map((e) => (
              <div key={e.id} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="num text-[12px] text-concrete-dim">
                    {data(e.data)} · {e.hora}
                  </span>
                  <span className="num text-[12px] text-concrete">efetivo {e.efetivo}</span>
                </div>
                <p className="mt-1 text-[14px] leading-snug text-chalk">{e.observacao}</p>
              </div>
            ))}
          </Cartao>
        )}
      </section>
    </div>
  );
}
