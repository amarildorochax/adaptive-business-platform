// Surface.tsx
//
// Responsabilidade:
// Primitivo de superfície — um contêiner com a cor de fundo semântica
// `surface` do tema ativo e, opcionalmente, uma sombra e raio de borda
// dos tokens do Adaptive Design System.

import type { CSSProperties, ReactNode } from 'react';
import { radius, shadow, type RadiusToken, type ShadowToken } from '@/design-system/tokens';

export interface SurfaceProps {
  children?: ReactNode;
  elevation?: ShadowToken;
  rounded?: RadiusToken;
  style?: CSSProperties;
}

export function Surface(props: SurfaceProps) {
  const { children, elevation = 'none', rounded = 'md', style } = props;

  return (
    <div
      style={{
        backgroundColor: 'var(--ads-color-surface)',
        boxShadow: shadow[elevation],
        borderRadius: radius[rounded],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
