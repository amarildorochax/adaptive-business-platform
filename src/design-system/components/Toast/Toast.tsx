// Toast.tsx
//
// Responsabilidade:
// Componente Toast — estrutura da Sprint 26, identidade visual real
// aplicada na Sprint 29: entrada via `.ads-toast` (slide-up,
// `branding.css`), faixa lateral colorida por variante (fundo sólido
// acessível).

import { spacing } from '../../tokens/spacing';
import { solidBackgroundFor } from '../../foundations/branding';
import type { ComponentVariant } from '../../types/component';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ComponentVariant;
  onDismiss?: (id: string) => void;
}

export function Toast(props: ToastProps) {
  const { id, message, variant = 'neutral', onDismiss } = props;

  return (
    <div
      role="status"
      className="ads-toast"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[8],
        padding: spacing[12],
        borderLeft: `4px solid ${solidBackgroundFor(variant)}`,
      }}
    >
      <span>{message}</span>
      {onDismiss && (
        <button type="button" onClick={() => onDismiss(id)} className="ads-focusable" aria-label="Dispensar">
          ×
        </button>
      )}
    </div>
  );
}
