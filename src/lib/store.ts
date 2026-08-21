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
  type Chamado,
  type EntradaDiario,
  type EstadoResposta,
  type Glosa,
  type Medicao,
  type Mundo,
  type Prestador,
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

export interface RascunhoChamado {
  readonly obraId: string;
  readonly especialidadeId: string;
  readonly vagas: number;
  readonly dataServico: string;
  readonly encarregado: string;
  readonly convidados: readonly string[];
}

/** Abrir um chamado. Ninguém responde por ninguém: todos nascem sem resposta. */
export function abrirChamado(r: RascunhoChamado): string {
  const id = novoId('c');
  const chamado: Chamado = {
    id,
    obraId: r.obraId,
    especialidadeId: r.especialidadeId,
    vagas: r.vagas,
    dataServico: r.dataServico,
    abertoEm: diasAtras(0),
    encarregado: r.encarregado,
    respostas: r.convidados.map((prestadorId) => ({
      prestadorId,
      estado: 'sem-resposta' as EstadoResposta,
      hora: null,
      motivo: null,
    })),
  };
  estado = { ...estado, chamados: [chamado, ...estado.chamados] };
  avisar();
  return id;
}

/**
 * ⚠️ A resposta é do PRESTADOR. Na vitrine o botão existe para a demonstração
 * andar; no produto, quem carimba `recusou` é ele, com a permissão dele — um
 * "não" preenchido por outra pessoa destrói o valor da prova.
 */
export function responderChamado(
  chamadoId: string,
  prestadorId: string,
  novoEstado: EstadoResposta,
  motivo: string | null,
  hora: string,
): void {
  estado = {
    ...estado,
    chamados: estado.chamados.map((c) =>
      c.id !== chamadoId
        ? c
        : {
            ...c,
            respostas: c.respostas.map((r) =>
              r.prestadorId === prestadorId ? { ...r, estado: novoEstado, motivo, hora } : r,
            ),
          },
    ),
  };
  avisar();
}

export interface RascunhoPrestador {
  readonly nome: string;
  readonly especialidadeId: string;
  readonly modalidadeId: string;
  readonly outrasEmpresas: number;
  readonly ferramentaPropria: boolean;
}

export function cadastrarPrestador(r: RascunhoPrestador): string {
  const id = novoId('p');
  const p: Prestador = { id, avaliacao: 0, ...r };
  estado = { ...estado, prestadores: [p, ...estado.prestadores] };
  avisar();
  return id;
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
 * ⚖️ A RÉGUA DE VÍNCULO. Quem define é o jurídico da empresa; o sistema não
 * sugere um número — ver a nota na tela de Diaristas.
 */
export function definirReguaVinculo(diarias: number, janelaDias: number): void {
  estado = { ...estado, reguaVinculo: { diarias, janelaDias } };
  avisar();
}

/** Volta tudo ao seed — o botão de recomeçar a demonstração. */
export function recomecar(): void {
  estado = MUNDO;
  contador = 0;
  avisar();
}
