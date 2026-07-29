// Alert.tsx
//
// Responsabilidade:
// Componente Alert — estrutura da Sprint 26, identidade visual real
// aplicada na Sprint 29: fundo "soft" (tom 100) + texto (tom 700) da
// escala da variante, mesmo padrão de contraste do Badge.

import type { ReactNode } from 'react';
import type { ComponentVariant } from '../../types/component';
import { colorPrimitives } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';

const SCALE_BY_VARIANT: Record<ComponentVariant, keyof typeof colorPrimitives> = {
  primary: 'blue',
  secondary: 'violet',
  success: 'green',
  warning: 'amber',
  danger: 'red',
  info: 'cyan',
  neutral: 'gray',
};

export interface AlertProps {
  variant?: ComponentVariant;
  title?: string;
  children?: ReactNode;
  onClose?: () => void;
}

export function Alert(props: AlertProps) {
  const { variant = 'info', title, children, onClose } = props;
  const scale = colorPrimitives[SCALE_BY_VARIANT[variant]];

  return (
    <div
      role="alert"
      className="ads-fade-in"
      style={{
        backgroundColor: scale[100],
        color: scale[700],
        borderRadius: 'var(--ads-radius-md)',
        padding: spacing[16],
        display: 'flex',
        gap: spacing[8],
        alignItems: 'flex-start',
      }}
    >
      <div style={{ flex: 1 }}>
        {title && <strong style={{ display: 'block' }}>{title}</strong>}
        {children}
      </div>
      {onClose && (
        <button type="button" onClick={onClose} className="ads-focusable" aria-label="Fechar alerta">
          ×
        </button>
      )}
    </div>
  );
}
