// DashboardPage.tsx
//
// Responsabilidade:
// Composição de rota do Dashboard Premium (Auditoria pós-Sprint 31) —
// liga `DashboardHome` (feature, `@/app/features/dashboard`) à rota
// raiz da aplicação. Segue o contrato de `pages/` estabelecido na
// Sprint 27A (Correção 02): apenas compõe um Layout com uma Feature,
// sem lógica própria.

import { DashboardHome } from '@/app/features/dashboard';

export function DashboardPage() {
  return <DashboardHome />;
}
