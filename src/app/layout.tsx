import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, Oswald } from 'next/font/google';
import { PRODUTO, TENANT } from '@/lib/tenant';
import './globals.css';

/**
 * As três fontes da casa (docs/DESIGN.md §4):
 * Oswald   — a placa de obra. Título de seção, caixa alta.
 * Plex Sans — o corpo. Desenhada para legibilidade em tela ruim e sol forte.
 * Plex Mono — o número. Tabular de verdade: a coluna de dinheiro alinha.
 * ⛔ Nada de Inter/Geist: é o default de IA e não diz nada (DESIGN.md §6).
 */
const display = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--fonte-display',
  display: 'swap',
});

const corpo = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--fonte-corpo',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--fonte-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${PRODUTO.nome} · ${TENANT.nome}`,
  description:
    'Canteiro OS — o sistema de obras da ALSHAM. Ambiente de demonstração com dados fictícios.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#0A0E1A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${corpo.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
