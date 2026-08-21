/**
 * ⚖️ O CARTÃO HONESTO (Lei 7).
 *
 * Onde o produto real vai INTEGRAR com outro sistema — nota fiscal, eSocial,
 * PNCP, banco —, a vitrine mostra isto: uma placa que diz o que acontece, sem
 * botão. ⛔ Nunca um botão morto, nunca uma tela que finge integração.
 *
 * Regra da casa (Lei 3): documento com força legal emitido ou validado pelo
 * Estado integra-se, não se constrói.
 */

import { Tomada } from './icones';

export function CartaoIntegracao({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="honesto relative isolate flex items-start gap-3 overflow-hidden p-4">
      {/* ⭐ O chão de concreto. Textura, não ilustração: dá superfície à placa
          sem inventar um botão. Vai como fundo de CSS, não como <img> — é
          decoração pura e não deve virar item da árvore de acessibilidade. */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[url('/img/textura-concreto.webp')] bg-cover bg-center opacity-[0.07]"
      />
      <Tomada className="mt-0.5 h-5 w-5 shrink-0 text-concrete-dim" />
      <div>
        <p className="placa text-[11px] text-concrete">{titulo}</p>
        <p className="mt-1 text-[13px] leading-snug text-concrete-dim">{descricao}</p>
      </div>
    </div>
  );
}
