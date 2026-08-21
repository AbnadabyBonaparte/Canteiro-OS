/**
 * O FUNCIONÁRIO DIGITAL — e por que ele não é um texto bonito.
 *
 * ⚖️ LEI 7 NO DESENHO: cada aviso é **calculado** do mundo que está na tela, e
 * carrega a conta que o produziu (`porque`). Não existe frase fixa disfarçada de
 * inteligência: se o número não existe, a linha não aparece. É a mesma doutrina
 * do observador determinístico do Business OS (`packages/engineer`).
 *
 * ⛔ Zero IA externa nesta vitrine. São funções puras sobre o seed.
 */

import type { Mundo, Obra } from '@/data/seed';
import { diasAte, diasDesde } from '@/data/seed';
import { MOTIVOS_DE_GLOSA, TIPOS_DE_DOCUMENTO, nomeDe } from '@/data/taxonomias';
import { data, dias, dinheiro, dinheiroCurto, numero, pct, plural } from './formato';

export type TomAviso = 'rust' | 'gold' | 'olive';

export interface Aviso {
  readonly id: string;
  readonly tom: TomAviso;
  readonly titulo: string;
  readonly detalhe: string;
  /** A conta, por extenso. É o que o "por que isso?" abre. */
  readonly porque: readonly string[];
  /** Onde o número mora, na língua do cliente. */
  readonly fonte: string;
  readonly href: string;
  /** Minutos desde que o observador viu — fixo por aviso, para não vibrar. */
  readonly notadoHaMin: number;
}

