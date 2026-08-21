'use client';

/**
 * TELA 4 — MEDIÇÃO & BOLETIM · o coração.
 *
 * ⭐ Quatro números, quatro momentos: EXECUTADO (a empresa), ACEITO (o fiscal),
 * FATURADO (a nota), PAGO (o dinheiro). Nunca uma coluna "status" que finja que
 * é um só — é entre eles que o dinheiro da empresa fica preso.
 *
 * ⭐ A glosa carrega MOTIVO obrigatório, e o motivo é vocabulário do tenant
 * (src/data/taxonomias.ts) — nunca uma lista congelada nesta tela.
 */

import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { fecharMedicao, lancarGlosa, useMundo } from '@/lib/store';
import { caixaPorMes, ritmoDePagamento } from '@/lib/analista';
import { GraficoDeCaixa } from '@/components/grafico';
import { Regua } from '@/components/regua';
import { CartaoIntegracao } from '@/components/cartao-integracao';
import {
  Botao,
  Cartao,
  Campo,
  Confirmar,
  Etiqueta,
  Rotulo,
  Selecione,
  TituloSecao,
  Vazio,
} from '@/components/ui';
import { MOTIVOS_DE_GLOSA, nomeDe } from '@/data/taxonomias';
import { data, dias, dinheiro, numero } from '@/lib/formato';
import { diasDesde } from '@/data/seed';

const ESTADOS = {
  'em-curso': { rotulo: 'Em curso', tom: 'gold' },
  enviada: { rotulo: 'Enviada ao fiscal', tom: 'gold' },
  aceita: { rotulo: 'Aceita', tom: 'olive' },
  'aceita-parcial': { rotulo: 'Aceita com glosa', tom: 'rust' },
} as const;

