// DashboardSidebar.tsx
//
// Responsabilidade:
// Painel lateral específico do Dashboard. Distinto de
// `@/app/shell/Sidebar` (navegação global da aplicação, Sprint 27, não
// alterada por esta Sprint); este painel vive dentro do conteúdo do
// Dashboard.
//
// Sprint 31 (evolução visual — "Sidebar"): ganhou uma seção de
// "Navegação" com os 18 módulos da plataforma — puramente visual,
// nenhum item navega de verdade (nenhuma rota conectada, conforme o
// ESCOPO). A seção "Widgets" (mostrar/ocultar widget,
// `layout.setVisibility`, real e funcional desde a Sprint 28) foi
// mantida sem alteração de comportamento.
//
// Sprint 31B (Premium Dark Theme & UI Polish): fundo de "chrome"
// próprio (distinto do fundo de Card/Widget), padding/raio
// consistentes, separador entre seções com respiro, item ativo com
// indicador de borda lateral.
//
// Sprint 31C (Visual Identity Refinement): fundo de chrome com um tom
// de "azul petróleo" intermediário.
//
// Sprint 31D (Adaptive Blue Design System — identidade oficial):
// rótulos de categoria usam `--ads-color-text-auxiliary` (novo slot de
// tema, ver `types/theme.ts`) — nenhum hex literal permanece neste
// arquivo. Item ativo com fundo roxo sólido (`--ads-color-primary`,
// herdado de `.ads-list-item[data-active]` em `branding.css`). Todos os
// rótulos de navegação traduzidos para Português (Brasil).
//
// Sprint 31E (Adaptive Blue Refinement): fundo passou a consumir
// `--ads-color-sidebar` — na paleta refinada a Sidebar tem um tom
// próprio, distinto de `background` (conteúdo) e `chrome` (Header).
//
// Sprint 33A (Adaptive CRM Dashboard Integration): o bloco "Navegação"
// (os 18 módulos) foi extraído para `GlobalNavSidebar` — reutilizado
// também pela feature CRM, para que ela compartilhe o mesmo menu
// lateral global (ver `crm/CrmHome.tsx`). Saída visual desta rota
// inalterada; apenas reorganização de código. A seção "Widgets"
// permanece aqui, exatamente como antes.

import { Stack, Text, Divider } from '@/app/primitives';
import { Checkbox } from '@/design-system/components';
import type { UseDashboardResult } from '../hooks';
import { GlobalNavSidebar } from './GlobalNavSidebar';

export interface DashboardSidebarProps {
  dashboard: UseDashboardResult;
}

export function DashboardSidebar(props: DashboardSidebarProps) {
  const { dashboard } = props;
  const visibilityByWidgetId = new Map(
    dashboard.layout.snapshot.entries.map((entry) => [entry.widgetId, entry.visible]),
  );

  return (
    <aside
      aria-label="Navegação do Painel"
      style={{
        width: 232,
        flexShrink: 0,
        backgroundColor: 'var(--ads-color-sidebar)',
        border: '1px solid var(--ads-color-border)',
        borderRadius: 'var(--ads-radius-lg)',
        padding: 16,
      }}
    >
      <Stack gap={24}>
        <GlobalNavSidebar />

        <Divider />

        <Stack gap={8}>
          <Text variant="label" style={{ letterSpacing: '0.04em', color: 'var(--ads-color-text-auxiliary)' }}>
            Widgets
          </Text>
          <Stack gap={8}>
            {dashboard.definitions.map((definition) => {
              const visible = visibilityByWidgetId.get(definition.id) ?? true;

              return (
                <Checkbox
                  key={definition.id}
                  checked={visible}
                  onChange={(checked) => dashboard.layout.setVisibility(definition.id, checked)}
                  label={definition.title}
                />
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </aside>
  );
}
