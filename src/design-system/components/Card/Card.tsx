// Card.tsx
//
// Responsabilidade:
// Componente Card — estrutura da Sprint 26, identidade visual real
// aplicada na Sprint 29: classe `.ads-card` (superfície + raio + sombra
// via tokens); `elevated` aplica `.ads-card--interactive` (sombra maior
// no hover).

import type { ReactNode } from 'react';
import { spacing } from '../../tokens/spacing';

export interface CardProps {
  children?: ReactNode;
  elevated?: boolean;
}

export function Card(props: CardProps) {
  const { children, elevated } = props;

  return (
    <div
      className={`ads-card ads-transition${elevated ? ' ads-card--interactive' : ''}`}
      style={{ padding: spacing[16] }}
    >
      {children}
    </div>
  );
}
