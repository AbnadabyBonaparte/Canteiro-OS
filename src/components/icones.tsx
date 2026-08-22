/**
 * ÍCONES DO OFÍCIO — desenhados aqui, traço de 1,5px.
 *
 * ⛔ Nada de biblioteca genérica de ERP (gráfico de barras, engrenagem,
 * "sparkles" de IA) e ⛔ nada de emoji na interface — os dois são o default de
 * IA que docs/DESIGN.md §6 recusa. O funcionário digital é um CARIMBO, não uma
 * varinha: ele confere e assina, não faz mágica.
 */

interface P {
  readonly className?: string;
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

/** Capacete de obra — o painel, a visão de quem toca a obra. */
export function Capacete({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 16.5h17" />
      <path d="M5 16.5v-1.2A7 7 0 0 1 12 8.3a7 7 0 0 1 7 7v1.2" />
      <path d="M10 8.7V5.4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3.3" />
      <path d="M2.8 16.5v1.6a1 1 0 0 0 1 1h16.4a1 1 0 0 0 1-1v-1.6" />
    </svg>
  );
}

/** Prancheta — o diário de obra, o livro do dia. */
export function Prancheta({ className }: P) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="4.5" width="16" height="16" rx="1.2" />
      <path d="M8.5 4.5V3.2a.7.7 0 0 1 .7-.7h5.6a.7.7 0 0 1 .7.7v1.3" />
      <path d="M8 10h8M8 13.5h8M8 17h5" />
    </svg>
  );
}

/** Turma — os parceiros de empreita. Capacetes em fila, não avatares. */
export function Turma({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 15.5h6M3.5 15.5v-.7a2.5 2.5 0 0 1 5 0v.7" />
      <path d="M9 19.5h12M10 19.5v-1a4 4 0 0 1 8 0v1" />
      <path d="M13 9.2V7.6a.6.6 0 0 1 .6-.6h.8a.6.6 0 0 1 .6.6v1.6" />
      <path d="M6 12.6v-.8a.5.5 0 0 1 .5-.5h.6a.5.5 0 0 1 .5.5v.8" />
    </svg>
  );
}

/** Trena — a medição. É a assinatura do produto em miniatura. */
export function Trena({ className }: P) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="7.5" width="19" height="9" rx="1" />
      <path d="M6 16.5v-3M9 16.5v-4.5M12 16.5v-3M15 16.5v-4.5M18 16.5v-3" />
    </svg>
  );
}

/** Carimbo — o funcionário digital. Confere e assina; não inventa. */
export function Carimbo({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 19.5h15" />
      <rect x="4.5" y="14.5" width="15" height="3.2" rx="0.8" />
      <path d="M8 14.5v-1.6a2 2 0 0 1 1.2-1.8c.9-.4 1.3-1 1.1-1.9l-.5-2.6A1.6 1.6 0 0 1 11.4 4.7h1.2a1.6 1.6 0 0 1 1.6 1.9l-.5 2.6c-.2.9.2 1.5 1.1 1.9a2 2 0 0 1 1.2 1.8v1.6" />
    </svg>
  );
}

/** Lupa — a busca. Universal; não há como reinventá-la sem atrapalhar. */
export function Lupa({ className }: P) {
  return (
    <svg {...base} className={className}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l4.5 4.5" />
    </svg>
  );
}

/** Prumo — o alerta. O fio que denuncia o que está fora de esquadro. */
export function Prumo({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2.5v10" />
      <path d="M8.5 12.5h7L12 21z" />
    </svg>
  );
}

