// EmptyState.tsx
//
// Responsabilidade:
// Componente Empty State — estrutura da Sprint 26, identidade visual
// real aplicada na Sprint 29: layout centralizado com espaçamento por
// token e `fade-in` sutil. Ver `foundations/branding/emptyStatePresets`
// para os 6 cenários padronizados (sem dados, erro, offline, permissão
// negada, busca sem resultado, primeiro acesso).

import type { ReactNode } from 'react';
import { spacing } from '../../tokens/spacing';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState(props: EmptyStateProps) {
  const { title, description, icon, action } = props;

  return (
    <div
      className="ads-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: spacing[8],
        padding: spacing[32],
        color: 'var(--ads-color-text-secondary)',
      }}
    >
      {icon}
      <strong style={{ color: 'var(--ads-color-text-primary)' }}>{title}</strong>
      {description && <p style={{ margin: 0 }}>{description}</p>}
      {action}
    </div>
  );
}
