'use client';

/**
 * EMPREITEIROS — parceiros de empreita por valor global.
 *
 * ⚖️ FRENTE 1 DO BASTÃO v2. Por orientação do jurídico da empresa, o produto
 * mudou de vocabulário — o registro da troca está em `docs/MIGRACAO.md` §0.
 * Empreitada é contrato de RESULTADO (Código Civil, arts. 610–626):
 * entrega-se um objeto por um valor global, com autonomia de meios.
 * Não se paga tempo; paga-se entrega.
 *
 * ⭐ A recusa é o dado mais valioso desta tela, e aparece com o mesmo destaque
 * do aceite. Um cadastro que só guarda o "sim" não prova nada.
 *
 * ⛔ A palavra "blindagem" não existe aqui, e não vai existir: o sistema produz
 * PROVA e impõe DISCIPLINA. Ver o texto do dossiê, no fim da tela.
 */

import { useMemo, useState } from 'react';
import {
  abrirProposta,
  cadastrarEmpreiteiro,
  definirReguaConcentracao,
  responderProposta,
  useMundo,
} from '@/lib/store';
import { concentracoes } from '@/lib/analista';
import {
  Botao,
  Campo,
  Cartao,
  Etiqueta,
  Rotulo,
  Selecione,
  TituloSecao,
  Vazio,
} from '@/components/ui';
import { Ficha, Lupa, Prumo } from '@/components/icones';
import { CartaoIntegracao } from '@/components/cartao-integracao';
import {
  ESPECIALIDADES,
  MODALIDADES,
  OBJETOS_DE_EMPREITA,
  TIPOS_DE_DOCUMENTO,
  nomeDe,
} from '@/data/taxonomias';
import { data, dias, dinheiro, plural, vencimento } from '@/lib/formato';
import { diasAFrente, diasAte } from '@/data/seed';

const ESTADO_EMPREITA = {
  contratada: { rotulo: 'Contratada', tom: 'neutro' },
  'em-execucao': { rotulo: 'Em execução', tom: 'gold' },
  entregue: { rotulo: 'Entregue — aceite dado', tom: 'olive' },
  quitada: { rotulo: 'Quitada', tom: 'olive' },
  cancelada: { rotulo: 'Cancelada', tom: 'rust' },
} as const;

