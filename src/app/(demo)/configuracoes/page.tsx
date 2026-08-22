'use client';

/**
 * CONFIGURAÇÕES — é aqui que a mesa vê a Lei Anti-Viés funcionando.
 *
 * ⚖️ Tipo de obra, frente, motivo de glosa, motivo de ocorrência, gravidade,
 * especialidade, forma de contratar, objeto de empreita, família de material:
 * tudo isso é DADO DA EMPRESA, com nome livre. O sistema não decide como você
 * nomeia o seu mundo.
 *
 * ⚖️ E a régua de concentração mora aqui também, com a nota do jurídico — o
 * sistema não sugere número nenhum.
 */

import Image from 'next/image';
import { useState } from 'react';
import { definirReguaConcentracao, useMundo } from '@/lib/store';
import { cardapio } from '@/lib/remessa';
import { Botao, Campo, Cartao, Etiqueta, Rotulo, Sala, TituloSecao } from '@/components/ui';
import { todasAsPecas } from '@/lib/imagens';
import {
  CLIMAS,
  ESPECIALIDADES,
  FAMILIAS_DE_MATERIAL,
  FRENTES,
  GRAVIDADES,
  MODALIDADES,
  MOTIVOS_DE_GLOSA,
  MOTIVOS_DE_OCORRENCIA,
  OBJETOS_DE_EMPREITA,
  SETORES,
  TIPOS_DE_ADITIVO,
  TIPOS_DE_DOCUMENTO,
  TIPOS_DE_OBRA,
  TIPOS_DE_OFICIO,
  UNIDADES,
  type ItemTaxonomia,
} from '@/data/taxonomias';
import { data, plural } from '@/lib/formato';
import { PRODUTO } from '@/lib/tenant';

const LISTAS: ReadonlyArray<{
  nome: string;
  onde: string;
  itens: readonly ItemTaxonomia[];
}> = [
  { nome: 'Tipos de obra', onde: 'Obras', itens: TIPOS_DE_OBRA },
  { nome: 'Frentes de serviço', onde: 'Obras e diário', itens: FRENTES },
  { nome: 'Motivos de glosa', onde: 'Medições', itens: MOTIVOS_DE_GLOSA },
  {
    nome: 'Motivos de ocorrência',
    onde: 'Diário de obra',
    itens: MOTIVOS_DE_OCORRENCIA,
  },
  { nome: 'Gravidades', onde: 'Diário de obra', itens: GRAVIDADES },
  { nome: 'Clima', onde: 'Diário de obra', itens: CLIMAS },
  { nome: 'Especialidades', onde: 'Empreiteiros', itens: ESPECIALIDADES },
  { nome: 'Formas de contratar', onde: 'Empreiteiros', itens: MODALIDADES },
  {
    nome: 'Objetos de empreita',
    onde: 'Propostas',
    itens: OBJETOS_DE_EMPREITA,
  },
  { nome: 'Tipos de aditivo', onde: 'Contratos', itens: TIPOS_DE_ADITIVO },
  { nome: 'Tipos de ofício', onde: 'Fiscalização', itens: TIPOS_DE_OFICIO },
  { nome: 'Tipos de documento', onde: 'Documentos', itens: TIPOS_DE_DOCUMENTO },
  {
    nome: 'Famílias de material',
    onde: 'Compras',
    itens: FAMILIAS_DE_MATERIAL,
  },
  { nome: 'Unidades', onde: 'Medições e compras', itens: UNIDADES },
  { nome: 'Setores', onde: 'Resolutividade', itens: SETORES },
];

