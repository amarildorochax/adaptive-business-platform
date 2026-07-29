// LoadingPage.tsx
//
// Responsabilidade:
// Página de fallback usada como `<Suspense>` durante o carregamento
// lazy de rotas. Infraestrutura de roteamento, não uma página de
// negócio.

import { Loading } from '@/design-system/components';

export function LoadingPage() {
  return <Loading label="Carregando página…" />;
}
