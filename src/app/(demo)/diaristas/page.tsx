'use client';

/**
 * TELA 3 — DIARISTAS & CHAMADOS.
 *
 * ⚖️ A LEI DA RÉGUA JURÍDICA: o alerta de vínculo aparece com o parâmetro
 * VISÍVEL e EDITÁVEL, e a tela diz, com todas as letras, que quem define o
 * número é o jurídico da empresa — o sistema não sugere um. O valor que vem no
 * seed é EXEMPLO, e está marcado como tal.
 *
 * ⭐ A recusa é o dado mais valioso desta tela. Um cadastro que só registra
 * quem aceitou não prova nada. Por isso ela aparece com o mesmo destaque do
 * aceite, com hora carimbada, e nunca é preenchida por outra pessoa.
 *
 * ⛔ Isto não é blindagem, e a tela não usa essa palavra: é prova e disciplina.
 */

import { useMemo, useState } from 'react';
import {
  abrirChamado,
  cadastrarPrestador,
  definirReguaVinculo,
  responderChamado,
  useMundo,
} from '@/lib/store';
import { concentracoes } from '@/lib/analista';
import {
  Botao,
  Cartao,
  Campo,
  Etiqueta,
  Rotulo,
  Selecione,
  TituloSecao,
  Vazio,
} from '@/components/ui';
import { Ficha, Lupa, Prumo } from '@/components/icones';
import { CartaoIntegracao } from '@/components/cartao-integracao';
import { ESPECIALIDADES, MODALIDADES, TIPOS_DE_DOCUMENTO, nomeDe } from '@/data/taxonomias';
import { data, dias, dinheiro, plural, vencimento } from '@/lib/formato';
import { diasAFrente, diasAte, diasDesde } from '@/data/seed';

