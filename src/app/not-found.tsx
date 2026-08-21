import Link from 'next/link';

/** Página que não existe — em português, com uma saída. */
export default function NaoEncontrada() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="placa text-[16px] text-chalk">Esta página não existe.</h1>
      <p className="text-[14px] text-concrete">
        A demonstração tem cinco telas. Volte ao painel e siga por lá.
      </p>
      <Link
        href="/painel"
        className="placa inline-flex min-h-[44px] items-center border border-gold bg-gold px-4 text-[12px] text-obsidian"
      >
        Ir para o painel
      </Link>
      <p className="mt-6 text-[11px] text-concrete-dim">
        Ambiente de demonstração · dados fictícios
      </p>
    </main>
  );
}
