// index.ts
//
// Responsabilidade:
// Ponto único de exportação do Adaptive Design System — tokens,
// foundations (temas/acessibilidade/ícones), componentes base, layouts,
// hooks e utils (Sprint 26, Fase 2).
//
// Este módulo é inteiramente independente do Core v1.0
// (`src/core/*`) — não importa, não referencia e não é referenciado por
// nenhum módulo de negócio. É a camada visual/UI da plataforma, não a
// camada de domínio.

export * from './tokens';
export * from './types';
export * from './foundations';
export * from './components';
export * from './layouts';
export * from './hooks';
export * from './utils';
