// index.ts
//
// Responsabilidade:
// Ponto único de exportação da preparação de acessibilidade do Adaptive
// Design System — foco visível e verificação de contraste WCAG. ARIA e
// navegação por teclado são contratos de prop nos próprios componentes
// em `components/*` (ex.: `aria-label`, `role`, `tabIndex`), não código
// centralizado aqui.

export * from './focus';
export * from './contrast';
