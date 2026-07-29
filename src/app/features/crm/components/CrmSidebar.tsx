// CrmSidebar.tsx
//
// Responsabilidade:
// Navegação interna do CRM (Painel/Empresas/Clientes/Negócios/Pipeline/
// Agenda/Atividades) — distinta de `@/app/shell/Sidebar` (navegação
// global, não alterada) e de
// `@/app/features/dashboard/panels/DashboardSidebar` (painel lateral do
// Dashboard, protegido nesta Sprint e NÃO importado/modificado aqui).
// Segue o mesmo padrão visual (fundo `--ads-color-sidebar`, rótulo de
// seção em `--ads-color-text-auxiliary`, item ativo via
// `.ads-list-item[data-active]`), mas com navegação controlada
// localmente por `CrmHome` (sem rota aninhada — mesmo padrão do
// Dashboard, cujas seções também são estado local, não rotas).

import type { IconName } from '@/design-system/foundations';
import { Stack, Flex, Text, Icon } from '@/app/primitives';

export type CrmSection = 'overview' | 'companies' | 'clients' | 'deals' | 'pipeline' | 'activities' | 'agenda';

interface CrmNavEntry {
  key: CrmSection;
  label: string;
  icon: IconName;
}

const CRM_NAVIGATION_ENTRIES: CrmNavEntry[] = [
  { key: 'overview', label: 'Painel', icon: 'home' },
  { key: 'companies', label: 'Empresas', icon: 'module-crm' },
  { key: 'clients', label: 'Clientes', icon: 'user' },
  { key: 'deals', label: 'Negócios', icon: 'module-finance' },
  { key: 'pipeline', label: 'Pipeline', icon: 'module-automation' },
  { key: 'agenda', label: 'Agenda', icon: 'settings' },
  { key: 'activities', label: 'Atividades', icon: 'edit' },
];

export interface CrmSidebarProps {
  active: CrmSection;
  onChange: (section: CrmSection) => void;
}

export function CrmSidebar(props: CrmSidebarProps) {
  const { active, onChange } = props;

  return (
    <aside
      aria-label="Navegação do CRM"
      style={{
        width: 220,
        flexShrink: 0,
        backgroundColor: 'var(--ads-color-sidebar)',
        border: '1px solid var(--ads-color-border)',
        borderRadius: 'var(--ads-radius-lg)',
        padding: 16,
      }}
    >
      <Stack gap={8}>
        <Text variant="label" style={{ letterSpacing: '0.04em', color: 'var(--ads-color-text-auxiliary)' }}>
          CRM
        </Text>
        <nav aria-label="Seções do CRM">
          <Stack gap={2}>
            {CRM_NAVIGATION_ENTRIES.map((entry) => (
              <div
                key={entry.key}
                role="link"
                aria-current={entry.key === active ? 'page' : undefined}
                data-active={entry.key === active}
                tabIndex={0}
                className="ads-list-item ads-transition ads-focusable"
                style={{ padding: '8px 10px', cursor: 'pointer' }}
                onClick={() => onChange(entry.key)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    onChange(entry.key);
                  }
                }}
              >
                <Flex align="center" gap={8}>
                  <Icon name={entry.icon} size={16} />
                  <Text variant="caption">{entry.label}</Text>
                </Flex>
              </div>
            ))}
          </Stack>
        </nav>
      </Stack>
    </aside>
  );
}
