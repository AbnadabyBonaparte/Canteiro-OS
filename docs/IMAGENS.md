# IMAGENS — o lote, os textos e a procedência
## Canteiro OS · vitrine v2

---

## 1. ⛔ A REGRA DE OURO DAS CHAVES

- As chaves (`FAL_KEY`, `IDEOGRAM_API_KEY`) são lidas **do ambiente**, nunca de arquivo, nunca de constante.
- **Nenhuma chave entra em código, `.env` versionado, log ou commit.** O script imprime o nome do arquivo gerado, nunca o cabeçalho da requisição.
- As imagens são geradas **uma única vez** e o resultado — WebP otimizado — é commitado em `public/img/`.
- ⭐ **O site em produção não chama nenhuma API de imagem.** É estático, é rápido, e não queima crédito na frente do cliente.

```bash
FAL_KEY=... IDEOGRAM_API_KEY=... node --experimental-strip-types scripts/gerar-imagens.ts
node --experimental-strip-types scripts/gerar-imagens.ts --so=banner-capa   # refazer uma peça
```

O script é **idempotente**: o que já existe em `public/img/` não é gerado de novo. Para refazer uma peça, apague o `.webp` dela.

**Sem chave no ambiente o script não falha:** avisa o que faltou e sai. O site funciona igual — onde falta imagem, entra o gradiente de reserva (`src/components/imagem.tsx`). ⛔ Nunca uma imagem quebrada.

> ⚠️ **Se uma chave passou por chat, e-mail ou captura de tela, ela conta como exposta.** Gire depois de gerar o lote.

---

## 2. QUAL FERRAMENTA PARA QUÊ

| Ferramenta | Modelo | Onde entra | Por quê |
|---|---|---|---|
| **fal.ai** | `fal-ai/flux/dev` | banner, região, capas de obra, cenas de canteiro, texturas | fotorrealismo com luz crível e textura de material. É onde o canteiro parece canteiro |
| **Ideogram** | `ideogram-v3` (QUALITY) | a marca do produto | é a única que acerta **tipografia** — letra legível, sem borrão e sem letra inventada |

**Licença de uso.** As duas plataformas atribuem ao usuário os direitos de uso comercial das imagens que ele gera pelas contas dele, dentro dos termos vigentes de cada uma. ⚠️ **Isto é leitura de termos, não parecer jurídico:** antes de usar qualquer peça em material comercial impresso ou pago, o jurídico da casa confere os termos na data do uso. Nesta vitrine as imagens aparecem só em ambiente de demonstração.

---

## 3. O LOTE — 16 peças, 540 kB no total

| Arquivo | Ferramenta | Tamanho | Para quê |
|---|---|---|---|
| `banner-capa.webp` | fal | 1536×640 | a capa — carrega o número do dinheiro preso por cima |
| `regiao-serra.webp` · `regiao-rio.webp` · `regiao-cidade.webp` | fal | 768×440 | a região, na capa. **Evocativas, não documentais** |
| `obra-creche.webp` · `obra-pavimentacao.webp` · `obra-ubs.webp` | fal | 1344×460 | uma capa por obra do seed — carrega a régua e o avanço |
| `cena-projeto` · `cena-trena` · `cena-concretagem` · `cena-armacao` · `cena-fiscal` · `cena-fim-de-tarde` | fal | 768×440 | a tira de cenas da obra, o diário e a segurança |
| `textura-concreto` · `textura-projeto` | fal | 1024×1024 | fundo do cartão de integração e do estado vazio |
| `marca-canteiro.webp` | Ideogram | 826×174 | a marca, recortada da geração quadrada. Aparece em Configurações |

### 3.1 ⭐ Gera-se grande, guarda-se do tamanho da tela

O modelo desenha melhor em 1344 px; a tira de cenas mostra a foto em 240 px de
largura. Guardar 1344 ali é mandar ao telefone cinco vezes o pixel que ele
enxerga — e, pior, é banda gasta **antes da primeira pintura**, com a foto do
topo esperando na fila.

