// Badge.tsx
//
// Responsabilidade:
// Componente Badge — estrutura da Sprint 26, identidade visual real
// aplicada na Sprint 29: fundo "soft" (tom 100) + texto (tom 700) da
// mesma escala de cor — combinação verificada com contraste WCAG AA
// (ver Brand Guide), mais legível para uma etiqueta pequena do que o
// par sólido usado em Button/Toast.

import type { ReactNode } from 'react';
import type { ComponentSize, ComponentVariant } from '../../types/component';
import { colorPrimitives } from '../../tokens/colors';

const SCALE_BY_VARIANT: Record<ComponentVariant, keyof typeof colorPrimitives | 'gray'> = {
  primary: 'blue',
  secondary: 'violet',
  success: 'green',
  warning: 'amber',
  danger: 'red',
  info: 'cyan',
  neutral: 'gray',
};

export interface BadgeProps {
  children?: ReactNode;
  variant?: ComponentVariant;
  size?: ComponentSize;
}

export function Badge(props: BadgeProps) {
  const { children, variant = 'neutral' } = props;
  const scale = colorPrimitives[SCALE_BY_VARIANT[variant]];

  return (
    <span className="ads-badge" style={{ backgroundColor: scale[100], color: scale[700] }}>
      {children}
    </span>
  );
}
