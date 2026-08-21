'use client';

/**
 * RESOLUTIVIDADE — a idade das pendências, por obra e por setor.
 *
 * ⭐ A frase que governa a tela: **o sistema mostra onde falta recurso, não
 * quem é culpado.** Por isso a métrica é IDADE, não volume: uma pendência de
 * 60 dias diz mais sobre o processo do que dez de dois dias.
 */

import { useMemo } from 'react';
import { useMundo } from '@/lib/store';
import { Cartao, Etiqueta, Linha, Rotulo, Sala, TituloSecao, Vazio } from '@/components/ui';
import { SETORES, nomeDe } from '@/data/taxonomias';
import { data, dias, plural } from '@/lib/formato';
import { diasDesde } from '@/data/seed';

export default function Resolutividade() {
  const mundo = useMundo();

  const comIdade = useMemo(
    () =>
      mundo.pendencias
        .map((p) => ({ p, idade: diasDesde(p.abertaEm) }))
        .sort((a, b) => b.idade - a.idade),
    [mundo.pendencias],
  );

  const media =
    comIdade.length === 0
      ? 0
      : Math.round(comIdade.reduce((s, x) => s + x.idade, 0) / comIdade.length);

  const porSetor = useMemo(() => {
    const m = new Map<string, { qtd: number; soma: number; maisVelha: number }>();
    for (const { p, idade } of comIdade) {
      const atual = m.get(p.setorId) ?? { qtd: 0, soma: 0, maisVelha: 0 };
      m.set(p.setorId, {
        qtd: atual.qtd + 1,
        soma: atual.soma + idade,
        maisVelha: Math.max(atual.maisVelha, idade),
      });
    }
    return [...m.entries()]
      .map(([id, v]) => ({
        id,
        qtd: v.qtd,
        media: Math.round(v.soma / v.qtd),
        maisVelha: v.maisVelha,
      }))
      .sort((a, b) => b.media - a.media);
  }, [comIdade]);

  const porObra = useMemo(() => {
    const m = new Map<string, { qtd: number; soma: number }>();
    for (const { p, idade } of comIdade) {
      if (!p.obraId) continue;
      const atual = m.get(p.obraId) ?? { qtd: 0, soma: 0 };
      m.set(p.obraId, { qtd: atual.qtd + 1, soma: atual.soma + idade });
    }
    return [...m.entries()]
      .map(([id, v]) => ({ id, qtd: v.qtd, media: Math.round(v.soma / v.qtd) }))
      .sort((a, b) => b.media - a.media);
  }, [comIdade]);

  const maiorMedia = Math.max(1, ...porSetor.map((s) => s.media));

  return (
    <div className="mx-auto max-w-5xl">
      <Sala
        titulo="Resolutividade"
        linha="Quanto tempo uma pendência fica aberta nesta empresa, por setor e por obra. O sistema mostra onde falta recurso, não quem é culpado."
        numero={dias(media)}
        rotuloNumero="Idade média"
        tomNumero={media > 20 ? 'rust' : 'gold'}
      />

      {comIdade.length === 0 ? (
        <Vazio
          titulo="Nenhuma pendência aberta."
          dica="Ofício sem resposta, cotação parada, documento vencendo e medição não paga entram aqui."
        />
      ) : (
        <>
          <section className="mb-8">
            <TituloSecao>Por setor</TituloSecao>
            <Cartao className="p-5">
              <div className="space-y-4">
                {porSetor.map((s) => (
                  <div key={s.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <span className="text-[15px] text-chalk">{nomeDe(SETORES, s.id)}</span>
                      <span className="num text-[13px] text-concrete">
                        {plural(s.qtd, 'pendência', 'pendências')} · média {dias(s.media)} · mais
                        velha {dias(s.maisVelha)}
                      </span>
                    </div>
                    <div className="regua mt-1.5 h-3">
                      <div
                        className={`regua-faixa ${s.media > 20 ? 'bg-rust' : 'regua-pago'}`}
                        style={{ width: `${(s.media / maiorMedia) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-line pt-3 text-[13px] leading-snug text-concrete">
                A barra é a <span className="text-chalk">idade média</span>, não a quantidade. Um
                setor com muitas pendências novas está trabalhando; um com poucas e velhas está
                travado — e são coisas diferentes.
              </p>
            </Cartao>
          </section>

          <section className="mb-8">
            <TituloSecao>Por obra</TituloSecao>
            <Cartao>
              {porObra.map((o) => {
                const obra = mundo.obras.find((x) => x.id === o.id)!;
                return (
                  <Linha
                    key={o.id}
                    titulo={obra.nome}
                    subtitulo={plural(o.qtd, 'pendência aberta', 'pendências abertas')}
                    valor={dias(o.media)}
                    valorTom={o.media > 20 ? 'rust' : o.media > 10 ? 'gold' : 'olive'}
                  />
                );
              })}
            </Cartao>
          </section>

          <section>
            <TituloSecao>As dez mais velhas</TituloSecao>
            <Cartao>
              {comIdade.slice(0, 10).map(({ p, idade }) => {
                const obra = p.obraId ? mundo.obras.find((x) => x.id === p.obraId) : null;
                return (
                  <Linha
                    key={p.id}
                    titulo={p.titulo}
                    subtitulo={`${obra ? `${obra.nome} · ` : ''}aberta em ${data(p.abertaEm)} · ${p.responsavel}`}
                    valor={dias(idade)}
                    valorTom={idade > 30 ? 'rust' : idade > 14 ? 'gold' : undefined}
                    etiquetas={<Etiqueta tom="neutro">{nomeDe(SETORES, p.setorId)}</Etiqueta>}
                  />
                );
              })}
            </Cartao>
            <Rotulo>
              <span className="mt-2 block">
                A pendência mais velha da casa tem {dias(comIdade[0].idade)}.
              </span>
            </Rotulo>
          </section>
        </>
      )}
    </div>
  );
}
