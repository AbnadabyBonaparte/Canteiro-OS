# MIGRAÇÃO — o que desta vitrine volta para o Business OS
## E o que morre aqui, de propósito

> **A vitrine vende; o produto mora no Business OS.**
> Repositório de destino: `AbnadabyBonaparte/alsham-business-os`.
> Desenho de referência: `docs/construcao/` daquele repositório (PR #103) —
> módulos `meas`, `rdo`, `empr`, `cdoc` sobre o PMO já construído.
>
> ⚠️ **Documento atualizado em 22/08/2026 para a v2.** A v2 trocou o vocabulário
> por orientação jurídica, dobrou o número de salas e trouxe imagem própria.
> A §0 explica a troca de palavra; ela é a primeira coisa a migrar, porque muda
> nome de tabela, de coluna e de arquivo lá do outro lado.

---

## 0. ⚖️ A TROCA DE VOCABULÁRIO — leia antes de qualquer linha

**Nota histórica.** A v1 desta vitrine (21/08/2026) chamava o prestador de
**"diarista"** e o pagamento de **"diária"**, e o módulo previsto no Business OS
nasceu com o nome `crew`. Em **22/08/2026**, por **orientação escrita do advogado
da empresa**, essas palavras foram aposentadas:

> *"Vamos evitar falar em diária ou diarista; vamos falar em contrato de empreita
> por valor global."*

**Este é o único arquivo do repositório onde as palavras antigas aparecem** — e
aparecem só aqui, nesta seção, para que ninguém que leia o histórico do projeto
ache que houve descuido. Em `src/`, no README, no roteiro, no seed e nas
taxonomias a contagem é **zero**.

### O que a troca muda na migração

| Onde | Estava | Fica |
|---|---|---|
| Nome do módulo | `crew` | **`empr`** (empreitada) |
| Entidade central | turma/diarista | **empreiteiro** (pessoa ou empresa contratada por empreita) |
| Registro de trabalho | diária | **empreita** — objeto, quantidade, unidade, **valor global**, prazo |
| Pagamento | valor da diária | **marco de pagamento** vinculado a entrega aceita |
| Convite | chamado | **proposta de empreita** |
| Permissão | `crew.call.respond` | `empr.proposta.responder` |

⛔ **Três arquivos do Business OS ainda carregam a palavra velha** e precisam ser
renomeados **antes** de virar código:

- `docs/construcao/03b-SPEC-DIARISTAS.md` → `03b-SPEC-EMPREITA.md`
- `docs/construcao/02b-LEXIS-PARECER-*.md` → o parecer é **anterior** à
  orientação; ele continua válido no mérito (Súmula 331 V, OJ 191, CLT 452-A),
  mas **o vocabulário dele precisa passar pelo advogado outra vez**
- toda menção a `crew.*` em `03-DESENHO-DO-SISTEMA.md` e `04-MVP-DA-MESA.md`

⭐ **Por que isto é a primeira tarefa e não a última:** nome de tabela é a coisa
mais cara de trocar depois. Trocar no papel custa uma tarde; trocar depois de
`crew_calls` existir em produção custa migration, backfill e retrabalho de RLS.

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

São **15 listas** na v2 (a v1 tinha 8). **Vira:** tabela de cada módulo, com
`tenant_id`, nome livre e posição.

| Lista da vitrine | Destino no produto |
|---|---|
| `MOTIVOS_DE_GLOSA` | `meas.gloss_reasons` |
| `UNIDADES` | campo texto do item de medição — o edital manda |
| `MOTIVOS_DE_OCORRENCIA`, `GRAVIDADES`, `CLIMAS`, `FRENTES` | `rdo.*` (a gravidade reusa a física do `occ`) |
| `ESPECIALIDADES`, `MODALIDADES` | `empr.skills`, `empr.modalities` |
| ⭐ `OBJETOS_DE_EMPREITA` | `empr.work_objects` — **novo na v2**: é o que se contrata ("assentamento de piso", "forma e concretagem de laje"), a alma da empreita por valor global |
| ⭐ `TIPOS_DE_ADITIVO` | `ctr.amendment_types` — prazo, valor, qualitativo, supressão |
| ⭐ `TIPOS_DE_OFICIO` | `ctr.letter_types` — a correspondência oficial com o órgão |
| `TIPOS_DE_DOCUMENTO` | `cdoc.*` — **texto livre**, nunca enum |
| ⭐ `FAMILIAS_DE_MATERIAL` | `purc.material_families` |
| ⭐ `SETORES` | rótulo de lotação do colaborador próprio — **não** é papel de acesso |
| `TIPOS_DE_OBRA` | rótulo do `proj` (que já é texto livre) |

⭐ **É por isso que elas nasceram como dados e não chumbadas na tela.** A
migração é **cópia com `insert`**, não reescrita. Se estivessem espalhadas em
`<option>` pelos componentes, alguém teria de caçá-las uma a uma e esqueceria
metade. A v2 provou o argumento: sete listas novas entraram **sem tocar em
componente nenhum**.

⚠️ **O que muda na migração:** aqui elas são constantes globais; lá são **dado
do tenant** (Lei Anti-Viés). Cada empresa nomeia o seu vocabulário. A `CHECK`
constraint continua proibida — as únicas exceções são física de método
(ciclo de vida, e a nota 0..100).

⛔ **`SETORES` tem uma armadilha:** parece papel de acesso e não é. Lotação
("Administrativo", "Produção") é atributo do colaborador; permissão é outra
tabela, outra vida. Misturar as duas é o erro clássico que transforma organograma
em modelo de segurança.

### 2.2 ⭐⭐ As regras do analista — `src/lib/analista.ts`

São **15 avisos** na v2 (a v1 tinha 9). **Vira:** funções puras em
`packages/meas`, `packages/empr` e observadores em `packages/engineer/src/local/`,
no molde exato do `recebiveis.ts` que já existe lá (recebe o snapshot que o banco
já tem, devolve prosa, nunca inventa número).

| Função da vitrine | Destino |
|---|---|
| `medicoesPresas`, `totalPresoCents` | `packages/meas` → observador `meas-accepted-unpaid` |
| `ritmoDePagamento` | `packages/meas` → observador `payer-lag` |
| `resumoDeGlosa` | `packages/meas` |
| `caixaPorMes` | `packages/meas` → alimenta a leitura físico-financeira |
| `concentracoes` | `packages/empr/src/concentration.ts` → `empr-concentration` |
| `documentosNoPrazo` | `packages/cdoc` → `cdoc-expiring` |
| `desviosDeInsumo` | `packages/pcost` (composição na aplicação) → `pcost-over` |
| `falhasDeDiario` | `packages/rdo` → `rdo-missing` |
| `avisos()` | ⚠️ **não migra como está** — vira linhas em `core.tenant_insights` (migrations `0116`–`0118`, que já existem e ainda não foram aplicadas) |

⭐ **Elas já estão prontas para migrar** porque foram escritas como **funções
puras sem I/O**: recebem o mundo, devolvem o resultado. Nenhuma abre conexão,
nenhuma sabe o que é uma tela.

⭐ **O `porque: string[]` é o achado da casa.** Todo aviso carrega a conta
aberta — as parcelas da soma, a data de cada carimbo, o divisor da média. O
`recebiveis.ts` do Business OS já monta a frase determinística, mas **não expõe
a aritmética ao usuário**. Expor transforma *"confie no número"* em *"confira o
número"* — e é barato: as linhas já existem, só não eram mostradas.

⭐ **A régua de concentração é do tenant, não nossa** (`ReguaConcentracao`:
empreitas consecutivas, dias sem intervalo, % mínimo de recusa, mínimo de outras
empresas). Quatro parâmetros, todos editáveis em Configurações, **nascendo
vazios no produto**. E o aviso só acende com **dois ou mais sinais juntos** —
um sinal isolado é ruído, e a tela diz isso.

⚠️ **O que muda:** no produto, quem lê o banco é o `apps/api` sob
`service_role`, entrega os números à função pura, e a função devolve o texto.
**A função nunca vê credencial** — é a linha vermelha do modelo do Engenheiro.

### 2.3 ⭐ O desenho de Contratos e aditivos — novo na v2

Não existe módulo `ctr` no Business OS ainda. **Este desenho é a spec dele**, e
migra como desenho antes de migrar como código:

| Decisão provada aqui | Por que ela importa |
|---|---|
| **Contrato e aditivo são a mesma linha do tempo**, não duas telas | O saldo vigente é `contrato + Σ aditivos`, e ninguém deveria somar isso na cabeça |
| **O limite legal de 25% (Lei 14.133 art. 125) é mostrado como barra**, com o quanto já foi consumido | É o número que decide se cabe mais um aditivo — e o que o órgão vai conferir |
| **Ofício é peça de primeira classe**, com prazo de resposta e estado próprio | A correspondência oficial é prova; hoje mora em caixa de e-mail e some |
| **Visita de fiscal gera pendência com prazo**, não uma anotação solta | É o que vira notificação, e depois multa |
| Aditivo tem **tipo do tenant**, nunca enum de código | Prazo, valor, qualitativo e supressão são o começo — cada órgão inventa o seu |

⛔ **O que este desenho NÃO resolve e não deve fingir que resolve:** o cálculo
de reequilíbrio econômico-financeiro e o reajuste por índice. São conta de
engenharia de custos com base contratual própria — entram como campo preenchido
por quem sabe, não como fórmula do sistema.

### 2.4 ⭐ O desenho de Documentos e certidões — novo na v2

| Decisão | Destino |
|---|---|
| **Um documento é uma validade, não um arquivo** — o que importa é a data que vence | `cdoc` — o índice é por vencimento, e a listagem já nasce ordenada por ele |
| **Três faixas: vencido · vence em 30 dias · em dia** | O semáforo é derivado da data, nunca uma coluna `status` |
| **O documento pertence a alguém** — empresa, obra, colaborador ou empreiteiro | Uma tabela, um `owner_type` + `owner_id`, não quatro telas |
| **Tipo é texto livre do tenant** | CND, FGTS, CRF, ART, ASO, apólice — e o que o próximo edital inventar |

⚠️ **Sem `packages/documents` (que ainda é README) não há onde o arquivo morar.**
O índice de validade migra antes do GED e vale sozinho: saber que a CND vence em
9 dias já é o serviço.

### 2.5 As decisões de física

Não são código, são o mais valioso. Cada uma já está escrita na spec de destino:

| Decisão provada aqui | Onde ela já está escrita |
|---|---|
| **A recusa é dado de primeira classe**, carimbada pelo servidor | `03b` §0.3 (arquivo a renomear — ver §0) |
| **Não existe excluir — existe cancelar com motivo**, e o cancelado fica à vista | `03-DESENHO` §4.2 (`rdo`) |
| **Quatro números, quatro momentos** — nunca uma coluna `status` | `03c-SPEC-MEDICAO.md` §0.2 |
| **Glosa com motivo obrigatório**, do vocabulário do tenant | `03c-SPEC-MEDICAO.md` §0.4 |
| **A régua de vínculo nasce vazia**, definida pelo jurídico do tenant | `03b` §1.4 |
| ⭐ **A empreita é contrato de resultado**: objeto, quantidade, unidade, valor global, prazo — e o pagamento amarrado ao aceite da entrega | **novo na v2** — precisa entrar na spec renomeada |
| **Insight abre a conta** ("por que isso?") | novo — nasceu na v1, e é bom |

### 2.6 A régua de medição e o gerador determinístico

`src/components/regua.tsx` migra para `apps/portal` do Business OS como
componente de UI — **não** para `packages/`: é pele. O que migra junto e importa
é a **decisão**: quatro densidades do mesmo ouro (executado → aceito → faturado
→ pago), nunca quatro cores, com a cinta hachurada marcando o degrau
aceito → pago.

Do `src/data/seed.ts`, o que é ouro é o **gerador determinístico**
(`mulberry32` + `DATA_REF`, zero `Math.random()`, zero `new Date()` sem
argumento). Teste com número aleatório é teste que falha na terça. O padrão
"mundo calculado a partir de uma data fixa" migra junto — e o **sorteio
ponderado pelo valor do contrato**, que foi o que corrigiu a incoerência de a
obra pequena acumular custo de obra grande.

O resto do seed **vira fixture de teste, não seed de produto**:

⛔ **O `supabase/seed/0001_platform.sql` do Business OS insere ZERO tenant e ZERO
usuário, por contrato.** Este mundo fictício **não entra lá**. Ele vira
`packages/*/src/*.test.ts` — o caso do empreiteiro com 11 empreitas consecutivas
vira teste da régua de concentração; o contraexemplo com 52% de recusa vira o
teste de que o aviso **não** acende.

---

## 3. O QUE MORRE AQUI — e é para morrer

| Peça | Por quê |
|---|---|
| `src/lib/store.ts` (a memória) | No produto, quem guarda é Postgres com RLS `enable + force`, papel do tenant e trilha imutável. Um store em memória não tem isolamento, não tem permissão e não tem prova |
| Os botões **Aceitar/Recusar** no lugar do empreiteiro | ⛔ **Existem só para a demonstração andar.** No produto, quem carimba a recusa é o empreiteiro, com a permissão `empr.proposta.responder`. Migrar isto destruiria o valor da prova |
| O ditado de voz que escreve texto de exemplo | É encenação declarada. No produto, ou transcreve de verdade ou não existe |
| O "Gerar dossiê" que não gera arquivo | Idem. No produto sai inteiro, do período pedido, com quem exportou carimbado |
| O upload de foto que só liga um sinalizador | Sem GED (`packages/documents` ainda é README) não há onde a foto morar |
| Os cartões honestos de integração | Viram integração de verdade — ou continuam declarados FORA pela Lei 3 |
| `PRAZO_CONTRATUAL_DIAS = 30` | ⚠️ **No produto é campo do contrato.** Cada edital traz o seu; prazo nunca é constante de código |
| O `notadoHaMin` fixo por aviso | Vira o `updated_at` real de `core.tenant_insights` |
| ⭐ `src/lib/imagens.ts`, `public/img/` e o `MANIFESTO.json` | **É material de venda.** No produto, foto é conteúdo do tenant, com dono, data e local — não peça de arte |
| ⭐ `scripts/gerar-imagens.ts` | Fica aqui. O produto **não chama API de imagem em runtime**, e não deve começar |
| ⭐ Os `layout.tsx` com `generateStaticParams` em `obras/[id]` e `medicoes/[obraId]` | ⛔ **Técnica de vitrine, não desenho de produto.** Aqui as obras são três e fixas, então as páginas saem prontas do build. No produto elas são linhas do banco de cada empresa e mudam o tempo todo — lá a página é montada por requisição, com RLS no meio |
| `src/lib/tenant.ts` (nome por variável de ambiente) | No produto o tenant é linha no banco, não `process.env` |
| Todo o `docs/screenshots/` | É material de venda, não de produto |

---

## 4. A ORDEM DA MIGRAÇÃO

Quando o dono decidir que vendeu:

0. ⚖️ **A troca de vocabulário, no papel** (§0). Renomear `03b`, revisar o
   parecer com o advogado, trocar `crew` por `empr` em todo o desenho.
   **Antes de qualquer código.**
1. **`meas` primeiro.** É onde está o dinheiro e é o que as outras alimentam.
   Migram junto: `MOTIVOS_DE_GLOSA`, `UNIDADES`, `medicoesPresas`,
   `ritmoDePagamento`, `resumoDeGlosa`, `caixaPorMes`.
2. **`rdo`.** Migram: `MOTIVOS_DE_OCORRENCIA`, `GRAVIDADES`, `CLIMAS`, `FRENTES`,
   `falhasDeDiario`, e a física do cancelar-com-motivo.
3. **`empr`.** Migram: `ESPECIALIDADES`, `MODALIDADES`, `OBJETOS_DE_EMPREITA`,
   `concentracoes` — e a decisão D1 (identificador fiscal e ASO) **precisa estar
   tomada antes**, porque ela muda o schema.
4. **`cdoc`.** Migram: `TIPOS_DE_DOCUMENTO`, `documentosNoPrazo`.
5. **`ctr`** (novo — Contratos, aditivos, ofícios, visitas). Migram:
   `TIPOS_DE_ADITIVO`, `TIPOS_DE_OFICIO`, e o desenho da §2.3.
6. **Os observadores**, em `core.tenant_insights` — e aí as migrations
   `0116`–`0118` precisam estar aplicadas.

⛔ **Suprimentos, Equipamentos, Equipe própria e Segurança ficam para depois do
piloto.** Estão desenhados aqui e valem como referência, mas **não entram no
MVP da mesa** — e a Lei 3 manda perguntar, antes de cada um, se não é integração
com o que a empresa já usa.

⚠️ **Antes da primeira linha de código:** o rito do Conselho sobre `03b` e `03c`
(modelo → juízes externos sem contato entre si → síntese → **depois** o código).
Emenda estrutural no papel custa uma tarde; depois do motor, custa reconstrução.

---

## 5. O DIA EM QUE ESTE REPOSITÓRIO VIRA HISTÓRICO

Quando os módulos estiverem no Business OS e o tenant piloto estiver no ar, este
repositório **para**. Não se mantêm duas casas do mesmo produto — foi assim que
nasceram as confusões que o canon registra.

O que fica: este documento, o `ROTEIRO-DEMO.md` (que continua servindo para a
próxima venda, apontando para o produto de verdade), o `DESIGN.md`, o
`IMAGENS.md` e os screenshots.

*Universo Bonaparte · ALSHAM Global Commerce Ltda · Powered by ALSHAM*
