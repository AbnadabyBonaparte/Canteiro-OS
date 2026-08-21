'use client';

/**
 * CAIXA POR OBRA — custo real × orçado, margem e previsão de recebimento.
 *
 * ⭐ A previsão não sai de um chute: ela sai da HISTÓRIA DE PAGAMENTO de cada
 * prefeitura, medida das medições que já foram aceitas e pagas. Duas
 * prefeituras, dois comportamentos de caixa — planejar as duas do mesmo jeito é
 * o que faz faltar dinheiro no mês errado.
 */

import { useMemo, useState } from 'react';
import { useMundo } from '@/lib/store';
import { caixaPorMes, medicoesPresas, ritmoDePagamento } from '@/lib/analista';
import { GraficoDeCaixa } from '@/components/grafico';
import {
  Cartao,
  Etiqueta,
  Linha,
  Rotulo,
  Sala,
  Selecione,
  TituloSecao,
  Vazio,
} from '@/components/ui';
import { CartaoIntegracao } from '@/components/cartao-integracao';
import { FAMILIAS_DE_MATERIAL, nomeDe } from '@/data/taxonomias';
import { data, dias, dinheiro, dinheiroCurto, pct, plural, vencimento } from '@/lib/formato';
import { diasAte, diasDesde } from '@/data/seed';