export default function Diaristas() {
  const mundo = useMundo();
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState<string>('p01');
  const [novoAberto, setNovoAberto] = useState(false);

  const concs = concentracoes(mundo);
  const alerta = concs.find((c) => c.acimaDaRegua) ?? null;
  const chamadoAberto = mundo.chamados.find((c) => c.id === 'c-aberto') ?? mundo.chamados[0];

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return mundo.prestadores
      .filter(
        (p) =>
          q.length === 0 ||
          p.nome.toLowerCase().includes(q) ||
          nomeDe(ESPECIALIDADES, p.especialidadeId).toLowerCase().includes(q),
      )
      .slice(0, 40);
  }, [mundo.prestadores, busca]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AlertaDeVinculo alerta={alerta} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ListaDePrestadores
          lista={lista}
          busca={busca}
          setBusca={setBusca}
          selecionado={selecionado}
          setSelecionado={setSelecionado}
          concs={concs}
          novoAberto={novoAberto}
          setNovoAberto={setNovoAberto}
        />
        <div className="space-y-6">
          <ChamadoAberto chamado={chamadoAberto} />
          <Dossie prestadorId={selecionado} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function AlertaDeVinculo({ alerta }: { alerta: ReturnType<typeof concentracoes>[number] | null }) {
  const mundo = useMundo();
  const [editando, setEditando] = useState(false);
  const [qtd, setQtd] = useState(String(mundo.reguaVinculo.diarias));
  const [janela, setJanela] = useState(String(mundo.reguaVinculo.janelaDias));

  return (
    <Cartao destaque className="p-5">
      <div className="flex items-start gap-3">
        <Prumo className="mt-1 h-5 w-5 shrink-0 text-rust-bright" />
        <div className="min-w-0 flex-1">
          <div className="placa text-[11px] text-concrete">Alerta de vínculo</div>

          {alerta ? (
            <>
              <p className="mt-1 text-[17px] leading-snug text-chalk">
                <span className="text-gold-bright">{alerta.nome}</span> — {alerta.diariasNaJanela}{' '}
                diárias em {dias(mundo.reguaVinculo.janelaDias)}, {alerta.pctNaObraDominante}% na{' '}
                {alerta.obraDominante}, chamado por {alerta.encarregadoDominante}.
              </p>
              <p className="num mt-1.5 text-[14px] text-rust-bright">
                {plural(alerta.recusas, 'recusa', 'recusas')} em{' '}
                {plural(alerta.chamados, 'chamado', 'chamados')}.
              </p>
            </>
          ) : (
            <p className="mt-1 text-[16px] leading-snug text-chalk">
              Nenhum prestador acima da régua desta empresa neste momento.
            </p>
          )}

          {/* ⚖️ O parâmetro, visível e editável — e de quem ele é. */}
          <div className="mt-4 border border-line bg-sunken p-4">
            <Rotulo>Régua desta empresa</Rotulo>
            {editando ? (
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <Campo etiqueta="Diárias" valor={qtd} onChange={setQtd} tipo="number" largura="w-28" />
                <Campo etiqueta="Em (dias)" valor={janela} onChange={setJanela} tipo="number" largura="w-28" />
                <Botao
                  tom="principal"
                  onClick={() => {
                    const d = Math.max(1, Number(qtd) || mundo.reguaVinculo.diarias);
                    const j = Math.max(1, Number(janela) || mundo.reguaVinculo.janelaDias);
                    definirReguaVinculo(d, j);
                    setEditando(false);
                  }}
                >
                  Gravar régua
                </Botao>
                <Botao tom="discreto" onClick={() => setEditando(false)}>
                  Cancelar
                </Botao>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap items-baseline gap-4">
                <span className="num text-[26px] text-chalk">
                  {mundo.reguaVinculo.diarias} diárias
                </span>
                <span className="text-[14px] text-concrete">
                  em {dias(mundo.reguaVinculo.janelaDias)}
                </span>
                <Etiqueta tom="neutro">valor de exemplo</Etiqueta>
                <Botao tom="discreto" onClick={() => setEditando(true)}>
                  Editar
                </Botao>
              </div>
            )}
            <p className="mt-3 max-w-2xl text-[13px] leading-snug text-concrete">
              Parâmetro definido pelo jurídico da empresa —{' '}
              <span className="text-chalk">o sistema não sugere um número.</span> Este alerta não
              impede nada e não decide nada: ele mostra o que está acontecendo enquanto ainda dá
              tempo de mudar.
            </p>
          </div>

          {alerta ? (
            <p className="mt-3 text-[13px] text-concrete">
              Sugestão de rotatividade: chamar {alerta.nome.split(' ')[0]} para outra obra ou outra
              frente na próxima semana, se fizer sentido para a operação.
            </p>
          ) : null}
        </div>
      </div>
    </Cartao>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ListaDePrestadores({
  lista,
  busca,
  setBusca,
  selecionado,
  setSelecionado,
  concs,
  novoAberto,
  setNovoAberto,
}: {
  lista: ReturnType<typeof useMundo>['prestadores'];
  busca: string;
  setBusca: (v: string) => void;
  selecionado: string;
  setSelecionado: (v: string) => void;
  concs: ReturnType<typeof concentracoes>;
  novoAberto: boolean;
  setNovoAberto: (v: boolean) => void;
}) {
  const mundo = useMundo();
  const [nome, setNome] = useState('');
  const [especialidadeId, setEspecialidadeId] = useState(ESPECIALIDADES[0].id);
  const [modalidadeId, setModalidadeId] = useState(MODALIDADES[0].id);

  return (
    <section>
      <TituloSecao
        acao={
          <Botao tom="secundario" onClick={() => setNovoAberto(!novoAberto)}>
            {novoAberto ? 'Fechar' : 'Cadastrar prestador'}
          </Botao>
        }
      >
        Prestadores
      </TituloSecao>

      {novoAberto ? (
        <Cartao className="mb-3 space-y-3 p-4">
          <Campo etiqueta="Nome" valor={nome} onChange={setNome} placeholder="Nome do prestador" />
          <div className="grid grid-cols-2 gap-3">
            <Selecione
              etiqueta="Especialidade"
              valor={especialidadeId}
              onChange={setEspecialidadeId}
              opcoes={ESPECIALIDADES}
            />
            <Selecione
              etiqueta="Modalidade"
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
              const id = cadastrarPrestador({
                nome: nome.trim(),
                especialidadeId,
                modalidadeId,
                outrasEmpresas: 0,
                ferramentaPropria: false,
              });
              setSelecionado(id);
              setNome('');
              setNovoAberto(false);
            }}
          >
            Cadastrar prestador
          </Botao>
        </Cartao>
      ) : null}

      <div className="mb-3 flex items-center gap-2 border border-line bg-sunken px-3">
        <Lupa className="h-4 w-4 shrink-0 text-concrete-dim" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Nome ou especialidade"
          aria-label="Buscar prestador"
          className="w-full bg-transparent py-2.5 text-[16px] text-chalk outline-none placeholder:text-concrete-dim"
        />
      </div>

      {lista.length === 0 ? (
        <Vazio titulo="Nenhum prestador com esse nome." dica="Tente outro nome ou outra especialidade." />
      ) : (
        <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
          {lista.map((p) => {
            const c = concs.find((x) => x.prestadorId === p.id);
            const docs = mundo.documentos.filter(
              (d) => d.titularKind === 'prestador' && d.titularId === p.id,
            );
            const pior = docs.map((d) => diasAte(d.vence)).sort((a, b) => a - b)[0];

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelecionado(p.id)}
                className={`w-full border px-4 py-3 text-left transition-colors ${
                  selecionado === p.id
                    ? 'border-gold/45 bg-gold/8'
                    : 'border-line bg-surface hover:border-line-strong'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] text-chalk">{p.nome}</span>
                  <span className="text-[12px] text-concrete-dim">
                    {nomeDe(ESPECIALIDADES, p.especialidadeId)} ·{' '}
                    {nomeDe(MODALIDADES, p.modalidadeId)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {c ? (
                    <Etiqueta tom={c.acimaDaRegua ? 'rust' : 'neutro'}>
                      {plural(c.diariasNaJanela, 'diária', 'diárias')}
                    </Etiqueta>
                  ) : (
                    <Etiqueta tom="neutro">sem diária no período</Etiqueta>
                  )}
                  {/* ⚠️ "nenhuma recusa" só vira alerta com amostra: com poucos
                      chamados, zero recusa não diz nada — dizer que diz seria
                      inventar sinal onde não há. */}
                  {c && c.recusas > 0 ? (
                    <Etiqueta tom="olive">{plural(c.recusas, 'recusa', 'recusas')}</Etiqueta>
                  ) : c && c.chamados >= 5 ? (
                    <Etiqueta tom="rust">nenhuma recusa em {c.chamados}</Etiqueta>
                  ) : c ? (
                    <Etiqueta tom="neutro">poucos chamados</Etiqueta>
                  ) : null}
                  {pior !== undefined && pior <= 7 ? (
                    <Etiqueta tom={pior < 0 ? 'rust' : 'gold'}>documento {vencimento(pior)}</Etiqueta>
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

function ChamadoAberto({ chamado }: { chamado: ReturnType<typeof useMundo>['chamados'][number] }) {
  const mundo = useMundo();
  const obra = mundo.obras.find((o) => o.id === chamado.obraId)!;
  const [novoAberto, setNovoAberto] = useState(false);
  const [vagas, setVagas] = useState('4');

  const aceites = chamado.respostas.filter((r) => r.estado === 'aceitou').length;

  return (
    <section>
      <TituloSecao
        acao={
          <Botao tom="secundario" onClick={() => setNovoAberto(!novoAberto)}>
            {novoAberto ? 'Fechar' : 'Chamar prestador'}
          </Botao>
        }
      >
        Chamado aberto
      </TituloSecao>

      {novoAberto ? (
        <Cartao className="mb-3 space-y-3 p-4">
          <Campo etiqueta="Quantas pessoas" valor={vagas} onChange={setVagas} tipo="number" largura="w-32" />
          <p className="text-[13px] leading-snug text-concrete">
            O chamado nasce sem resposta para todos. Quem responde é o prestador, no aparelho dele
            — nem o encarregado nem o escritório respondem por ele.
          </p>
          <Botao
            tom="principal"
            larga
            onClick={() => {
              abrirChamado({
                obraId: obra.id,
                especialidadeId: 'pedreiro',
                vagas: Math.max(1, Number(vagas) || 1),
                dataServico: diasAFrente(2),
                encarregado: obra.encarregado,
                convidados: mundo.prestadores.slice(0, 5).map((p) => p.id),
              });
              setNovoAberto(false);
            }}
          >
            Abrir chamado
          </Botao>
        </Cartao>
      ) : null}

      <Cartao className="p-4">
        <p className="text-[15px] text-chalk">
          {chamado.vagas} {nomeDe(ESPECIALIDADES, chamado.especialidadeId).toLowerCase()}
          {chamado.vagas > 1 ? 's' : ''} · {obra.nome}
        </p>
        <p className="text-[13px] text-concrete-dim">
          para {data(chamado.dataServico)} · aberto por {chamado.encarregado}
        </p>

        <div className="mt-3 space-y-2">
          {chamado.respostas.map((r) => {
            const p = mundo.prestadores.find((x) => x.id === r.prestadorId);
            if (!p) return null;
            return (
              <div
                key={r.prestadorId}
                className="flex flex-wrap items-center justify-between gap-2 border border-line bg-sunken px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Etiqueta
                      tom={
                        r.estado === 'aceitou' ? 'olive' : r.estado === 'recusou' ? 'gold' : 'neutro'
                      }
                    >
                      {r.estado === 'aceitou'
                        ? 'aceitou'
                        : r.estado === 'recusou'
                          ? 'recusou'
                          : 'sem resposta'}
                    </Etiqueta>
                    <span className="num text-[12px] text-concrete-dim">{r.hora ?? '—'}</span>
                    <span className="text-[15px] text-chalk">{p.nome}</span>
                  </div>
                  {r.motivo ? (
                    <p className="mt-1 text-[13px] text-concrete">“{r.motivo}”</p>
                  ) : null}
                </div>
                {r.estado === 'sem-resposta' ? (
                  <div className="flex gap-2">
                    <Botao
                      tom="secundario"
                      onClick={() => responderChamado(chamado.id, r.prestadorId, 'aceitou', null, '14:22')}
                    >
                      Aceitar
                    </Botao>
                    <Botao
                      tom="perigo"
                      onClick={() =>
                        responderChamado(
                          chamado.id,
                          r.prestadorId,
                          'recusou',
                          'Não posso nesta data',
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
          próprio prestador — um “não” preenchido por outra pessoa não vale nada.
        </p>

        <p className="num mt-3 text-[13px] text-concrete-dim">
          {aceites} de {chamado.vagas} vagas preenchidas
        </p>
      </Cartao>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function Dossie({ prestadorId }: { prestadorId: string }) {
  const mundo = useMundo();
  const [gerado, setGerado] = useState(false);
  const p = mundo.prestadores.find((x) => x.id === prestadorId);
  if (!p) return null;

  const diarias = mundo.diarias.filter((d) => d.prestadorId === p.id);
  const chamados = mundo.chamados.filter((c) => c.respostas.some((r) => r.prestadorId === p.id));
  const recusas = chamados.filter((c) =>
    c.respostas.some((r) => r.prestadorId === p.id && r.estado === 'recusou'),
  );
  const docs = mundo.documentos.filter(
    (d) => d.titularKind === 'prestador' && d.titularId === p.id,
  );
  const total = diarias.reduce((s, d) => s + d.valorCents, 0);
  const maisAntiga = diarias.map((d) => diasDesde(d.data)).sort((a, b) => b - a)[0] ?? 0;

  return (
    <section>
      <TituloSecao>Dossiê de {p.nome}</TituloSecao>
      <Cartao className="p-4">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Numero rotulo="Diárias" valor={String(diarias.length)} />
          <Numero rotulo="Chamados" valor={String(chamados.length)} />
          <Numero rotulo="Recusas" valor={String(recusas.length)} tom={recusas.length === 0 ? 'rust' : 'olive'} />
          <Numero rotulo="Pago" valor={dinheiro(total)} />
        </dl>

        <div className="mt-4 space-y-1.5 text-[13px] text-concrete">
          <p>
            Modalidade: <span className="text-chalk">{nomeDe(MODALIDADES, p.modalidadeId)}</span> ·
            especialidade:{' '}
            <span className="text-chalk">{nomeDe(ESPECIALIDADES, p.especialidadeId)}</span>
          </p>
          <p>
            Atende outras empresas:{' '}
            <span className="text-chalk">{p.outrasEmpresas > 0 ? `${p.outrasEmpresas}` : 'nenhuma declarada'}</span>{' '}
            · ferramenta própria:{' '}
            <span className="text-chalk">{p.ferramentaPropria ? 'sim' : 'não'}</span>
          </p>
          <p>
            Período coberto: <span className="text-chalk">{dias(maisAntiga)}</span> de histórico
          </p>
        </div>

        <div className="mt-4">
          <Rotulo>Documentos</Rotulo>
          <div className="mt-2 flex flex-wrap gap-2">
            {docs.length === 0 ? (
              <span className="text-[13px] text-concrete-dim">Nenhum documento cadastrado.</span>
            ) : (
              docs.map((d) => (
                <Etiqueta key={d.id} tom={diasAte(d.vence) < 0 ? 'rust' : diasAte(d.vence) <= 15 ? 'gold' : 'neutro'}>
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

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Botao tom="principal" larga onClick={() => setGerado(true)}>
            <Ficha className="h-4 w-4" />
            Gerar dossiê
          </Botao>
        </div>

        {gerado ? (
          <p className="mt-3 border border-olive/50 bg-olive/10 px-3 py-2.5 text-[13px] leading-snug text-olive-bright">
            Nesta demonstração o dossiê não vira arquivo. No sistema, ele sai inteiro e do período
            pedido — contratos, recibos e notas, chamados, recusas, documentos e avaliações —,
            carimbado com quem exportou e quando. Não existe exportar só a parte boa.
          </p>
        ) : null}

        <p className="mt-4 text-[13px] leading-snug text-concrete">
          É o mesmo maço que a fiscalização do contrato pede e que a defesa usaria. O sistema mostra
          isso para você antes de mostrar para qualquer outra pessoa —{' '}
          <span className="text-chalk">ele não blinda ninguém, ele prova o que aconteceu.</span>
        </p>
      </Cartao>

      <div className="mt-3">
        <CartaoIntegracao
          titulo="Nota fiscal e recibo do prestador"
          descricao="Integra com o seu sistema fiscal e com a contabilidade. O Canteiro registra qual documento amarrou a diária; quem emite é quem já emite hoje."
        />
      </div>
    </section>
  );
}

function Numero({ rotulo, valor, tom }: { rotulo: string; valor: string; tom?: 'rust' | 'olive' }) {
  return (
    <div>
      <dt className="placa text-[10px] text-concrete-dim">{rotulo}</dt>
      <dd
        className={`num text-[20px] ${
          tom === 'rust' ? 'text-rust-bright' : tom === 'olive' ? 'text-olive-bright' : 'text-chalk'
        }`}
      >
        {valor}
      </dd>
    </div>
  );
}
