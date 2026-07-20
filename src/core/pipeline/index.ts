// index.ts
//
// Responsabilidade:
// Ponto único de exportação da infraestrutura genérica e reutilizável de
// pipeline (Pipeline, PipelineStep, PipelineContext, PipelineResult).
// Especializações concretas (ex.: BootPipeline, em
// src/core/platform/BootPipeline.ts) importam a partir daqui.

export * from './Pipeline';
export * from './PipelineStep';
export * from './PipelineContext';
export * from './PipelineResult';
