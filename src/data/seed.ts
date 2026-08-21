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
  readonly titularKind: 'prestador' | 'obra' | 'empresa';
  readonly titularId: string;
  readonly titularNome: string;
  readonly vence: string;
}

export interface Prestador {
  readonly id: string;
  readonly nome: string;
  readonly especialidadeId: string;
  readonly modalidadeId: string;
  /** 0..100 — a régua do método, como o `vperf` do Business OS. */
  readonly avaliacao: number;
  readonly outrasEmpresas: number;
  readonly ferramentaPropria: boolean;
}

export interface Diaria {
  readonly id: string;
  readonly prestadorId: string;
  readonly obraId: string;
  readonly data: string;
  readonly encarregado: string;
  readonly valorCents: number;
  readonly documento: string;
}

export type EstadoResposta = 'aceitou' | 'recusou' | 'sem-resposta';

export interface RespostaChamado {
  readonly prestadorId: string;
  readonly estado: EstadoResposta;
  readonly hora: string | null;
  readonly motivo: string | null;
}

export interface Chamado {
  readonly id: string;
  readonly obraId: string;
  readonly especialidadeId: string;
  readonly vagas: number;
  readonly dataServico: string;
  readonly abertoEm: string;
  readonly encarregado: string;
  readonly respostas: readonly RespostaChamado[];
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

export interface Mundo {
  readonly prefeituras: readonly Prefeitura[];
  readonly obras: readonly Obra[];
  readonly itens: readonly ItemContrato[];
  readonly medicoes: readonly Medicao[];
  readonly consumos: readonly Consumo[];
  readonly prestadores: readonly Prestador[];
  readonly documentos: readonly Documento[];
  readonly diarias: readonly Diaria[];
  readonly chamados: readonly Chamado[];
  readonly diario: readonly EntradaDiario[];
  /** A régua de vínculo. Parâmetro do jurídico da empresa — ver §Lei da régua. */
  readonly reguaVinculo: { readonly diarias: number; readonly janelaDias: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// PREFEITURAS — fictícias, com padrões de pagamento deliberadamente diferentes
// ─────────────────────────────────────────────────────────────────────────────

const PREFEITURAS: readonly Prefeitura[] = [
  { id: 'serra-azul', nome: 'Prefeitura de Serra Azul', atrasoMedioDias: 45, fiscal: 'eng. A. Moreira' },
  { id: 'vila-aurora', nome: 'Prefeitura de Vila Aurora', atrasoMedioDias: 90, fiscal: 'eng.ª R. Caldas' },
  { id: 'porto-cristalino', nome: 'Prefeitura de Porto Cristalino', atrasoMedioDias: 20, fiscal: 'arq. D. Peixoto' },
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
    frentes: ['fundacao', 'estrutura', 'alvenaria', 'cobertura', 'hidraulica', 'eletrica', 'acabamento'],
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

  return saida.sort((a, b) => (a.obraId === b.obraId ? b.numero - a.numero : a.obraId < b.obraId ? -1 : 1));
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
  { obraId: 'creche', itemNumero: 3, quantidadeConsumida: 253.4 },   // concreto — o estouro
  { obraId: 'creche', itemNumero: 4, quantidadeConsumida: 11_100 },  // aço — dentro
  { obraId: 'creche', itemNumero: 6, quantidadeConsumida: 1_090 },   // alvenaria — dentro
  { obraId: 'pavimentacao', itemNumero: 6, quantidadeConsumida: 2_480 },
  { obraId: 'pavimentacao', itemNumero: 3, quantidadeConsumida: 3_180 },
  { obraId: 'ubs', itemNumero: 8, quantidadeConsumida: 236 },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRESTADORES — 40, nomes de fantasia
// ─────────────────────────────────────────────────────────────────────────────

const PRENOMES = [
  'Ronaldo', 'Marcos', 'Elias', 'Damião', 'Jonas', 'Sebastião', 'Valdir', 'Cícero',
  'Adenilson', 'Reginaldo', 'Ademir', 'Jucelino', 'Benedito', 'Edvaldo', 'Ozéias', 'Wanderley',
  'Gilmar', 'Nivaldo', 'Josimar', 'Aldemir', 'Wesley', 'Fabiano', 'Cleiton', 'Rogério',
  'Antenor', 'Lindomar', 'Sidnei', 'Odair', 'Everaldo', 'Genivaldo', 'Rubens', 'Tarcísio',
  'Waldemar', 'Ivanildo', 'Josué', 'Aluísio', 'Deusdete', 'Manoel', 'Nelson', 'Osvaldo',
];

const SOBRENOMES = [
  'B.', 'T.', 'S.', 'M.', 'P.', 'R.', 'C.', 'L.', 'A.', 'F.',
  'G.', 'D.', 'N.', 'V.', 'Q.', 'X.', 'J.', 'H.', 'E.', 'Z.',
];

function construirPrestadores(): Prestador[] {
  const rnd = semente(20260821);
  return PRENOMES.map((prenome, i) => ({
    id: `p${String(i + 1).padStart(2, '0')}`,
    nome: `${prenome} ${SOBRENOMES[i % SOBRENOMES.length]}`,
    especialidadeId: ESPECIALIDADES[i % ESPECIALIDADES.length].id,
    modalidadeId: MODALIDADES[i % MODALIDADES.length].id,
    avaliacao: Math.round(entre(rnd, 62, 98)),
    outrasEmpresas: Math.floor(entre(rnd, 0, 4)),
    ferramentaPropria: rnd() > 0.35,
  }));
}

const PRESTADORES: readonly Prestador[] = construirPrestadores().map((p) => {
  // ⭐ O caso do alerta: concentração alta, zero recusa, uma obra só.
  if (p.id === 'p01') {
    return { ...p, nome: 'Ronaldo B.', especialidadeId: 'pedreiro', modalidadeId: 'mei', avaliacao: 88, outrasEmpresas: 0, ferramentaPropria: false };
  }
  // ⭐ O contra-exemplo: autonomia de verdade. A demo precisa dos dois.
  if (p.id === 'p02') {
    return { ...p, nome: 'Marcos T.', especialidadeId: 'armador', modalidadeId: 'autonomo', avaliacao: 91, outrasEmpresas: 3, ferramentaPropria: true };
  }
  return p;
});

// ─────────────────────────────────────────────────────────────────────────────
// DIÁRIAS — inclusive as 22 seguidas do caso de alerta
// ─────────────────────────────────────────────────────────────────────────────

function construirDiarias(): Diaria[] {
  const saida: Diaria[] = [];
  const rnd = semente(4471);

  // ⭐ Ronaldo B.: 22 diárias seguidas na Creche, sempre com o mesmo encarregado.
  for (let d = 0; d < 22; d += 1) {
    saida.push({
      id: `d-r-${d}`,
      prestadorId: 'p01',
      obraId: 'creche',
      data: diasAtras(d + 1),
      encarregado: 'Sr. Aparecido',
      valorCents: 21_000,
      documento: 'NF-e MEI',
    });
  }

  // Marcos T.: 6 diárias espalhadas em 3 obras — o contra-exemplo.
  const espalhado: ReadonlyArray<readonly [string, number]> = [
    ['creche', 3], ['ubs', 8], ['pavimentacao', 12],
    ['ubs', 17], ['creche', 21], ['pavimentacao', 26],
  ];
  espalhado.forEach(([obraId, d], i) => {
    saida.push({
      id: `d-m-${i}`,
      prestadorId: 'p02',
      obraId,
      data: diasAtras(d),
      encarregado: OBRAS.find((o) => o.id === obraId)!.encarregado,
      valorCents: 24_000,
      documento: 'RPA',
    });
  });

  // O resto do canteiro: 3 a 9 diárias por prestador, espalhadas em 30 dias.
  for (const p of PRESTADORES.slice(2)) {
    const quantas = Math.floor(entre(rnd, 3, 10));
    for (let k = 0; k < quantas; k += 1) {
      const obra = OBRAS[Math.floor(entre(rnd, 0, OBRAS.length))];
      saida.push({
        id: `d-${p.id}-${k}`,
        prestadorId: p.id,
        obraId: obra.id,
        data: diasAtras(Math.floor(entre(rnd, 1, 31))),
        encarregado: obra.encarregado,
        valorCents: Math.round(entre(rnd, 17_000, 28_000) / 500) * 500,
        documento: rnd() > 0.5 ? 'NF-e MEI' : 'RPA',
      });
    }
  }

  return saida;
}

const DIARIAS: readonly Diaria[] = construirDiarias();

// ─────────────────────────────────────────────────────────────────────────────
// CHAMADOS — e a recusa, que é a prova de autonomia
// ─────────────────────────────────────────────────────────────────────────────

function construirChamados(): Chamado[] {
  const saida: Chamado[] = [];
  const rnd = semente(9099);

  // O chamado aberto — a cena da Tela 3.
  saida.push({
    id: 'c-aberto',
    obraId: 'creche',
    especialidadeId: 'pedreiro',
    vagas: 4,
    dataServico: diasAFrente(3),
    abertoEm: diasAtras(0),
    encarregado: 'Sr. Aparecido',
    respostas: [
      { prestadorId: 'p01', estado: 'aceitou', hora: '13:58', motivo: null },
      { prestadorId: 'p09', estado: 'aceitou', hora: '14:02', motivo: null },
      { prestadorId: 'p02', estado: 'recusou', hora: '14:11', motivo: 'Estou em outra obra até sexta' },
      { prestadorId: 'p17', estado: 'sem-resposta', hora: null, motivo: null },
    ],
  });

  // ⭐ 24 chamados ao Ronaldo, zero recusa — é isso que o alerta enxerga.
  for (let i = 0; i < 24; i += 1) {
    saida.push({
      id: `c-r-${i}`,
      obraId: 'creche',
      especialidadeId: 'pedreiro',
      vagas: 1,
      dataServico: diasAtras(i + 1),
      abertoEm: diasAtras(i + 2),
      encarregado: 'Sr. Aparecido',
      respostas: [{ prestadorId: 'p01', estado: 'aceitou', hora: '07:12', motivo: null }],
    });
  }

  // ⭐ 20 chamados ao Marcos, 9 recusados — o retrato da autonomia real.
  const motivosRecusa = [
    'Estou em outra obra', 'Já fechei a semana com outro cliente',
    'Não trabalho nessa frente', 'Distância inviável para mim',
  ];
  for (let i = 0; i < 20; i += 1) {
    const recusou = i % 2 === 0 && i < 18;
    saida.push({
      id: `c-m-${i}`,
      obraId: OBRAS[i % OBRAS.length].id,
      especialidadeId: 'armador',
      vagas: 1,
      dataServico: diasAtras(i + 1),
      abertoEm: diasAtras(i + 2),
      encarregado: OBRAS[i % OBRAS.length].encarregado,
      respostas: [
        {
          prestadorId: 'p02',
          estado: recusou ? 'recusou' : 'aceitou',
          hora: recusou ? '08:40' : '06:55',
          motivo: recusou ? motivosRecusa[i % motivosRecusa.length] : null,
        },
      ],
    });
  }

  // Chamados do resto do canteiro, para a lista não parecer encenada.
  for (let i = 0; i < 40; i += 1) {
    const p = PRESTADORES[3 + (i % (PRESTADORES.length - 3))];
    const obra = OBRAS[Math.floor(entre(rnd, 0, OBRAS.length))];
    const sorte = rnd();
    saida.push({
      id: `c-g-${i}`,
      obraId: obra.id,
      especialidadeId: p.especialidadeId,
      vagas: 1,
      dataServico: diasAtras(Math.floor(entre(rnd, 1, 31))),
      abertoEm: diasAtras(Math.floor(entre(rnd, 2, 32))),
      encarregado: obra.encarregado,
      respostas: [
        {
          prestadorId: p.id,
          estado: sorte > 0.72 ? 'recusou' : sorte > 0.62 ? 'sem-resposta' : 'aceitou',
          hora: sorte > 0.62 ? '09:20' : '07:05',
          motivo: sorte > 0.72 ? motivosRecusa[i % motivosRecusa.length] : null,
        },
      ],
    });
  }

  return saida;
}

const CHAMADOS: readonly Chamado[] = construirChamados();

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
  saida.push({ id: 'doc-cnd', tipoId: 'cnd', titularKind: 'empresa', titularId: 'empresa', titularNome: 'A empresa', vence: diasAFrente(74) });
  saida.push({ id: 'doc-trab', tipoId: 'trabalhista', titularKind: 'empresa', titularId: 'empresa', titularNome: 'A empresa', vence: diasAFrente(41) });

  for (const obra of OBRAS) {
    saida.push({ id: `doc-art-${obra.id}`, tipoId: 'art', titularKind: 'obra', titularId: obra.id, titularNome: obra.nome, vence: diasAFrente(Math.round(entre(rnd, 120, 300))) });
    saida.push({ id: `doc-cno-${obra.id}`, tipoId: 'cno', titularKind: 'obra', titularId: obra.id, titularNome: obra.nome, vence: diasAFrente(Math.round(entre(rnd, 200, 400))) });
  }

  // ⭐ 2 ASOs vencendo nesta semana — o maço da NR-18 que o auditor pede.
  saida.push({ id: 'doc-aso-p01', tipoId: 'aso', titularKind: 'prestador', titularId: 'p01', titularNome: 'Ronaldo B.', vence: diasAFrente(4) });
  saida.push({ id: 'doc-aso-p09', tipoId: 'aso', titularKind: 'prestador', titularId: 'p09', titularNome: PRESTADORES[8].nome, vence: diasAFrente(5) });
  // Um já vencido — a demo precisa mostrar o estado ruim, não só o quase-ruim.
  saida.push({ id: 'doc-nr35-p17', tipoId: 'nr35', titularKind: 'prestador', titularId: 'p17', titularNome: PRESTADORES[16].nome, vence: diasAtras(9) });

  for (const p of PRESTADORES.slice(2)) {
    saida.push({ id: `doc-aso-${p.id}`, tipoId: 'aso', titularKind: 'prestador', titularId: p.id, titularNome: p.nome, vence: diasAFrente(Math.round(entre(rnd, 30, 330))) });
    if (rnd() > 0.5) {
      saida.push({ id: `doc-nr18-${p.id}`, tipoId: 'nr18', titularKind: 'prestador', titularId: p.id, titularNome: p.nome, vence: diasAFrente(Math.round(entre(rnd, 20, 400))) });
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
  'Equipe reduzida — dois prestadores não compareceram.',
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
      if (motivos.length === 0) motivos.push(MOTIVOS_DE_OCORRENCIA[Math.floor(entre(rnd, 0, 3))].id);

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
        climaId: chuva ? (rnd() > 0.5 ? 'chuva-forte' : 'chuva-fraca') : rnd() > 0.5 ? 'sol' : 'nublado',
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

  return saida.sort((a, b) => (a.data === b.data ? b.hora.localeCompare(a.hora) : b.data.localeCompare(a.data)));
}

const DIARIO: readonly EntradaDiario[] = construirDiario();

// ─────────────────────────────────────────────────────────────────────────────
// O MUNDO
// ─────────────────────────────────────────────────────────────────────────────

export const MUNDO: Mundo = {
  prefeituras: PREFEITURAS,
  obras: OBRAS,
  itens: ITENS,
  medicoes: MEDICOES,
  consumos: CONSUMOS,
  prestadores: PRESTADORES,
  documentos: DOCUMENTOS,
  diarias: DIARIAS,
  chamados: CHAMADOS,
  diario: DIARIO,
  // ⚖️ Valor de EXEMPLO. Quem define é o jurídico da empresa — a tela diz isso.
  reguaVinculo: { diarias: 20, janelaDias: 30 },
};
