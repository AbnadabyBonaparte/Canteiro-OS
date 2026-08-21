'use client';

/**
 * A MEMÓRIA — o "banco" desta vitrine.
 *
 * ⛔ Sem banco, sem auth, sem Supabase. O estado vive em memória e some ao
 * recarregar, voltando ao seed. **Isso é proposital**: a demonstração precisa
 * contar a mesma história toda vez, e ninguém pode confundir esta vitrine com
 * o produto (ver README, primeira linha).
 *
 * Sem biblioteca de estado: `useSyncExternalStore` é da própria React e basta.
 * No produto, quem guarda isto é Postgres com RLS — ver docs/MIGRACAO.md.
 */

import { useSyncExternalStore } from 'react';
import {
  MUNDO,
  type Compra,
  type EntradaDiario,
  type Empreiteiro,
  type EstadoResposta,
  type Glosa,
  type Medicao,
  type Mundo,
  type Proposta,
  type ReguaConcentracao,
  diasAtras,
} from '@/data/seed';

type Ouvinte = () => void;

let estado: Mundo = MUNDO;
const ouvintes = new Set<Ouvinte>();

function avisar(): void {
  for (const o of ouvintes) o();
}

function assinar(o: Ouvinte): () => void {
  ouvintes.add(o);
  return () => {
    ouvintes.delete(o);
  };
}

function ler(): Mundo {
  return estado;
}

/** O servidor renderiza sempre o seed — igual ao primeiro quadro do cliente. */
function lerNoServidor(): Mundo {
  return MUNDO;
}

/** O mundo inteiro, reativo. */
export function useMundo(): Mundo {
  return useSyncExternalStore(assinar, ler, lerNoServidor);
}

// ─────────────────────────────────────────────────────────────────────────────
// ATOS — cada um é o que no produto seria uma Server Action com permissão
// ─────────────────────────────────────────────────────────────────────────────

let contador = 0;
function novoId(prefixo: string): string {
  contador += 1;
  return `${prefixo}-novo-${contador}`;
}

export interface RascunhoDiario {
  readonly obraId: string;
  readonly frenteId: string;
  readonly climaId: string;
  readonly efetivo: number;
  readonly motivos: readonly string[];
  readonly gravidadeId: string;
  readonly observacao: string;
  readonly temFoto: boolean;
  readonly autor: string;
  readonly hora: string;
}

/** Registrar no diário. O registro nasce e não se edita. */
export function registrarNoDiario(r: RascunhoDiario): string {
  const id = novoId('di');
  const entrada: EntradaDiario = {
    id,
    obraId: r.obraId,
    data: diasAtras(0),
    hora: r.hora,
    autor: r.autor,
    climaId: r.climaId,
    frenteId: r.frenteId,
    efetivo: r.efetivo,
    motivos: r.motivos,
    gravidadeId: r.gravidadeId,
    observacao: r.observacao,
    temFoto: r.temFoto,
    cancelada: null,
  };
  estado = { ...estado, diario: [entrada, ...estado.diario] };
  avisar();
  return id;
}

/**
 * ⭐ O LIVRO IMUTÁVEL: não existe excluir. Existe **cancelar com motivo**, e o
 * registro cancelado continua à vista, riscado, com quem cancelou e por quê.
 * É a mesma física do `occ` do Business OS — fato consumado não se apaga.
 */
export function cancelarEntradaDoDiario(id: string, motivo: string, por: string): void {
  estado = {
    ...estado,
    diario: estado.diario.map((e) =>
      e.id === id && e.cancelada === null
        ? { ...e, cancelada: { motivo, em: diasAtras(0), por } }
        : e,
    ),
  };
  avisar();
}

export interface RascunhoProposta {
  readonly obraId: string;
  readonly objeto: string;
  readonly frenteId: string;
  readonly especialidadeId: string;
  readonly unidade: string;
  readonly quantidade: number;
  readonly valorGlobalCents: number;
  readonly prazoDias: number;
  readonly inicioPrevisto: string;
  readonly encarregado: string;
  readonly convidados: readonly string[];
}

/**
 * Abrir uma PROPOSTA DE EMPREITA — objeto, valor global e prazo.
 *
 * ⛔ Ninguém responde por ninguém: todos os convidados nascem sem resposta.
 * ⚖️ A proposta descreve um RESULTADO a entregar, nunca um tempo a cumprir.
 */
export function abrirProposta(r: RascunhoProposta): string {
  const id = novoId('p');
  const proposta: Proposta = {
    id,
    obraId: r.obraId,
    objeto: r.objeto,
    frenteId: r.frenteId,
    especialidadeId: r.especialidadeId,
    unidade: r.unidade,
    quantidade: r.quantidade,
    valorGlobalCents: r.valorGlobalCents,
    prazoDias: r.prazoDias,
    inicioPrevisto: r.inicioPrevisto,
    abertaEm: diasAtras(0),
    encarregado: r.encarregado,
    respostas: r.convidados.map((empreiteiroId) => ({
      empreiteiroId,
      estado: 'sem-resposta' as EstadoResposta,
      hora: null,
      motivo: null,
    })),
  };
  estado = { ...estado, propostas: [proposta, ...estado.propostas] };
  avisar();
  return id;
}

/**
 * ⚠️ A resposta é do EMPREITEIRO. Na vitrine o botão existe para a
 * demonstração andar; no produto, quem carimba `recusou` é ele, com a permissão
 * dele — um "não" preenchido por outra pessoa não é prova, é falsificação, e
 * destrói o valor de todo o resto.
 */