export default function Configuracoes() {
  const mundo = useMundo();
  const r = mundo.reguaConcentracao;
  const itensDoCardapio = cardapio(mundo);
  const [editando, setEditando] = useState(false);
  const [a, setA] = useState(String(r.empreitasConsecutivas));
  const [b, setB] = useState(String(r.diasSemIntervalo));
  const [c, setC] = useState(String(r.pctRecusaMinimo));
  const [d, setD] = useState(String(r.outrasEmpresasMinimo));

  const totalItens = LISTAS.reduce((s, l) => s + l.itens.length, 0);
  const pecas = todasAsPecas();

  return (
    <div className="mx-auto max-w-5xl">
      <Sala
        titulo="Configurações"
        linha="O vocabulário é seu. Cada lista abaixo é dado da empresa, com nome livre — o sistema não decide como você nomeia o seu mundo."
        numero={String(totalItens)}
        rotuloNumero="Itens configuráveis"
      />

      {/* ⚖️ A régua do jurídico, em primeiro lugar. */}
      <section className="mb-8">
        <TituloSecao>Régua de concentração de empreitas</TituloSecao>
        <Cartao destaque className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Etiqueta tom="neutro">valores de exemplo</Etiqueta>
            {!editando ? (
              <Botao tom="secundario" onClick={() => setEditando(true)}>
                Editar régua
              </Botao>
            ) : null}
          </div>

          {editando ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <Campo etiqueta="Empreitas seguidas" valor={a} onChange={setA} tipo="number" />
              <Campo etiqueta="Dias sem intervalo" valor={b} onChange={setB} tipo="number" />
              <Campo etiqueta="Recusa mínima (%)" valor={c} onChange={setC} tipo="number" />
              <Campo etiqueta="Outras empresas" valor={d} onChange={setD} tipo="number" />
              <div className="flex gap-2 sm:col-span-4">
                <Botao
                  tom="principal"
                  onClick={() => {
                    definirReguaConcentracao({
                      empreitasConsecutivas: Math.max(1, Number(a) || r.empreitasConsecutivas),
                      diasSemIntervalo: Math.max(1, Number(b) || r.diasSemIntervalo),
                      pctRecusaMinimo: Math.max(0, Number(c) || 0),
                      outrasEmpresasMinimo: Math.max(0, Number(d) || 0),
                    });
                    setEditando(false);
                  }}
                >
                  Gravar régua
                </Botao>
                <Botao tom="discreto" onClick={() => setEditando(false)}>
                  Cancelar
                </Botao>
              </div>
            </div>
          ) : (
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Par
                rotulo="Empreitas seguidas com o mesmo tomador"
                valor={String(r.empreitasConsecutivas)}
              />
              <Par rotulo="Dias corridos sem intervalo" valor={String(r.diasSemIntervalo)} />
              <Par rotulo="Recusa mínima esperada" valor={`${r.pctRecusaMinimo}%`} />
              <Par rotulo="Outras empresas atendidas" valor={String(r.outrasEmpresasMinimo)} />
            </dl>
          )}

          <p className="mt-4 max-w-3xl text-[14px] leading-snug text-concrete">
            <span className="text-chalk">Parâmetros definidos pelo jurídico da empresa.</span> O
            Canteiro não sugere números aqui e não vai sugerir: definir régua de risco jurídico é
            parecer de advogado, e o sistema não pratica ato privativo de profissão que não tem. O
            aviso só acende quando dois ou mais sinais batem juntos, e ele não impede nada — mostra
            o que está acontecendo enquanto ainda dá tempo de mudar.
          </p>
        </Cartao>
      </section>

      {/* ── ⭐⭐ O CARDÁPIO FISCAL ───────────────────────────────────────────
          O lugar onde a mesa vê, preto no branco, que a ALSHAM não escolhe
          código fiscal por ninguém. Quem assina responde; o sistema guarda. */}
      <section id="cardapio" className="mb-8 scroll-mt-24">
        <TituloSecao>O cardápio das saídas</TituloSecao>
        <p className="-mt-3 mb-4 max-w-3xl text-[14px] leading-snug text-concrete">
          Cada botão aqui é uma operação que o pessoal do pátio pode usar no celular.{' '}
          <span className="text-chalk">
            O sistema não sugere código fiscal — quem define e assina é o contador da empresa,
          </span>{' '}
          e o que aparece abaixo é o registro de quem assinou, quando e com base em quê. O código é
          ilustrativo nesta demonstração.
        </p>
        {/* ⚠️ `content-visibility` porque esta seção é longa e nasce fora da
            dobra: sem ela, o navegador pinta seis cartões que ninguém está
            olhando e atrasa o que está na tela. Medido — não palpite. */}
        <div className="grid gap-3 [content-visibility:auto] [contain-intrinsic-size:auto_900px] md:grid-cols-2">
          {itensDoCardapio.map(({ operacao, usavel, nota }) => (
            <Cartao key={operacao.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Etiqueta tom={usavel ? 'olive' : 'neutro'}>
                  {usavel ? 'assinada' : 'sem assinatura'}
                </Etiqueta>
                <span className="num text-[12px] text-concrete-dim">
                  CFOP {operacao.cfop === '' ? '—' : operacao.cfop} (ilustrativo)
                </span>
              </div>
              <h3 className="mt-2 text-[15px] leading-snug text-chalk">{operacao.rotulo}</h3>
              <p className="mt-0.5 text-[13px] leading-snug text-concrete">{operacao.natureza}</p>
              <p className="mt-2 text-[13px] leading-snug text-concrete">
                {operacao.exigeManifesto ? 'Sai com nota e manifesto' : 'Sai só com nota'}
                {operacao.exigeRetorno && operacao.prazoRetornoDias !== null
                  ? ` · cobra volta em ${operacao.prazoRetornoDias} dias`
                  : ''}
                .
              </p>
              {operacao.assinatura ? (
                <p className="mt-2 border-t border-line pt-2 text-[12px] leading-snug text-concrete-dim">
                  Assinada pelo {operacao.assinatura.por} ({operacao.assinatura.papel}) em{' '}
                  {data(operacao.assinatura.em)} · {operacao.assinatura.fonte}
                </p>
              ) : (
                <p className="mt-2 border-t border-line pt-2 text-[12px] leading-snug text-concrete-dim">
                  {nota}. Ela continua na lista de propósito: se sumisse, o encarregado ia procurar,
                  não achar, e gastar a manhã de alguém no telefone.
                </p>
              )}
            </Cartao>
          ))}
        </div>
        <p className="mt-3 max-w-3xl text-[14px] leading-snug text-concrete">
          Para emitir de verdade faltam três coisas que{' '}
          <span className="text-chalk">não são do sistema</span>: a inscrição estadual da empresa, o
          certificado digital dela — que fica com o emissor, nunca aqui — e este cardápio assinado.
        </p>
      </section>

      <section className="mb-8">
        <TituloSecao>O vocabulário da empresa</TituloSecao>
        <div className="grid gap-4 md:grid-cols-2">
          {LISTAS.map((l) => (
            <Cartao key={l.nome} className="p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="placa text-[12px] text-chalk">{l.nome}</h3>
                <span className="text-[11px] text-concrete-dim">{l.onde}</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {l.itens.map((i) => (
                  <Etiqueta key={i.id} tom="neutro">
                    {i.nome}
                  </Etiqueta>
                ))}
              </div>
            </Cartao>
          ))}
        </div>
        <p className="mt-3 max-w-3xl text-[14px] leading-snug text-concrete">
          Nesta demonstração as listas são fixas. No sistema elas são{' '}
          <span className="text-chalk">tabelas da sua empresa</span>: você acrescenta, renomeia e
          reordena, e nada disso exige alteração de programa. É por isso que o mesmo produto atende
          uma construtora de edificação e uma de pavimentação sem virar dois produtos.
        </p>
      </section>

      <section>
        <TituloSecao>Procedência das imagens</TituloSecao>
        <Cartao className="p-4">
          {/* ⭐ A marca do produto é peça do lote como qualquer outra, e aparece
              aqui — no lugar onde se declara de onde veio cada imagem. */}
          <div className="mb-3 flex items-center gap-3">
            <Image
              src="/img/marca-canteiro.webp"
              alt="Marca do Canteiro OS: prumo e esquadro sobre fundo escuro"
              width={56}
              height={56}
              unoptimized
              className="shrink-0 border border-line"
            />
            <div>
              <p className="placa text-[12px] text-gold">{PRODUTO.nome}</p>
              <p className="text-[12px] text-concrete-dim">{PRODUTO.selo}</p>
            </div>
          </div>
          <p className="text-[14px] leading-snug text-concrete">
            As{' '}
            {plural(
              pecas.length,
              'imagem desta vitrine foi gerada',
              'imagens desta vitrine foram geradas',
            )}{' '}
            por inteligência artificial, uma única vez, e ficam guardadas como arquivo. O site não
            chama nenhum serviço de imagem enquanto você navega.{' '}
            <span className="text-chalk">
              Nenhuma delas retrata obra, pessoa ou lugar reais — todas são ilustrativas.
            </span>
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {pecas.slice(0, 6).map((p) => (
              <div key={p.arquivo} className="border border-line bg-sunken px-3 py-2">
                <p className="num text-[12px] text-chalk">{p.arquivo}</p>
                <p className="text-[11px] leading-snug text-concrete-dim">
                  {p.largura}×{p.altura} · {(p.bytes / 1024).toFixed(0)} kB · gerada em {p.geradoEm}
                </p>
              </div>
            ))}
          </div>
          <Rotulo>
            <span className="mt-3 block">
              A lista completa, com o texto que gerou cada peça, está em public/img/MANIFESTO.json
            </span>
          </Rotulo>
        </Cartao>
      </section>
    </div>
  );
}

function Par({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="placa text-[10px] leading-tight text-concrete-dim">{rotulo}</dt>
      <dd className="num mt-1 text-[24px] text-chalk">{valor}</dd>
    </div>
  );
}
