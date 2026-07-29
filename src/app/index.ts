// index.ts
//
// Responsabilidade:
// Ponto único de exportação do Frontend Foundation (`src/app/*`) —
// primitivos, contexts visuais, providers globais, shell, layouts,
// páginas de infraestrutura, guards, navegação e roteamento
// (Sprint 27, Fase 2).
//
// Este módulo consome exclusivamente `@/design-system` (Sprint 26) —
// não importa, não referencia e não é referenciado por nenhum módulo
// de `@/core`. Nenhuma página funcional, feature de negócio, chamada de
// API ou autenticação real está implementada aqui.
//
// Nota: não confundir com os diretórios legados de mesmo nome em
// `src/` — `src/pages`, `src/providers`, `src/shared`, `src/layout`
// pertencem à UI legada do "escritório" Phaser/Pixi e não têm nenhuma
// relação com este módulo. Por isso todo o Frontend Foundation vive
// aninhado sob este único diretório novo, `src/app/`, em vez de criar
// diretórios de topo que colidiriam com os já existentes.

export * from './primitives';
export * from './contexts';
export * from './providers';
export * from './shell';
export * from './layouts';
export * from './pages';
export * from './guards';
export * from './navigation';
export * from './router';
export * from './shared';
