// widgetSize.ts
//
// Responsabilidade:
// Converte um `WidgetSize` semântico no número de colunas que ele deve
// ocupar em um grid de 12 colunas.

import type { WidgetSize } from '../types';

const COLUMN_SPAN_BY_SIZE: Record<WidgetSize, number> = {
  sm: 3,
  md: 4,
  lg: 6,
  xl: 8,
  full: 12,
};

export function columnSpanForSize(size: WidgetSize): number {
  return COLUMN_SPAN_BY_SIZE[size];
}
