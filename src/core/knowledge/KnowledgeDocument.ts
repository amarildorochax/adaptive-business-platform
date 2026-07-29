import type { KnowledgeCategory } from "./KnowledgeCategory";
import type { KnowledgeStatus } from "./KnowledgeStatus";

/**
 * Unidade fundamental de conhecimento institucional — o único formato
 * em que o Knowledge Base armazena conteúdo permanente (Tarefa 04),
 * distinto de `MemoryRecord` (memória operacional, `@/core/memory`,
 * inalterada).
 *
 * `summary` é sempre um resumo curto e independente de `content` —
 * nunca derivado automaticamente nesta Sprint (nenhuma sumarização real
 * é implementada; o chamador de `createDocument()`/`updateDocument()`
 * fornece ambos explicitamente).
 *
 * `version` é incrementado por KnowledgeManager a cada
 * `updateDocument()` — mesmo princípio de versionamento mínimo já
 * aplicado a `MemoryRecord.version`/`PromptRecord.version`/
 * `AgentProfile.version`; histórico completo por versão permanece
 * contrato futuro (ver KnowledgeSnapshot.ts, Tarefa 11/12).
 */
export interface KnowledgeDocument {
  id: string;

  title: string;

  content: string;

  summary: string;

  category: KnowledgeCategory;

  tags: string[];

  metadata: Record<string, unknown>;

  status: KnowledgeStatus;

  version: number;

  createdAt: Date;

  updatedAt: Date;
}
