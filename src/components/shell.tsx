'use client';

/**
 * A CASCA — navegação, busca e o selo do rodapé.
 *
 * ⚖️ Lei 7: o selo "Ambiente de demonstração · dados fictícios" é permanente e
 * não se fecha. Ninguém sai desta tela achando que viu um sistema em produção.
 *
 * CRIVO X.0: navegação por DUAS PERNAS — menu em língua de dono e busca. Quem
 * sabe o nome da obra digita; quem não sabe, navega.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMundo } from '@/lib/store';
import { PRODUTO, TENANT } from '@/lib/tenant';
import { dinheiroCurto } from '@/lib/formato';
import { ESPECIALIDADES, nomeDe } from '@/data/taxonomias';
import { Capacete, Carimbo, Lupa, Prancheta, Trena, Turma } from './icones';

const DESTINOS = [
  // `curto` é o rótulo da barra de baixo do telefone: cinco colunas de ~78px
  // não comportam "FUNCIONÁRIO" sem cortar a última letra.
  { href: '/painel', rotulo: 'Painel', curto: 'Painel', Icone: Capacete },
  { href: '/diario', rotulo: 'Diário de obra', curto: 'Diário', Icone: Prancheta },
  { href: '/diaristas', rotulo: 'Diaristas', curto: 'Turma', Icone: Turma },
  { href: '/medicoes', rotulo: 'Medições', curto: 'Medição', Icone: Trena },
  { href: '/analista', rotulo: 'Funcionário digital', curto: 'Digital', Icone: Carimbo },
] as const;

function ativo(caminho: string, href: string): boolean {
  return caminho === href || caminho.startsWith(`${href}/`);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const caminho = usePathname();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[224px_1fr]">
      {/* Coluna lateral — só no notebook. No telefone a navegação é a barra de baixo. */}
      <aside className="hidden border-r border-line bg-surface lg:flex lg:flex-col">
        <div className="border-b border-line px-5 py-5">
          <div className="placa text-[15px] tracking-[0.14em] text-gold">{PRODUTO.nome}</div>
          <div className="mt-1 text-[13px] leading-tight text-chalk">{TENANT.nome}</div>
          <div className="text-[12px] text-concrete-dim">{TENANT.cidade}</div>
        </div>
        <nav className="flex-1 p-3">
          {DESTINOS.map(({ href, rotulo, Icone }) => (
            <Link
              key={href}
              href={href}
              aria-current={ativo(caminho, href) ? 'page' : undefined}
              className={`placa mb-1 flex items-center gap-3 border px-3 py-2.5 text-[12px] transition-colors ${
                ativo(caminho, href)
                  ? 'border-gold/45 bg-gold/12 text-gold-bright'
                  : 'border-transparent text-concrete hover:text-chalk'
              }`}
            >
              <Icone className="h-5 w-5" />
              {rotulo}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line px-5 py-3 text-[11px] leading-snug text-concrete-dim">
          {PRODUTO.selo}
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <Cabecalho />
        <main className="flex-1 px-4 pb-28 pt-4 sm:px-6 lg:pb-10">{children}</main>
        <Rodape />
        <BarraInferior caminho={caminho} />
      </div>
    </div>
  );
}

function Cabecalho() {
  const [buscando, setBuscando] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-obsidian px-4 py-3 sm:px-6">
      <div className="lg:hidden">
        <div className="placa text-[13px] tracking-[0.14em] text-gold">{PRODUTO.nome}</div>
        <div className="text-[12px] leading-tight text-concrete">{TENANT.nome}</div>
      </div>
      <div className="hidden text-[13px] text-concrete lg:block">
        {TENANT.nome} · {TENANT.cidade}
      </div>
      <button
        type="button"
        onClick={() => setBuscando(true)}
        className="placa flex min-h-[40px] items-center gap-2 border border-line bg-surface px-3 text-[11px] text-concrete hover:border-line-strong hover:text-chalk"
      >
        <Lupa className="h-4 w-4" />
        Buscar
      </button>
      <Busca aberta={buscando} aoFechar={() => setBuscando(false)} />
    </header>
  );
}

interface Achado {
  readonly href: string;
  readonly titulo: string;
  readonly onde: string;
  readonly detalhe: string;
}

