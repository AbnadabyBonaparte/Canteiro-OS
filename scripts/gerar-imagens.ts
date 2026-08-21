/**
 * GERADOR DE IMAGENS — roda UMA VEZ, na máquina de quem tem as chaves.
 *
 * ⛔ REGRA DE OURO DAS CHAVES (bastão v2 §2.1):
 *   • As chaves são lidas do AMBIENTE. Nunca de arquivo, nunca de constante.
 *   • O site em produção NÃO chama nenhuma API de imagem. Este script grava
 *     WebP em `public/img/` e é isso que vai para o commit — estático, rápido,
 *     e não queima crédito na frente do cliente.
 *   • Nada de chave em log: o script imprime o nome do arquivo, nunca o header.
 *
 * Idempotente: o que já existe em `public/img/` não é gerado de novo. Para
 * refazer uma peça, apague o `.webp` dela e rode outra vez.
 *
 * Uso:
 *   FAL_KEY=... IDEOGRAM_API_KEY=... node --experimental-strip-types scripts/gerar-imagens.ts
 *   (acrescente `--so=banner` para gerar só uma peça)
 *
 * Sem chave no ambiente o script NÃO falha: avisa o que faltou e sai. O site
 * funciona igual, com o gradiente de reserva no lugar da foto.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const RAIZ = path.resolve(import.meta.dirname, '..');
const DESTINO = path.join(RAIZ, 'public', 'img');
const MANIFESTO = path.join(DESTINO, 'MANIFESTO.json');

// ─────────────────────────────────────────────────────────────────────────────
// A DIREÇÃO DE ARTE, EM PALAVRAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O que toda peça fotográfica carrega, sem exceção. É aqui que moram as
 * proibições do bastão §7: sem rosto identificável, sem logo, sem texto, e
 * nunca uma obra que finja ser a obra real do cliente.
 */
const BASE_FOTO =
  'photojournalistic documentary photograph, brazilian central-west construction site, ' +
  'cerrado landscape, natural light, muted desaturated palette, deep shadows, ' +
  'shot on 35mm, shallow depth of field, no text, no logos, no signage lettering, ' +
  'no identifiable faces, workers seen from behind or at distance, authentic and unglamorous';

const NEGATIVO =
  'text, watermark, logo, brand, signage with letters, close-up face, portrait, ' +
  'oversaturated, hdr, cgi, 3d render, cartoon, illustration, stock-photo smile, ' +
  'purple gradient, neon, futuristic';

type Ferramenta = 'fal' | 'ideogram';

interface Peca {
  readonly arquivo: string;
  readonly ferramenta: Ferramenta;
  readonly prompt: string;
  readonly largura: number;
  readonly altura: number;
  /** O texto alternativo que vai para o `alt` da tela. Obrigatório (CRIVO). */
  readonly alt: string;
  /** Qualidade do WebP. Textura aguenta menos; banner precisa de mais. */
  readonly qualidade?: number;
  /**
   * ⭐ O tamanho em que a peça é GUARDADA, quando ele é menor que o tamanho em
   * que ela é gerada. A tira de cenas mostra a foto em 240 px de largura; um
   * arquivo de 1344 px ali é banda gasta em pixel que ninguém enxerga — e banda
   * gasta antes da primeira pintura é a foto do topo chegando atrasada.
   * Gera-se grande (o modelo desenha melhor assim) e guarda-se do tamanho da
   * tela.
   */
  readonly exibicao?: { readonly largura: number; readonly altura: number };
}

