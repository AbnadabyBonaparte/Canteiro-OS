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

/**
 * ⚖️ A FORMA DE CONTRATAR O EMPREITEIRO.
 *
 * Empreitada é contrato de RESULTADO (Código Civil, arts. 610–626): entrega-se
 * uma obra ou parte dela por um valor global combinado, com autonomia de meios.
 * Quem entrega pode ser pessoa física ou jurídica — e é isso que esta lista
 * nomeia. ⛔ Não confundir com vínculo de emprego: a equipe CLT da empresa vive
 * em `/equipe`, não aqui.
 */
export const MODALIDADES: readonly ItemTaxonomia[] = [
  { id: 'mei', nome: 'MEI', ordem: 1 },
  { id: 'me-epp', nome: 'Empresa (ME/EPP)', ordem: 2 },
  { id: 'pf', nome: 'Pessoa física', ordem: 3 },
  { id: 'cooperado', nome: 'Cooperado', ordem: 4 },
];

/** O que a empreita entrega. Vocabulário de cada casa — nunca enum. */
export const OBJETOS_DE_EMPREITA: readonly ItemTaxonomia[] = [
  { id: 'alvenaria', nome: 'Alvenaria de vedação', ordem: 1 },
  { id: 'reboco', nome: 'Reboco e emboço', ordem: 2 },
  { id: 'contrapiso', nome: 'Contrapiso', ordem: 3 },
  { id: 'ceramica', nome: 'Assentamento de cerâmica', ordem: 4 },
  { id: 'forma-armacao', nome: 'Fôrma e armação', ordem: 5 },
  { id: 'cobertura', nome: 'Estrutura de cobertura', ordem: 6 },
  { id: 'eletrica', nome: 'Instalação elétrica', ordem: 7 },
  { id: 'hidraulica', nome: 'Instalação hidráulica', ordem: 8 },
  { id: 'pintura', nome: 'Pintura', ordem: 9 },
  { id: 'meio-fio', nome: 'Meio-fio e sarjeta', ordem: 10 },
  { id: 'sinalizacao', nome: 'Sinalização viária', ordem: 11 },
  { id: 'demolicao', nome: 'Demolição e remoção', ordem: 12 },
];

/** Como o contrato com o órgão público muda de tamanho ou de prazo. */
export const TIPOS_DE_ADITIVO: readonly ItemTaxonomia[] = [
  { id: 'valor-acrescimo', nome: 'Acréscimo de valor', ordem: 1 },
  { id: 'valor-supressao', nome: 'Supressão de valor', ordem: 2 },
  { id: 'prazo', nome: 'Prorrogação de prazo', ordem: 3 },
  { id: 'reequilibrio', nome: 'Reequilíbrio econômico-financeiro', ordem: 4 },
  { id: 'reajuste', nome: 'Reajuste contratual', ordem: 5 },
];

/** O que chega e o que sai na relação com o órgão. */
export const TIPOS_DE_OFICIO: readonly ItemTaxonomia[] = [
  { id: 'exigencia', nome: 'Exigência técnica', ordem: 1 },
  { id: 'notificacao', nome: 'Notificação', ordem: 2 },
  { id: 'solicitacao', nome: 'Solicitação de documento', ordem: 3 },
  { id: 'resposta', nome: 'Resposta da empresa', ordem: 4 },
  { id: 'comunicado', nome: 'Comunicado', ordem: 5 },
];

/** Os setores do sistema — é assim que a empresa divide o próprio trabalho. */
export const SETORES: readonly ItemTaxonomia[] = [
  { id: 'direcao', nome: 'Direção', ordem: 1 },
  { id: 'obras', nome: 'Obras', ordem: 2 },
  { id: 'pessoas', nome: 'Pessoas', ordem: 3 },
  { id: 'suprimentos', nome: 'Suprimentos', ordem: 4 },
  { id: 'financeiro', nome: 'Financeiro', ordem: 5 },
  { id: 'documentos', nome: 'Documentos', ordem: 6 },
];

/** Famílias de material — a curva ABC se apoia nelas. */
export const FAMILIAS_DE_MATERIAL: readonly ItemTaxonomia[] = [
  { id: 'concreto', nome: 'Concreto e cimento', ordem: 1 },
  { id: 'aco', nome: 'Aço e ferragem', ordem: 2 },
  { id: 'asfalto', nome: 'Asfalto e brita', ordem: 3 },
  { id: 'ceramica', nome: 'Cerâmica e revestimento', ordem: 4 },
  { id: 'eletrico', nome: 'Material elétrico', ordem: 5 },
  { id: 'hidraulico', nome: 'Material hidráulico', ordem: 6 },
  { id: 'madeira', nome: 'Madeira e fôrma', ordem: 7 },
  { id: 'epi', nome: 'EPI e segurança', ordem: 8 },
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
  { id: 'nr10', nome: 'NR-10', ordem: 4 },
  { id: 'cnd', nome: 'Certidão negativa (CND)', ordem: 5 },
  { id: 'fgts', nome: 'Certidão de FGTS', ordem: 6 },
  { id: 'trabalhista', nome: 'Certidão trabalhista', ordem: 7 },
  { id: 'art', nome: 'ART', ordem: 8 },
  { id: 'rrt', nome: 'RRT', ordem: 9 },
  { id: 'cno', nome: 'CNO', ordem: 10 },
  { id: 'alvara', nome: 'Alvará de construção', ordem: 11 },
  { id: 'apolice', nome: 'Apólice de seguro', ordem: 12 },
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
