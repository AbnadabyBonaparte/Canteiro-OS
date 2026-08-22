'use client';

/**
 * NOVA SAÍDA — a guia de transporte no celular do encarregado.
 *
 * ⭐⭐ **A tela inteira existe para caber numa mão, de pé, no sol.** Alvo de 52px,
 * uma decisão por vez, e o motivo do impedimento escrito ANTES do botão — não
 * depois, na recusa da SEFAZ, com a máquina parada no pátio.
 *
 * ⛔ **A tela não escolhe código fiscal.** Ela mostra o cardápio que alguém
 * assinou. O que não foi assinado aparece em cinza, com o motivo, e não emite.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { cardapio, operacaoDe, validar } from '@/lib/remessa';
import { registrarRemessa, useMundo } from '@/lib/store';
import { dinheiro } from '@/lib/formato';
import {
  Botao,
  Campo,
  Cartao,
  Confirmar,
  Escolha,
  Sala,
  Selecione,
  TituloSecao,
} from '@/components/ui';
import { Maquina, Seta } from '@/components/icones';

const OUTRO = 'outro';

export default function NovaSaida() {
  const mundo = useMundo();
  const router = useRouter();

  const [busca, setBusca] = useState('');
  const [equipamentoId, setEquipamentoId] = useState('');
  const [operacaoId, setOperacaoId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [destinoLivre, setDestinoLivre] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [motoristaId, setMotoristaId] = useState('');
  const [confirmando, setConfirmando] = useState(false);

  const equipamento = mundo.equipamentos.find((e) => e.id === equipamentoId);
  const obraDeOrigem = mundo.obras.find((o) => o.id === equipamento?.obraId);
  const origemRotulo = obraDeOrigem ? `Obra ${obraDeOrigem.nome}` : '';

  const achados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (termo.length < 2) return mundo.equipamentos.slice(0, 4);
    return mundo.equipamentos
      .filter(
        (e) => e.nome.toLowerCase().includes(termo) || e.patrimonio.toLowerCase().includes(termo),
      )
      .slice(0, 6);
  }, [busca, mundo.equipamentos]);

  const destinoRotulo =
    destinoId === OUTRO ? destinoLivre : (mundo.obras.find((o) => o.id === destinoId)?.nome ?? '');
  const destinoFinal =
    destinoId === OUTRO ? destinoLivre : destinoRotulo ? `Obra ${destinoRotulo}` : '';

  const rascunho = {
    operacaoId,
    equipamentoId,
    origemRotulo,
    destinoRotulo: destinoFinal,
    veiculoId,
    motoristaId,
  };
  const impedimentos = validar(mundo, rascunho);
  const operacao = operacaoDe(mundo, operacaoId);
  const itens = cardapio(mundo);

  function gerar() {
    if (!equipamento || !operacao) return;
    const id = registrarRemessa({
      operacaoId,
      origemObraId: equipamento.obraId,
      origemRotulo,
      destinoObraId: destinoId === OUTRO ? null : destinoId,
      destinoRotulo: destinoFinal,
      veiculoId,
      motoristaId,
      itens: [
        {
          equipamentoId: equipamento.id,
          descricao: `${equipamento.nome} · ${equipamento.patrimonio}`,
          quantidade: 1,
          unidade: 'UN',
          valorReferenciaCents: equipamento.valorReferenciaCents,
        },
      ],
      por: 'Sr. Aparecido',
    });
    if (id) router.push(`/remessas/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Sala
        titulo="Nova saída"
        linha="O que sai, de onde, para onde, em que caminhão e com quem. Cinco respostas — e a guia sai."
      />

      {/* ── 1. O QUE VAI SAIR ──────────────────────────────────────────────── */}
      <section className="mb-8">
        <TituloSecao>1 · O que vai sair</TituloSecao>
        {equipamento ? (
          <Cartao className="p-4">
            <div className="flex items-start gap-3">
              <Maquina className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] leading-snug text-chalk">{equipamento.nome}</p>
                <p className="mt-0.5 text-[13px] text-concrete">
                  {equipamento.patrimonio} · está em {origemRotulo || 'lugar não informado'} · valor
                  de referência {dinheiro(equipamento.valorReferenciaCents)}
                </p>
              </div>
              <Botao
                tom="discreto"
                onClick={() => {
                  setEquipamentoId('');
                  setBusca('');
                }}
              >
                Trocar
              </Botao>
            </div>
          </Cartao>
        ) : (
          <>
            <Campo
              etiqueta="Procure pelo nome ou pelo número de patrimônio"
              valor={busca}
              onChange={setBusca}
              placeholder="escavadeira, GE-007…"
            />
            <div className="mt-3 grid gap-2">
              {achados.length === 0 ? (
                <p className="text-[13px] text-concrete">
                  Nenhuma máquina com esse nome. Procure pelo número de patrimônio.
                </p>
              ) : (
                achados.map((e) => {
                  const obra = mundo.obras.find((o) => o.id === e.obraId);
                  return (
                    <Escolha key={e.id} marcada={false} onClick={() => setEquipamentoId(e.id)}>
                      <span className="block text-chalk">{e.nome}</span>
                      <span className="mt-0.5 block text-[13px] text-concrete">
                        {e.patrimonio} · {obra ? `Obra ${obra.nome}` : 'sem obra'}
                      </span>
                    </Escolha>
                  );
                })
              )}
            </div>
          </>
        )}
      </section>

      {/* ── 2. PARA ONDE ───────────────────────────────────────────────────── */}
      <section className="mb-8">
        <TituloSecao>2 · Para onde vai</TituloSecao>
        <p className="-mt-3 mb-4 text-[13px] leading-snug text-concrete">
          De onde sai já é sabido: {origemRotulo || 'escolha primeiro o que vai sair'}.
        </p>
        <div className="grid gap-2">
          {mundo.obras
            .filter((o) => o.id !== equipamento?.obraId)
            .map((o) => (
              <Escolha key={o.id} marcada={destinoId === o.id} onClick={() => setDestinoId(o.id)}>
                Obra {o.nome}
              </Escolha>
            ))}
          <Escolha marcada={destinoId === OUTRO} onClick={() => setDestinoId(OUTRO)}>
            Outro lugar — oficina, pátio, cliente
          </Escolha>
        </div>
        {destinoId === OUTRO ? (
          <div className="mt-3">
            <Campo
              etiqueta="Para onde, então"
              valor={destinoLivre}
              onChange={setDestinoLivre}
              placeholder="Oficina parceira — Serra Azul"
            />
          </div>
        ) : null}
      </section>

      {/* ── 3. O CARDÁPIO ──────────────────────────────────────────────────── */}
      <section className="mb-8">
        <TituloSecao>3 · Qual é a operação</TituloSecao>
        <p className="-mt-3 mb-4 text-[13px] leading-snug text-concrete">
          O código fiscal de cada uma é <span className="text-chalk">ilustrativo</span> e quem
          define é o contador da empresa. O que ele ainda não assinou aparece aqui, em cinza, e não
          emite nada.
        </p>
        <div className="grid gap-2">
          {itens.map(({ operacao: op, usavel, nota }) =>
            usavel ? (
              <Escolha
                key={op.id}
                marcada={operacaoId === op.id}
                onClick={() => setOperacaoId(op.id)}
              >
                <span className="block text-chalk">{op.rotulo}</span>
                <span className="mt-0.5 block text-[13px] text-concrete">
                  {op.natureza} ·{' '}
                  {op.exigeManifesto ? 'sai com nota e manifesto' : 'sai só com nota'}
                  {op.exigeRetorno && op.prazoRetornoDias !== null
                    ? ` · cobra volta em ${op.prazoRetornoDias} dias`
                    : ''}
                </span>
              </Escolha>
            ) : (
              <div
                key={op.id}
                aria-disabled="true"
                className="min-h-[52px] border border-line bg-sunken/40 px-3 py-2 text-left"
              >
                <span className="block text-[15px] leading-tight text-concrete-dim">
                  {op.rotulo}
                </span>
                <span className="mt-0.5 block text-[13px] text-concrete-dim">{nota}</span>
              </div>
            ),
          )}
        </div>
      </section>

      {/* ── 4. O CAMINHÃO E O MOTORISTA ────────────────────────────────────── */}
      <section className="mb-8">
        <TituloSecao>4 · Quem leva</TituloSecao>
        <div className="grid gap-4">
          <Selecione
            etiqueta="Caminhão"
            valor={veiculoId}
            onChange={setVeiculoId}
            opcoes={[
              { id: '', nome: 'Escolha o caminhão' },
              ...mundo.veiculos.map((v) => ({
                id: v.id,
                nome: `${v.placa} · ${v.tipo}`,
              })),
            ]}
          />
          <Selecione
            etiqueta="Motorista"
            valor={motoristaId}
            onChange={setMotoristaId}
            opcoes={[
              { id: '', nome: 'Escolha o motorista' },
              ...mundo.motoristas.map((m) => ({ id: m.id, nome: m.nome })),
            ]}
          />
        </div>
      </section>

      {/* ── O QUE FALTA, E O BOTÃO ─────────────────────────────────────────── */}
      {impedimentos.length > 0 ? (
        <Cartao className="mb-4 p-4">
          <p className="placa text-[11px] text-concrete">O que falta para a guia sair</p>
          <ul className="mt-2 space-y-1.5">
            {impedimentos.map((i) => (
              <li key={i.campo} className="text-[13px] leading-snug text-concrete">
                — {i.frase}
              </li>
            ))}
          </ul>
        </Cartao>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Botao
          tom="principal"
          larga
          disabled={impedimentos.length > 0}
          onClick={() => setConfirmando(true)}
        >
          Gerar guia
          <Seta className="h-4 w-4" />
        </Botao>
        <Link href="/remessas" className="sm:w-auto">
          <Botao tom="secundario" larga>
            Cancelar
          </Botao>
        </Link>
      </div>

      <Confirmar
        aberto={confirmando}
        titulo="Gerar a guia"
        descricao={
          operacao
            ? `Vai sair ${equipamento?.nome ?? ''} de ${origemRotulo} para ${destinoFinal}, por "${operacao.rotulo}". ` +
              (operacao.exigeManifesto
                ? 'Saem dois documentos: a nota e o manifesto. O manifesto fica em aberto até alguém marcar "Chegou" na entrega.'
                : 'Sai um documento: a nota. Esta operação não pede manifesto.') +
              ' Documento emitido não se apaga — corrigir é cancelar com motivo, à vista.'
            : ''
        }
        rotuloAcao="Gerar guia"
        tomAcao="principal"
        aoConfirmar={gerar}
        aoFechar={() => setConfirmando(false)}
      />
    </div>
  );
}
