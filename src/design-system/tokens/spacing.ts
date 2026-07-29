// spacing.ts
//
// Responsabilidade:
// Escala de espaçamentos do Adaptive Design System — base para margin,
// padding e gap em todos os componentes e layouts futuros.

export const spacing = {
  0: '0px',
  2: '2px',
  4: '4px',
  8: '8px',
  12: '12px',
  16: '16px',
  20: '20px',
  24: '24px',
  32: '32px',
  40: '40px',
  48: '48px',
  64: '64px',
  80: '80px',
  96: '96px',
} as const;

export type SpacingToken = keyof typeof spacing;
