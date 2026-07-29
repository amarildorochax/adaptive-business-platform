// DashboardHeader.tsx
//
// Responsabilidade:
// Cabeçalho específico do Dashboard — distinto de `@/app/shell/Header`
// (cabeçalho global da aplicação, Sprint 27, não alterado por esta
// Sprint). Este painel vive dentro do `ContentArea` do Shell, não o
// substitui.
//
// Sprint 31 (evolução visual — "Header"): barra premium com Logo, Busca
// Global, Notificações (real — consome `useNotifications` do
// `@/app/providers`, Sprint 27), Ajuda, Alternância de Tema (real —
// consome `useTheme` do Design System, Sprint 26; "estrutura" apenas no
// sentido de não introduzir preferências de usuário persistidas),
// Perfil e Menu do Usuário. Nenhum dado real de usuário/autenticação —
// isso é trabalho de uma Sprint futura de Auth.
//
// Sprint 31B (Premium Dark Theme & UI Polish): altura reduzida
// (padding menor), efeito "glass" (fundo semi-transparente +
// `backdrop-filter: blur`), cantos arredondados, e botões de ícone com
// tamanho/hover/foco consistentes (`.ads-list-item`/`.ads-transition`/
// `.ads-focusable`). Não introduz `position: sticky/fixed` — o
// cabeçalho continua rolando com a página, como já estabelecido na
// correção de scroll anterior.
//
// Sprint 31D (Adaptive Blue Design System — identidade oficial):
// fundo do glass consome `--ads-color-chrome` (nunca um hex fixo — a
// cor concreta vive exclusivamente em `darkTheme.ts`). Botão "Nova
// Ação" adicionado (roxo, `Button variant="primary"`), sem handler
// real, puramente visual. Placeholder de busca e título padrão
// traduzidos para Português (Brasil) — "Dashboard" → "Painel",
// "Buscar…" → "Buscar na Plataforma".
//
// Sprint 31E (Adaptive Blue Refinement): opacidade do glass aumentada
// de 85% para 94% (fundo mais sólido, menos "brilho"/transparência) —
// o Product Owner identificou o Header como "chamando atenção demais"/
// aparência "azul neon" na iteração anterior.

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Flex, Heading, Icon } from '@/app/primitives';
import { Logo } from '@/design-system/foundations';
import { Input, Badge, Button, Dropdown, Tooltip, Avatar } from '@/design-system/components';
import { useTheme } from '@/design-system/hooks';
import { useNotifications } from '@/app/providers';

export interface DashboardHeaderProps {
  title?: string;
}

const iconButtonStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: 'var(--ads-color-text-secondary)',
  width: 32,
  height: 32,
  borderRadius: 'var(--ads-radius-md)',
  cursor: 'pointer',
  fontSize: '1rem',
};

export function DashboardHeader(props: DashboardHeaderProps) {
  const { title = 'Painel' } = props;
  const { mode, setMode } = useTheme();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Flex
      as="header"
      justify="space-between"
      align="center"
      gap={16}
      style={{
        padding: '12px 20px',
        borderRadius: 'var(--ads-radius-lg)',
        backgroundColor: 'color-mix(in srgb, var(--ads-color-chrome) 94%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--ads-color-border)',
      }}
    >
      <Flex align="center" gap={12}>
        <Logo variant="reduced" size={24} />
        <Heading level={1} variant="heading" style={{ fontSize: '1.125rem' }}>
          {title}
        </Heading>
      </Flex>

      <div style={{ flex: 1, maxWidth: 360 }}>
        <Input type="search" placeholder="Buscar na Plataforma…" value={searchQuery} onChange={setSearchQuery} />
      </div>

      <Flex align="center" gap={12}>
        <Button variant="primary" size="sm" onClick={() => undefined}>
          Nova Ação
        </Button>

        <Tooltip content="Ajuda e suporte">
          <button type="button" aria-label="Ajuda" className="ads-list-item ads-transition ads-focusable" style={iconButtonStyle}>
            <Icon name="info" size={18} />
          </button>
        </Tooltip>

        <button
          type="button"
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          aria-label={mode === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          className="ads-list-item ads-transition ads-focusable"
          style={iconButtonStyle}
        >
          {mode === 'dark' ? '☀️' : '🌙'}
        </button>

        <Dropdown
          trigger={
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <button type="button" aria-label="Notificações" className="ads-list-item ads-transition ads-focusable" style={iconButtonStyle}>
                🔔
              </button>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2 }}>
                  <Badge variant="danger">{unreadCount}</Badge>
                </span>
              )}
            </span>
          }
          items={[
            {
              key: 'summary',
              label: unreadCount > 0 ? `${unreadCount} notificações não lidas` : 'Sem novas notificações',
            },
          ]}
          onSelect={() => undefined}
        />

        <Dropdown
          trigger={<Avatar name="Usuário Demo" size="sm" />}
          items={[
            { key: 'profile', label: 'Perfil' },
            { key: 'settings', label: 'Configurações' },
            { key: 'logout', label: 'Sair' },
          ]}
          onSelect={() => undefined}
        />
      </Flex>
    </Flex>
  );
}
