'use client';

/**
 * O ESTADO DE ERRO — exigência do CRIVO X.0.
 *
 * Nenhuma tela desta vitrine pode quebrar em branco na frente do cliente. Se
 * algo estourar, ele vê uma frase em português e um botão para tentar de novo —
 * ⛔ nunca uma pilha de erro, nunca um texto de dev.
 */

import { useEffect } from 'react';
import { Erro } from '@/components/ui';

export default function ErroDaTela({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // O detalhe técnico vai para o console do navegador, nunca para a tela.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl py-10">
      <Erro
        titulo="Esta tela não abriu."
        dica="Nada foi perdido — esta é uma demonstração e o estado volta ao início a cada carregamento."
        aoTentar={reset}
      />
    </div>
  );
}
