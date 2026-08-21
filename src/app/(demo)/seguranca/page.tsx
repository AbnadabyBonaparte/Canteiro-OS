'use client';

/**
 * SEGURANÇA DO TRABALHO — o maço que o auditor pede, por pessoa e por dia.
 *
 * ⛔ O Canteiro NÃO elabora PGR, não emite ASO e não substitui técnico nem
 * engenheiro de segurança. Ele guarda, indexa, cobra vencimento e prova entrega
 * — que é exatamente o que costuma faltar na hora da fiscalização.
 */

import { useMundo } from '@/lib/store';
import { Cartao, Etiqueta, Linha, Sala, TituloSecao, Vazio } from '@/components/ui';
import { CartaoIntegracao } from '@/components/cartao-integracao';
import { Foto } from '@/components/imagem';
import { GRAVIDADES, MOTIVOS_DE_OCORRENCIA, TIPOS_DE_DOCUMENTO, nomeDe } from '@/data/taxonomias';
import { data, dias, plural, vencimento } from '@/lib/formato';
import { diasAte, diasDesde } from '@/data/seed';

/** Os documentos que o auditor pede da PESSOA, não da empresa. */
const DA_PESSOA = new Set(['aso', 'nr18', 'nr35', 'nr10']);

export default function Seguranca() {
  const mundo = useMundo();

  const docs = mundo.documentos
    .filter((d) => DA_PESSOA.has(d.tipoId))
    .map((d) => ({ d, restam: diasAte(d.vence) }))
    .sort((a, b) => a.restam - b.restam);

  const vencidos = docs.filter((x) => x.restam < 0);
  const quaseAcidentes = mundo.diario.filter(
    (e) =>
      e.cancelada === null &&
      (e.motivos.includes('quase-acidente') || e.motivos.includes('acidente')),
  );
  const semAssinatura = mundo.episEntregues.filter((e) => !e.assinado);

  return (
    <div className="mx-auto max-w-5xl">
      <Sala
        titulo="Segurança do trabalho"
        linha="ASO e treinamento de NR por pessoa, quase-acidentes registrados no diário e a ficha de EPI. O que o auditor pede é sempre pessoa × dia × obra."
        numero={String(vencidos.length)}
        rotuloNumero="Documentos vencidos"
        tomNumero={vencidos.length > 0 ? 'rust' : 'olive'}
      />

      <div className="mb-6">
        <Foto nome="cena-fiscal" altura="faixa" legenda="ilustrativa" />
      </div>

      <section className="mb-8">
        <TituloSecao>ASO e treinamentos de NR</TituloSecao>
        {docs.length === 0 ? (
          <Vazio
            titulo="Nenhum documento de pessoa cadastrado."
            dica="ASO, NR-18, NR-35 e NR-10 aparecem aqui, com validade."
          />
        ) : (
          <Cartao>
            {docs.slice(0, 20).map(({ d, restam }) => (
              <Linha
                key={d.id}
                titulo={`${nomeDe(TIPOS_DE_DOCUMENTO, d.tipoId)} — ${d.titularNome}`}
                subtitulo={`vence em ${data(d.vence)}`}
                valor={vencimento(restam)}
                valorTom={restam < 0 ? 'rust' : restam <= 30 ? 'gold' : undefined}
                etiquetas={
                  <Etiqueta tom="neutro">
                    {d.titularKind === 'empreiteiro' ? 'parceiro de empreita' : 'equipe própria'}
                  </Etiqueta>
                }
              />
            ))}
          </Cartao>
        )}
        {vencidos.length > 0 ? (
          <p className="mt-2 text-[13px] text-rust-bright">
            {plural(vencidos.length, 'documento vencido', 'documentos vencidos')} — cada um é uma
            pessoa que não pode estar em campo hoje.
          </p>
        ) : null}
      </section>

      <section className="mb-8">
        <TituloSecao>Quase-acidentes e acidentes no diário</TituloSecao>
        {quaseAcidentes.length === 0 ? (
          <Vazio
            titulo="Nenhum registro no período."
            dica="O que o encarregado marca no diário como quase-acidente aparece aqui, sem intermediário."
          />
        ) : (
          <Cartao>
            {quaseAcidentes.map((e) => {
              const obra = mundo.obras.find((o) => o.id === e.obraId)!;
              const g = GRAVIDADES.find((x) => x.id === e.gravidadeId);
              return (
                <Linha
                  key={e.id}
                  titulo={e.observacao}
                  subtitulo={`${obra.nome} · ${data(e.data)} às ${e.hora} · ${e.autor} · há ${dias(diasDesde(e.data))}`}
                  etiquetas={
                    <>
                      {g ? <Etiqueta tom={g.tom}>{g.nome}</Etiqueta> : null}
                      {e.motivos.map((m) => (
                        <Etiqueta key={m} tom="neutro">
                          {nomeDe(MOTIVOS_DE_OCORRENCIA, m)}
                        </Etiqueta>
                      ))}
                    </>
                  }
                />
              );
            })}
          </Cartao>
        )}
      </section>

      <section className="mb-8">
        <TituloSecao>Ficha de EPI sem assinatura</TituloSecao>
        {semAssinatura.length === 0 ? (
          <Vazio
            titulo="Todas as entregas estão assinadas."
            dica="É assim que se chega numa fiscalização sem susto."
          />
        ) : (
          <Cartao>
            {semAssinatura.slice(0, 12).map((e) => (
              <Linha
                key={e.id}
                titulo={`${e.item} — ${e.pessoaNome}`}
                subtitulo={`entregue em ${data(e.em)}`}
                etiquetas={<Etiqueta tom="rust">falta assinatura</Etiqueta>}
              />
            ))}
          </Cartao>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <CartaoIntegracao
          titulo="PGR, PCMSO e ASO"
          descricao="Elaborar o programa e emitir o atestado é ato de profissional habilitado — engenheiro ou técnico de segurança e médico do trabalho. O Canteiro guarda que existe e até quando vale."
        />
        <CartaoIntegracao
          titulo="Auto de infração do auditor fiscal do trabalho"
          descricao="Vem do órgão. Aqui fica o maço que se apresenta a ele: pessoa, dia, obra, treinamento e EPI."
        />
      </div>
    </div>
  );
}
