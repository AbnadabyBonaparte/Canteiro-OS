/**
 * ⭐⭐ O GERADOR DE PDF — escrito à mão, sem biblioteca nenhuma.
 *
 * **Por que à mão.** A vitrine não chama API, não carrega CDN e não instala
 * dependência para uma tela só. Um DANFE é uma folha com linhas, retângulos e
 * texto — e isso o formato PDF resolve com meia dúzia de operadores. O arquivo
 * que sai daqui é um **PDF de verdade**: abre no celular do motorista, imprime,
 * e não depende de nada estar no ar.
 *
 * **O que ele NÃO é.** ⛔ Não é DANFE nem DAMDFE de verdade. É a **cara** dos
 * dois, com os campos no lugar certo, para a mesa ver e tocar — e por isso todo
 * documento sai com o carimbo diagonal **"DEMONSTRAÇÃO — SEM VALOR FISCAL"**,
 * que não se apaga e não é opcional. O documento real é emitido por emissor
 * homologado, com o certificado da empresa (ver `docs/ROTEIRO-DEMO.md`).
 *
 * ⚠️ **Determinístico.** Nenhum `Date.now()`, nenhum `Math.random()`: tudo o que
 * varia entra por parâmetro. A demonstração conta a mesma história toda vez.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. O ENCANAMENTO DO FORMATO
// ─────────────────────────────────────────────────────────────────────────────

/** A4 em pontos — a unidade do PDF. Origem no canto INFERIOR esquerdo. */
const LARGURA = 595;
const ALTURA = 842;

/**
 * ⚠️ Acento em PDF não é UTF-8: as fontes base usam **WinAnsiEncoding**, que é
 * praticamente Latin-1. Sem esta conversão, "Remessa de bem do ativo" sai certo
 * e "manutenção" sai com caixinha. E o que não couber em Latin-1 vira `?` —
 * melhor um caractere honesto do que um byte que trava o leitor.
 */
function paraWinAnsi(texto: string): string {
  let saida = '';
  for (const ch of texto) {
    const c = ch.codePointAt(0)!;
    if (c === 0x2014 || c === 0x2013) {
      saida += '-'; // travessão e meia-risca não existem em Latin-1
    } else if (c === 0x201c || c === 0x201d) {
      saida += '"';
    } else if (c === 0x2018 || c === 0x2019) {
      saida += "'";
    } else if (c === 0x2192) {
      saida += '>'; // a seta do "de → para" também não existe em Latin-1
    } else if (c === 0x00b3) {
      saida += '3'; // m³
    } else if (c <= 0xff) {
      saida += ch;
    } else {
      saida += '?';
    }
  }
  return saida;
}

/** `(`, `)` e `\` são delimitadores de string no PDF — precisam de escape. */
function escapar(texto: string): string {
  return paraWinAnsi(texto).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function n(valor: number): string {
  return (Math.round(valor * 100) / 100).toString();
}

/** O desenho de uma página, acumulado como operadores de conteúdo. */
class Folha {
  readonly #ops: string[] = [];

  linha(x1: number, y1: number, x2: number, y2: number, espessura = 0.6): this {
    this.#ops.push(`${n(espessura)} w 0.35 G ${n(x1)} ${n(y1)} m ${n(x2)} ${n(y2)} l S`);
    return this;
  }

  caixa(x: number, y: number, largura: number, altura: number, espessura = 0.6): this {
    this.#ops.push(`${n(espessura)} w 0.35 G ${n(x)} ${n(y)} ${n(largura)} ${n(altura)} re S`);
    return this;
  }

  fundo(x: number, y: number, largura: number, altura: number, cinza: number): this {
    this.#ops.push(`${n(cinza)} g ${n(x)} ${n(y)} ${n(largura)} ${n(altura)} re f`);
    return this;
  }

  texto(x: number, y: number, conteudo: string, tamanho = 8, negrito = false): this {
    const fonte = negrito ? '/F2' : '/F1';
    this.#ops.push(
      `BT 0 g ${fonte} ${n(tamanho)} Tf ${n(x)} ${n(y)} Td (${escapar(conteudo)}) Tj ET`,
    );
    return this;
  }

  /** Rótulo pequeno + valor — o par que forma cada campo de um DANFE. */
  campo(x: number, y: number, rotulo: string, valor: string, tamanhoValor = 8): this {
    this.texto(x + 3, y + 13, rotulo.toUpperCase(), 5);
    this.texto(x + 3, y + 3, valor, tamanhoValor);
    return this;
  }

  /**
   * ⭐⭐ O CARIMBO. Diagonal, grande, cinza-claro, atrás de tudo o que vem
   * depois — e **não é parâmetro**: todo documento desta vitrine sai com ele.
   */
  carimboDeDemonstracao(): this {
    const rad = (Math.PI / 180) * 38;
    const cos = n(Math.cos(rad));
    const sin = n(Math.sin(rad));
    // ⭐ Acento passa: `Ç` e `Ã` existem em WinAnsi. Escrever "DEMONSTRACAO"
    // sem cedilha seria economizar no lugar errado — é a palavra que protege a
    // casa, e ela tem de estar escrita direito.
    this.#ops.push(
      `q 0.87 0.87 0.87 rg BT /F2 34 Tf ${cos} ${sin} -${sin} ${cos} 92 330 Tm ` +
        `(${escapar('DEMONSTRAÇÃO')}) Tj ET Q`,
    );
    this.#ops.push(
      `q 0.87 0.87 0.87 rg BT /F2 22 Tf ${cos} ${sin} -${sin} ${cos} 148 268 Tm ` +
        `(${escapar('SEM VALOR FISCAL')}) Tj ET Q`,
    );
    return this;
  }

  fluxo(): string {
    return this.#ops.join('\n');
  }
}