export default function Financeiro() {
  const mundo = useMundo();
  const [obraFiltro, setObraFiltro] = useState('todas');

  const obras =
    obraFiltro === 'todas' ? mundo.obras : mundo.obras.filter((o) => o.id === obraFiltro);
  const ritmos = ritmoDePagamento(mundo);
  const presas = medicoesPresas(mundo).filter(
    (p) => obraFiltro === 'todas' || p.medicao.obraId === obraFiltro,
  );
  const totalPreso = presas.reduce((s, p) => s + p.medicao.aceitoCents, 0);

  const contas = useMemo(
    () =>
      mundo.contasAPagar
        .filter((c) => obraFiltro === 'todas' || c.obraId === obraFiltro)
        .filter((c) => c.pagoEm === null)
        .sort((a, b) => a.vence.localeCompare(b.vence)),
    [mundo.contasAPagar, obraFiltro],
  );
  const totalAPagar = contas.reduce((s, c) => s + c.valorCents, 0);
  const atrasadas = contas.filter((c) => diasAte(c.vence) < 0);

  return (
    <div className="mx-auto max-w-5xl">
      <Sala
        titulo="Caixa por obra"
        linha="Custo real contra o que foi orçado, margem em curso, o que a prefeitura ainda deve e o que a empresa ainda paga."
        numero={dinheiroCurto(totalPreso)}
        rotuloNumero="A receber já aceito"
        tomNumero="rust"
      />

      <div className="mb-6 max-w-xs">
        <Selecione
          etiqueta="Obra"
          valor={obraFiltro}
          onChange={setObraFiltro}
          opcoes={[
            { id: 'todas', nome: 'Todas as obras' },
            ...mundo.obras.map((o) => ({ id: o.id, nome: o.nome })),
          ]}
        />
      </div>

      <section className="mb-8 space-y-4">
        <TituloSecao>Custo real × receita medida</TituloSecao>
        {obras.map((obra) => {
          const custos = mundo.custos.filter((c) => c.obraId === obra.id);
          const custoTotal = custos.reduce((s, c) => s + c.valorCents, 0);
          const receita = obra.contratoCents * (obra.pctFisico / 100);
          const margem = receita > 0 ? ((receita - custoTotal) / receita) * 100 : 0;

          const porFamilia = new Map<string, number>();
          for (const c of custos)
            porFamilia.set(c.familiaId, (porFamilia.get(c.familiaId) ?? 0) + c.valorCents);
          const top = [...porFamilia.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);

          return (
            <Cartao key={obra.id} className="p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="placa text-[15px] text-chalk">{obra.nome}</h3>
                <Etiqueta tom={margem < 10 ? 'rust' : margem < 20 ? 'gold' : 'olive'}>
                  margem em curso {pct(margem)}
                </Etiqueta>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Dado rotulo="Contrato" valor={dinheiro(obra.contratoCents)} />
                <Dado rotulo="Físico" valor={pct(obra.pctFisico)} />
                <Dado rotulo="Receita medida" valor={dinheiro(receita)} tom="gold" />
                <Dado
                  rotulo="Custo real"
                  valor={dinheiro(custoTotal)}
                  tom={custoTotal > receita ? 'rust' : undefined}
                />
              </dl>

              <div className="mt-4">
                <Rotulo>Onde o dinheiro foi</Rotulo>
                <div className="mt-2 space-y-2">
                  {top.map(([fam, v]) => (
                    <div key={fam}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[13px] text-concrete">
                          {nomeDe(FAMILIAS_DE_MATERIAL, fam)}
                        </span>
                        <span className="num text-[13px] text-chalk">{dinheiroCurto(v)}</span>
                      </div>
                      <div className="regua mt-1 h-2">
                        <div
                          className="regua-faixa regua-faturado"
                          style={{ width: `${custoTotal > 0 ? (v / custoTotal) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-line pt-4">
                <Rotulo>Caixa — previsto pelo contrato × realizado</Rotulo>
                <div className="mt-3">
                  <GraficoDeCaixa meses={caixaPorMes(mundo, obra.id)} />
                </div>
              </div>
            </Cartao>
          );
        })}
      </section>

      <section className="mb-8">
        <TituloSecao>Como cada prefeitura paga</TituloSecao>
        {ritmos.length === 0 ? (
          <Vazio
            titulo="Ainda não há medição paga suficiente."
            dica="A média só aparece depois que uma prefeitura pagar — sem amostra, não se afirma média."
          />
        ) : (
          <Cartao>
            {ritmos.map((r) => (
              <Linha
                key={r.prefeituraId}
                titulo={r.nome}
                subtitulo={`média de ${plural(r.amostras, 'medição paga', 'medições pagas')}`}
                valor={dias(r.mediaDias)}
                valorTom={r.mediaDias > 60 ? 'rust' : r.mediaDias > 35 ? 'gold' : 'olive'}
              />
            ))}
          </Cartao>
        )}
        <p className="mt-2 text-[13px] leading-snug text-concrete">
          É esta média que transforma “vai entrar” em data provável. Ela sai do histórico real desta
          carteira, não de uma promessa de contrato.
        </p>
      </section>

      <section className="mb-8">
        <TituloSecao>A receber — aceito pelo fiscal e não pago</TituloSecao>
        {presas.length === 0 ? (
          <Vazio
            titulo="Nada aceito e não pago."
            dica="Quando uma medição passar do prazo, ela aparece aqui."
          />
        ) : (
          <Cartao>
            {presas.map(({ medicao, idade }) => {
              const obra = mundo.obras.find((o) => o.id === medicao.obraId)!;
              const pref = mundo.prefeituras.find((p) => p.id === obra.prefeituraId)!;
              const ritmo = ritmos.find((r) => r.prefeituraId === pref.id);
              const previsto = ritmo ? ritmo.mediaDias - idade : null;
              return (
                <Linha
                  key={medicao.id}
                  titulo={`Medição ${medicao.numero} · ${obra.nome}`}
                  subtitulo={`${pref.nome} · aceita em ${data(medicao.dataAceite!)} · há ${dias(idade)}`}
                  valor={dinheiro(medicao.aceitoCents)}
                  valorTom="rust"
                  etiquetas={
                    previsto !== null ? (
                      <Etiqueta tom={previsto < 0 ? 'rust' : 'neutro'}>
                        {previsto < 0
                          ? `${dias(-previsto)} além da média desta prefeitura`
                          : `pelo histórico, deve entrar em ${dias(previsto)}`}
                      </Etiqueta>
                    ) : null
                  }
                />
              );
            })}
          </Cartao>
        )}
      </section>

      <section className="mb-8">
        <TituloSecao
          acao={
            <span className="num text-[13px] text-concrete">
              {dinheiroCurto(totalAPagar)} em aberto
            </span>
          }
        >
          A pagar
        </TituloSecao>
        {contas.length === 0 ? (
          <Vazio
            titulo="Nada em aberto."
            dica="Pedidos e parcelas de empreita aparecem aqui quando vencerem."
          />
        ) : (
          <Cartao>
            {contas.slice(0, 20).map((c) => {
              const obra = mundo.obras.find((o) => o.id === c.obraId)!;
              const restam = diasAte(c.vence);
              return (
                <Linha
                  key={c.id}
                  titulo={`${c.favorecido} — ${c.descricao}`}
                  subtitulo={`${obra.nome} · vence em ${data(c.vence)}`}
                  valor={dinheiro(c.valorCents)}
                  valorTom={restam < 0 ? 'rust' : undefined}
                  etiquetas={
                    <Etiqueta tom={restam < 0 ? 'rust' : restam <= 7 ? 'gold' : 'neutro'}>
                      {vencimento(restam)}
                    </Etiqueta>
                  }
                />
              );
            })}
          </Cartao>
        )}
        {atrasadas.length > 0 ? (
          <p className="mt-2 text-[13px] text-rust-bright">
            {plural(atrasadas.length, 'conta vencida', 'contas vencidas')} —{' '}
            {dinheiroCurto(atrasadas.reduce((s, c) => s + c.valorCents, 0))}.
          </p>
        ) : null}
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <CartaoIntegracao
          titulo="INSS, ISS e retenções"
          descricao="Cálculo e recolhimento integram com o seu sistema fiscal e com a contabilidade. O Canteiro mostra o custo da obra; a apuração continua onde já está."
        />
        <CartaoIntegracao
          titulo="Conciliação bancária"
          descricao="A entrada do dinheiro vem do extrato. Aqui fica a data em que a medição foi paga — quem concilia é o seu financeiro."
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
