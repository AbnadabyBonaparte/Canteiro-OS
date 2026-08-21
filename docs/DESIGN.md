# DESIGN — Canteiro OS · vitrine
## Plano de tokens, wireframes e a crítica contra os defaults

**STYLUS X.1** · 21/08/2026 · Escrito **antes** do código, por ordem do bastão.

---

## 1. O MUNDO

O Canteiro herda a **Lei dos Planetas**: Obsidian + Imperial Gold, acento único. O que muda é a **matéria**. O shopping é vidro e piso polido; o canteiro é **concreto, aço e sol**. A pele não pode ser a mesma superfície brilhante — precisa parecer instrumento de trabalho, não painel executivo.

**As três matérias que o produto imita:**
- **Concreto** — a superfície. Cinza sem brilho, fosco, com borda de 1px em vez de sombra difusa. Profundidade por valor de cinza, nunca por blur.
- **Aço graduado (a trena)** — a medida. Marcas regulares, numerais tabulares, leitura por posição.
- **Latão (o ouro)** — o carimbo. Aparece pouco e pesa muito: o que exige decisão do dono.

---

## 2. ⭐ A ASSINATURA — A RÉGUA DE MEDIÇÃO

Uma só, e ela se repete em todo o produto: **a régua de quatro marcas**.

```
 EXECUTADO            ACEITO              FATURADO            PAGO
 ┌─────────────────────────────────────────────────────────────────┐
 │███████████████████████████████████████▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒░░░░░░░░░░│
 └┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬┘
  0        20%       40%       60%       80%      100%
     R$ 1.842.000   R$ 1.704.000   R$ 1.491.600   R$ 1.279.200
```

**Por que ela é a assinatura:** é o argumento inteiro do produto virado em desenho. Todo ERP mostra **um** número com **um** status. A obra pública tem **quatro**, e o dinheiro da empresa mora na distância entre eles. A régua torna essa distância **visível de longe** — e quanto maior o degrau entre *aceito* e *pago*, mais óbvio o problema.

**Regras da régua:**
- as marcas (ticks) são de trena: 20 divisões, a cada 5 uma mais alta;
- o preenchimento é **decrescente por definição** (executado ≥ aceito ≥ faturado ≥ pago) — quatro densidades do mesmo ouro, nunca quatro cores diferentes;
- o degrau **aceito → pago** ganha uma cinta de destaque quando passa da régua de dias;
- em telefone ela vira barra fina com os quatro números embaixo, nunca some.

⛔ **Não haverá um segundo elemento de assinatura.** Uma casa, um gesto.

---

## 3. TOKENS `--cnt-*`

```
/* superfície — concreto */
--cnt-obsidian        #0A0E1A   fundo da página
--cnt-surface         #121829   cartão, painel
--cnt-surface-2       #182036   cartão elevado, cabeçalho de tabela
--cnt-sunken          #070A12   poço (campo de formulário, faixa inferior)
--cnt-line            #232C42   borda de 1px — o traço de lápis no concreto
--cnt-line-strong     #34405C   borda de foco e de separação forte

/* tinta */
--cnt-chalk           #E9ECF4   texto primário (giz sobre concreto)
--cnt-concrete        #97A1B7   texto secundário
--cnt-concrete-dim    #6B7488   legenda, rodapé

/* acento — latão, único */
--cnt-gold            #C9A24B
--cnt-gold-bright     #E0BC6A   hover e número que importa
--cnt-gold-veil       rgba(201,162,75,0.14)
--cnt-gold-line       rgba(201,162,75,0.34)

/* estado — ver §3.1, exceção argumentada */
--cnt-rust            #C4553D   vencido, glosa, parado
--cnt-olive           #6E9070   aceito, pago, em dia
```

### 3.1 ⚠️ A exceção argumentada ao acento único

A Lei dos Planetas dá **um** acento. Aqui há três cores. **Isto é exceção, e ela se justifica:**

> **Cor de estado não é acento decorativo — é informação.** "Certidão vencida" e "certidão em dia" precisam se distinguir sem o usuário ler. Pintar as duas de ouro seria bonito e **mentiria** sobre o estado (Lei 7).

E as duas cores extras vêm **do próprio canteiro**, não de uma paleta de SaaS: **óxido** (a ferrugem do vergalhão exposto) e **oliva** (a lona da obra). Nenhuma é o vermelho `#EF4444` nem o verde `#22C55E` de framework. O ouro continua sendo o único acento **de marca**; óxido e oliva são **semáforo**, e aparecem só onde há estado.

