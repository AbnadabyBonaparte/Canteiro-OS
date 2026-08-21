'use client';

/**
 * EQUIPAMENTOS — onde cada máquina está e quando ela para.
 *
 * ⭐ O horímetro contra a próxima manutenção é a conta que ninguém faz e que
 * decide se a betoneira para no meio de uma concretagem.
 */

import { useMundo } from '@/lib/store';
import { Cartao, Etiqueta, Linha, Sala, TituloSecao } from '@/components/ui';
import { CartaoIntegracao } from '@/components/cartao-integracao';
import { data, dias, numero, plural } from '@/lib/formato';
import { diasDesde } from '@/data/seed';

const ESTADO = {
  operando: { rotulo: 'Operando', tom: 'olive' },
  parado: { rotulo: 'Parado', tom: 'rust' },
  manutencao: { rotulo: 'Em manutenção', tom: 'gold' },
} as const;

export default function Equipamentos() {
  const mundo = useMundo();
  const parados = mundo.equipamentos.filter((e) => e.estado !== 'operando');

  return (
    <div className="mx-auto max-w-5xl">
      <Sala
        titulo="Equipamentos"
        linha="Em que obra cada máquina está, desde quando, e quanto falta para a próxima manutenção."
        numero={String(parados.length)}
        rotuloNumero="Fora de operação"
        tomNumero={parados.length > 0 ? 'rust' : 'olive'}
      />

      <section>
        <TituloSecao>Frota e maquinário</TituloSecao>
        <Cartao>
          {mundo.equipamentos.map((e) => {
            const obra = mundo.obras.find((o) => o.id === e.obraId)!;
            const temHorimetro = e.proximaManutencaoHoras > 0;
            const faltam = e.proximaManutencaoHoras - e.horimetro;
            return (
              <Linha
                key={e.id}
                titulo={`${e.nome} · ${e.patrimonio}`}
                subtitulo={`${obra.nome} · nesta obra há ${dias(diasDesde(e.desde))} · desde ${data(e.desde)}`}
                valor={temHorimetro ? `${numero(e.horimetro)} h` : '—'}
                etiquetas={
                  <>
                    <Etiqueta tom={ESTADO[e.estado].tom}>{ESTADO[e.estado].rotulo}</Etiqueta>
                    {temHorimetro ? (
                      <Etiqueta tom={faltam <= 0 ? 'rust' : faltam < 200 ? 'gold' : 'neutro'}>
                        {faltam <= 0
                          ? `manutenção vencida há ${numero(-faltam)} h`
                          : `faltam ${numero(faltam)} h para a manutenção`}
                      </Etiqueta>
                    ) : null}
                  </>
                }
              />
            );
          })}
        </Cartao>
        {parados.length > 0 ? (
          <p className="mt-2 text-[13px] text-concrete">
            {plural(
              parados.length,
              'equipamento fora de operação',
              'equipamentos fora de operação',
            )}{' '}
            — cada dia parado é frente de serviço andando mais devagar.
          </p>
        ) : null}
      </section>

      <div className="mt-6">
        <CartaoIntegracao
          titulo="Combustível e telemetria"
          descricao="Abastecimento e rastreamento vêm do seu sistema de frota, quando houver. O Canteiro registra onde a máquina está alocada e o horímetro informado."
        />
      </div>
    </div>
  );
}