Por isso cada peça pode declarar um campo `exibicao` no
`scripts/gerar-imagens.ts`: o tamanho em que ela é **guardada**, quando ele é
menor que o tamanho em que ela é **gerada**.

O script tem uma **passagem de encolher** que roda **sem chave nenhuma**: peça
já commitada acima do tamanho declarado é reencodada a partir do arquivo que já
existe — sem chamar API, sem queimar crédito. É idempotente: na segunda vez nada
acontece.

| | antes | depois |
|---|---|---|
| lote inteiro | 1,2 MB | **540 kB** |
| `cena-armacao.webp` | 161 kB | **60 kB** |
| `obra-creche.webp` (o maior elemento pintado da tela da obra) | 123 kB | **64 kB** |

⛔ **Uma peça saiu do lote: `textura-forma`.** Foi gerada e nenhuma tela a usou.
Arquivo que ninguém renderiza é botão morto em forma de byte — foi apagada, e
fica o registro aqui de que existiu.

### 3.2 Textura entra como fundo de CSS, não como `<img>`

As duas texturas são decoração pura: entram por `background-image`, com
`aria-hidden`, em opacidade de 6–7%. Não viram elemento da árvore de
acessibilidade, porque **decoração não é conteúdo** — e por isso nenhum leitor
de tela as anuncia. A descrição delas no `MANIFESTO.json` documenta a peça; não
é um `alt` que alguém vá ouvir.

O texto exato que gerou cada peça, com modelo, dimensão, peso e data, está em **`public/img/MANIFESTO.json`** — e a tela de **Configurações** mostra a procedência ao cliente.

---

## 4. AS PROIBIÇÕES QUE VÃO NO PRÓPRIO TEXTO

Todo texto fotográfico carrega a mesma base e o mesmo negativo (`scripts/gerar-imagens.ts`, constantes `BASE_FOTO` e `NEGATIVO`):

| Proibido | Por quê |
|---|---|
| **Rosto identificável** | pessoa real não consente uma imagem que ela não sabe que existe. Todos os trabalhadores aparecem de costas, de longe ou pelas mãos |
| **Texto, placa com letra, logo** | modelo de imagem escreve errado, e logo de terceiro é marca alheia |
| **Obra que finja ser a obra deles** | seria mentir sobre a demonstração |
| **Saturação alta, HDR, render 3D, cartum** | o produto imita concreto e aço, não catálogo |
| **Gradiente roxo, néon, futurismo** | é o default de IA que o `DESIGN.md` §6 recusa |

---

## 5. COMO A IMAGEM ENTRA NO DESENHO

A regra está em `docs/DESIGN.md` §10 e vale sem exceção:

> **A imagem serve a dado, não decora.** O banner carrega o número do dinheiro preso; a capa da obra carrega o físico, o financeiro e a régua; a cena abre o diário.

Tratamento único, aplicado por `src/components/imagem.tsx`:
- véu de obsidian em **gradiente vertical** (mais fechado embaixo, onde mora o texto);
- saturação em `0.72` e contraste em `1.04` — a foto recua, o ouro do dado avança;
- ⛔ **o ouro fica só nos dados.** Nunca uma foto crua e colorida brigando com o número;
- `next/image` com `fill`, `sizes` responsivo e `priority` + `fetchPriority="high"` **só na peça do topo** — dizer "urgente" para todas é o mesmo que não dizer para nenhuma;
- `unoptimized`: a peça já sai do gerador em WebP no tamanho certo, e deixar o otimizador do framework refazê-la em tempo de requisição custa o LCP inteiro sem devolver um byte;
- ⭐ **altura é piso, não teto** (`min-h`): se o dado que vai por cima crescer, a moldura cresce junto em vez de cortar a palavra pela metade. Foto que corta título é foto mandando no dado;
- ⭐ **a peça do topo mede em `vw`, não em `vh`:** altura em `vh` muda quando a barra do navegador do telefone recolhe, e a página inteira abaixo dela escorrega junto. Foi o que zerou o CLS da capa.

---

*Universo Bonaparte · ALSHAM Global Commerce Ltda · Powered by ALSHAM*
