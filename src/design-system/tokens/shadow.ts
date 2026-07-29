// shadow.ts
//
// Responsabilidade:
// Escala de sombras (elevação) do Adaptive Design System.

export const shadow = {
  none: 'none',
  sm: '0 1px 2px rgba(15, 23, 42, 0.06)',
  md: '0 4px 8px rgba(15, 23, 42, 0.08)',
  lg: '0 8px 24px rgba(15, 23, 42, 0.12)',
  xl: '0 16px 48px rgba(15, 23, 42, 0.16)',
} as const;

export type ShadowToken = keyof typeof shadow;
