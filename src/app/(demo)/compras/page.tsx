'use client';

/**
 * COMPRAS E MATERIAIS — requisição → cotação → pedido → recebimento.
 *
 * ⭐ O recebimento com DIVERGÊNCIA é o dado que ninguém guarda e todo mundo
 * perde: chegou menos do que foi pedido, alguém aceitou no grito, e o custo da
 * obra some. Aqui ele fica na lista, com o número.
 *
 * ⛔ Requisição não se apaga: cancela-se COM MOTIVO, e ela continua à vista.
 */

import { useMemo, useState } from 'react';
import { abrirRequisicao, cancelarRequisicao, useMundo } from '@/lib/store';
import {
  Botao,
  Campo,
  Cartao,
  Confirmar,
  Etiqueta,
  Linha,
  Rotulo,
  Sala,
  Selecione,
  TituloSecao,
  Vazio,
} from '@/components/ui';
import { CartaoIntegracao } from '@/components/cartao-integracao';
import { FAMILIAS_DE_MATERIAL, UNIDADES, nomeDe } from '@/data/taxonomias';
import { data, dinheiro, dinheiroCurto, numero, pct, plural } from '@/lib/formato';

const ESTADO = {
  requisitada: { rotulo: 'Requisitada', tom: 'gold' },
  cotando: { rotulo: 'Em cotação', tom: 'gold' },
  pedida: { rotulo: 'Pedido feito', tom: 'neutro' },
  recebida: { rotulo: 'Recebida', tom: 'olive' },
  cancelada: { rotulo: 'Cancelada', tom: 'rust' },
} as const;

