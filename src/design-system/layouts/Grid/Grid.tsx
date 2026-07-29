// Grid.tsx
//
// Responsabilidade:
// Estrutura arquitetural do layout Grid — contrato de props e um stub
// funcional que consome os tokens `grid`/`spacing` (Sprint 26). Não
// implementa lógica de breakpoint responsiva além do essencial —
// refinamento visual completo fica reservado para uma Sprint futura.

import type { ReactNode } from 'react';
import { grid } from '../../tokens/grid';

export interface GridProps {
  children?: ReactNode;
  columns?: number;
  gap?: string;
}

export function Grid(props: GridProps) {
  const { children, columns = grid.columns, gap = grid.gutter } = props;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {children}
    </div>
  );
}
