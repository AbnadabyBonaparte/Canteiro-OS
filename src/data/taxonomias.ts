/**
 * TAXONOMIAS — as listas que na vitrine são mock e no produto são DADO DO TENANT.
 *
 * ⚖️ LEI ANTI-VIÉS: nada disto pode virar `enum` na tela. Tipo de obra,
 * especialidade, motivo de glosa, motivo de ocorrência e gravidade são
 * vocabulário de cada empresa — congelá-los no componente faria a migração
 * para `packages/` do Business OS virar reescrita em vez de cópia.
 *
 * Quem for migrar: estes arrays viram tabelas `<modulo>.<coisa>` com
 * `tenant_id`, nome livre e posição. Ver docs/MIGRACAO.md.
 */

export interface ItemTaxonomia {
  readonly id: string;
  readonly nome: string;
  /** Ordem de exibição. No produto, coluna `position`. */
  readonly ordem: number;
}

export interface ItemGravidade extends ItemTaxonomia {
  /** Óxido = para a obra. Latão = exige decisão. Oliva = segue. */
  readonly tom: 'rust' | 'gold' | 'olive';
}

export const TIPOS_DE_OBRA: readonly ItemTaxonomia[] = [
  { id: 'edificacao', nome: 'Edificação', ordem: 1 },
  { id: 'pavimentacao', nome: 'Pavimentação', ordem: 2 },
  { id: 'reforma', nome: 'Reforma', ordem: 3 },
  { id: 'saneamento', nome: 'Saneamento', ordem: 4 },
  { id: 'drenagem', nome: 'Drenagem', ordem: 5 },
];

export const ESPECIALIDADES: readonly ItemTaxonomia[] = [
  { id: 'pedreiro', nome: 'Pedreiro', ordem: 1 },
  { id: 'servente', nome: 'Servente', ordem: 2 },
  { id: 'armador', nome: 'Armador', ordem: 3 },
  { id: 'carpinteiro', nome: 'Carpinteiro', ordem: 4 },
  { id: 'eletricista', nome: 'Eletricista', ordem: 5 },
  { id: 'encanador', nome: 'Encanador', ordem: 6 },
  { id: 'pintor', nome: 'Pintor', ordem: 7 },
  { id: 'operador', nome: 'Operador de máquina', ordem: 8 },
];

export const MODALIDADES: readonly ItemTaxonomia[] = [
  { id: 'mei', nome: 'MEI', ordem: 1 },
  { id: 'autonomo', nome: 'Autônomo', ordem: 2 },
  { id: 'intermitente', nome: 'Intermitente', ordem: 3 },
  { id: 'clt', nome: 'CLT', ordem: 4 },
];

export const MOTIVOS_DE_GLOSA: readonly ItemTaxonomia[] = [
  { id: 'nao-executado', nome: 'Serviço não executado no período', ordem: 1 },
  { id: 'quantidade', nome: 'Quantidade divergente da vistoria', ordem: 2 },
  { id: 'especificacao', nome: 'Material fora de especificação', ordem: 3 },
  { id: 'documentacao', nome: 'Falta de documentação técnica', ordem: 4 },
  { id: 'refazimento', nome: 'Serviço em refazimento', ordem: 5 },
];

export const MOTIVOS_DE_OCORRENCIA: readonly ItemTaxonomia[] = [
  { id: 'chuva', nome: 'Chuva', ordem: 1 },
  { id: 'falta-material', nome: 'Falta de material', ordem: 2 },
  { id: 'efetivo-abaixo', nome: 'Efetivo abaixo do previsto', ordem: 3 },
  { id: 'visita-fiscal', nome: 'Visita do fiscal', ordem: 4 },
  { id: 'quase-acidente', nome: 'Quase-acidente', ordem: 5 },
  { id: 'acidente', nome: 'Acidente', ordem: 6 },
  { id: 'equipamento', nome: 'Equipamento parado', ordem: 7 },
  { id: 'outro', nome: 'Outro', ordem: 8 },
];

export const GRAVIDADES: readonly ItemGravidade[] = [
  { id: 'rotina', nome: 'Rotina', ordem: 1, tom: 'olive' },
  { id: 'atencao', nome: 'Atenção', ordem: 2, tom: 'gold' },
  { id: 'paralisa', nome: 'Paralisa a frente', ordem: 3, tom: 'rust' },
];

export const TIPOS_DE_DOCUMENTO: readonly ItemTaxonomia[] = [
  { id: 'aso', nome: 'ASO', ordem: 1 },
  { id: 'nr18', nome: 'NR-18', ordem: 2 },
  { id: 'nr35', nome: 'NR-35', ordem: 3 },
  { id: 'cnd', nome: 'Certidão negativa (CND)', ordem: 4 },
  { id: 'fgts', nome: 'Certidão de FGTS', ordem: 5 },
  { id: 'trabalhista', nome: 'Certidão trabalhista', ordem: 6 },
  { id: 'art', nome: 'ART', ordem: 7 },
  { id: 'cno', nome: 'CNO', ordem: 8 },
];

export const UNIDADES: readonly ItemTaxonomia[] = [
  { id: 'm2', nome: 'm²', ordem: 1 },
  { id: 'm3', nome: 'm³', ordem: 2 },
  { id: 'm', nome: 'm', ordem: 3 },
  { id: 'un', nome: 'un', ordem: 4 },
  { id: 'kg', nome: 'kg', ordem: 5 },
  { id: 'vb', nome: 'vb', ordem: 6 },
];

export const FRENTES: readonly ItemTaxonomia[] = [
  { id: 'fundacao', nome: 'Fundação', ordem: 1 },
  { id: 'estrutura', nome: 'Estrutura', ordem: 2 },
  { id: 'alvenaria', nome: 'Alvenaria', ordem: 3 },
  { id: 'cobertura', nome: 'Cobertura', ordem: 4 },
  { id: 'hidraulica', nome: 'Hidráulica', ordem: 5 },
  { id: 'eletrica', nome: 'Elétrica', ordem: 6 },
  { id: 'acabamento', nome: 'Acabamento', ordem: 7 },
  { id: 'terraplanagem', nome: 'Terraplanagem', ordem: 8 },
  { id: 'base', nome: 'Base e sub-base', ordem: 9 },
  { id: 'asfalto', nome: 'Capa asfáltica', ordem: 10 },
  { id: 'sinalizacao', nome: 'Sinalização', ordem: 11 },
  { id: 'demolicao', nome: 'Demolição', ordem: 12 },
];

export const CLIMAS: readonly ItemTaxonomia[] = [
  { id: 'sol', nome: 'Sol', ordem: 1 },
  { id: 'nublado', nome: 'Nublado', ordem: 2 },
  { id: 'chuva-fraca', nome: 'Chuva fraca', ordem: 3 },
  { id: 'chuva-forte', nome: 'Chuva forte', ordem: 4 },
];

/** Busca por id com fallback honesto — nunca devolve `undefined` para a tela. */
export function nomeDe(lista: readonly ItemTaxonomia[], id: string): string {
  return lista.find((i) => i.id === id)?.nome ?? id;
}