export default function Compras() {
  const mundo = useMundo();
  const [obraFiltro, setObraFiltro] = useState('todas');
  const [nova, setNova] = useState(false);
  const [aCancelar, setACancelar] = useState<string | null>(null);

  const [obraId, setObraId] = useState(mundo.obras[0].id);
  const [familiaId, setFamiliaId] = useState(FAMILIAS_DE_MATERIAL[0].id);
  const [descricao, setDescricao] = useState('');
  const [unidade, setUnidade] = useState(UNIDADES[0].nome);
  const [quantidade, setQuantidade] = useState('10');

  const lista = useMemo(
    () =>
      mundo.compras
        .filter((c) => obraFiltro === 'todas' || c.obraId === obraFiltro)
        .sort((a, b) => b.requisitadaEm.localeCompare(a.requisitadaEm)),
    [mundo.compras, obraFiltro],
  );

  /** ⭐ A curva ABC: o que pesa no bolso, por família de material. */
  const curva = useMemo(() => {
    const porFamilia = new Map<string, number>();
    for (const c of mundo.compras) {
      if (c.estado === 'cancelada' || c.valorCents === 0) continue;
      if (obraFiltro !== 'todas' && c.obraId !== obraFiltro) continue;
      porFamilia.set(c.familiaId, (porFamilia.get(c.familiaId) ?? 0) + c.valorCents);
    }
    const total = [...porFamilia.values()].reduce((a, b) => a + b, 0);
    return {
      total,
      linhas: [...porFamilia.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([id, v]) => ({ id, valor: v, pct: total > 0 ? (v / total) * 100 : 0 })),
    };
  }, [mundo.compras, obraFiltro]);

  const abertas = lista.filter((c) => c.estado === 'requisitada' || c.estado === 'cotando').length;
  const divergentes = lista.filter((c) => c.divergencia !== 0);

  return (
    <div className="mx-auto max-w-5xl">
      <Sala
        titulo="Compras e materiais"
        linha="Da requisição do canteiro até o material na obra: cotação com três fornecedores, pedido, recebimento e a divergência quando ela existe."
        numero={String(abertas)}
        rotuloNumero="Aguardando cotação"
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[240px_1fr]">
        <Selecione
          etiqueta="Obra"
          valor={obraFiltro}
          onChange={setObraFiltro}
          opcoes={[
            { id: 'todas', nome: 'Todas as obras' },
            ...mundo.obras.map((o) => ({ id: o.id, nome: o.nome })),
          ]}
        />
        <div className="flex items-end justify-end">
          <Botao tom="secundario" onClick={() => setNova(!nova)}>
            {nova ? 'Fechar' : 'Abrir requisição'}
          </Botao>
        </div>
      </div>

      {nova ? (
        <Cartao className="mb-6 space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Selecione
              etiqueta="Obra"
              valor={obraId}
              onChange={setObraId}
              opcoes={mundo.obras.map((o) => ({ id: o.id, nome: o.nome }))}
            />
            <Selecione
              etiqueta="Família"
              valor={familiaId}
              onChange={setFamiliaId}
              opcoes={FAMILIAS_DE_MATERIAL}
            />
          </div>
          <Campo
            etiqueta="O que precisa"
            valor={descricao}
            onChange={setDescricao}
            placeholder="Descrição do material, como o canteiro pede"
          />
          <div className="grid grid-cols-2 gap-3">
            <Selecione
              etiqueta="Unidade"
              valor={unidade}
              onChange={setUnidade}
              opcoes={UNIDADES.map((u) => ({ id: u.nome, nome: u.nome }))}
            />
            <Campo
              etiqueta="Quantidade"
              valor={quantidade}
              onChange={setQuantidade}
              tipo="number"
            />
          </div>
          <Botao
            tom="principal"
            larga
            disabled={descricao.trim().length < 3}
            onClick={() => {
              abrirRequisicao({
                obraId,
                familiaId,
                descricao: descricao.trim(),
                unidade,
                quantidade: Math.max(1, Number(quantidade) || 1),
                requisitadaPor: mundo.obras.find((o) => o.id === obraId)!.encarregado,
              });
              setDescricao('');
              setNova(false);
            }}
          >
            Abrir requisição
          </Botao>
        </Cartao>
      ) : null}

      <section className="mb-8">
        <TituloSecao>
          O que mais pesa {obraFiltro === 'todas' ? 'na carteira' : 'nesta obra'}
        </TituloSecao>
        <Cartao className="p-5">
          {curva.linhas.length === 0 ? (
            <Vazio
              titulo="Nenhuma compra fechada ainda."
              dica="A curva aparece quando houver pedido com valor."
            />
          ) : (
            <>
              <div className="mb-4 flex items-baseline justify-between">
                <Rotulo>Total comprado</Rotulo>
                <span className="num text-[20px] text-chalk">{dinheiro(curva.total)}</span>
              </div>
              <div className="space-y-2.5">
                {curva.linhas.map((l) => (
                  <div key={l.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[14px] text-chalk">
                        {nomeDe(FAMILIAS_DE_MATERIAL, l.id)}
                      </span>
                      <span className="num text-[13px] text-concrete">
                        {dinheiroCurto(l.valor)} · {pct(l.pct)}
                      </span>
                    </div>
                    <div className="regua mt-1 h-2.5">
                      <div className="regua-faixa regua-pago" style={{ width: `${l.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Cartao>
      </section>

      {divergentes.length > 0 ? (
        <section className="mb-8">
          <TituloSecao>Recebimentos com divergência</TituloSecao>
          <Cartao destaque>
            {divergentes.map((c) => (
              <Linha
                key={c.id}
                titulo={c.descricao}
                subtitulo={`${mundo.obras.find((o) => o.id === c.obraId)!.nome} · recebido em ${data(c.recebidaEm!)}`}
                valor={`${numero(c.divergencia)} ${c.unidade}`}
                valorTom="rust"
                etiquetas={<Etiqueta tom="rust">chegou menos do que foi pedido</Etiqueta>}
              />
            ))}
          </Cartao>
          <p className="mt-2 text-[13px] leading-snug text-concrete">
            Cada linha aqui é dinheiro que saiu do orçamento da obra sem material dentro dela.
          </p>
        </section>
      ) : null}

      <section>
        <TituloSecao>{plural(lista.length, 'requisição', 'requisições')}</TituloSecao>
        {lista.length === 0 ? (
          <Vazio titulo="Nenhuma requisição nesta obra." dica="Abra a primeira no botão acima." />
        ) : (
          <Cartao>
            {lista.slice(0, 40).map((c) => {
              const obra = mundo.obras.find((o) => o.id === c.obraId)!;
              const forn = mundo.fornecedores.find((f) => f.id === c.fornecedorEscolhido);
              const melhor = [...c.cotacoes].sort((a, b) => a.valorCents - b.valorCents);
              return (
                <Linha
                  key={c.id}
                  titulo={c.descricao}
                  subtitulo={
                    <>
                      {obra.nome} · {numero(c.quantidade)} {c.unidade} · pedido por{' '}
                      {c.requisitadaPor} em {data(c.requisitadaEm)}
                      {forn ? ` · ${forn.nome}` : ''}
                      {c.motivoCancelamento ? ` · cancelada: ${c.motivoCancelamento}` : ''}
                    </>
                  }
                  valor={c.valorCents > 0 ? dinheiro(c.valorCents) : '—'}
                  etiquetas={
                    <>
                      <Etiqueta tom={ESTADO[c.estado].tom}>{ESTADO[c.estado].rotulo}</Etiqueta>
                      <Etiqueta tom="neutro">{nomeDe(FAMILIAS_DE_MATERIAL, c.familiaId)}</Etiqueta>
                      {melhor.length > 1 ? (
                        <Etiqueta tom="neutro">
                          {melhor.length} cotações · melhor {dinheiroCurto(melhor[0].valorCents)}
                        </Etiqueta>
                      ) : null}
                      {c.divergencia !== 0 ? (
                        <Etiqueta tom="rust">
                          divergência {numero(c.divergencia)} {c.unidade}
                        </Etiqueta>
                      ) : null}
                    </>
                  }
                  acao={
                    c.estado === 'requisitada' || c.estado === 'cotando' ? (
                      <Botao tom="discreto" onClick={() => setACancelar(c.id)}>
                        Cancelar
                      </Botao>
                    ) : null
                  }
                />
              );
            })}
          </Cartao>
        )}
      </section>

      <div className="mt-6">
        <CartaoIntegracao
          titulo="Nota fiscal de entrada e estoque fiscal"
          descricao="A entrada fiscal do material integra com o seu sistema. O Canteiro registra o que foi pedido, o que chegou e a diferença — o livro fiscal continua sendo o de sempre."
        />
      </div>

      <Confirmar
        aberto={aCancelar !== null}
        titulo="Cancelar esta requisição"
        descricao="A requisição não é apagada. Ela fica na lista, marcada como cancelada, com o motivo à vista — é assim que se descobre depois por que o material não chegou."
        rotuloMotivo="Motivo do cancelamento"
        rotuloAcao="Cancelar com motivo"
        aoConfirmar={(motivo) => {
          if (aCancelar) cancelarRequisicao(aCancelar, motivo);
        }}
        aoFechar={() => setACancelar(null)}
      />
    </div>
  );
}
