/**
 * O ESTADO DE CARREGANDO — exigência do CRIVO X.0.
 *
 * Na vitrine ele quase não aparece (o mundo está em memória), e existe assim
 * mesmo: uma tela que pisca em branco entre uma rota e outra parece defeito na
 * frente do cliente.
 */

import { Carregando } from '@/components/ui';

export default function CarregandoTela() {
  return (
    <div className="mx-auto max-w-6xl py-6">
      <Carregando linhas={5} />
    </div>
  );
}
