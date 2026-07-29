// Button.tsx
//
// Responsabilidade:
// Componente Button — estrutura da Sprint 26, identidade visual real
// aplicada na Sprint 29 (Branding): fundo/texto sólido acessível
// (`solidBackgroundFor`, contraste WCAG AA verificado — ver Brand
// Guide), padding por tamanho e microinterações via `.ads-btn`
// (`branding.css`: hover, pressed, foco visível, transição).

import type { ReactNode } from 'react';
import type { ComponentSize, ComponentVariant } from '../../types/component';
import { solidBackgroundFor, SOLID_ON_COLOR, PADDING_BY_SIZE, FONT_SIZE_BY_SIZE } from '../../foundations/branding';

export interface ButtonProps {
  children?: ReactNode;
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

export function Button(props: ButtonProps) {
  const { children, variant = 'primary', size = 'md', disabled, loading, type = 'button', onClick } = props;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`ads-btn ads-btn--${variant} ads-transition ads-focusable`}
      style={{
        padding: PADDING_BY_SIZE[size],
        fontSize: FONT_SIZE_BY_SIZE[size],
        backgroundColor: solidBackgroundFor(variant),
        color: SOLID_ON_COLOR,
      }}
    >
      {loading ? '…' : children}
    </button>
  );
}