export default function MedicaoDaObra() {
  const { obraId } = useParams<{ obraId: string }>();
  const mundo = useMundo();
  const obra = mundo.obras.find((o) => o.id === obraId);

  const medicoes = useMemo(
    () => mundo.medicoes.filter((m) => m.obraId === obraId),
    [mundo.medicoes, obraId],
  );
  const [abertaId, setAbertaId] = useState<string | null>(null);
  const [glosando, setGlosando] = useState(false);
  const [itemNumero, setItemNumero] = useState('1');
  const [motivoId, setMotivoId] = useState(MOTIVOS_DE_GLOSA[0].id);
  const [valor, setValor] = useState('');
  const [aFechar, setAFechar] = useState<string | null>(null);

  if (!obra) {
    return (
      <Vazio titulo="Obra não encontrada." dica="Volte ao painel e escolha uma das obras da carteira." />
    );
  }

  const pref = mundo.prefeituras.find((p) => p.id === obra.prefeituraId)!;
  const aberta = medicoes.find((m) => m.id === abertaId) ?? medicoes.find((m) => m.numero === 4) ?? medicoes[0];
  const itens = mundo.itens.filter((i) => i.obraId === obra.id);
  const ritmo = ritmoDePagamento(mundo).find((r) => r.prefeituraId === pref.id);
  const caixa = caixaPorMes(mundo, obra.id);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ── Cabeçalho do boletim ────────────────────────────────────────── */}
      <section>
        <Cartao className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="placa text-[18px] leading-tight text-chalk">{obra.nome}</h1>
              <p className="mt-1 text-[13px] text-concrete">
                Boletim de medição nº {aberta.numero} · período {data(aberta.periodoInicio)} a{' '}
                {data(aberta.periodoFim)}
              </p>
              <p className="text-[13px] text-concrete-dim">
                {pref.nome} · fiscal: {pref.fiscal} (fictício)
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Etiqueta tom={ESTADOS[aberta.estado].tom}>{ESTADOS[aberta.estado].rotulo}</Etiqueta>
              {aberta.estado === 'em-curso' ? (
                <Botao tom="principal" onClick={() => setAFechar(aberta.id)}>
                  Fechar medição
                </Botao>
              ) : null}
            </div>
          </div>

          <div className="mt-5">
            <Regua valores={aberta} base={aberta.executadoCents} />
          </div>

          {aberta.aceitoCents > 0 && aberta.pagoCents === 0 && aberta.dataAceite ? (
            <p className="mt-4 border-l-2 border-rust/70 bg-rust/8 px-3 py-2.5 text-[14px] leading-snug text-chalk">
              Aceita pelo fiscal em {data(aberta.dataAceite)} —{' '}
              <span className="num text-rust-bright">{dias(diasDesde(aberta.dataAceite))}</span>{' '}
              sem pagamento.
            </p>
          ) : null}
        </Cartao>
      </section>

      {/* ── A planilha ──────────────────────────────────────────────────── */}
      <section>
        <TituloSecao
          acao={
            <Botao tom="secundario" onClick={() => setGlosando(!glosando)}>
              {glosando ? 'Fechar' : 'Lançar glosa'}
            </Botao>
          }
        >
          Serviços do contrato
        </TituloSecao>

        {glosando ? (
          <Cartao className="mb-3 space-y-3 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Selecione
                etiqueta="Serviço"
                valor={itemNumero}
                onChange={setItemNumero}
                opcoes={itens.map((i) => ({ id: String(i.numero), nome: `${i.numero}. ${i.descricao}` }))}
              />
              <Selecione
                etiqueta="Motivo da glosa"
                valor={motivoId}
                onChange={setMotivoId}
                opcoes={MOTIVOS_DE_GLOSA}
              />
              <Campo etiqueta="Valor glosado (R$)" valor={valor} onChange={setValor} tipo="number" />
            </div>
            <p className="text-[13px] leading-snug text-concrete">
              O motivo é obrigatório e sai da lista da sua empresa, não de uma lista nossa. Glosa
              sem motivo é glosa que ninguém contesta.
            </p>
            <Botao
              tom="principal"
              larga
              disabled={!valor || Number(valor) <= 0}
              onClick={() => {
                lancarGlosa(aberta.id, {
                  itemNumero: Number(itemNumero),
                  motivoId,
                  valorCents: Math.round(Number(valor) * 100),
                });
                setValor('');
                setGlosando(false);
              }}
            >
              Lançar glosa
            </Botao>
          </Cartao>
        ) : null}

        <Cartao className="rolagem">
          <table className="w-full min-w-[640px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-line bg-surface-2 text-left">
                <Th>nº</Th>
                <Th>Serviço</Th>
                <Th className="text-right">Un</Th>
                <Th className="text-right">Quantidade</Th>
                <Th className="text-right">Unitário</Th>
                <Th className="text-right">No contrato</Th>
              </tr>
            </thead>
            <tbody>
              {itens.map((i) => {
                const glosa = aberta.glosas.find((g) => g.itemNumero === i.numero);
                return (
                  <tr key={i.numero} className="border-b border-line align-top last:border-0">
                    <Td className="num text-concrete-dim">{String(i.numero).padStart(2, '0')}</Td>
                    <Td>
                      <span className="text-chalk">{i.descricao}</span>
                      {glosa ? (
                        <span className="mt-1.5 flex flex-wrap items-center gap-2">
                          <Etiqueta tom="rust">glosado</Etiqueta>
                          <span className="text-[13px] text-concrete">
                            {nomeDe(MOTIVOS_DE_GLOSA, glosa.motivoId)} ·{' '}
                            <span className="num text-rust-bright">
                              −{dinheiro(glosa.valorCents)}
                            </span>
                          </span>
                        </span>
                      ) : null}
                    </Td>
                    <Td className="num text-right text-concrete">{i.unidade}</Td>
                    <Td className="num text-right text-concrete">{numero(i.quantidade)}</Td>
                    <Td className="num text-right text-concrete">{dinheiro(i.precoUnitCents)}</Td>
                    <Td className="num text-right text-chalk">
                      {dinheiro(i.quantidade * i.precoUnitCents)}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Cartao>
      </section>

      {/* ── O caixa e o honesto ─────────────────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Cartao className="p-5">
          <Rotulo>Caixa — previsto pelo contrato × realizado</Rotulo>
          <div className="mt-4">
            <GraficoDeCaixa meses={caixa} />
          </div>
          {ritmo ? (
            <p className="mt-4 border-t border-line pt-3 text-[14px] leading-snug text-concrete">
              <span className="text-chalk">{ritmo.nome}</span> paga em{' '}
              <span className="num text-gold-bright">{dias(ritmo.mediaDias)}</span>, em média, nas{' '}
              {ritmo.amostras} medições já pagas desta carteira.
            </p>
          ) : null}
        </Cartao>

        <div className="space-y-3">
          <CartaoIntegracao
            titulo="Nota fiscal e retenções"
            descricao="Integra com o seu sistema fiscal. O Canteiro registra o número da nota e a data; quem emite e quem calcula imposto continua sendo quem já faz isso hoje."
          />
          <CartaoIntegracao
            titulo="Publicação no PNCP"
            descricao="É ato do órgão público, não da empresa. O Canteiro acompanha o contrato e o aditivo; publicar é da prefeitura."
          />
          <Cartao className="p-4">
            <Rotulo>Aditivos desta obra</Rotulo>
            <p className="num mt-1 text-[24px] text-chalk">{obra.aditivoPct}%</p>
            <p className="mt-1 text-[13px] leading-snug text-concrete">
              É o percentual do que este sistema registrou, sobre o valor atualizado. O teto de
              acréscimo em obra na Lei 14.133/2021 é 25% (50% só em reforma de edifício).{' '}
              <span className="text-chalk">A conclusão sobre o contrato é do seu jurídico.</span>
            </p>
          </Cartao>
        </div>
      </section>

      {/* ── Todas as medições ───────────────────────────────────────────── */}
      <section>
        <TituloSecao>Todas as medições desta obra</TituloSecao>
        <div className="space-y-2">
          {medicoes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setAbertaId(m.id)}
              className={`flex w-full flex-wrap items-center justify-between gap-3 border px-4 py-3 text-left ${
                m.id === aberta.id ? 'border-gold/45 bg-gold/8' : 'border-line bg-surface hover:border-line-strong'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="num text-[15px] text-chalk">Medição {m.numero}</span>
                <Etiqueta tom={ESTADOS[m.estado].tom}>{ESTADOS[m.estado].rotulo}</Etiqueta>
              </span>
              <span className="flex items-center gap-4 text-[13px]">
                <span className="num text-concrete">aceito {dinheiro(m.aceitoCents)}</span>
                <span className={`num ${m.pagoCents === 0 && m.aceitoCents > 0 ? 'text-rust-bright' : 'text-concrete'}`}>
                  pago {dinheiro(m.pagoCents)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <Confirmar
        aberto={aFechar !== null}
        titulo="Fechar esta medição"
        descricao="Ao fechar, o boletim é congelado e segue para o fiscal. Depois disso os serviços e as quantidades não mudam mais — é o documento que a prefeitura recebeu. Para corrigir, abre-se outra medição."
        rotuloAcao="Fechar e enviar"
        aoConfirmar={() => {
          if (aFechar) fecharMedicao(aFechar);
        }}
        aoFechar={() => setAFechar(null)}
      />
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`placa px-3 py-2.5 text-[10px] font-normal text-concrete ${className}`}>{children}</th>;
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2.5 ${className}`}>{children}</td>;
}
