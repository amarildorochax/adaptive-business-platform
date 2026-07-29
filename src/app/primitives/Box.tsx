// Box.tsx
//
// Responsabilidade:
// Primitivo mais básico do Frontend Foundation — um `<div>` com
// padding/margin resolvidos a partir dos tokens de espaçamento do
// Adaptive Design System. Base para todos os outros primitivos.

import type { CSSProperties, ReactNode } from 'react';
import { spacing, type SpacingToken } from '@/design-system/tokens';

export interface BoxProps {
  children?: ReactNode;
  padding?: SpacingToken;
  margin?: SpacingToken;
  style?: CSSProperties;
  className?: string;
}

export function Box(props: BoxProps) {
  const { children, padding, margin, style, className } = props;

  return (
    <div
      className={className}
      style={{
        padding: padding !== undefined ? spacing[padding] : undefined,
        margin: margin !== undefined ? spacing[margin] : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
