// breakpoints.ts
//
// Responsabilidade:
// Pontos de quebra responsivos do Adaptive Design System — Mobile,
// Tablet, Desktop, Wide e Ultrawide, conforme exigido pela Sprint 26.

export const breakpoints = {
  mobile: '0px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
  ultrawide: '1920px',
} as const;

export type BreakpointName = keyof typeof breakpoints;