/**
 * ⚠️⚠️ **O byte tem de ser Latin-1, não UTF-8 — e isto foi pago em susto.**
 *
 * A primeira versão montava o arquivo inteiro como texto e chamava
 * `TextEncoder().encode()`, que escreve **UTF-8**. Resultado: `ô` virava dois
 * bytes, a fonte lia cada um como WinAnsi, e "Eletrônica" saía "EletrÃ´nica"
 * no PDF renderizado. O arquivo era válido, abria, imprimia — e estava errado
 * em toda palavra com acento.
 *
 * ⭐ Como `paraWinAnsi` já garante que todo caractere cabe em um byte, a
 * conversão certa é literal: um `charCodeAt` por byte.
 */
function paraBytesLatin1(texto: string): Uint8Array {
  const bytes = new Uint8Array(texto.length);
  for (let i = 0; i < texto.length; i += 1) {
    bytes[i] = texto.charCodeAt(i) & 0xff;
  }
  return bytes;
}

/** Monta o arquivo: catálogo, páginas, duas fontes base e o fluxo da folha. */
function montarPdf(fluxo: string): Uint8Array {
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${LARGURA} ${ALTURA}] ` +
      '/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${fluxo.length} >>\nstream\n${fluxo}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  ];

  let corpo = '%PDF-1.4\n';
  const deslocamentos: number[] = [];
  // ⭐ Em Latin-1, um caractere é um byte — então o deslocamento do xref é o
  // comprimento da string. Contar em UTF-8 aqui daria offsets errados em todo
  // objeto depois do primeiro acento, e o leitor recusaria o arquivo.
  const bytes = (texto: string): number => texto.length;

  for (const [i, obj] of objetos.entries()) {
    deslocamentos.push(bytes(corpo));
    corpo += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  }

  const inicioXref = bytes(corpo);
  corpo += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  for (const d of deslocamentos) {
    corpo += `${String(d).padStart(10, '0')} 00000 n \n`;
  }
  corpo +=
    `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${inicioXref}\n%%EOF\n`;

  return paraBytesLatin1(corpo);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. OS DOIS DOCUMENTOS
// ─────────────────────────────────────────────────────────────────────────────

export interface DadosDoDocumento {
  readonly empresa: string;
  readonly cidade: string;
  readonly numero: string;
  readonly chave: string;
  readonly emitidoEm: string;
  readonly natureza: string;
  readonly cfop: string;
  readonly origem: string;
  readonly destino: string;
  readonly placa: string;
  readonly motorista: string;
  readonly itens: readonly {
    readonly descricao: string;
    readonly quantidade: number;
    readonly unidade: string;
    readonly valor: string;
  }[];
  readonly observacao: string;
}

/** Cabeçalho comum aos dois — a moldura, o carimbo e a identificação. */
function cabecalho(f: Folha, titulo: string, subtitulo: string, d: DadosDoDocumento): number {
  f.carimboDeDemonstracao();

  const topo = ALTURA - 40;
  f.caixa(40, 60, LARGURA - 80, topo - 60, 1);

  // Faixa do título
  f.fundo(40, topo - 54, LARGURA - 80, 54, 0.93);
  f.caixa(40, topo - 54, LARGURA - 80, 54);
  f.texto(50, topo - 22, titulo, 14, true);
  f.texto(50, topo - 36, subtitulo, 7);
  f.texto(50, topo - 48, `${d.empresa} · ${d.cidade}`, 7);

  f.texto(LARGURA - 210, topo - 22, `Nº ${d.numero}`, 12, true);
  f.texto(LARGURA - 210, topo - 36, `Emitido em ${d.emitidoEm}`, 7);
  f.texto(LARGURA - 210, topo - 48, 'Série 1 · ambiente de demonstração', 6);

  // Chave de acesso
  const yChave = topo - 82;
  f.caixa(40, yChave, LARGURA - 80, 28);
  f.campo(40, yChave, 'chave de acesso (fictícia)', d.chave.replace(/(.{4})/g, '$1 ').trim(), 7);

  return yChave;
}

/** Rodapé comum — e ele repete o aviso, porque o carimbo pode não imprimir. */
function rodape(f: Folha, observacao: string): void {
  f.caixa(40, 60, LARGURA - 80, 46);
  f.campo(40, 84, 'informações complementares', observacao, 6.5);
  f.texto(
    46,
    68,
    'DOCUMENTO DE DEMONSTRAÇÃO — NÃO TEM VALOR FISCAL E NÃO FOI TRANSMITIDO A NENHUM ÓRGÃO.',
    6.5,
    true,
  );
}

/** ⭐ O DANFE de remessa — a cara da nota que o motorista leva. */
export function pdfDanfe(d: DadosDoDocumento): Uint8Array {
  const f = new Folha();
  const yChave = cabecalho(
    f,
    'DANFE',
    'Documento Auxiliar da Nota Fiscal Eletrônica · entrada/saída: SAÍDA',
    d,
  );

  // Natureza e CFOP
  let y = yChave - 34;
  f.caixa(40, y, 330, 30);
  f.campo(40, y, 'natureza da operação', d.natureza, 7.5);
  f.caixa(370, y, LARGURA - 410, 30);
  f.campo(370, y, 'CFOP (ilustrativo)', d.cfop === '' ? '—' : d.cfop, 7.5);

  // Remetente e destinatário
  y -= 40;
  f.caixa(40, y, LARGURA - 80, 34);
  f.campo(40, y + 4, 'remetente / origem', d.origem, 7.5);

  y -= 40;
  f.caixa(40, y, LARGURA - 80, 34);
  f.campo(40, y + 4, 'destinatário / destino', d.destino, 7.5);

  // Transporte
  y -= 40;
  f.caixa(40, y, 250, 30);
  f.campo(40, y, 'veículo (placa)', d.placa, 7.5);
  f.caixa(290, y, LARGURA - 330, 30);
  f.campo(290, y, 'motorista', d.motorista, 7.5);

  // Itens
  y -= 26;
  f.fundo(40, y - 16, LARGURA - 80, 16, 0.93);
  f.caixa(40, y - 16, LARGURA - 80, 16);
  f.texto(46, y - 11, 'DESCRIÇÃO DO PRODUTO / SERVIÇO', 6, true);
  f.texto(390, y - 11, 'QTD', 6, true);
  f.texto(430, y - 11, 'UN', 6, true);
  f.texto(470, y - 11, 'VALOR', 6, true);

  let linha = y - 16;
  for (const item of d.itens) {
    linha -= 18;
    f.caixa(40, linha, LARGURA - 80, 18);
    f.texto(46, linha + 6, item.descricao, 7.5);
    f.texto(390, linha + 6, String(item.quantidade), 7.5);
    f.texto(430, linha + 6, item.unidade, 7.5);
    f.texto(470, linha + 6, item.valor, 7.5);
  }

  rodape(f, d.observacao);
  return montarPdf(f.fluxo());
}

/** ⭐ O DAMDFE — o manifesto que amarra a nota ao caminhão. */
export function pdfDamdfe(d: DadosDoDocumento, chaveDaNota: string): Uint8Array {
  const f = new Folha();
  const yChave = cabecalho(
    f,
    'DAMDFE',
    'Documento Auxiliar do Manifesto Eletrônico de Documentos Fiscais',
    d,
  );

  let y = yChave - 34;
  f.caixa(40, y, 250, 30);
  f.campo(40, y, 'modal', 'rodoviário', 7.5);
  f.caixa(290, y, LARGURA - 330, 30);
  f.campo(290, y, 'carregamento / descarregamento', `${d.origem} para ${d.destino}`, 6.5);

  y -= 40;
  f.caixa(40, y, 250, 30);
  f.campo(40, y, 'veículo (placa)', d.placa, 7.5);
  f.caixa(290, y, LARGURA - 330, 30);
  f.campo(290, y, 'condutor', d.motorista, 7.5);

  // ⭐ O manifesto EXISTE para amarrar as notas — e é isso que a folha mostra.
  y -= 30;
  f.fundo(40, y - 16, LARGURA - 80, 16, 0.93);
  f.caixa(40, y - 16, LARGURA - 80, 16);
  f.texto(46, y - 11, 'DOCUMENTOS FISCAIS MANIFESTADOS', 6, true);

  y -= 16;
  y -= 22;
  f.caixa(40, y, LARGURA - 80, 22);
  f.texto(46, y + 8, `NF-e ${chaveDaNota.replace(/(.{4})/g, '$1 ').trim()}`, 7);

  y -= 34;
  f.caixa(40, y, LARGURA - 80, 30);
  f.campo(
    40,
    y,
    'situação',
    'EM ABERTO — encerrar na chegada (com este manifesto aberto, a proxima saida deste veiculo e recusada)',
    6.5,
  );

  rodape(f, d.observacao);
  return montarPdf(f.fluxo());
}

/**
 * ⭐ O arquivo vira um endereço que o navegador abre. É assim que o botão
 * "Enviar pro motorista" tem um link para mandar.
 *
 * ⚠️ Quem chama é responsável por revogar o endereço quando a tela sair —
 * `URL.revokeObjectURL`. Sem isso, cada geração deixa um arquivo na memória.
 */
export function comoEndereco(pdf: Uint8Array): string {
  const copia = new Uint8Array(pdf);
  return URL.createObjectURL(new Blob([copia.buffer as ArrayBuffer], { type: 'application/pdf' }));
}
