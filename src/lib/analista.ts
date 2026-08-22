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
import { data, dias, dinheiro, dinheiroCurto, haDias, numero, pct, plural } from './formato';
import { manifestosAbertos, pendenciasDeRetorno } from './remessa';

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
  return (
    mundo.prefeituras
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
      .sort((a, b) => b.mediaDias - a.mediaDias)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ⚖️ CONCENTRAÇÃO DE EMPREITAS — a régua é do jurídico da empresa
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ⚖️ O que esta função É e o que ela NÃO É.
 *
 * ELA É: uma contagem. Quantas empreitas seguidas com o mesmo tomador, quantos
 * dias sem intervalo, qual o percentual de recusa, quantas outras empresas o
 * parceiro declara atender. Quatro números reais, medidos do que está na tela.
 *
 * ⛔ ELA NÃO É: classificação de risco jurídico. Não devolve "alto/médio/baixo",
 * não recomenda conduta, e **não sugere um número de régua** — isso é parecer de
 * advogado, e a casa não pratica ato privativo de profissão que não tem.
 *
 * O aviso só acende quando **dois ou mais** dos quatro sinais batem ao mesmo
 * tempo. Um sinal isolado é ruído: quem fez sete empreitas seguidas numa obra
 * grande e recusou metade das propostas está exercendo autonomia, não a perdendo.
 */
export interface SinalDeConcentracao {
  readonly chave: 'consecutivas' | 'sem-intervalo' | 'recusa' | 'exclusividade';
  readonly rotulo: string;
  readonly medido: string;
  readonly regua: string;
  readonly bateu: boolean;
}

export interface Concentracao {
  readonly empreiteiroId: string;
  readonly nome: string;
  readonly empreitas: number;
  readonly consecutivasMesmoTomador: number;
  readonly diasSemIntervalo: number;
  readonly obraDominante: string;
  readonly pctNaObraDominante: number;
  readonly encarregadoDominante: string;
  readonly propostas: number;
  readonly recusas: number;
  readonly pctRecusa: number;
  readonly outrasEmpresas: number;
  readonly sinais: readonly SinalDeConcentracao[];
  readonly sinaisAcesos: number;
  readonly acimaDaRegua: boolean;
}

export function concentracoes(mundo: Mundo): Concentracao[] {
  const r = mundo.reguaConcentracao;

  return mundo.empreiteiros
    .map((e): Concentracao | null => {
      const minhas = mundo.empreitas
        .filter((x) => x.empreiteiroId === e.id)
        .sort((a, b) => diasDesde(b.inicio) - diasDesde(a.inicio));
      if (minhas.length === 0) return null;

      // Quantas seguidas com a MESMA obra e o MESMO encarregado recebendo.
      let consecutivas = 1;
      for (let i = 1; i < minhas.length; i += 1) {
        const igual =
          minhas[i].obraId === minhas[0].obraId && minhas[i].aceitaPor === minhas[0].aceitaPor;
        if (!igual) break;
        consecutivas += 1;
      }

      // Quantos dias correram sem NENHUM intervalo entre uma e a seguinte.
      // Intervalo = a próxima começou depois de a anterior ser aceita.
      let diasSemIntervalo = 0;
      for (let i = 0; i < minhas.length - 1; i += 1) {
        const atual = minhas[i];
        const anterior = minhas[i + 1];
        const fimAnterior = anterior.aceiteEm ?? anterior.inicio;
        const folga = diasDesde(fimAnterior) - diasDesde(atual.inicio);
        if (folga > 1) break;
        diasSemIntervalo += atual.prazoDias;
      }
      if (diasSemIntervalo > 0) diasSemIntervalo += minhas[0].prazoDias;

      const porObra = new Map<string, number>();
      const porEncarregado = new Map<string, number>();
      for (const x of minhas) {
        porObra.set(x.obraId, (porObra.get(x.obraId) ?? 0) + 1);
        porEncarregado.set(x.aceitaPor, (porEncarregado.get(x.aceitaPor) ?? 0) + 1);
      }
      const [obraId, qtdObra] = [...porObra.entries()].sort((a, b) => b[1] - a[1])[0];
      const [encarregado] = [...porEncarregado.entries()].sort((a, b) => b[1] - a[1])[0];

      const minhasPropostas = mundo.propostas.filter((p) =>
        p.respostas.some((x) => x.empreiteiroId === e.id),
      );
      const recusas = minhasPropostas.filter((p) =>
        p.respostas.some((x) => x.empreiteiroId === e.id && x.estado === 'recusou'),
      ).length;
      const pctRecusa =
        minhasPropostas.length === 0 ? 0 : Math.round((recusas / minhasPropostas.length) * 100);

      // ⚠️ O sinal de recusa só vale com amostra: zero recusa em 3 propostas não
      // diz nada, e dizer que diz seria inventar sinal onde não há.
      const temAmostra = minhasPropostas.length >= 5;

      const sinais: SinalDeConcentracao[] = [
        {
          chave: 'consecutivas',
          rotulo: 'Empreitas seguidas com o mesmo tomador',
          medido: `${consecutivas}`,
          regua: `${r.empreitasConsecutivas}`,
          bateu: consecutivas >= r.empreitasConsecutivas,
        },
        {
          chave: 'sem-intervalo',
          rotulo: 'Dias corridos sem intervalo entre empreitas',
          medido: `${diasSemIntervalo}`,
          regua: `${r.diasSemIntervalo}`,
          bateu: diasSemIntervalo >= r.diasSemIntervalo,
        },
        {
          chave: 'recusa',
          rotulo: 'Percentual de propostas recusadas',
          medido: temAmostra ? `${pctRecusa}%` : 'sem amostra',
          regua: `mínimo ${r.pctRecusaMinimo}%`,
          bateu: temAmostra && pctRecusa < r.pctRecusaMinimo,
        },
        {
          chave: 'exclusividade',
          rotulo: 'Outras empresas que declara atender',
          medido: `${e.outrasEmpresas}`,
          regua: `mínimo ${r.outrasEmpresasMinimo}`,
          bateu: e.outrasEmpresas < r.outrasEmpresasMinimo,
        },
      ];

      const sinaisAcesos = sinais.filter((x) => x.bateu).length;

      return {
        empreiteiroId: e.id,
        nome: e.nome,
        empreitas: minhas.length,
        consecutivasMesmoTomador: consecutivas,
        diasSemIntervalo,
        obraDominante: obraDe(mundo, obraId).nome,
        pctNaObraDominante: Math.round((qtdObra / minhas.length) * 100),
        encarregadoDominante: encarregado,
        propostas: minhasPropostas.length,
        recusas,
        pctRecusa,
        outrasEmpresas: e.outrasEmpresas,
        sinais,
        sinaisAcesos,
        // ⭐ Dois sinais, não um. Um isolado é ruído.
        acimaDaRegua: sinaisAcesos >= 2,
      };
    })
    .filter((c): c is Concentracao => c !== null)
    .sort((a, b) => b.sinaisAcesos - a.sinaisAcesos || b.empreitas - a.empreitas);
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

  // 4 — ⚖️ concentração de empreitas (dois sinais ou mais)
  const conc = concentracoes(mundo).find((c) => c.acimaDaRegua);
  if (conc) {
    const acesos = conc.sinais.filter((x) => x.bateu);
    saida.push({
      id: 'concentracao',
      tom: 'rust',
      titulo: `${conc.nome}: ${plural(acesos.length, 'sinal', 'sinais')} de concentração`,
      detalhe: acesos.map((x) => x.rotulo.toLowerCase()).join(' · '),
      porque: [
        ...conc.sinais.map(
          (x) =>
            `${x.rotulo}: ${x.medido} (régua desta empresa: ${x.regua})${x.bateu ? ' — acima' : ''}.`,
        ),
        `${conc.pctNaObraDominante}% das empreitas na obra ${conc.obraDominante}, recebidas por ${conc.encarregadoDominante}.`,
        'A régua é definida pelo jurídico da empresa em Configurações. O sistema não sugere número, e este aviso não decide nada — mostra o que está acontecendo enquanto ainda dá tempo.',
      ],
      fonte: 'Empreiteiros',
      href: '/empreiteiros',
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
        `Último registro no diário desta obra: ${haDias(semDiario.diasSemDiario)}.`,
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

  // 10 — ⏱ ofício do órgão com prazo vencido
  const oficioVencido = mundo.oficios
    .filter((o) => o.estado === 'vencido' && o.respondidoEm === null)
    .sort((a, b) => diasDesde(b.em) - diasDesde(a.em))[0];
  if (oficioVencido) {
    const obra = obraDe(mundo, oficioVencido.obraId);
    const atraso = oficioVencido.prazoResposta ? diasDesde(oficioVencido.prazoResposta) : 0;
    saida.push({
      id: 'oficio-vencido',
      tom: 'rust',
      titulo: `${oficioVencido.numero} sem resposta há ${dias(atraso)} do prazo`,
      detalhe: `${obra.nome} · ${oficioVencido.assunto}`,
      porque: [
        `O ofício chegou em ${data(oficioVencido.em)}.`,
        `O prazo de resposta era ${data(oficioVencido.prazoResposta!)}.`,
        `Não há registro de resposta até hoje — ${dias(atraso)} além do prazo.`,
        `Responsável apontado: ${oficioVencido.responsavel}.`,
      ],
      fonte: 'Fiscalização',
      href: '/fiscalizacao',
      notadoHaMin: 8,
    });
  }

  // 11 — 💸 conta vencida e não paga
  const vencidas = mundo.contasAPagar.filter((c) => c.pagoEm === null && diasAte(c.vence) < 0);
  if (vencidas.length > 0) {
    const total = vencidas.reduce((s, c) => s + c.valorCents, 0);
    const pior = vencidas.sort((a, b) => diasDesde(b.vence) - diasDesde(a.vence))[0];
    saida.push({
      id: 'conta-vencida',
      tom: 'rust',
      titulo: `${dinheiroCurto(total)} vencidos e não pagos`,
      detalhe: `${plural(vencidas.length, 'conta', 'contas')} · a mais antiga é ${pior.favorecido}`,
      porque: [
        `${plural(vencidas.length, 'conta a pagar venceu', 'contas a pagar venceram')} e não têm registro de pagamento.`,
        `A mais antiga venceu em ${data(pior.vence)} — há ${dias(diasDesde(pior.vence))}.`,
        `Somando todas: ${dinheiro(total)}.`,
        'Fornecedor que espera demais cobra mais caro na cotação seguinte.',
      ],
      fonte: 'Caixa por obra',
      href: '/financeiro',
      notadoHaMin: 34,
    });
  }

  // 12 — 📦 recebimento com divergência sem tratativa
  const divergentes = mundo.compras.filter((c) => c.divergencia !== 0);
  if (divergentes.length > 0) {
    saida.push({
      id: 'divergencia',
      tom: 'gold',
      titulo: `${plural(divergentes.length, 'recebimento chegou', 'recebimentos chegaram')} a menos do que o pedido`,
      detalhe: divergentes
        .slice(0, 2)
        .map((c) => c.descricao)
        .join(' · '),
      porque: [
        ...divergentes
          .slice(0, 4)
          .map((c) => `${c.descricao}: faltaram ${numero(-c.divergencia)} ${c.unidade}.`),
        'Cada divergência é dinheiro que saiu do orçamento da obra sem material dentro dela.',
      ],
      fonte: 'Compras e materiais',
      href: '/compras',
      notadoHaMin: 51,
    });
  }

  // 13 — 🚜 equipamento fora de operação
  const parado = mundo.equipamentos.find((e) => e.estado === 'parado');
  if (parado) {
    const obra = obraDe(mundo, parado.obraId);
    const vencida =
      parado.proximaManutencaoHoras > 0 && parado.horimetro > parado.proximaManutencaoHoras;
    saida.push({
      id: 'equipamento-parado',
      tom: 'gold',
      titulo: `${parado.nome} parado na ${obra.nome}`,
      detalhe: vencida
        ? `horímetro ${numero(parado.horimetro)} h — manutenção era para ${numero(parado.proximaManutencaoHoras)} h`
        : `patrimônio ${parado.patrimonio}`,
      porque: [
        `O equipamento ${parado.patrimonio} está marcado como parado.`,
        `Está alocado na obra ${obra.nome} desde ${data(parado.desde)}.`,
        vencida
          ? `O horímetro passou da próxima manutenção em ${numero(parado.horimetro - parado.proximaManutencaoHoras)} h.`
          : 'Não há manutenção vencida registrada para ele.',
        'Máquina parada é frente de serviço andando mais devagar — e prazo de contrato correndo igual.',
      ],
      fonte: 'Equipamentos',
      href: '/equipamentos',
      notadoHaMin: 77,
    });
  }

  // 14 — 🚚 fornecedor que atrasa e diverge
  const ruins = mundo.fornecedores
    .filter((f) => f.estado === 'ativo')
    .map((f) => {
      const minhas = mundo.compras.filter((c) => c.fornecedorEscolhido === f.id);
      return {
        f,
        compras: minhas.length,
        divergentes: minhas.filter((c) => c.divergencia !== 0).length,
      };
    })
    .filter((x) => x.compras >= 3 && (x.f.prazoMedioDias >= 10 || x.divergentes >= 2))
    .sort((a, b) => b.f.prazoMedioDias - a.f.prazoMedioDias)[0];
  if (ruins) {
    saida.push({
      id: 'fornecedor',
      tom: 'gold',
      titulo: `${ruins.f.nome} entrega em ${dias(ruins.f.prazoMedioDias)}, em média`,
      detalhe:
        ruins.divergentes > 0
          ? `${plural(ruins.divergentes, 'recebimento divergente', 'recebimentos divergentes')} em ${plural(ruins.compras, 'compra', 'compras')}`
          : `${plural(ruins.compras, 'compra', 'compras')} no período`,
      porque: [
        `Prazo médio de entrega registrado: ${dias(ruins.f.prazoMedioDias)}.`,
        `Compras fechadas com ele: ${ruins.compras}.`,
        `Recebimentos com divergência: ${ruins.divergentes}.`,
        'Prazo longo em material de caminho crítico vira parada de frente.',
      ],
      fonte: 'Fornecedores',
      href: '/fornecedores',
      notadoHaMin: 96,
    });
  }

  // 15 — ⏳ a pendência que envelheceu demais
  const velhas = mundo.pendencias
    .map((p) => ({ p, idade: diasDesde(p.abertaEm) }))
    .sort((a, b) => b.idade - a.idade);
  if (velhas.length > 0 && velhas[0].idade >= 30) {
    const media = Math.round(velhas.reduce((s, x) => s + x.idade, 0) / velhas.length);
    saida.push({
      id: 'pendencia-velha',
      tom: 'gold',
      titulo: `A pendência mais velha da casa tem ${dias(velhas[0].idade)}`,
      detalhe: velhas[0].p.titulo,
      porque: [
        `Pendências abertas no momento: ${velhas.length}.`,
        `Idade média: ${dias(media)}.`,
        `A mais velha foi aberta em ${data(velhas[0].p.abertaEm)} e está com ${velhas[0].p.responsavel}.`,
        'A conta é de idade, não de volume: muitas pendências novas é trabalho andando; poucas e velhas é processo travado.',
      ],
      fonte: 'Resolutividade',
      href: '/resolutividade',
      notadoHaMin: 148,
    });
  }

  // 16 — 🚚 máquina fora do pátio, sem retorno registrado
  // ⭐ Não é caixinha que alguém marca: é a conta de quem tem saída registrada
  // e nenhum retorno no livro. Some sozinha quando a volta entrar. Acende em
  // atenção enquanto está no prazo, e vira decisão quando passa dele.
  const foraDoPatio = pendenciasDeRetorno(mundo);
  if (foraDoPatio.length > 0) {
    const pior = foraDoPatio[0];
    const carga = pior.remessa.itens.map((i) => i.descricao).join(', ');
    saida.push({
      id: 'remessa-sem-retorno',
      tom: pior.foraDoPrazo ? 'rust' : 'gold',
      titulo: `${carga} fora do pátio há ${dias(pior.diasFora)}`,
      detalhe: `${pior.operacao.rotulo} · saiu para ${pior.remessa.destinoRotulo}`,
      porque: [
        `A saída nº ${pior.remessa.numero} foi registrada em ${data(pior.remessa.ocorreuEm)} — há ${dias(pior.diasFora)}.`,
        `A operação "${pior.operacao.rotulo}" cobra retorno${pior.operacao.prazoRetornoDias !== null ? ` em ${dias(pior.operacao.prazoRetornoDias)}` : ''}.`,
        'Não há evento de retorno registrado para esta saída até hoje.',
        pior.foraDoPrazo
          ? 'O prazo já passou — e máquina fora do prazo de retorno é máquina parada em oficina de terceiro.'
          : 'Ainda está dentro do prazo. A linha existe para que o prazo não vença sem ninguém ter olhado.',
      ],
      fonte: `Saída nº ${pior.remessa.numero}`,
      href: `/remessas/${pior.remessa.id}`,
      notadoHaMin: 19,
    });
  }

  // 17 — 📄 manifesto em aberto, e o caminhão que ele trava
  const manifestos = manifestosAbertos(mundo);
  if (manifestos.length > 0) {
    const m = manifestos[0];
    saida.push({
      id: 'manifesto-aberto',
      tom: 'gold',
      titulo: `Manifesto nº ${m.documento.numero} em aberto ${m.diasAberto === 0 ? 'desde hoje' : `há ${dias(m.diasAberto)}`}`,
      detalhe: `${m.remessa.origemRotulo} para ${m.remessa.destinoRotulo}`,
      porque: [
        `O manifesto nº ${m.documento.numero} foi autorizado em ${data(m.documento.emitidoEm)}.`,
        'Não há evento de encerramento para ele no livro.',
        'Com o manifesto em aberto, a próxima saída deste caminhão é recusada — encerrar é marcar "Chegou" na entrega.',
        'É a regra que quase nenhum sistema conta ao cliente, e a que faz o caminhão esperar no pátio.',
      ],
      fonte: `Saída nº ${m.remessa.numero}`,
      href: `/remessas/${m.remessa.id}`,
      notadoHaMin: 7,
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

const NOMES_MES = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

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
