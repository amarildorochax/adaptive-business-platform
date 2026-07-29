// responsiveColumns.ts
//
// Responsabilidade:
// Deriva o número total de colunas do `DashboardGrid` a partir dos
// breakpoints ativos do Adaptive Design System — nenhum valor de
// largura é hardcoded aqui, apenas a contagem de colunas por faixa.

export interface ActiveBreakpoints {
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  isUltrawide: boolean;
}

export function columnsForActiveBreakpoints(active: ActiveBreakpoints): number {
  if (active.isUltrawide) return 12;
  if (active.isWide) return 12;
  if (active.isDesktop) return 12;
  if (active.isTablet) return 6;
  return 1;
}
