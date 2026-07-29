/**
 * Data Lifecycle — política de Retenção e registro de Arquivamento de dado técnico.
 * Estrutura, regras e invariantes definidas em DATA_CONCRETE_STRUCTURE.md.
 */
export interface RetentionPolicy {
  /** Nome do conjunto de dado ao qual esta política se aplica. */
  readonly dataSetName: string;

  /** Prazo mínimo de retenção, em dias — genérico, sem referência a Empresa/Tenant específico. */
  readonly minimumRetentionDays: number;
}

export interface ArchivalRecord {
  /** Nome do conjunto de dado arquivado. */
  readonly dataSetName: string;

  /** Momento em que o arquivamento ocorreu. */
  readonly archivedAt: Date;
}
