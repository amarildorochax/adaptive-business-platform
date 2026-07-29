// focus.ts
//
// Responsabilidade:
// Estilo de foco visível compartilhado — preparação de acessibilidade
// (navegação por teclado) exigida pela Sprint 26. Consumido por
// componentes futuros via `style`/CSS, nunca redefinido localmente.

export const focusRingStyle = {
  outline: '2px solid var(--ads-color-primary)',
  outlineOffset: '2px',
} as const;
