# CANTEIRO OS — vitrine de demonstração

> ## ⚠️ ISTO NÃO É O PRODUTO. É A VITRINE.
>
> **O produto Canteiro é a vertical Construção Civil do ALSHAM Business OS** —
> repositório `AbnadabyBonaparte/alsham-business-os`, pasta `docs/construcao/`,
> PR #103: os módulos `meas` (medição), `rdo` (diário), `crew` (prestadores e
> chamados) e `cdoc` (documentos), sobre o PMO (`proj`, `sched`, `pcost`) que já
> existe lá.
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

Uma vitrine de **5 telas** que conta uma história de **10 minutos** para uma
empreiteira de médio porte que presta serviço a prefeituras. Dados fictícios,
estado em memória, zero banco. Mesmo molde que já provou no PERITUS.

| Tela | Rota | O que ela põe na mesa |
|---|---|---|
| **Painel de obras** | `/painel` | o dinheiro preso, com cronômetro |
| **Diário de obra** | `/diario` | vinte segundos, no celular, de bota e no sol |
| **Diaristas e chamados** | `/diaristas` | a recusa como prova, e o alerta de vínculo |
| **Medição e boletim** | `/medicoes/[obra]` | executado × aceito × faturado × pago |
| **Funcionário digital** | `/analista` | avisos calculados, com a conta à vista |

Mais `/obras/[id]`, a tela de aprofundamento de uma obra.

## Os três carimbos, aplicados a este repositório

A régua da casa separa **construído no CI** · **aplicado no banco** · **operável
na tela**. Esta vitrine é:

| Carimbo | Estado |
|---|---|
| Operável na tela | **100%** — as cinco telas funcionam, com CRUD onde há CRUD |
| Aplicado no banco | **0%** — não há banco. Nenhum |
| Construído como produto | **0%** — nada aqui é `packages/`, migration ou schema |

⛔ **Ninguém vende esta demonstração como sistema rodando.**

## Leis da vitrine

1. **Lei de dados.** Nenhum nome real de cliente, sócio, CNPJ, telefone ou
   prefeitura em código, seed, commit, comentário ou README. O nome do cliente
   entra por variável de ambiente na Vercel (`NEXT_PUBLIC_TENANT_NAME`,
   `NEXT_PUBLIC_TENANT_CITY`); o padrão do repositório é fantasia. **A demo
   mostra o nome real; o GitHub nunca.**
2. **Lei 7.** Selo discreto e permanente no rodapé de toda tela. Onde o produto
   real vai integrar (nota fiscal, eSocial, PNCP, banco), a tela mostra um
   **cartão honesto** — nunca um botão morto.
3. **Lei anti-viés.** Tipos de obra, especialidades, modalidades, motivos de
   glosa, motivos de ocorrência, gravidades e frentes vivem em
   `src/data/taxonomias.ts` **como dados**, nunca chumbados na tela — para a
   migração ser cópia, e não reescrita.
4. **Lei da régua jurídica.** O alerta de vínculo aparece com o parâmetro
   **visível e editável**, e a tela diz que quem define é o jurídico da empresa
   — o sistema não sugere um número. O valor do seed (20 diárias em 30 dias)
   está marcado como **exemplo**.
5. **Sem banco, sem auth, sem Supabase.** Estado em memória. Recarregou, voltou
   ao seed. É proposital.

## Rodar

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # produção
pnpm typecheck  # TypeScript strict, sem emitir
```

Sem variável de ambiente, a vitrine roda com o nome de fantasia. Ver
[`.env.example`](.env.example).

## Estrutura

```
src/app/(demo)/        as 5 telas + a obra
src/data/seed.ts       3 obras, 3 prefeituras fictícias, 40 prestadores,
                       12 meses de medição — determinístico, sem Math.random
src/data/taxonomias.ts as listas, como dados (lei anti-viés)
src/lib/analista.ts    os avisos, calculados do seed — nunca texto fixo
src/lib/store.ts       a memória: useSyncExternalStore, sem biblioteca
src/components/        o design system local, tokens --cnt-*
docs/DESIGN.md         tokens, wireframes e a crítica contra os defaults de IA
docs/ROTEIRO-DEMO.md   os 10 minutos, tela por tela, com as falas
docs/MIGRACAO.md       o que migra para o Business OS e o que morre aqui
docs/screenshots/      as telas
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 · pnpm ·
Vercel. **Zero dependência de IA externa:** o funcionário digital calcula do
seed, é determinístico e explicável. No produto real, quem faz isso é o Analista
do Business OS.

## Documentação

- [`docs/DESIGN.md`](docs/DESIGN.md) — a planta visual, escrita antes do código
- [`docs/ROTEIRO-DEMO.md`](docs/ROTEIRO-DEMO.md) — o roteiro da mesa e **o que não prometer**
- [`docs/MIGRACAO.md`](docs/MIGRACAO.md) — o caminho de volta para o Business OS

---

*Universo Bonaparte · ALSHAM Global Commerce Ltda · Powered by ALSHAM*
