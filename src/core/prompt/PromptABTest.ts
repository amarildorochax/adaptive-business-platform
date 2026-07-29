/**
 * Contrato de teste A/B entre variantes de prompt futuro (Tarefa 11 —
 * não implementado nesta Sprint).
 *
 * Responsabilidade reservada: comparar o desempenho de duas ou mais
 * variantes de um mesmo PromptTemplate. Nenhum componente desta Sprint
 * cria variantes, distribui tráfego entre elas, ou agrega resultado.
 */
export interface PromptABTestVariant {
  id: string;
  templateId: string;
  label: string;
}

export interface PromptABTestResult {
  variantId: string;
  samples: number;
  successRate: number;
}
