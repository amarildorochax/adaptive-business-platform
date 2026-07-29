// NotFoundPage.tsx
//
// Responsabilidade:
// Página de fallback para rotas inexistentes (`*`). Infraestrutura de
// roteamento, não uma "página funcional" de negócio.

import { EmptyState } from '@/design-system/components';

export function NotFoundPage() {
  return <EmptyState title="Página não encontrada" description="O endereço acessado não existe ou foi movido." />;
}
