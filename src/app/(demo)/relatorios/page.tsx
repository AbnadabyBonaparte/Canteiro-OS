'use client';

/**
 * RELATÓRIOS — cinco leituras prontas, calculadas do que está na tela.
 *
 * ⛔ Nenhum relatório aqui é texto fixo: todos saem do mesmo dado que as outras
 * salas mostram. Se o número não existe, a linha não aparece.
 *
 * ⚠️ O botão de exportar é honesto: nesta demonstração ele imprime a própria
 * tela (o navegador gera o PDF). Não existe geração de arquivo no servidor, e a
 * tela diz isso.
 */

import { useMemo, useState } from 'react';
import { useMundo } from '@/lib/store';
import { medicoesPresas, resumoDeGlosa, ritmoDePagamento } from '@/lib/analista';
import {
  Botao,
  Cartao,
  Etiqueta,
  Linha,
  Sala,
  Selecione,
  TituloSecao,
  Vazio,
} from '@/components/ui';
import { Ficha } from '@/components/icones';
import { FAMILIAS_DE_MATERIAL, MOTIVOS_DE_GLOSA, nomeDe } from '@/data/taxonomias';
import { data, dias, dinheiro, dinheiroCurto, pct, plural, vencimento } from '@/lib/formato';
import { diasAte, diasDesde } from '@/data/seed';

const RELATORIOS = [
  { id: 'medicao', nome: 'Medição por obra' },
  { id: 'preso', nome: 'Dinheiro preso por prefeitura' },
  { id: 'custo', nome: 'Custo real × receita medida' },
  { id: 'empreitas', nome: 'Empreitas do período' },
  { id: 'documentos', nome: 'Documentos a vencer' },
];

export default function Relatorios() {
  const mundo = useMundo();
  const [qual, setQual] = useState('preso');
  const [avisou, setAvisou] = useState(false);

  return (
    <div className="mx-auto max-w-5xl">
      <Sala
        titulo="Relatórios"
        linha="Cinco leituras prontas sobre o mesmo dado das outras salas. Nada aqui é digitado à parte."
        acao={
          <Botao
            tom="principal"
            onClick={() => {
              setAvisou(true);
              if (typeof window !== 'undefined') window.print();
            }}
          >
            <Ficha className="h-4 w-4" />
            Exportar
          </Botao>
        }
      />

      <div className="mb-6 max-w-sm print:hidden">
        <Selecione etiqueta="Relatório" valor={qual} onChange={setQual} opcoes={RELATORIOS} />
      </div>

      {avisou ? (
        <p className="mb-4 border border-line bg-sunken px-4 py-3 text-[13px] leading-snug text-concrete print:hidden">
          Nesta demonstração o “exportar” manda a própria tela para a impressão do navegador — que
          salva em PDF. No sistema, o relatório sai como arquivo, com o carimbo de quem gerou e
          quando.
        </p>
      ) : null}

      {qual === 'medicao' ? <PorObra /> : null}
      {qual === 'preso' ? <Preso /> : null}
      {qual === 'custo' ? <Custo /> : null}
      {qual === 'empreitas' ? <Empreitas /> : null}
      {qual === 'documentos' ? <Documentos /> : null}
    </div>
  );
}

function PorObra() {
  const mundo = useMundo();
  return (
    <section>
      <TituloSecao>Medição por obra</TituloSecao>
      {mundo.obras.map((obra) => {
        const ms = mundo.medicoes.filter((m) => m.obraId === obra.id);
        const soma = ms.reduce(
          (a, m) => ({
            exec: a.exec + m.executadoCents,
            aceito: a.aceito + m.aceitoCents,
            pago: a.pago + m.pagoCents,
          }),
          { exec: 0, aceito: 0, pago: 0 },
        );
        return (
          <Cartao key={obra.id} className="mb-3 p-4">
            <h3 className="placa text-[13px] text-chalk">{obra.nome}</h3>
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <D r="Medições" v={String(ms.length)} />
              <D r="Executado" v={dinheiro(soma.exec)} />
              <D r="Aceito" v={dinheiro(soma.aceito)} />
              <D
                r="Pago"
                v={dinheiro(soma.pago)}
                tom={soma.pago < soma.aceito ? 'rust' : undefined}
              />
            </dl>
          </Cartao>
        );
      })}
    </section>
  );
}

function Preso() {
  const mundo = useMundo();
  const presas = medicoesPresas(mundo);
  const ritmos = ritmoDePagamento(mundo);

  const porPrefeitura = useMemo(() => {
    const m = new Map<string, { valor: number; qtd: number; maisVelha: number }>();
    for (const { medicao, idade } of presas) {
      const obra = mundo.obras.find((o) => o.id === medicao.obraId)!;
      const atual = m.get(obra.prefeituraId) ?? { valor: 0, qtd: 0, maisVelha: 0 };
      m.set(obra.prefeituraId, {
        valor: atual.valor + medicao.aceitoCents,
        qtd: atual.qtd + 1,
        maisVelha: Math.max(atual.maisVelha, idade),
      });
    }
    return [...m.entries()].sort((a, b) => b[1].valor - a[1].valor);
  }, [presas, mundo.obras]);

  if (porPrefeitura.length === 0) {
    return (
      <Vazio titulo="Nada aceito e não pago." dica="Nenhuma prefeitura devendo neste momento." />
    );
  }

  return (
    <section>
      <TituloSecao>Dinheiro preso por prefeitura</TituloSecao>
      <Cartao>
        {porPrefeitura.map(([prefId, v]) => {
          const pref = mundo.prefeituras.find((p) => p.id === prefId)!;
          const ritmo = ritmos.find((r) => r.prefeituraId === prefId);
          return (
            <Linha
              key={prefId}
              titulo={pref.nome}
              subtitulo={`${plural(v.qtd, 'medição aceita e não paga', 'medições aceitas e não pagas')} · a mais antiga há ${dias(v.maisVelha)}`}
              valor={dinheiro(v.valor)}
              valorTom="rust"
              etiquetas={
                ritmo ? (
                  <Etiqueta tom="neutro">
                    paga em {dias(ritmo.mediaDias)}, em média de{' '}
                    {plural(ritmo.amostras, 'medição', 'medições')}
                  </Etiqueta>
                ) : null
              }
            />
          );
        })}
      </Cartao>
    </section>
  );
}

