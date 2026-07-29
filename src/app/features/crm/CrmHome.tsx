// CrmHome.tsx
//
// Responsabilidade:
// Composição principal do CRM — análoga a `DashboardHome` (Dashboard,
// Sprint 28/31).
//
// Sprint 33A (Adaptive CRM Dashboard Integration): reescrita para se
// integrar à navegação oficial da plataforma. Antes, a navegação entre
// seções do CRM era estado local (`useState<CrmSection>`) e a única
// URL existente era `/crm`; agora cada seção é uma rota real
// (`/crm/clientes`, `/crm/empresas`, ...) e este componente é o
// elemento de rota PAI — renderiza o mesmo cabeçalho do Dashboard
// (`DashboardHeader`, reutilizado tal como está — não tem nenhum
// acoplamento a dados do Dashboard) e o mesmo menu lateral global
// (`GlobalNavSidebar`, extraído de `DashboardSidebar` nesta mesma
// Sprint), garantindo "o mesmo layout do Dashboard" pedido pelo
// ESCOPO. O conteúdo de cada seção chega via `<Outlet />` (rotas
// filhas definidas em `app/router/routes.tsx`).
//
// `CrmSidebar` (Sprint 32 — submenu interno de 7 itens) deixou de ser
// renderizado aqui: o grupo "CRM" do `GlobalNavSidebar` agora expõe os
// mesmos 7 subitens como navegação real, e manter os dois menus ao
// mesmo tempo seria uma duplicação confusa (não pedida pelo ESCOPO).
// O componente `CrmSidebar.tsx` permanece intocado e ainda exportado,
// caso uma composição futura precise dele.

import { Outlet, useLocation } from 'react-router-dom';
import { Flex, Container, Divider } from '@/app/primitives';
import { DashboardHeader, GlobalNavSidebar } from '@/app/features/dashboard';
import { CrmBreadcrumb } from './components';
import type { CrmSection } from './components';

const TITLE_BY_SECTION: Record<CrmSection, string> = {
  overview: 'Painel',
  companies: 'Empresas',
  clients: 'Clientes',
  deals: 'Negócios',
  pipeline: 'Pipeline',
  agenda: 'Agenda',
  activities: 'Atividades',
};

function sectionFromPathname(pathname: string): CrmSection {
  if (pathname.startsWith('/crm/clientes')) return 'clients';
  if (pathname.startsWith('/crm/empresas')) return 'companies';
  if (pathname.startsWith('/crm/negocios')) return 'deals';
  if (pathname.startsWith('/crm/pipeline')) return 'pipeline';
  if (pathname.startsWith('/crm/atividades')) return 'activities';
  if (pathname.startsWith('/crm/agenda')) return 'agenda';
  return 'overview';
}

export function CrmHome() {
  const location = useLocation();
  const section = sectionFromPathname(location.pathname);

  return (
    <Container maxWidth="wide">
      <Flex direction="column" gap={16}>
        <DashboardHeader title="CRM" />
        <Divider />

        <Flex gap={24} align="flex-start">
          <div style={{ width: 232, flexShrink: 0 }}>
            <GlobalNavSidebar />
          </div>
          <Divider orientation="vertical" />

          <Flex direction="column" gap={16} style={{ flex: 1, minWidth: 0 }}>
            <CrmBreadcrumb section={section} sectionLabel={TITLE_BY_SECTION[section]} />
            <Outlet />
          </Flex>
        </Flex>
      </Flex>
    </Container>
  );
}
