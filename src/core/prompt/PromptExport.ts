import type { PromptRecord } from "./PromptRecord";

/**
 * Contrato de importação/exportação de PromptRecord futura (Tarefa 11
 * — não implementado nesta Sprint).
 *
 * Responsabilidade reservada: formato de intercâmbio para mover
 * PromptRecord entre instâncias da plataforma, ou de/para arquivo.
 * Nenhum componente desta Sprint serializa ou desserializa neste
 * formato.
 */
export interface PromptExportFormat {
  exportedAt: Date;
  records: PromptRecord[];
}

/** Resultado reservado de uma futura operação de importação — não implementado. */
export interface PromptImportResult {
  importedCount: number;
  skippedCount: number;
  errors: string[];
}
