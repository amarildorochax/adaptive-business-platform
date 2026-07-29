// Heading.tsx
//
// Responsabilidade:
// Primitivo tipográfico de título — aplica os estilos "display" ou
// "heading" da escala tipográfica, renderizando a tag semântica `h1`-`h6`
// correspondente ao nível informado.

import type { CSSProperties, ReactNode } from 'react';
import { textStyles } from '@/design-system/tokens';

export interface HeadingProps {
  children?: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: 'display' | 'heading';
  style?: CSSProperties;
}

const tagByLevel = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const;

export function Heading(props: HeadingProps) {
  const { children, level = 1, variant = 'heading', style } = props;
  const Component = tagByLevel[level];
  const textStyle = textStyles[variant];

  return (
    <Component
      style={{
        fontFamily: textStyle.fontFamily,
        fontSize: textStyle.fontSize,
        fontWeight: textStyle.fontWeight,
        lineHeight: textStyle.lineHeight,
        letterSpacing: textStyle.letterSpacing,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}
