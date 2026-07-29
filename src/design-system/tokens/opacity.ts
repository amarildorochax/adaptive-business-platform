// opacity.ts
//
// Responsabilidade:
// Escala de opacidade do Adaptive Design System — usada para estados
// (disabled, hover overlays, scrims) sem hardcode disperso pelo código.

export const opacity = {
  0: 0,
  10: 0.1,
  20: 0.2,
  40: 0.4,
  60: 0.6,
  80: 0.8,
  100: 1,
} as const;

export type OpacityToken = keyof typeof opacity;
