// motion.ts
//
// Responsabilidade:
// Tokens de movimento do Adaptive Design System — duração e curvas de
// easing para transições e animações dos componentes.

export const duration = {
  instant: '0ms',
  fast: '120ms',
  normal: '200ms',
  slow: '320ms',
  slower: '480ms',
} as const;

export const easing = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

export type DurationToken = keyof typeof duration;
export type EasingToken = keyof typeof easing;
