'use client';

/**
 * O DESIGN SYSTEM LOCAL — tudo o que a vitrine desenha.
 *
 * Regras que valem para todos os componentes daqui (docs/DESIGN.md):
 * ⛔ zero gradiente, zero blur, zero sombra colorida — profundidade é valor de
 *    cinza + borda de 1px;
 * ⛔ zero emoji e zero texto de dev na tela;
 * ✅ estado vazio, erro e carregando existem para toda lista (CRIVO X.0);
 * ✅ toda ação destrutiva confirma, e nada se apaga: cancela-se com motivo.
 */

import { useEffect, useId, useRef, useState } from 'react';
import { Prumo } from './icones';

// ─────────────────────────────────────────────────────────────────────────────
// SUPERFÍCIE
// ─────────────────────────────────────────────────────────────────────────────

export function Cartao({
  children,
  className = '',
  destaque = false,
}: {
  children: React.ReactNode;
  className?: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`border bg-surface ${destaque ? 'border-gold/45' : 'border-line'} ${className}`}
    >
      {children}
    </div>
  );
}

export function TituloSecao({
  children,
  acao,
}: {
  children: React.ReactNode;
  acao?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="placa text-[13px] text-concrete">{children}</h2>
      {acao}
    </div>
  );
}

export function Rotulo({ children }: { children: React.ReactNode }) {
  return <div className="placa text-[11px] text-concrete-dim">{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// AÇÃO
// ─────────────────────────────────────────────────────────────────────────────

type TomBotao = 'principal' | 'secundario' | 'discreto' | 'perigo';

const TONS: Record<TomBotao, string> = {
  principal: 'bg-gold text-obsidian hover:bg-gold-bright border-gold',
  secundario: 'bg-surface-2 text-chalk hover:border-line-strong border-line',
  discreto: 'bg-transparent text-concrete hover:text-chalk border-transparent',
  perigo: 'bg-transparent text-rust-bright hover:bg-rust/12 border-rust/50',
};

export function Botao({
  children,
  tom = 'secundario',
  larga = false,
  type = 'button',
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  tom?: TomBotao;
  larga?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`placa inline-flex min-h-[44px] items-center justify-center gap-2 border px-4 text-[12px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${TONS[tom]} ${larga ? 'w-full' : ''}`}
    >
      {children}
    </button>
  );
}

/** Botão de escolha do formulário do diário — alvo grande, dedo de obra. */
export function Escolha({
  children,
  marcada,
  onClick,
}: {
  children: React.ReactNode;
  marcada: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={marcada}
      className={`min-h-[52px] border px-3 py-2 text-left text-[15px] leading-tight transition-colors ${
        marcada
          ? 'border-gold bg-gold/12 text-chalk'
          : 'border-line bg-sunken text-concrete hover:border-line-strong'
      }`}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTRADA
// ─────────────────────────────────────────────────────────────────────────────

export function Campo({
  etiqueta,
  valor,
  onChange,
  placeholder,
  multilinha = false,
  tipo = 'text',
  sufixo,
  largura,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multilinha?: boolean;
  tipo?: 'text' | 'number' | 'date';
  sufixo?: string;
  largura?: string;
}) {
  const id = useId();
  const comum =
    'w-full border border-line bg-sunken px-3 py-2.5 text-[16px] text-chalk placeholder:text-concrete-dim focus:border-gold';
  return (
    <div className={largura}>
      <label htmlFor={id} className="placa mb-1.5 block text-[11px] text-concrete">
        {etiqueta}
      </label>
      <div className="flex items-center gap-2">
        {multilinha ? (
          <textarea
            id={id}
            rows={3}
            value={valor}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={comum}
          />
        ) : (
          <input
            id={id}
            type={tipo}
            value={valor}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`${comum} ${tipo === 'number' ? 'num' : ''}`}
          />
        )}
        {sufixo ? <span className="text-[13px] text-concrete">{sufixo}</span> : null}
      </div>
    </div>
  );
}

export function Selecione({
  etiqueta,
  valor,
  onChange,
  opcoes,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  opcoes: ReadonlyArray<{ readonly id: string; readonly nome: string }>;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="placa mb-1.5 block text-[11px] text-concrete">
        {etiqueta}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line bg-sunken px-3 py-2.5 text-[16px] text-chalk focus:border-gold"
      >
        {opcoes.map((o) => (
          <option key={o.id} value={o.id} className="bg-surface">
            {o.nome}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Contador de efetivo — mais rápido que teclado, de bota e no sol. */
export function Contador({
  etiqueta,
  valor,
  onChange,
  minimo = 0,
}: {
  etiqueta: string;
  valor: number;
  onChange: (v: number) => void;
  minimo?: number;
}) {
  return (
    <div>
      <div className="placa mb-1.5 text-[11px] text-concrete">{etiqueta}</div>
      <div className="flex items-stretch border border-line bg-sunken">
        <button
          type="button"
          aria-label="Diminuir"
          onClick={() => onChange(Math.max(minimo, valor - 1))}
          className="min-h-[52px] w-14 border-r border-line text-2xl text-concrete hover:text-gold"
        >
          −
        </button>
        <div className="num flex flex-1 items-center justify-center text-2xl text-chalk">
          {valor}
        </div>
        <button
          type="button"
          aria-label="Aumentar"
          onClick={() => onChange(valor + 1)}
          className="min-h-[52px] w-14 border-l border-line text-2xl text-concrete hover:text-gold"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTADO — óxido para o que parou, latão para o que exige decisão, oliva segue
// ─────────────────────────────────────────────────────────────────────────────

export type Tom = 'rust' | 'gold' | 'olive' | 'neutro';

const ETIQUETAS: Record<Tom, string> = {
  rust: 'border-rust/55 text-rust-bright bg-rust/10',
  gold: 'border-gold/55 text-gold-bright bg-gold/10',
  olive: 'border-olive/55 text-olive-bright bg-olive/10',
  neutro: 'border-line text-concrete bg-surface-2',
};

export function Etiqueta({ tom = 'neutro', children }: { tom?: Tom; children: React.ReactNode }) {
  return (
    <span
      className={`placa inline-block border px-2 py-[3px] text-[10px] whitespace-nowrap ${ETIQUETAS[tom]}`}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OS TRÊS ESTADOS DE LISTA — exigência do CRIVO X.0
// ─────────────────────────────────────────────────────────────────────────────

export function Vazio({ titulo, dica }: { titulo: string; dica: string }) {
  return (
    <div className="relative isolate overflow-hidden border border-dashed border-line px-5 py-10 text-center">
      {/* ⭐ Papel de projeto por baixo do vazio. Tela sem dado não precisa ser
          tela sem superfície — e um vazio com chão não parece defeito. */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[url('/img/textura-projeto.webp')] bg-cover bg-center opacity-[0.06]"
      />
      <p className="text-[15px] text-chalk">{titulo}</p>
      <p className="mt-1.5 text-[13px] text-concrete">{dica}</p>
    </div>
  );
}

export function Erro({
  titulo,
  dica,
  aoTentar,
}: {
  titulo: string;
  dica: string;
  aoTentar?: () => void;
}) {
  return (
    <div className="border border-rust/50 bg-rust/8 px-5 py-8 text-center">
      <Prumo className="mx-auto mb-2 h-6 w-6 text-rust-bright" />
      <p className="text-[15px] text-chalk">{titulo}</p>
      <p className="mt-1.5 text-[13px] text-concrete">{dica}</p>
      {aoTentar ? (
        <div className="mt-4 flex justify-center">
          <Botao onClick={aoTentar}>Tentar de novo</Botao>
        </div>
      ) : null}
    </div>
  );
}

export function Carregando({ linhas = 3 }: { linhas?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className="h-12 animate-pulse border border-line bg-surface-2" />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRMAÇÃO — nenhuma ação destrutiva acontece com um clique só
// ─────────────────────────────────────────────────────────────────────────────

export function Confirmar({
  aberto,
  titulo,
  descricao,
  rotuloMotivo,
  rotuloAcao,
  aoConfirmar,
  aoFechar,
}: {
  aberto: boolean;
  titulo: string;
  descricao: string;
  rotuloMotivo?: string;
  rotuloAcao: string;
  aoConfirmar: (motivo: string) => void;
  aoFechar: () => void;
}) {
  const [motivo, setMotivo] = useState('');
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) {
      setMotivo('');
      return;
    }
    caixa.current?.focus();
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  const exigeMotivo = Boolean(rotuloMotivo);
  const podeSeguir = !exigeMotivo || motivo.trim().length >= 4;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-obsidian/85 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={aoFechar}
    >
      <div
        ref={caixa}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md border border-line-strong bg-surface p-5"
      >
        <h3 className="placa text-[14px] text-chalk">{titulo}</h3>
        <p className="mt-2 text-[14px] text-concrete">{descricao}</p>

        {exigeMotivo ? (
          <div className="mt-4">
            <Campo
              etiqueta={rotuloMotivo!}
              valor={motivo}
              onChange={setMotivo}
              multilinha
              placeholder="Escreva o motivo — ele fica no livro, à vista de todos."
            />
            {!podeSeguir ? (
              <p className="mt-1.5 text-[12px] text-concrete-dim">
                O motivo é obrigatório. Nada se apaga sem porquê.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <Botao
            tom="perigo"
            larga
            disabled={!podeSeguir}
            onClick={() => {
              aoConfirmar(motivo.trim());
              aoFechar();
            }}
          >
            {rotuloAcao}
          </Botao>
          <Botao tom="secundario" larga onClick={aoFechar}>
            Voltar
          </Botao>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// v2 — O CABEÇALHO DE SALA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Toda sala abre igual: o nome em placa de obra, uma linha que diz para que ela
 * serve, e — quando faz sentido — um número grande à direita. ⛔ Nunca uma
 * fileira de cartões iguais só para preencher (docs/DESIGN.md §6, defeito 1).
 */
export function Sala({
  titulo,
  linha,
  numero,
  rotuloNumero,
  tomNumero,
  acao,
}: {
  titulo: string;
  linha: string;
  numero?: string;
  rotuloNumero?: string;
  tomNumero?: 'gold' | 'rust' | 'chalk' | 'olive';
  acao?: React.ReactNode;
}) {
  const cor =
    tomNumero === 'rust'
      ? 'text-rust-bright'
      : tomNumero === 'olive'
        ? 'text-olive-bright'
        : tomNumero === 'chalk'
          ? 'text-chalk'
          : 'text-gold-bright';
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
      <div className="min-w-0">
        <h1 className="placa text-[19px] leading-tight text-chalk sm:text-[22px]">{titulo}</h1>
        <p className="mt-1.5 max-w-2xl text-[14px] leading-snug text-concrete">{linha}</p>
      </div>
      {numero ? (
        <div className="text-right">
          {rotuloNumero ? (
            <div className="placa text-[10px] text-concrete-dim">{rotuloNumero}</div>
          ) : null}
          <div className={`num text-[28px] leading-none sm:text-[34px] ${cor}`}>{numero}</div>
        </div>
      ) : null}
      {acao}
    </header>
  );
}

/** Uma linha de lista: rótulo à esquerda, valor à direita, etiquetas embaixo. */
export function Linha({
  titulo,
  subtitulo,
  valor,
  valorTom,
  etiquetas,
  acao,
}: {
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  valor?: string;
  valorTom?: 'rust' | 'olive' | 'gold';
  etiquetas?: React.ReactNode;
  acao?: React.ReactNode;
}) {
  const cor =
    valorTom === 'rust'
      ? 'text-rust-bright'
      : valorTom === 'olive'
        ? 'text-olive-bright'
        : valorTom === 'gold'
          ? 'text-gold-bright'
          : 'text-chalk';
  return (
    <div className="border-b border-line px-4 py-3 last:border-0">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[15px] leading-snug text-chalk">{titulo}</div>
          {subtitulo ? (
            <div className="mt-0.5 text-[12px] text-concrete-dim">{subtitulo}</div>
          ) : null}
        </div>
        {valor ? <div className={`num shrink-0 text-[15px] ${cor}`}>{valor}</div> : null}
        {acao ? <div className="shrink-0">{acao}</div> : null}
      </div>
      {etiquetas ? <div className="mt-2 flex flex-wrap gap-2">{etiquetas}</div> : null}
    </div>
  );
}
