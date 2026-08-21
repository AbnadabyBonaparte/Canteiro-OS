'use client';

/**
 * TELA 2 — DIÁRIO DE OBRA · vinte segundos, no celular, de bota e no sol.
 *
 * ⭐ O LIVRO IMUTÁVEL: não existe excluir. Existe **cancelar com motivo**, e o
 * registro cancelado continua à vista, riscado, com quem cancelou e por quê.
 * É a física do `occ` do Business OS — fato consumado não se apaga.
 *
 * A tela é desenhada para 390px primeiro: alvos de 52px, corpo de 16px,
 * contador em vez de teclado. O notebook ganha duas colunas de graça.
 */

import { useMemo, useState } from 'react';
import {
  cancelarEntradaDoDiario,
  registrarNoDiario,
  useMundo,
  type RascunhoDiario,
} from '@/lib/store';
import {
  Botao,
  Cartao,
  Campo,
  Confirmar,
  Contador,
  Escolha,
  Etiqueta,
  Selecione,
  TituloSecao,
  Vazio,
} from '@/components/ui';
import { Camera, Microfone } from '@/components/icones';
import { CLIMAS, FRENTES, GRAVIDADES, MOTIVOS_DE_OCORRENCIA, nomeDe } from '@/data/taxonomias';
import { data, dataCurta } from '@/lib/formato';
import { DATA_REF, diasAtras } from '@/data/seed';

/** O ditado é honesto: escreve o que foi dito, e diz que não transcreve sozinho. */
const TEXTO_DITADO =
  'Concretagem da laje do bloco B concluída às 15h. Fiscal acompanhou a última betonada.';

