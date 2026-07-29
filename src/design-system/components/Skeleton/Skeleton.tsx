// Skeleton.tsx
//
// Responsabilidade:
// Componente Skeleton — estrutura da Sprint 26, com estilo visual real
// aplicado na Sprint 29 (Branding, Loading States): usa a classe
// `.ads-skeleton` (cor/raio via tokens) e, opcionalmente,
// `.ads-skeleton--shimmer` (animação de "brilho" — desativada
// automaticamente quando o usuário prefere movimento reduzido, ver
// `branding.css`).

export type SkeletonVariant = 'text' | 'rect' | 'circle';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  shimmer?: boolean;
}

const BORDER_RADIUS_BY_VARIANT: Record<SkeletonVariant, string> = {
  text: 'var(--ads-radius-sm)',
  rect: 'var(--ads-radius-md)',
  circle: 'var(--ads-radius-full)',
};

export function Skeleton(props: SkeletonProps) {
  const { variant = 'rect', width = '100%', height = variant === 'text' ? '1em' : '100%', shimmer = true } = props;

  return (
    <div
      aria-hidden="true"
      className={shimmer ? 'ads-skeleton ads-skeleton--shimmer' : 'ads-skeleton'}
      style={{ width, height, borderRadius: BORDER_RADIUS_BY_VARIANT[variant] }}
    />
  );
}
