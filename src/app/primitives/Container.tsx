// Container.tsx
//
// Responsabilidade:
// Primitivo de largura máxima centralizada — usado para limitar a
// largura do conteúdo em telas largas, conforme os breakpoints do
// Adaptive Design System.

import type { ReactNode } from 'react';
import { grid, type BreakpointName } from '@/design-system/tokens';

export interface ContainerProps {
  children?: ReactNode;
  maxWidth?: Extract<BreakpointName, 'tablet' | 'desktop' | 'wide' | 'ultrawide'>;
}

export function Container(props: ContainerProps) {
  const { children, maxWidth = 'desktop' } = props;

  return (
    <div
      style={{
        maxWidth: grid.containerMaxWidth[maxWidth],
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      {children}
    </div>
  );
}
