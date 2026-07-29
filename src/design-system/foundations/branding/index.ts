// index.ts
//
// Responsabilidade:
// Ponto único de exportação da identidade oficial da Adaptive Business
// Platform (Sprint 29 — Branding): Logo, regras de uso do logo, o par
// fundo/texto sólido acessível (`solidVariant`), e os presets de Empty
// State. O import deste módulo também injeta `branding.css` (motion +
// microinterações) no bundle — efeito colateral deliberado, no mesmo
// espírito de outros módulos de estilo do projeto.

import './branding.css';

export * from './Logo';
export * from './logoGuidelines';
export * from './solidVariant';
export * from './emptyStatePresets';
export * from './sizeScale';
export * from './aiAccent';
