/**
 * CRM Merge Result — o registro de que o Merge Engine executou a fusão de dois registros já
 * confirmados como duplicados, preservando a Timeline de ambos como histórico consolidado (Merge as
 * an Explicit Operation, `CRM_HUB.md` Capítulo 5).
 * Estrutura definida em `CRM_HUB.md`, Capítulo 7.
 */
export interface CRMMergeResult {
  /** Relationship de origem, absorvido pela fusão. */
  readonly sourceRelationshipId: string;

  /** Relationship resultante, que preserva a Timeline consolidada de ambos. */
  readonly targetRelationshipId: string;

  /** Momento da fusão. */
  readonly mergedAt: Date;
}
