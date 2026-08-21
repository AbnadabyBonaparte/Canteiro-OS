'use client';

/**
 * EQUIPE PRÓPRIA — a gente CLT da empresa.
 *
 * ⛔ Não se confunde com Empreiteiros: aqui é vínculo de emprego, com admissão,
 * treinamento e EPI entregue. Lá é contrato de resultado. Misturar as duas
 * listas seria justamente o erro que o jurídico mandou desfazer.
 */

import { useMundo } from '@/lib/store';
import { Cartao, Etiqueta, Linha, Sala, TituloSecao, Vazio } from '@/components/ui';
import { CartaoIntegracao } from '@/components/cartao-integracao';
import { Foto } from '@/components/imagem';
import { data, dias, plural, vencimento } from '@/lib/formato';
import { diasAte, diasDesde } from '@/data/seed';

export default function Equipe() {
  const mundo = useMundo();
  const ativos = mundo.colaboradores.filter((c) => c.estado === 'ativo');

  return (
    <div className="mx-auto max-w-5xl">
      <Sala
        titulo="Equipe própria"
        linha="Os colaboradores contratados pela empresa, sua alocação por obra, os treinamentos com validade e o EPI entregue com assinatura."
        numero={String(ativos.length)}
        rotuloNumero="Em atividade"
        tomNumero="chalk"
      />

      <div className="mb-6">
        <Foto nome="cena-projeto" altura="faixa" legenda="ilustrativa" />
      </div>

      <section className="mb-8">
        <TituloSecao>Colaboradores</TituloSecao>
        <Cartao>
          {mundo.colaboradores.map((c) => {
            const obra = mundo.obras.find((o) => o.id === c.obraId)!;
            const meus = mundo.treinamentos.filter((t) => t.colaboradorId === c.id);
            const vencendo = meus.filter((t) => diasAte(t.validoAte) <= 60);
            return (
              <Linha
                key={c.id}
                titulo={c.nome}
                subtitulo={`${c.funcao} · ${obra.nome} · na casa há ${dias(diasDesde(c.admitidoEm))}`}
                etiquetas={
                  <>
                    <Etiqueta tom={c.estado === 'ativo' ? 'olive' : 'gold'}>
                      {c.estado === 'ativo' ? 'ativo' : 'afastado'}
                    </Etiqueta>
                    <Etiqueta tom="neutro">
                      {plural(meus.length, 'treinamento', 'treinamentos')}
                    </Etiqueta>
                    {vencendo.length > 0 ? (
                      <Etiqueta tom="gold">
                        {plural(vencendo.length, 'vence em breve', 'vencem em breve')}
                      </Etiqueta>
                    ) : null}
                  </>
                }
              />
            );
          })}
        </Cartao>
      </section>

      <section className="mb-8">
        <TituloSecao>Treinamentos com validade</TituloSecao>
        <Cartao>
          {mundo.treinamentos
            .map((t) => ({ t, restam: diasAte(t.validoAte) }))
            .sort((a, b) => a.restam - b.restam)
            .slice(0, 14)
            .map(({ t, restam }) => {
              const c = mundo.colaboradores.find((x) => x.id === t.colaboradorId)!;
              return (
                <Linha
                  key={t.id}
                  titulo={t.nome}
                  subtitulo={`${c.nome} · feito em ${data(t.em)} · ${t.cargaHoras} h`}
                  valor={vencimento(restam)}
                  valorTom={restam < 0 ? 'rust' : restam <= 60 ? 'gold' : undefined}
                />
              );
            })}
        </Cartao>
      </section>

      <section className="mb-8">
        <TituloSecao>EPI entregue</TituloSecao>
        {mundo.episEntregues.length === 0 ? (
          <Vazio
            titulo="Nenhuma entrega registrada."
            dica="A ficha de entrega é o que o auditor pede primeiro."
          />
        ) : (
          <Cartao>
            {mundo.episEntregues.slice(0, 12).map((e) => (
              <Linha
                key={e.id}
                titulo={e.item}
                subtitulo={`${e.pessoaNome} · entregue em ${data(e.em)}`}
                etiquetas={
                  <Etiqueta tom={e.assinado ? 'olive' : 'rust'}>
                    {e.assinado ? 'ficha assinada' : 'sem assinatura'}
                  </Etiqueta>
                }
              />
            ))}
          </Cartao>
        )}
        <p className="mt-2 text-[13px] leading-snug text-concrete">
          {plural(
            mundo.episEntregues.filter((e) => !e.assinado).length,
            'entrega sem assinatura',
            'entregas sem assinatura',
          )}{' '}
          na base — cada uma é uma linha a menos no maço que o auditor pede.
        </p>
      </section>

      <CartaoIntegracao
        titulo="Folha, eSocial e ponto eletrônico"
        descricao="Admissão, folha e eSocial integram com o seu sistema de RH e com a contabilidade. O Canteiro guarda a alocação por obra, o treinamento e o EPI — o vínculo continua sendo registrado onde já é."
      />
    </div>
  );
}
