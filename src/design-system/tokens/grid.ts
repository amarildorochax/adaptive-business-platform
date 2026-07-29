// grid.ts
//
// Responsabilidade:
// Tokens de grid do Adaptive Design System — colunas, gutter e largura
// máxima de container por breakpoint. Consumido pelo componente
// arquitetural `layouts/Grid`.

import { spacing } from './spacing';

export const grid = {
  columns: 12,
  gutter: spacing[24],
  containerMaxWidth: {
    tablet: '720px',
    desktop: '1200px',
    wide: '1440px',
    ultrawide: '1800px',
  },
} as const;