---

## 4. TIPOGRAFIA

| Papel | Fonte | Por quê |
|---|---|---|
| **Display** | **Oswald** 500/700, caixa alta, tracking apertado | é a letra da **placa de obra** e do estêncil de canteiro. Reconhecível de longe, e ninguém confunde com painel de SaaS |
| **Corpo** | **IBM Plex Sans** 400/500/600 | desenhada para legibilidade em tela ruim e luz forte — o celular do encarregado ao sol |
| **Número** | **IBM Plex Mono** | numerais tabulares de verdade. Coluna de dinheiro alinha na vírgula; a régua vira trena |

⛔ **Proibidos:** Inter, Geist, `system-ui` como fonte de marca. São o default de IA e não dizem nada.

**Escala** (mobile → desktop): 12 · 14 · 16 · 20 · 26 · 34 · 46. Corpo mínimo **16px no telefone** — regra de sol.

---

## 5. WIREFRAMES

### 5.1 Painel de Obras — `/painel` (desktop)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ CANTEIRO OS      Construtora Araguaia Obras · Vale do Araguaia    [busca] │
├────────────┬─────────────────────────────────────────────────────────────┤
│ Painel     │  ╔═══════════════════════════════════════════════════════╗  │
│ Diário     │  ║  DINHEIRO PRESO                                       ║  │
│ Empreiteir.│  ║  R$ 486.900              aceito pelo fiscal, não pago ║  │
│ Medições   │  ║  ┌───────────────────────────────────────────────┐    ║  │
│ Funcionário│  ║  │ Medição 4 · Creche Jardim Alto                │    ║  │
│  digital   │  ║  │ R$ 212.400            aprovada há  ▸ 18 dias  │    ║  │
│            │  ║  │ Medição 9 · Pavimentação Setor Leste          │    ║  │
│            │  ║  │ R$ 274.500            aprovada há  ▸ 63 dias  │    ║  │
│            │  ║  └───────────────────────────────────────────────┘    ║  │
│            │  ╚═══════════════════════════════════════════════════════╝  │
│            │                                                             │
│            │  AS OBRAS                                                   │
│            │  ┌──────────────────────┐ ┌──────────────────────┐          │
│            │  │ CRECHE JARDIM ALTO   │ │ PAVIMENTAÇÃO LESTE   │   ...    │
│            │  │ Pref. de Serra Azul  │ │ Pref. de Vila Aurora │          │
│            │  │ físico 62% fin. 54%  │ │ físico 78% fin. 41%  │          │
│            │  │ ▐▐▐▐▐▐▐▐▐▓▓▓▒▒░░░░░  │ │ ▐▐▐▐▐▐▐▓▓▒▒░░░░░░░░  │          │
│            │  │ exec aceit fat  pago │ │ exec aceit fat  pago │          │
│            │  │ próxima medição 05/09│ │ próxima medição 02/09│          │
│            │  └──────────────────────┘ └──────────────────────┘          │
│            │                                                             │
│            │  VENCE ESTA SEMANA                                          │
│            │  ▸ Certidão de FGTS ......................... 6 dias  ⚠     │
│            │  ▸ ASO · 3 empreiteiros ..................... 4 dias  ⚠     │
│            │  ▸ Prazo do aditivo · Pavimentação .......... 9 dias        │
├────────────┴─────────────────────────────────────────────────────────────┤
│ Ambiente de demonstração · dados fictícios                               │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Diário de Obra — `/diario` (390px, o celular na mesa)

```
┌───────────────────────────┐
│ ◀ Diário de obra          │
├───────────────────────────┤
│ Obra                      │
│ [ Creche Jardim Alto  ▾ ] │
│                           │
│ O que houve hoje          │
│ ┌────────┐┌─────────────┐ │
│ │ Chuva  ││Falta de     │ │
│ └────────┘│material     │ │
│ ┌────────┐└─────────────┘ │
│ │Efetivo ││Visita do    │ │
│ │abaixo  ││fiscal       │ │
│ └────────┘└─────────────┘ │
│                           │
│ Efetivo em campo          │
│ [ –  ]   12   [ +  ]      │
│                           │
│ Observação                │
│ ┌───────────────────────┐ │
│ │                       │ │
│ └───────────────────────┘ │
│ [ 🎙 Ditar observação   ] │
│                           │
│ [ 📷 Anexar foto        ] │
│                           │
│ carimbo automático:       │
│ 21/08 · 16:40 · você ·    │
│ Creche · nublado          │
│                           │
│ ┌───────────────────────┐ │
│ │   REGISTRAR NO DIÁRIO │ │
│ └───────────────────────┘ │
│         Cancelar          │
├───────────────────────────┤
│ HOJE                      │
│ 16:12 Visita do fiscal    │
│       "conferiu a laje…"  │
│ 07:30 Efetivo 12 · chuva  │
├───────────────────────────┤
│ [Painel][Diário][Diar.]…  │
└───────────────────────────┘
```

