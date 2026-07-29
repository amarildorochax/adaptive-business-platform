// Flex.tsx
//
// Responsabilidade:
// Primitivo de layout flexbox — direção, alinhamento, gap (a partir dos
// tokens de espaçamento) e quebra de linha.

import type { CSSProperties, ElementType, ReactNode } from 'react';
import { spacing, type SpacingToken } from '@/design-system/tokens';

export interface FlexProps {
  children?: ReactNode;
  as?: ElementType;
  direction?: 'row' | 'column';
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  gap?: SpacingToken;
  wrap?: boolean;
  style?: CSSProperties;
}

export function Flex(props: FlexProps) {
  const { children, as: Component = 'div', direction = 'row', align, justify, gap, wrap, style } = props;

  return (
    <Component
      style={{
        display: 'flex',
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        gap: gap !== undefined ? spacing[gap] : undefined,
        flexWrap: wrap ? 'wrap' : undefined,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}
