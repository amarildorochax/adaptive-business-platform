/**
 * Governance Lifecycle — os oito estágios do ciclo de vida formal de uma Política; nenhuma Política
 * salta estágio, e nenhuma é revogada sem que sua substituta, quando existente, já esteja Ativa.
 * Estrutura definida em AI_GOVERNANCE_CONCRETE_STRUCTURE.md.
 */
export type GovernanceLifecycleStage =
  | "Rascunho"
  | "EmRevisao"
  | "Aprovada"
  | "Publicada"
  | "Ativa"
  | "EmExcecao"
  | "Deprecada"
  | "Revogada";
