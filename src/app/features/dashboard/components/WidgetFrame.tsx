// WidgetFrame.tsx
//
// Responsabilidade:
// Moldura visual compartilhada por todos os widgets do Dashboard —
// título, ícone, descrição, botão de atualização e os três estados de
// `WidgetState` (loading/error/ready). Cada widget individual
// (`widgets/*`) implementa apenas o conteúdo interno; o resto é este
// componente. Envolvido por um `ErrorBoundary` próprio — uma falha de
// renderização em um widget nunca derruba o Dashboard inteiro.
//
// Sprint 31B (Premium Dark Theme & UI Polish): `Card elevated` (hover
// suave via `.ads-card--interactive`), botão de atualização com
// `.ads-focusable`/`.ads-transition` e hover sutil, `iconColor`
// opcional (usado pelo `AIInsightsWidget` para o acento "IA" fixo —
// ver `foundations/branding/aiAccent`). Nenhuma mudança de contrato:
// `iconColor` é opcional, comportamento de todos os outros widgets
// permanece idêntico.

import type { CSSProperties, ReactNode } from 'react';
import { Card, Loading, EmptyState } from '@/design-system/components';
import { ErrorBoundary } from '@/app/shell';
import { Flex, Text, Icon } from '@/app/primitives';
import type { WidgetDefinition, WidgetState } from '../types';

export interface WidgetFrameProps {
  definition: WidgetDefinition;
  state: WidgetState;
  onRefresh: () => void;
  children?: ReactNode;
  iconColor?: string;
}

const refreshButtonStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: 'var(--ads-color-text-secondary)',
  borderRadius: 'var(--ads-radius-sm)',
  width: 28,
  height: 28,
  cursor: 'pointer',
};

export function WidgetFrame(props: WidgetFrameProps) {
  const { definition, state, onRefresh, children, iconColor } = props;

  return (
    <ErrorBoundary
      fallback={() => <EmptyState title="Erro ao renderizar o widget" description={definition.title} />}
    >
      <Card elevated>
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={8}>
            <Icon name={definition.icon} size={20} color={iconColor} aria-label={definition.title} />
            <Text variant="body" style={{ fontWeight: 600 }}>
              {definition.title}
            </Text>
          </Flex>
          <button
            type="button"
            onClick={onRefresh}
            aria-label={`Atualizar ${definition.title}`}
            className="ads-list-item ads-transition ads-focusable"
            style={refreshButtonStyle}
          >
            ⟳
          </button>
        </Flex>

        <Text variant="caption" color="var(--ads-color-text-secondary)">
          {definition.description}
        </Text>

        <div aria-live="polite">
          {state.status === 'loading' && <Loading label={`Carregando ${definition.title}…`} />}
          {state.status === 'error' && (
            <EmptyState title="Não foi possível carregar" description={state.error ?? undefined} />
          )}
          {state.status === 'ready' && children}
        </div>
      </Card>
    </ErrorBoundary>
  );
}
