// CrmPipelineStage.ts
//
// Responsabilidade:
// Contrato de etapa do Pipeline de vendas do CRM — nome deliberadamente
// prefixado com `Crm` para não colidir com `PipelineStage`/
// `PipelineWidget` do Dashboard (Sprint 31, conceito totalmente
// diferente: aquele é um widget visual de resumo; este é o funil de
// vendas configurável do CRM). Etapas totalmente customizáveis —
// `order` define a posição, `isWon`/`isLost` marcam as etapas
// terminais ("Ganho"/"Perdido").

export interface CrmPipelineStage {
  id: string;
  name: string;
  order: number;
  isWon: boolean;
  isLost: boolean;
}
