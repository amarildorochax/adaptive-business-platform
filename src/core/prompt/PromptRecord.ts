import type { PromptType } from "./PromptType";
import type { PromptVariable } from "./PromptVariable";

/**
 * Unidade fundamental de um prompt registrado — o formato em que
 * PromptRegistry armazena tanto PromptTemplate quanto qualquer outro
 * fragmento de prompt reutilizável (Tarefa 05).
 *
 * `content` pode conter placeholders `{{key}}` correspondentes às
 * entradas de `variables` (ver PromptVariable.ts).
 *
 * `version` é incrementado por PromptRegistry a cada `update()` — mesmo
 * princípio de versionamento mínimo já aplicado a `MemoryRecord.version`
 * (Business Memory); histórico completo por versão permanece contrato
 * futuro (ver PromptSnapshot.ts, Tarefa 11).
 */
export interface PromptRecord {
  id: string;

  name: string;

  type: PromptType;

  content: string;

  variables: PromptVariable[];

  version: number;

  metadata: Record<string, unknown>;

  createdAt: Date;

  updatedAt: Date;
}
