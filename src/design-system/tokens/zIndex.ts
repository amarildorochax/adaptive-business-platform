// zIndex.ts
//
// Responsabilidade:
// Escala de camadas (z-index) do Adaptive Design System — garante ordem
// de empilhamento consistente entre Dropdown, Modal, Toast, Tooltip etc.
// em toda a plataforma, evitando valores mágicos dispersos.

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
} as const;

export type ZIndexToken = keyof typeof zIndex;
