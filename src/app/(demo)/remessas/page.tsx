'use client';

/**
 * REMESSAS — a guia de transporte, no celular.
 *
 * ⭐⭐ **Espelho fiel do módulo `remessa` do Business OS (PR #105):** os mesmos
 * nomes, a mesma ordem, a mesma física. Quando o produto ligar, a mesa já
 * conhece a tela — e é essa a razão de a vitrine existir.
 *
 * ⛔ **Nenhum estado é coluna.** A operação está ativa porque tem assinatura; o
 * manifesto está aberto porque não existe o evento de encerramento; a pendência
 * de retorno é a conta de quem saiu e não voltou.
 */

import Link from 'next/link';
import { useState } from 'react';

import {
  cardapio,
  frasePendencia,
  manifestosAbertos,
  marcaDeAtraso,
  motoristaDe,
  operacaoDe,
  pendenciasDeRetorno,
  travaDoManifesto,
  veiculoDe,
} from '@/lib/remessa';
import { marcarChegada, useMundo } from '@/lib/store';
import { data } from '@/lib/formato';
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
import { Maquina, Seta } from '@/components/icones';

export default function Remessas() {
  const mundo = useMundo();
  const [chegando, setChegando] = useState<string | null>(null);

  const abertos = manifestosAbertos(mundo);
  const trava = travaDoManifesto(mundo);
  const pendencias = pendenciasDeRetorno(mundo);
  const semAssinatura = cardapio(mundo).filter((i) => !i.usavel).length;

  const remessas = [...mundo.remessas].sort((a, b) => b.registradoEm.localeCompare(a.registradoEm));

  return (
    <div>
      <Sala
        titulo="Remessas"
        linha="A guia sai do celular. O encarregado escolhe o que sai, para onde e em que caminhão — e o caminhão sai regular."
        numero={String(abertos.length)}
        rotuloNumero="manifestos em aberto"
        tomNumero={abertos.length > 0 ? 'rust' : 'chalk'}
        acao={
          <Link href="/remessas/nova">
            <Botao tom="principal">
              Nova saída
              <Seta className="h-4 w-4" />
            </Botao>
          </Link>
        }
      />

      {trava.travado ? (
        <Cartao destaque className="mb-6 p-4">
          <p className="placa text-[11px] text-rust-bright">Caminhão com manifesto em aberto</p>
          <p className="mt-1.5 text-[14px] leading-snug text-chalk">{trava.frase}</p>
        </Cartao>
      ) : null}

      {semAssinatura > 0 ? (
        <Cartao className="mb-6 p-4">
          <p className="placa text-[11px] text-concrete">O cardápio tem operação sem assinatura</p>
          <p className="mt-1.5 text-[14px] leading-snug text-concrete">
            {semAssinatura === 1
              ? '1 operação ainda não foi assinada pelo contador da empresa. Ela aparece no cardápio, em cinza, e nada sai por ela.'
              : `${semAssinatura} operações ainda não foram assinadas pelo contador da empresa. Elas aparecem no cardápio, em cinza, e nada sai por elas.`}{' '}
            <Link href="/configuracoes#cardapio" className="text-gold underline underline-offset-2">
              Ver o cardápio
            </Link>
          </p>
        </Cartao>
      ) : null}

      {/* ── EM TRÂNSITO ───────────────────────────────────────────────────── */}
      <section className="mb-10">
        <TituloSecao>Em trânsito</TituloSecao>
        {abertos.length === 0 ? (
          <Vazio
            titulo="Nenhum caminhão na estrada."
            dica="Quando uma saída for registrada, o manifesto aparece aqui até alguém marcar Chegou na entrega."
          />
        ) : (
          <div className="space-y-3">
            {abertos.map(({ documento, remessa, diasAberto }) => (
              <Cartao key={documento.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Etiqueta tom="rust">MDF-e em aberto</Etiqueta>
                  <span className="num text-[12px] text-concrete-dim">nº {documento.numero}</span>
                </div>
                <p className="mt-2 text-[14px] leading-snug text-chalk">
                  {remessa.origemRotulo} <span className="text-concrete-dim">→</span>{' '}
                  {remessa.destinoRotulo}
                </p>
                <p className="mt-1 text-[13px] text-concrete">
                  Autorizado{' '}
                  {diasAberto === 0 ? 'hoje' : `há ${diasAberto} dia${diasAberto === 1 ? '' : 's'}`}
                  . Enquanto não encerrar, este caminhão não sai de novo.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Botao tom="principal" onClick={() => setChegando(documento.id)}>
                    Chegou
                  </Botao>
                  <Link href={`/remessas/${remessa.id}`}>
                    <Botao>Ver a guia</Botao>
                  </Link>
                </div>
              </Cartao>
            ))}
          </div>
        )}
      </section>

      {/* ── FORA DO PÁTIO ─────────────────────────────────────────────────── */}
      <section className="mb-10">
        <TituloSecao>Fora do pátio</TituloSecao>
        <p className="-mt-3 mb-4 text-[13px] leading-snug text-concrete">
          O que saiu por uma operação que cobra volta e ainda não voltou.{' '}
          <span className="text-chalk">Não é caixinha que alguém marca</span> — é a conta de quem
          tem saída sem retorno registrado.
        </p>
        {pendencias.length === 0 ? (
          <Vazio
            titulo="Nada fora do prazo."
            dica="Quando uma máquina sair para conserto ou locação, ela aparece aqui com os dias fora — e some sozinha quando o retorno for registrado."
          />
        ) : (
          <div className="space-y-3">
            {pendencias.map((p) => (
              <Cartao key={p.remessa.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Etiqueta tom={p.foraDoPrazo ? 'rust' : 'neutro'}>
                    {p.foraDoPrazo ? 'fora do prazo' : 'dentro do prazo'}
                  </Etiqueta>
                  <span className="text-[13px] text-concrete">{p.operacao.rotulo}</span>
                </div>
                <p className="mt-2 text-[14px] leading-snug text-chalk">{frasePendencia(p)}</p>
                {/* ⭐ O retorno acontece na guia, e não aqui: lá ele vem com o
                    segundo ato à vista — passar a máquina de obra é outro fato,
                    em outra porta, como no produto. */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/remessas/${p.remessa.id}`}>
                    <Botao tom="principal">Registrar retorno</Botao>
                  </Link>
                </div>
              </Cartao>
            ))}
          </div>
        )}
      </section>

      {/* ── AS SAÍDAS ─────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <TituloSecao>Saídas registradas</TituloSecao>
        <p className="-mt-3 mb-4 text-[13px] leading-snug text-concrete">
          Cada linha é fato consumado: não se edita e não se apaga. Corrigir é registrar outro ato —
          e o registro feito depois carrega a marca, à vista.
        </p>
        {remessas.length === 0 ? (
          <Vazio
            titulo="Nenhuma saída registrada."
            dica="Toque em Nova saída para mandar a primeira máquina."
          />
        ) : (
          <div className="space-y-2">
            {remessas.map((r) => {
              const operacao = operacaoDe(mundo, r.operacaoId);
              const veiculo = veiculoDe(mundo, r.veiculoId);
              const motorista = motoristaDe(mundo, r.motoristaId);
              const marca = marcaDeAtraso(r);

              return (
                <Link key={r.id} href={`/remessas/${r.id}`} className="block">
                  <Linha
                    titulo={`${operacao?.rotulo ?? '—'} · nº ${r.numero}`}
                    subtitulo={`${r.origemRotulo} → ${r.destinoRotulo} · ${veiculo?.placa ?? '—'} · ${motorista?.nome ?? '—'}${marca ? ` · ${marca}` : ''}`}
                    valor={data(r.ocorreuEm)}
                    valorTom={r.cancelada ? 'rust' : undefined}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ⚠️ A honestidade que a lei da casa exige, na própria tela. */}
      <Cartao className="p-4">
        <p className="placa text-[11px] text-concrete">O que esta demonstração não é</p>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-snug text-concrete">
          <li className="flex gap-2">
            <Maquina className="mt-0.5 h-4 w-4 shrink-0 text-concrete-dim" />
            <span>
              <span className="text-chalk">Os documentos saem carimbados</span> como demonstração e
              não têm valor fiscal. Nada foi transmitido a órgão nenhum.
            </span>
          </li>
          <li className="flex gap-2">
            <Maquina className="mt-0.5 h-4 w-4 shrink-0 text-concrete-dim" />
            <span>
              <span className="text-chalk">O CFOP que aparece é ilustrativo.</span> Quem define e
              assina é o contador da empresa — o sistema não sugere código fiscal.
            </span>
          </li>
          <li className="flex gap-2">
            <Maquina className="mt-0.5 h-4 w-4 shrink-0 text-concrete-dim" />
            <span>
              Para emitir de verdade faltam três coisas que{' '}
              <span className="text-chalk">não são nossas</span>: a inscrição estadual, o
              certificado da empresa e o cardápio assinado.
            </span>
          </li>
        </ul>
      </Cartao>

      <Confirmar
        aberto={chegando !== null}
        titulo="Marcar chegada"
        descricao="Isto encerra o manifesto deste caminhão. Sem encerrar, a próxima saída dele é recusada — e é por isso que o botão existe no celular do motorista."
        rotuloAcao="Chegou"
        aoConfirmar={() => {
          if (chegando) marcarChegada(chegando, 'Sr. Aparecido');
          setChegando(null);
        }}
        aoFechar={() => setChegando(null)}
      />
    </div>
  );
}