/** Câmera — a foto do diário. */
export function Camera({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M3 8.5h3.2l1.4-2h7.8l1.4 2H21v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

/** Microfone — a observação ditada. */
export function Microfone({ className }: P) {
  return (
    <svg {...base} className={className}>
      <rect x="9.5" y="2.5" width="5" height="10" rx="2.5" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v4M9 21h6" />
    </svg>
  );
}

/** Ficha — o dossiê exportável e o documento com validade. */
export function Ficha({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M5 3.5h9l5 5v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1z" />
      <path d="M14 3.5v5h5" />
      <path d="M7.5 13h9M7.5 16.5h6" />
    </svg>
  );
}

/** Seta — voltar e avançar. */
export function Seta({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M9 5.5l6.5 6.5L9 18.5" />
    </svg>
  );
}

/** Tomada — o cartão honesto: aqui o produto real integra com outro sistema. */
export function Tomada({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M9 3v5M15 3v5" />
      <path d="M6 8h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6z" />
      <path d="M12 17v4" />
    </svg>
  );
}

/** Selo — o contrato administrativo e seus aditivos. */
export function Selo({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M6 3.5h8.5L19 8v12.5H6z" />
      <path d="M14.5 3.5V8H19" />
      <circle cx="12" cy="14" r="2.6" />
      <path d="M10.4 16.2l-.6 3.3 2.2-1.2 2.2 1.2-.6-3.3" />
    </svg>
  );
}

/** Balança — a fiscalização e o que vem do órgão. */
export function Balanca({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5v17M7 20.5h10" />
      <path d="M4 8.5h16" />
      <path d="M4 8.5L2 14h4zM20 8.5L18 14h4z" />
    </svg>
  );
}

/** Carrinho — compras e materiais. */
export function Carrinho({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 4h2l2.2 10.4a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L20 7H5" />
      <circle cx="9" cy="19.5" r="1.3" />
      <circle cx="17" cy="19.5" r="1.3" />
    </svg>
  );
}

/** Cofre — o financeiro por obra. */
export function Cofre({ className }: P) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4" width="18" height="16" rx="1.4" />
      <circle cx="11" cy="12" r="3.6" />
      <path d="M11 8.4v1.2M11 14.4v1.2M7.4 12h1.2M13.4 12h1.2" />
      <path d="M18 9v6" />
    </svg>
  );
}

/** Colete — a segurança do trabalho. */
export function Colete({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M9 3.5L12 6l3-2.5 3.5 2v15h-13v-15z" />
      <path d="M12 6v14.5" />
      <path d="M5.8 11.5h4.4M13.8 11.5h4.4" />
    </svg>
  );
}

/** Engrenagem dentada de máquina — os equipamentos (não é "configurações"). */
export function Maquina({ className }: P) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="9" width="12" height="7" rx="1" />
      <path d="M14.5 11h3l4 3v2h-7z" />
      <circle cx="6.5" cy="18" r="2.2" />
      <circle cx="17.5" cy="18" r="2.2" />
      <path d="M5 9V6.5h5V9" />
    </svg>
  );
}

/** Réguas cruzadas — as configurações e as taxonomias do tenant. */
export function Esquadro({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M4 3.5v17h17" />
      <path d="M4 20.5L20.5 4" />
      <path d="M7.5 20.5v-2.5M11 20.5v-3.5M14.5 20.5v-2.5" />
    </svg>
  );
}

/** Ampulheta — a resolutividade, que mede idade de pendência. */
export function Ampulheta({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M6 3.5h12M6 20.5h12" />
      <path d="M7.5 3.5c0 4 4.5 5.2 4.5 8.5s-4.5 4.5-4.5 8.5" />
      <path d="M16.5 3.5c0 4-4.5 5.2-4.5 8.5s4.5 4.5 4.5 8.5" />
    </svg>
  );
}

/** Casa em construção — a capa e as obras. */
export function Obra({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 20.5h19" />
      <path d="M4.5 20.5V10l7.5-5.5 7.5 5.5v10.5" />
      <path d="M9 20.5v-6h6v6" />
      <path d="M4.5 10h15" />
    </svg>
  );
}

/** Caminhão de carroceria — a remessa: o que sai do pátio com guia. */
export function Caminhao({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 6.5h11v10h-11z" />
      <path d="M13.5 10h3.5l3.5 3v3.5h-7z" />
      <circle cx="6.5" cy="18.5" r="2" />
      <circle cx="17" cy="18.5" r="2" />
      <path d="M8.5 18.5h6.5" />
    </svg>
  );
}
