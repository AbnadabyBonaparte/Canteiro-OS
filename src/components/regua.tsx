/**
 * ⭐ A RÉGUA DE MEDIÇÃO — a assinatura visual do Canteiro (docs/DESIGN.md §2).
 *
 * O argumento inteiro do produto virado em desenho: todo sistema mostra UM
 * número com UM estado. A obra pública tem QUATRO — executado, aceito pelo
 * fiscal, faturado, pago — e o dinheiro da empresa mora na distância entre
 * eles. A régua torna essa distância visível de longe.
 *
 * ⛔ Quatro densidades do MESMO ouro, nunca quatro cores: são o mesmo dinheiro
 * em quatro estágios, não quatro categorias.
 */

import { dinheiro, dinheiroCurto, fracao, pct } from '@/lib/formato';

export interface ValoresDaRegua {
  readonly executadoCents: number;
  readonly aceitoCents: number;
  readonly faturadoCents: number;
  readonly pagoCents: number;
}

const MARCAS = [
  { chave: 'executadoCents', rotulo: 'Executado', classe: 'regua-executado' },
  { chave: 'aceitoCents', rotulo: 'Aceito', classe: 'regua-aceito' },
  { chave: 'faturadoCents', rotulo: 'Faturado', classe: 'regua-faturado' },
  { chave: 'pagoCents', rotulo: 'Pago', classe: 'regua-pago' },
] as const;

export function Regua({
  valores,
  base,
  compacta = false,
  denso = false,
}: {
  valores: ValoresDaRegua;
  /** O 100% da régua. Normalmente o valor do contrato, ou o executado. */
  base: number;
  compacta?: boolean;
  /** Em cartão estreito: duas colunas e valor sem centavos. */
  denso?: boolean;
}) {
  const teto = Math.max(base, valores.executadoCents, 1);
  const presoDe = fracao(valores.pagoCents, teto);
  const presoAte = fracao(valores.aceitoCents, teto);
  const temPreso = presoAte - presoDe > 0.001;

  return (
    <div>
      <div className={`regua ${compacta ? 'h-3' : ''}`} role="img"
        aria-label={`Executado ${dinheiro(valores.executadoCents)}, aceito ${dinheiro(valores.aceitoCents)}, faturado ${dinheiro(valores.faturadoCents)}, pago ${dinheiro(valores.pagoCents)}`}>
        {MARCAS.map((m) => (
          <div
            key={m.chave}
            className={`regua-faixa ${m.classe}`}
            style={{ width: `${fracao(valores[m.chave], teto) * 100}%` }}
          />
        ))}
        {temPreso ? (
          <div
            className="regua-preso"
            style={{ left: `${presoDe * 100}%`, width: `${(presoAte - presoDe) * 100}%` }}
            title="Aceito pelo fiscal e ainda não pago"
          />
        ) : null}
        {compacta ? null : <div className="regua-ticks" />}
      </div>

      <dl className={`mt-2 grid gap-x-4 gap-y-1.5 ${denso ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {MARCAS.map((m) => (
          <div key={m.chave}>
            <dt className="placa text-[10px] text-concrete-dim">{m.rotulo}</dt>
            <dd
              className={`num text-[13px] ${
                m.chave === 'pagoCents' && valores.pagoCents === 0 && valores.aceitoCents > 0
                  ? 'text-rust-bright'
                  : 'text-chalk'
              }`}
            >
              {denso ? dinheiroCurto(valores[m.chave]) : dinheiro(valores[m.chave])}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** A leitura curta da régua, para cabeçalho de cartão. */
export function ReguaResumo({ valores, base }: { valores: ValoresDaRegua; base: number }) {
  return (
    <span className="num text-[12px] text-concrete">
      {pct(fracao(valores.pagoCents, base) * 100)} pago de{' '}
      {pct(fracao(valores.executadoCents, base) * 100)} executado
    </span>
  );
}
