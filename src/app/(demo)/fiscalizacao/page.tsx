'use client';

/**
 * FISCALIZAÇÃO — a relação formal com o órgão. Ofício entra, resposta sai,
 * prazo corre. ⭐ O prazo é o dado: um ofício sem data de resposta vira multa.
 */

import { useState } from 'react';
import { responderOficio, useMundo } from '@/lib/store';
import {
  Botao,
  Cartao,
  Confirmar,
  Etiqueta,
  Linha,
  Sala,
  TituloSecao,
  Vazio,
} from '@/components/ui';
import { CartaoIntegracao } from '@/components/cartao-integracao';
import { TIPOS_DE_OFICIO, nomeDe } from '@/data/taxonomias';
import { data, dias, vencimento } from '@/lib/formato';
import { diasAte, diasDesde } from '@/data/seed';

const ESTADO = {
  recebido: { rotulo: 'Aguardando resposta', tom: 'gold' },
  respondido: { rotulo: 'Respondido', tom: 'olive' },
  vencido: { rotulo: 'Prazo vencido', tom: 'rust' },
  arquivado: { rotulo: 'Arquivado', tom: 'neutro' },
} as const;

export default function Fiscalizacao() {
  const mundo = useMundo();
  const [aResponder, setAResponder] = useState<string | null>(null);

  const abertos = mundo.oficios.filter((o) => o.estado === 'recebido' || o.estado === 'vencido');
  const vencidos = abertos.filter((o) => o.estado === 'vencido').length;

  return (
    <div className="mx-auto max-w-5xl">
      <Sala
        titulo="Fiscalização"
        linha="Ofícios recebidos e enviados, visitas do fiscal e exigências com prazo. Cada linha carrega a data — é ela que conta na hora de responder."
        numero={String(abertos.length)}
        rotuloNumero="Aguardando resposta"
        tomNumero={vencidos > 0 ? 'rust' : 'gold'}
      />

      <section className="mb-8">
        <TituloSecao>Ofícios e exigências</TituloSecao>
        <Cartao>
          {mundo.oficios.length === 0 ? (
            <div className="p-5">
              <Vazio
                titulo="Nenhum ofício registrado."
                dica="O que chega do órgão entra aqui, com prazo e responsável."
              />
            </div>
          ) : (
            mundo.oficios.map((o) => {
              const obra = mundo.obras.find((x) => x.id === o.obraId)!;
              const restam = o.prazoResposta ? diasAte(o.prazoResposta) : null;
              return (
                <Linha
                  key={o.id}
                  titulo={
                    <>
                      <span className="num text-concrete">{o.numero}</span> · {o.assunto}
                    </>
                  }
                  subtitulo={`${obra.nome} · ${data(o.em)} · responsável: ${o.responsavel}`}
                  etiquetas={
                    <>
                      <Etiqueta tom={ESTADO[o.estado].tom}>{ESTADO[o.estado].rotulo}</Etiqueta>
                      <Etiqueta tom="neutro">
                        {o.direcao === 'recebido' ? 'recebido do órgão' : 'enviado pela empresa'}
                      </Etiqueta>
                      <Etiqueta tom="neutro">{nomeDe(TIPOS_DE_OFICIO, o.tipoId)}</Etiqueta>
                      {restam !== null && o.respondidoEm === null ? (
                        <Etiqueta tom={restam < 0 ? 'rust' : restam <= 3 ? 'gold' : 'neutro'}>
                          prazo {vencimento(restam)}
                        </Etiqueta>
                      ) : null}
                      {o.respondidoEm ? (
                        <Etiqueta tom="olive">respondido em {data(o.respondidoEm)}</Etiqueta>
                      ) : null}
                    </>
                  }
                  acao={
                    o.respondidoEm === null ? (
                      <Botao tom="secundario" onClick={() => setAResponder(o.id)}>
                        Registrar resposta
                      </Botao>
                    ) : null
                  }
                />
              );
            })
          )}
        </Cartao>
      </section>

      <section className="mb-8">
        <TituloSecao>Visitas do fiscal</TituloSecao>
        <Cartao>
          {mundo.visitas.map((v) => {
            const obra = mundo.obras.find((x) => x.id === v.obraId)!;
            return (
              <Linha
                key={v.id}
                titulo={v.constatacao}
                subtitulo={`${obra.nome} · ${data(v.em)} · ${v.fiscal} · há ${dias(diasDesde(v.em))}`}
                etiquetas={
                  v.exigencias > 0 ? (
                    <Etiqueta tom="gold">
                      {v.exigencias === 1 ? '1 exigência' : `${v.exigencias} exigências`}
                    </Etiqueta>
                  ) : (
                    <Etiqueta tom="olive">sem exigência</Etiqueta>
                  )
                }
              />
            );
          })}
        </Cartao>
      </section>

      <CartaoIntegracao
        titulo="Auto de infração"
        descricao="Emitir auto com força de lei é ato do órgão público. O Canteiro registra a vistoria, a exigência e a resposta — a penalidade vem de fora e é anexada aqui."
      />

      <Confirmar
        aberto={aResponder !== null}
        titulo="Registrar resposta ao ofício"
        descricao="O registro guarda a data de hoje e quem respondeu. É essa data que prova que o prazo foi cumprido — e ela é carimbada pelo sistema, não digitada."
        rotuloAcao="Registrar resposta"
        aoConfirmar={() => {
          if (aResponder) responderOficio(aResponder, 'Escritório técnico');
        }}
        aoFechar={() => setAResponder(null)}
      />
    </div>
  );
}
