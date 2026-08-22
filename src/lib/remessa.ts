/**
 * A REMESSA — as contas da guia de transporte, em funções puras.
 *
 * ⭐ Espelho fiel do módulo `remessa` do Business OS (PR #105): os mesmos
 * nomes, a mesma ordem, a mesma física. Quando o produto ligar, a mesa já
 * conhece a tela — é essa a razão de a vitrine existir.
 *
 * ⛔ **Nenhum estado é coluna.** A operação está ativa porque tem assinatura;
 * o documento está autorizado porque existe o evento; a pendência de retorno é
 * a conta de quem saiu e não voltou. Igual ao produto, e por isso a migração
 * não vai precisar reaprender nada.
 *
 * ⚠️ **E nada aqui escolhe CFOP.** O código vem do cardápio, que veio de quem
 * assinou. Um `case` de CFOP neste arquivo seria a ALSHAM praticando ato de
 * contador.
 */

import type {
  DocumentoFiscal,
  EventoRemessa,
  Motorista,
  Mundo,
  OperacaoFiscal,
  Remessa,
  Veiculo,
} from '@/data/seed';
import { diasDesde } from '@/data/seed';

/** O cardápio como a tela o oferece: o que dá para apertar, e por quê. */
export interface ItemDeCardapio {
  readonly operacao: OperacaoFiscal;
  readonly usavel: boolean;
  readonly nota: string;
}

/**
 * ⭐⭐ A operação NÃO assinada **continua na lista**, em cinza, com o motivo.
 *
 * Sumir seria pior: o encarregado procuraria o botão, não acharia, e gastaria a
 * manhã de alguém no telefone. Aparecendo com o motivo, a dúvida morre na tela.
 */
export function cardapio(mundo: Mundo): readonly ItemDeCardapio[] {
  return mundo.operacoesFiscais.map((operacao) => ({
    operacao,
    usavel: operacao.assinatura !== null,
    nota:
      operacao.assinatura === null
        ? 'aguardando assinatura do contador da empresa — nada sai por esta operação'
        : `assinada por ${operacao.assinatura.por}`,
  }));
}

export function operacaoDe(mundo: Mundo, id: string): OperacaoFiscal | undefined {
  return mundo.operacoesFiscais.find((o) => o.id === id);
}

export function veiculoDe(mundo: Mundo, id: string): Veiculo | undefined {
  return mundo.veiculos.find((v) => v.id === id);
}

export function motoristaDe(mundo: Mundo, id: string): Motorista | undefined {
  return mundo.motoristas.find((m) => m.id === id);
}

export function documentosDe(mundo: Mundo, remessaId: string): readonly DocumentoFiscal[] {
  return mundo.documentosFiscais.filter((d) => d.remessaId === remessaId);
}

export function eventosDe(mundo: Mundo, remessaId: string): readonly EventoRemessa[] {
  return mundo.eventosRemessa
    .filter((e) => e.remessaId === remessaId)
    .slice()
    .sort((a, b) => a.registradoEm.localeCompare(b.registradoEm));
}

// ─────────────────────────────────────────────────────────────────────────────
// O ESTADO DO DOCUMENTO — do livro, nunca de coluna
// ─────────────────────────────────────────────────────────────────────────────

export type EstadoDocumento = 'autorizado' | 'encerrado';

export function estadoDoDocumento(mundo: Mundo, documentoId: string): EstadoDocumento {
  const encerrado = mundo.eventosRemessa.some(
    (e) => e.documentoId === documentoId && e.tipo === 'manifesto-encerrado',
  );
  return encerrado ? 'encerrado' : 'autorizado';
}

export function frasedoEstado(estado: EstadoDocumento): string {
  return estado === 'encerrado' ? 'Encerrado na chegada' : 'Autorizado';
}

// ─────────────────────────────────────────────────────────────────────────────
// ⭐⭐ O MANIFESTO EM ABERTO TRAVA O PRÓXIMO
// A regra que quase ninguém conta ao cliente — e a razão de existir o "Chegou".
// ─────────────────────────────────────────────────────────────────────────────

export interface ManifestoAberto {
  readonly documento: DocumentoFiscal;
  readonly remessa: Remessa;
  readonly diasAberto: number;
}