function Custo() {
  const mundo = useMundo();
  return (
    <section>
      <TituloSecao>Custo real × receita medida</TituloSecao>
      {mundo.obras.map((obra) => {
        const custos = mundo.custos.filter((c) => c.obraId === obra.id);
        const total = custos.reduce((s, c) => s + c.valorCents, 0);
        const receita = obra.contratoCents * (obra.pctFisico / 100);
        const porFamilia = new Map<string, number>();
        for (const c of custos)
          porFamilia.set(c.familiaId, (porFamilia.get(c.familiaId) ?? 0) + c.valorCents);
        return (
          <Cartao key={obra.id} className="mb-3 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="placa text-[13px] text-chalk">{obra.nome}</h3>
              <span className="num text-[13px] text-concrete">
                margem em curso {pct(receita > 0 ? ((receita - total) / receita) * 100 : 0)}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-3">
              <D r="Receita medida" v={dinheiro(receita)} />
              <D r="Custo real" v={dinheiro(total)} tom={total > receita ? 'rust' : undefined} />
              <D r="Diferença" v={dinheiro(receita - total)} />
            </dl>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[...porFamilia.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([f, v]) => (
                  <Etiqueta key={f} tom="neutro">
                    {nomeDe(FAMILIAS_DE_MATERIAL, f)} {dinheiroCurto(v)}
                  </Etiqueta>
                ))}
            </div>
          </Cartao>
        );
      })}
    </section>
  );
}

function Empreitas() {
  const mundo = useMundo();
  const g = resumoDeGlosa(mundo);
  const noPeriodo = mundo.empreitas.filter((e) => diasDesde(e.inicio) <= 90);
  const total = noPeriodo.reduce((s, e) => s + e.valorGlobalCents, 0);

  return (
    <section>
      <TituloSecao>Empreitas dos últimos 90 dias</TituloSecao>
      <Cartao className="mb-3 p-4">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <D r="Empreitas" v={String(noPeriodo.length)} />
          <D r="Valor contratado" v={dinheiro(total)} />
          <D
            r="Parceiros distintos"
            v={String(new Set(noPeriodo.map((e) => e.empreiteiroId)).size)}
          />
          <D r="Glosado na carteira" v={dinheiro(g.totalCents)} tom="rust" />
        </dl>
        {g.motivoTopId ? (
          <p className="mt-3 text-[13px] text-concrete">
            Motivo de glosa mais frequente:{' '}
            <span className="text-chalk">{nomeDe(MOTIVOS_DE_GLOSA, g.motivoTopId)}</span> —{' '}
            {g.motivoTopVezes} vezes.
          </p>
        ) : null}
      </Cartao>
      <Cartao>
        {noPeriodo.slice(0, 20).map((e) => {
          const emp = mundo.empreiteiros.find((x) => x.id === e.empreiteiroId)!;
          const obra = mundo.obras.find((o) => o.id === e.obraId)!;
          return (
            <Linha
              key={e.id}
              titulo={e.objeto}
              subtitulo={`${emp.nome} · ${obra.nome} · início em ${data(e.inicio)} · prazo ${dias(e.prazoDias)}`}
              valor={dinheiro(e.valorGlobalCents)}
            />
          );
        })}
      </Cartao>
    </section>
  );
}

function Documentos() {
  const mundo = useMundo();
  const lista = mundo.documentos
    .map((d) => ({ d, restam: diasAte(d.vence) }))
    .filter((x) => x.restam <= 45)
    .sort((a, b) => a.restam - b.restam);

  if (lista.length === 0) {
    return (
      <Vazio
        titulo="Nada vencendo nos próximos 45 dias."
        dica="A carteira de documentos está em dia."
      />
    );
  }

  return (
    <section>
      <TituloSecao>Documentos a vencer em 45 dias</TituloSecao>
      <Cartao>
        {lista.map(({ d, restam }) => (
          <Linha
            key={d.id}
            titulo={`${d.titularNome}`}
            subtitulo={`vence em ${data(d.vence)}`}
            valor={vencimento(restam)}
            valorTom={restam < 0 ? 'rust' : restam <= 7 ? 'gold' : undefined}
          />
        ))}
      </Cartao>
    </section>
  );
}

function D({ r, v, tom }: { r: string; v: string; tom?: 'rust' }) {
  return (
    <div>
      <dt className="placa text-[10px] text-concrete-dim">{r}</dt>
      <dd className={`num text-[15px] ${tom === 'rust' ? 'text-rust-bright' : 'text-chalk'}`}>
        {v}
      </dd>
    </div>
  );
}
