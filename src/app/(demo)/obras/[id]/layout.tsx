/**
 * ⭐ POR QUE EXISTE UM LAYOUT AQUI, SE ELE SÓ DEVOLVE O FILHO.
 *
 * A página da obra é um componente de cliente (usa `useParams`), e componente
 * de cliente não pode declarar quais endereços existem. Sem essa declaração o
 * framework monta a página a cada visita, e a primeira pintura carrega o custo
 * de um servidor pensando. As obras da vitrine são três e são fixas: declaradas
 * aqui, as três páginas saem prontas do build.
 *
 * ⛔ No produto isto NÃO se repete: lá as obras são linhas do banco de cada
 * empresa e mudam o tempo todo. Isto é técnica de vitrine, não desenho de
 * produto — está registrado assim em `docs/MIGRACAO.md`.
 */

import { MUNDO } from '@/data/seed';

export function generateStaticParams(): { id: string }[] {
  return MUNDO.obras.map((o) => ({ id: o.id }));
}

export default function LayoutDaObra({ children }: { children: React.ReactNode }) {
  return children;
}