export function manifestosAbertos(mundo: Mundo): readonly ManifestoAberto[] {
  return mundo.documentosFiscais
    .filter((d) => d.tipo === 'mdfe' && estadoDoDocumento(mundo, d.id) === 'autorizado')
    .map((documento) => {
      const remessa = mundo.remessas.find((r) => r.id === documento.remessaId)!;
      return { documento, remessa, diasAberto: diasDesde(documento.emitidoEm) };
    })
    .filter((m) => m.remessa !== undefined && m.remessa.cancelada === null);
}

/**
 * ⚠️ **A trava é do CAMINHÃO, não da empresa.** A recusa da SEFAZ é por veículo:
 * com um manifesto em aberto naquela placa, o próximo daquela placa não sai — e
 * o de outro caminhão sai normalmente.
 *
 * Escrever "trava a empresa inteira" seria mais assustador e mais fácil de
 * vender, e seria mentira. Do jeito certo, a saída também aparece: encerra o
 * manifesto ou manda no outro caminhão.
 */
export function manifestoAbertoDoVeiculo(
  mundo: Mundo,
  veiculoId: string,
): ManifestoAberto | undefined {
  return manifestosAbertos(mundo).find((m) => m.remessa.veiculoId === veiculoId);
}

export function travaDoManifesto(mundo: Mundo): {
  readonly travado: boolean;
  readonly frase: string;
} {
  const abertos = manifestosAbertos(mundo);
  if (abertos.length === 0) return { travado: false, frase: '' };

  const placas = abertos.map((m) => veiculoDe(mundo, m.remessa.veiculoId)?.placa ?? '—').join(', ');

  return {
    travado: true,
    frase:
      abertos.length === 1
        ? `O caminhão ${placas} está com manifesto em aberto. Enquanto não marcarem "Chegou" na entrega dele, ele não sai de novo — os outros caminhões saem normalmente.`
        : `${abertos.length} caminhões estão com manifesto em aberto (${placas}). Cada um deles só sai de novo depois que marcarem "Chegou" na entrega — os demais saem normalmente.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// A PENDÊNCIA DE RETORNO — contagem, nunca caixinha
// ─────────────────────────────────────────────────────────────────────────────

export interface PendenciaDeRetorno {
  readonly remessa: Remessa;
  readonly operacao: OperacaoFiscal;
  readonly diasFora: number;
  readonly foraDoPrazo: boolean;
}

export function pendenciasDeRetorno(mundo: Mundo): readonly PendenciaDeRetorno[] {
  const voltou = new Set(
    mundo.eventosRemessa.filter((e) => e.tipo === 'retorno-registrado').map((e) => e.remessaId),
  );

  return mundo.remessas
    .filter((r) => r.cancelada === null && !voltou.has(r.id))
    .map((remessa) => {
      const operacao = operacaoDe(mundo, remessa.operacaoId);
      if (!operacao || !operacao.exigeRetorno) return null;
      const diasFora = diasDesde(remessa.ocorreuEm);
      return {
        remessa,
        operacao,
        diasFora,
        foraDoPrazo: operacao.prazoRetornoDias !== null && diasFora > operacao.prazoRetornoDias,
      };
    })
    .filter((p): p is PendenciaDeRetorno => p !== null)
    .sort((a, b) => {
      if (a.foraDoPrazo !== b.foraDoPrazo) return a.foraDoPrazo ? -1 : 1;
      return b.diasFora - a.diasFora;
    });
}

export function frasePendencia(p: PendenciaDeRetorno): string {
  const dias = `${p.diasFora} ${p.diasFora === 1 ? 'dia' : 'dias'}`;
  if (p.foraDoPrazo && p.operacao.prazoRetornoDias !== null) {
    return `Fora há ${dias} — o prazo era ${p.operacao.prazoRetornoDias}. Saiu de ${p.remessa.origemRotulo} para ${p.remessa.destinoRotulo}.`;
  }
  return `Fora há ${dias}. Saiu de ${p.remessa.origemRotulo} para ${p.remessa.destinoRotulo}.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ⭐ ONDE O EQUIPAMENTO ESTÁ — e por que a remessa não decide isso sozinha
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ⭐⭐ **Dois atos, como no produto.** No Business OS, quem guarda o lugar é o
 * `pat` (`pat.transfers`), e a remessa é outro fato: o ato de transporte com
 * documento. A tela faz os dois, cada um pela sua porta.
 *
 * Aqui a vitrine espelha isso: esta função diz se o equipamento está **fora**
 * da obra dele por causa de uma remessa em aberto — e a mudança de obra só
 * acontece quando o retorno (ou a chegada ao destino) é registrado.
 */
export function equipamentoEmTransito(
  mundo: Mundo,
  equipamentoId: string,
): PendenciaDeRetorno | null {
  return (
    pendenciasDeRetorno(mundo).find((p) =>
      p.remessa.itens.some((i) => i.equipamentoId === equipamentoId),
    ) ?? null
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// A MARCA "REGISTRADO DEPOIS"
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ⭐ Não é punição: é a informação que decide se o registro sustenta ou não um
 * argumento, e é a primeira coisa que um auditor procura. Esconder seria
 * fabricar prova com o silêncio.
 */
export function marcaDeAtraso(remessa: Remessa): string | null {
  if (remessa.ocorreuEm === remessa.registradoEm) return null;
  const dias = diasDesde(remessa.ocorreuEm) - diasDesde(remessa.registradoEm);
  if (dias <= 0) return null;
  const distancia = `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
  return remessa.motivoDeAtraso.trim() === ''
    ? `registrado ${distancia} depois`
    : `registrado ${distancia} depois — ${remessa.motivoDeAtraso.trim()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// A VALIDAÇÃO DA TELA
// ─────────────────────────────────────────────────────────────────────────────

export interface RascunhoRemessa {
  readonly operacaoId: string;
  readonly equipamentoId: string;
  readonly origemRotulo: string;
  readonly destinoRotulo: string;
  readonly veiculoId: string;
  readonly motoristaId: string;
}

export interface Impedimento {
  readonly campo: string;
  readonly frase: string;
}

export function validar(mundo: Mundo, r: RascunhoRemessa): readonly Impedimento[] {
  const impedimentos: Impedimento[] = [];
  const operacao = operacaoDe(mundo, r.operacaoId);

  if (!operacao) {
    impedimentos.push({ campo: 'operacaoId', frase: 'Escolha uma operação do cardápio.' });
  } else if (operacao.assinatura === null) {
    impedimentos.push({
      campo: 'operacaoId',
      frase: `A operação "${operacao.rotulo}" ainda não foi assinada pelo contador da empresa. Nada sai por ela.`,
    });
  }

  if (r.equipamentoId.trim() === '') {
    impedimentos.push({ campo: 'equipamentoId', frase: 'Escolha o que vai sair.' });
  }
  if (r.origemRotulo.trim() === '') {
    impedimentos.push({ campo: 'origemRotulo', frase: 'Diga de onde está saindo.' });
  }
  if (r.destinoRotulo.trim() === '') {
    impedimentos.push({ campo: 'destinoRotulo', frase: 'Diga para onde vai.' });
  }
  if (r.veiculoId.trim() === '') {
    impedimentos.push({ campo: 'veiculoId', frase: 'Escolha o caminhão.' });
  }
  if (r.motoristaId.trim() === '') {
    impedimentos.push({ campo: 'motoristaId', frase: 'Escolha o motorista.' });
  }

  // ⭐⭐ A trava do manifesto, no lugar em que ela dói: ANTES de apertar o botão.
  // Descobrir isso na recusa da SEFAZ é o que faz a máquina esperar no pátio.
  if (operacao?.exigeManifesto && r.veiculoId.trim() !== '') {
    const aberto = manifestoAbertoDoVeiculo(mundo, r.veiculoId);
    if (aberto) {
      const placa = veiculoDe(mundo, r.veiculoId)?.placa ?? 'este caminhão';
      impedimentos.push({
        campo: 'veiculoId',
        frase: `O caminhão ${placa} está com o manifesto nº ${aberto.documento.numero} em aberto. Marque "Chegou" na entrega dele, ou mande em outro caminhão.`,
      });
    }
  }

  return impedimentos;
}
