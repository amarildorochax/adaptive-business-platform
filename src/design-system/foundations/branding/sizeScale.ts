// sizeScale.ts
//
// Responsabilidade:
// Resolve `ComponentSize` (sm/md/lg) em padding e tamanho de fonte reais
// — compartilhado por Button/Input/Badge e demais componentes que
// aceitam `size`, evitando redefinir o mesmo mapeamento em cada um.
// Todos os valores vêm de `tokens/spacing`/`tokens/typography`.

import { spacing } from '../../tokens/spacing';
import { fontSize } from '../../tokens/typography';
import type { ComponentSize } from '../../types/component';

export const PADDING_BY_SIZE: Record<ComponentSize, string> = {
  sm: `${spacing[4]} ${spacing[8]}`,
  md: `${spacing[8]} ${spacing[16]}`,
  lg: `${spacing[12]} ${spacing[24]}`,
};

export const FONT_SIZE_BY_SIZE: Record<ComponentSize, string> = {
  sm: fontSize.sm,
  md: fontSize.md,
  lg: fontSize.lg,
};
