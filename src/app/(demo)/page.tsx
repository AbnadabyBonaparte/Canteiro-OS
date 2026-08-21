'use client';

/**
 * A CAPA — a primeira coisa que a mesa vê.
 *
 * ⭐ A imagem serve a DADO, não decora: o banner carrega o número do dinheiro
 * preso por cima. Sem o número, seria foto de agência (docs/DESIGN.md §10).
 */

import Link from 'next/link';
import { useMundo } from '@/lib/store';
import { documentosNoPrazo, medicoesPresas, totalPresoCents } from '@/lib/analista';
import { Foto } from '@/components/imagem';
import { Cartao, Etiqueta, TituloSecao } from '@/components/ui';
import { Seta } from '@/components/icones';
import { REGIAO } from '@/lib/imagens';
import { TENANT } from '@/lib/tenant';
import { dias, dinheiroCurto, plural } from '@/lib/formato';

const ATALHOS = [
  { href: '/painel', rotulo: 'Painel de obras', dica: 'onde o dinheiro está parado' },
  { href: '/medicoes', rotulo: 'Medições', dica: 'executado, aceito, faturado, pago' },
  { href: '/empreiteiros', rotulo: 'Empreiteiros', dica: 'contratos de empreita e propostas' },
  { href: '/diario', rotulo: 'Diário de obra', dica: 'o dia, em vinte segundos' },
  { href: '/contratos', rotulo: 'Contratos e aditivos', dica: 'o que foi assinado com o órgão' },
  { href: '/analista', rotulo: 'Funcionário digital', dica: 'o que mudou sem ninguém perguntar' },
];

export default function Capa() {
  const mundo = useMundo();
  const presas = medicoesPresas(mundo);
  const total = totalPresoCents(mundo);
  const vencendo = documentosNoPrazo(mundo, 7);
  const emCurso = mundo.obras.length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Foto nome="banner-capa" altura="cheia" prioridade>
        <div className="max-w-3xl">
          <div className="placa text-[11px] tracking-[0.2em] text-gold">Canteiro OS</div>
          <h1 className="placa mt-1 text-[26px] leading-[1.05] text-chalk sm:text-[40px]">
            {TENANT.nome}
          </h1>
          <p className="mt-1 text-[14px] text-concrete">{TENANT.cidade}</p>

          <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <dt className="placa text-[10px] text-concrete">Dinheiro preso</dt>
              <dd className="num text-[30px] leading-none text-gold-bright sm:text-[38px]">
                {dinheiroCurto(total)}
              </dd>
              <dd className="mt-1 text-[12px] text-concrete-dim">
                {presas.length > 0
                  ? `a mais antiga há ${dias(presas[0].idade)}`
                  : 'nada aceito e não pago'}
              </dd>
            </div>
            <div>
              <dt className="placa text-[10px] text-concrete">Obras em curso</dt>
              <dd className="num text-[30px] leading-none text-chalk sm:text-[38px]">{emCurso}</dd>
              <dd className="mt-1 text-[12px] text-concrete-dim">
                {mundo.prefeituras.length} órgãos contratantes
              </dd>
            </div>
            <div>
              <dt className="placa text-[10px] text-concrete">Vence esta semana</dt>
              <dd className="num text-[30px] leading-none text-chalk sm:text-[38px]">
                {vencendo.length}
              </dd>
              <dd className="mt-1 text-[12px] text-concrete-dim">
                {plural(vencendo.filter((d) => d.restam < 0).length, 'já vencido', 'já vencidos')}
              </dd>
            </div>
          </dl>
        </div>
      </Foto>

      <section>
        <TituloSecao>Por onde começar</TituloSecao>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ATALHOS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex items-start justify-between gap-3 border border-line bg-surface p-4 hover:border-gold/45"
            >
              <span>
                <span className="placa block text-[13px] text-chalk group-hover:text-gold-bright">
                  {a.rotulo}
                </span>
                <span className="mt-1 block text-[13px] text-concrete">{a.dica}</span>
              </span>
              <Seta className="mt-0.5 h-4 w-4 shrink-0 text-concrete-dim group-hover:text-gold" />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <TituloSecao acao={<Etiqueta tom="neutro">imagens ilustrativas</Etiqueta>}>
          A região onde a empresa trabalha
        </TituloSecao>
        <div className="grid gap-3 sm:grid-cols-3">
          {REGIAO.map((n) => (
            <Foto key={n} nome={n} altura="cena" />
          ))}
        </div>
      </section>

      <Cartao className="p-5">
        <p className="text-[14px] leading-snug text-concrete">
          Esta é uma <span className="text-chalk">demonstração</span>: as obras, as prefeituras, os
          parceiros de empreita e todos os números são fictícios, e as fotos são ilustrativas.
          Nenhum dado real de cliente entra aqui.
        </p>
      </Cartao>
    </div>
  );
}
