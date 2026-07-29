// CrmPage.tsx
//
// Responsabilidade:
// Composição de rota do CRM (Sprint 32) — liga `CrmHome` (feature,
// `@/app/features/crm`) à rota `/crm`. Segue o contrato de `pages/`
// estabelecido na Sprint 27A (Correção 02): apenas compõe um Layout com
// uma Feature, sem lógica própria.
//
// Sprint 33A: `CrmHome` passou a ser o elemento de rota PAI (renderiza
// `<Outlet />`) — `/crm/clientes`, `/crm/empresas` etc. são rotas
// filhas (ver `app/router/routes.tsx`), cada uma composta por um
// `Crm*Page.tsx` próprio. Este arquivo não mudou: continua apenas
// ligando `CrmHome` à rota `/crm`.

import { CrmHome } from '@/app/features/crm';

export function CrmPage() {
  return <CrmHome />;
}
