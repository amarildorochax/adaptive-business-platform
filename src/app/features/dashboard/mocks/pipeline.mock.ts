// pipeline.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "Pipeline" — estágios Solicitada/Planejada/
// Aprovada/Executada, puramente visual.

export type PipelineStageKey = 'requested' | 'planned' | 'approved' | 'executed';

export interface PipelineStage {
  key: PipelineStageKey;
  label: string;
  count: number;
}

export function generatePipelineStages(): PipelineStage[] {
  return [
    { key: 'requested', label: 'Solicitada', count: 18 },
    { key: 'planned', label: 'Planejada', count: 12 },
    { key: 'approved', label: 'Aprovada', count: 7 },
    { key: 'executed', label: 'Executada', count: 24 },
  ];
}
