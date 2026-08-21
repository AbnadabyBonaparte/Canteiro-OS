'use client';

/**
 * A CASCA — navegação por SETORES, busca e o selo do rodapé.
 *
 * ⚖️ Lei 7: o selo "Ambiente de demonstração · dados fictícios" é permanente e
 * não se fecha. Ninguém sai desta tela achando que viu um sistema em produção.
 *
 * CRIVO X.0: navegação por DUAS PERNAS — menu em língua de dono, agrupado do
 * jeito que a empresa divide o próprio trabalho, e busca global. Quem sabe o
 * nome digita; quem não sabe, navega.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMundo } from '@/lib/store';
import { PRODUTO, TENANT } from '@/lib/tenant';
import { dinheiroCurto, vencimento } from '@/lib/formato';
import { ESPECIALIDADES, TIPOS_DE_DOCUMENTO, nomeDe } from '@/data/taxonomias';
import { diasAte } from '@/data/seed';
import {
  Ampulheta,
  Balanca,
  Capacete,
  Carimbo,
  Carrinho,
  Cofre,
  Colete,
  Esquadro,
  Ficha,
  Lupa,
  Maquina,
  Obra,
  Prancheta,
  Selo,
  Trena,
  Turma,
} from './icones';

interface Destino {
  readonly href: string;
  readonly rotulo: string;
  readonly Icone: (p: { className?: string }) => React.JSX.Element;
}

interface Setor {
  readonly nome: string;
  readonly destinos: readonly Destino[];
}

/** Os setores, na ordem em que uma empreiteira olha o próprio dia. */
const SETORES: readonly Setor[] = [
  {
    nome: 'Direção',
    destinos: [
      { href: '/', rotulo: 'Capa', Icone: Obra },
      { href: '/painel', rotulo: 'Painel', Icone: Capacete },
      { href: '/resolutividade', rotulo: 'Resolutividade', Icone: Ampulheta },
    ],
  },
  {
    nome: 'Obras',
    destinos: [
      { href: '/obras', rotulo: 'Obras', Icone: Obra },
      { href: '/contratos', rotulo: 'Contratos e aditivos', Icone: Selo },
      { href: '/medicoes', rotulo: 'Medições', Icone: Trena },
      { href: '/fiscalizacao', rotulo: 'Fiscalização', Icone: Balanca },
      { href: '/diario', rotulo: 'Diário de obra', Icone: Prancheta },
    ],
  },
  {
    nome: 'Pessoas',
    destinos: [
      { href: '/empreiteiros', rotulo: 'Empreiteiros', Icone: Turma },
      { href: '/equipe', rotulo: 'Equipe própria', Icone: Capacete },
      { href: '/seguranca', rotulo: 'Segurança do trabalho', Icone: Colete },
    ],
  },
  {
    nome: 'Suprimentos',
    destinos: [
      { href: '/compras', rotulo: 'Compras e materiais', Icone: Carrinho },
      { href: '/fornecedores', rotulo: 'Fornecedores', Icone: Carrinho },
      { href: '/equipamentos', rotulo: 'Equipamentos', Icone: Maquina },
    ],
  },
  {
    nome: 'Financeiro',
    destinos: [
      { href: '/financeiro', rotulo: 'Caixa por obra', Icone: Cofre },
      { href: '/relatorios', rotulo: 'Relatórios', Icone: Ficha },
    ],
  },
  {
    nome: 'Documentos',
    destinos: [{ href: '/documentos', rotulo: 'Documentos e certidões', Icone: Ficha }],
  },
  {
    nome: 'Inteligência',
    destinos: [
      { href: '/analista', rotulo: 'Funcionário digital', Icone: Carimbo },
      { href: '/configuracoes', rotulo: 'Configurações', Icone: Esquadro },
    ],
  },
];

/** A barra de baixo do telefone leva os cinco de sempre; o resto vai no "Mais". */
const NO_TELEFONE: ReadonlyArray<Destino & { curto: string }> = [
  { href: '/painel', rotulo: 'Painel', curto: 'Painel', Icone: Capacete },
  { href: '/diario', rotulo: 'Diário de obra', curto: 'Diário', Icone: Prancheta },
  { href: '/empreiteiros', rotulo: 'Empreiteiros', curto: 'Empreita', Icone: Turma },
  { href: '/medicoes', rotulo: 'Medições', curto: 'Medição', Icone: Trena },
  { href: '/analista', rotulo: 'Funcionário digital', curto: 'Digital', Icone: Carimbo },
];

