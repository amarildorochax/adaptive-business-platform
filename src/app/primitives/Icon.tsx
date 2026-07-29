// Icon.tsx
//
// Responsabilidade:
// Primitivo de ícone — consome o contrato `IconName`/`IconProps` já
// definido em `@/design-system/foundations/icons` (Sprint 26). Ainda não
// renderiza nenhum SVG real (nenhum asset foi escolhido) — apenas
// reserva o espaço com o tamanho correto e um rótulo acessível,
// mantendo a mesma decisão de adiar assets reais da Sprint anterior.

import type { IconProps } from '@/design-system/foundations';

export function Icon(props: IconProps) {
  const { name, size = 16, color, 'aria-label': ariaLabel } = props;

  return (
    <span
      role="img"
      aria-label={ariaLabel ?? name}
      style={{ display: 'inline-block', width: size, height: size, color }}
    />
  );
}
