import type { MemoryCategory } from "./MemoryCategory";

/**
 * Unidade fundamental de memória empresarial — o único formato em que
 * qualquer informação estratégica é armazenada pelo Business Memory
 * (Tarefa 04).
 *
 * `version` é incrementado por MemoryManager a cada atualização
 * (versionamento real e mínimo, Tarefa 02) — não é um histórico
 * completo; ver MemorySnapshot.ts (Tarefa 11) para o contrato, ainda
 * não implementado, de histórico completo por versão.
 *
 * `expiresAt` é reservado para expiração futura (Tarefa 02) — nenhum
 * componente lê ou aplica este campo nesta Sprint.
 */
export interface MemoryRecord {
  id: string;

  category: MemoryCategory;

  title: string;

  content: string;

  tags: string[];

  metadata: Record<string, unknown>;

  /** Incrementado a cada `MemoryManager.update()` — começa em 1 na criação. */
  version: number;

  createdAt: Date;

  updatedAt: Date;

  /** Reservado para expiração futura — não aplicado nesta Sprint. */
  expiresAt?: Date;
}
