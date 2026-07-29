// Tooltip.tsx
//
// Responsabilidade:
// Componente Tooltip — estrutura da Sprint 26, identidade visual real
// aplicada na Sprint 29: `.ads-tooltip` (fundo invertido + fade-in,
// `branding.css`). Este stub ainda não posiciona o balão relativo ao
// `children` (sem biblioteca de posicionamento); apenas o estilo visual
// e o rótulo acessível estão prontos.

import type { ReactNode } from 'react';
import { spacing } from '../../tokens/spacing';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  placement?: TooltipPlacement;
  children?: ReactNode;
}

export function Tooltip(props: TooltipProps) {
  const { content, children } = props;

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <span role="tooltip" className="ads-tooltip" style={{ padding: `${spacing[4]} ${spacing[8]}`, fontSize: '0.75rem' }}>
        {content}
      </span>
    </span>
  );
}