### 5.3 Empreiteiros & propostas — `/empreiteiros`

```
┌──────────────────────────────────────────────────────────────────┐
│ ⚠ ALERTA DE CONCENTRAÇÃO                                         │
│ Ronaldo B. (fictício) — 11 empreitas seguidas na Creche Jardim   │
│ Alto, sem intervalo há 66 dias, todas recebidas por Sr. Aparecido│
│ 0% de recusa em 26 propostas · nenhuma outra empresa declarada   │
│ ┌────────────────────────┐ ┌────────────────────────┐            │
│ │ Empreitas seguidas     │ │ Dias sem intervalo     │            │
│ │ 11 · régua: 8       ⚠  │ │ 66 · régua: 25      ⚠  │            │
│ ├────────────────────────┤ ├────────────────────────┤            │
│ │ % de recusa            │ │ Outras empresas        │            │
│ │ 0% · régua: mín 10% ⚠  │ │ 0 · régua: mín 1    ⚠  │            │
│ └────────────────────────┘ └────────────────────────┘            │
│ Régua: [ 8 ] [ 25 ] [ 10% ] [ 1 ]      valores de exemplo ✎      │
│ Parâmetros definidos pelo jurídico da empresa — o sistema não    │
│ sugere números. Acende com DOIS ou mais sinais; um é ruído.      │
└──────────────────────────────────────────────────────────────────┘
┌────────────────────────────────┬─────────────────────────────────┐
│ PARCEIROS DE EMPREITA    [busca]│ PROPOSTA DE EMPREITA           │
│ ┌────────────────────────────┐ │ Reboco externo — fachada leste  │
│ │                            │ │ valor global R$ 3.800 · 6 dias  │
│ │ Ronaldo B.   pedreiro  MEI │ │ ┌────────────────────────────┐  │
│ │ 11 empreitas ⚠ 0% recusa   │ │ │ ✓ Aceitou   13:58  Ronaldo │  │
│ ├────────────────────────────┤ │ │ ✓ Aceitou   14:02  Adenilso│  │
│ │ Marcos T.  armador   ME    │ │ │ ✗ Recusou   14:11  Marcos  │  │
│ │  6 empreitas · 52% recusa  │ │ │   "estou em outra empreita"│  │
│ └────────────────────────────┘ │ │ ○ Sem resposta     Gilmar  │  │
│                                │ └────────────────────────────┘  │
│                                │ recusa registrada = prova de    │
│                                │ autonomia                       │
└────────────────────────────────┴─────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│ DOSSIÊ DE REGULARIDADE                     [ Gerar dossiê (PDF) ] │
│ contratos de empreita · aceites · quitações · propostas ·         │
│ recusas · notas e recibos · ASO e NR · EPI assinado               │
│ "o sistema mostra pro senhor antes de mostrar pro juiz"           │
└──────────────────────────────────────────────────────────────────┘
```

### 5.4 Medição & Boletim — `/medicoes/[obraId]`