function ativo(caminho: string, href: string): boolean {
  if (href === '/') return caminho === '/';
  return caminho === href || caminho.startsWith(`${href}/`);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const caminho = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden border-r border-line bg-surface lg:flex lg:flex-col">
        <Link href="/" className="block border-b border-line px-5 py-5">
          <div className="placa text-[15px] tracking-[0.14em] text-gold">{PRODUTO.nome}</div>
          <div className="mt-1 text-[13px] leading-tight text-chalk">{TENANT.nome}</div>
          <div className="text-[12px] text-concrete-dim">{TENANT.cidade}</div>
        </Link>

        <nav className="flex-1 overflow-y-auto p-3">
          {SETORES.map((setor) => (
            <div key={setor.nome} className="mb-4">
              <div className="placa mb-1.5 px-3 text-[10px] text-concrete-dim">{setor.nome}</div>
              {setor.destinos.map(({ href, rotulo, Icone }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={ativo(caminho, href) ? 'page' : undefined}
                  className={`mb-0.5 flex items-center gap-3 border px-3 py-2 text-[13px] transition-colors ${
                    ativo(caminho, href)
                      ? 'border-gold/45 bg-gold/12 text-gold-bright'
                      : 'border-transparent text-concrete hover:text-chalk'
                  }`}
                >
                  <Icone className="h-4.5 w-4.5 shrink-0" />
                  <span className="truncate">{rotulo}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-line px-5 py-3 text-[11px] leading-snug text-concrete-dim">
          {PRODUTO.selo}
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <Cabecalho aoAbrirMenu={() => setMenuAberto(true)} />
        <main className="flex-1 px-4 pb-28 pt-4 sm:px-6 lg:pb-10">{children}</main>
        <Rodape />
        <BarraInferior caminho={caminho} aoAbrirMenu={() => setMenuAberto(true)} />
        <MenuDeSetores
          aberto={menuAberto}
          caminho={caminho}
          aoFechar={() => setMenuAberto(false)}
        />
      </div>
    </div>
  );
}

function Cabecalho({ aoAbrirMenu }: { aoAbrirMenu: () => void }) {
  const [buscando, setBuscando] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-obsidian px-4 py-3 sm:px-6">
      <Link href="/" className="lg:hidden">
        <div className="placa text-[13px] tracking-[0.14em] text-gold">{PRODUTO.nome}</div>
        <div className="text-[12px] leading-tight text-concrete">{TENANT.nome}</div>
      </Link>
      <div className="hidden text-[13px] text-concrete lg:block">
        {TENANT.nome} · {TENANT.cidade}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={aoAbrirMenu}
          className="placa flex min-h-[40px] items-center gap-2 border border-line bg-surface px-3 text-[11px] text-concrete hover:border-line-strong hover:text-chalk lg:hidden"
        >
          Setores
        </button>
        <button
          type="button"
          onClick={() => setBuscando(true)}
          className="placa flex min-h-[40px] items-center gap-2 border border-line bg-surface px-3 text-[11px] text-concrete hover:border-line-strong hover:text-chalk"
        >
          <Lupa className="h-4 w-4" />
          Buscar
        </button>
      </div>
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

  /** A busca cobre obra, empreiteiro, fornecedor, documento, medição e contrato. */
  const achados = useMemo<Achado[]>(() => {
    const q = texto.trim().toLowerCase();
    if (q.length < 2) return [];
    const saida: Achado[] = [];
    const bate = (t: string) => t.toLowerCase().includes(q);

    for (const o of mundo.obras) {
      if (bate(o.nome)) {
        saida.push({
          href: `/obras/${o.id}`,
          titulo: o.nome,
          onde: 'Obra',
          detalhe: mundo.prefeituras.find((p) => p.id === o.prefeituraId)?.nome ?? '',
        });
      }
    }
    for (const c of mundo.contratos) {
      const obra = mundo.obras.find((o) => o.id === c.obraId)!;
      if (bate(c.numero) || bate(c.objeto)) {
        saida.push({
          href: '/contratos',
          titulo: `Contrato ${c.numero}`,
          onde: 'Contrato',
          detalhe: obra.nome,
        });
      }
    }
    for (const e of mundo.empreiteiros) {
      if (bate(e.nome)) {
        saida.push({
          href: '/empreiteiros',
          titulo: e.nome,
          onde: 'Empreiteiro',
          detalhe: nomeDe(ESPECIALIDADES, e.especialidadeId),
        });
      }
    }
    for (const f of mundo.fornecedores) {
      if (bate(f.nome)) {
        saida.push({
          href: '/fornecedores',
          titulo: f.nome,
          onde: 'Fornecedor',
          detalhe: f.cidade,
        });
      }
    }
    for (const d of mundo.documentos) {
      const tipo = nomeDe(TIPOS_DE_DOCUMENTO, d.tipoId);
      if (bate(tipo) || bate(d.titularNome)) {
        saida.push({
          href: '/documentos',
          titulo: `${tipo} · ${d.titularNome}`,
          onde: 'Documento',
          detalhe: vencimento(diasAte(d.vence)),
        });
      }
    }
    for (const m of mundo.medicoes) {
      const obra = mundo.obras.find((o) => o.id === m.obraId)!;
      if (bate(`medição ${m.numero} ${obra.nome}`)) {
        saida.push({
          href: `/medicoes/${obra.id}`,
          titulo: `Medição ${m.numero} · ${obra.nome}`,
          onde: 'Medição',
          detalhe: `aceito ${dinheiroCurto(m.aceitoCents)}`,
        });
      }
    }
    return saida.slice(0, 14);
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
            placeholder="Obra, contrato, empreiteiro, fornecedor, documento"
            className="w-full bg-transparent py-4 text-[16px] text-chalk outline-none placeholder:text-concrete-dim"
          />
        </div>

        {texto.trim().length < 2 ? (
          <p className="px-4 py-6 text-[13px] text-concrete-dim">
            Digite ao menos duas letras. Quem sabe o nome digita; quem não sabe usa os setores.
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

function MenuDeSetores({
  aberto,
  caminho,
  aoFechar,
}: {
  aberto: boolean;
  caminho: string;
  aoFechar: () => void;
}) {
  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-obsidian/90 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Setores"
      onClick={aoFechar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto mt-14 max-h-[80dvh] w-full max-w-md overflow-y-auto border border-line-strong bg-surface p-4"
      >
        {SETORES.map((setor) => (
          <div key={setor.nome} className="mb-4">
            <div className="placa mb-1.5 text-[10px] text-concrete-dim">{setor.nome}</div>
            {setor.destinos.map(({ href, rotulo, Icone }) => (
              <Link
                key={href}
                href={href}
                onClick={aoFechar}
                aria-current={ativo(caminho, href) ? 'page' : undefined}
                className={`mb-1 flex min-h-[48px] items-center gap-3 border px-3 text-[15px] ${
                  ativo(caminho, href)
                    ? 'border-gold/45 bg-gold/12 text-gold-bright'
                    : 'border-line bg-sunken text-chalk'
                }`}
              >
                <Icone className="h-5 w-5 shrink-0" />
                {rotulo}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function BarraInferior({ caminho, aoAbrirMenu }: { caminho: string; aoAbrirMenu: () => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-line bg-surface lg:hidden"
      aria-label="Navegação"
    >
      {NO_TELEFONE.map(({ href, rotulo, curto, Icone }) => (
        <Link
          key={href}
          href={href}
          /* O nome acessível PRECISA conter o texto visível — senão quem usa
             comando de voz diz "Empreita" e o leitor procura "Empreiteiros". */
          aria-label={`${curto} · ${rotulo}`}
          aria-current={ativo(caminho, href) ? 'page' : undefined}
          className={`flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 py-2 ${
            ativo(caminho, href) ? 'text-gold-bright' : 'text-concrete'
          }`}
        >
          <Icone className="h-5 w-5" />
          <span className="placa text-[10px] leading-none tracking-normal">{curto}</span>
        </Link>
      ))}
      <button
        type="button"
        onClick={aoAbrirMenu}
        aria-label="Todos os setores"
        className="flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 py-2 text-concrete"
      >
        <Esquadro className="h-5 w-5" />
        <span className="placa text-[10px] leading-none tracking-normal">Setores</span>
      </button>
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
