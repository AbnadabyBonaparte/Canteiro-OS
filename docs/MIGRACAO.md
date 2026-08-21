# MIGRAÇÃO — o que desta vitrine volta para o Business OS
## E o que morre aqui, de propósito

> **A vitrine vende; o produto mora no Business OS.**
> Repositório de destino: `AbnadabyBonaparte/alsham-business-os`.
> Desenho de referência: `docs/construcao/` daquele repositório (PR #103) —
> módulos `meas`, `rdo`, `crew`, `cdoc` sobre o PMO já construído.

---

## 1. A REGRA QUE DECIDE CADA LINHA

O Business OS tem uma lei chamada **Regra de Ouro da Longevidade**:

> Lógica de negócio vive em `packages/` — TypeScript puro e SQL. **Nunca** em
> `apps/`. O framework é a pele, não o coração.

Logo, o teste de cada arquivo desta vitrine é um só:

> **Se eu apagar todas as telas, isto continua valendo?**
> **Sim** → migra para `packages/`.  **Não** → morre aqui.

---

## 2. O QUE MIGRA

### 2.1 ⭐ As taxonomias — `src/data/taxonomias.ts`

**Vira:** tabelas de cada módulo, com `tenant_id`, nome livre e posição.

| Lista da vitrine | Destino no produto |
|---|---|
| `MOTIVOS_DE_GLOSA` | `meas.gloss_reasons` |
| `MOTIVOS_DE_OCORRENCIA`, `GRAVIDADES`, `CLIMAS`, `FRENTES` | `rdo.*` (e a gravidade reusa a física do `occ`) |
| `ESPECIALIDADES`, `MODALIDADES` | `crew.skills`, `crew.modalities` |
| `TIPOS_DE_DOCUMENTO` | `cdoc.*` — **texto livre**, nunca enum |
| `TIPOS_DE_OBRA` | rótulo do `proj` (que já é texto livre) |
| `UNIDADES` | campo texto do item de medição — o edital manda |

⭐ **É por isso que elas nasceram como dados e não chumbadas na tela.** A
migração é **cópia com `insert`**, não reescrita. Se estivessem espalhadas em
`<option>` pelos componentes, alguém teria de caçá-las uma a uma e esqueceria
metade.

⚠️ **O que muda na migração:** aqui elas são constantes globais; lá são **dado
do tenant** (Lei Anti-Viés). Cada empresa nomeia o seu vocabulário. A `CHECK`
constraint continua proibida — as únicas exceções são física de método
(ciclo de vida, e a nota 0..100).

### 2.2 ⭐⭐ As regras do analista — `src/lib/analista.ts`

**Vira:** funções puras em `packages/meas`, `packages/crew` e observadores em
`packages/engineer/src/local/`, no molde exato do `recebiveis.ts` que já existe
lá (recebe o snapshot que o banco já tem, devolve prosa, nunca inventa número).

| Função da vitrine | Destino |
|---|---|
| `medicoesPresas`, `totalPresoCents` | `packages/meas` → observador `meas-accepted-unpaid` |
| `ritmoDePagamento` | `packages/meas` → observador `payer-lag` |
| `concentracoes` | `packages/crew/src/concentration.ts` → `crew-concentration` |
| `documentosNoPrazo` | `packages/cdoc` → `cdoc-expiring` |
| `desviosDeInsumo` | `packages/pcost` (composição na aplicação) → `pcost-over` |
| `falhasDeDiario` | `packages/rdo` → `rdo-missing` |
| `resumoDeGlosa` | `packages/meas` |
| `caixaPorMes` | `packages/meas` → alimenta a leitura físico-financeira |
| `avisos()` | ⚠️ **não migra como está** — vira linhas em `core.tenant_insights` (migrations `0116`–`0118`, que já existem e ainda não foram aplicadas) |

⭐ **Elas já estão prontas para migrar** porque foram escritas como **funções
puras sem I/O**: recebem o mundo, devolvem o resultado. Nenhuma abre conexão,
nenhuma sabe o que é uma tela.

⚠️ **O que muda:** no produto, quem lê o banco é o `apps/api` sob
`service_role`, entrega os números à função pura, e a função devolve o texto.
**A função nunca vê credencial** — é a linha vermelha do modelo do Engenheiro.

### 2.3 O seed — `src/data/seed.ts`

**Vira:** *fixture de teste*, não seed de produto.

⛔ **O `supabase/seed/0001_platform.sql` do Business OS insere ZERO tenant e ZERO
usuário, por contrato.** Este mundo fictício **não entra lá**. Ele vira:
- `packages/*/src/*.test.ts` — o caso do prestador com 22 diárias vira teste da
  régua de concentração; a medição aceita e não paga vira teste do observador;
- um script descartável de ambiente de homologação, se o dono quiser.

⭐ **O que é ouro no seed:** o **gerador determinístico** (`mulberry32` +
`DATA_REF`). Teste com `Math.random()` é teste que falha na terça. O padrão
"mundo calculado a partir de uma data fixa" migra junto.

### 2.4 As decisões de física

Não são código, são o mais valioso. Cada uma já está escrita na spec de destino:

| Decisão provada aqui | Onde ela já está escrita |
|---|---|
| **A recusa é dado de primeira classe**, carimbada pelo servidor | `03b-SPEC-DIARISTAS.md` §0.3 |
| **Não existe excluir — existe cancelar com motivo**, e o cancelado fica à vista | `03-DESENHO` §4.2 (`rdo`) |
| **Quatro números, quatro momentos** — nunca uma coluna `status` | `03c-SPEC-MEDICAO.md` §0.2 |
| **Glosa com motivo obrigatório**, do vocabulário do tenant | `03c-SPEC-MEDICAO.md` §0.4 |
| **A régua de vínculo nasce vazia**, definida pelo jurídico do tenant | `03b-SPEC-DIARISTAS.md` §1.4 |
| **Insight abre a conta** ("por que isso?") | novo — nasceu aqui, e é bom |

⭐ **"Por que isso?" é o achado desta vitrine.** O `recebiveis.ts` do Business OS
já monta a frase determinística, mas **não expõe a conta ao usuário**. Expor
transforma "confie no número" em "confira o número" — e é barato: as linhas já
existem, só não eram mostradas.

### 2.5 A régua de medição (o componente)

`src/components/regua.tsx` migra para `apps/portal` do Business OS como
componente de UI — **não** para `packages/`: é pele. O que migra junto e importa
é a **decisão**: quatro densidades do mesmo ouro, nunca quatro cores, com a
cinta marcando o degrau aceito → pago.

---

## 3. O QUE MORRE AQUI — e é para morrer

| Peça | Por quê |
|---|---|
| `src/lib/store.ts` (a memória) | No produto, quem guarda é Postgres com RLS `enable + force`, papel do tenant e trilha imutável. Um store em memória não tem isolamento, não tem permissão e não tem prova |
| Os botões **Aceitar/Recusar** no lugar do prestador | ⛔ **Existem só para a demonstração andar.** No produto, quem carimba a recusa é o prestador, com a permissão `crew.call.respond`. Migrar isto destruiria o valor da prova |
| O ditado de voz que escreve texto de exemplo | É encenação declarada. No produto, ou transcreve de verdade ou não existe |
| O "Gerar dossiê" que não gera arquivo | Idem. No produto sai inteiro, do período pedido, com quem exportou carimbado |
| O upload de foto que só liga um sinalizador | Sem GED (`packages/documents` ainda é README) não há onde a foto morar |
| Os cartões honestos de integração | Viram integração de verdade — ou continuam declarados FORA pela Lei 3 |
| `PRAZO_CONTRATUAL_DIAS = 30` | ⚠️ **No produto é campo do contrato.** Cada edital traz o seu; prazo nunca é constante de código |
| O `notadoHaMin` fixo por aviso | Vira o `updated_at` real de `core.tenant_insights` |
| Todo o `docs/screenshots/` | É material de venda, não de produto |

---

## 4. A ORDEM DA MIGRAÇÃO

Quando o dono decidir que vendeu:

1. **`meas` primeiro.** É onde está o dinheiro e é o que as outras três
   alimentam. Migram junto: `MOTIVOS_DE_GLOSA`, `medicoesPresas`,
   `ritmoDePagamento`, `resumoDeGlosa`, `caixaPorMes`.
2. **`rdo`.** Migram: `MOTIVOS_DE_OCORRENCIA`, `GRAVIDADES`, `CLIMAS`, `FRENTES`,
   `falhasDeDiario`, e a física do cancelar-com-motivo.
3. **`crew`.** Migram: `ESPECIALIDADES`, `MODALIDADES`, `concentracoes` — e a
   decisão D1 (identificador fiscal e ASO) **precisa estar tomada antes**, porque
   ela muda o schema.
4. **`cdoc`.** Migram: `TIPOS_DE_DOCUMENTO`, `documentosNoPrazo`.
5. **Os observadores**, em `core.tenant_insights` — e aí as migrations `0116`–`0118`
   precisam estar aplicadas.

⚠️ **Antes da primeira linha de código:** o rito do Conselho sobre `03b` e `03c`
(modelo → juízes externos sem contato entre si → síntese → **depois** o código).
Emenda estrutural no papel custa uma tarde; depois do motor, custa reconstrução.

---

## 5. O DIA EM QUE ESTE REPOSITÓRIO VIRA HISTÓRICO

Quando os quatro módulos estiverem no Business OS e o tenant piloto estiver no
ar, este repositório **para**. Não se mantêm duas casas do mesmo produto — foi
assim que nasceram as confusões que o canon registra.

O que fica: este documento, o `ROTEIRO-DEMO.md` (que continua servindo para a
próxima venda, apontando para o produto de verdade) e os screenshots.

*Universo Bonaparte · ALSHAM Global Commerce Ltda · Powered by ALSHAM*
