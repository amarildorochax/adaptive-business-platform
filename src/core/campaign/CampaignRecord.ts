import type { CampaignStatus } from "./CampaignStatus";

/**
 * Campanha — entidade central do Campaign Management (Tarefa 04).
 *
 * Nota de nomenclatura: o prompt desta Sprint pede "Criar Campaign"
 * tanto para a fachada pública (Tarefa 02) quanto para esta entidade
 * (Tarefa 04) — os dois nomes colidiriam (`class Campaign` e
 * `interface Campaign` no mesmo módulo). Resolvido seguindo a convenção
 * já estabelecida no restante do código para exatamente este caso
 * (entidade distinta da fachada que a gerencia): sufixo `Record` — mesmo
 * padrão de `PromptRecord` (`@/core/prompt`) e `MemoryRecord`
 * (`@/core/memory`). A fachada pública permanece `Campaign`
 * (`Campaign.ts`), como pedido na Tarefa 02.
 */
export interface CampaignRecord {
  id: string;

  name: string;

  description: string;

  status: CampaignStatus;

  startDate: Date;

  endDate: Date;

  createdAt: Date;

  updatedAt: Date;

  metadata: Record<string, unknown>;
}
