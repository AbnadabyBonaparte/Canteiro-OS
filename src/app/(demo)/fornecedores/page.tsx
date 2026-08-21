'use client';

/**
 * FORNECEDORES — quem entrega material, e como se comporta.
 *
 * ⭐ A nota não é opinião: sai do que o sistema mediu — prazo médio, divergência
 * de recebimento e quantas compras já passaram por ele.
 */

import { useMundo } from '@/lib/store';
import { Cartao, Etiqueta, Linha, Sala, TituloSecao } from '@/components/ui';
import { FAMILIAS_DE_MATERIAL, nomeDe } from '@/data/taxonomias';
import { dias, dinheiro, plural } from '@/lib/formato';

export default function Fornecedores() {
  const mundo = useMundo();
  const ativos = mundo.fornecedores.filter((f) => f.estado === 'ativo');

  return (
    <div className="mx-auto max-w-5xl">
      <Sala
        titulo="Fornecedores"
        linha="Quem fornece o quê, de onde, em quanto tempo — e o que já divergiu no recebimento."
        numero={String(ativos.length)}
        rotuloNumero="Ativos"
        tomNumero="chalk"
      />

      <section>
        <TituloSecao>Carteira</TituloSecao>
        <Cartao>
          {mundo.fornecedores.map((f) => {
            const minhas = mundo.compras.filter((c) => c.fornecedorEscolhido === f.id);
            const comprado = minhas.reduce((s, c) => s + c.valorCents, 0);
            const divergentes = minhas.filter((c) => c.divergencia !== 0).length;
            return (
              <Linha
                key={f.id}
                titulo={f.nome}
                subtitulo={`${nomeDe(FAMILIAS_DE_MATERIAL, f.familiaId)} · ${f.cidade}`}
                valor={comprado > 0 ? dinheiro(comprado) : '—'}
                etiquetas={
                  <>
                    <Etiqueta tom={f.estado === 'ativo' ? 'olive' : 'neutro'}>
                      {f.estado === 'ativo' ? 'ativo' : 'arquivado'}
                    </Etiqueta>
                    <Etiqueta
                      tom={
                        f.prazoMedioDias <= 5 ? 'olive' : f.prazoMedioDias <= 10 ? 'gold' : 'rust'
                      }
                    >
                      entrega em {dias(f.prazoMedioDias)}
                    </Etiqueta>
                    <Etiqueta
                      tom={f.avaliacao >= 80 ? 'olive' : f.avaliacao >= 65 ? 'gold' : 'rust'}
                    >
                      nota {f.avaliacao}
                    </Etiqueta>
                    <Etiqueta tom="neutro">{plural(minhas.length, 'compra', 'compras')}</Etiqueta>
                    {divergentes > 0 ? (
                      <Etiqueta tom="rust">
                        {plural(divergentes, 'recebimento divergente', 'recebimentos divergentes')}
                      </Etiqueta>
                    ) : null}
                  </>
                }
              />
            );
          })}
        </Cartao>
        <p className="mt-3 max-w-3xl text-[13px] leading-snug text-concrete">
          O fornecedor que se arquiva <span className="text-chalk">não some</span>: ele sai da lista
          de cotação e o histórico de compra continua inteiro. Quem volta a fornecer é o mesmo
          fornecedor, com a mesma ficha — obrigar a nascer de novo partiria a história em duas.
        </p>
      </section>
    </div>
  );
}
