// Grid.tsx
//
// Responsabilidade:
// Primitivo de CSS Grid genérico — número de colunas e gap arbitrários.
//
// Nota: não confundir com `@/design-system/layouts/Grid` (Sprint 26) —
// aquele é o layout de página de 12 colunas baseado no token `grid`;
// este é um primitivo de baixo nível, sem opinião sobre número de
// colunas, usado para compor qualquer grade ad-hoc.

import type { CSSProperties, ReactNode } from 'react';
import { spacing, type SpacingToken } from '@/design-system/tokens';

export interface GridProps {
  children?: ReactNode;
  columns?: number;
  gap?: SpacingToken;
  style?: CSSProperties;
}

export function Grid(props: GridProps) {
  const { children, columns = 1, gap, style } = props;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gap !== undefined ? spacing[gap] : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
