// Loading.tsx
//
// Responsabilidade:
// Componente Loading (spinner) — estrutura da Sprint 26, identidade
// visual real aplicada na Sprint 29: `.ads-spinner` (rotação contínua,
// `branding.css`, desativada com `prefers-reduced-motion`).

import type { ComponentSize } from '../../types/component';

const SIZE_PX: Record<ComponentSize, number> = { sm: 16, md: 24, lg: 32 };

export interface LoadingProps {
  size?: ComponentSize;
  label?: string;
}

export function Loading(props: LoadingProps) {
  const { size = 'md', label = 'Carregando…' } = props;
  const dimension = SIZE_PX[size];

  return (
    <div role="status" aria-label={label}>
      <span className="ads-spinner" style={{ width: dimension, height: dimension }} />
    </div>
  );
}
