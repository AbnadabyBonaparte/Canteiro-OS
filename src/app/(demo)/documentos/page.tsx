'use client';

/**
 * DOCUMENTOS E CERTIDÕES — tudo que tem validade e trava alguma coisa.
 *
 * ⭐ A coluna que importa não é o documento: é o VENCIMENTO. Uma certidão
 * vencida segura a liberação de várias medições ao mesmo tempo, e é isso que a
 * tela mostra em primeiro lugar.
 *
 * ⛔ O Canteiro guarda tipo, titular e validade. Ele não emite documento, não
 * valida assinatura e não guarda resultado de exame.
 */

import { useMemo, useState } from 'react';
import { useMundo } from '@/lib/store';
import { medicoesPresas } from '@/lib/analista';
import { Cartao, Etiqueta, Linha, Sala, Selecione, TituloSecao, Vazio } from '@/components/ui';
import { CartaoIntegracao } from '@/components/cartao-integracao';
import { Lupa } from '@/components/icones';
import { TIPOS_DE_DOCUMENTO, nomeDe } from '@/data/taxonomias';
import { data, plural, vencimento } from '@/lib/formato';
import { diasAte } from '@/data/seed';

/** Os tipos que a prefeitura costuma exigir para liberar pagamento. */
const TRAVA_MEDICAO = new Set(['cnd', 'fgts', 'trabalhista', 'art', 'cno']);

const FILTROS = [
  { id: 'todos', nome: 'Todos' },
  { id: 'vencendo', nome: 'Vencendo ou vencidos' },
  { id: 'trava', nome: 'Travam medição' },
  { id: 'empresa', nome: 'Da empresa' },
  { id: 'obra', nome: 'Das obras' },
  { id: 'empreiteiro', nome: 'Dos empreiteiros' },
];

export default function Documentos() {
  const mundo = useMundo();
  const [filtro, setFiltro] = useState('vencendo');
  const [busca, setBusca] = useState('');

  const presas = medicoesPresas(mundo).length;

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return mundo.documentos
      .map((d) => ({ d, restam: diasAte(d.vence), trava: TRAVA_MEDICAO.has(d.tipoId) }))
      .filter(({ d, restam, trava }) => {
        if (filtro === 'vencendo' && restam > 30) return false;
        if (filtro === 'trava' && !trava) return false;
        if (filtro === 'empresa' && d.titularKind !== 'empresa') return false;
        if (filtro === 'obra' && d.titularKind !== 'obra') return false;
        if (filtro === 'empreiteiro' && d.titularKind !== 'empreiteiro') return false;
        if (q.length > 0) {
          const alvo = `${nomeDe(TIPOS_DE_DOCUMENTO, d.tipoId)} ${d.titularNome}`.toLowerCase();
          if (!alvo.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.restam - b.restam)
      .slice(0, 80);
  }, [mundo.documentos, filtro, busca]);

  const vencidos = mundo.documentos.filter((d) => diasAte(d.vence) < 0).length;
  const naSemana = mundo.documentos.filter((d) => {
    const r = diasAte(d.vence);
    return r >= 0 && r <= 7;
  }).length;

  return (
    <div className="mx-auto max-w-5xl">
      <Sala
        titulo="Documentos e certidões"
        linha="Certidão, ART, CNO, alvará, ASO, treinamento e apólice — tudo que tem validade e trava pagamento, habilitação ou fiscalização."
        numero={String(vencidos + naSemana)}
        rotuloNumero="Vencidos ou vencendo"
        tomNumero={vencidos > 0 ? 'rust' : 'gold'}
      />

      {vencidos > 0 || naSemana > 0 ? (
        <Cartao destaque className="mb-6 p-4">
          <p className="text-[15px] leading-snug text-chalk">
            {vencidos > 0 ? (
              <>
                <span className="text-rust-bright">
                  {plural(vencidos, 'documento vencido', 'documentos vencidos')}
                </span>
                {naSemana > 0 ? ' e ' : '. '}
              </>
            ) : null}
            {naSemana > 0 ? (
              <>
                <span className="text-gold-bright">
                  {plural(naSemana, 'vence', 'vencem')} nesta semana
                </span>
                .{' '}
              </>
            ) : null}
            {presas > 0 ? (
              <span className="text-concrete">
                Há {plural(presas, 'medição aceita', 'medições aceitas')} e não{' '}
                {presas === 1 ? 'paga' : 'pagas'} — certidão vencida costuma travar a liberação.
              </span>
            ) : null}
          </p>
        </Cartao>
      ) : null}

      <div className="mb-4 grid gap-3 sm:grid-cols-[220px_1fr]">
        <Selecione etiqueta="Mostrar" valor={filtro} onChange={setFiltro} opcoes={FILTROS} />
        <div className="flex items-end">
          <div className="flex w-full items-center gap-2 border border-line bg-sunken px-3">
            <Lupa className="h-4 w-4 shrink-0 text-concrete-dim" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Tipo de documento ou titular"
              aria-label="Buscar documento"
              className="w-full bg-transparent py-2.5 text-[16px] text-chalk outline-none placeholder:text-concrete-dim"
            />
          </div>
        </div>
      </div>

      <section>
        <TituloSecao>
          {lista.length === 80 ? 'Primeiros 80' : plural(lista.length, 'documento', 'documentos')}
        </TituloSecao>
        {lista.length === 0 ? (
          <Vazio
            titulo="Nenhum documento neste recorte."
            dica="Troque o filtro ou limpe a busca para ver o restante."
          />
        ) : (
          <Cartao>
            {lista.map(({ d, restam, trava }) => (
              <Linha
                key={d.id}
                titulo={nomeDe(TIPOS_DE_DOCUMENTO, d.tipoId)}
                subtitulo={`${d.titularNome} · vence em ${data(d.vence)}`}
                valor={vencimento(restam)}
                valorTom={restam < 0 ? 'rust' : restam <= 7 ? 'gold' : undefined}
                etiquetas={
                  <>
                    <Etiqueta tom="neutro">
                      {d.titularKind === 'empresa'
                        ? 'da empresa'
                        : d.titularKind === 'obra'
                          ? 'da obra'
                          : d.titularKind === 'equipe'
                            ? 'da equipe própria'
                            : 'do empreiteiro'}
                    </Etiqueta>
                    {trava ? (
                      <Etiqueta tom={restam <= 7 ? 'rust' : 'gold'}>trava medição</Etiqueta>
                    ) : null}
                  </>
                }
              />
            ))}
          </Cartao>
        )}
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <CartaoIntegracao
          titulo="Emissão de certidão"
          descricao="CND, FGTS e certidão trabalhista são emitidas pelos órgãos. O Canteiro guarda o tipo, o titular e a validade, e avisa antes de vencer — emitir continua sendo lá."
        />
        <CartaoIntegracao
          titulo="Assinatura digital e cofre de arquivo"
          descricao="Guardar e assinar o arquivo com validade jurídica integra com o seu certificado digital. Aqui fica o metadado: o que é, de quem é, até quando vale."
        />
      </div>
    </div>
  );
}
