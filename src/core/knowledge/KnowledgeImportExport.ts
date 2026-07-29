import type { KnowledgeDocument } from "./KnowledgeDocument";

/**
 * Contrato de importação/exportação de KnowledgeDocument futuro (não
 * implementado nesta Sprint). Mesmo papel que `PromptExportFormat`/
 * `PromptImportResult` (`@/core/prompt`) cumprem para PromptRecord.
 *
 * Responsabilidade reservada: formato de intercâmbio para mover
 * KnowledgeDocument entre instâncias da plataforma, ou de/para arquivo
 * (ex.: importar um manual em lote). Nenhum componente desta Sprint
 * serializa ou desserializa neste formato.
 */
export interface KnowledgeExportFormat {
  exportedAt: Date;
  documents: KnowledgeDocument[];
}

/** Resultado reservado de uma futura operação de importação — não implementado. */
export interface KnowledgeImportResult {
  importedCount: number;
  skippedCount: number;
  errors: string[];
}