function obraDe(mundo: Mundo, id: string): Obra {
  return mundo.obras.find((o) => o.id === id)!;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Medição aceita pelo fiscal e não paga
// ─────────────────────────────────────────────────────────────────────────────

export function medicoesPresas(mundo: Mundo) {
  return mundo.medicoes
    .filter((m) => m.aceitoCents > 0 && m.pagoCents === 0 && m.dataAceite !== null)
    .map((m) => ({ medicao: m, idade: diasDesde(m.dataAceite!) }))
    .sort((a, b) => b.idade - a.idade);
}

export function totalPresoCents(mundo: Mundo): number {
  return medicoesPresas(mundo).reduce((s, x) => s + x.medicao.aceitoCents, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Quanto cada prefeitura demora, de fato, entre o aceite e o dinheiro
// ─────────────────────────────────────────────────────────────────────────────

export interface RitmoDePagamento {
  readonly prefeituraId: string;
  readonly nome: string;
  readonly amostras: number;
  readonly mediaDias: number;
}

export function ritmoDePagamento(mundo: Mundo): RitmoDePagamento[] {
  return mundo.prefeituras
    .map((pref) => {
      const obras = mundo.obras.filter((o) => o.prefeituraId === pref.id).map((o) => o.id);
      const pagas = mundo.medicoes.filter(
        (m) => obras.includes(m.obraId) && m.dataAceite && m.dataPagamento,
      );
      const somaDias = pagas.reduce(
        (s, m) => s + (diasDesde(m.dataAceite!) - diasDesde(m.dataPagamento!)),
        0,
      );
      return {
        prefeituraId: pref.id,
        nome: pref.nome,
        amostras: pagas.length,
        mediaDias: pagas.length === 0 ? 0 : Math.round(somaDias / pagas.length),
      };
    })
    // ⚠️ Sem amostra não se afirma média. Prefeitura sem medição paga não aparece.
    .filter((r) => r.amostras > 0)
    .sort((a, b) => b.mediaDias - a.mediaDias);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Concentração de diárias — a régua é do jurídico da empresa
// ─────────────────────────────────────────────────────────────────────────────

export interface Concentracao {
  readonly prestadorId: string;
  readonly nome: string;
  readonly diariasNaJanela: number;
  readonly obraDominante: string;
  readonly pctNaObraDominante: number;
  readonly encarregadoDominante: string;
  readonly chamados: number;
  readonly recusas: number;
  readonly acimaDaRegua: boolean;
}

export function concentracoes(mundo: Mundo): Concentracao[] {
  const { diarias: teto, janelaDias } = mundo.reguaVinculo;

  return mundo.prestadores
    .map((p) => {
      const naJanela = mundo.diarias.filter(
        (d) => d.prestadorId === p.id && diasDesde(d.data) <= janelaDias,
      );
      if (naJanela.length === 0) return null;

      const porObra = new Map<string, number>();
      const porEncarregado = new Map<string, number>();
      for (const d of naJanela) {
        porObra.set(d.obraId, (porObra.get(d.obraId) ?? 0) + 1);
        porEncarregado.set(d.encarregado, (porEncarregado.get(d.encarregado) ?? 0) + 1);
      }
      const [obraId, qtdObra] = [...porObra.entries()].sort((a, b) => b[1] - a[1])[0];
      const [encarregado] = [...porEncarregado.entries()].sort((a, b) => b[1] - a[1])[0];

      const meus = mundo.chamados.filter((c) =>
        c.respostas.some((r) => r.prestadorId === p.id),
      );
      const recusas = meus.filter((c) =>
        c.respostas.some((r) => r.prestadorId === p.id && r.estado === 'recusou'),
      ).length;

      return {
        prestadorId: p.id,
        nome: p.nome,
        diariasNaJanela: naJanela.length,
        obraDominante: obraDe(mundo, obraId).nome,
        pctNaObraDominante: Math.round((qtdObra / naJanela.length) * 100),
        encarregadoDominante: encarregado,
        chamados: meus.length,
        recusas,
        acimaDaRegua: naJanela.length >= teto,
      };
    })
    .filter((c): c is Concentracao => c !== null)
    .sort((a, b) => b.diariasNaJanela - a.diariasNaJanela);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Documento com validade
// ─────────────────────────────────────────────────────────────────────────────

export function documentosNoPrazo(mundo: Mundo, limiteDias: number) {
  return mundo.documentos
    .map((d) => ({ documento: d, restam: diasAte(d.vence) }))
    .filter((x) => x.restam <= limiteDias)
    .sort((a, b) => a.restam - b.restam);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Insumo consumido × previsto pelo avanço físico
// ─────────────────────────────────────────────────────────────────────────────

export interface DesvioDeInsumo {
  readonly obraId: string;
  readonly obraNome: string;
  readonly descricao: string;
  readonly unidade: string;
  readonly previsto: number;
  readonly consumido: number;
  readonly desvioPct: number;
}

export function desviosDeInsumo(mundo: Mundo): DesvioDeInsumo[] {
  return mundo.consumos
    .map((c) => {
      const obra = obraDe(mundo, c.obraId);
      const item = mundo.itens.find((i) => i.obraId === c.obraId && i.numero === c.itemNumero);
      if (!item) return null;
      const previsto = item.quantidade * (obra.pctFisico / 100);
      if (previsto <= 0) return null;
      return {
        obraId: obra.id,
        obraNome: obra.nome,
        descricao: item.descricao,
        unidade: item.unidade,
        previsto,
        consumido: c.quantidadeConsumida,
        desvioPct: Math.round(((c.quantidadeConsumida - previsto) / previsto) * 100),
      };
    })
    .filter((d): d is DesvioDeInsumo => d !== null)
    .sort((a, b) => b.desvioPct - a.desvioPct);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Diário em falta, e efetivo abaixo do que o cronograma pede
// ─────────────────────────────────────────────────────────────────────────────

export interface FalhaDeDiario {
  readonly obraId: string;
  readonly obraNome: string;
  readonly diasSemDiario: number;
  readonly diasSeguidosComEfetivoBaixo: number;
  readonly efetivoPrevisto: number;
}

export function falhasDeDiario(mundo: Mundo): FalhaDeDiario[] {
  return mundo.obras
    .map((obra) => {
      const registros = mundo.diario
        .filter((e) => e.obraId === obra.id && e.cancelada === null)
        .sort((a, b) => b.data.localeCompare(a.data));

      const diasSemDiario = registros.length === 0 ? 999 : diasDesde(registros[0].data);

      let seguidos = 0;
      for (const r of registros) {
        if (r.efetivo < obra.efetivoPrevisto) seguidos += 1;
        else break;
      }

      return {
        obraId: obra.id,
        obraNome: obra.nome,
        diasSemDiario,
        diasSeguidosComEfetivoBaixo: seguidos,
        efetivoPrevisto: obra.efetivoPrevisto,
      };
    })
    .sort((a, b) => b.diasSemDiario - a.diasSemDiario);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Glosa — quanto e por qual motivo
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoDeGlosa {
  readonly totalCents: number;
  readonly quantidade: number;
  readonly motivoTopId: string | null;
  readonly motivoTopVezes: number;
}

export function resumoDeGlosa(mundo: Mundo): ResumoDeGlosa {
  const todas = mundo.medicoes.flatMap((m) => m.glosas);
  const porMotivo = new Map<string, number>();
  for (const g of todas) porMotivo.set(g.motivoId, (porMotivo.get(g.motivoId) ?? 0) + 1);
  const top = [...porMotivo.entries()].sort((a, b) => b[1] - a[1])[0];
  return {
    totalCents: todas.reduce((s, g) => s + g.valorCents, 0),
    quantidade: todas.length,
    motivoTopId: top?.[0] ?? null,
    motivoTopVezes: top?.[1] ?? 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// O QUADRO DE AVISOS — a composição de tudo acima
// ─────────────────────────────────────────────────────────────────────────────

/** Teto do art. 125 da Lei 14.133/2021 para acréscimo em obra (não em reforma). */
const TETO_ADITIVO_PCT = 25;

export function avisos(mundo: Mundo): Aviso[] {
  const saida: Aviso[] = [];

  // 1 — o dinheiro preso, o aviso que abre a demonstração
  const presas = medicoesPresas(mundo);
  if (presas.length > 0) {
    const pior = presas[0];
    const obra = obraDe(mundo, pior.medicao.obraId);
    saida.push({
      id: 'medicao-presa',
      tom: 'rust',
      titulo: `${dinheiroCurto(pior.medicao.aceitoCents)} aceitos e não pagos há ${dias(pior.idade)}`,
      detalhe: `Medição ${pior.medicao.numero} · ${obra.nome}`,
      porque: [
        `O fiscal aceitou a medição ${pior.medicao.numero} em ${data(pior.medicao.dataAceite!)} — ${dinheiro(pior.medicao.aceitoCents)}.`,
        `Não há lançamento de pagamento para essa medição até hoje.`,
        `São ${dias(pior.idade)} corridos entre o aceite e agora.`,
        presas.length > 1
          ? `Somando as ${presas.length} medições nesta situação: ${dinheiro(totalPresoCents(mundo))}.`
          : `É a única medição nesta situação.`,
      ],
      fonte: `Boletim de medição ${pior.medicao.numero} · ${obra.nome}`,
      href: `/medicoes/${obra.id}`,
      notadoHaMin: 4,
    });
  }

  // 2 — a certidão que trava pagamento
  const vencendo = documentosNoPrazo(mundo, 7);
  const daEmpresa = vencendo.find((d) => d.documento.titularKind === 'empresa');
  if (daEmpresa) {
    const travadas = presas.length;
    saida.push({
      id: 'certidao-vencendo',
      tom: 'gold',
      titulo: `${nomeDe(TIPOS_DE_DOCUMENTO, daEmpresa.documento.tipoId)} vence em ${dias(daEmpresa.restam)}`,
      detalhe:
        travadas > 0
          ? `${travadas} ${travadas === 1 ? 'medição depende' : 'medições dependem'} dela para a prefeitura liberar o pagamento`
          : 'Sem medição aberta dependendo dela neste momento',
      porque: [
        `Vencimento registrado: ${data(daEmpresa.documento.vence)}.`,
        `Faltam ${dias(daEmpresa.restam)} para a data de vencimento.`,
        `Há ${travadas} medição(ões) aceita(s) e ainda não paga(s) — a certidão vencida costuma travar a liberação.`,
        `O Canteiro guarda a validade; quem emite a certidão é o órgão.`,
      ],
      fonte: 'Documentos e validades',
      href: '/painel',
      notadoHaMin: 11,
    });
  }

  // 3 — insumo acima do previsto pelo avanço
  const desvio = desviosDeInsumo(mundo).find((d) => d.desvioPct >= 15);
  if (desvio) {
    saida.push({
      id: 'insumo-acima',
      tom: 'gold',
      titulo: `${desvio.descricao.split(' ').slice(0, 2).join(' ')} ${desvio.desvioPct}% acima do previsto`,
      detalhe: desvio.obraNome,
      porque: [
        `Contrato prevê o serviço "${desvio.descricao}".`,
        `A obra está com ${pct(obraDe(mundo, desvio.obraId).pctFisico)} de avanço físico.`,
        `Previsto para esse avanço: ${numero(desvio.previsto)} ${desvio.unidade}.`,
        `Consumido de fato: ${numero(desvio.consumido)} ${desvio.unidade} — ${desvio.desvioPct}% acima.`,
      ],
      fonte: `Planilha do contrato · ${desvio.obraNome}`,
      href: `/obras/${desvio.obraId}`,
      notadoHaMin: 26,
    });
  }

  // 4 — concentração de diárias
  const conc = concentracoes(mundo).find((c) => c.acimaDaRegua);
  if (conc) {
    saida.push({
      id: 'concentracao',
      tom: 'rust',
      titulo: `${conc.nome}: ${conc.diariasNaJanela} diárias em ${dias(mundo.reguaVinculo.janelaDias)}`,
      detalhe: `${conc.pctNaObraDominante}% na mesma obra · ${plural(conc.recusas, 'recusa', 'recusas')} em ${plural(conc.chamados, 'chamado', 'chamados')}`,
      porque: [
        `Diárias lançadas nos últimos ${dias(mundo.reguaVinculo.janelaDias)}: ${conc.diariasNaJanela}.`,
        `${conc.pctNaObraDominante}% delas na obra ${conc.obraDominante}, chamadas por ${conc.encarregadoDominante}.`,
        `Chamados recebidos: ${conc.chamados}. Recusados: ${conc.recusas}.`,
        `A régua desta empresa é ${mundo.reguaVinculo.diarias} diárias em ${dias(mundo.reguaVinculo.janelaDias)} — definida pelo jurídico da empresa, não pelo sistema.`,
      ],
      fonte: 'Diaristas e chamados',
      href: '/diaristas',
      notadoHaMin: 26,
    });
  }

  // 5 — obra sem diário
  const semDiario = falhasDeDiario(mundo).find((f) => f.diasSemDiario >= 3);
  if (semDiario) {
    saida.push({
      id: 'sem-diario',
      tom: 'gold',
      titulo: `${semDiario.obraNome} está sem diário há ${dias(semDiario.diasSemDiario)}`,
      detalhe: 'Sem diário, a medição do mês fica sem prova de execução',
      porque: [
        `Último registro no diário desta obra: ${dias(semDiario.diasSemDiario)} atrás.`,
        `O boletim de medição se apoia no diário para provar o que foi executado no período.`,
        `Quem registra é o encarregado da frente.`,
      ],
      fonte: 'Diário de obra',
      href: '/diario',
      notadoHaMin: 63,
    });
  }

  // 6 — efetivo abaixo do cronograma, dias seguidos
  const efetivo = falhasDeDiario(mundo).find((f) => f.diasSeguidosComEfetivoBaixo >= 3);
  if (efetivo) {
    saida.push({
      id: 'efetivo-baixo',
      tom: 'gold',
      titulo: `Efetivo abaixo do cronograma ${efetivo.diasSeguidosComEfetivoBaixo} registros seguidos`,
      detalhe: `${efetivo.obraNome} · o cronograma pede ${efetivo.efetivoPrevisto} em campo`,
      porque: [
        `O cronograma desta obra pede ${efetivo.efetivoPrevisto} pessoas em campo.`,
        `Os ${efetivo.diasSeguidosComEfetivoBaixo} registros mais recentes do diário trazem efetivo menor que isso.`,
        `Efetivo abaixo por vários dias antecede atraso de frente — e atraso de frente vira glosa.`,
      ],
      fonte: 'Diário de obra',
      href: '/diario',
      notadoHaMin: 88,
    });
  }

  // 7 — o ritmo de cada prefeitura
  const ritmos = ritmoDePagamento(mundo);
  if (ritmos.length > 0 && ritmos[0].amostras >= 2) {
    const lento = ritmos[0];
    saida.push({
      id: 'ritmo-pagamento',
      tom: 'olive',
      titulo: `${lento.nome} paga em ${dias(lento.mediaDias)}, em média`,
      detalhe:
        ritmos.length > 1
          ? `Contra ${dias(ritmos[ritmos.length - 1].mediaDias)} de ${ritmos[ritmos.length - 1].nome}`
          : 'Use isso para prever o caixa',
      porque: [
        `${lento.amostras} medições desta prefeitura já foram aceitas e pagas.`,
        `Média entre o aceite do fiscal e o dinheiro na conta: ${dias(lento.mediaDias)}.`,
        ritmos.length > 1
          ? `A prefeitura mais rápida da carteira leva ${dias(ritmos[ritmos.length - 1].mediaDias)} — planejar as duas igual é o erro.`
          : `Ainda não há uma segunda prefeitura com medição paga para comparar.`,
      ],
      fonte: 'Histórico de medições pagas',
      href: '/analista',
      notadoHaMin: 122,
    });
  }

  // 8 — o teto do aditivo (art. 125 da Lei 14.133/2021)
  const perto = mundo.obras
    .filter((o) => o.aditivoPct > 0)
    .sort((a, b) => b.aditivoPct - a.aditivoPct)[0];
  if (perto && perto.aditivoPct >= TETO_ADITIVO_PCT * 0.7) {
    saida.push({
      id: 'teto-aditivo',
      tom: 'rust',
      titulo: `Aditivos da ${perto.nome} somam ${perto.aditivoPct}% do contrato`,
      detalhe: `O teto legal de acréscimo em obra é ${TETO_ADITIVO_PCT}%`,
      porque: [
        `Aditivos registrados neste sistema para esta obra: ${perto.aditivoPct}% do valor atualizado.`,
        `A Lei 14.133/2021, art. 125, fixa o acréscimo em ${TETO_ADITIVO_PCT}% (50% só em reforma de edifício).`,
        `Acréscimos e supressões contam separado — um não compensa o outro.`,
        `⚠️ Este é o percentual do que ESTE sistema registrou. A conclusão sobre o contrato é do seu jurídico.`,
      ],
      fonte: `Contrato · ${perto.nome}`,
      href: `/obras/${perto.id}`,
      notadoHaMin: 140,
    });
  }

  // 9 — glosa: quanto e por quê
  const glosa = resumoDeGlosa(mundo);
  if (glosa.quantidade >= 3 && glosa.motivoTopId) {
    saida.push({
      id: 'glosa',
      tom: 'gold',
      titulo: `${dinheiroCurto(glosa.totalCents)} glosados em ${glosa.quantidade} itens`,
      detalhe: `Motivo mais frequente: ${nomeDe(MOTIVOS_DE_GLOSA, glosa.motivoTopId).toLowerCase()}`,
      porque: [
        `Somando as glosas de todas as medições da carteira: ${dinheiro(glosa.totalCents)}.`,
        `Foram ${glosa.quantidade} itens cortados pelo fiscal.`,
        `O motivo "${nomeDe(MOTIVOS_DE_GLOSA, glosa.motivoTopId)}" apareceu ${glosa.motivoTopVezes} vezes.`,
        `Motivo que se repete é sintoma de processo, não de azar.`,
      ],
      fonte: 'Medições e glosas',
      href: '/medicoes/creche',
      notadoHaMin: 165,
    });
  }

  return saida;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Caixa mês a mês — o previsto pelo contrato × o realizado pela prefeitura
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prazo contratual de pagamento adotado NESTA DEMONSTRAÇÃO, em dias corridos
 * após o aceite do fiscal. No sistema real, é campo do contrato — cada edital
 * traz o seu, e prazo nunca é constante de código.
 */
export const PRAZO_CONTRATUAL_DIAS = 30;

export interface MesDeCaixa {
  /** `AAAA-MM` — a chave; a tela formata. */
  readonly mes: string;
  readonly rotulo: string;
  /** O que o contrato mandava entrar: aceito + prazo contratual. */
  readonly previstoCents: number;
  /** O que de fato entrou, na data do pagamento. */
  readonly realizadoCents: number;
}

function mesDe(iso: string): string {
  return iso.slice(0, 7);
}

const NOMES_MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function rotuloDoMes(mes: string): string {
  const [, m] = mes.split('-');
  return NOMES_MES[Number(m) - 1] ?? mes;
}

function somaDias(iso: string, n: number): string {
  return new Date(Date.parse(`${iso}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
}

/** Os últimos `meses` meses de caixa de uma obra (ou da carteira inteira). */
export function caixaPorMes(mundo: Mundo, obraId: string | null, meses = 12): MesDeCaixa[] {
  const alvo = mundo.medicoes.filter((m) => (obraId === null ? true : m.obraId === obraId));

  const previsto = new Map<string, number>();
  const realizado = new Map<string, number>();

  for (const m of alvo) {
    if (m.dataAceite && m.aceitoCents > 0) {
      const quando = mesDe(somaDias(m.dataAceite, PRAZO_CONTRATUAL_DIAS));
      previsto.set(quando, (previsto.get(quando) ?? 0) + m.aceitoCents);
    }
    if (m.dataPagamento && m.pagoCents > 0) {
      const quando = mesDe(m.dataPagamento);
      realizado.set(quando, (realizado.get(quando) ?? 0) + m.pagoCents);
    }
  }

  const chaves = [...new Set([...previsto.keys(), ...realizado.keys()])].sort();
  return chaves.slice(-meses).map((mes) => ({
    mes,
    rotulo: rotuloDoMes(mes),
    previstoCents: previsto.get(mes) ?? 0,
    realizadoCents: realizado.get(mes) ?? 0,
  }));
}
