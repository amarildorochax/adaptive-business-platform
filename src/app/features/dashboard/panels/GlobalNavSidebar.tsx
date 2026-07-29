// GlobalNavSidebar.tsx
//
// Responsabilidade (Sprint 33A — Adaptive CRM Dashboard Integration):
// Bloco de "Navegação" (os 18 módulos da plataforma) extraído de
// `DashboardSidebar` para ficar reutilizável fora do Dashboard —
// especificamente, pela feature CRM (`crm/CrmHome.tsx`), que agora
// precisa do mesmo menu lateral global para que "todas as páginas do
// CRM utilizem o mesmo layout do Dashboard" (ESCOPO da Sprint 33A).
//
// `DashboardSidebar` passa a compor este componente em vez de
// desenhar a lista inline — a saída visual da rota `/` não muda em
// nada; apenas o código foi reorganizado.
//
// Até a Sprint 33, todos os 18 itens eram puramente visuais (nenhuma
// rota conectada, por estar fora do ESCOPO de então). A Sprint 33A
// conecta APENAS o grupo "CRM" a rotas reais (`/crm` e seus 6
// subitens) — os outros 17 itens permanecem exatamente como antes,
// sem navegação (mesmo comportamento documentado desde a Sprint 31).
//
// Esta é a primeira dependência de `react-router-dom` dentro de uma
// feature (até aqui, apenas `app/router` conhecia o router) — decisão
// deliberada: o ESCOPO exige estado ativo derivado da URL e navegação
// real entre módulos, o que não é possível sem os hooks do router.

import { useLocation, useNavigate } from 'react-router-dom';
import type { IconName } from '@/design-system/foundations';
import { Stack, Flex, Text, Icon } from '@/app/primitives';

interface NavChild {
  key: string;
  label: string;
  path: string;
}

interface NavEntry {
  key: string;
  label: string;
  icon: IconName;
  path?: string;
  children?: NavChild[];
}

const NAVIGATION_ENTRIES: NavEntry[] = [
  { key: 'dashboard', label: 'Painel', icon: 'module-dashboard', path: '/' },
  { key: 'ai-agents', label: 'Agentes IA', icon: 'module-automation' },
  {
    key: 'crm',
    label: 'CRM',
    icon: 'module-crm',
    path: '/crm',
    children: [
      { key: 'crm-overview', label: 'Painel', path: '/crm' },
      { key: 'crm-clients', label: 'Clientes', path: '/crm/clientes' },
      { key: 'crm-companies', label: 'Empresas', path: '/crm/empresas' },
      { key: 'crm-deals', label: 'Negócios', path: '/crm/negocios' },
      { key: 'crm-pipeline', label: 'Pipeline', path: '/crm/pipeline' },
      { key: 'crm-activities', label: 'Atividades', path: '/crm/atividades' },
      { key: 'crm-agenda', label: 'Agenda', path: '/crm/agenda' },
    ],
  },
  { key: 'campaigns', label: 'Campanhas', icon: 'module-marketing' },
  { key: 'marketing', label: 'Marketing', icon: 'module-marketing' },
  { key: 'finance', label: 'Financeiro', icon: 'module-finance' },
  { key: 'analytics', label: 'Análises', icon: 'module-analytics' },
  { key: 'business-intelligence', label: 'Inteligência de Negócios', icon: 'module-analytics' },
  { key: 'automation-center', label: 'Central de Automações', icon: 'module-automation' },
  { key: 'execution', label: 'Execuções', icon: 'module-automation' },
  { key: 'scheduling', label: 'Agendamentos', icon: 'module-automation' },
  { key: 'notifications', label: 'Notificações', icon: 'warning' },
  { key: 'knowledge-base', label: 'Base de Conhecimento', icon: 'info' },
  { key: 'prompt-manager', label: 'Gerenciador de Prompts', icon: 'edit' },
  { key: 'workflow-engine', label: 'Fluxos de Trabalho', icon: 'module-automation' },
  { key: 'settings', label: 'Configurações', icon: 'settings' },
  { key: 'users', label: 'Usuários', icon: 'user' },
  { key: 'system', label: 'Sistema', icon: 'settings' },
];

function isEntryActive(entry: NavEntry, pathname: string): boolean {
  if (!entry.path) return false;
  if (entry.path === '/') return pathname === '/';
  return pathname === entry.path || pathname.startsWith(`${entry.path}/`);
}

export function GlobalNavSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Stack gap={8}>
      <Text variant="label" style={{ letterSpacing: '0.04em', color: 'var(--ads-color-text-auxiliary)' }}>
        Navegação
      </Text>
      <nav aria-label="Módulos da plataforma">
        <Stack gap={2}>
          {NAVIGATION_ENTRIES.map((entry) => {
            const active = isEntryActive(entry, location.pathname);

            return (
              <Stack key={entry.key} gap={2}>
                <div
                  role="link"
                  aria-current={active ? 'page' : undefined}
                  data-active={active}
                  tabIndex={0}
                  className="ads-list-item ads-transition ads-focusable"
                  style={{ padding: '8px 10px', cursor: entry.path ? 'pointer' : undefined }}
                  onClick={entry.path ? () => navigate(entry.path as string) : undefined}
                  onKeyDown={
                    entry.path
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') navigate(entry.path as string);
                        }
                      : undefined
                  }
                >
                  <Flex align="center" gap={8}>
                    <Icon name={entry.icon} size={16} />
                    <Text variant="caption">{entry.label}</Text>
                  </Flex>
                </div>

                {entry.children && (
                  <div style={{ paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {entry.children.map((child) => {
                      const childActive = location.pathname === child.path;

                      return (
                        <div
                          key={child.key}
                          role="link"
                          aria-current={childActive ? 'page' : undefined}
                          data-active={childActive}
                          tabIndex={0}
                          className="ads-list-item ads-transition ads-focusable"
                          style={{ padding: '6px 10px', cursor: 'pointer' }}
                          onClick={() => navigate(child.path)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') navigate(child.path);
                          }}
                        >
                          <Text variant="caption">{child.label}</Text>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Stack>
            );
          })}
        </Stack>
      </nav>
    </Stack>
  );
}
