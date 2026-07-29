/**
 * Data Version — registro de versão de uma instância de dado, sustentando reconstrução de estado passado.
 * Distinto do contractVersion já existente em Command/Event/Query (versionamento de contrato, não de instância).
 * Estrutura definida em DATA_CONCRETE_STRUCTURE.md.
 */
export interface DataVersion {
  /** Identificador do dado versionado. */
  readonly recordId: string;

  /** Número da versão. */
  readonly version: number;

  /** Momento em que esta versão foi registrada. */
  readonly changedAt: Date;
}