const LOTE: readonly Peca[] = [
  // ── O banner da capa ──────────────────────────────────────────────────────
  {
    arquivo: 'banner-capa',
    ferramenta: 'fal',
    largura: 1536,
    altura: 640,
    qualidade: 82,
    prompt:
      `${BASE_FOTO}. Wide establishing shot of a construction site at dawn, golden hour, ` +
      'raw concrete structure with formwork and rebar cages, a concrete mixer truck, ' +
      'red-earth ground, low serra ridge on the horizon, dust in the air, empty foreground',
    alt: 'Canteiro de obra ao amanhecer, com estrutura de concreto, fôrmas e um caminhão-betoneira, serra ao fundo',
  },

  // ── A região (evocativa, nunca documental) ────────────────────────────────
  {
    arquivo: 'regiao-serra',
    ferramenta: 'fal',
    largura: 1344,
    altura: 768,
    exibicao: { largura: 768, altura: 440 },
    prompt:
      `${BASE_FOTO}. Red rocky ridge at late afternoon, dry cerrado vegetation, ` +
      'warm raking light, wide open sky, no buildings',
    alt: 'Serra de rocha avermelhada ao entardecer sobre vegetação de cerrado — imagem ilustrativa',
  },
  {
    arquivo: 'regiao-rio',
    ferramenta: 'fal',
    largura: 1344,
    altura: 768,
    exibicao: { largura: 768, altura: 440 },
    prompt:
      `${BASE_FOTO}. Wide slow river with sandy banks and eroded clay bluffs, ` +
      'gallery forest on the far margin, overcast soft light, no boats, no people',
    alt: 'Rio largo com barrancos de argila e mata na outra margem — imagem ilustrativa',
  },
  {
    arquivo: 'regiao-cidade',
    ferramenta: 'fal',
    largura: 1344,
    altura: 768,
    exibicao: { largura: 768, altura: 440 },
    prompt:
      `${BASE_FOTO}. Small brazilian interior town seen from a hill at dusk, low rooftops, ` +
      'a water tower, a serra silhouette behind, warm scattered lights, no signage',
    alt: 'Cidade pequena do interior vista de cima ao anoitecer, com a serra atrás — imagem ilustrativa',
  },

  // ── Uma capa por obra do seed ─────────────────────────────────────────────
  {
    arquivo: 'obra-creche',
    ferramenta: 'fal',
    largura: 1344,
    altura: 768,
    exibicao: { largura: 1344, altura: 460 },
    prompt:
      `${BASE_FOTO}. Single-storey public daycare building under construction, ` +
      'ceramic block masonry walls, roof structure half finished, scaffolding, ' +
      'stacked blocks and sand piles, midday light',
    alt: 'Prédio térreo de creche em construção, com alvenaria de bloco cerâmico e telhado em andamento',
  },
  {
    arquivo: 'obra-pavimentacao',
    ferramenta: 'fal',
    largura: 1344,
    altura: 768,
    exibicao: { largura: 1344, altura: 460 },
    prompt:
      `${BASE_FOTO}. Road paving works on a residential street, steel drum roller compacting ` +
      'fresh hot asphalt, freshly cast concrete curb along the side, steam rising, workers at distance',
    alt: 'Rua em pavimentação asfáltica, com rolo compactador sobre asfalto novo e meio-fio de concreto',
  },
  {
    arquivo: 'obra-ubs',
    ferramenta: 'fal',
    largura: 1344,
    altura: 768,
    exibicao: { largura: 1344, altura: 460 },
    prompt:
      `${BASE_FOTO}. Renovation of a small public health clinic, metal scaffolding against ` +
      'a plastered facade, protective plastic sheeting over windows, buckets and tools on the ground',
    alt: 'Reforma de unidade básica de saúde, com andaime metálico encostado na fachada',
  },

  // ── Cenas de canteiro ─────────────────────────────────────────────────────
  {
    arquivo: 'cena-projeto',
    ferramenta: 'fal',
    largura: 1344,
    altura: 768,
    exibicao: { largura: 768, altura: 440 },
    prompt:
      `${BASE_FOTO}. Three construction workers in hard hats and reflective vests seen from behind, ` +
      'gathered over a paper drawing spread on a plank, pointing, diverse build and skin tones',
    alt: 'Equipe de capacete e colete lendo um projeto sobre uma prancha, vista de costas',
  },
  {
    arquivo: 'cena-trena',
    ferramenta: 'fal',
    largura: 1344,
    altura: 768,
    exibicao: { largura: 768, altura: 440 },
    prompt:
      `${BASE_FOTO}. Hands of a site foreman holding a steel tape measure against a block wall, ` +
      'close on the hands and the tape, face out of frame, dusty work gloves',
    alt: 'Mãos de encarregado medindo uma parede de bloco com trena de aço',
  },
  {
    arquivo: 'cena-concretagem',
    ferramenta: 'fal',
    largura: 1344,
    altura: 768,
    exibicao: { largura: 768, altura: 440 },
    prompt:
      `${BASE_FOTO}. Concrete pour on a slab, pump hose spilling wet concrete, ` +
      'two workers with screed and vibrator seen from the side, splash and haze',
    alt: 'Concretagem de laje, com mangote despejando concreto e equipe regularizando',
  },
  {
    arquivo: 'cena-armacao',
    ferramenta: 'fal',
    largura: 1344,
    altura: 768,
    exibicao: { largura: 768, altura: 440 },
    prompt:
      `${BASE_FOTO}. Dense grid of tied steel rebar for a foundation, worker crouched tying wire, ` +
      'seen from above at an angle, rust-orange steel against grey ground',
    alt: 'Malha de ferragem armada para fundação, com trabalhador amarrando o arame',
  },
  {
    arquivo: 'cena-fiscal',
    ferramenta: 'fal',
    largura: 1344,
    altura: 768,
    exibicao: { largura: 768, altura: 440 },
    prompt:
      `${BASE_FOTO}. A visiting inspector in hard hat and vest holding a clipboard, ` +
      'standing beside a site worker, both seen in three-quarter from behind, pointing at a wall',
    alt: 'Visita de fiscal com prancheta ao lado de um trabalhador, ambos vistos de costas',
  },
  {
    arquivo: 'cena-fim-de-tarde',
    ferramenta: 'fal',
    largura: 1344,
    altura: 768,
    exibicao: { largura: 768, altura: 440 },
    prompt:
      `${BASE_FOTO}. End of the working day, tools and wheelbarrows lined up and covered, ` +
      'long shadows, empty site, warm low sun, nobody in frame',
    alt: 'Fim de tarde no canteiro, com ferramentas guardadas e sombras longas',
  },

  // ── Texturas para fundo de cartão ─────────────────────────────────────────
  {
    arquivo: 'textura-concreto',
    ferramenta: 'fal',
    largura: 1024,
    altura: 1024,
    qualidade: 68,
    prompt:
      'flat overhead macro photograph of raw grey concrete surface, fine aggregate, ' +
      'subtle form-tie marks, even diffuse light, seamless, no text, no objects',
    /* ⭐ Textura entra como fundo de CSS, não como <img>: a descrição aqui
       documenta a peça no manifesto, e a tela não a anuncia ao leitor de tela
       porque decoração não é conteúdo. */
    alt: 'Textura de concreto bruto, usada como fundo do cartão de integração',
  },
  {
    arquivo: 'textura-projeto',
    ferramenta: 'fal',
    largura: 1024,
    altura: 1024,
    qualidade: 68,
    prompt:
      'flat overhead macro photograph of an old blank technical drawing paper, ' +
      'faint fold creases and fibre grain, warm off-white, even light, no text, no lines',
    alt: 'Textura de papel de projeto, usada como fundo do estado vazio',
  },

  // ── A marca do produto (tipografia — é onde o Ideogram ganha) ─────────────
  {
    arquivo: 'marca-canteiro',
    ferramenta: 'ideogram',
    largura: 1024,
    altura: 1024,
    qualidade: 92,
    prompt:
      'A wordmark logo reading exactly "CANTEIRO OS" in condensed industrial stencil sans-serif, ' +
      'all uppercase, tight letter spacing, warm brass gold letters on a solid very dark navy ' +
      'background, flat vector, centered, generous margin, construction site signage feel, ' +
      'no illustration, no icon, no extra words',
    alt: 'Marca do produto Canteiro OS',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AS DUAS FERRAMENTAS
// ─────────────────────────────────────────────────────────────────────────────

async function viaFal(peca: Peca, chave: string): Promise<Buffer> {
  const r = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: {
      Authorization: `Key ${chave}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: peca.prompt,
      negative_prompt: NEGATIVO,
      image_size: { width: peca.largura, height: peca.altura },
      num_images: 1,
      num_inference_steps: 32,
      guidance_scale: 3.5,
      enable_safety_checker: true,
    }),
  });
  if (!r.ok) throw new Error(`fal respondeu ${r.status}`);
  const j = (await r.json()) as { images?: Array<{ url: string }> };
  const url = j.images?.[0]?.url;
  if (!url) throw new Error('fal não devolveu imagem');
  const img = await fetch(url);
  return Buffer.from(await img.arrayBuffer());
}

async function viaIdeogram(peca: Peca, chave: string): Promise<Buffer> {
  const form = new FormData();
  form.append('prompt', peca.prompt);
  form.append('rendering_speed', 'QUALITY');
  form.append('aspect_ratio', '1x1');
  form.append('num_images', '1');

  const r = await fetch('https://api.ideogram.ai/v1/ideogram-v3/generate', {
    method: 'POST',
    headers: { 'Api-Key': chave },
    body: form,
  });
  if (!r.ok) throw new Error(`ideogram respondeu ${r.status}`);
  const j = (await r.json()) as { data?: Array<{ url: string }> };
  const url = j.data?.[0]?.url;
  if (!url) throw new Error('ideogram não devolveu imagem');
  const img = await fetch(url);
  return Buffer.from(await img.arrayBuffer());
}

// ─────────────────────────────────────────────────────────────────────────────
// O LAÇO
// ─────────────────────────────────────────────────────────────────────────────

interface LinhaDoManifesto {
  readonly arquivo: string;
  readonly alt: string;
  readonly ferramenta: string;
  readonly modelo: string;
  readonly prompt: string;
  readonly largura: number;
  readonly altura: number;
  readonly bytes: number;
  readonly geradoEm: string;
}

const MODELO: Record<Ferramenta, string> = {
  fal: 'fal-ai/flux/dev',
  ideogram: 'ideogram-v3 (QUALITY)',
};

async function main(): Promise<void> {
  const falKey = process.env.FAL_KEY ?? '';
  const ideoKey = process.env.IDEOGRAM_API_KEY ?? '';
  const so = process.argv.find((a) => a.startsWith('--so='))?.slice(5);

  await mkdir(DESTINO, { recursive: true });

  let manifesto: LinhaDoManifesto[] = [];
  if (existsSync(MANIFESTO)) {
    manifesto = JSON.parse(await readFile(MANIFESTO, 'utf8')) as LinhaDoManifesto[];
  }

  const faltando = new Set<string>();
  let feitas = 0;
  let puladas = 0;
  let encolhidas = 0;

  /**
   * ⭐ A PASSAGEM DE ENCOLHER — roda sem chave nenhuma.
   *
   * Uma peça já gerada e commitada pode estar guardada maior do que a tela usa
   * (foi o caso do lote de 21/08). Aqui ela é reencodada a partir do arquivo
   * que já existe, sem chamar API e sem queimar crédito. É idempotente: na
   * segunda vez a peça já está no tamanho certo e nada acontece.
   */
  for (const peca of LOTE) {
    if (so && peca.arquivo !== so) continue;
    if (!peca.exibicao) continue;

    const caminhoPeca = path.join(DESTINO, `${peca.arquivo}.webp`);
    if (!existsSync(caminhoPeca)) continue;

    const atual = await sharp(caminhoPeca).metadata();
    const jaCabe =
      (atual.width ?? 0) <= peca.exibicao.largura && (atual.height ?? 0) <= peca.exibicao.altura;
    if (jaCabe) continue;

    const menor = await sharp(caminhoPeca)
      .resize(peca.exibicao.largura, peca.exibicao.altura, { fit: 'cover' })
      .webp({ quality: peca.qualidade ?? 76, effort: 6 })
      .toBuffer();
    await writeFile(caminhoPeca, menor);

    const linha = manifesto.find((l) => l.arquivo === `${peca.arquivo}.webp`);
    if (linha) {
      manifesto = manifesto.filter((l) => l.arquivo !== `${peca.arquivo}.webp`);
      manifesto.push({
        ...linha,
        largura: peca.exibicao.largura,
        altura: peca.exibicao.altura,
        bytes: menor.byteLength,
      });
    }
    encolhidas += 1;
    process.stdout.write(
      `encolhida ${peca.arquivo} → ${peca.exibicao.largura} px · ${(menor.byteLength / 1024).toFixed(0)} kB\n`,
    );
  }

  for (const peca of LOTE) {
    if (so && peca.arquivo !== so) continue;

    const saida = path.join(DESTINO, `${peca.arquivo}.webp`);
    if (existsSync(saida)) {
      puladas += 1;
      continue;
    }

    const chave = peca.ferramenta === 'fal' ? falKey : ideoKey;
    if (!chave) {
      faltando.add(peca.ferramenta === 'fal' ? 'FAL_KEY' : 'IDEOGRAM_API_KEY');
      continue;
    }

    try {
      process.stdout.write(`gerando ${peca.arquivo} … `);
      const bruto =
        peca.ferramenta === 'fal' ? await viaFal(peca, chave) : await viaIdeogram(peca, chave);

      const alvo = peca.exibicao ?? {
        largura: peca.largura,
        altura: peca.altura,
      };
      const otimizada = await sharp(bruto)
        .resize(alvo.largura, alvo.altura, {
          fit: 'cover',
          position: 'attention',
        })
        .webp({ quality: peca.qualidade ?? 76, effort: 6 })
        .toBuffer();

      await writeFile(saida, otimizada);

      manifesto = manifesto.filter((l) => l.arquivo !== `${peca.arquivo}.webp`);
      manifesto.push({
        arquivo: `${peca.arquivo}.webp`,
        alt: peca.alt,
        ferramenta: peca.ferramenta,
        modelo: MODELO[peca.ferramenta],
        prompt: peca.prompt,
        largura: alvo.largura,
        altura: alvo.altura,
        bytes: otimizada.byteLength,
        geradoEm: new Date().toISOString().slice(0, 10),
      });
      feitas += 1;
      process.stdout.write(`${(otimizada.byteLength / 1024).toFixed(0)} kB\n`);
    } catch (erro) {
      // ⚠️ Nunca imprimir o erro cru: alguns clientes ecoam o header na mensagem.
      process.stdout.write(`FALHOU (${erro instanceof Error ? erro.message : 'erro'})\n`);
    }
  }

  manifesto.sort((a, b) => a.arquivo.localeCompare(b.arquivo));
  await writeFile(MANIFESTO, `${JSON.stringify(manifesto, null, 2)}\n`, 'utf8');

  console.log(
    `\n${feitas} gerada(s), ${encolhidas} encolhida(s), ${puladas} já existia(m), ${LOTE.length} no lote.`,
  );
  if (faltando.size > 0) {
    console.log(
      `Sem ${[...faltando].join(' e ')} no ambiente — as peças dessas ferramentas ficaram de fora.`,
    );
    console.log('O site funciona igual: onde falta imagem, entra o gradiente de reserva.');
  }
}

await main();
