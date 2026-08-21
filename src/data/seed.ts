/**
 * SEED — o mundo fictício da vitrine.
 *
 * ⚠️ LEI DE DADOS: nenhum nome real de cliente, sócio, prefeitura, CNPJ ou
 * telefone. Tudo aqui é invenção. O nome do cliente que aparece na demo vem de
 * `NEXT_PUBLIC_TENANT_NAME` (Vercel), nunca deste arquivo.
 *
 * ⚠️ DETERMINISMO: zero `Math.random()` e zero `new Date()` sem argumento. O
 * mundo é calculado a partir de `DATA_REF` com um gerador semeado — recarregar
 * dá exatamente o mesmo mundo, e servidor e cliente concordam (sem erro de
 * hidratação). É proposital: a demo tem de contar a MESMA história toda vez.
 */

import {
  ESPECIALIDADES,
  FRENTES,
  MODALIDADES,
  MOTIVOS_DE_GLOSA,
  MOTIVOS_DE_OCORRENCIA,
} from './taxonomias';

// ─────────────────────────────────────────────────────────────────────────────
// O RELÓGIO DA DEMO
// ─────────────────────────────────────────────────────────────────────────────

/** A "hoje" da demonstração. Fixa, para "aceita há 18 dias" nunca envelhecer. */
export const DATA_REF: string =
  process.env.NEXT_PUBLIC_DEMO_DATE && /^\d{4}-\d{2}-\d{2}$/.test(process.env.NEXT_PUBLIC_DEMO_DATE)
    ? process.env.NEXT_PUBLIC_DEMO_DATE
    : '2026-08-21';

const MS_DIA = 86_400_000;

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** A data de N dias ATRÁS da referência, em ISO. */
export function diasAtras(n: number): string {
  return iso(new Date(Date.parse(`${DATA_REF}T12:00:00Z`) - n * MS_DIA));
}

/** A data de N dias À FRENTE da referência, em ISO. */
export function diasAFrente(n: number): string {
  return iso(new Date(Date.parse(`${DATA_REF}T12:00:00Z`) + n * MS_DIA));
}

/** Quantos dias corridos separam uma data ISO da referência (positivo = passado). */
export function diasDesde(dataIso: string): number {
  return Math.round(
    (Date.parse(`${DATA_REF}T12:00:00Z`) - Date.parse(`${dataIso}T12:00:00Z`)) / MS_DIA,
  );
}

/** Dias até uma data futura (negativo = já venceu). */
export function diasAte(dataIso: string): number {
  return -diasDesde(dataIso);
}

// ─────────────────────────────────────────────────────────────────────────────
// GERADOR SEMEADO — mulberry32. Sem dependência, sem surpresa.
// ─────────────────────────────────────────────────────────────────────────────