export default function Empreiteiros() {
  const mundo = useMundo();
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState('p01');

  const concs = concentracoes(mundo);
  const alerta = concs.find((c) => c.acimaDaRegua) ?? null;
  const proposta = mundo.propostas.find((p) => p.id === 'p-aberta') ?? mundo.propostas[0];

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return mundo.empreiteiros
      .filter(
        (e) =>
          q.length === 0 ||
          e.nome.toLowerCase().includes(q) ||
          nomeDe(ESPECIALIDADES, e.especialidadeId).toLowerCase().includes(q),
      )
      .slice(0, 40);
  }, [mundo.empreiteiros, busca]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AlertaDeConcentracao alerta={alerta} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Lista
          lista={lista}
          busca={busca}
          setBusca={setBusca}
          selecionado={selecionado}
          setSelecionado={setSelecionado}
          concs={concs}
        />
        <div className="space-y-6">
          <PropostaAberta proposta={proposta} />
          <Dossie empreiteiroId={selecionado} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function AlertaDeConcentracao({
  alerta,
}: {
  alerta: ReturnType<typeof concentracoes>[number] | null;
}) {
  const mundo = useMundo();
  const r = mundo.reguaConcentracao;
  const [editando, setEditando] = useState(false);
  const [a, setA] = useState(String(r.empreitasConsecutivas));
  const [b, setB] = useState(String(r.diasSemIntervalo));
  const [c, setC] = useState(String(r.pctRecusaMinimo));
  const [d, setD] = useState(String(r.outrasEmpresasMinimo));

  return (
    <Cartao destaque className="p-5">
      <div className="flex items-start gap-3">
        <Prumo className="mt-1 h-5 w-5 shrink-0 text-rust-bright" />
        <div className="min-w-0 flex-1">
          <div className="placa text-[11px] text-concrete">Alerta de concentração</div>

          {alerta ? (
            <>
              <p className="mt-1 text-[17px] leading-snug text-chalk">
                <span className="text-gold-bright">{alerta.nome}</span> —{' '}
                {alerta.consecutivasMesmoTomador} empreitas seguidas na {alerta.obraDominante}, sem
                intervalo há {dias(alerta.diasSemIntervalo)}, todas recebidas por{' '}
                {alerta.encarregadoDominante}.
              </p>
              <p className="num mt-1.5 text-[14px] text-rust-bright">
                {alerta.pctRecusa}% de recusa em {plural(alerta.propostas, 'proposta', 'propostas')}{' '}
                ·{' '}
                {alerta.outrasEmpresas === 0
                  ? 'nenhuma outra empresa declarada'
                  : `${plural(alerta.outrasEmpresas, 'outra empresa', 'outras empresas')}`}
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {alerta.sinais.map((s) => (
                  <div
                    key={s.chave}
                    className={`border px-3 py-2 ${s.bateu ? 'border-rust/50 bg-rust/8' : 'border-line bg-sunken'}`}
                  >
                    <p className="text-[13px] leading-snug text-chalk">{s.rotulo}</p>
                    <p className="num mt-0.5 text-[13px]">
                      <span className={s.bateu ? 'text-rust-bright' : 'text-concrete'}>
                        {s.medido}
                      </span>
                      <span className="text-concrete-dim"> · régua: {s.regua}</span>
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-1 text-[16px] leading-snug text-chalk">
              Nenhum parceiro com dois ou mais sinais de concentração neste momento.
            </p>
          )}

          {/* ⚖️ O parâmetro, visível e editável — e de quem ele é. */}
          <div className="mt-4 border border-line bg-sunken p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Rotulo>Régua desta empresa</Rotulo>
              <Etiqueta tom="neutro">valores de exemplo</Etiqueta>
              {!editando ? (
                <Botao tom="discreto" onClick={() => setEditando(true)}>
                  Editar
                </Botao>
              ) : null}
            </div>

            {editando ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
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
              <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Par rotulo="Empreitas seguidas" valor={String(r.empreitasConsecutivas)} />
                <Par rotulo="Dias sem intervalo" valor={String(r.diasSemIntervalo)} />
                <Par rotulo="Recusa mínima" valor={`${r.pctRecusaMinimo}%`} />
                <Par rotulo="Outras empresas" valor={String(r.outrasEmpresasMinimo)} />
              </dl>
            )}

            <p className="mt-3 max-w-2xl text-[13px] leading-snug text-concrete">
              Parâmetros definidos pelo jurídico da empresa —{' '}
              <span className="text-chalk">o sistema não sugere números.</span> O aviso só acende
              quando dois ou mais sinais batem juntos: um sinal isolado é ruído. Ele não impede nada
              e não decide nada — mostra o que está acontecendo enquanto ainda dá tempo de mudar.
            </p>
          </div>
        </div>
      </div>
    </Cartao>
  );
}

function Par({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="placa text-[10px] text-concrete-dim">{rotulo}</dt>
      <dd className="num text-[20px] text-chalk">{valor}</dd>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function Lista({
  lista,
  busca,
  setBusca,
  selecionado,
  setSelecionado,
  concs,
}: {
  lista: ReturnType<typeof useMundo>['empreiteiros'];
  busca: string;
  setBusca: (v: string) => void;
  selecionado: string;
  setSelecionado: (v: string) => void;
  concs: ReturnType<typeof concentracoes>;
}) {
  const mundo = useMundo();
  const [novo, setNovo] = useState(false);
  const [nome, setNome] = useState('');
  const [especialidadeId, setEspecialidadeId] = useState(ESPECIALIDADES[0].id);
  const [modalidadeId, setModalidadeId] = useState(MODALIDADES[0].id);

  return (
    <section>
      <TituloSecao
        acao={
          <Botao tom="secundario" onClick={() => setNovo(!novo)}>
            {novo ? 'Fechar' : 'Cadastrar empreiteiro'}
          </Botao>
        }
      >
        Parceiros de empreita
      </TituloSecao>

      {novo ? (
        <Cartao className="mb-3 space-y-3 p-4">
          <Campo etiqueta="Nome" valor={nome} onChange={setNome} placeholder="Nome do parceiro" />
          <div className="grid grid-cols-2 gap-3">
            <Selecione
              etiqueta="Especialidade"
              valor={especialidadeId}
              onChange={setEspecialidadeId}
              opcoes={ESPECIALIDADES}
            />
            <Selecione
              etiqueta="Forma de contratar"
              valor={modalidadeId}
              onChange={setModalidadeId}
              opcoes={MODALIDADES}
            />
          </div>
          <Botao
            tom="principal"
            larga
            disabled={nome.trim().length < 3}
            onClick={() => {
              const id = cadastrarEmpreiteiro({
                nome: nome.trim(),
                especialidadeId,
                modalidadeId,
                outrasEmpresas: 0,
                ferramentaPropria: false,
              });
              setSelecionado(id);
              setNome('');
              setNovo(false);
            }}
          >
            Cadastrar empreiteiro
          </Botao>
        </Cartao>
      ) : null}

      <div className="mb-3 flex items-center gap-2 border border-line bg-sunken px-3">
        <Lupa className="h-4 w-4 shrink-0 text-concrete-dim" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Nome ou especialidade"
          aria-label="Buscar empreiteiro"
          className="w-full bg-transparent py-2.5 text-[16px] text-chalk outline-none placeholder:text-concrete-dim"
        />
      </div>

      {lista.length === 0 ? (
        <Vazio
          titulo="Nenhum parceiro com esse nome."
          dica="Tente outro nome ou outra especialidade."
        />
      ) : (
        <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
          {lista.map((e) => {
            const c = concs.find((x) => x.empreiteiroId === e.id);
            const docs = mundo.documentos.filter(
              (d) => d.titularKind === 'empreiteiro' && d.titularId === e.id,
            );
            const pior = docs.map((d) => diasAte(d.vence)).sort((x, y) => x - y)[0];

            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelecionado(e.id)}
                className={`w-full border px-4 py-3 text-left transition-colors ${
                  selecionado === e.id
                    ? 'border-gold/45 bg-gold/8'
                    : 'border-line bg-surface hover:border-line-strong'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] text-chalk">{e.nome}</span>
                  <span className="text-[12px] text-concrete-dim">
                    {nomeDe(ESPECIALIDADES, e.especialidadeId)} ·{' '}
                    {nomeDe(MODALIDADES, e.modalidadeId)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {c ? (
                    <Etiqueta tom={c.acimaDaRegua ? 'rust' : 'neutro'}>
                      {plural(c.empreitas, 'empreita', 'empreitas')}
                    </Etiqueta>
                  ) : (
                    <Etiqueta tom="neutro">sem empreita registrada</Etiqueta>
                  )}
                  {c && c.propostas >= 5 ? (
                    <Etiqueta tom={c.pctRecusa >= 10 ? 'olive' : 'rust'}>
                      {c.pctRecusa}% de recusa
                    </Etiqueta>
                  ) : c ? (
                    <Etiqueta tom="neutro">poucas propostas</Etiqueta>
                  ) : null}
                  {c && c.acimaDaRegua ? (
                    <Etiqueta tom="rust">{c.sinaisAcesos} de 4 sinais</Etiqueta>
                  ) : null}
                  {pior !== undefined && pior <= 7 ? (
                    <Etiqueta tom={pior < 0 ? 'rust' : 'gold'}>
                      documento {vencimento(pior)}
                    </Etiqueta>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function PropostaAberta({
  proposta,
}: {
  proposta: ReturnType<typeof useMundo>['propostas'][number];
}) {
  const mundo = useMundo();
  const obra = mundo.obras.find((o) => o.id === proposta.obraId)!;
  const [nova, setNova] = useState(false);
  const [objetoId, setObjetoId] = useState(OBJETOS_DE_EMPREITA[0].id);
  const [valor, setValor] = useState('3800');
  const [prazo, setPrazo] = useState('6');

  const aceites = proposta.respostas.filter((r) => r.estado === 'aceitou').length;

  return (
    <section>
      <TituloSecao
        acao={
          <Botao tom="secundario" onClick={() => setNova(!nova)}>
            {nova ? 'Fechar' : 'Abrir proposta'}
          </Botao>
        }
      >
        Proposta de empreita
      </TituloSecao>

      {nova ? (
        <Cartao className="mb-3 space-y-3 p-4">
          <Selecione
            etiqueta="Objeto da empreita"
            valor={objetoId}
            onChange={setObjetoId}
            opcoes={OBJETOS_DE_EMPREITA}
          />
          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Valor global (R$)" valor={valor} onChange={setValor} tipo="number" />
            <Campo etiqueta="Prazo (dias)" valor={prazo} onChange={setPrazo} tipo="number" />
          </div>
          <p className="text-[13px] leading-snug text-concrete">
            A proposta descreve um <span className="text-chalk">resultado a entregar</span> por um
            valor combinado — nunca um tempo a cumprir. Ela nasce sem resposta para todos: quem
            responde é o empreiteiro, no aparelho dele.
          </p>
          <Botao
            tom="principal"
            larga
            onClick={() => {
              abrirProposta({
                obraId: obra.id,
                objeto: nomeDe(OBJETOS_DE_EMPREITA, objetoId),
                frenteId: obra.frentes[0],
                especialidadeId: 'pedreiro',
                unidade: 'm²',
                quantidade: 120,
                valorGlobalCents: Math.round((Number(valor) || 0) * 100),
                prazoDias: Math.max(1, Number(prazo) || 1),
                inicioPrevisto: diasAFrente(3),
                encarregado: obra.encarregado,
                convidados: mundo.empreiteiros.slice(0, 5).map((e) => e.id),
              });
              setNova(false);
            }}
          >
            Abrir proposta
          </Botao>
        </Cartao>
      ) : null}

      <Cartao className="p-4">
        <p className="text-[15px] leading-snug text-chalk">{proposta.objeto}</p>
        <p className="num mt-1 text-[15px] text-gold-bright">
          valor global {dinheiro(proposta.valorGlobalCents)} · prazo {dias(proposta.prazoDias)}
        </p>
        <p className="text-[13px] text-concrete-dim">
          {obra.nome} · {proposta.quantidade} {proposta.unidade} · início previsto{' '}
          {data(proposta.inicioPrevisto)} · aberta por {proposta.encarregado}
        </p>

        <div className="mt-3 space-y-2">
          {proposta.respostas.map((r) => {
            const e = mundo.empreiteiros.find((x) => x.id === r.empreiteiroId);
            if (!e) return null;
            return (
              <div
                key={r.empreiteiroId}
                className="flex flex-wrap items-center justify-between gap-2 border border-line bg-sunken px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Etiqueta
                      tom={
                        r.estado === 'aceitou'
                          ? 'olive'
                          : r.estado === 'recusou'
                            ? 'gold'
                            : 'neutro'
                      }
                    >
                      {r.estado === 'aceitou'
                        ? 'aceitou'
                        : r.estado === 'recusou'
                          ? 'recusou'
                          : 'sem resposta'}
                    </Etiqueta>
                    <span className="num text-[12px] text-concrete-dim">{r.hora ?? '—'}</span>
                    <span className="text-[15px] text-chalk">{e.nome}</span>
                  </div>
                  {r.motivo ? <p className="mt-1 text-[13px] text-concrete">“{r.motivo}”</p> : null}
                </div>
                {r.estado === 'sem-resposta' ? (
                  <div className="flex gap-2">
                    <Botao
                      tom="secundario"
                      onClick={() =>
                        responderProposta(proposta.id, r.empreiteiroId, 'aceitou', null, '14:22')
                      }
                    >
                      Aceitar
                    </Botao>
                    <Botao
                      tom="perigo"
                      onClick={() =>
                        responderProposta(
                          proposta.id,
                          r.empreiteiroId,
                          'recusou',
                          'Estou com outra empreita nesta data',
                          '14:22',
                        )
                      }
                    >
                      Recusar
                    </Botao>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="mt-3 border-l-2 border-gold/60 bg-gold/8 px-3 py-2 text-[13px] leading-snug text-concrete">
          <span className="text-chalk">A recusa é registrada como prova de autonomia.</span> Nesta
          demonstração os botões existem para a conversa andar; no sistema, quem carimba o “não” é o
          próprio empreiteiro — um “não” preenchido por outra pessoa não vale nada.
        </p>

        <p className="num mt-3 text-[13px] text-concrete-dim">
          {aceites} {aceites === 1 ? 'aceite' : 'aceites'} até agora
        </p>
      </Cartao>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function Dossie({ empreiteiroId }: { empreiteiroId: string }) {
  const mundo = useMundo();
  const [gerado, setGerado] = useState(false);
  const e = mundo.empreiteiros.find((x) => x.id === empreiteiroId);
  if (!e) return null;

  const minhas = mundo.empreitas.filter((x) => x.empreiteiroId === e.id);
  const props = mundo.propostas.filter((p) => p.respostas.some((r) => r.empreiteiroId === e.id));
  const recusas = props.filter((p) =>
    p.respostas.some((r) => r.empreiteiroId === e.id && r.estado === 'recusou'),
  );
  const docs = mundo.documentos.filter(
    (d) => d.titularKind === 'empreiteiro' && d.titularId === e.id,
  );
  const total = minhas.reduce((s, x) => s + x.valorGlobalCents, 0);

  return (
    <section>
      <TituloSecao>Dossiê de regularidade — {e.nome}</TituloSecao>
      <Cartao className="p-4">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Par rotulo="Empreitas" valor={String(minhas.length)} />
          <Par rotulo="Propostas" valor={String(props.length)} />
          <Par rotulo="Recusas" valor={String(recusas.length)} />
          <Par rotulo="Valor contratado" valor={dinheiro(total)} />
        </dl>

        <div className="mt-4 space-y-1.5 text-[13px] text-concrete">
          <p>
            Forma de contratar:{' '}
            <span className="text-chalk">{nomeDe(MODALIDADES, e.modalidadeId)}</span> ·
            especialidade:{' '}
            <span className="text-chalk">{nomeDe(ESPECIALIDADES, e.especialidadeId)}</span>
          </p>
          <p>
            Atende outras empresas:{' '}
            <span className="text-chalk">
              {e.outrasEmpresas > 0 ? e.outrasEmpresas : 'nenhuma declarada'}
            </span>{' '}
            · ferramenta própria:{' '}
            <span className="text-chalk">{e.ferramentaPropria ? 'sim' : 'não'}</span>
          </p>
        </div>

        <div className="mt-4">
          <Rotulo>Últimas empreitas</Rotulo>
          <div className="mt-2 space-y-1.5">
            {minhas.slice(0, 4).map((x) => (
              <div key={x.id} className="border border-line bg-sunken px-3 py-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[14px] text-chalk">{x.objeto}</span>
                  <Etiqueta tom={ESTADO_EMPREITA[x.estado].tom}>
                    {ESTADO_EMPREITA[x.estado].rotulo}
                  </Etiqueta>
                </div>
                <p className="num mt-0.5 text-[12px] text-concrete-dim">
                  {dinheiro(x.valorGlobalCents)} · prazo {dias(x.prazoDias)} ·{' '}
                  {x.aceiteEm ? `aceite em ${data(x.aceiteEm)}` : 'em execução'} · recebe:{' '}
                  {x.aceitaPor}
                </p>
              </div>
            ))}
            {minhas.length === 0 ? (
              <p className="text-[13px] text-concrete-dim">Nenhuma empreita registrada.</p>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <Rotulo>Documentos com validade</Rotulo>
          <div className="mt-2 flex flex-wrap gap-2">
            {docs.length === 0 ? (
              <span className="text-[13px] text-concrete-dim">Nenhum documento cadastrado.</span>
            ) : (
              docs.map((d) => (
                <Etiqueta
                  key={d.id}
                  tom={diasAte(d.vence) < 0 ? 'rust' : diasAte(d.vence) <= 15 ? 'gold' : 'neutro'}
                >
                  {nomeDe(TIPOS_DE_DOCUMENTO, d.tipoId)} {vencimento(diasAte(d.vence))}
                </Etiqueta>
              ))
            )}
          </div>
          <p className="mt-2 text-[12px] leading-snug text-concrete-dim">
            O Canteiro guarda o tipo, o titular e a validade. Ele não guarda resultado de exame e
            não emite documento nenhum.
          </p>
        </div>

        <div className="mt-4">
          <Botao tom="principal" larga onClick={() => setGerado(true)}>
            <Ficha className="h-4 w-4" />
            Gerar dossiê de regularidade
          </Botao>
        </div>

        {gerado ? (
          <p className="mt-3 border border-olive/50 bg-olive/10 px-3 py-2.5 text-[13px] leading-snug text-olive-bright">
            Nesta demonstração o dossiê não vira arquivo. No sistema, ele sai inteiro e do período
            pedido — contratos de empreita, termos de aceite e de quitação, propostas, recusas,
            notas e recibos, documentos com validade e entrega de EPI —, carimbado com quem exportou
            e quando. Não existe exportar só a parte boa.
          </p>
        ) : null}

        <p className="mt-4 text-[13px] leading-snug text-concrete">
          É o que a fiscalização do contrato pede e o que a defesa precisa, no mesmo lugar. O
          sistema mostra isso para você antes de mostrar para qualquer outra pessoa —{' '}
          <span className="text-chalk">ele não blinda ninguém, ele prova o que aconteceu.</span>
        </p>
      </Cartao>

      <div className="mt-3 space-y-3">
        <CartaoIntegracao
          titulo="Modelo de contrato e termo de rescisão"
          descricao="Os modelos são da empresa e vêm do jurídico dela. O Canteiro guarda qual modelo foi usado em cada empreita e a data de assinatura; ele não escreve o contrato."
        />
        <CartaoIntegracao
          titulo="Nota fiscal e recibo do empreiteiro"
          descricao="Integra com o seu sistema fiscal e com a contabilidade. O Canteiro registra qual documento amarrou a empreita; quem emite é quem já emite hoje."
        />
      </div>
    </section>
  );
}