```
┌──────────────────────────────────────────────────────────────────────┐
│ CRECHE MUNICIPAL JARDIM ALTO · Boletim de medição nº 4               │
│ período 01/07 a 31/07 · fiscal: eng. A. Moreira (fictício)  [ACEITA] │
├──────────────────────────────────────────────────────────────────────┤
│ ▐▐▐▐▐▐▐▐▐▐▐▐▐▐▐▐▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒░░░░░░░░░░░░░  ← a régua              │
│ executado 318.900 · aceito 212.400 · faturado 212.400 · pago 0       │
├────┬──────────────────────────┬──────┬───────┬─────────┬────────────┤
│ nº │ serviço                  │ un   │ qtde  │ unitário│ aceito     │
│ 01 │ Escavação manual         │ m³   │ 84,00 │ 96,40   │ 8.097,60   │
│ 02 │ Concreto usinado fck 25  │ m³   │ 62,50 │ 612,00  │ 38.250,00  │
│ 03 │ Alvenaria bloco cerâmico │ m²   │210,00 │ 88,30   │ ⚠ glosado  │
│    │   └ glosa: serviço não executado no período  −18.543,00        │
└────┴──────────────────────────┴──────┴───────┴─────────┴────────────┘
┌──────────────────────────────┐ ┌───────────────────────────────────┐
│ CAIXA — previsto × realizado │ │ ┊ NF e retenções                  │
│  ▁▃▅▂▇▄▁▆▃▇▅▂                │ │ ┊ integra com o seu sistema fiscal │
│ Serra Azul paga em ~45 dias  │ │ ┊ (o Canteiro não emite nota)      │
└──────────────────────────────┘ └───────────────────────────────────┘
```

### 5.5 Funcionário digital — `/analista`