function semente(s: number): () => number {
  let a = s >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function entre(rnd: () => number, min: number, max: number): number {
  return min + rnd() * (max - min);
}

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export interface Prefeitura {
  readonly id: string;
  readonly nome: string;
  /** Dias médios entre o aceite do fiscal e o dinheiro na conta. */
  readonly atrasoMedioDias: number;
  readonly fiscal: string;
}

export interface Obra {
  readonly id: string;
  readonly nome: string;
  readonly tipoId: string;
  readonly prefeituraId: string;
  readonly contratoCents: number;
  readonly inicio: string;
  readonly prazoMeses: number;
  readonly frentes: readonly string[];
  readonly pctFisico: number;
  readonly aditivoPct: number;
  readonly encarregado: string;
  /** Efetivo que o cronograma pede em campo. O diário mede o que de fato foi. */
  readonly efetivoPrevisto: number;
}

export interface ItemContrato {
  readonly obraId: string;
  readonly numero: number;
  readonly descricao: string;
  readonly unidade: string;
  readonly quantidade: number;
  readonly precoUnitCents: number;
}

export interface Glosa {
  readonly itemNumero: number;
  readonly motivoId: string;
  readonly valorCents: number;
}

export type EstadoMedicao = 'em-curso' | 'enviada' | 'aceita' | 'aceita-parcial';

export interface Medicao {
  readonly id: string;
  readonly obraId: string;
  readonly numero: number;
  readonly periodoInicio: string;
  readonly periodoFim: string;
  readonly estado: EstadoMedicao;
  readonly executadoCents: number;
  readonly aceitoCents: number;
  readonly faturadoCents: number;
  readonly pagoCents: number;
  readonly dataAceite: string | null;
  readonly dataFatura: string | null;
  readonly dataPagamento: string | null;
  readonly glosas: readonly Glosa[];
}

export interface Documento {
  readonly id: string;
  readonly tipoId: string;
  readonly titularKind: 'empreiteiro' | 'obra' | 'empresa' | 'equipe';
  readonly titularId: string;
  readonly titularNome: string;
  readonly vence: string;
}

export interface Empreiteiro {
  readonly id: string;
  readonly nome: string;
  readonly especialidadeId: string;
  readonly modalidadeId: string;
  /** 0..100 — a régua do método, como o `vperf` do Business OS. */
  readonly avaliacao: number;
  readonly outrasEmpresas: number;
  readonly ferramentaPropria: boolean;
}

/**
 * ⚖️ A EMPREITA — contrato de RESULTADO, não de tempo.
 *
 * Código Civil, arts. 610–626: o empreiteiro entrega uma obra ou parte dela por
 * um **valor global** combinado, com autonomia de meios, ferramenta própria e
 * podendo trazer ajudantes seus. Não se paga o dia; paga-se a entrega.
 *
 * ⛔ O vocabulário anterior saiu do produto em 22/08/2026 por orientação do
 * jurídico da empresa (registro em `docs/MIGRACAO.md` §0). Nada aqui mede tempo
 * trabalhado — mede objeto entregue.
 */
export type EstadoEmpreita = 'contratada' | 'em-execucao' | 'entregue' | 'quitada' | 'cancelada';

/** Uma parcela do valor global, presa a um marco — nunca a um dia. */
export interface MarcoDePagamento {
  readonly rotulo: string;
  readonly pctValor: number;
  readonly pagoEm: string | null;
}

export interface Empreita {
  readonly id: string;
  readonly propostaId: string | null;
  readonly empreiteiroId: string;
  readonly obraId: string;
  /** O que se entrega. Texto livre — é o objeto do contrato. */
  readonly objeto: string;
  readonly frenteId: string;
  readonly unidade: string;
  readonly quantidade: number;
  readonly valorGlobalCents: number;
  readonly prazoDias: number;
  readonly inicio: string;
  readonly estado: EstadoEmpreita;
  /** Quem recebe a entrega pela empresa. */
  readonly aceitaPor: string;
  /** O termo de aceite da entrega — a data em que a obra foi dada por feita. */
  readonly aceiteEm: string | null;
  /** O termo de quitação — encerra o contrato e não reabre. */
  readonly quitacaoEm: string | null;
  readonly marcos: readonly MarcoDePagamento[];
  readonly documento: string;
}

export type EstadoResposta = 'aceitou' | 'recusou' | 'sem-resposta';

export interface RespostaProposta {
  readonly empreiteiroId: string;
  readonly estado: EstadoResposta;
  readonly hora: string | null;
  readonly motivo: string | null;
}

/**
 * A PROPOSTA DE EMPREITA — o convite, antes de virar contrato.
 *
 * ⭐ A recusa é o dado mais valioso desta peça: recusar sem consequência é o
 * traço mais forte de autonomia. Um cadastro que só guarda o "sim" não prova
 * nada. Quem carimba o "não" é o empreiteiro — nunca o encarregado por ele.
 */
export interface Proposta {
  readonly id: string;
  readonly obraId: string;
  readonly objeto: string;
  readonly frenteId: string;
  readonly especialidadeId: string;
  readonly unidade: string;
  readonly quantidade: number;
  readonly valorGlobalCents: number;
  readonly prazoDias: number;
  readonly inicioPrevisto: string;
  readonly abertaEm: string;
  readonly encarregado: string;
  readonly respostas: readonly RespostaProposta[];
}

export interface EntradaDiario {
  readonly id: string;
  readonly obraId: string;
  readonly data: string;
  readonly hora: string;
  readonly autor: string;
  readonly climaId: string;
  readonly frenteId: string;
  readonly efetivo: number;
  readonly motivos: readonly string[];
  readonly gravidadeId: string;
  readonly observacao: string;
  readonly temFoto: boolean;
  readonly cancelada: { readonly motivo: string; readonly em: string; readonly por: string } | null;
}

export interface Consumo {
  readonly obraId: string;
  readonly itemNumero: number;
  /** O que saiu do estoque para a obra, na unidade do contrato. */
  readonly quantidadeConsumida: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// v2 — AS SALAS NOVAS
// ─────────────────────────────────────────────────────────────────────────────

/** O contrato com o órgão público — o de cima de todos os outros. */
export interface ContratoPublico {
  readonly id: string;
  readonly obraId: string;
  readonly numero: string;
  readonly objeto: string;
  readonly modalidade: string;
  readonly assinadoEm: string;
  readonly ordemDeServicoEm: string;
  readonly prazoDias: number;
  readonly valorOriginalCents: number;
  readonly garantiaPct: number;
}

export interface Aditivo {
  readonly id: string;
  readonly contratoId: string;
  readonly numero: string;
  readonly tipoId: string;
  readonly assinadoEm: string;
  /** Positivo acresce, negativo suprime. Em prazo, vem zerado. */
  readonly valorCents: number;
  readonly prazoDias: number;
  readonly justificativa: string;
}

export type EstadoOficio = 'recebido' | 'respondido' | 'vencido' | 'arquivado';

/** A relação formal com o órgão: ofício entra, resposta sai, prazo corre. */
export interface Oficio {
  readonly id: string;
  readonly obraId: string;
  readonly numero: string;
  readonly tipoId: string;
  readonly direcao: 'recebido' | 'enviado';
  readonly assunto: string;
  readonly em: string;
  readonly prazoResposta: string | null;
  readonly respondidoEm: string | null;
  readonly estado: EstadoOficio;
  readonly responsavel: string;
}

export interface VisitaDeFiscal {
  readonly id: string;
  readonly obraId: string;
  readonly em: string;
  readonly fiscal: string;
  readonly constatacao: string;
  readonly exigencias: number;
}

/** A equipe própria — gente CLT da empresa. ⛔ Não se confunde com empreiteiro. */
export interface Colaborador {
  readonly id: string;
  readonly nome: string;
  readonly funcao: string;
  readonly obraId: string;
  readonly admitidoEm: string;
  readonly estado: 'ativo' | 'afastado';
}

export interface Treinamento {
  readonly id: string;
  readonly colaboradorId: string;
  readonly nome: string;
  readonly em: string;
  readonly cargaHoras: number;
  readonly validoAte: string;
}

export interface EntregaDeEpi {
  readonly id: string;
  readonly pessoaId: string;
  readonly pessoaNome: string;
  readonly item: string;
  readonly em: string;
  readonly assinado: boolean;
}

export interface Fornecedor {
  readonly id: string;
  readonly nome: string;
  readonly familiaId: string;
  readonly cidade: string;
  readonly avaliacao: number;
  readonly prazoMedioDias: number;
  readonly estado: 'ativo' | 'arquivado';
}

export type EstadoCompra = 'requisitada' | 'cotando' | 'pedida' | 'recebida' | 'cancelada';

export interface Compra {
  readonly id: string;
  readonly obraId: string;
  readonly familiaId: string;
  readonly descricao: string;
  readonly unidade: string;
  readonly quantidade: number;
  readonly requisitadaEm: string;
  readonly requisitadaPor: string;
  readonly estado: EstadoCompra;
  readonly cotacoes: readonly { readonly fornecedorId: string; readonly valorCents: number }[];
  readonly fornecedorEscolhido: string | null;
  readonly valorCents: number;
  readonly recebidaEm: string | null;
  /** Diferença entre o pedido e o que chegou. Zero quando bateu. */
  readonly divergencia: number;
  readonly motivoCancelamento: string | null;
}

export interface Equipamento {
  readonly id: string;
  readonly nome: string;
  readonly patrimonio: string;
  readonly obraId: string;
  readonly desde: string;
  readonly horimetro: number;
  readonly proximaManutencaoHoras: number;
  readonly estado: 'operando' | 'parado' | 'manutencao';
}

/** Custo real lançado na obra — livro, não planilha. */
export interface CustoDaObra {
  readonly id: string;
  readonly obraId: string;
  readonly familiaId: string;
  readonly descricao: string;
  readonly em: string;
  readonly valorCents: number;
  readonly origem: 'compra' | 'empreita' | 'folha' | 'equipamento' | 'outro';
}

export interface ContaAPagar {
  readonly id: string;
  readonly obraId: string;
  readonly favorecido: string;
  readonly descricao: string;
  readonly vence: string;
  readonly valorCents: number;
  readonly pagoEm: string | null;
}

/** Qualquer coisa que está aberta e envelhecendo. Alimenta a Resolutividade. */
export interface Pendencia {
  readonly id: string;
  readonly setorId: string;
  readonly obraId: string | null;
  readonly titulo: string;
  readonly abertaEm: string;
  readonly responsavel: string;
}

export interface Mundo {
  readonly prefeituras: readonly Prefeitura[];
  readonly obras: readonly Obra[];
  readonly itens: readonly ItemContrato[];
  readonly medicoes: readonly Medicao[];
  readonly consumos: readonly Consumo[];
  readonly empreiteiros: readonly Empreiteiro[];
  readonly documentos: readonly Documento[];
  readonly empreitas: readonly Empreita[];
  readonly propostas: readonly Proposta[];
  readonly diario: readonly EntradaDiario[];
  readonly contratos: readonly ContratoPublico[];
  readonly aditivos: readonly Aditivo[];
  readonly oficios: readonly Oficio[];
  readonly visitas: readonly VisitaDeFiscal[];
  readonly colaboradores: readonly Colaborador[];
  readonly treinamentos: readonly Treinamento[];
  readonly episEntregues: readonly EntregaDeEpi[];
  readonly fornecedores: readonly Fornecedor[];
  readonly compras: readonly Compra[];
  readonly equipamentos: readonly Equipamento[];
  readonly custos: readonly CustoDaObra[];
  readonly contasAPagar: readonly ContaAPagar[];
  readonly pendencias: readonly Pendencia[];
  /**
   * ⚖️ A RÉGUA DE CONCENTRAÇÃO — quatro parâmetros, todos do TENANT.
   * Quem define é o jurídico da empresa; o sistema não sugere número nenhum.
   * Os valores do seed são EXEMPLO e a tela diz isso com todas as letras.
   */
  readonly reguaConcentracao: ReguaConcentracao;
}

export interface ReguaConcentracao {
  /** Empreitas seguidas com o mesmo tomador antes de acender o aviso. */
  readonly empreitasConsecutivas: number;
  /** Dias sem nenhum intervalo entre uma empreita e a seguinte. */
  readonly diasSemIntervalo: number;
  /** Piso de recusa esperado — abaixo disso, a autonomia não aparece. */
  readonly pctRecusaMinimo: number;
  /** Quantas outras empresas o empreiteiro declara atender. */
  readonly outrasEmpresasMinimo: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PREFEITURAS — fictícias, com padrões de pagamento deliberadamente diferentes
// ─────────────────────────────────────────────────────────────────────────────

const PREFEITURAS: readonly Prefeitura[] = [
  {
    id: 'serra-azul',
    nome: 'Prefeitura de Serra Azul',
    atrasoMedioDias: 45,
    fiscal: 'eng. A. Moreira',
  },
  {
    id: 'vila-aurora',
    nome: 'Prefeitura de Vila Aurora',
    atrasoMedioDias: 90,
    fiscal: 'eng.ª R. Caldas',
  },
  {
    id: 'porto-cristalino',
    nome: 'Prefeitura de Porto Cristalino',
    atrasoMedioDias: 20,
    fiscal: 'arq. D. Peixoto',
  },
];

const OBRAS: readonly Obra[] = [
  {
    id: 'creche',
    nome: 'Creche Municipal Jardim Alto',
    tipoId: 'edificacao',
    prefeituraId: 'serra-azul',
    contratoCents: 240_000_000,
    inicio: diasAtras(150),
    prazoMeses: 12,
    frentes: [
      'fundacao',
      'estrutura',
      'alvenaria',
      'cobertura',
      'hidraulica',
      'eletrica',
      'acabamento',
    ],
    pctFisico: 62,
    aditivoPct: 8.4,
    encarregado: 'Sr. Aparecido',
    efetivoPrevisto: 16,
  },
  {
    id: 'pavimentacao',
    nome: 'Pavimentação do Setor Leste',
    tipoId: 'pavimentacao',
    prefeituraId: 'vila-aurora',
    contratoCents: 185_000_000,
    inicio: diasAtras(360),
    prazoMeses: 12,
    frentes: ['terraplanagem', 'base', 'asfalto', 'sinalizacao'],
    pctFisico: 78,
    aditivoPct: 22.4,
    encarregado: 'Sr. Nivaldo',
    efetivoPrevisto: 14,
  },
  {
    id: 'ubs',
    nome: 'Reforma da UBS Central',
    tipoId: 'reforma',
    prefeituraId: 'porto-cristalino',
    contratoCents: 80_000_000,
    inicio: diasAtras(95),
    prazoMeses: 6,
    frentes: ['demolicao', 'hidraulica', 'eletrica', 'acabamento'],
    pctFisico: 41,
    aditivoPct: 0,
    encarregado: 'Sr. Genésio',
    efetivoPrevisto: 10,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ITENS DE CONTRATO — a planilha do edital, 12 a 15 serviços por obra
// ─────────────────────────────────────────────────────────────────────────────

const SERVICOS: Record<string, ReadonlyArray<readonly [string, string, number, number]>> = {
  creche: [
    ['Serviços preliminares e canteiro', 'vb', 1, 4_820_000],
    ['Escavação manual em solo de 1ª categoria', 'm³', 84, 9_640],
    ['Concreto usinado bombeado fck 25 MPa', 'm³', 312, 61_200],
    ['Aço CA-50 cortado e dobrado', 'kg', 18_400, 1_180],
    ['Fôrma de madeira compensada plastificada', 'm²', 1_240, 8_930],
    ['Alvenaria de bloco cerâmico 14 cm', 'm²', 1_860, 8_830],
    ['Chapisco, emboço e reboco', 'm²', 3_720, 5_410],
    ['Cobertura em telha termoacústica', 'm²', 640, 21_700],
    ['Instalação hidrossanitária completa', 'vb', 1, 18_600_000],
    ['Instalação elétrica e SPDA', 'vb', 1, 22_400_000],
    ['Revestimento cerâmico de piso e parede', 'm²', 1_480, 9_620],
    ['Esquadrias de alumínio', 'm²', 186, 48_300],
    ['Pintura acrílica sobre massa', 'm²', 3_720, 3_180],
    ['Playground e paisagismo', 'vb', 1, 6_400_000],
  ],
  pavimentacao: [
    ['Mobilização e sinalização de obra', 'vb', 1, 3_200_000],
    ['Regularização do subleito', 'm²', 24_800, 640],
    ['Base de brita graduada simples', 'm³', 3_720, 14_800],
    ['Imprimação betuminosa impermeabilizante', 'm²', 24_800, 480],
    ['Pintura de ligação com emulsão RR-2C', 'm²', 24_800, 310],
    ['Capa asfáltica CBUQ 5 cm', 't', 3_100, 89_400],
    ['Meio-fio de concreto pré-moldado', 'm', 6_200, 4_180],
    ['Sarjeta de concreto moldada in loco', 'm', 6_200, 3_640],
    ['Boca de lobo simples', 'un', 68, 148_000],
    ['Tubo de concreto DN 400 mm', 'm', 840, 12_400],
    ['Sinalização horizontal termoplástica', 'm²', 1_240, 6_820],
    ['Sinalização vertical — placas', 'un', 96, 42_600],
    ['Limpeza final e desmobilização', 'vb', 1, 1_800_000],
  ],
  ubs: [
    ['Demolição de alvenaria e remoção de entulho', 'm³', 148, 12_800],
    ['Recuperação estrutural de vigas e pilares', 'vb', 1, 4_200_000],
    ['Alvenaria de vedação em bloco cerâmico', 'm²', 320, 8_830],
    ['Substituição de rede hidráulica', 'vb', 1, 6_800_000],
    ['Substituição de rede elétrica e quadros', 'vb', 1, 8_400_000],
    ['Impermeabilização de laje de cobertura', 'm²', 410, 11_600],
    ['Forro em gesso acartonado', 'm²', 380, 9_240],
    ['Revestimento cerâmico hospitalar', 'm²', 620, 12_800],
    ['Piso vinílico em manta', 'm²', 380, 16_400],
    ['Esquadrias e portas de acesso', 'un', 24, 186_000],
    ['Pintura epóxi em áreas técnicas', 'm²', 620, 5_840],
    ['Adequação de acessibilidade', 'vb', 1, 2_900_000],
  ],
};

const ITENS: readonly ItemContrato[] = OBRAS.flatMap((obra) =>
  (SERVICOS[obra.id] ?? []).map(([descricao, unidade, quantidade, precoUnitCents], i) => ({
    obraId: obra.id,
    numero: i + 1,
    descricao,
    unidade,
    quantidade,
    precoUnitCents,
  })),
);

// ─────────────────────────────────────────────────────────────────────────────
// MEDIÇÕES — 12 meses de história, com o atraso da prefeitura embutido
// ─────────────────────────────────────────────────────────────────────────────

/** Quantas medições mensais cabem entre o início da obra e hoje. */
function quantasMedicoes(obra: Obra): number {
  return Math.min(obra.prazoMeses, Math.max(1, Math.floor(diasDesde(obra.inicio) / 30)));
}

function construirMedicoes(): Medicao[] {
  const saida: Medicao[] = [];

  for (const obra of OBRAS) {
    const pref = PREFEITURAS.find((p) => p.id === obra.prefeituraId)!;
    const n = quantasMedicoes(obra);
    const rnd = semente(obra.id.length * 9176 + obra.contratoCents);
    const alvoMensal = Math.round((obra.contratoCents * (obra.pctFisico / 100)) / n);

    for (let i = 1; i <= n; i += 1) {
      // `i = 1` é o período MAIS RECENTE (a medição em curso); cada passo recua
      // 30 dias, e o início nunca é anterior ao começo da obra.
      const idadeObra = diasDesde(obra.inicio);
      const periodoFim = diasAtras((i - 1) * 30);
      const periodoInicio = diasAtras(Math.min(idadeObra, i * 30));

      // Arredondado para a centena de reais: a mesa lê o número em voz alta.
      const executadoCents = Math.round((alvoMensal * entre(rnd, 0.82, 1.18)) / 10_000) * 10_000;

      // A glosa cai em uma medição a cada três — e sempre com motivo.
      const temGlosa = i % 3 === 1 && i > 1;
      const glosas: Glosa[] = temGlosa
        ? [
            {
              itemNumero: 3 + (i % 5),
              motivoId: MOTIVOS_DE_GLOSA[i % MOTIVOS_DE_GLOSA.length].id,
              valorCents: Math.round((executadoCents * entre(rnd, 0.04, 0.11)) / 1_000) * 1_000,
            },
          ]
        : [];

      const glosado = glosas.reduce((s, g) => s + g.valorCents, 0);
      const aceitoCents = executadoCents - glosado;

      // O aceite sai 3 dias depois do fim do período; a nota, 5 dias depois dele.
      const diasDesdeFim = diasDesde(periodoFim);
      const emCurso = i === 1 && diasDesdeFim < 3;
      const dataAceite = emCurso ? null : diasAtras(Math.max(0, diasDesdeFim - 3));
      const dataFatura = dataAceite ? diasAtras(Math.max(0, diasDesde(dataAceite) - 5)) : null;
      const idadeAceite = dataAceite ? diasDesde(dataAceite) : 0;
      const pago = dataAceite !== null && idadeAceite >= pref.atrasoMedioDias;

      saida.push({
        id: `${obra.id}-m${n - i + 1}`,
        obraId: obra.id,
        numero: n - i + 1,
        periodoInicio,
        periodoFim,
        estado: emCurso ? 'em-curso' : glosado > 0 ? 'aceita-parcial' : 'aceita',
        executadoCents,
        aceitoCents: emCurso ? 0 : aceitoCents,
        faturadoCents: dataFatura ? aceitoCents : 0,
        pagoCents: pago ? aceitoCents : 0,
        dataAceite,
        dataFatura,
        dataPagamento: pago ? diasAtras(Math.max(0, idadeAceite - pref.atrasoMedioDias)) : null,
        glosas,
      });
    }
  }

  return saida.sort((a, b) =>
    a.obraId === b.obraId ? b.numero - a.numero : a.obraId < b.obraId ? -1 : 1,
  );
}

const MEDICOES_BASE = construirMedicoes();

/**
 * ⭐ O AJUSTE DA CENA — a medição que abre a demonstração.
 *
 * Os números vêm do roteiro (docs/ROTEIRO-DEMO.md) e não do gerador: a mesa
 * precisa ouvir "R$ 212.400 aceitos há 18 dias" e ver exatamente isso na tela.
 * O gerador cuida das outras 20 medições.
 */
const MEDICOES: readonly Medicao[] = MEDICOES_BASE.map((m) => {
  if (m.obraId === 'creche' && m.numero === 4) {
    return {
      ...m,
      estado: 'aceita-parcial' as const,
      executadoCents: 23_178_000,
      aceitoCents: 21_240_000,
      faturadoCents: 21_240_000,
      pagoCents: 0,
      dataAceite: diasAtras(18),
      dataFatura: diasAtras(13),
      dataPagamento: null,
      glosas: [
        { itemNumero: 6, motivoId: 'nao-executado', valorCents: 1_854_300 },
        { itemNumero: 11, motivoId: 'quantidade', valorCents: 83_700 },
      ],
    };
  }
  return m;
});

// ─────────────────────────────────────────────────────────────────────────────
// CONSUMO DE INSUMO — o que o Analista compara com o previsto pelo avanço
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ⭐ O previsto NÃO é um número guardado: é `quantidade do contrato × % físico`.
 * O consumido é o que saiu do estoque. A diferença é a conta que o Analista faz
 * na tela, e que o "por que isso?" mostra por extenso.
 */
const CONSUMOS: readonly Consumo[] = [
  { obraId: 'creche', itemNumero: 3, quantidadeConsumida: 253.4 }, // concreto — o estouro
  { obraId: 'creche', itemNumero: 4, quantidadeConsumida: 11_100 }, // aço — dentro
  { obraId: 'creche', itemNumero: 6, quantidadeConsumida: 1_090 }, // alvenaria — dentro
  { obraId: 'pavimentacao', itemNumero: 6, quantidadeConsumida: 2_480 },
  { obraId: 'pavimentacao', itemNumero: 3, quantidadeConsumida: 3_180 },
  { obraId: 'ubs', itemNumero: 8, quantidadeConsumida: 236 },
];

// ─────────────────────────────────────────────────────────────────────────────
// EMPREITEIROS — 40 parceiros de empreita, nomes de fantasia
// ─────────────────────────────────────────────────────────────────────────────

const PRENOMES = [
  'Ronaldo',
  'Marcos',
  'Elias',
  'Damião',
  'Jonas',
  'Sebastião',
  'Valdir',
  'Cícero',
  'Adenilson',
  'Reginaldo',
  'Ademir',
  'Jucelino',
  'Benedito',
  'Edvaldo',
  'Ozéias',
  'Wanderley',
  'Gilmar',
  'Nivaldo',
  'Josimar',
  'Aldemir',
  'Wesley',
  'Fabiano',
  'Cleiton',
  'Rogério',
  'Antenor',
  'Lindomar',
  'Sidnei',
  'Odair',
  'Everaldo',
  'Genivaldo',
  'Rubens',
  'Tarcísio',
  'Waldemar',
  'Ivanildo',
  'Josué',
  'Aluísio',
  'Deusdete',
  'Manoel',
  'Nelson',
  'Osvaldo',
];

const SOBRENOMES = [
  'B.',
  'T.',
  'S.',
  'M.',
  'P.',
  'R.',
  'C.',
  'L.',
  'A.',
  'F.',
  'G.',
  'D.',
  'N.',
  'V.',
  'Q.',
  'X.',
  'J.',
  'H.',
  'E.',
  'Z.',
];

function construirEmpreiteiros(): Empreiteiro[] {
  const rnd = semente(20260821);
  return PRENOMES.map((prenome, i) => ({
    id: `p${String(i + 1).padStart(2, '0')}`,
    nome: `${prenome} ${SOBRENOMES[i % SOBRENOMES.length]}`,
    especialidadeId: ESPECIALIDADES[i % ESPECIALIDADES.length].id,
    modalidadeId: MODALIDADES[i % MODALIDADES.length].id,
    avaliacao: Math.round(entre(rnd, 62, 98)),
    // Quem vive de empreita normalmente atende mais de um contratante. O ZERO
    // é a exceção que interessa ao alerta — e ela é plantada de propósito no p01.
    outrasEmpresas: 1 + Math.floor(entre(rnd, 0, 4)),
    ferramentaPropria: rnd() > 0.35,
  }));
}

const EMPREITEIROS: readonly Empreiteiro[] = construirEmpreiteiros().map((p) => {
  // ⭐ O caso do alerta: concentração alta, zero recusa, uma obra só.
  if (p.id === 'p01') {
    return {
      ...p,
      nome: 'Ronaldo B.',
      especialidadeId: 'pedreiro',
      modalidadeId: 'mei',
      avaliacao: 88,
      outrasEmpresas: 0,
      ferramentaPropria: false,
    };
  }
  // ⭐ O contra-exemplo: autonomia de verdade. A demo precisa dos dois.
  if (p.id === 'p02') {
    return {
      ...p,
      nome: 'Marcos T.',
      especialidadeId: 'armador',
      modalidadeId: 'autonomo',
      avaliacao: 91,
      outrasEmpresas: 3,
      ferramentaPropria: true,
    };
  }
  return p;
});

// ─────────────────────────────────────────────────────────────────────────────
// EMPREITAS — contratos de resultado, e o caso que acende o alerta
// ─────────────────────────────────────────────────────────────────────────────

/** Os marcos de pagamento padrão desta demonstração: 30% na entrada, 70% no aceite. */
const MARCOS_PADRAO = (inicio: string, aceite: string | null): MarcoDePagamento[] => [
  { rotulo: 'Início dos serviços', pctValor: 30, pagoEm: inicio },
  { rotulo: 'Aceite da entrega', pctValor: 70, pagoEm: aceite },
];

const OBJETOS_POR_FRENTE: Record<string, readonly [string, string, number, number][]> = {
  // frente → [objeto, unidade, quantidade, valor global em centavos]
  alvenaria: [['Alvenaria de vedação — bloco 14 cm', 'm²', 180, 1_620_000]],
  reboco: [['Reboco externo', 'm²', 240, 1_440_000]],
  estrutura: [['Fôrma e armação de pilares', 'm²', 96, 2_880_000]],
  fundacao: [['Escavação e sapatas', 'm³', 42, 2_100_000]],
  cobertura: [['Estrutura de cobertura', 'm²', 140, 3_360_000]],
  hidraulica: [['Instalação hidráulica — bloco B', 'vb', 1, 4_200_000]],
  eletrica: [['Instalação elétrica — bloco A', 'vb', 1, 5_100_000]],
  acabamento: [['Assentamento de cerâmica', 'm²', 210, 2_520_000]],
  terraplanagem: [['Regularização de subleito', 'm²', 1_800, 1_260_000]],
  base: [['Base de brita graduada', 'm³', 260, 3_900_000]],
  asfalto: [['Meio-fio e sarjeta', 'm', 420, 1_890_000]],
  sinalizacao: [['Sinalização horizontal', 'm²', 180, 1_260_000]],
  demolicao: [['Demolição e remoção de entulho', 'm³', 38, 950_000]],
};

function objetoDaFrente(frenteId: string, rnd: () => number) {
  const lista = OBJETOS_POR_FRENTE[frenteId] ?? OBJETOS_POR_FRENTE.alvenaria;
  const [objeto, unidade, quantidade, valor] = lista[0];
  // O valor varia ±18% entre contratos, arredondado à dezena de reais.
  const valorGlobalCents = Math.round((valor * entre(rnd, 0.82, 1.18)) / 1_000) * 1_000;
  return { objeto, unidade, quantidade, valorGlobalCents };
}

/**
 * ⚖️ Sortear obra por PESO, não por igualdade.
 *
 * Distribuir compras e empreitas igualmente entre as três obras faria a reforma
 * de R$ 800 mil consumir tanto quanto a creche de R$ 2,4 milhões — e o custo
 * real da UBS estouraria o próprio contrato na primeira tela de financeiro.
 * O peso é o valor do contrato.
 */
const PESO_DA_OBRA = OBRAS.map((o) => o.contratoCents);
const PESO_TOTAL = PESO_DA_OBRA.reduce((a, b) => a + b, 0);

function sorteiaObra(rnd: () => number): Obra {
  let alvo = rnd() * PESO_TOTAL;
  for (let i = 0; i < OBRAS.length; i += 1) {
    alvo -= PESO_DA_OBRA[i];
    if (alvo <= 0) return OBRAS[i];
  }
  return OBRAS[OBRAS.length - 1];
}

function construirEmpreitas(): Empreita[] {
  const saida: Empreita[] = [];
  const rnd = semente(4471);
  const creche = OBRAS.find((o) => o.id === 'creche')!;

  // ⭐ O CASO DO ALERTA — 11 empreitas seguidas na MESMA obra, sem intervalo,
  // sempre com o mesmo encarregado recebendo a entrega. É exatamente o padrão
  // que a régua do jurídico existe para enxergar antes de a ação chegar.
  const frentesCreche = [
    'alvenaria',
    'reboco',
    'alvenaria',
    'reboco',
    'acabamento',
    'alvenaria',
    'reboco',
    'acabamento',
    'alvenaria',
    'reboco',
    'alvenaria',
  ];
  let cursor = 74;
  frentesCreche.forEach((frenteId, i) => {
    const { objeto, unidade, quantidade, valorGlobalCents } = objetoDaFrente(frenteId, rnd);
    const prazo = 6;
    const inicio = diasAtras(cursor);
    const aceite = diasAtras(Math.max(0, cursor - prazo));
    const ultima = i === frentesCreche.length - 1;
    saida.push({
      id: `e-c-${i}`,
      propostaId: `p-c-${i}`,
      empreiteiroId: 'p01',
      obraId: 'creche',
      objeto: `${objeto} — trecho ${i + 1}`,
      frenteId,
      unidade,
      quantidade,
      valorGlobalCents,
      prazoDias: prazo,
      inicio,
      // Sem intervalo: a seguinte começa no dia em que a anterior é aceita.
      estado: ultima ? 'em-execucao' : 'quitada',
      aceitaPor: creche.encarregado,
      aceiteEm: ultima ? null : aceite,
      quitacaoEm: ultima ? null : diasAtras(Math.max(0, cursor - prazo - 2)),
      marcos: MARCOS_PADRAO(inicio, ultima ? null : aceite),
      documento: 'NF-e MEI',
    });
    cursor -= prazo;
  });

  // ⭐ O CONTRA-EXEMPLO — empreitas espalhadas em três obras, com intervalo,
  // recebidas por encarregados diferentes. É o retrato de autonomia real, e a
  // demonstração precisa dos dois lado a lado para ser honesta.
  const espalhado: ReadonlyArray<readonly [string, string, number]> = [
    ['creche', 'estrutura', 8],
    ['ubs', 'hidraulica', 26],
    ['pavimentacao', 'base', 44],
    ['ubs', 'demolicao', 61],
    ['creche', 'cobertura', 82],
    ['pavimentacao', 'asfalto', 104],
  ];
  espalhado.forEach(([obraId, frenteId, quandoComecou], i) => {
    const obra = OBRAS.find((o) => o.id === obraId)!;
    const { objeto, unidade, quantidade, valorGlobalCents } = objetoDaFrente(frenteId, rnd);
    const prazo = 9;
    const emCurso = i === 0;
    const inicio = diasAtras(quandoComecou);
    const aceite = diasAtras(Math.max(0, quandoComecou - prazo));
    saida.push({
      id: `e-m-${i}`,
      propostaId: `p-m-${i}`,
      empreiteiroId: 'p02',
      obraId,
      objeto,
      frenteId,
      unidade,
      quantidade,
      valorGlobalCents,
      prazoDias: prazo,
      inicio,
      estado: emCurso ? 'em-execucao' : 'quitada',
      aceitaPor: obra.encarregado,
      aceiteEm: emCurso ? null : aceite,
      quitacaoEm: emCurso ? null : diasAtras(Math.max(0, quandoComecou - prazo - 3)),
      marcos: MARCOS_PADRAO(inicio, emCurso ? null : aceite),
      documento: 'NF-e ME',
    });
  });

  // O resto da carteira de parceiros: 2 a 5 empreitas cada, com intervalo real.
  for (const p of EMPREITEIROS.slice(2)) {
    // ⚖️ Uma a três empreitas por parceiro. Mais que isso e a subcontratação
    // passaria a custar mais que o próprio contrato — o número tem de fechar
    // com o financeiro, senão a primeira tela de custo desmente a segunda.
    const quantas = 1 + Math.floor(entre(rnd, 0, 3));
    let quando = Math.floor(entre(rnd, 3, 20));
    for (let k = 0; k < quantas; k += 1) {
      const obra = sorteiaObra(rnd);
      const frenteId = obra.frentes[Math.floor(entre(rnd, 0, obra.frentes.length))];
      const { objeto, unidade, quantidade, valorGlobalCents } = objetoDaFrente(frenteId, rnd);
      const prazo = Math.floor(entre(rnd, 4, 13));
      const inicio = diasAtras(quando);
      const emCurso = k === 0 && rnd() > 0.6;
      const aceite = diasAtras(Math.max(0, quando - prazo));
      saida.push({
        id: `e-${p.id}-${k}`,
        propostaId: null,
        empreiteiroId: p.id,
        obraId: obra.id,
        objeto,
        frenteId,
        unidade,
        quantidade,
        valorGlobalCents,
        prazoDias: prazo,
        inicio,
        estado: emCurso ? 'em-execucao' : rnd() > 0.85 ? 'entregue' : 'quitada',
        aceitaPor: obra.encarregado,
        aceiteEm: emCurso ? null : aceite,
        quitacaoEm: emCurso ? null : diasAtras(Math.max(0, quando - prazo - 4)),
        marcos: MARCOS_PADRAO(inicio, emCurso ? null : aceite),
        documento: rnd() > 0.45 ? 'NF-e MEI' : 'Recibo de empreitada',
      });
      // ⭐ Intervalo de verdade entre uma empreita e a próxima — o oposto do
      // caso de alerta. O piso de 16 dias é maior que o maior prazo possível
      // (12), então a folga nunca se fecha por acidente da aritmética.
      quando += prazo + Math.floor(entre(rnd, 16, 40));
    }
  }

  return saida;
}

const EMPREITAS: readonly Empreita[] = construirEmpreitas();

// ─────────────────────────────────────────────────────────────────────────────
// PROPOSTAS — e a recusa, que é a prova de autonomia
// ─────────────────────────────────────────────────────────────────────────────

const MOTIVOS_RECUSA = [
  'Estou com outra empreita até sexta',
  'Já fechei o mês com outro contratante',
  'Não trabalho nessa frente',
  'O prazo não fecha com o meu cronograma',
  'O valor não cobre o meu custo nesse trecho',
];

function construirPropostas(): Proposta[] {
  const saida: Proposta[] = [];
  const rnd = semente(9099);
  const creche = OBRAS.find((o) => o.id === 'creche')!;

  // A proposta aberta — a cena da tela de Empreiteiros.
  saida.push({
    id: 'p-aberta',
    obraId: 'creche',
    objeto: 'Reboco externo — fachada leste',
    frenteId: 'reboco',
    especialidadeId: 'pedreiro',
    unidade: 'm²',
    quantidade: 240,
    valorGlobalCents: 380_000,
    prazoDias: 6,
    inicioPrevisto: diasAFrente(3),
    abertaEm: diasAtras(0),
    encarregado: creche.encarregado,
    respostas: [
      { empreiteiroId: 'p01', estado: 'aceitou', hora: '13:58', motivo: null },
      { empreiteiroId: 'p09', estado: 'aceitou', hora: '14:02', motivo: null },
      { empreiteiroId: 'p02', estado: 'recusou', hora: '14:11', motivo: MOTIVOS_RECUSA[0] },
      { empreiteiroId: 'p17', estado: 'sem-resposta', hora: null, motivo: null },
    ],
  });

  // ⭐ 25 propostas ao empreiteiro do caso de alerta, ZERO recusa. É o segundo
  // sinal que a régua enxerga: quem nunca recusa não está exercendo autonomia.
  for (let i = 0; i < 25; i += 1) {
    saida.push({
      id: `p-c-${i}`,
      obraId: 'creche',
      objeto: `Reboco externo — trecho ${i + 1}`,
      frenteId: i % 2 === 0 ? 'alvenaria' : 'reboco',
      especialidadeId: 'pedreiro',
      unidade: 'm²',
      quantidade: 180,
      valorGlobalCents: 300_000,
      prazoDias: 6,
      inicioPrevisto: diasAtras(i * 6 + 2),
      abertaEm: diasAtras(i * 6 + 4),
      encarregado: creche.encarregado,
      respostas: [{ empreiteiroId: 'p01', estado: 'aceitou', hora: '07:12', motivo: null }],
    });
  }

  // ⭐ 20 propostas ao contra-exemplo, 10 recusadas — 50% de recusa.
  for (let i = 0; i < 20; i += 1) {
    const recusou = i % 2 === 0;
    const obra = OBRAS[i % OBRAS.length];
    saida.push({
      id: `p-m-${i}`,
      obraId: obra.id,
      objeto: 'Fôrma e armação de pilares',
      frenteId: 'estrutura',
      especialidadeId: 'armador',
      unidade: 'm²',
      quantidade: 96,
      valorGlobalCents: 288_000,
      prazoDias: 9,
      inicioPrevisto: diasAtras(i * 9 + 2),
      abertaEm: diasAtras(i * 9 + 4),
      encarregado: obra.encarregado,
      respostas: [
        {
          empreiteiroId: 'p02',
          estado: recusou ? 'recusou' : 'aceitou',
          hora: recusou ? '08:40' : '06:55',
          motivo: recusou ? MOTIVOS_RECUSA[i % MOTIVOS_RECUSA.length] : null,
        },
      ],
    });
  }

  // O resto da carteira, para a lista não parecer encenada.
  for (let i = 0; i < 46; i += 1) {
    const p = EMPREITEIROS[3 + (i % (EMPREITEIROS.length - 3))];
    const obra = OBRAS[Math.floor(entre(rnd, 0, OBRAS.length))];
    const frenteId = obra.frentes[Math.floor(entre(rnd, 0, obra.frentes.length))];
    const { objeto, unidade, quantidade, valorGlobalCents } = objetoDaFrente(frenteId, rnd);
    const sorte = rnd();
    saida.push({
      id: `p-g-${i}`,
      obraId: obra.id,
      objeto,
      frenteId,
      especialidadeId: p.especialidadeId,
      unidade,
      quantidade,
      valorGlobalCents,
      prazoDias: Math.floor(entre(rnd, 4, 13)),
      inicioPrevisto: diasAtras(Math.floor(entre(rnd, 1, 60))),
      abertaEm: diasAtras(Math.floor(entre(rnd, 2, 62))),
      encarregado: obra.encarregado,
      respostas: [
        {
          empreiteiroId: p.id,
          estado: sorte > 0.66 ? 'recusou' : sorte > 0.58 ? 'sem-resposta' : 'aceitou',
          hora: sorte > 0.58 ? '09:20' : '07:05',
          motivo: sorte > 0.66 ? MOTIVOS_RECUSA[i % MOTIVOS_RECUSA.length] : null,
        },
      ],
    });
  }

  return saida;
}

const PROPOSTAS: readonly Proposta[] = construirPropostas();

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTOS — com validade, que é o que trava pagamento e habilitação
// ─────────────────────────────────────────────────────────────────────────────

function construirDocumentos(): Documento[] {
  const saida: Documento[] = [];
  const rnd = semente(3311);

  // ⭐ A certidão que trava medição — a cena de "vence esta semana".
  saida.push({
    id: 'doc-fgts',
    tipoId: 'fgts',
    titularKind: 'empresa',
    titularId: 'empresa',
    titularNome: 'A empresa',
    vence: diasAFrente(6),
  });
  saida.push({
    id: 'doc-cnd',
    tipoId: 'cnd',
    titularKind: 'empresa',
    titularId: 'empresa',
    titularNome: 'A empresa',
    vence: diasAFrente(74),
  });
  saida.push({
    id: 'doc-trab',
    tipoId: 'trabalhista',
    titularKind: 'empresa',
    titularId: 'empresa',
    titularNome: 'A empresa',
    vence: diasAFrente(41),
  });

  for (const obra of OBRAS) {
    saida.push({
      id: `doc-art-${obra.id}`,
      tipoId: 'art',
      titularKind: 'obra',
      titularId: obra.id,
      titularNome: obra.nome,
      vence: diasAFrente(Math.round(entre(rnd, 120, 300))),
    });
    saida.push({
      id: `doc-cno-${obra.id}`,
      tipoId: 'cno',
      titularKind: 'obra',
      titularId: obra.id,
      titularNome: obra.nome,
      vence: diasAFrente(Math.round(entre(rnd, 200, 400))),
    });
  }

  // ⭐ 2 ASOs vencendo nesta semana — o maço da NR-18 que o auditor pede.
  saida.push({
    id: 'doc-aso-p01',
    tipoId: 'aso',
    titularKind: 'empreiteiro',
    titularId: 'p01',
    titularNome: 'Ronaldo B.',
    vence: diasAFrente(4),
  });
  saida.push({
    id: 'doc-aso-p09',
    tipoId: 'aso',
    titularKind: 'empreiteiro',
    titularId: 'p09',
    titularNome: EMPREITEIROS[8].nome,
    vence: diasAFrente(5),
  });
  // Um já vencido — a demo precisa mostrar o estado ruim, não só o quase-ruim.
  saida.push({
    id: 'doc-nr35-p17',
    tipoId: 'nr35',
    titularKind: 'empreiteiro',
    titularId: 'p17',
    titularNome: EMPREITEIROS[16].nome,
    vence: diasAtras(9),
  });

  for (const p of EMPREITEIROS.slice(2)) {
    saida.push({
      id: `doc-aso-${p.id}`,
      tipoId: 'aso',
      titularKind: 'empreiteiro',
      titularId: p.id,
      titularNome: p.nome,
      vence: diasAFrente(Math.round(entre(rnd, 30, 330))),
    });
    if (rnd() > 0.5) {
      saida.push({
        id: `doc-nr18-${p.id}`,
        tipoId: 'nr18',
        titularKind: 'empreiteiro',
        titularId: p.id,
        titularNome: p.nome,
        vence: diasAFrente(Math.round(entre(rnd, 20, 400))),
      });
    }
  }

  return saida;
}

const DOCUMENTOS: readonly Documento[] = construirDocumentos();

// ─────────────────────────────────────────────────────────────────────────────
// DIÁRIO DE OBRA — 30 dias, com variedade e um registro cancelado
// ─────────────────────────────────────────────────────────────────────────────

const OBSERVACOES: readonly string[] = [
  'Concretagem da laje do 2º pavimento concluída no período da manhã.',
  'Chuva a partir das 14h, frente de alvenaria parada.',
  'Caminhão de brita não chegou; equipe remanejada para o meio-fio.',
  'Fiscal conferiu a armação da viga V12 e liberou a concretagem.',
  'Servente escorregou na rampa molhada, sem lesão. Rampa isolada e sinalizada.',
  'Betoneira parada por defeito no motor; manutenção acionada.',
  'Equipe reduzida — dois parceiros de empreita não compareceram.',
  'Início da frente de instalação hidráulica no bloco B.',
  'Descarga de 42 t de CBUQ; compactação dentro do previsto.',
  'Visita da equipe de segurança do trabalho; três apontamentos registrados.',
  'Reunião de frente com o encarregado para replanejar a semana.',
  'Fôrma do pilar P8 desmontada para correção de prumo.',
];

function construirDiario(): EntradaDiario[] {
  const saida: EntradaDiario[] = [];
  const rnd = semente(777);

  for (let d = 0; d < 30; d += 1) {
    for (const obra of OBRAS) {
      // Nem toda obra registra todo dia — e é justamente isso que o Analista vê.
      const falha = obra.id === 'ubs' && d < 4;
      if (falha || rnd() > 0.86) continue;

      const chuva = rnd() > 0.78;
      const motivos: string[] = [];
      if (chuva) motivos.push('chuva');
      const sorte = rnd();
      if (sorte > 0.86) motivos.push('falta-material');
      else if (sorte > 0.74) motivos.push('visita-fiscal');
      else if (sorte > 0.68) motivos.push('efetivo-abaixo');
      if (d === 11 && obra.id === 'creche') motivos.push('quase-acidente');
      if (motivos.length === 0)
        motivos.push(MOTIVOS_DE_OCORRENCIA[Math.floor(entre(rnd, 0, 3))].id);

      const gravidadeId = motivos.includes('quase-acidente')
        ? 'paralisa'
        : motivos.includes('chuva') || motivos.includes('falta-material')
          ? 'atencao'
          : 'rotina';

      saida.push({
        id: `di-${obra.id}-${d}`,
        obraId: obra.id,
        data: diasAtras(d),
        hora: `${String(Math.floor(entre(rnd, 7, 18))).padStart(2, '0')}:${String(Math.floor(entre(rnd, 0, 6)) * 10).padStart(2, '0')}`,
        autor: obra.encarregado,
        climaId: chuva
          ? rnd() > 0.5
            ? 'chuva-forte'
            : 'chuva-fraca'
          : rnd() > 0.5
            ? 'sol'
            : 'nublado',
        frenteId: obra.frentes[Math.floor(entre(rnd, 0, obra.frentes.length))] ?? FRENTES[0].id,
        efetivo: Math.floor(entre(rnd, 6, 22)),
        motivos,
        gravidadeId,
        observacao: OBSERVACOES[Math.floor(entre(rnd, 0, OBSERVACOES.length))],
        temFoto: rnd() > 0.4,
        cancelada: null,
      });
    }
  }

  // ⭐ O livro imutável: um registro CANCELADO COM MOTIVO, e ele continua à vista.
  saida.push({
    id: 'di-cancelado',
    obraId: 'pavimentacao',
    data: diasAtras(6),
    hora: '17:40',
    autor: 'Sr. Nivaldo',
    climaId: 'sol',
    frenteId: 'asfalto',
    efetivo: 14,
    motivos: ['outro'],
    gravidadeId: 'rotina',
    observacao: 'Lançado na obra errada — o registro correto é o da Creche no mesmo dia.',
    temFoto: false,
    cancelada: { motivo: 'Registro lançado na obra errada', em: diasAtras(6), por: 'Sr. Nivaldo' },
  });

  return saida.sort((a, b) =>
    a.data === b.data ? b.hora.localeCompare(a.hora) : b.data.localeCompare(a.data),
  );
}

const DIARIO: readonly EntradaDiario[] = construirDiario();

// ─────────────────────────────────────────────────────────────────────────────
// v2 — OS DADOS DAS SALAS NOVAS
// Tudo fictício, tudo coerente com as MESMAS 3 obras e a MESMA data de
// referência. Nenhuma sala nasce vazia; nenhuma inventa uma quarta obra.
// ─────────────────────────────────────────────────────────────────────────────

const CONTRATOS: readonly ContratoPublico[] = [
  {
    id: 'ct-creche',
    obraId: 'creche',
    numero: '041/2026',
    objeto: 'Construção de creche municipal — 6 salas, 480 m²',
    modalidade: 'Concorrência',
    assinadoEm: diasAtras(162),
    ordemDeServicoEm: diasAtras(150),
    prazoDias: 360,
    valorOriginalCents: 240_000_000,
    garantiaPct: 5,
  },
  {
    id: 'ct-pavimentacao',
    obraId: 'pavimentacao',
    numero: '128/2025',
    objeto: 'Pavimentação asfáltica e drenagem — 24.800 m²',
    modalidade: 'Concorrência',
    assinadoEm: diasAtras(372),
    ordemDeServicoEm: diasAtras(360),
    prazoDias: 360,
    valorOriginalCents: 185_000_000,
    garantiaPct: 5,
  },
  {
    id: 'ct-ubs',
    obraId: 'ubs',
    numero: '007/2026',
    objeto: 'Reforma de unidade básica de saúde — 320 m²',
    modalidade: 'Pregão eletrônico',
    assinadoEm: diasAtras(104),
    ordemDeServicoEm: diasAtras(95),
    prazoDias: 180,
    valorOriginalCents: 80_000_000,
    garantiaPct: 5,
  },
];

/**
 * ⭐ Os aditivos da Pavimentação somam 22,4% — o número que o Funcionário
 * Digital compara com o teto de acréscimo em obra. A conclusão sobre o contrato
 * é do jurídico; o sistema só faz a conta do que registrou.
 */
const ADITIVOS: readonly Aditivo[] = [
  {
    id: 'ad-p1',
    contratoId: 'ct-pavimentacao',
    numero: '1º TA',
    tipoId: 'valor-acrescimo',
    assinadoEm: diasAtras(250),
    valorCents: 18_500_000,
    prazoDias: 0,
    justificativa: 'Acréscimo de 3.100 m² de área pavimentada em duas ruas anexas.',
  },
  {
    id: 'ad-p2',
    contratoId: 'ct-pavimentacao',
    numero: '2º TA',
    tipoId: 'prazo',
    assinadoEm: diasAtras(180),
    valorCents: 0,
    prazoDias: 60,
    justificativa: 'Período chuvoso acima da média histórica impediu a capa asfáltica.',
  },
  {
    id: 'ad-p3',
    contratoId: 'ct-pavimentacao',
    numero: '3º TA',
    tipoId: 'reequilibrio',
    assinadoEm: diasAtras(96),
    valorCents: 22_940_000,
    prazoDias: 0,
    justificativa: 'Recomposição por variação do preço do ligante asfáltico.',
  },
  {
    id: 'ad-c1',
    contratoId: 'ct-creche',
    numero: '1º TA',
    tipoId: 'valor-acrescimo',
    assinadoEm: diasAtras(72),
    valorCents: 20_160_000,
    prazoDias: 30,
    justificativa: 'Inclusão de playground e adequação de acessibilidade.',
  },
];

const OFICIOS: readonly Oficio[] = [
  {
    id: 'of-1',
    obraId: 'creche',
    numero: 'OF 214/2026',
    tipoId: 'exigencia',
    direcao: 'recebido',
    assunto: 'Apresentar ART de execução da estrutura metálica da cobertura',
    em: diasAtras(9),
    prazoResposta: diasAFrente(1),
    respondidoEm: null,
    estado: 'recebido',
    responsavel: 'Escritório técnico',
  },
  {
    id: 'of-2',
    obraId: 'pavimentacao',
    numero: 'OF 189/2026',
    tipoId: 'notificacao',
    direcao: 'recebido',
    assunto: 'Sinalização de desvio insuficiente no trecho da Rua 7',
    em: diasAtras(24),
    prazoResposta: diasAtras(17),
    respondidoEm: diasAtras(19),
    estado: 'respondido',
    responsavel: 'Sr. Nivaldo',
  },
  {
    id: 'of-3',
    obraId: 'ubs',
    numero: 'OF 032/2026',
    tipoId: 'solicitacao',
    direcao: 'recebido',
    assunto: 'Envio da CND e da certidão de FGTS atualizadas',
    em: diasAtras(5),
    prazoResposta: diasAFrente(5),
    respondidoEm: null,
    estado: 'recebido',
    responsavel: 'Financeiro',
  },
  {
    id: 'of-4',
    obraId: 'creche',
    numero: 'CT 018/2026',
    tipoId: 'resposta',
    direcao: 'enviado',
    assunto: 'Resposta à exigência de detalhamento do projeto hidráulico',
    em: diasAtras(31),
    prazoResposta: null,
    respondidoEm: diasAtras(31),
    estado: 'arquivado',
    responsavel: 'Escritório técnico',
  },
  {
    id: 'of-5',
    obraId: 'pavimentacao',
    numero: 'OF 151/2026',
    tipoId: 'exigencia',
    direcao: 'recebido',
    assunto: 'Refazimento do trecho com desnível fora de tolerância',
    em: diasAtras(58),
    prazoResposta: diasAtras(48),
    respondidoEm: null,
    estado: 'vencido',
    responsavel: 'Sr. Nivaldo',
  },
  {
    id: 'of-6',
    obraId: 'ubs',
    numero: 'CT 009/2026',
    tipoId: 'comunicado',
    direcao: 'enviado',
    assunto: 'Comunicação de paralisação por chuva — 2 dias',
    em: diasAtras(12),
    prazoResposta: null,
    respondidoEm: diasAtras(12),
    estado: 'arquivado',
    responsavel: 'Sr. Genésio',
  },
];

const VISITAS: readonly VisitaDeFiscal[] = [
  {
    id: 'v-1',
    obraId: 'creche',
    em: diasAtras(4),
    fiscal: 'eng. A. Moreira',
    constatacao: 'Conferiu a armação da viga V12 e liberou a concretagem do trecho.',
    exigencias: 0,
  },
  {
    id: 'v-2',
    obraId: 'creche',
    em: diasAtras(19),
    fiscal: 'eng. A. Moreira',
    constatacao: 'Apontou divergência de quantidade na alvenaria do bloco B.',
    exigencias: 1,
  },
  {
    id: 'v-3',
    obraId: 'pavimentacao',
    em: diasAtras(11),
    fiscal: 'eng.ª R. Caldas',
    constatacao: 'Coleta de amostra do CBUQ para ensaio; aguarda laudo.',
    exigencias: 1,
  },
  {
    id: 'v-4',
    obraId: 'ubs',
    em: diasAtras(7),
    fiscal: 'arq. D. Peixoto',
    constatacao: 'Vistoria de acessibilidade nas rampas; conforme ao projeto.',
    exigencias: 0,
  },
  {
    id: 'v-5',
    obraId: 'pavimentacao',
    em: diasAtras(58),
    fiscal: 'eng.ª R. Caldas',
    constatacao: 'Desnível fora de tolerância no trecho da Rua 7.',
    exigencias: 2,
  },
];

const COLABORADORES: readonly Colaborador[] = [
  {
    id: 'cl-1',
    nome: 'Aparecido S.',
    funcao: 'Encarregado de obra',
    obraId: 'creche',
    admitidoEm: diasAtras(880),
    estado: 'ativo',
  },
  {
    id: 'cl-2',
    nome: 'Nivaldo P.',
    funcao: 'Encarregado de obra',
    obraId: 'pavimentacao',
    admitidoEm: diasAtras(1240),
    estado: 'ativo',
  },
  {
    id: 'cl-3',
    nome: 'Genésio A.',
    funcao: 'Encarregado de obra',
    obraId: 'ubs',
    admitidoEm: diasAtras(640),
    estado: 'ativo',
  },
  {
    id: 'cl-4',
    nome: 'Lúcia R.',
    funcao: 'Técnica de segurança do trabalho',
    obraId: 'creche',
    admitidoEm: diasAtras(410),
    estado: 'ativo',
  },
  {
    id: 'cl-5',
    nome: 'Wilson M.',
    funcao: 'Almoxarife',
    obraId: 'creche',
    admitidoEm: diasAtras(300),
    estado: 'ativo',
  },
  {
    id: 'cl-6',
    nome: 'Tereza C.',
    funcao: 'Auxiliar administrativo de obra',
    obraId: 'pavimentacao',
    admitidoEm: diasAtras(220),
    estado: 'ativo',
  },
  {
    id: 'cl-7',
    nome: 'Hélio B.',
    funcao: 'Operador de máquina',
    obraId: 'pavimentacao',
    admitidoEm: diasAtras(510),
    estado: 'afastado',
  },
  {
    id: 'cl-8',
    nome: 'Iracema D.',
    funcao: 'Engenheira residente',
    obraId: 'ubs',
    admitidoEm: diasAtras(150),
    estado: 'ativo',
  },
];

function construirTreinamentos(): Treinamento[] {
  const rnd = semente(5511);
  const cursos: ReadonlyArray<readonly [string, number, number]> = [
    ['NR-18 — condições no canteiro', 8, 730],
    ['NR-35 — trabalho em altura', 8, 730],
    ['NR-10 — segurança em eletricidade', 40, 730],
    ['DDS — uso e guarda de EPI', 2, 365],
    ['Primeiros socorros no canteiro', 4, 365],
  ];
  const saida: Treinamento[] = [];
  COLABORADORES.forEach((c, i) => {
    cursos.slice(0, 2 + (i % 3)).forEach(([nome, horas, validade], k) => {
      const quando = Math.floor(entre(rnd, 40, 600));
      saida.push({
        id: `tr-${c.id}-${k}`,
        colaboradorId: c.id,
        nome,
        em: diasAtras(quando),
        cargaHoras: horas,
        validoAte: diasAFrente(validade - quando),
      });
    });
  });
  return saida;
}
const TREINAMENTOS: readonly Treinamento[] = construirTreinamentos();

function construirEpis(): EntregaDeEpi[] {
  const rnd = semente(6622);
  const itens = [
    'Capacete classe B',
    'Bota de segurança',
    'Luva de vaqueta',
    'Óculos de proteção',
    'Cinturão paraquedista',
    'Protetor auricular',
  ];
  const saida: EntregaDeEpi[] = [];
  COLABORADORES.forEach((c, i) => {
    itens.slice(0, 3 + (i % 3)).forEach((item, k) => {
      saida.push({
        id: `epi-c-${c.id}-${k}`,
        pessoaId: c.id,
        pessoaNome: c.nome,
        item,
        em: diasAtras(Math.floor(entre(rnd, 5, 300))),
        assinado: rnd() > 0.12,
      });
    });
  });
  EMPREITEIROS.slice(0, 12).forEach((p, i) => {
    itens.slice(0, 2 + (i % 3)).forEach((item, k) => {
      saida.push({
        id: `epi-e-${p.id}-${k}`,
        pessoaId: p.id,
        pessoaNome: p.nome,
        item,
        em: diasAtras(Math.floor(entre(rnd, 2, 120))),
        assinado: rnd() > 0.2,
      });
    });
  });
  return saida;
}
const EPIS: readonly EntregaDeEpi[] = construirEpis();

const FORNECEDORES: readonly Fornecedor[] = [
  {
    id: 'f-1',
    nome: 'Concrebase Usinagem',
    familiaId: 'concreto',
    cidade: 'Serra Azul',
    avaliacao: 88,
    prazoMedioDias: 2,
    estado: 'ativo',
  },
  {
    id: 'f-2',
    nome: 'Ferro & Cia Distribuidora',
    familiaId: 'aco',
    cidade: 'Vila Aurora',
    avaliacao: 74,
    prazoMedioDias: 9,
    estado: 'ativo',
  },
  {
    id: 'f-3',
    nome: 'Asfaltec Massa Asfáltica',
    familiaId: 'asfalto',
    cidade: 'Porto Cristalino',
    avaliacao: 91,
    prazoMedioDias: 3,
    estado: 'ativo',
  },
  {
    id: 'f-4',
    nome: 'Cerâmica Vale Norte',
    familiaId: 'ceramica',
    cidade: 'Serra Azul',
    avaliacao: 69,
    prazoMedioDias: 12,
    estado: 'ativo',
  },
  {
    id: 'f-5',
    nome: 'Elétrica Central',
    familiaId: 'eletrico',
    cidade: 'Vila Aurora',
    avaliacao: 82,
    prazoMedioDias: 5,
    estado: 'ativo',
  },
  {
    id: 'f-6',
    nome: 'Hidrotudo Materiais',
    familiaId: 'hidraulico',
    cidade: 'Serra Azul',
    avaliacao: 77,
    prazoMedioDias: 6,
    estado: 'ativo',
  },
  {
    id: 'f-7',
    nome: 'Madeireira Cerrado',
    familiaId: 'madeira',
    cidade: 'Porto Cristalino',
    avaliacao: 85,
    prazoMedioDias: 4,
    estado: 'ativo',
  },
  {
    id: 'f-8',
    nome: 'Protege EPI',
    familiaId: 'epi',
    cidade: 'Vila Aurora',
    avaliacao: 94,
    prazoMedioDias: 3,
    estado: 'ativo',
  },
  {
    id: 'f-9',
    nome: 'Britagem Rio Claro',
    familiaId: 'asfalto',
    cidade: 'Serra Azul',
    avaliacao: 58,
    prazoMedioDias: 15,
    estado: 'arquivado',
  },
];

const CATALOGO: ReadonlyArray<readonly [string, string, string, number, number]> = [
  // família, descrição, unidade, quantidade típica, preço unitário em centavos
  ['concreto', 'Concreto usinado fck 25 MPa', 'm³', 24, 61_200],
  ['concreto', 'Cimento CP-II 50 kg', 'sc', 120, 4_180],
  ['aco', 'Aço CA-50 10 mm', 'kg', 1_800, 1_180],
  ['aco', 'Tela soldada Q-196', 'm²', 320, 3_640],
  ['asfalto', 'CBUQ faixa C', 't', 90, 89_400],
  ['asfalto', 'Brita graduada simples', 'm³', 180, 14_800],
  ['ceramica', 'Piso cerâmico 60×60 PEI-5', 'm²', 240, 9_620],
  ['eletrico', 'Cabo flexível 2,5 mm²', 'm', 900, 480],
  ['hidraulico', 'Tubo PVC soldável 50 mm', 'm', 240, 1_860],
  ['madeira', 'Compensado plastificado 18 mm', 'ch', 60, 18_900],
  ['epi', 'Capacete classe B com jugular', 'un', 30, 4_200],
];

function construirCompras(): Compra[] {
  const rnd = semente(7733);
  const saida: Compra[] = [];
  for (let i = 0; i < 42; i += 1) {
    const obra = sorteiaObra(rnd);
    const [familiaId, descricao, unidade, qtdBase, preco] = CATALOGO[i % CATALOGO.length];
    const quantidade = Math.round(qtdBase * entre(rnd, 0.6, 1.5));
    const candidatos = FORNECEDORES.filter(
      (f) => f.familiaId === familiaId && f.estado === 'ativo',
    );
    const cotacoes = (candidatos.length > 0 ? candidatos : FORNECEDORES.slice(0, 3))
      .slice(0, 3)
      .map((f) => ({
        fornecedorId: f.id,
        valorCents: Math.round((quantidade * preco * entre(rnd, 0.92, 1.14)) / 1_000) * 1_000,
      }));
    const melhor = [...cotacoes].sort((a, b) => a.valorCents - b.valorCents)[0];
    const sorte = rnd();
    const estado: EstadoCompra =
      sorte > 0.88
        ? 'requisitada'
        : sorte > 0.78
          ? 'cotando'
          : sorte > 0.62
            ? 'pedida'
            : sorte > 0.06
              ? 'recebida'
              : 'cancelada';
    const requisitadaEm = diasAtras(Math.floor(entre(rnd, 1, 120)));
    saida.push({
      id: `co-${i}`,
      obraId: obra.id,
      familiaId,
      descricao,
      unidade,
      quantidade,
      requisitadaEm,
      requisitadaPor: obra.encarregado,
      estado,
      cotacoes,
      fornecedorEscolhido:
        estado === 'requisitada' || estado === 'cotando' ? null : melhor.fornecedorId,
      valorCents: estado === 'requisitada' || estado === 'cotando' ? 0 : melhor.valorCents,
      recebidaEm:
        estado === 'recebida'
          ? diasAtras(Math.max(0, diasDesde(requisitadaEm) - Math.floor(entre(rnd, 2, 14))))
          : null,
      // ⭐ A divergência de recebimento: o que chegou a menos do que foi pedido.
      divergencia:
        estado === 'recebida' && rnd() > 0.78
          ? -Math.round(quantidade * entre(rnd, 0.03, 0.12))
          : 0,
      motivoCancelamento: estado === 'cancelada' ? 'Serviço remanejado para outra frente' : null,
    });
  }
  return saida;
}
const COMPRAS: readonly Compra[] = construirCompras();

const EQUIPAMENTOS: readonly Equipamento[] = [
  {
    id: 'eq-1',
    nome: 'Betoneira 400 L',
    patrimonio: 'BT-014',
    obraId: 'creche',
    desde: diasAtras(140),
    horimetro: 1_842,
    proximaManutencaoHoras: 1_900,
    estado: 'operando',
  },
  {
    id: 'eq-2',
    nome: 'Rolo compactador CA-15',
    patrimonio: 'RC-003',
    obraId: 'pavimentacao',
    desde: diasAtras(310),
    horimetro: 4_610,
    proximaManutencaoHoras: 4_500,
    estado: 'manutencao',
  },
  {
    id: 'eq-3',
    nome: 'Caminhão basculante 6 m³',
    patrimonio: 'CB-021',
    obraId: 'pavimentacao',
    desde: diasAtras(300),
    horimetro: 8_930,
    proximaManutencaoHoras: 9_200,
    estado: 'operando',
  },
  {
    id: 'eq-4',
    nome: 'Retroescavadeira',
    patrimonio: 'RT-007',
    obraId: 'creche',
    desde: diasAtras(88),
    horimetro: 6_204,
    proximaManutencaoHoras: 6_400,
    estado: 'operando',
  },
  {
    id: 'eq-5',
    nome: 'Andaime tubular — 40 m',
    patrimonio: 'AN-052',
    obraId: 'ubs',
    desde: diasAtras(70),
    horimetro: 0,
    proximaManutencaoHoras: 0,
    estado: 'operando',
  },
  {
    id: 'eq-6',
    nome: 'Vibrador de imersão',
    patrimonio: 'VI-011',
    obraId: 'creche',
    desde: diasAtras(140),
    horimetro: 912,
    proximaManutencaoHoras: 800,
    estado: 'parado',
  },
  {
    id: 'eq-7',
    nome: 'Placa vibratória',
    patrimonio: 'PV-009',
    obraId: 'ubs',
    desde: diasAtras(60),
    horimetro: 1_120,
    proximaManutencaoHoras: 1_400,
    estado: 'operando',
  },
];

function construirCustos(): CustoDaObra[] {
  const rnd = semente(8844);
  const saida: CustoDaObra[] = [];
  // O custo real da obra é a soma do que ela consumiu: compras recebidas,
  // empreitas quitadas, folha da equipe própria e hora de equipamento.
  for (const c of COMPRAS.filter((x) => x.estado === 'recebida')) {
    saida.push({
      id: `cu-co-${c.id}`,
      obraId: c.obraId,
      familiaId: c.familiaId,
      descricao: c.descricao,
      em: c.recebidaEm!,
      valorCents: c.valorCents,
      origem: 'compra',
    });
  }
  for (const e of EMPREITAS.filter((x) => x.estado === 'quitada')) {
    saida.push({
      id: `cu-e-${e.id}`,
      obraId: e.obraId,
      familiaId: 'madeira',
      descricao: `Empreita — ${e.objeto}`,
      em: e.quitacaoEm!,
      valorCents: e.valorGlobalCents,
      origem: 'empreita',
    });
  }
  for (const obra of OBRAS) {
    for (let m = 0; m < 6; m += 1) {
      const escala = obra.contratoCents / PESO_TOTAL;
      saida.push({
        id: `cu-f-${obra.id}-${m}`,
        obraId: obra.id,
        familiaId: 'epi',
        descricao: 'Folha da equipe própria',
        em: diasAtras(m * 30 + 5),
        valorCents: Math.round((entre(rnd, 3_600_000, 5_600_000) * escala) / 10_000) * 10_000,
        origem: 'folha',
      });
    }
  }
  for (const eq of EQUIPAMENTOS) {
    saida.push({
      id: `cu-eq-${eq.id}`,
      obraId: eq.obraId,
      familiaId: 'madeira',
      descricao: `Operação e manutenção — ${eq.nome}`,
      em: diasAtras(Math.floor(entre(rnd, 5, 90))),
      valorCents: Math.round(entre(rnd, 400_000, 2_400_000) / 10_000) * 10_000,
      origem: 'equipamento',
    });
  }
  return saida;
}
const CUSTOS: readonly CustoDaObra[] = construirCustos();

function construirContas(): ContaAPagar[] {
  const rnd = semente(9955);
  const saida: ContaAPagar[] = [];
  COMPRAS.filter((c) => c.estado === 'pedida' || c.estado === 'recebida').forEach((c, i) => {
    const forn = FORNECEDORES.find((f) => f.id === c.fornecedorEscolhido);
    const vence = diasAtras(Math.floor(entre(rnd, -25, 40)));
    saida.push({
      id: `cp-${i}`,
      obraId: c.obraId,
      favorecido: forn?.nome ?? 'Fornecedor',
      descricao: c.descricao,
      vence,
      valorCents: c.valorCents,
      pagoEm: diasDesde(vence) > 0 && rnd() > 0.25 ? vence : null,
    });
  });
  EMPREITAS.filter((e) => e.estado === 'entregue').forEach((e, i) => {
    const emp = EMPREITEIROS.find((p) => p.id === e.empreiteiroId);
    saida.push({
      id: `cp-e-${i}`,
      obraId: e.obraId,
      favorecido: emp?.nome ?? 'Empreiteiro',
      descricao: `Parcela de aceite — ${e.objeto}`,
      vence: diasAFrente(Math.floor(entre(rnd, 1, 20))),
      valorCents: Math.round(e.valorGlobalCents * 0.7),
      pagoEm: null,
    });
  });
  return saida;
}
const CONTAS: readonly ContaAPagar[] = construirContas();

function construirPendencias(): Pendencia[] {
  const saida: Pendencia[] = [];
  for (const o of OFICIOS.filter((x) => x.estado === 'recebido' || x.estado === 'vencido')) {
    saida.push({
      id: `pd-of-${o.id}`,
      setorId: 'obras',
      obraId: o.obraId,
      titulo: `Responder ${o.numero} — ${o.assunto}`,
      abertaEm: o.em,
      responsavel: o.responsavel,
    });
  }
  for (const c of COMPRAS.filter((x) => x.estado === 'requisitada' || x.estado === 'cotando')) {
    saida.push({
      id: `pd-co-${c.id}`,
      setorId: 'suprimentos',
      obraId: c.obraId,
      titulo: `${c.estado === 'cotando' ? 'Fechar cotação' : 'Cotar'} — ${c.descricao}`,
      abertaEm: c.requisitadaEm,
      responsavel: 'Suprimentos',
    });
  }
  for (const c of COMPRAS.filter((x) => x.divergencia !== 0)) {
    saida.push({
      id: `pd-dv-${c.id}`,
      setorId: 'suprimentos',
      obraId: c.obraId,
      titulo: `Tratar divergência de recebimento — ${c.descricao}`,
      abertaEm: c.recebidaEm!,
      responsavel: 'Almoxarifado',
    });
  }
  for (const d of DOCUMENTOS.filter((x) => diasAte(x.vence) <= 15)) {
    saida.push({
      id: `pd-doc-${d.id}`,
      setorId: 'documentos',
      obraId: d.titularKind === 'obra' ? d.titularId : null,
      titulo: `Renovar documento de ${d.titularNome}`,
      abertaEm: diasAtras(10),
      responsavel: 'Documentos',
    });
  }
  for (const e of EQUIPAMENTOS.filter((x) => x.estado !== 'operando')) {
    saida.push({
      id: `pd-eq-${e.id}`,
      setorId: 'suprimentos',
      obraId: e.obraId,
      titulo: `Equipamento ${e.estado === 'parado' ? 'parado' : 'em manutenção'} — ${e.nome}`,
      abertaEm: diasAtras(e.estado === 'parado' ? 22 : 6),
      responsavel: 'Manutenção',
    });
  }
  for (const m of MEDICOES.filter((x) => x.aceitoCents > 0 && x.pagoCents === 0)) {
    saida.push({
      id: `pd-me-${m.id}`,
      setorId: 'financeiro',
      obraId: m.obraId,
      titulo: `Cobrar pagamento da medição ${m.numero}`,
      abertaEm: m.dataAceite!,
      responsavel: 'Financeiro',
    });
  }
  for (const f of OBRAS) {
    const semDiario = DIARIO.filter((d) => d.obraId === f.id && d.cancelada === null);
    if (semDiario.length > 0 && diasDesde(semDiario[0].data) >= 3) {
      saida.push({
        id: `pd-di-${f.id}`,
        setorId: 'obras',
        obraId: f.id,
        titulo: `Diário de obra em atraso — ${f.nome}`,
        abertaEm: semDiario[0].data,
        responsavel: f.encarregado,
      });
    }
  }
  return saida;
}
const PENDENCIAS: readonly Pendencia[] = construirPendencias();

// ─────────────────────────────────────────────────────────────────────────────
// O MUNDO
// ─────────────────────────────────────────────────────────────────────────────

export const MUNDO: Mundo = {
  prefeituras: PREFEITURAS,
  obras: OBRAS,
  itens: ITENS,
  medicoes: MEDICOES,
  consumos: CONSUMOS,
  empreiteiros: EMPREITEIROS,
  documentos: DOCUMENTOS,
  empreitas: EMPREITAS,
  propostas: PROPOSTAS,
  diario: DIARIO,
  contratos: CONTRATOS,
  aditivos: ADITIVOS,
  oficios: OFICIOS,
  visitas: VISITAS,
  colaboradores: COLABORADORES,
  treinamentos: TREINAMENTOS,
  episEntregues: EPIS,
  fornecedores: FORNECEDORES,
  compras: COMPRAS,
  equipamentos: EQUIPAMENTOS,
  custos: CUSTOS,
  contasAPagar: CONTAS,
  pendencias: PENDENCIAS,
  // ⚖️ Valores de EXEMPLO, os quatro. Quem define é o jurídico da empresa — e a
  // tela de Configurações diz isso com todas as letras.
  reguaConcentracao: {
    empreitasConsecutivas: 8,
    diasSemIntervalo: 25,
    pctRecusaMinimo: 10,
    outrasEmpresasMinimo: 1,
  },
};