function Busca({ aberta, aoFechar }: { aberta: boolean; aoFechar: () => void }) {
  const mundo = useMundo();
  const router = useRouter();
  const [texto, setTexto] = useState('');
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!aberta) {
      setTexto('');
      return;
    }
    entrada.current?.focus();
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [aberta, aoFechar]);

  const achados = useMemo<Achado[]>(() => {
    const q = texto.trim().toLowerCase();
    if (q.length < 2) return [];
    const saida: Achado[] = [];

    for (const o of mundo.obras) {
      if (o.nome.toLowerCase().includes(q)) {
        saida.push({
          href: `/obras/${o.id}`,
          titulo: o.nome,
          onde: 'Obra',
          detalhe: mundo.prefeituras.find((p) => p.id === o.prefeituraId)?.nome ?? '',
        });
      }
    }
    for (const p of mundo.prestadores) {
      if (p.nome.toLowerCase().includes(q)) {
        saida.push({
          href: '/diaristas',
          titulo: p.nome,
          onde: 'Prestador',
          detalhe: nomeDe(ESPECIALIDADES, p.especialidadeId),
        });
      }
    }
    for (const m of mundo.medicoes) {
      const obra = mundo.obras.find((o) => o.id === m.obraId)!;
      const alvo = `medição ${m.numero} ${obra.nome}`.toLowerCase();
      if (alvo.includes(q)) {
        saida.push({
          href: `/medicoes/${obra.id}`,
          titulo: `Medição ${m.numero} · ${obra.nome}`,
          onde: 'Medição',
          detalhe: `aceito ${dinheiroCurto(m.aceitoCents)}`,
        });
      }
    }
    return saida.slice(0, 12);
  }, [texto, mundo]);

  if (!aberta) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-obsidian/90 p-4 pt-16"
      role="dialog"
      aria-modal="true"
      aria-label="Buscar"
      onClick={aoFechar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl border border-line-strong bg-surface"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Lupa className="h-5 w-5 text-concrete" />
          <input
            ref={entrada}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Obra, prestador ou número da medição"
            className="w-full bg-transparent py-4 text-[16px] text-chalk outline-none placeholder:text-concrete-dim"
          />
        </div>

        {texto.trim().length < 2 ? (
          <p className="px-4 py-6 text-[13px] text-concrete-dim">
            Digite ao menos duas letras. Quem sabe o nome digita; quem não sabe usa o menu.
          </p>
        ) : achados.length === 0 ? (
          <p className="px-4 py-6 text-[13px] text-concrete">
            Nada com esse nome nesta demonstração.
          </p>
        ) : (
          <ul className="max-h-[52vh] overflow-y-auto">
            {achados.map((a, i) => (
              <li key={`${a.href}-${i}`}>
                <button
                  type="button"
                  onClick={() => {
                    aoFechar();
                    router.push(a.href);
                  }}
                  className="flex w-full items-baseline justify-between gap-3 border-b border-line px-4 py-3 text-left hover:bg-surface-2"
                >
                  <span>
                    <span className="block text-[15px] text-chalk">{a.titulo}</span>
                    <span className="block text-[12px] text-concrete-dim">{a.detalhe}</span>
                  </span>
                  <span className="placa shrink-0 text-[10px] text-concrete-dim">{a.onde}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BarraInferior({ caminho }: { caminho: string }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface lg:hidden"
      aria-label="Navegação"
    >
      {DESTINOS.map(({ href, rotulo, curto, Icone }) => (
        <Link
          key={href}
          href={href}
          aria-label={rotulo}
          aria-current={ativo(caminho, href) ? 'page' : undefined}
          className={`flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 py-2 ${
            ativo(caminho, href) ? 'text-gold-bright' : 'text-concrete'
          }`}
        >
          <Icone className="h-5 w-5" />
          <span className="placa text-[10px] leading-none tracking-normal">{curto}</span>
        </Link>
      ))}
    </nav>
  );
}

function Rodape() {
  return (
    <footer className="border-t border-line px-4 py-3 text-[11px] text-concrete-dim sm:px-6">
      {PRODUTO.selo}
    </footer>
  );
}