```
┌──────────────────────────────────────────────────────────────────┐
│ FUNCIONÁRIO DIGITAL          ninguém perguntou nada.             │
├──────────────────────────────────────────────────────────────────┤
│ ⚠ R$ 212.400 aceitos e não pagos há 18 dias        notado há 4min│
│   Medição 4 · Creche Jardim Alto            [ por que isso? ▾ ]  │
│   └─ aceite em 03/08 (boletim nº 4) · nenhum lançamento de       │
│      pagamento até 21/08 · 18 dias corridos                      │
├──────────────────────────────────────────────────────────────────┤
│ ⚠ Certidão de FGTS vence em 6 dias e trava 2 medições  há 11min  │
│ ⚠ Concreto 31% acima do previsto na Creche             há 26min  │
│ ⚠ Ronaldo B.: 4 de 4 sinais de concentração            há 26min  │
│ ⚠ Efetivo abaixo do cronograma 3 dias seguidos · UBS   há 1h     │
│ ▸ Vila Aurora paga em média 90 dias — previsão de caixa há 2h    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. A CRÍTICA — os defaults de IA, nomeados e recusados

| # | O default | Por que ele aparece | O que fizemos |
|---|---|---|---|
| **1** | **Grade de cartões iguais**: ícone + rótulo + número grande, 4 por linha | é o que todo dashboard gerado parece, porque é o que há mais na internet | a hierarquia é por **dinheiro**, não por simetria. O bloco "Dinheiro preso" ocupa a largura inteira e vem **antes** das obras. Os cartões de obra têm tamanhos iguais mas conteúdo **assimétrico** — quem tem mais parado cresce em peso tipográfico, não em área |
| **2** | **Gradiente roxo/azul, vidro fosco, sombra difusa** | é o "SaaS bonito" default | ⛔ **zero gradiente, zero blur, zero sombra colorida.** Profundidade é valor de cinza + borda de 1px. Uma única sombra permitida: `0 1px 0 rgba(0,0,0,.4)` sob barras fixas |
| **3** | **Inter/Geist + tudo em sentence case + peso 600** | é o default do `create-next-app` | display **Oswald** em caixa alta para títulos de seção (placa de obra), corpo **IBM Plex Sans**, número **IBM Plex Mono** tabular |
| **4** | **Ícone genérico de ERP** (gráfico de barras, engrenagem, "sparkles" de IA) | biblioteca pronta | ícones **desenhados do ofício**, em traço de 1,5px: capacete, régua, carimbo, trena, prumo. ⛔ nenhuma varinha de IA no funcionário digital — ele é um **carimbo**, não mágica |
| **5** | **Emoji como ícone de estado** | atalho fácil | ⛔ nenhum emoji na interface. Estado é cor + rótulo escrito |
| **6** | **"Insights" com texto bonito e fixo** | o pior dos defaults: parece inteligência | todo insight é **calculado do seed** em `analista.ts`, e cada um abre um **"por que isso?"** com a conta. Se o número não existe, a linha não aparece |

---

## 7. VOCABULÁRIO — a lista fechada

**Usar:** obra · frente · encarregado · efetivo · medição · boletim · **empreita** · **valor global** · **proposta** · **empreiteiro** · **parceiro de empreita** · aceite · quitação · aditivo · glosa · fiscal da prefeitura · certidão · ASO · canteiro.
⛔ **Retirado na v2 por orientação do jurídico:** as quatro palavras do vocabulário antigo. A lista exata do que saiu e do que entrou no lugar está em `docs/MIGRACAO.md` §0, único arquivo autorizado a repeti-las.
⛔ **Nunca:** tenant · módulo · registro · entidade · dashboard · workflow · card · deploy · schema · usuário (é "você" ou o nome) · item (é "serviço").

**Verbos dos botões, sempre diretos:** *Registrar no diário · Abrir proposta · Aceitar entrega · Fechar medição · Lançar glosa · Gerar dossiê · Cancelar com motivo.*
⛔ Nunca *Salvar*, *Enviar*, *Submeter*, *OK*.

---

## 8. RESPONSIVO

| Faixa | Navegação | Régua | Tabela de medição |
|---|---|---|---|
| **≤ 640px** | barra inferior fixa, 5 destinos, alvo de 48px | barra fina + os 4 números em duas linhas | vira lista de fichas, uma por serviço |
| **641–1024px** | barra inferior + cabeçalho | completa | tabela com rolagem horizontal própria |
| **≥ 1025px** | coluna lateral fixa + busca | completa com ticks de trena | tabela inteira |

**Testado em 390px** (o celular da mesa) — requisito do CRIVO.

---

## 9. O QUE A VITRINE NÃO DESENHA

Login · configurações · perfil · notificações por e-mail · exportação real de PDF · upload real de foto · transcrição real de voz. Onde o produto real integraria, a vitrine mostra o **cartão honesto** (borda tracejada, sem botão): *"integra com o seu sistema fiscal"*. ⛔ **Nenhum botão morto.**

---

# ADENDO v2 — IMAGEM, CORPO E VOCABULÁRIO
## 22/08/2026 · o que mudou depois da primeira mesa

O dono viu a v1 e disse: *"está fraca visualmente e com pouco corpo — parece app comprado."* Tinha razão. Um painel escuro com quatro listas não convence quem constrói prédios. Este adendo é a resposta em três frentes, e a ordem importa.

---

## 9. O VOCABULÁRIO MUDOU — e não é cosmético

O jurídico da empresa orientou por escrito que se fale em **contrato de empreita por valor global** — e que as palavras do vocabulário antigo saiam do produto. O registro literal da orientação está em `docs/MIGRACAO.md` §0.

Empreitada é contrato de **resultado** (Código Civil, arts. 610–626): entrega-se uma obra ou parte dela por um valor combinado, com autonomia de meios. **Não se paga tempo; paga-se entrega.** Isso muda o nome do módulo, das telas, dos campos, do seed e do roteiro — e muda o desenho:

| v1 (proibido) | v2 |
|---|---|
| Contagem de dias trabalhados | **"11 empreitas seguidas, sem intervalo há 66 dias"** |
| Régua de 2 números | ⭐ **Régua de 4 sinais** — empreitas seguidas · dias sem intervalo · % de recusa · outras empresas |
| Alerta com 1 sinal | ⭐ **Acende com DOIS ou mais.** Um sinal isolado é ruído: quem fez sete empreitas seguidas numa obra grande e recusou metade das propostas está exercendo autonomia, não a perdendo |
| Convite por pessoa e por dia ("4 pedreiros, seg a qua") | **Proposta de empreita**: objeto, valor global, prazo |

⚖️ **A régua continua sem valor de fábrica**, e agora aparece em dois lugares: no alerta e em Configurações, sempre com a mesma nota — *parâmetros definidos pelo jurídico da empresa; o sistema não sugere números*.

---

## 10. ⭐ A IMAGEM COMO CHÃO, NUNCA COMO ASSINATURA

**A assinatura continua sendo a régua de quatro marcas.** A imagem é o **chão** — ela dá peso e lugar, e some atrás do dado. A regra, sem exceção:

> **A imagem serve a DADO, não decora.**
> O banner da capa carrega o número do dinheiro preso. A capa da obra carrega o físico, o financeiro e a régua. A cena abre o diário. Sem número por cima, é foto de agência — e aí ela não entra.

**Tratamento único, em `src/components/imagem.tsx`:**
- véu de obsidian em **gradiente vertical**, mais fechado embaixo, onde mora o texto;
- **saturação 0,72 e contraste 1,04** — a foto recua, o ouro do dado avança;
- ⛔ **o ouro fica só nos dados.** Nunca uma foto crua e colorida brigando com o número;
- ⛔ **nenhuma chamada de API em tempo de execução.** As peças são geradas uma vez e commitadas (`docs/IMAGENS.md`);
- sem peça no manifesto, entra o **gradiente de reserva**. A tela funciona igual e ninguém vê imagem quebrada.

**O sistema de capas.** Cada obra do seed tem a sua (`CAPA_DA_OBRA` em `src/lib/imagens.ts`), e ela reaparece igual no Painel, em Obras, na Obra e em Contratos — a mesma obra tem sempre a mesma cara, e é assim que a mesa se localiza sem ler.

**Tipografia sobre foto.** Oswald aguenta: caixa alta, peso 500, sobre o trecho mais fechado do véu. ⛔ Nada de sombra de texto — se precisa de sombra, o véu está fraco.

**Duas leis de moldura, que nasceram de defeito medido:**
- ⭐ **Altura é piso, não teto** (`min-h`, nunca `h`). Com altura fixa, o telefone cortava o nome da empresa no meio da palavra: a foto estava mandando no dado. Se o dado cresce, a moldura cresce.
- ⭐ **A peça do topo mede em `vw`, não em `vh`.** Altura em `vh` muda quando a barra do navegador do telefone recolhe — e a página inteira abaixo dela escorrega junto. Foi essa troca que zerou o CLS da capa.

**Gera-se grande, guarda-se do tamanho da tela.** O modelo desenha melhor em 1344 px; a tira de cenas mostra a foto em 240 px. Guardar o grande ali é banda gasta **antes da primeira pintura**, com a foto do topo esperando na fila. O lote caiu de **1,2 MB para 540 kB** sem perder um pixel visível (`docs/IMAGENS.md` §3.1).

**Desempenho medido, não prometido:** Lighthouse mobile, 12 rotas medidas — **acessibilidade 100 e boas práticas 100 em todas**, performance com mediana **95** (a mais pesada, a medição de uma obra, mediana **92**), **CLS 0** em 11 das 12. As peças são servidas como saíram do gerador: deixar o otimizador do framework refazer WebP que já veio pronto custava o LCP inteiro e não devolvia um byte.

---

## 11. A CRÍTICA DE NOVO — os defaults que a imagem traz junto

Imagem é justamente onde o template de agência entra. Nomeando para recusar:

| # | O default | O que fizemos |
|---|---|---|
| **7** | **Hero com foto + gradiente roxo + três cartões iguais** | ⛔ zero roxo. O hero carrega **três números reais**, não três ícones, e o gradiente é obsidian sobre a própria foto |
| **8** | **Foto de banco de imagem com gente sorrindo para a câmera** | ⛔ **nenhum rosto identificável.** Trabalhadores de costas, de longe, ou só as mãos. É documentário, não catálogo |
| **9** | **Textura decorativa atrás de tudo** | as três texturas existem e ficam **reservadas** — entram só se um cartão precisar de peso, nunca como papel de parede |
| **10** | **Mapa interativo com pin colorido** | ⛔ **não há mapa.** Um mapa que não navega é enfeite; a localização mora no nome do órgão e na tira da região, declarada ilustrativa |
| **11** | **Logo grande da marca no topo de tudo** | a marca gerada vira **favicon** e nada mais. No cabeçalho, "CANTEIRO OS" é **texto vivo** em Oswald: mais nítido, escala, e não pesa |
| **12** | **Foto sem legenda fingindo ser real** | toda peça evocativa carrega **"ilustrativa"** à vista, e Configurações mostra a procedência de cada arquivo |

---

## 12. O CORPO — de 5 telas a 21 rotas, sem sala vazia

O menu passou a ser **por setor**, do jeito que uma empreiteira divide o próprio trabalho: Direção · Obras · Pessoas · Suprimentos · Financeiro · Documentos · Inteligência. As duas pernas continuam: menu **e** busca global (obra, contrato, empreiteiro, fornecedor, documento, medição).

**Regra do corpo:** nenhuma sala nasce vazia, e o dado de cada uma tem de fechar com o das outras. O custo real de uma obra não pode passar do contrato dela — se passar, a primeira tela desmente a segunda, e a mesa percebe antes de você.

| Faixa | Navegação |
|---|---|
| ≤ 640px | barra inferior com 5 destinos + **Setores** (folha com o menu inteiro), alvos de 48–60px |
| ≥ 1025px | coluna lateral com os 7 setores abertos + busca |

*Universo Bonaparte · ALSHAM Global Commerce Ltda · Powered by ALSHAM*