export default function Diario() {
  const mundo = useMundo();

  const [obraId, setObraId] = useState(mundo.obras[0].id);
  const [frenteId, setFrenteId] = useState(mundo.obras[0].frentes[0]);
  const [climaId, setClimaId] = useState('sol');
  const [efetivo, setEfetivo] = useState(12);
  const [motivos, setMotivos] = useState<string[]>([]);
  const [observacao, setObservacao] = useState('');
  const [temFoto, setTemFoto] = useState(false);
  const [ditando, setDitando] = useState(false);
  const [salvo, setSalvo] = useState<string | null>(null);
  const [aCancelar, setACancelar] = useState<string | null>(null);

  const obra = mundo.obras.find((o) => o.id === obraId)!;
  const hora = '16:40';

  const frentesDaObra = useMemo(
    () => FRENTES.filter((f) => obra.frentes.includes(f.id)),
    [obra],
  );

  const gravidadeId = motivos.includes('acidente')
    ? 'paralisa'
    : motivos.includes('quase-acidente') || motivos.includes('falta-material')
      ? 'atencao'
      : 'rotina';

  function alternar(id: string) {
    setMotivos((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  }

  function limpar() {
    setMotivos([]);
    setObservacao('');
    setTemFoto(false);
    setDitando(false);
  }

  function registrar() {
    const rascunho: RascunhoDiario = {
      obraId,
      frenteId,
      climaId,
      efetivo,
      motivos: motivos.length > 0 ? motivos : ['outro'],
      gravidadeId,
      observacao: observacao.trim() || 'Sem observação.',
      temFoto,
      autor: obra.encarregado,
      hora,
    };
    const id = registrarNoDiario(rascunho);
    setSalvo(id);
    limpar();
  }

  const doDia = mundo.diario.filter((e) => e.data === diasAtras(0));
  const historico = mundo.diario.filter((e) => e.data !== diasAtras(0)).slice(0, 12);

  return (
    <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-8">
      {/* ── O formulário de 20 segundos ─────────────────────────────────── */}
      <section>
        <TituloSecao>Registrar o dia</TituloSecao>
        <Cartao className="space-y-5 p-4 sm:p-5">
          <Selecione
            etiqueta="Obra"
            valor={obraId}
            onChange={(v) => {
              setObraId(v);
              const nova = mundo.obras.find((o) => o.id === v)!;
              setFrenteId(nova.frentes[0]);
            }}
            opcoes={mundo.obras.map((o) => ({ id: o.id, nome: o.nome }))}
          />

          <div>
            <div className="placa mb-1.5 text-[11px] text-concrete">O que houve hoje</div>
            <div className="grid grid-cols-2 gap-2">
              {MOTIVOS_DE_OCORRENCIA.map((m) => (
                <Escolha key={m.id} marcada={motivos.includes(m.id)} onClick={() => alternar(m.id)}>
                  {m.nome}
                </Escolha>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Selecione etiqueta="Frente" valor={frenteId} onChange={setFrenteId} opcoes={frentesDaObra} />
            <Selecione etiqueta="Clima" valor={climaId} onChange={setClimaId} opcoes={CLIMAS} />
          </div>

          <Contador etiqueta="Efetivo em campo" valor={efetivo} onChange={setEfetivo} />

          <div>
            <Campo
              etiqueta="Observação"
              valor={observacao}
              onChange={setObservacao}
              multilinha
              placeholder="O que o próximo a ler precisa saber."
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Botao
                tom="secundario"
                larga
                onClick={() => {
                  setDitando(true);
                  setObservacao((o) => (o ? `${o} ${TEXTO_DITADO}` : TEXTO_DITADO));
                }}
              >
                <Microfone className="h-4 w-4" />
                Ditar
              </Botao>
              <Botao tom={temFoto ? 'principal' : 'secundario'} larga onClick={() => setTemFoto((f) => !f)}>
                <Camera className="h-4 w-4" />
                {temFoto ? 'Foto anexada' : 'Anexar foto'}
              </Botao>
            </div>
            {ditando ? (
              <p className="mt-2 text-[12px] leading-snug text-concrete-dim">
                Nesta demonstração o ditado escreve um texto de exemplo. No sistema, o que você
                fala vira texto no aparelho — e o áudio original fica anexado.
              </p>
            ) : null}
          </div>

          {/* O carimbo do servidor: hora, autor e obra não se digitam. */}
          <div className="border border-line bg-sunken px-3 py-2.5">
            <div className="placa text-[10px] text-concrete-dim">Carimbo automático</div>
            <p className="num mt-1 text-[13px] leading-snug text-concrete">
              {data(DATA_REF)} · {hora} · {obra.encarregado} · {obra.nome} ·{' '}
              {nomeDe(CLIMAS, climaId).toLowerCase()}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Botao tom="principal" larga onClick={registrar}>
              Registrar no diário
            </Botao>
            <Botao tom="discreto" larga onClick={limpar}>
              Cancelar
            </Botao>
          </div>

          {salvo ? (
            <p className="border border-olive/50 bg-olive/10 px-3 py-2.5 text-[13px] text-olive-bright">
              Registrado. O dia entra no livro e não se edita mais — para corrigir, cancele com
              motivo e lance de novo.
            </p>
          ) : null}
        </Cartao>
      </section>

      {/* ── O livro ─────────────────────────────────────────────────────── */}
      <section className="mt-8 lg:mt-0">
        <TituloSecao>Hoje</TituloSecao>
        {doDia.length === 0 ? (
          <Vazio
            titulo="Nenhum registro hoje."
            dica="O primeiro registro do dia aparece aqui assim que você lançar."
          />
        ) : (
          <div className="space-y-2">
            {doDia.map((e) => (
              <Linha key={e.id} entrada={e} mundo={mundo} aoCancelar={() => setACancelar(e.id)} />
            ))}
          </div>
        )}

        <div className="mt-8">
          <TituloSecao>Dias anteriores</TituloSecao>
          <div className="space-y-2">
            {historico.map((e) => (
              <Linha key={e.id} entrada={e} mundo={mundo} aoCancelar={() => setACancelar(e.id)} />
            ))}
          </div>
        </div>
      </section>

      <Confirmar
        aberto={aCancelar !== null}
        titulo="Cancelar este registro"
        descricao="O registro não é apagado. Ele fica no livro, riscado, com o seu nome e o motivo — é isso que dá valor ao diário na hora da medição e da fiscalização."
        rotuloMotivo="Motivo do cancelamento"
        rotuloAcao="Cancelar com motivo"
        aoConfirmar={(motivo) => {
          if (aCancelar) cancelarEntradaDoDiario(aCancelar, motivo, obra.encarregado);
        }}
        aoFechar={() => setACancelar(null)}
      />
    </div>
  );
}

function Linha({
  entrada,
  mundo,
  aoCancelar,
}: {
  entrada: ReturnType<typeof useMundo>['diario'][number];
  mundo: ReturnType<typeof useMundo>;
  aoCancelar: () => void;
}) {
  const obra = mundo.obras.find((o) => o.id === entrada.obraId)!;
  const gravidade = GRAVIDADES.find((g) => g.id === entrada.gravidadeId);
  const cancelada = entrada.cancelada !== null;

  return (
    <Cartao className={`p-4 ${cancelada ? 'opacity-70' : ''}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <span className="num text-[13px] text-concrete">
            {dataCurta(entrada.data)} · {entrada.hora}
          </span>
          <span className="text-[14px] text-chalk">{obra.nome}</span>
        </div>
        <div className="flex items-center gap-2">
          {cancelada ? (
            <Etiqueta tom="rust">Cancelado</Etiqueta>
          ) : gravidade ? (
            <Etiqueta tom={gravidade.tom}>{gravidade.nome}</Etiqueta>
          ) : null}
          {entrada.temFoto ? <Camera className="h-4 w-4 text-concrete-dim" /> : null}
        </div>
      </div>

      <p className={`mt-2 text-[15px] leading-snug ${cancelada ? 'text-concrete line-through' : 'text-chalk'}`}>
        {entrada.observacao}
      </p>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-concrete-dim">
        <span>{nomeDe(FRENTES, entrada.frenteId)}</span>
        <span>Efetivo {entrada.efetivo}</span>
        <span>{nomeDe(CLIMAS, entrada.climaId)}</span>
        <span>{entrada.autor}</span>
        <span>{entrada.motivos.map((m) => nomeDe(MOTIVOS_DE_OCORRENCIA, m)).join(' · ')}</span>
      </div>

      {cancelada ? (
        <p className="mt-3 border-l-2 border-rust/60 bg-rust/8 px-3 py-2 text-[12px] leading-snug text-concrete">
          Cancelado por {entrada.cancelada!.por} em {data(entrada.cancelada!.em)} —{' '}
          <span className="text-chalk">{entrada.cancelada!.motivo}</span>
        </p>
      ) : (
        <div className="mt-3 flex justify-end">
          <Botao tom="discreto" onClick={aoCancelar}>
            Cancelar com motivo
          </Botao>
        </div>
      )}
    </Cartao>
  );
}
