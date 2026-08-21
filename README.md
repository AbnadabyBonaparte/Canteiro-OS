# CANTEIRO OS — vitrine de demonstração

> ## ⚠️ ISTO NÃO É O PRODUTO. É A VITRINE.
>
> **O produto Canteiro é a vertical Construção Civil do ALSHAM Business OS** —
> repositório `AbnadabyBonaparte/alsham-business-os`, pasta `docs/construcao/`,
> PR #103: os módulos `meas` (medição), `rdo` (diário), `empreita`
> (empreiteiros e propostas) e `cdoc` (documentos), sobre o PMO (`proj`,
> `sched`, `pcost`) que já existe lá.
>
> **Este repositório existe para VENDER.** Quando vender, o que for bom migra
> para `packages/` do Business OS (ver [`docs/MIGRACAO.md`](docs/MIGRACAO.md)) e
> este repositório vira histórico.
>
> **Nenhum agente futuro deve confundir as duas casas.** Foi assim que nasceram
> o Quantum e o Diamond: uma maquete que ninguém marcou como maquete e virou
> promessa. Aqui está marcado, na primeira linha, e no rodapé de toda tela.

---

## O que é

Um sistema de demonstração com **21 rotas**, organizado pelos setores que uma
empreiteira de verdade tem. Dados fictícios, estado em memória, **zero banco**.

### ⚖️ O vocabulário é o de empreita — e isso é lei, não estilo

Por orientação do jurídico da empresa (22/08/2026), o produto fala em
**contrato de empreita por valor global** — e só nisso. Entrega-se um objeto por
um valor combinado, com autonomia de meios (Código Civil, arts. 610–626).
**Não se paga tempo; paga-se entrega.** O vocabulário que saiu e o que entrou no
lugar estão registrados em `docs/MIGRACAO.md` §0.

| Setor | Salas |
|---|---|
| **Direção** | Capa · Painel de obras · Resolutividade |
| **Obras** | Obras · Contratos e aditivos · Medições · Fiscalização · Diário de obra |
| **Pessoas** | Empreiteiros · Equipe própria · Segurança do trabalho |
| **Suprimentos** | Compras e materiais · Fornecedores · Equipamentos |
| **Financeiro** | Caixa por obra · Relatórios |
| **Documentos** | Documentos e certidões |
| **Inteligência** | Funcionário digital · Configurações |

## Os três carimbos, aplicados a este repositório

A régua da casa separa **construído no CI** · **aplicado no banco** · **operável
na tela**. Esta vitrine é:

| Carimbo | Estado |
|---|---|
| Operável na tela | **100%** — 21 rotas, com uma ação que funciona em cada sala |
| Aplicado no banco | **0%** — não há banco. Nenhum |
| Construído como produto | **0%** — nada aqui é `packages/`, migration ou schema |

⛔ **Ninguém vende esta demonstração como sistema rodando.**

## Leis da vitrine

1. **Lei de dados.** Nenhum nome real de cliente, sócio, CNPJ, telefone ou
   prefeitura em código, seed, commit, comentário ou README. O nome do cliente
   entra por variável de ambiente na Vercel (`NEXT_PUBLIC_TENANT_NAME`,
   `NEXT_PUBLIC_TENANT_CITY`); o padrão do repositório é fantasia.
2. **Lei 7.** Selo permanente no rodapé de toda rota. Onde o produto real vai
   integrar (nota fiscal, eSocial, PNCP, banco, folha), a tela mostra um
   **cartão honesto** — nunca um botão morto.
3. **Lei anti-viés.** Todas as listas vivem em `src/data/taxonomias.ts` **como
   dados** e aparecem inteiras em **Configurações** — é lá que a mesa vê que o
   sistema não decide como a empresa nomeia o próprio mundo.
4. **Lei da régua jurídica.** O alerta de concentração tem **quatro parâmetros
   visíveis e editáveis**, marcados como exemplo, e a tela diz que quem define é
   o jurídico da empresa — o sistema não sugere números. O aviso só acende com
   **dois ou mais sinais**: um isolado é ruído.
5. **Sem banco, sem auth, sem chave.** Estado em memória. Recarregou, voltou ao
   seed. As imagens são geradas **uma vez** por script e commitadas — o site em
   produção não chama nenhuma API.

## Rodar

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # produção
pnpm typecheck  # TypeScript strict, sem emitir
pnpm imagens    # regerar o lote (exige FAL_KEY e IDEOGRAM_API_KEY no ambiente)
```

Sem variável de ambiente, a vitrine roda com o nome de fantasia. Ver
[`.env.example`](.env.example).

## Estrutura

```
src/app/(demo)/        as 21 rotas, agrupadas por setor
src/data/seed.ts       3 obras, 3 prefeituras, 40 parceiros de empreita,
                       97 empreitas, 92 propostas, 20 medições, 42 compras,
                       contratos, aditivos, ofícios, equipe, EPI, equipamentos,
                       custos, contas e pendências — tudo determinístico
src/data/taxonomias.ts as 15 listas, como dados (lei anti-viés)
src/lib/analista.ts    os 15 avisos, calculados do seed — nunca texto fixo
src/lib/store.ts       a memória: useSyncExternalStore, sem biblioteca
src/lib/imagens.ts     o manifesto das peças e o gradiente de reserva
src/components/        design system local, tokens --cnt-*
scripts/gerar-imagens.ts  gera o lote UMA vez; chaves só do ambiente
public/img/            16 peças WebP + MANIFESTO.json (540 kB)
docs/DESIGN.md         tokens, wireframes e a crítica contra os defaults de IA
docs/IMAGENS.md        o lote, os textos, a ferramenta de cada peça
docs/ROTEIRO-DEMO.md   os 15 minutos, com as falas e o que NÃO prometer
docs/MIGRACAO.md       o que volta para o Business OS e o que morre aqui
docs/screenshots/v2/   as 21 rotas em desktop e 4 em 390px
```

## Medido, não prometido

| | |
|---|---|
| Lighthouse mobile · acessibilidade | **100** em todas as 12 rotas medidas |
| Lighthouse mobile · boas práticas | **100** em todas as 12 rotas medidas |
| Lighthouse mobile · performance | mediana **95**; a mais pesada (medição de uma obra) mediana **92** |
| CLS | **0** — em 11 das 12 rotas, em toda corrida |
| Rotas verificadas | **21/21** sem texto de dev, sem emoji, com selo, sem rolagem horizontal a 390px |
| Vocabulário aposentado | **zero** ocorrência em `src/`, README e roteiro — só na nota histórica de `docs/MIGRACAO.md` §0 |
| Chaves no repositório | **zero** |
| Imagens sem `alt` | **zero** — as 16 peças descritas no `MANIFESTO.json` |
| Peso das imagens | **540 kB** no lote inteiro (era 1,2 MB antes da passagem de encolher) |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 · pnpm ·
Vercel. **Zero dependência de IA em tempo de execução:** o funcionário digital
calcula do seed, é determinístico e explicável. No produto real, quem faz isso é
o Analista do Business OS.

---

*Universo Bonaparte · ALSHAM Global Commerce Ltda · Powered by ALSHAM*