export function responderProposta(
  propostaId: string,
  empreiteiroId: string,
  novoEstado: EstadoResposta,
  motivo: string | null,
  hora: string,
): void {
  estado = {
    ...estado,
    propostas: estado.propostas.map((p) =>
      p.id !== propostaId
        ? p
        : {
            ...p,
            respostas: p.respostas.map((r) =>
              r.empreiteiroId === empreiteiroId ? { ...r, estado: novoEstado, motivo, hora } : r,
            ),
          },
    ),
  };
  avisar();
}

export interface RascunhoEmpreiteiro {
  readonly nome: string;
  readonly especialidadeId: string;
  readonly modalidadeId: string;
  readonly outrasEmpresas: number;
  readonly ferramentaPropria: boolean;
}

export function cadastrarEmpreiteiro(r: RascunhoEmpreiteiro): string {
  const id = novoId('p');
  const e: Empreiteiro = { id, avaliacao: 0, ...r };
  estado = { ...estado, empreiteiros: [e, ...estado.empreiteiros] };
  avisar();
  return id;
}

// ─────────────────────────────────────────────────────────────────────────────
// v2 — UMA AÇÃO QUE FUNCIONA EM CADA SALA
// ─────────────────────────────────────────────────────────────────────────────

/** Abrir requisição de material. O resto do ciclo é honesto, não simulado. */
export function abrirRequisicao(r: {
  obraId: string;
  familiaId: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  requisitadaPor: string;
}): string {
  const id = novoId('co');
  const compra: Compra = {
    id,
    obraId: r.obraId,
    familiaId: r.familiaId,
    descricao: r.descricao,
    unidade: r.unidade,
    quantidade: r.quantidade,
    requisitadaEm: diasAtras(0),
    requisitadaPor: r.requisitadaPor,
    estado: 'requisitada',
    cotacoes: [],
    fornecedorEscolhido: null,
    valorCents: 0,
    recebidaEm: null,
    divergencia: 0,
    motivoCancelamento: null,
  };
  estado = { ...estado, compras: [compra, ...estado.compras] };
  avisar();
  return id;
}

/**
 * ⛔ Requisição não se apaga: cancela-se COM MOTIVO, e ela continua na lista.
 * A física do livro imutável, a mesma do diário.
 */
export function cancelarRequisicao(id: string, motivo: string): void {
  estado = {
    ...estado,
    compras: estado.compras.map((c) =>
      c.id === id && c.motivoCancelamento === null
        ? { ...c, estado: 'cancelada' as const, motivoCancelamento: motivo }
        : c,
    ),
  };
  avisar();
}

/** Registrar a resposta a um ofício do órgão. O prazo para de correr aqui. */
export function responderOficio(id: string, responsavel: string): void {
  estado = {
    ...estado,
    oficios: estado.oficios.map((o) =>
      o.id === id && o.respondidoEm === null
        ? { ...o, respondidoEm: diasAtras(0), estado: 'respondido' as const, responsavel }
        : o,
    ),
  };
  avisar();
}

/** Dar a entrega da empreita por aceita — é o termo de aceite, com data. */
export function aceitarEntrega(empreitaId: string): void {
  estado = {
    ...estado,
    empreitas: estado.empreitas.map((e) =>
      e.id === empreitaId && e.aceiteEm === null
        ? {
            ...e,
            estado: 'entregue' as const,
            aceiteEm: diasAtras(0),
            marcos: e.marcos.map((m, i) =>
              i === e.marcos.length - 1 ? { ...m, pagoEm: null } : m,
            ),
          }
        : e,
    ),
  };
  avisar();
}

/** Lançar glosa numa medição. O motivo é obrigatório — quem chama garante. */
export function lancarGlosa(medicaoId: string, glosa: Glosa): void {
  estado = {
    ...estado,
    medicoes: estado.medicoes.map((m) => {
      if (m.id !== medicaoId) return m;
      const glosas = [...m.glosas, glosa];
      const total = glosas.reduce((s, g) => s + g.valorCents, 0);
      const aceito = Math.max(0, m.executadoCents - total);
      const atualizada: Medicao = {
        ...m,
        glosas,
        aceitoCents: aceito,
        faturadoCents: Math.min(m.faturadoCents, aceito),
        estado: 'aceita-parcial',
      };
      return atualizada;
    }),
  };
  avisar();
}

/** Fechar a medição em curso: o que estava executado passa a ser enviado. */
export function fecharMedicao(medicaoId: string): void {
  estado = {
    ...estado,
    medicoes: estado.medicoes.map((m) =>
      m.id === medicaoId && m.estado === 'em-curso' ? { ...m, estado: 'enviada' } : m,
    ),
  };
  avisar();
}

/**
 * ⚖️ A RÉGUA DE CONCENTRAÇÃO — quatro parâmetros, todos do tenant.
 *
 * Quem define é o jurídico da empresa. ⛔ O sistema não sugere número nenhum, e
 * a tela de Configurações diz isso com todas as letras: sugerir seria opinar
 * sobre matéria privativa de advogado.
 */
export function definirReguaConcentracao(r: ReguaConcentracao): void {
  estado = { ...estado, reguaConcentracao: r };
  avisar();
}

/** Volta tudo ao seed — o botão de recomeçar a demonstração. */
export function recomecar(): void {
  estado = MUNDO;
  contador = 0;
  avisar();
}
