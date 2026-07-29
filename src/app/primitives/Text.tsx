// Text.tsx
//
// Responsabilidade:
// Primitivo tipográfico de corpo de texto — aplica um `textStyle` da
// escala tipográfica do Adaptive Design System.

import type { CSSProperties, ElementType, ReactNode } from 'react';
import { textStyles } from '@/design-system/tokens';

export interface TextProps {
  children?: ReactNode;
  variant?: 'body' | 'caption' | 'label';
  as?: ElementType;
  color?: string;
  style?: CSSProperties;
}

export function Text(props: TextProps) {
  const { children, variant = 'body', as: Component = 'span', color, style } = props;
  const textStyle = textStyles[variant];

  return (
    <Component
      style={{
        fontFamily: textStyle.fontFamily,
        fontSize: textStyle.fontSize,
        fontWeight: textStyle.fontWeight,
        lineHeight: textStyle.lineHeight,
        letterSpacing: textStyle.letterSpacing,
        color,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}
